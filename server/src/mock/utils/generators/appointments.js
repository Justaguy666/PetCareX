import { GeneratorContext, makeVietnamDateTime, randomItem } from "./base.js";

/**
 * Generate appointments with complex scheduling logic
 * Single Responsibility: Appointment generation with timezone and conflict handling
 */
export async function generateAppointments(ctx) {
    const { prisma, insertedIds, factory, count, logger } = ctx;

    let emap = null;
    let vids = null;

    if (prisma) {
        const now = new Date();
        try {
            const active = await prisma.mobilization.findMany({
                where: { start_date: { lte: now }, OR: [{ end_date: null }, { end_date: { gte: now } }] },
                select: { employee_id: true, branch_id: true },
            });
            emap = new Map();
            for (const a of active) emap.set(Number(a.employee_id), Number(a.branch_id));
        } catch (e) { }

        try {
            const vs = await prisma.employee.findMany({ where: { role: "BacSiThuY" }, select: { id: true } });
            vids = vs.map((v) => Number(v.id)).filter(Boolean);
        } catch (e) { }
    }

    // MUST have veterinarians - skip if none available
    if (!vids || vids.length === 0) {
        console.warn(`⚠️ No veterinarians available; skipping appointments`);
        return [];
    }

    // Cap appointments to ~2 per pet (reasonable for vet scheduling)
    const maxAppointments = Math.max(insertedIds.pets.length * 2, count);
    const cappedCount = Math.min(count, maxAppointments);

    let items = await import("../helpers.js").then(m => m.generateItems(factory, cappedCount));

    let pbyowner = null;
    if (prisma) {
        try {
            const ps = await prisma.pet.findMany({ select: { id: true, owner_id: true } });
            pbyowner = new Map();
            for (const p of ps) {
                const oid = Number(p.owner_id);
                if (!pbyowner.has(oid)) pbyowner.set(oid, []);
                pbyowner.get(oid).push(Number(p.id));
            }
        } catch (e) { }
    }

    // Load EXISTING appointments from database
    let existingPetAppointments = new Map();
    if (prisma) {
        try {
            const existing = await prisma.appointment.findMany({
                select: { pet_id: true, appointment_time: true }
            });
            for (const apt of existing) {
                const pid = Number(apt.pet_id);
                if (!existingPetAppointments.has(pid)) existingPetAppointments.set(pid, []);
                existingPetAppointments.get(pid).push(new Date(apt.appointment_time).getTime());
            }
        } catch (e) {
            console.warn(`⚠️ Could not load existing appointments`);
        }
    }

    // Track pet appointment counts to balance load
    const petAppointmentCount = new Map();
    for (const [pid, times] of existingPetAppointments) {
        petAppointmentCount.set(pid, times.length);
    }

    const usedSlots = new Set();
    const now = new Date();

    items = items.map((item, itemIdx) => {
        let oid;
        if (pbyowner?.size > 0) {
            const okeys = Array.from(pbyowner.keys());
            oid = randomItem(okeys);
        } else {
            oid = randomItem(insertedIds.users);
        }

        const pcand = pbyowner?.get(oid);
        let pid;

        // Distribute appointments across pets to avoid overloading
        const petList = pcand?.length > 0 ? pcand : insertedIds.pets;
        const sortedByLoad = [...petList].sort((a, b) =>
            (petAppointmentCount.get(a) || 0) - (petAppointmentCount.get(b) || 0)
        );
        pid = sortedByLoad[0]; // Pick pet with fewest appointments

        let bid = randomItem(insertedIds.branches);
        let did = null;

        if (emap && vids?.length > 0) {
            const avets = vids.filter((v) => emap.has(v));
            if (avets.length > 0) {
                did = randomItem(avets);
                bid = emap.get(did);
            } else {
                did = randomItem(vids);
                bid = randomItem(insertedIds.branches);
            }
        } else {
            did = randomItem(vids);
            bid = randomItem(insertedIds.branches);
        }

        if (!sortedByLoad || sortedByLoad.length === 0) {
            console.warn(`⚠️ No pets available for appointment ${itemIdx}; skipping`);
            return null;
        }

        const out = { ...item, pet_id: pid, owner_id: oid, branch_id: bid, doctor_id: did };

        const cancelledSet = new Set(["HuyBo", "Hủy bỏ", "Huy bỏ", "Huy_Bo", "Huy-Bo"]);
        const isCancelled = out.status != null && (cancelledSet.has(out.status) || String(out.status).toLowerCase().includes("huy"));

        if (isCancelled) {
            if (!out.cancelled_reason) out.cancelled_reason = "Seed: canceled";
        } else {
            out.cancelled_reason = null;
        }

        try {
            let dt;
            let found = false;

            // Try to find a time slot for this specific pet
            for (let attempt = 0; attempt < 150; attempt++) {
                const daysAhead = Math.floor(Math.random() * 90) + 1; // Spread across 90 days
                const localHour = Math.floor(Math.random() * 14) + 8;
                const localMin = Math.floor(Math.random() * 12) * 5;
                dt = makeVietnamDateTime(now, daysAhead, localHour, localMin);

                if (dt.getTime() <= now.getTime()) continue;

                const iso = dt.toISOString();
                const key = `${did}|${bid}|${iso}`;

                // Check existing pet appointments
                const petTimes = existingPetAppointments.get(pid) || [];
                const dtTime = dt.getTime();

                let hasConflict = false;
                for (const existingTime of petTimes) {
                    // Allow same pet different times only if far apart (4 hours minimum)
                    const diff = Math.abs(dtTime - existingTime);
                    if (diff < 4 * 60 * 60 * 1000) { // 4 hour window
                        hasConflict = true;
                        break;
                    }
                }

                if (!hasConflict && !usedSlots.has(key)) {
                    usedSlots.add(key);
                    // Prevent unbounded growth of usedSlots in long runs
                    if (usedSlots.size > 50000) {
                        const first = usedSlots.values().next().value;
                        usedSlots.delete(first);
                    }
                    petAppointmentCount.set(pid, (petAppointmentCount.get(pid) || 0) + 1);
                    existingPetAppointments.get(pid)?.push(dtTime) || existingPetAppointments.set(pid, [dtTime]);
                    found = true;
                    break;
                }
            }

            if (!found) {
                // Fallback: far future guaranteed unique time
                dt = makeVietnamDateTime(now, 100 + itemIdx, 8 + (itemIdx % 8), 0);
            }

            const iso = dt.toISOString();
            const chk = new Date(iso);
            const offset = chk.getTimezoneOffset() + 7 * 60;
            const checkHour = chk.getHours() + Math.round(offset / 60);

            if (checkHour < 8 || checkHour > 21) {
                dt = makeVietnamDateTime(now, 1, 8, 0);
            }

            out.appointment_time = dt.toISOString();
        } catch (e) {
            console.error("[APPT-ERROR]", e.message);
            const fallback = new Date(now);
            fallback.setDate(fallback.getDate() + 1 + itemIdx);
            fallback.setHours(8 + (itemIdx % 8), 0, 0, 0);
            const offset2 = fallback.getTimezoneOffset() + 7 * 60;
            fallback.setMinutes(fallback.getMinutes() + offset2);
            out.appointment_time = fallback.toISOString();
        }

        return out;
    });

    // Remove any nulls produced by skipped items
    items = items.filter(Boolean);

    if (cappedCount < count) {
        logger.warn(`appointments: Capping from ${count} to ${cappedCount} (limited pets available)`, 'skippedItems');
    }

    return items;
}
