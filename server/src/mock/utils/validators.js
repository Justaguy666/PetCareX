import { logger } from "./logger.js";

/**
 * Normalize invoice items by removing rating fields
 */
export function normalizeInvoices(items) {
    return items.map((it) => {
        const { sale_attitude_rating, overall_satisfaction_rating, ...copy } = it;
        return copy;
    });
}

/**
 * Normalize promotionFors discount_percentage to [5, 15]
 */
export function normalizePromotionFors(items) {
    return items.map((it) => {
        let discount = Number(it.discount_percentage) || 10;
        discount = Math.max(5, Math.min(15, Math.round(discount)));
        return { ...it, discount_percentage: discount };
    });
}

/**
 * Validate and fix veterinarian doctor_id for models that require vets
 * @param {Array} items - Items to validate
 * @param {Object} prisma - Prisma client
 * @param {string} modelKey - Model name
 * @returns {Promise<Array>} Validated items
 */
export async function validateVeterinarians(items, prisma, modelKey) {
    let validVets = [];
    try {
        const vets = await prisma.employee.findMany({
            where: { role: "BacSiThuY" },
            select: { id: true }
        });
        validVets = vets.map((v) => Number(v.id)).filter(Boolean);
    } catch (e) {
        logger.warn(`Could not load veterinarians for ${modelKey}`, 'invalidForeignKey');
    }

    if (validVets.length === 0) {
        throw new Error(`❌ No veterinarians available for ${modelKey}`);
    }

    return items.map((it) => {
        const doctorId = Number(it.doctor_id);
        // If doctor_id is not in valid vets list, replace with random vet
        if (!validVets.includes(doctorId)) {
            const newDoctorId = validVets[Math.floor(Math.random() * validVets.length)];
            logger.warn(`validateVeterinarians: Replacing invalid doctor_id ${doctorId} with vet ${newDoctorId}`, 'invalidForeignKey');
            return { ...it, doctor_id: newDoctorId };
        }
        return it;
    });
}

/**
 * Validate foreign keys for promotionFors and ensure unique (promotion_id, service_type) pairs
 * @param {Array} items - Items to validate
 * @param {Object} prisma - Prisma client
 * @returns {Promise<Array>} Validated items
 */
export async function validatePromotionFors(items, prisma) {
    let validPromotions = [];
    let validServiceTypes = [];

    try {
        const promos = await prisma.promotion.findMany({ select: { id: true } });
        validPromotions = promos.map((p) => Number(p.id)).filter(Boolean);
    } catch (e) {
        logger.warn(`Could not load promotions`, 'invalidForeignKey');
    }

    try {
        const services = await prisma.typeOfService.findMany({ select: { type: true } });
        validServiceTypes = services.map((s) => s.type).filter(Boolean);
    } catch (e) {
        logger.warn(`Could not load service types`, 'invalidForeignKey');
    }

    if (validPromotions.length === 0 || validServiceTypes.length === 0) {
        throw new Error(`❌ Missing promotions (${validPromotions.length}) or service types (${validServiceTypes.length})`);
    }

    // Load existing (promotion_id, service_type) pairs
    let existingPairs = new Set();
    try {
        const existing = await prisma.promotionFor.findMany({
            select: { promotion_id: true, service_type: true }
        });
        for (const pair of existing) {
            existingPairs.add(`${pair.promotion_id}|${pair.service_type}`);
        }
    } catch (e) {
        logger.warn(`Could not load existing promotionFor pairs`, 'other');
    }

    // Build index map for promotions for O(1) index lookup
    const promotionIndexMap = new Map(validPromotions.map((id, idx) => [id, idx]));

    // Filter and fix items to ensure uniqueness
    const validItems = [];
    for (const it of items) {
        let promotionId = Number(it.promotion_id);
        let serviceType = it.service_type;

        // Fix invalid promotion_id
        if (!validPromotions.includes(promotionId)) {
            promotionId = validPromotions[Math.floor(Math.random() * validPromotions.length)];
            logger.warn(`promotionFors: Replacing invalid promotion_id with ${promotionId}`, 'invalidForeignKey');
        }

        // Fix invalid service_type
        if (!validServiceTypes.includes(serviceType)) {
            serviceType = validServiceTypes[Math.floor(Math.random() * validServiceTypes.length)];
            logger.warn(`promotionFors: Replacing invalid service_type with ${serviceType}`, 'invalidForeignKey');
        }

        // Find unique pair
        let attempts = 0;
        const maxAttempts = validPromotions.length * validServiceTypes.length;
        while (existingPairs.has(`${promotionId}|${serviceType}`) && attempts < maxAttempts) {
            // Try next promotion using O(1) index lookup
            const idx = promotionIndexMap.get(promotionId) ?? 0;
            promotionId = validPromotions[(idx + 1) % validPromotions.length];
            attempts++;
        }

        const pair = `${promotionId}|${serviceType}`;
        if (!existingPairs.has(pair)) {
            existingPairs.add(pair);
            validItems.push({
                ...it,
                promotion_id: promotionId,
                service_type: serviceType
            });
        } else {
            logger.warn(`promotionFors: Skipping - could not find unique (promotion_id, service_type) pair`, 'skippedItems');
        }
    }

    if (validItems.length === 0) {
        logger.warn(`promotionFors: No valid items after uniqueness check`, 'skippedItems');
    }

    return validItems;
}

