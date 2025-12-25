import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "..", "seed-warnings.log");

// Warning counter
export const warningCounts = {
    insufficientStock: 0,
    duplicateConstraint: 0,
    invalidForeignKey: 0,
    skippedItems: 0,
    other: 0
};

// Logger that writes to file
export const logger = {
    warn: (message, category = 'other') => {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${message}\n`;
        fsSync.appendFileSync(LOG_FILE, logLine);

        // Track warning counts
        if (category in warningCounts) {
            warningCounts[category]++;
        } else {
            warningCounts.other++;
        }
    },
    clear: () => {
        try {
            fsSync.writeFileSync(LOG_FILE, `Seed Warnings Log - ${new Date().toISOString()}\n${'='.repeat(80)}\n\n`);
        } catch (e) { }
    }
};

// Progress bar helper
export function printProgressBar(current, total, prefix = '', length = 30) {
    const percent = Math.round((current / total) * 100);
    const filledLength = Math.round((length * current) / total);
    const bar = '█'.repeat(filledLength) + '-'.repeat(length - filledLength);
    // Clear line and print progress (use ANSI escape codes for better compatibility)
    process.stdout.clearLine?.(0);
    process.stdout.cursorTo?.(0);
    process.stdout.write(`${prefix} [${bar}] ${percent}% (${current}/${total})`);
    if (current === total) process.stdout.write('\n');
}

export { LOG_FILE };
