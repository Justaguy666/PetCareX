// Progress bar helper
function printProgressBar(current, total, prefix = '', length = 30) {
  const percent = Math.round((current / total) * 100);
  const filledLength = Math.round((length * current) / total);
  const bar = '█'.repeat(filledLength) + '-'.repeat(length - filledLength);
  process.stdout.write(`\r${prefix} [${bar}] ${percent}% (${current}/${total})`);
  if (current === total) process.stdout.write(' \n');
}
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

/* FACTORY IMPORTS */
import createUser from "./factories/user.factory.js";
import createPet from "./factories/pet.factory.js";
import createBranch from "./factories/branch.factory.js";
import createEmployee from "./factories/employee.factory.js";
import createAccount from "./factories/account.factory.js";
import createRefreshToken from "./factories/refresh-token.factory.js";
import createAppointment from "./factories/appointment.factory.js";
import createServiceRecord from "./factories/service.factory.js";
import createInvoice from "./factories/invoice.factory.js";
import createProduct from "./factories/product.factory.js";
import createProductInventory from "./factories/product-inventory.factory.js";
import createMedicine from "./factories/medicine.factory.js";
import createMedicineInventory from "./factories/medicine-inventory.factory.js";
import createPrescription from "./factories/prescription.factory.js";
import createVaccine from "./factories/vaccine.factory.js";
import createVaccineInventory from "./factories/vaccine-inventory.factory.js";
import createVaccineUse from "./factories/vaccine-use.factory.js";
import createVaccinePackage from "./factories/vaccine-package.factory.js";
import createVaccinePackageUse from "./factories/vaccine-package-use.factory.js";
import createPackageInventory from "./factories/package-inventory.factory.js";
import createPackageInjection from "./factories/package-injection.factory.js";
import createIncludeVaccine from "./factories/include-vaccine.factory.js";
import createPromotion from "./factories/promotion.factory.js";
import createPromotionFor from "./factories/promotion-for.factory.js";
import createApplyPromotion from "./factories/apply-promotion.factory.js";
import createMobilization from "./factories/mobilization.factory.js";
import createSellProduct from "./factories/sell-product.factory.js";
import createTypeOfService from "./factories/type-of-service.factory.js";
import createSingleInjection from "./factories/single-injection.factory.js";
import createMedicalExamination from "./factories/medical-examination.factory.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "seed-output");

const DEFAULT_COUNTS = {
  users: 1, pets: 1, branches: 1, employees: 1, accounts: 1,
  refreshTokens: 1, appointments: 1, services: 1, invoices: 1,
  products: 1, productInventories: 1, medicines: 1, medicineInventories: 1,
  prescriptions: 1, vaccines: 1, vaccineInventories: 1, vaccineUses: 1,
  vaccinePackages: 1, vaccinePackageUses: 1, packageInventories: 1,
};

const FACTORIES = {
  users: createUser, pets: createPet, branches: createBranch,
  employees: createEmployee, accounts: createAccount, refreshTokens: createRefreshToken,
  appointments: createAppointment, services: createServiceRecord, invoices: createInvoice,
  products: createProduct, productInventories: createProductInventory, medicines: createMedicine,
  medicineInventories: createMedicineInventory, prescriptions: createPrescription, vaccines: createVaccine,
  vaccineInventories: createVaccineInventory, vaccineUses: createVaccineUse, vaccinePackages: createVaccinePackage,
  vaccinePackageUses: createVaccinePackageUse, packageInventories: createPackageInventory,
  packageInjections: createPackageInjection, includeVaccines: createIncludeVaccine,
  promotions: createPromotion, promotionFors: createPromotionFor, applyPromotions: createApplyPromotion,
  mobilizations: createMobilization, sellProducts: createSellProduct, typeOfServices: createTypeOfService,
  singleInjections: createSingleInjection, medicalExaminations: createMedicalExamination,
};

const PRISMA_CLIENT_MAP = {
  users: "user", pets: "pet", branches: "branch", employees: "employee", accounts: "account",
  refreshTokens: "refreshToken", appointments: "appointment", services: "service", invoices: "invoice",
  products: "product", productInventories: "productInventory", medicines: "medicine",
  medicineInventories: "medicineInventory", prescriptions: "prescription", vaccines: "vaccine",
  vaccineInventories: "vaccineInventory", vaccineUses: "vaccineUse", vaccinePackages: "vaccinePackage",
  vaccinePackageUses: "vaccinePackageUse", packageInventories: "packageInventory",
  packageInjections: "packageInjection", includeVaccines: "includeVaccine", promotions: "promotion",
  promotionFors: "promotionFor", applyPromotions: "applyPromotion", mobilizations: "mobilization",
  sellProducts: "sellProduct", typeOfServices: "typeOfService", singleInjections: "singleInjection",
  medicalExaminations: "medicalExamination",
};

const MODEL_ENUM_FIELDS = {
  users: { gender: "Gender", membership_level: "MembershipLevel" },
  pets: { gender: "PetGender", health_status: "HealthStatus" },
  employees: { gender: "Gender", role: "EmployeeRole" },
  invoices: { payment_method: "PaymentMethod" },
  typeOfServices: { type: "ServiceType" },
  services: { type_of_service: "ServiceType" },
  promotionFors: { service_type: "ServiceType" },
  appointments: { service_type: "AppointmentServiceType", status: "Status" },
  products: { product_type: "ProductType" },
  promotions: { apply_for: "PromotionForLevel" },
};