/**
 * Validate foreign keys for applyPromotions and check for time overlaps
 * @param {Array} items - Items to validate
 * @param {Object} prisma - Prisma client
 * @returns {Promise<Array>} Validated items
 */
export async function validateApplyPromotions(items, prisma) {
    let validPromotions = [];
    let validBranches = [];

    try {
        const promos = await prisma.promotion.findMany({ select: { id: true } });
        validPromotions = promos.map((p) => Number(p.id)).filter(Boolean);
    } catch (e) {
        logger.warn(`Could not load promotions for applyPromotions`, 'invalidForeignKey');
    }

    try {
        const branches = await prisma.branch.findMany({ select: { id: true } });
        validBranches = branches.map((b) => Number(b.id)).filter(Boolean);
    } catch (e) {
        logger.warn(`Could not load branches for applyPromotions`, 'invalidForeignKey');
    }

    if (validPromotions.length === 0 || validBranches.length === 0) {
        throw new Error(`❌ Missing promotions (${validPromotions.length}) or branches (${validBranches.length})`);
    }

    // Fix invalid foreign keys
    items = items.map((it) => {
        let promotionId = Number(it.promotion_id);
        let branchId = Number(it.branch_id);

        // Fix invalid promotion_id
        if (!validPromotions.includes(promotionId)) {
            promotionId = validPromotions[Math.floor(Math.random() * validPromotions.length)];
            logger.warn(`applyPromotions: Replacing invalid promotion_id with ${promotionId}`, 'invalidForeignKey');
        }

        // Fix invalid branch_id
        if (!validBranches.includes(branchId)) {
            branchId = validBranches[Math.floor(Math.random() * validBranches.length)];
            logger.warn(`applyPromotions: Replacing invalid branch_id with ${branchId}`, 'invalidForeignKey');
        }

        return {
            ...it,
            promotion_id: promotionId,
            branch_id: branchId
        };
    });

    // Check for time overlaps
    let existingApplies = [];
    try {
        existingApplies = await prisma.applyPromotion.findMany({
            select: { promotion_id: true, branch_id: true, start_date: true, end_date: true }
        });
    } catch (e) {
        logger.warn(`Could not load existing applyPromotions`, 'other');
    }

    // Filter items to avoid overlapping time periods
    const validItems = [];
    for (const it of items) {
        const promotionId = Number(it.promotion_id);
        const branchId = Number(it.branch_id);
        const startDate = new Date(it.start_date);
        const endDate = it.end_date ? new Date(it.end_date) : null;

        // Check if this (promotion_id, branch_id) combo already has an active period
        let hasConflict = false;
        for (const existing of existingApplies) {
            if (existing.promotion_id === promotionId && existing.branch_id === branchId) {
                const existStart = new Date(existing.start_date);
                const existEnd = existing.end_date ? new Date(existing.end_date) : null;

                // Check for time overlap
                const overlaps = !(endDate && endDate < existStart) && !(existEnd && existEnd < startDate);
                if (overlaps) {
                    hasConflict = true;
                    logger.warn(`applyPromotions: Skipping - time period overlaps for promo ${promotionId} at branch ${branchId}`, 'other');
                    break;
                }
            }
        }

        if (!hasConflict) {
            validItems.push(it);
            // Add to existing list to prevent duplicates in this batch
            existingApplies.push({
                promotion_id: promotionId,
                branch_id: branchId,
                start_date: startDate,
                end_date: endDate
            });
        }
    }

    if (validItems.length === 0) {
        logger.warn(`applyPromotions: No valid items after overlap check`, 'skippedItems');
    }

    return validItems;
}
