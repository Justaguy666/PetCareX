import { logger, warningCounts } from "./logger.js";
import { PRISMA_CLIENT_MAP, MODEL_ENUM_FIELDS } from "./constants.js";
import { buildEnumMaps } from "./enum-mapper.js";
import { normalizeInvoices, normalizePromotionFors, validateVeterinarians, validatePromotionFors, validateApplyPromotions } from "./validators.js";

/**
 * Persist items to database with comprehensive validation and error handling
 * @param {Object} prisma - Prisma client instance
 * @param {string} modelKey - Model key (e.g., 'users', 'products')
 * @param {Array} items - Items to persist
 * @param {boolean} silent - Whether to suppress progress output
 */
export async function persistToDb(prisma, modelKey, items, silent = false) {
    const clientProp = PRISMA_CLIENT_MAP[modelKey];
    if (!clientProp || !prisma[clientProp]) {
        throw new Error(`❌ Prisma client missing for ${modelKey}`);
    }

    const client = prisma[clientProp];
    try {
        // Use a single COUNT after the operation and compute delta using
        // a lightweight in-memory map stored on the `prisma` client to avoid
        // issuing two COUNT() queries per batch.
        if (!prisma._lastCounts) prisma._lastCounts = {};
        const prevCount = prisma._lastCounts[modelKey] ?? 0;
        const enumFields = MODEL_ENUM_FIELDS[modelKey] || {};
        if (Object.keys(enumFields).length > 0) {
            if (!prisma._enumMaps) prisma._enumMaps = await buildEnumMaps();
            const maps = prisma._enumMaps;
            items = items.map((it) => {
                const copy = { ...it };
                for (const [field, enumName] of Object.entries(enumFields)) {
                    const val = copy[field];
                    if (val == null) continue;
                    const map = maps[enumName];
                    if (map && map[val] !== undefined) {
                        copy[field] = map[val];
                    } else if (map) {
                        // Invalid enum value - warn and fallback to first valid mapping
                        const firstValid = Object.values(map)[0];
                        logger.warn(`Enum: Invalid value "${val}" for field "${field}", using fallback "${firstValid}"`, 'other');
                        copy[field] = firstValid;
                    }
                }
                return copy;
            });
        }


        // Normalize ratings - AFTER enum mapping
        if (modelKey === "invoices") {
            items = normalizeInvoices(items);
        }

        // Normalize promotionFors discount_percentage to [5, 15]
        if (modelKey === "promotionFors") {
            items = normalizePromotionFors(items);
        }


        // Ensure singleInjections & packageInjections & medicalExaminations have valid vet doctor_id
        if (["singleInjections", "packageInjections", "medicalExaminations"].includes(modelKey)) {
            items = await validateVeterinarians(items, prisma, modelKey);
        }


        // Validate foreign keys for promotionFors + ensure unique (promotion_id, service_type)
        if (modelKey === "promotionFors") {
            items = await validatePromotionFors(items, prisma);
        }


        // Validate foreign keys for applyPromotions and check for time overlaps
        if (modelKey === "applyPromotions") {
            items = await validateApplyPromotions(items, prisma);
        }

        if (typeof client.createMany === "function") {
            try {
                const res = await client.createMany({ data: items });
                // Don't log during batching to avoid breaking progress bar
            } catch (createManyErr) {
                if (!silent) {
                    logger.warn(`${modelKey}: createMany failed, falling back to individual inserts`, 'other');
                }
                for (let idx = 0; idx < items.length; idx++) {
                    let payload = { ...items[idx] };
                    try {
                        if (modelKey !== "typeOfServices") {
                            delete payload.created_at;
                            delete payload.updated_at;
                        }
                        if (modelKey === "typeOfServices") {
                            await client.upsert({
                                where: { type: payload.type },
                                update: payload,
                                create: payload,
                            });
                        } else {
                            await client.create({ data: payload });
                        }
                    } catch (singleErr) {
                        const msg = (singleErr && singleErr.message) ? String(singleErr.message) : '';
                        const isInsufficient = /Không đủ/i.test(msg) || singleErr?.code === 'P0001';
                        const isOverlap = /Khuyến mãi đã được áp dụng/i.test(msg) || (/khoảng thời gian/i.test(msg) && singleErr?.code === 'P0001');
                        const isDuplicate = singleErr?.code === 'P2002';
                        if (!silent) {
                            if (isInsufficient) {
                                logger.warn(`${modelKey}: Skipping index ${idx} due to insufficient stock`, 'insufficientStock');
                            } else if (isOverlap) {
                                logger.warn(`${modelKey}: Skipping index ${idx} due to time period overlap`, 'other');
                            } else if (isDuplicate) {
                                logger.warn(`${modelKey}: Skipping index ${idx} due to duplicate constraint`, 'duplicateConstraint');
                            } else {
                                console.error(`❌ Failed at index ${idx}`);
                                if (modelKey === "promotionFors") {
                                    console.error("Item:", {
                                        discount_percentage: items[idx].discount_percentage,
                                        promotion_id: items[idx].promotion_id,
                                        service_type: items[idx].service_type,
                                    });
                                }
                                console.error("Error:", singleErr.message);
                            }
                        }
                        if (!isInsufficient && !isDuplicate && !isOverlap) {
                            if (!silent) throw singleErr;
                        }
                    }
                }
                // Don't log during batching to avoid breaking progress bar
            }
        } else {
            let _idx = 0;
            for (const it of items) {
                let payload = { ...it };
                if (modelKey !== "typeOfServices") {
                    delete payload.created_at;
                    delete payload.updated_at;
                }
                try {
                    if (modelKey === "typeOfServices") {
                        await client.upsert({
                            where: { type: payload.type },
                            update: payload,
                            create: payload,
                        });
                    } else {
                        await client.create({ data: payload });
                    }
                } catch (singleErr) {
                    console.error('Failed payload:', payload);
                    const msg = (singleErr && singleErr.message) ? String(singleErr.message) : '';
                    const isInsufficient = /Không đủ/i.test(msg) || singleErr?.code === 'P0001';
                    const isOverlap = /Khuyến mãi đã được áp dụng/i.test(msg) || (/khoảng thời gian/i.test(msg) && singleErr?.code === 'P0001');
                    const isDuplicate = singleErr?.code === 'P2002';
                    if (!silent) {
                        if (isInsufficient) {
                            logger.warn(`${modelKey}: Skipping index ${_idx} due to insufficient stock`, 'insufficientStock');
                        } else if (isOverlap) {
                            logger.warn(`${modelKey}: Skipping index ${_idx} due to time period overlap`, 'other');
                        } else if (isDuplicate) {
                            logger.warn(`${modelKey}: Skipping index ${_idx} due to duplicate constraint`, 'duplicateConstraint');
                        } else {
                            console.error(`❌ Failed at index ${_idx}`);
                            console.error("Error:", singleErr.message);
                        }
                    }
                    if (!isInsufficient && !isDuplicate && !isOverlap) {
                        if (!silent) throw singleErr;
                    }
                }
                _idx++;
            }
            // Don't log during batching to avoid breaking progress bar
        }

        const afterCount = await client.count();
        const actualInserted = Math.max(0, afterCount - prevCount);
        // Update stored count for subsequent batches
        prisma._lastCounts[modelKey] = afterCount;
        if (actualInserted < items.length) {
            const skipped = items.length - actualInserted;
            logger.warn(`${modelKey}: count mismatch (requested ${items.length}, inserted ${actualInserted}, DB after ${afterCount})`, 'skippedItems');
            warningCounts.skippedItems += skipped;
        }
        return actualInserted;
    } catch (err) {
        console.error(`❌ Persist failed for ${modelKey}`);
        throw err;
    }
}
