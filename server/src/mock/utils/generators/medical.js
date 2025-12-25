import { GeneratorContext, randomItem } from "./base.js";

/**
 * Generate prescriptions matching exams to medicines by branch
 * Single Responsibility: Prescription generation with branch-aware inventory matching
 */
export async function generatePrescriptions(ctx) {
    const { prisma, insertedIds, factory, count, logger } = ctx;

    let items = await import("../helpers.js").then(m => m.generateItems(factory, count));

    // Query medical examinations with their related service/invoice/branch info
    let examsByBranch = {};
    if (prisma) {
        try {
            const exams = await prisma.medicalExamination.findMany({
                select: {
                    service_id: true,
                    service: { select: { invoice_id: true } }
                },
                take: count,
            });

            // For each exam, try to find its branch via the invoice
            for (const exam of exams) {
                let branchId = null;
                if (exam.service?.invoice_id) {
                    try {
                        const inv = await prisma.invoice.findUnique({
                            where: { id: exam.service.invoice_id },
                            select: { branch_id: true }
                        });
                        branchId = inv?.branch_id;
                    } catch (e) { }
                }

                const bid = branchId || 'unknown';
                if (!examsByBranch[bid]) examsByBranch[bid] = [];
                examsByBranch[bid].push(exam.service_id);
            }
        } catch (e) {
            console.warn(`⚠️ Could not load exam-branch mapping`);
        }
    }

    // Query medicine inventory by branch
    let medicineByBranch = {};
    if (prisma) {
        try {
            const inv = await prisma.medicineInventory.findMany({
                where: { quantity: { gt: 0 } },
                select: { medicine_id: true, branch_id: true, quantity: true }
            });

            for (const record of inv) {
                const bid = record.branch_id;
                if (!medicineByBranch[bid]) medicineByBranch[bid] = [];
                medicineByBranch[bid].push(record.medicine_id);
            }
        } catch (e) {
            console.warn(`⚠️ Could not load medicine inventory by branch`);
        }
    }

    // Match exams to medicines based on shared branch
    const validPrescriptions = [];
    const usedPairs = new Set(); // Track (exam_id, medicine_id) to ensure uniqueness

    for (const item of items) {
        let foundMatch = false;
        const maxAttempts = 50; // Limit attempts to find unique pair

        // Try each branch that has both exams and medicine inventory
        for (let attempt = 0; attempt < maxAttempts && !foundMatch; attempt++) {
            for (const branch of Object.keys(examsByBranch)) {
                const branchExams = examsByBranch[branch];
                const branchMeds = medicineByBranch[branch];

                if (branchExams?.length > 0 && branchMeds?.length > 0) {
                    const meid = randomItem(branchExams);
                    const mid = randomItem(branchMeds);
                    const pairKey = `${meid}|${mid}`;

                    // Only use this pair if it hasn't been used before
                    if (!usedPairs.has(pairKey)) {
                        usedPairs.add(pairKey);
                        validPrescriptions.push({
                            ...item,
                            medical_examination_id: meid,
                            medicine_id: mid,
                        });
                        foundMatch = true;
                        break;
                    }
                }
            }
        }

        // If no match found after all attempts, skip this prescription
        if (!foundMatch) {
            logger.warn(`prescriptions: Skipping - no unique (exam, medicine) pair available`, 'skippedItems');
        }
    }

    if (validPrescriptions.length < count) {
        logger.warn(`prescriptions: Capping from ${count} to ${validPrescriptions.length} (insufficient inventory or unique pairs)`, 'skippedItems');
    }

    return validPrescriptions;
}

/**
 * Generate vaccine uses matching injections to vaccines by branch
 */
