import { logger } from "../logger.js";
import { generateItems } from "../helpers.js";

/**
 * Generator Context - Shared dependencies for all generators
 * Follows Dependency Inversion Principle
 */
export class GeneratorContext {
    constructor(prisma, insertedIds, factory, count) {
        this.prisma = prisma;
        this.insertedIds = insertedIds;
        this.factory = factory;
        this.count = count;
        this.logger = logger;
    }
}

/**
 * Shared utility functions for generators
 */

export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function makeVietnamDateTime(base, daysAhead, localHour, localMin) {
    const VN_TZ = 7 * 60;
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + daysAhead, localHour, localMin, 0, 0);
    const offset = d.getTimezoneOffset() + VN_TZ;
    d.setMinutes(d.getMinutes() + offset);
    return d;
}

export function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
