import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { OUT_DIR } from "./constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Ensure output directory exists
 */
export async function ensureOutDir() {
    await fs.mkdir(OUT_DIR, { recursive: true });
}

/**
 * Parse seed configuration file
 */
export async function parseConfigFile() {
    try {
        const raw = await fs.readFile(path.join(__dirname, "..", "seed.config.json"), "utf8");
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

/**
 * Generate items using factory function
 */
export async function generateItems(factory, count) {
    return Promise.all(Array.from({ length: count }, () => Promise.resolve(factory())));
}