export async function generateVaccineUses(ctx) {
    const { prisma, insertedIds, factory, count, logger } = ctx;

    // Check if we have injections
    if (!insertedIds.singleInjections || insertedIds.singleInjections.length === 0) {
        console.warn(`⚠️ No singleInjections available; skipping vaccineUses`);
        return [];
    }

    let items = await import("../helpers.js").then(m => m.generateItems(factory, count));

    // Query vaccine inventory with sufficient stock
    let vaccineByBranch = {};
    if (prisma) {
        try {
            const inv = await prisma.vaccineInventory.findMany({
                where: { quantity: { gt: 0 } },
                select: { vaccine_id: true, branch_id: true, quantity: true }
            });

            for (const record of inv) {
                const bid = record.branch_id;
                if (!vaccineByBranch[bid]) vaccineByBranch[bid] = [];
                // Only add if has stock
                if (record.quantity > 0) {
                    vaccineByBranch[bid].push(record.vaccine_id);
                }
            }
        } catch (e) {
            console.warn(`⚠️ Could not load vaccine inventory`);
        }
    }

    // Get branches for each single injection
    let injectionBranches = new Map();
    if (prisma && Object.keys(vaccineByBranch).length > 0) {
        try {
            const injs = await prisma.singleInjection.findMany({
                select: { service_id: true }
            });

            // Query services to get invoice info
            const serviceIds = injs.map(i => i.service_id);
            const services = await prisma.service.findMany({
                where: { id: { in: serviceIds } },
                select: { id: true, invoice_id: true }
            });

            const invoiceIds = services.map(s => s.invoice_id).filter(Boolean);
            const invoices = await prisma.invoice.findMany({
                where: { id: { in: invoiceIds } },
                select: { id: true, branch_id: true }
            });

            const invoiceMap = new Map(invoices.map(i => [i.id, i.branch_id]));
            const serviceMap = new Map(services.map(s => [s.id, invoiceMap.get(s.invoice_id)]));

            for (const inj of injs) {
                const branchId = serviceMap.get(inj.service_id);
                injectionBranches.set(Number(inj.service_id), branchId);
            }
        } catch (e) {
            console.warn(`⚠️ Could not load injection-branch mapping`);
        }
    }

    // Only proceed if we have both injections and vaccine inventory
    if (injectionBranches.size === 0 || Object.keys(vaccineByBranch).length === 0) {
        logger.warn(`vaccineUses: Insufficient data (injections=${injectionBranches.size}, vaccine branches=${Object.keys(vaccineByBranch).length}); skipping`, 'skippedItems');
        return [];
    }

    // Match injections to vaccines based on shared branch
    const validVaccineUses = [];
    const usedPairs = new Set(); // Track (injection_id, vaccine_id) to ensure uniqueness

    for (const item of items) {
        let foundMatch = false;
        const maxAttempts = 50; // Limit attempts to find unique pair

        // Try to find a unique (injection_id, vaccine_id) pair
        for (let attempt = 0; attempt < maxAttempts && !foundMatch; attempt++) {
            const injId = randomItem(insertedIds.singleInjections);
            const branchId = injectionBranches.get(injId);
            const availableVaccines = vaccineByBranch[branchId];

            if (availableVaccines?.length > 0) {
                const vid = randomItem(availableVaccines);
                const pairKey = `${injId}|${vid}`;

                // Only use this pair if it hasn't been used before
                if (!usedPairs.has(pairKey)) {
                    usedPairs.add(pairKey);
                    validVaccineUses.push({
                        ...item,
                        single_injection_id: injId,
                        vaccine_id: vid,
                    });
                    foundMatch = true;
                    break;
                }
            }
        }

        if (!foundMatch) {
            logger.warn(`vaccineUses: Skipping - no unique (injection, vaccine) pair available`, 'skippedItems');
        }
    }

    if (validVaccineUses.length < count) {
        logger.warn(`vaccineUses: Capping from ${count} to ${validVaccineUses.length} (insufficient inventory or unique pairs)`, 'skippedItems');
    }

    return validVaccineUses;
}

/**
 * Generate sell products matching services to products by branch
 */