async function ensureOutDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function parseConfigFile() {
  try {
    const raw = await fs.readFile(path.join(__dirname, "seed.config.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function generateItems(factory, count) {
  return Promise.all(Array.from({ length: count }, () => Promise.resolve(factory())));
}

async function buildEnumMaps() {
  const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
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

async function persistToDb(prisma, modelKey, items, silent = false) {
  const clientProp = PRISMA_CLIENT_MAP[modelKey];
  if (!clientProp || !prisma[clientProp]) {
    throw new Error(`❌ Prisma client missing for ${modelKey}`);
  }



  const client = prisma[clientProp];

  try {
    const enumFields = MODEL_ENUM_FIELDS[modelKey] || {};
    if (Object.keys(enumFields).length > 0) {
      if (!prisma._enumMaps) prisma._enumMaps = await buildEnumMaps();
      const maps = prisma._enumMaps;
      items = items.map((it) => {
        const copy = { ...it };
        for (const [field, enumName] of Object.entries(enumFields)) {
          const val = copy[field];
          if (val == null) continue;
          const map = maps[enumName];
          if (map && map[val] !== undefined) copy[field] = map[val];
        }
        return copy;
      });
    }

    // Normalize ratings - AFTER enum mapping
    if (modelKey === "invoices" && !silent) {
      console.log("🔍 Invoice - removing rating fields to avoid constraint issues");
    }
    if (modelKey === "invoices") {
      items = items.map((it) => {
        const { sale_attitude_rating, overall_satisfaction_rating, ...copy } = it;
        return copy;
      });
    }

    // Normalize promotionFors discount_percentage to [5, 15]
    if (modelKey === "promotionFors" && !silent) {
      console.log("🔍 PromotionFors - normalizing discount_percentage to [5, 15]");
    }
    if (modelKey === "promotionFors") {
      items = items.map((it) => {
        let discount = Number(it.discount_percentage) || 10;
        discount = Math.max(5, Math.min(15, Math.round(discount)));
        return { ...it, discount_percentage: discount };
      });
    }

    // Ensure singleInjections & packageInjections & medicalExaminations have valid vet doctor_id
    if (["singleInjections", "packageInjections", "medicalExaminations"].includes(modelKey) && !silent) {
      console.log(`🔍 ${modelKey} - validating doctor_id is a veterinarian`);
      let validVets = [];
      try {
        const vets = await prisma.employee.findMany({ where: { role: "BacSiThuY" }, select: { id: true } });
        validVets = vets.map((v) => Number(v.id)).filter(Boolean);
      } catch (e) {
        console.warn(`⚠️ Could not load veterinarians for ${modelKey}`);
      }

      if (validVets.length === 0) {
        throw new Error(`❌ No veterinarians available for ${modelKey}`);
      }

      items = items.map((it) => {
        const doctorId = Number(it.doctor_id);
        // If doctor_id is not in valid vets list, replace with random vet
        if (!validVets.includes(doctorId)) {
          const newDoctorId = validVets[Math.floor(Math.random() * validVets.length)];
          console.warn(`⚠️ Replacing invalid doctor_id ${doctorId} with vet ${newDoctorId}`);
          return { ...it, doctor_id: newDoctorId };
        }
        return it;
      });
    }

    // Validate foreign keys for promotionFors + ensure unique (promotion_id, service_type)
    if (modelKey === "promotionFors" && !silent) {
      console.log(`🔍 ${modelKey} - validating foreign keys and uniqueness`);
      let validPromotions = [];
      let validServiceTypes = [];
      
      try {
        const promos = await prisma.promotion.findMany({ select: { id: true } });
        validPromotions = promos.map((p) => Number(p.id)).filter(Boolean);
      } catch (e) {
        console.warn(`⚠️ Could not load promotions`);
      }

      try {
        const services = await prisma.typeOfService.findMany({ select: { type: true } });
        validServiceTypes = services.map((s) => s.type).filter(Boolean);
      } catch (e) {
        console.warn(`⚠️ Could not load service types`);
      }

      if (validPromotions.length === 0 || validServiceTypes.length === 0) {
        throw new Error(`❌ Missing promotions (${validPromotions.length}) or service types (${validServiceTypes.length})`);
      }

      // Load existing (promotion_id, service_type) pairs
      let existingPairs = new Set();
      try {
        const existing = await prisma.promotionFor.findMany({
          select: { promotion_id: true, service_type: true }
        });
        for (const pair of existing) {
          existingPairs.add(`${pair.promotion_id}|${pair.service_type}`);
        }
      } catch (e) {
        console.warn(`⚠️ Could not load existing promotionFor pairs`);
      }

      // Filter and fix items to ensure uniqueness
      const validItems = [];
      for (const it of items) {
        let promotionId = Number(it.promotion_id);
        let serviceType = it.service_type;
        
        // Fix invalid promotion_id
        if (!validPromotions.includes(promotionId)) {
          promotionId = validPromotions[Math.floor(Math.random() * validPromotions.length)];
          console.warn(`⚠️ Replacing invalid promotion_id with ${promotionId}`);
        }
        
        // Fix invalid service_type
        if (!validServiceTypes.includes(serviceType)) {
          serviceType = validServiceTypes[Math.floor(Math.random() * validServiceTypes.length)];
          console.warn(`⚠️ Replacing invalid service_type with ${serviceType}`);
        }
        
        // Find unique pair
        let attempts = 0;
        const maxAttempts = validPromotions.length * validServiceTypes.length;
        while (existingPairs.has(`${promotionId}|${serviceType}`) && attempts < maxAttempts) {
          // Try next promotion
          const idx = validPromotions.indexOf(promotionId);
          promotionId = validPromotions[(idx + 1) % validPromotions.length];
          attempts++;
        }
        
        const pair = `${promotionId}|${serviceType}`;
        if (!existingPairs.has(pair)) {
          existingPairs.add(pair);
          validItems.push({
            ...it,
            promotion_id: promotionId,
            service_type: serviceType
          });
        } else {
          console.warn(`⚠️ Skipping promotionFor - could not find unique (promotion_id, service_type) pair`);
        }
      }
      
      items = validItems;
      
      if (items.length === 0) {
        console.warn(`⚠️ No valid promotionFors after uniqueness check`);
      }
    }

    // Validate foreign keys for applyPromotions
    if (modelKey === "applyPromotions" && !silent) {
      console.log(`🔍 ${modelKey} - validating foreign keys (promotion_id, branch_id)`);
      let validPromotions = [];
      let validBranches = [];
      
      try {
        const promos = await prisma.promotion.findMany({ select: { id: true } });
        validPromotions = promos.map((p) => Number(p.id)).filter(Boolean);
      } catch (e) {
        console.warn(`⚠️ Could not load promotions`);
      }

      try {
        const branches = await prisma.branch.findMany({ select: { id: true } });
        validBranches = branches.map((b) => Number(b.id)).filter(Boolean);
      } catch (e) {
        console.warn(`⚠️ Could not load branches`);
      }

      if (validPromotions.length === 0 || validBranches.length === 0) {
        throw new Error(`❌ Missing promotions (${validPromotions.length}) or branches (${validBranches.length})`);
      }

      items = items.map((it) => {
        let promotionId = Number(it.promotion_id);
        let branchId = Number(it.branch_id);
        
        // Fix invalid promotion_id
        if (!validPromotions.includes(promotionId)) {
          promotionId = validPromotions[Math.floor(Math.random() * validPromotions.length)];
          console.warn(`⚠️ Replacing invalid promotion_id with ${promotionId}`);
        }
        
        // Fix invalid branch_id
        if (!validBranches.includes(branchId)) {
          branchId = validBranches[Math.floor(Math.random() * validBranches.length)];
          console.warn(`⚠️ Replacing invalid branch_id with ${branchId}`);
        }
        
        return {
          ...it,
          promotion_id: promotionId,
          branch_id: branchId
        };
      });
    }

    // Validate sellProducts - ensure product exists in branch inventory
    if (modelKey === "sellProducts" && !silent) {
      console.log(`🔍 ${modelKey} - validating product inventory`);
      let productInventory = new Map(); // key: "productId|branchId", value: quantity
      
      try {
        const inv = await prisma.productInventory.findMany({
          select: { product_id: true, branch_id: true, quantity: true }
        });
        for (const record of inv) {
          const key = `${record.product_id}|${record.branch_id}`;
          productInventory.set(key, record.quantity);
        }
      } catch (e) {
        console.warn(`⚠️ Could not load product inventory`);
      }

      // Filter items to only those with valid inventory
      const validItems = [];
      for (const it of items) {
        const productId = Number(it.product_id);
        const key = `${productId}|${it.branch_id}`;
        const quantity = productInventory.get(key) || 0;
        
        if (quantity > 0) {
          validItems.push(it);
        } else {
          console.warn(`⚠️ Skipping sellProduct - product ${productId} not in inventory for branch ${it.branch_id}`);
        }
      }
      
      items = validItems;
      
      if (items.length === 0) {
        console.warn(`⚠️ No valid sellProducts after inventory check`);
      }
    }

    // Validate applyPromotions - ensure no time overlap for same promotion at same branch
    if (modelKey === "applyPromotions" && !silent) {
      console.log(`🔍 ${modelKey} - validating time periods don't overlap`);
      let existingApplies = [];
      
      try {
        existingApplies = await prisma.applyPromotion.findMany({
          select: { promotion_id: true, branch_id: true, start_date: true, end_date: true }
        });
      } catch (e) {
        console.warn(`⚠️ Could not load existing applyPromotions`);
      }

      // Filter items to avoid overlapping time periods
      const validItems = [];
      for (const it of items) {
        const promotionId = Number(it.promotion_id);
        const branchId = Number(it.branch_id);
        const startDate = new Date(it.start_date);
        const endDate = it.end_date ? new Date(it.end_date) : null;
        
        // Check if this (promotion_id, branch_id) combo already has an active period
        let hasConflict = false;
        for (const existing of existingApplies) {
          if (existing.promotion_id === promotionId && existing.branch_id === branchId) {
            const existStart = new Date(existing.start_date);
            const existEnd = existing.end_date ? new Date(existing.end_date) : null;
            
            // Check for time overlap
            const overlaps = !(endDate && endDate < existStart) && !(existEnd && existEnd < startDate);
            if (overlaps) {
              hasConflict = true;
              console.warn(`⚠️ Skipping applyPromotion - time period overlaps with existing for promo ${promotionId} at branch ${branchId}`);
              break;
            }
          }
        }
        
        if (!hasConflict) {
          validItems.push(it);
          // Add to existing list to prevent duplicates in this batch
          existingApplies.push({
            promotion_id: promotionId,
            branch_id: branchId,
            start_date: startDate,
            end_date: endDate
          });
        }
      }
      
      items = validItems;
      
      if (items.length === 0) {
        console.warn(`⚠️ No valid applyPromotions after overlap check`);
      }
    }

    if (modelKey === "appointments" && !silent) {
      console.log("🔍 Appointments sample (first 3):");
      items.slice(0, 3).forEach((it, i) => {
        const d = new Date(it.appointment_time);
        console.log(`  #${i}: local=${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} utc=${d.getUTCHours()}:${String(d.getUTCMinutes()).padStart(2, '0')}`);
      });
    }


    if (typeof client.createMany === "function") {
      try {
        const res = await client.createMany({ data: items });
        if (!silent) console.log(`✅ ${modelKey}: inserted ${res.count}`);
      } catch (createManyErr) {
        if (!silent) {
          console.error(`⚠️ createMany failed for ${modelKey}`);
          console.error("🔍 Falling back to individual inserts...");
        }
        for (let idx = 0; idx < items.length; idx++) {
          try {
            let payload = { ...items[idx] };
            if (modelKey !== "typeOfServices") {
              delete payload.created_at;
              delete payload.updated_at;
            }
            if (modelKey === "typeOfServices") {
              await client.upsert({
                where: { type: payload.type },
                update: payload,
                create: payload,
              });
            } else {
              await client.create({ data: payload });
            }
          } catch (singleErr) {
            if (!silent) {
              console.error(`❌ Failed at index ${idx}`);
              if (modelKey === "promotionFors") {
                console.error("Item:", {
                  discount_percentage: items[idx].discount_percentage,
                  promotion_id: items[idx].promotion_id,
                  service_type: items[idx].service_type,
                });
              }
              console.error("Error:", singleErr.message);
            }
            if (!silent) throw singleErr;
          }
        }
        if (!silent) console.log(`✅ ${modelKey}: all individual inserts succeeded`);
      }
    } else {
      for (const it of items) {
        let payload = { ...it };
        if (modelKey !== "typeOfServices") {
          delete payload.created_at;
          delete payload.updated_at;
        }
        if (modelKey === "typeOfServices") {
          await client.upsert({
            where: { type: payload.type },
            update: payload,
            create: payload,
          });
        } else {
          await client.create({ data: payload });
        }
      }
      if (!silent) console.log(`✅ ${modelKey}: inserted ${items.length}`);
    }

    const dbCount = await client.count();
    if (dbCount < items.length) {
      throw new Error(`❌ ${modelKey}: count mismatch (inserted ${items.length}, DB has ${dbCount})`);
    }
  } catch (err) {
    console.error(`❌ Persist failed for ${modelKey}`);
    throw err;
  }
}

async function main() {
  const config = await parseConfigFile();
  if (!config) { console.error("❌ Missing seed.config.json"); process.exit(1); }

  const { counts = {}, order = Object.keys(FACTORIES), persist = false, dryRun = false } = config;

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
        } catch (e) {}
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
    } else if (key === "singleInjections" && insertedIds.pets && insertedIds.employees) {
      items = await generateItems(factory, count);
      let vids = null;
      let ssvids = null;
      if (prisma) {
        try {
          const ds = await prisma.employee.findMany({ where: { role: "BacSiThuY" }, select: { id: true } });
          vids = ds.map((d) => Number(d.id)).filter(Boolean);
        } catch (e) {}
        try {
          const ss = await prisma.service.findMany({ where: { type_of_service: "TiemMuiLe" }, select: { id: true } });
          ssvids = ss.map((s) => Number(s.id)).filter(Boolean);
        } catch (e) {}
      }

      // Build service pool, shuffled to avoid duplicates
      let servicePool = ssvids?.length > 0 ? [...ssvids] : insertedIds.services ? [...insertedIds.services] : [];
      
      // Shuffle the pool
      for (let i = servicePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [servicePool[i], servicePool[j]] = [servicePool[j], servicePool[i]];
      }

      // Cap count to available services (unique constraint)
      if (servicePool.length > 0 && servicePool.length < items.length) {
        console.warn(`⚠️ Capping ${key} from ${items.length} to ${servicePool.length} (unique service_id constraint)`);
        items = items.slice(0, servicePool.length);
      }

      items = items.map((i, idx) => ({
        ...i,
        pet_id: insertedIds.pets[Math.floor(Math.random() * insertedIds.pets.length)],
        service_id: servicePool.length > 0 ? servicePool[idx] : i.service_id,
        doctor_id: vids?.length > 0 ? vids[Math.floor(Math.random() * vids.length)] : insertedIds.employees[Math.floor(Math.random() * insertedIds.employees.length)],
      }));
    } else if (key === "packageInjections" && insertedIds.pets && insertedIds.employees) {
      items = await generateItems(factory, count);
      let vids = null;
      let psvids = null;
      if (prisma) {
        try {
          const ds = await prisma.employee.findMany({ where: { role: "BacSiThuY" }, select: { id: true } });
          vids = ds.map((d) => Number(d.id)).filter(Boolean);
        } catch (e) {}
        try {
          const ps = await prisma.service.findMany({ where: { type_of_service: "TiemTheoGoi" }, select: { id: true } });
          psvids = ps.map((s) => Number(s.id)).filter(Boolean);
        } catch (e) {}
      }
      
      // MUST have vets - skip if none available
      if (!vids || vids.length === 0) {
        console.warn(`⚠️ No veterinarians available; skipping ${key}`);
        items = [];
      } else {
        let spool = psvids?.length > 0 ? [...psvids] : insertedIds.services ? [...insertedIds.services] : [];
        for (let i = spool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [spool[i], spool[j]] = [spool[j], spool[i]];
        }
        if (spool.length > 0 && spool.length < items.length) {
          console.warn(`⚠️ Capping ${key} from ${items.length} to ${spool.length}`);
          items = items.slice(0, spool.length);
        }
        items = items.map((i) => ({
          ...i,
          pet_id: insertedIds.pets[Math.floor(Math.random() * insertedIds.pets.length)],
          service_id: spool.length > 0 ? spool.pop() : i.service_id,
          doctor_id: vids[Math.floor(Math.random() * vids.length)], // MUST be vet
        }));
      }
    } else if (key === "medicalExaminations" && insertedIds.pets && insertedIds.employees) {
      items = await generateItems(factory, count);
      let vids = null;
      let msvids = null;
      if (prisma) {
        try {
          const ds = await prisma.employee.findMany({ where: { role: "BacSiThuY" }, select: { id: true } });
          vids = ds.map((d) => Number(d.id)).filter(Boolean);
        } catch (e) {
          console.warn(`⚠️ Could not load veterinarians for medicalExaminations`);
        }
        try {
          const ms = await prisma.service.findMany({ where: { type_of_service: "KhamBenh" }, select: { id: true } });
          msvids = ms.map((s) => Number(s.id)).filter(Boolean);
        } catch (e) {
          console.warn(`⚠️ Could not load KhamBenh services`);
        }
      }

      // MUST have vets - skip if none available
      if (!vids || vids.length === 0) {
        console.warn(`⚠️ No veterinarians available; skipping ${key}`);
        items = [];
      } else {
        // Build service pool, shuffled to avoid duplicates
        let servicePool = msvids?.length > 0 ? [...msvids] : insertedIds.services ? [...insertedIds.services] : [];
        
        // Shuffle the pool
        for (let i = servicePool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [servicePool[i], servicePool[j]] = [servicePool[j], servicePool[i]];
        }

        // Cap count to available services (unique constraint)
        if (servicePool.length > 0 && servicePool.length < items.length) {
          console.warn(`⚠️ Capping ${key} from ${items.length} to ${servicePool.length} (unique service_id constraint)`);
          items = items.slice(0, servicePool.length);
        }

        items = items.map((i, idx) => ({
          ...i,
          pet_id: insertedIds.pets[Math.floor(Math.random() * insertedIds.pets.length)],
          service_id: servicePool.length > 0 ? servicePool[idx] : i.service_id,
          doctor_id: vids[Math.floor(Math.random() * vids.length)], // MUST be vet, not random employee
        }));
      }
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
        console.warn(`⚠️ No packageInjections available; skipping ${key}`);
        items = [];
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
    } else if (key === "appointments" && insertedIds.pets && insertedIds.users && insertedIds.branches && insertedIds.employees) {
      let emap = null;
      let vids = null;
      if (prisma) {
        const now = new Date();
        try {
          const active = await prisma.mobilization.findMany({
            where: { start_date: { lte: now }, OR: [{ end_date: null }, { end_date: { gte: now } }] },
            select: { employee_id: true, branch_id: true },
          });
          emap = new Map();
          for (const a of active) emap.set(Number(a.employee_id), Number(a.branch_id));
        } catch (e) {}
        try {
          const vs = await prisma.employee.findMany({ where: { role: "BacSiThuY" }, select: { id: true } });
          vids = vs.map((v) => Number(v.id)).filter(Boolean);
        } catch (e) {}
      }

      // MUST have veterinarians - skip if none available
      if (!vids || vids.length === 0) {
        console.warn(`⚠️ No veterinarians available; skipping ${key}`);
        items = [];
      } else {
        // Cap appointments to ~2 per pet (reasonable for vet scheduling)
        const maxAppointments = Math.max(insertedIds.pets.length * 2, count);
        const cappedCount = Math.min(count, maxAppointments);
        
        items = await generateItems(factory, cappedCount);

        let pbyowner = null;
        if (prisma) {
          try {
            const ps = await prisma.pet.findMany({ select: { id: true, owner_id: true } });
            pbyowner = new Map();
            for (const p of ps) {
              const oid = Number(p.owner_id);
              if (!pbyowner.has(oid)) pbyowner.set(oid, []);
              pbyowner.get(oid).push(Number(p.id));
            }
          } catch (e) {}
        }

        // Load EXISTING appointments from database
        let existingPetAppointments = new Map();
        if (prisma) {
          try {
            const existing = await prisma.appointment.findMany({
              select: { pet_id: true, appointment_time: true }
            });
            for (const apt of existing) {
              const pid = Number(apt.pet_id);
              if (!existingPetAppointments.has(pid)) existingPetAppointments.set(pid, []);
              existingPetAppointments.get(pid).push(new Date(apt.appointment_time).getTime());
            }
          } catch (e) {
            console.warn(`⚠️ Could not load existing appointments`);
          }
        }

        // Track pet appointment counts to balance load
        const petAppointmentCount = new Map();
        for (const [pid, times] of existingPetAppointments) {
          petAppointmentCount.set(pid, times.length);
        }

        const usedSlots = new Set();
        const VN_TZ = 7 * 60;
        const now = new Date();

        function makeVietnamDT(base, daysAhead, localHour, localMin) {
          const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + daysAhead, localHour, localMin, 0, 0);
          const offset = d.getTimezoneOffset() + VN_TZ;
          d.setMinutes(d.getMinutes() + offset);
          return d;
        }

        items = items.map((item, itemIdx) => {
          let oid;
          if (pbyowner?.size > 0) {
            const okeys = Array.from(pbyowner.keys());
            oid = okeys[Math.floor(Math.random() * okeys.length)];
          } else {
            oid = insertedIds.users[Math.floor(Math.random() * insertedIds.users.length)];
          }
          
          const pcand = pbyowner?.get(oid);
          let pid;
          
          // Distribute appointments across pets to avoid overloading
          const petList = pcand?.length > 0 ? pcand : insertedIds.pets;
          const sortedByLoad = [...petList].sort((a, b) => 
            (petAppointmentCount.get(a) || 0) - (petAppointmentCount.get(b) || 0)
          );
          pid = sortedByLoad[0]; // Pick pet with fewest appointments
          
          let bid = insertedIds.branches[Math.floor(Math.random() * insertedIds.branches.length)];
          let did = null;

          if (emap && vids?.length > 0) {
            const avets = vids.filter((v) => emap.has(v));
            if (avets.length > 0) {
              did = avets[Math.floor(Math.random() * avets.length)];
              bid = emap.get(did);
            } else {
              did = vids[Math.floor(Math.random() * vids.length)];
              bid = insertedIds.branches[Math.floor(Math.random() * insertedIds.branches.length)];
            }
          } else {
            did = vids[Math.floor(Math.random() * vids.length)];
            bid = insertedIds.branches[Math.floor(Math.random() * insertedIds.branches.length)];
          }

          const out = { ...item, pet_id: pid, owner_id: oid, branch_id: bid, doctor_id: did };

          const cancelledSet = new Set(["HuyBo", "Hủy bỏ", "Huy bỏ", "Huy_Bo", "Huy-Bo"]);
          const isCancelled = out.status != null && (cancelledSet.has(out.status) || String(out.status).toLowerCase().includes("huy"));

          if (isCancelled) {
            if (!out.cancelled_reason) out.cancelled_reason = "Seed: canceled";
          } else {
            out.cancelled_reason = null;
          }

          try {
            let dt;
            let found = false;

            // Try to find a time slot for this specific pet
            for (let attempt = 0; attempt < 150; attempt++) {
              const daysAhead = Math.floor(Math.random() * 90) + 1; // Spread across 90 days
              const localHour = Math.floor(Math.random() * 14) + 8;
              const localMin = Math.floor(Math.random() * 12) * 5;
              dt = makeVietnamDT(now, daysAhead, localHour, localMin);
              
              if (dt.getTime() <= now.getTime()) continue;
              
              const iso = dt.toISOString();
              const key = `${did}|${bid}|${iso}`;
              
              // Check existing pet appointments
              const petTimes = existingPetAppointments.get(pid) || [];
              const dtTime = dt.getTime();
              
              let hasConflict = false;
              for (const existingTime of petTimes) {
                // Allow same pet different times only if far apart (4 hours minimum)
                const diff = Math.abs(dtTime - existingTime);
                if (diff < 4 * 60 * 60 * 1000) { // 4 hour window
                  hasConflict = true;
                  break;
                }
              }
              
              if (!hasConflict && !usedSlots.has(key)) {
                usedSlots.add(key);
                petAppointmentCount.set(pid, (petAppointmentCount.get(pid) || 0) + 1);
                existingPetAppointments.get(pid)?.push(dtTime) || existingPetAppointments.set(pid, [dtTime]);
                found = true;
                break;
              }
            }

            if (!found) {
              // Fallback: far future guaranteed unique time
              dt = makeVietnamDT(now, 100 + itemIdx, 8 + (itemIdx % 8), 0);
            }

            const iso = dt.toISOString();
            const chk = new Date(iso);
            const offset = chk.getTimezoneOffset() + VN_TZ;
            const checkHour = chk.getHours() + Math.round(offset / 60);

            if (checkHour < 8 || checkHour > 21) {
              dt = makeVietnamDT(now, 1, 8, 0);
            }

            out.appointment_time = dt.toISOString();
          } catch (e) {
            console.error("[APPT-ERROR]", e.message);
            const fallback = new Date(now);
            fallback.setDate(fallback.getDate() + 1 + itemIdx);
            fallback.setHours(8 + (itemIdx % 8), 0, 0, 0);
            const offset2 = fallback.getTimezoneOffset() + VN_TZ;
            fallback.setMinutes(fallback.getMinutes() + offset2);
            out.appointment_time = fallback.toISOString();
          }

          return out;
        });

        if (cappedCount < count) {
          console.warn(`⚠️ Capping ${key} from ${count} to ${cappedCount} (limited pets available)`);
        }
      }
    } else if (key === "prescriptions" && insertedIds.medicalExaminations && insertedIds.medicines) {
      // Query medical examinations with their related service/invoice/branch info
      let examsByBranch = {};
      if (prisma) {
        try {
          const exams = await prisma.medicalExamination.findMany({
            select: { 
              id: true, 
              service_id: true,
              service: { select: { invoice_id: true } }
            },
            take: count,
          });
          
          // For each exam, try to find its branch via the invoice
          for (const exam of exams) {
            let branchId = null;
            if (exam.service?.invoice_id) {
              try {
                const inv = await prisma.invoice.findUnique({
                  where: { id: exam.service.invoice_id },
                  select: { branch_id: true }
                });
                branchId = inv?.branch_id;
              } catch (e) {}
            }
            
            const bid = branchId || 'unknown';
            if (!examsByBranch[bid]) examsByBranch[bid] = [];
            examsByBranch[bid].push(exam.id);
          }
        } catch (e) {
          console.warn(`⚠️ Could not load exam-branch mapping`);
        }
      }

      // Query medicine inventory by branch
      let medicineByBranch = {};
      if (prisma) {
        try {
          const inv = await prisma.medicineInventory.findMany({
            where: { quantity: { gt: 0 } },
            select: { medicine_id: true, branch_id: true, quantity: true }
          });
          
          for (const record of inv) {
            const bid = record.branch_id;
            if (!medicineByBranch[bid]) medicineByBranch[bid] = [];
            medicineByBranch[bid].push(record.medicine_id);
          }
        } catch (e) {
          console.warn(`⚠️ Could not load medicine inventory by branch`);
        }
      }

      items = await generateItems(factory, count);

      // Match exams to medicines based on shared branch
      const validPrescriptions = [];
      for (const item of items) {
        let foundMatch = false;
        
        // Try each branch that has both exams and medicine inventory
        for (const branch of Object.keys(examsByBranch)) {
          const branchExams = examsByBranch[branch];
          const branchMeds = medicineByBranch[branch];
          
          if (branchExams?.length > 0 && branchMeds?.length > 0) {
            const meid = branchExams[Math.floor(Math.random() * branchExams.length)];
            const mid = branchMeds[Math.floor(Math.random() * branchMeds.length)];
            
            validPrescriptions.push({
              ...item,
              medical_examination_id: meid,
              medicine_id: mid,
            });
            foundMatch = true;
            break;
          }
        }
        
        // If no match found, skip this prescription
        if (!foundMatch) {
          console.warn(`⚠️ Skipping prescription - no branch with both exams and medicine inventory`);
        }
      }

      items = validPrescriptions;

      if (items.length < count) {
        console.warn(`⚠️ Capping ${key} from ${count} to ${items.length} (insufficient inventory)`);
      }
    } else if (key === "vaccineUses" && insertedIds.singleInjections && insertedIds.vaccines) {
      // Check if we have injections
      if (!insertedIds.singleInjections || insertedIds.singleInjections.length === 0) {
        console.warn(`⚠️ No singleInjections available; skipping ${key}`);
        items = [];
      } else {
        items = await generateItems(factory, count);
        
        // Query vaccine inventory with sufficient stock
        let vaccineByBranch = {};
        if (prisma) {
          try {
            const inv = await prisma.vaccineInventory.findMany({
              where: { quantity: { gt: 0 } },
              select: { vaccine_id: true, branch_id: true, quantity: true }
            });
            
            for (const record of inv) {
              const bid = record.branch_id;
              if (!vaccineByBranch[bid]) vaccineByBranch[bid] = [];
              // Only add if has stock
              if (record.quantity > 0) {
                vaccineByBranch[bid].push(record.vaccine_id);
              }
            }
          } catch (e) {
            console.warn(`⚠️ Could not load vaccine inventory`);
          }
        }

        // Get branches for each single injection
        let injectionBranches = new Map();
        if (prisma && Object.keys(vaccineByBranch).length > 0) {
          try {
            const injs = await prisma.singleInjection.findMany({
              select: { 
                id: true, 
                service_id: true
              }
            });
            
            // Query services to get invoice info
            const serviceIds = injs.map(i => i.service_id);
            const services = await prisma.service.findMany({
              where: { id: { in: serviceIds } },
              select: { id: true, invoice_id: true }
            });
            
            const invoiceIds = services.map(s => s.invoice_id).filter(Boolean);
            const invoices = await prisma.invoice.findMany({
              where: { id: { in: invoiceIds } },
              select: { id: true, branch_id: true }
            });
            
            const invoiceMap = new Map(invoices.map(i => [i.id, i.branch_id]));
            const serviceMap = new Map(services.map(s => [s.id, invoiceMap.get(s.invoice_id)]));
            
            for (const inj of injs) {
              const branchId = serviceMap.get(inj.service_id);
              injectionBranches.set(Number(inj.id), branchId);
            }
          } catch (e) {
            console.warn(`⚠️ Could not load injection-branch mapping`);
          }
        }

        // Only proceed if we have both injections and vaccine inventory
        if (injectionBranches.size === 0 || Object.keys(vaccineByBranch).length === 0) {
          console.warn(`⚠️ Insufficient data for ${key} (injections=${injectionBranches.size}, vaccine branches=${Object.keys(vaccineByBranch).length}); skipping`);
          items = [];
        } else {
          // Match injections to vaccines based on shared branch
          const validVaccineUses = [];
          for (const item of items) {
            let foundMatch = false;
            
            const injId = insertedIds.singleInjections[Math.floor(Math.random() * insertedIds.singleInjections.length)];
            const branchId = injectionBranches.get(injId);
            const availableVaccines = vaccineByBranch[branchId];
            
            if (availableVaccines?.length > 0) {
              // Use vaccine from same branch
              const vid = availableVaccines[Math.floor(Math.random() * availableVaccines.length)];
              validVaccineUses.push({
                ...item,
                single_injection_id: injId,
                vaccine_id: vid,
              });
              foundMatch = true;
            }
            
            if (!foundMatch) {
              console.warn(`⚠️ Skipping vaccineUse - no available vaccines in injection's branch`);
            }
          }

          items = validVaccineUses;

          if (items.length < count) {
            console.warn(`⚠️ Capping ${key} from ${count} to ${items.length} (insufficient inventory)`);
          }
        }
      }
    } else if (key === "sellProducts" && insertedIds.services && insertedIds.products) {
      // Get services of type "Mua hàng" (sell products)
      let sellServicesByBranch = {};
      if (prisma) {
        try {
          const services = await prisma.service.findMany({
            where: { type_of_service: "MuaHang" },
            select: { id: true, invoice_id: true }
          });
          
          // Get branches for each service via invoices
          const invoiceIds = services.map(s => s.invoice_id).filter(Boolean);
          const invoices = await prisma.invoice.findMany({
            where: { id: { in: invoiceIds } },
            select: { id: true, branch_id: true }
          });
          
          const invoiceMap = new Map(invoices.map(i => [i.id, i.branch_id]));
          
          for (const service of services) {
            const branchId = invoiceMap.get(service.invoice_id);
            if (branchId) {
              if (!sellServicesByBranch[branchId]) sellServicesByBranch[branchId] = [];
              sellServicesByBranch[branchId].push(Number(service.id));
            }
          }
        } catch (e) {
          console.warn(`⚠️ Could not load sell product services`);
        }
      }

      // Get product inventory by branch
      let productsByBranch = {};
      if (prisma) {
        try {
          const inv = await prisma.productInventory.findMany({
            where: { quantity: { gt: 0 } },
            select: { product_id: true, branch_id: true, quantity: true }
          });
          
          for (const record of inv) {
            const bid = record.branch_id;
            if (!productsByBranch[bid]) productsByBranch[bid] = [];
            productsByBranch[bid].push(record.product_id);
          }
        } catch (e) {
          console.warn(`⚠️ Could not load product inventory`);
        }
      }

      // Only proceed if we have both services and product inventory
      if (Object.keys(sellServicesByBranch).length === 0 || Object.keys(productsByBranch).length === 0) {
        console.warn(`⚠️ Insufficient data for ${key} (services=${Object.keys(sellServicesByBranch).length}, product branches=${Object.keys(productsByBranch).length}); skipping`);
        items = [];
      } else {
        // Build shuffled service pool (for unique constraint)
        let servicePool = [];
        for (const branch of Object.keys(sellServicesByBranch)) {
          servicePool.push(...(sellServicesByBranch[branch] || []));
        }
        
        // Shuffle the pool
        for (let i = servicePool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [servicePool[i], servicePool[j]] = [servicePool[j], servicePool[i]];
        }

        items = await generateItems(factory, count);

        // Cap to available services (unique constraint)
        if (servicePool.length > 0 && servicePool.length < items.length) {
          console.warn(`⚠️ Capping ${key} from ${items.length} to ${servicePool.length} (unique service_id constraint)`);
          items = items.slice(0, servicePool.length);
        }

        // Assign each service once, with matching product from same branch
        const validSellProducts = [];
        for (let idx = 0; idx < servicePool.length; idx++) {
          const serviceId = servicePool[idx];
          let foundProduct = false;
          
          // Find the branch for this service and use products from that branch
          for (const branch of Object.keys(sellServicesByBranch)) {
            if (sellServicesByBranch[branch].includes(serviceId)) {
              const branchProducts = productsByBranch[branch];
              if (branchProducts?.length > 0) {
                const productId = branchProducts[Math.floor(Math.random() * branchProducts.length)];
                validSellProducts.push({
                  ...items[idx % items.length],
                  service_id: serviceId,
                  product_id: productId,
                });
                foundProduct = true;
              }
              break;
            }
          }
          
          if (!foundProduct) {
            console.warn(`⚠️ Skipping sellProduct - service branch has no product inventory`);
          }
        }
        
        items = validSellProducts;
        
        if (items.length === 0) {
          console.warn(`⚠️ No valid sellProducts created - all services lack inventory`);
        } else if (items.length < servicePool.length) {
          console.warn(`⚠️ Reduced ${key} from ${servicePool.length} to ${items.length} (products not in all branches)`);
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
        console.warn(`⚠️ Could not load service-type.json, using random generation`);
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
      const batchSize = 1000;

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

  if (prisma) await prisma.$disconnect();

  console.log("\n📊 SEED SUMMARY");
  console.table(summary);
  console.log("✅ Seeding finished");
}

main().catch((err) => {
  console.error("\n💥 SEED FAILED");
  console.error(err);
  process.exit(1);
});