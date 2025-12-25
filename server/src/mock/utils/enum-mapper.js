import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load enum mappings from Prisma schema
 * Returns object with enum name -> { mappedValue: identifier } mappings
 */
export async function buildEnumMaps() {
    const schemaPath = path.join(__dirname, "..", "..", "prisma", "schema.prisma");
    try {
        const raw = await fs.readFile(schemaPath, "utf8");
        const enumBlocks = {};
        const enumRe = /enum\s+(\w+)\s*{([\s\S]*?)}/g;
        let m;
        while ((m = enumRe.exec(raw))) {
            const name = m[1];
            const body = m[2];
            const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            const map = {};
            for (const line of lines) {
                const parts = line.split("@map");
                const ident = parts[0].trim().replace(/,$/, "");
                let mapped = ident;
                if (parts[1]) {
                    const m2 = parts[1].match(/\("([^"]+)"\)/);
                    if (m2) mapped = m2[1];
                }
                map[mapped] = ident;
                map[ident] = ident;
            }
            enumBlocks[name] = map;
        }
        return enumBlocks;
    } catch (e) {
        return {};
    }
}

/**
 * Map enum values in items based on model's enum fields
 * @param {Array} items - Items to process
 * @param {Object} enumFieldsMap - Field -> EnumName mapping for this model
 * @param {Object} enumMaps - All enum mappings from buildEnumMaps()
 * @param {Function} logger - Logger instance for warnings
 * @returns {Array} Items with mapped enum values
 */
export function mapEnumsInItems(items, enumFieldsMap, enumMaps, logger) {
    if (!enumFieldsMap) return items;

    return items.map((item) => {
        const mapped = { ...item };
        for (const [field, enumName] of Object.entries(enumFieldsMap)) {
            if (!(field in mapped)) continue;
            const val = mapped[field];
            const enumMap = enumMaps[enumName];
            if (!enumMap) continue;

            const correctValue = enumMap[val];
            if (correctValue) {
                mapped[field] = correctValue;
            } else {
                // Fallback to first valid enum value
                const firstValid = Object.values(enumMap)[0];
                if (firstValid) {
                    mapped[field] = firstValid;
                    logger?.warn(`Invalid enum value "${val}" for field "${field}", using fallback "${firstValid}"`, 'other');
                }
            }
        }
        return mapped;
    });
}