export async function generateSellProducts(ctx) {
    const { prisma, insertedIds, factory, count, logger } = ctx;

    // Get services of type "Mua hàng" (sell products)
    let sellServicesByBranch = {};
    if (prisma) {
        try {
            const services = await prisma.service.findMany({
                where: { type_of_service: "MuaHang" },
                select: { id: true, invoice_id: true }
            });

            // Get branches for each service via invoices
            const invoiceIds = services.map(s => s.invoice_id).filter(Boolean);
            const invoices = await prisma.invoice.findMany({
                where: { id: { in: invoiceIds } },
                select: { id: true, branch_id: true }
            });

            const invoiceMap = new Map(invoices.map(i => [i.id, i.branch_id]));

            for (const service of services) {
                const branchId = invoiceMap.get(service.invoice_id);
                if (branchId) {
                    if (!sellServicesByBranch[branchId]) sellServicesByBranch[branchId] = [];
                    sellServicesByBranch[branchId].push(Number(service.id));
                }
            }
        } catch (e) {
            console.warn(`⚠️ Could not load sell product services`);
        }
    }

    // Get product inventory by branch
    let productsByBranch = {};
    if (prisma) {
        try {
            const inv = await prisma.productInventory.findMany({
                where: { quantity: { gt: 0 } },
                select: { product_id: true, branch_id: true, quantity: true }
            });

            for (const record of inv) {
                const bid = record.branch_id;
                if (!productsByBranch[bid]) productsByBranch[bid] = [];
                productsByBranch[bid].push(record.product_id);
            }
        } catch (e) {
            console.warn(`⚠️ Could not load product inventory`);
        }
    }

    // Only proceed if we have both services and product inventory
    if (Object.keys(sellServicesByBranch).length === 0 || Object.keys(productsByBranch).length === 0) {
        console.warn(`⚠️ Insufficient data for sellProducts (services=${Object.keys(sellServicesByBranch).length}, product branches=${Object.keys(productsByBranch).length}); skipping`);
        return [];
    }

    // Build shuffled service pool (for unique constraint)
    let servicePool = [];
    for (const branch of Object.keys(sellServicesByBranch)) {
        servicePool.push(...(sellServicesByBranch[branch] || []));
    }

    // Shuffle the pool
    const { shuffleArray } = await import("./base.js");
    servicePool = shuffleArray(servicePool);

    let items = await import("../helpers.js").then(m => m.generateItems(factory, count));

    // Cap to available services (unique constraint)
    if (servicePool.length > 0 && servicePool.length < items.length) {
        console.warn(`⚠️ Capping sellProducts from ${items.length} to ${servicePool.length} (unique service_id constraint)`);
        items = items.slice(0, servicePool.length);
    }

    // Assign each service once, with matching product from same branch
    const validSellProducts = [];
    for (let idx = 0; idx < servicePool.length; idx++) {
        const serviceId = servicePool[idx];
        let foundProduct = false;

        // Find the branch for this service and use products from that branch
        for (const branch of Object.keys(sellServicesByBranch)) {
            if (sellServicesByBranch[branch].includes(serviceId)) {
                const branchProducts = productsByBranch[branch];
                if (branchProducts?.length > 0) {
                    const productId = randomItem(branchProducts);
                    validSellProducts.push({
                        ...items[idx % items.length],
                        service_id: serviceId,
                        product_id: productId,
                    });
                    foundProduct = true;
                }
                break;
            }
        }

        if (!foundProduct) {
            console.warn(`⚠️ Skipping sellProduct - service branch has no product inventory`);
        }
    }

    if (validSellProducts.length === 0) {
        logger.warn(`sellProducts: No valid items created - all services lack inventory`, 'skippedItems');
    } else if (validSellProducts.length < servicePool.length) {
        logger.warn(`sellProducts: Reduced from ${servicePool.length} to ${validSellProducts.length} (products not in all branches)`, 'skippedItems');
    }

    return validSellProducts;
}
