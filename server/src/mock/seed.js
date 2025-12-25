// Import utilities
import { logger, warningCounts, printProgressBar, LOG_FILE } from "./utils/logger.js";
import { OUT_DIR, DEFAULT_COUNTS, FACTORIES, PRISMA_CLIENT_MAP } from "./utils/constants.js";
import { ensureOutDir, parseConfigFile, generateItems } from "./utils/helpers.js";
import { GENERATOR_REGISTRY, generateWithRegistry } from "./utils/generators/index.js";
import { persistToDb } from "./utils/persistence.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const config = await parseConfigFile();
  if (!config) { console.error("❌ Missing seed.config.json"); process.exit(1); }

  const { size = "small", counts = {}, order = Object.keys(FACTORIES), persist = false, dryRun = false } = config;

  // Clear log file at start
  logger.clear();

  await ensureOutDir();

  let prisma = null;
  if (persist && !dryRun) {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
    console.log("✅ Prisma client initialized");
  }

  const usedAppointments = new Set();
  const summary = [];
  const insertedIds = {};

  for (let countIndex = 0; countIndex < order.length; countIndex++) {
    const key = order[countIndex];
    const factory = FACTORIES[key];
    if (!factory) throw new Error(`❌ Unknown factory: ${key}`);

    const count = Number(counts[key] ?? DEFAULT_COUNTS[key] ?? 0);
    if (count <= 0) { console.log(`⏭️  Skip ${key}`); continue; }

    const prettyKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    process.stdout.write(`\n\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
    process.stdout.write(`\n\x1b[1m🚀 [${countIndex + 1}/${order.length}] Seeding: ${prettyKey} (${count})\x1b[0m\n`);

    let items;

    if (key === "accounts" && insertedIds.users) {
      items = insertedIds.users.map((uid) => factory({ user_id: uid }));
    } else if (key === "refreshTokens" && insertedIds.users) {
      items = insertedIds.users.map((uid) => factory({ user_id: uid }));
    } else if (key === "pets" && insertedIds.users) {
      items = await generateItems(factory, count);
      items = items.map((i) => ({ ...i, owner_id: insertedIds.users[Math.floor(Math.random() * insertedIds.users.length)] }));
    } else if (key === "productInventories" && insertedIds.branches && insertedIds.products) {
      items = [];
      let idx = 0;
      for (let i = 0; i < count && idx < insertedIds.products.length * insertedIds.branches.length; i++) {
        const bi = Math.floor(idx / insertedIds.products.length) % insertedIds.branches.length;
        const pi = idx % insertedIds.products.length;
        items.push({ ...factory({}), branch_id: insertedIds.branches[bi], product_id: insertedIds.products[pi] });
        idx++;
      }
    } else if (key === "medicineInventories" && insertedIds.branches && insertedIds.medicines) {
      items = [];
      let idx = 0;
      for (let i = 0; i < count && idx < insertedIds.medicines.length * insertedIds.branches.length; i++) {
        const bi = Math.floor(idx / insertedIds.medicines.length) % insertedIds.branches.length;
        const mi = idx % insertedIds.medicines.length;
        items.push({ ...factory({}), branch_id: insertedIds.branches[bi], medicine_id: insertedIds.medicines[mi] });
        idx++;
      }
    } else if (key === "vaccineInventories" && insertedIds.branches && insertedIds.vaccines) {
      items = [];
      let idx = 0;
      for (let i = 0; i < count && idx < insertedIds.vaccines.length * insertedIds.branches.length; i++) {
        const bi = Math.floor(idx / insertedIds.vaccines.length) % insertedIds.branches.length;
        const vi = idx % insertedIds.vaccines.length;
        items.push({ ...factory({}), branch_id: insertedIds.branches[bi], vaccine_id: insertedIds.vaccines[vi] });
        idx++;
      }
    } else if (key === "packageInventories" && insertedIds.branches && insertedIds.vaccinePackages) {
      items = [];
      let idx = 0;
      for (let i = 0; i < count && idx < insertedIds.vaccinePackages.length * insertedIds.branches.length; i++) {
        const bi = Math.floor(idx / insertedIds.vaccinePackages.length) % insertedIds.branches.length;
        const pi = idx % insertedIds.vaccinePackages.length;
        items.push({ ...factory({}), branch_id: insertedIds.branches[bi], package_id: insertedIds.vaccinePackages[pi] });
        idx++;
      }
    } else if (key === "services" && insertedIds.invoices && insertedIds.typeOfServices) {
      items = await generateItems(factory, count);
      items = items.map((i) => {
        const { quality_rating, employee_attitude_rating, ...copy } = i; // Remove ratings
        return {
          ...copy,
          invoice_id: insertedIds.invoices[Math.floor(Math.random() * insertedIds.invoices.length)],
          type_of_service: insertedIds.typeOfServices[Math.floor(Math.random() * insertedIds.typeOfServices.length)],
        };
      });
    } else if (key === "invoices" && insertedIds.employees && insertedIds.branches && insertedIds.users) {
      items = await generateItems(factory, count);
      let validPairs = [];
      if (prisma) {
        const now = new Date();
        try {
          const active = await prisma.mobilization.findMany({
            where: { start_date: { lte: now }, OR: [{ end_date: null }, { end_date: { gte: now } }] },
            select: { employee_id: true, branch_id: true },
          });
          validPairs = active.map((a) => [Number(a.employee_id), Number(a.branch_id)])
            .filter(([e, b]) => insertedIds.employees.includes(e) && insertedIds.branches.includes(b));
        } catch (e) { }
      }
      items = items.map((i) => {
        const copy = { ...i, customer_id: insertedIds.users[Math.floor(Math.random() * insertedIds.users.length)] };
        if (validPairs.length > 0) {
          const [e, b] = validPairs[Math.floor(Math.random() * validPairs.length)];
          copy.created_by = e;
          copy.branch_id = b;
        } else {
          copy.created_by = insertedIds.employees[Math.floor(Math.random() * insertedIds.employees.length)];
          copy.branch_id = insertedIds.branches[Math.floor(Math.random() * insertedIds.branches.length)];
        }
        return copy;
      });
    } else if (GENERATOR_REGISTRY[key]) {
      // Use modular generator from registry
      items = await generateWithRegistry(key, prisma, insertedIds, factory, count);
      // Registry handles: singleInjections, packageInjections, medicalExaminations, 
      // appointments, prescriptions, vaccineUses, sellProducts
    } else if (key === "includeVaccines" && insertedIds.vaccinePackages && insertedIds.vaccines) {
      items = [];
      let idx = 0;
      for (let i = 0; i < count && idx < insertedIds.vaccines.length * insertedIds.vaccinePackages.length; i++) {
        const pi = Math.floor(idx / insertedIds.vaccines.length) % insertedIds.vaccinePackages.length;
        const vi = idx % insertedIds.vaccines.length;
        items.push({ ...factory({}), package_id: insertedIds.vaccinePackages[pi], vaccine_id: insertedIds.vaccines[vi] });
        idx++;
      }
    } else if (key === "vaccinePackageUses" && insertedIds.packageInjections && insertedIds.vaccinePackages) {
      // Check if packageInjections actually has data
      if (!insertedIds.packageInjections || insertedIds.packageInjections.length === 0) {
        logger.warn(`${key}: No packageInjections available; skipping`, 'skippedItems');
        // Skip generating and persisting this key entirely
        items = [];
        continue;
      } else {
        items = [];
        const used = new Map();
        for (let i = 0; i < count; i++) {
          const pi = insertedIds.packageInjections[Math.floor(Math.random() * insertedIds.packageInjections.length)];
          const pkg = insertedIds.vaccinePackages[Math.floor(Math.random() * insertedIds.vaccinePackages.length)];
          const last = used.get(pi) || 0;
          const next = last + 1;
          used.set(pi, next);
          items.push(factory({ package_injection_id: pi, package_id: pkg, injection_number: next, is_completed: false }));
        }
      }
    } else if (key === "promotionFors" && insertedIds.promotions && insertedIds.typeOfServices) {
      items = await generateItems(factory, count);

      items = items.map((i) => {
        let discount = i.discount_percentage;

        // Constraint: discount_percentage IS NULL OR BETWEEN 5 AND 15
        if (discount !== null) {
          // Ensure it's a number
          if (typeof discount !== 'number') {
            discount = parseFloat(discount);
          }

          // If parsing failed, set to null
          if (isNaN(discount)) {
            discount = null;
          } else {
            // Clamp to valid range [5, 15]
            discount = Math.max(5, Math.min(15, Math.round(discount)));
          }
        }

        return {
          ...i,
          discount_percentage: discount,
          promotion_id: insertedIds.promotions[Math.floor(Math.random() * insertedIds.promotions.length)],
          service_type: insertedIds.typeOfServices[Math.floor(Math.random() * insertedIds.typeOfServices.length)],
        };
      });
    } else if (key === "applyPromotions" && insertedIds.promotions && insertedIds.branches) {
      items = await generateItems(factory, count);
      items = items.map((i) => ({
        ...i,
        promotion_id: insertedIds.promotions[Math.floor(Math.random() * insertedIds.promotions.length)],
        branch_id: insertedIds.branches[Math.floor(Math.random() * insertedIds.branches.length)],
      }));
    } else if (key === "mobilizations" && insertedIds.employees && insertedIds.branches) {
      items = insertedIds.employees.slice(0, count).map((eid) => ({
        employee_id: eid,
        branch_id: insertedIds.branches[Math.floor(Math.random() * insertedIds.branches.length)],
        start_date: new Date("2023-01-01").toISOString(),
        end_date: null,
      }));
    } else if (key === "typeOfServices") {
      const stPath = path.join(__dirname, "enums", "service-type.json");
      try {
        const stData = await fs.readFile(stPath, "utf8");
        const stTypes = JSON.parse(stData);
        items = stTypes.slice(0, count).map((t) => factory({ type: t }));
      } catch (e) {
        logger.warn(`typeOfServices: Could not load service-type.json, using random generation`, 'other');
        items = await generateItems(factory, count);
      }
    } else {
      items = await generateItems(factory, count);
    }

    const outFile = path.join(OUT_DIR, `${key}.json`);
    await fs.writeFile(
      outFile,
      JSON.stringify(items, (k, v) => (typeof v === "bigint" ? Number(v) : v), 2),
      "utf8"
    );

    if (persist && prisma && !dryRun) {

      let insertedCount = 0;
      const batchSize = (size === "small") ? 500 : (size === "medium") ? 1000 : 5000;

      for (let start = 0; start < items.length; start += batchSize) {
        const batch = items.slice(start, start + batchSize);
        const isLast = start + batchSize >= items.length;
        await persistToDb(prisma, key, batch, !isLast);
        insertedCount += batch.length;
        printProgressBar(Math.min(insertedCount, items.length), items.length, `   Inserting ${prettyKey}`);
      }
      process.stdout.write('\n');

      const clientProp = PRISMA_CLIENT_MAP[key];
      if (clientProp && prisma[clientProp]) {
        if (key === "users" || key === "employees" || key === "branches" || key === "products" || key === "medicines" || key === "vaccines" || key === "vaccinePackages" || key === "pets" || key === "invoices" || key === "services") {
          const objs = await prisma[clientProp].findMany({ select: { id: true }, orderBy: { id: "desc" }, take: items.length });
          const ids = objs.map((o) => Number(o.id)).reverse();
          insertedIds[key] = ids;
        } else if (key === "typeOfServices") {
          const objs = await prisma[clientProp].findMany({ select: { type: true } });
          insertedIds.typeOfServices = objs.map((o) => o.type);
        } else if (key === "packageInjections" || key === "singleInjections" || key === "medicalExaminations") {
          const objs = await prisma[clientProp].findMany({ select: { service_id: true }, orderBy: { service_id: "desc" }, take: items.length });
          const ids = objs.map((o) => Number(o.service_id)).reverse();
          insertedIds[key] = ids;
        }
      }
      process.stdout.write(`\x1b[32m✔️  ${prettyKey}: Inserted ${items.length}\x1b[0m\n`);
    } else {
      console.log(`[DRY RUN] Skipped DB insert for ${key}`);
    }

    summary.push({ model: key, generated: items.length, persisted: persist && !dryRun });
  }

  try {
    console.log("\n📊 SEED SUMMARY");
    console.table(summary);

    // Display warning summary
    const totalWarnings = Object.values(warningCounts).reduce((a, b) => a + b, 0);
    if (totalWarnings > 0) {
      console.log("\n⚠️  WARNING SUMMARY");
      console.log("─".repeat(50));
      if (warningCounts.insufficientStock > 0) {
        console.log(`  Insufficient Stock: ${warningCounts.insufficientStock}`);
      }
      if (warningCounts.duplicateConstraint > 0) {
        console.log(`  Duplicate Constraints: ${warningCounts.duplicateConstraint}`);
      }
      if (warningCounts.invalidForeignKey > 0) {
        console.log(`  Invalid Foreign Keys: ${warningCounts.invalidForeignKey}`);
      }
      if (warningCounts.skippedItems > 0) {
        console.log(`  Items Skipped: ${warningCounts.skippedItems}`);
      }
      if (warningCounts.other > 0) {
        console.log(`  Other Warnings: ${warningCounts.other}`);
      }
      console.log("─".repeat(50));
      console.log(`  Total Warnings: ${totalWarnings}`);
      console.log(`\n📄 Detailed warnings logged to: ${LOG_FILE}`);
    }

    console.log("✅ Seeding finished");
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
        console.log("🔌 Prisma disconnected");
      } catch (e) {
        logger.warn(`Error disconnecting Prisma: ${e.message || e}`, 'other');
      }
    }
  }
}

main().catch((err) => {
  console.error("\n💥 SEED FAILED");
  console.error(err);
  process.exit(1);
});