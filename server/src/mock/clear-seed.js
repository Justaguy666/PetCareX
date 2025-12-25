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