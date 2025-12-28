// Seed a single table
// Usage: node src/mock/seed-single.js <tableName> [count]
// Example: node src/mock/seed-single.js applyPromotions 15

import { PrismaClient } from "@prisma/client";
import { FACTORIES, PRISMA_CLIENT_MAP } from "./utils/constants.js";

const tableName = process.argv[2];
const count = parseInt(process.argv[3]) || 10;

if (!tableName) {
  console.error("Usage: node seed-single.js <tableName> [count]");
  console.log("Available tables:", Object.keys(FACTORIES).join(", "));
  process.exit(1);
}

const factory = FACTORIES[tableName];
if (!factory) {
  console.error(`❌ Unknown table: ${tableName}`);
  console.log("Available tables:", Object.keys(FACTORIES).join(", "));
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log(`🚀 Seeding ${tableName} (${count} records)...`);

  const clientProp = PRISMA_CLIENT_MAP[tableName];
  if (!clientProp || !prisma[clientProp]) {
    console.error(`❌ No Prisma client for: ${tableName}`);
    process.exit(1);
  }

  // Get existing foreign key IDs if needed
  let promotionIds = [];
  let branchIds = [];

  if (tableName === "applyPromotions") {
    const promotions = await prisma.promotion.findMany({ select: { id: true } });
    const branches = await prisma.branch.findMany({ select: { id: true } });
    promotionIds = promotions.map(p => Number(p.id));
    branchIds = branches.map(b => Number(b.id));
    
    if (!promotionIds.length || !branchIds.length) {
      console.error("❌ Need existing promotions and branches first");
      process.exit(1);
    }
  }

  let inserted = 0;
  for (let i = 0; i < count; i++) {
    try {
      const item = factory({
        promotion_id: promotionIds[Math.floor(Math.random() * promotionIds.length)],
        branch_id: branchIds[Math.floor(Math.random() * branchIds.length)],
      });
      
      await prisma[clientProp].create({ data: item });
      inserted++;
      process.stdout.write(`\r   Inserted: ${inserted}/${count}`);
    } catch (e) {
      console.error(`\n❌ Failed at index ${i}: ${e.message}`);
    }
  }

  console.log(`\n✅ Done! Inserted ${inserted} records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
