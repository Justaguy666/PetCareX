// Progress bar helper
function printProgressBar(current, total, prefix = '', length = 30) {
  const percent = Math.round((current / total) * 100);
  const filledLength = Math.round((length * current) / total);
  const bar = '█'.repeat(filledLength) + '-'.repeat(length - filledLength);
  process.stdout.write(`\r${prefix} [${bar}] ${percent}% (${current}/${total})`);
  if (current === total) process.stdout.write('\n');
}
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TABLES_ORDER = [
  "vaccinePackageUse",
  "vaccineUse",
  "prescription",
  "sellProduct",
  "medicalExamination",
  "singleInjection",
  "packageInjection",
  "service",
  "applyPromotion",
  "promotionFor",
  "promotion",
  "invoice",
  "appointment",
  "medicineInventory",
  "vaccineInventory",
  "packageInventory",
  "productInventory",
  "includeVaccine",
  "vaccinePackage",
  "vaccine",
  "medicine",
  "product",
  "typeOfService",
  "mobilization",
  "refreshToken",
  "account",
  "pet",
  "branch",
  "employee",
  "user",
];

async function clearDatabase() {
  console.log("🧹 Clearing database...\n");

  // Disable triggers on appointments table temporarily
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE appointments DISABLE TRIGGER ALL'
    );
    console.log("🔓 Disabled appointment triggers");
  } catch (e) {
    console.warn(`⚠️  Could not disable triggers: ${e.message}`);
  }

  // Delete appointments without trigger checks
  try {
    const result = await prisma.$executeRawUnsafe(
      'DELETE FROM appointments'
    );
    console.log(`📝 Deleted ${result} appointments`);
  } catch (e) {
    console.warn(`⚠️  Could not delete appointments: ${e.message}`);
  }

  // Re-enable triggers
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE appointments ENABLE TRIGGER ALL'
    );
    console.log("🔒 Re-enabled appointment triggers");
  } catch (e) {
    console.warn(`⚠️  Could not re-enable triggers: ${e.message}`);
  }

  // Fast path: attempt to TRUNCATE all user tables in public schema.
  // This is much faster than deleting rows one-by-one. If TRUNCATE fails
  // (permissions, non-Postgres, or other), fall back to the existing deleteMany loop.
  try {
    const q = `SELECT string_agg(format('%I.%I', table_schema, table_name), ',') as tables
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('_prisma_migrations','prisma_migrations')`;
    const res = await prisma.$queryRawUnsafe(q);
    let tablesList = null;
    if (Array.isArray(res) && res[0] && res[0].tables) tablesList = res[0].tables;
    else if (res && res.rows && res.rows[0] && res.rows[0].tables) tablesList = res.rows[0].tables;

    if (!tablesList) throw new Error('No tables found to truncate');

    // Chunked TRUNCATE so we can show a progress bar while truncation proceeds.
    const tablesArr = tablesList.split(',').map(s => s.trim()).filter(Boolean);
    const totalTables = tablesArr.length;
    const chunkSize = 10; // truncate 10 tables per statement to allow progress updates
    let truncated = 0;
    for (let i = 0; i < tablesArr.length; i += chunkSize) {
      const chunk = tablesArr.slice(i, i + chunkSize);
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${chunk.join(',')} RESTART IDENTITY CASCADE`);
      truncated += chunk.length;
      printProgressBar(truncated, totalTables, 'Truncating tables');
    }
    process.stdout.write('\n');
    console.log(`🧹 Truncated ${totalTables} tables`);
  } catch (e) {
    console.warn(`⚠️ TRUNCATE failed, falling back to per-table deletes: ${e?.message || e}`);

    let idx = 0;
    const total = TABLES_ORDER.length;
    for (const table of TABLES_ORDER) {
      try {
        const client = prisma[table];
        if (!client) {
          idx++;
          printProgressBar(idx, total, 'Deleting tables');
          continue;
        }
        await client.deleteMany({});
        idx++;
        printProgressBar(idx, total, 'Deleting tables');
      } catch (err) {
        process.stdout.write('\n');
        console.error(`❌ Failed to delete ${table}:`, err.message);
        throw err;
      }
    }
  }

  console.log("\n✅ Database cleared successfully!");
}

async function main() {
  try {
    await clearDatabase();
  } catch (err) {
    console.error("\n💥 CLEAR FAILED");
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();