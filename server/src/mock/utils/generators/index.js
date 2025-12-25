/**
 * Generator Registry - Open/Closed Principle
 * Can add new generators without modifying existing code
 */

import { GeneratorContext } from "./base.js";
import { generateSingleInjections, generateMedicalExaminations, generatePackageInjections } from "./injections.js";
import { generatePrescriptions, generateVaccineUses, generateSellProducts } from "./medical.js";
import { generateAppointments } from "./appointments.js";

/**
 * Registry mapping model keys to their generator functions
 * Following Open/Closed Principle - extensible without modification
 */
export const GENERATOR_REGISTRY = {
    singleInjections: generateSingleInjections,
    medicalExaminations: generateMedicalExaminations,
    packageInjections: generatePackageInjections,
    prescriptions: generatePrescriptions,
    vaccineUses: generateVaccineUses,
    sellProducts: generateSellProducts,
    appointments: generateAppointments,
};

/**
 * Main generator orchestrator
 * @param {string} modelKey - Model to generate
 * @param {Object} prisma - Prisma client
 * @param {Object} insertedIds - Previously inserted IDs
 * @param {Function} factory - Factory function
 * @param {number} count - Number of items to generate
 * @returns {Promise<Array>} Generated items
 */
export async function generateWithRegistry(modelKey, prisma, insertedIds, factory, count) {
    const generator = GENERATOR_REGISTRY[modelKey];

    if (!generator) {
        // No special generator, use default
        return null;
    }

    // Create context for dependency injection (Dependency Inversion Principle)
    const ctx = new GeneratorContext(prisma, insertedIds, factory, count);

    // Call generator with injected dependencies
    return await generator(ctx);
}
