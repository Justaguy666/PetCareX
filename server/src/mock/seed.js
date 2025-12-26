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
      // Create one account per user and one account per employee.
      items = [];
      // User accounts
      for (const uid of insertedIds.users) {
        items.push(factory({ user_id: uid, account_type: 'KhachHang' }));
      }

      // Employee accounts (ensure roles align with employee.role)
      if (prisma && insertedIds.employees && insertedIds.employees.length > 0) {
        try {
          const emps = await prisma.employee.findMany({ where: { id: { in: insertedIds.employees } }, select: { id: true, role: true } });
          for (const e of emps) {
            // `e.role` is the Prisma enum key (e.g. 'BacSiThuY') which matches account_type keys
            items.push(factory({ employee_id: Number(e.id), account_type: e.role }));
          }
        } catch (e) {
          logger.warn(`accounts: could not load employees to assign accounts: ${e.message || e}`, 'other');
        }
      } else if (insertedIds.employees) {
        // If Prisma not available, still create employee accounts with random roles
        for (const eid of insertedIds.employees) {
          items.push(factory({ employee_id: eid }));
        }
      }
    } else if (key === "refreshTokens" && insertedIds.accounts) {
      items = insertedIds.accounts.map((aid) => factory({ account_id: aid }));
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

      // Try to use actual mobilizations so created_by/branch and created_at align
      // with a mobilization period. If mobilizations exist in DB, pick one per
      // invoice and set invoice.created_at within that mobilization's date range.
      let mobilizations = [];
      if (prisma) {
        try {
          const mags = await prisma.mobilization.findMany({
            select: { employee_id: true, branch_id: true, start_date: true, end_date: true },
            take: 100000
          });
          const now = new Date();
          // Only keep mobilizations that are active at `now` (start_date <= now <= end_date OR end_date IS NULL)
          mobilizations = mags
            .map((m) => ({
              employee_id: Number(m.employee_id),
              branch_id: Number(m.branch_id),
              start_date: m.start_date ? new Date(m.start_date) : new Date("2023-01-01"),
              end_date: m.end_date ? new Date(m.end_date) : null,
            }))
            .filter((m) => m.start_date <= now && (m.end_date === null || m.end_date >= now));
        } catch (e) { }
      }

      items = items.map((i) => {
        const copy = { ...i, customer_id: insertedIds.users[Math.floor(Math.random() * insertedIds.users.length)] };
        if (mobilizations.length > 0) {
          const m = mobilizations[Math.floor(Math.random() * mobilizations.length)];
          // Use nested relation connect objects so Prisma accepts the create payload
          copy.creator = { connect: { id: m.employee_id } };
          copy.branch = { connect: { id: m.branch_id } };
        } else {
          // No active mobilizations found; to avoid DB trigger failures do not set creator/branch
          logger.warn(`invoices: No active mobilizations found; creating invoice without creator/branch`, 'skippedItems');
        }
        // Always set customer via relation connect (customer should exist)
        copy.customer = { connect: { id: copy.customer_id } };
        // Remove scalar FK fields to avoid Prisma validation issues
        delete copy.created_by;
        delete copy.branch_id;
        delete copy.customer_id;
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
      // Generate `count` mobilizations while ensuring no overlap per employee.
      // We allow multiple mobilizations per employee by tracking the next available
      // start date for each employee and scheduling subsequent mobilizations after
      // the previous mobilization's end date.
      items = [];
      const nextAvailable = {};
      const baseDate = new Date("2023-01-01");
      for (const e of insertedIds.employees) {
        nextAvailable[e] = new Date(baseDate);
      }

      const now = new Date();
      const activeProb = 0.25; // fraction of mobilizations that remain active (end_date = null)

      // Pool of employees eligible for new mobilizations (exclude those who already
      // received an active (= end_date null) mobilization to avoid exclusion conflicts)
      const employeesPool = insertedIds.employees.slice();

      for (let i = 0; i < count; i++) {
        if (employeesPool.length === 0) {
          logger.warn(`mobilizations: No eligible employees left to assign (created ${i} of ${count})`, 'skippedItems');
          break;
        }
        const eid = employeesPool[i % employeesPool.length];
        const start = new Date(nextAvailable[eid]);

        // Add a small random gap (0-14 days) before the mobilization starts
        const gapDays = Math.floor(Math.random() * 15);
        start.setDate(start.getDate() + gapDays);

        let end = null;
        // Decide if this mobilization should be active now
        if (Math.random() < activeProb) {
          // active: set end_date = null
          end = null;
        } else {
          // Random duration between 7 and 365 days (some will extend into the future)
          const duration = Math.floor(Math.random() * 359) + 7;
          end = new Date(start);
          end.setDate(end.getDate() + duration);
        }

        items.push({
          employee_id: eid,
          branch_id: insertedIds.branches[Math.floor(Math.random() * insertedIds.branches.length)],
          start_date: start.toISOString(),
          end_date: end ? end.toISOString() : null,
        });

        // Next mobilization for this employee can start the day after this end (or after now if active)
        const next = end ? new Date(end) : new Date(now);
        next.setDate(next.getDate() + 1);
        nextAvailable[eid] = next;

        // If this mobilization is active (end_date === null), remove the employee
        // from the pool to avoid creating any further mobilizations for them.
        if (!end) {
          const idx = employeesPool.indexOf(eid);
          if (idx !== -1) employeesPool.splice(idx, 1);
        }
      }
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

    let insertedCount = 0;
    if (persist && prisma && !dryRun) {
      const batchSize = (size === "small") ? 500 : (size === "medium") ? 1000 : 5000;

      for (let start = 0; start < items.length; start += batchSize) {
        const batch = items.slice(start, start + batchSize);
        const isLast = start + batchSize >= items.length;
        const insertedThis = await persistToDb(prisma, key, batch, !isLast) || 0;
        insertedCount += insertedThis;
        printProgressBar(Math.min(insertedCount, items.length), items.length, `   Inserting ${prettyKey}`);
      }
      process.stdout.write('\n');

      const clientProp = PRISMA_CLIENT_MAP[key];
        if (clientProp && prisma[clientProp]) {
        if (key === "users" || key === "employees" || key === "branches" || key === "products" || key === "medicines" || key === "vaccines" || key === "vaccinePackages" || key === "pets" || key === "invoices" || key === "services" || key === "accounts") {
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
        process.stdout.write(`\x1b[32m✔️  ${prettyKey}: Inserted ${insertedCount}\x1b[0m\n`);
    } else {
      console.log(`[DRY RUN] Skipped DB insert for ${key}`);
    }

    summary.push({ model: key, generated: items.length, inserted: insertedCount, persisted: persist && !dryRun });
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