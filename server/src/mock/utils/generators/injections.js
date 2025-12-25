import { GeneratorContext, shuffleArray, randomItem } from "./base.js";

/**
 * Generate single injections with unique service_id constraint
 * Single Responsibility: Only handles single injection generation
 */
export async function generateSingleInjections(ctx) {
    const { prisma, insertedIds, factory, count, logger } = ctx;

    let items = await import("../helpers.js").then(m => m.generateItems(factory, count));

    // Load veterinarians
    let vids = null;
    let ssvids = null;

    if (prisma) {
        try {
            const ds = await prisma.employee.findMany({
                where: { role: "BacSiThuY" },
                select: { id: true }
            });
            vids = ds.map((d) => Number(d.id)).filter(Boolean);
        } catch (e) { }

        try {
            const ss = await prisma.service.findMany({
                where: { type_of_service: "TiemMuiLe" },
                select: { id: true }
            });
            ssvids = ss.map((s) => Number(s.id)).filter(Boolean);
        } catch (e) { }
    }

    // Build service pool, shuffled to avoid duplicates
    let servicePool = ssvids?.length > 0 ? shuffleArray(ssvids) :
        insertedIds.services ? shuffleArray([...insertedIds.services]) : [];

    // Cap count to available services (unique constraint)
    if (servicePool.length > 0 && servicePool.length < items.length) {
        logger.warn(`singleInjections: Capping from ${items.length} to ${servicePool.length} (unique service_id constraint)`, 'skippedItems');
        items = items.slice(0, servicePool.length);
    }

    return items.map((i, idx) => ({
        ...i,
        pet_id: randomItem(insertedIds.pets),
        service_id: servicePool.length > 0 ? servicePool[idx] : i.service_id,
        doctor_id: vids?.length > 0 ? randomItem(vids) : randomItem(insertedIds.employees),
    }));
}

/**
 * Generate medical examinations with unique service_id constraint
 */
export async function generateMedicalExaminations(ctx) {
    const { prisma, insertedIds, factory, count, logger } = ctx;

    let items = await import("../helpers.js").then(m => m.generateItems(factory, count));

    let vids = null;
    let msvids = null;

    if (prisma) {
        try {
            const ds = await prisma.employee.findMany({
                where: { role: "BacSiThuY" },
                select: { id: true }
            });
            vids = ds.map((d) => Number(d.id)).filter(Boolean);
        } catch (e) {
            console.warn(`⚠️ Could not load veterinarians for medicalExaminations`);
        }

        try {
            const ms = await prisma.service.findMany({
                where: { type_of_service: "KhamBenh" },
                select: { id: true }
            });
            msvids = ms.map((s) => Number(s.id)).filter(Boolean);
        } catch (e) {
            console.warn(`⚠️ Could not load KhamBenh services`);
        }
    }

    // MUST have vets - skip if none available
    if (!vids || vids.length === 0) {
        console.warn(`⚠️ No veterinarians available; skipping medicalExaminations`);
        return [];
    }

    // Build service pool, shuffled to avoid duplicates
    let servicePool = msvids?.length > 0 ? shuffleArray(msvids) :
        insertedIds.services ? shuffleArray([...insertedIds.services]) : [];

    // Cap count to available services (unique constraint)
    if (servicePool.length > 0 && servicePool.length < items.length) {
        logger.warn(`medicalExaminations: Capping from ${items.length} to ${servicePool.length} (unique service_id constraint)`, 'skippedItems');
        items = items.slice(0, servicePool.length);
    }

    return items.map((i, idx) => ({
        ...i,
        pet_id: randomItem(insertedIds.pets),
        service_id: servicePool.length > 0 ? servicePool[idx] : i.service_id,
        doctor_id: randomItem(vids), // MUST be vet
    }));
}

/**
 * Generate package injections with unique service_id constraint
 */
export async function generatePackageInjections(ctx) {
    const { prisma, insertedIds, factory, count, logger } = ctx;

    let items = await import("../helpers.js").then(m => m.generateItems(factory, count));

    let vids = null;
    let psvids = null;

    if (prisma) {
        try {
            const ds = await prisma.employee.findMany({
                where: { role: "BacSiThuY" },
                select: { id: true }
            });
            vids = ds.map((d) => Number(d.id)).filter(Boolean);
        } catch (e) { }

        try {
            const ps = await prisma.service.findMany({
                where: { type_of_service: "TiemTheoGoi" },
                select: { id: true }
            });
            psvids = ps.map((s) => Number(s.id)).filter(Boolean);
        } catch (e) { }
    }

    // MUST have vets - skip if none available
    if (!vids || vids.length === 0) {
        console.warn(`⚠️ No veterinarians available; skipping packageInjections`);
        return [];
    }

    let spool = psvids?.length > 0 ? shuffleArray(psvids) :
        insertedIds.services ? shuffleArray([...insertedIds.services]) : [];

    if (spool.length > 0 && spool.length < items.length) {
        logger.warn(`packageInjections: Capping from ${items.length} to ${spool.length}`, 'skippedItems');
        items = items.slice(0, spool.length);
    }

    return items.map((i) => ({
        ...i,
        pet_id: randomItem(insertedIds.pets),
        service_id: spool.length > 0 ? spool.pop() : i.service_id,
        doctor_id: randomItem(vids), // MUST be vet
    }));
}
