import path from "path";
import { fileURLToPath } from "url";

// Factory imports
import createUser from "../factories/user.factory.js";
import createPet from "../factories/pet.factory.js";
import createBranch from "../factories/branch.factory.js";
import createEmployee from "../factories/employee.factory.js";
import createAccount from "../factories/account.factory.js";
import createRefreshToken from "../factories/refresh-token.factory.js";
import createAppointment from "../factories/appointment.factory.js";
import createServiceRecord from "../factories/service.factory.js";
import createInvoice from "../factories/invoice.factory.js";
import createProduct from "../factories/product.factory.js";
import createProductInventory from "../factories/product-inventory.factory.js";
import createMedicine from "../factories/medicine.factory.js";
import createMedicineInventory from "../factories/medicine-inventory.factory.js";
import createPrescription from "../factories/prescription.factory.js";
import createVaccine from "../factories/vaccine.factory.js";
import createVaccineInventory from "../factories/vaccine-inventory.factory.js";
import createVaccineUse from "../factories/vaccine-use.factory.js";
import createVaccinePackage from "../factories/vaccine-package.factory.js";
import createVaccinePackageUse from "../factories/vaccine-package-use.factory.js";
import createPackageInventory from "../factories/package-inventory.factory.js";
import createPackageInjection from "../factories/package-injection.factory.js";
import createIncludeVaccine from "../factories/include-vaccine.factory.js";
import createPromotion from "../factories/promotion.factory.js";
import createPromotionFor from "../factories/promotion-for.factory.js";
import createApplyPromotion from "../factories/apply-promotion.factory.js";
import createMobilization from "../factories/mobilization.factory.js";
import createSellProduct from "../factories/sell-product.factory.js";
import createTypeOfService from "../factories/type-of-service.factory.js";
import createSingleInjection from "../factories/single-injection.factory.js";
import createMedicalExamination from "../factories/medical-examination.factory.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const OUT_DIR = path.join(__dirname, "..", "seed-output");

export const DEFAULT_COUNTS = {
    users: 1, pets: 1, branches: 1, employees: 1, accounts: 1,
    refreshTokens: 1, appointments: 1, services: 1, invoices: 1,
    products: 1, productInventories: 1, medicines: 1, medicineInventories: 1,
    prescriptions: 1, vaccines: 1, vaccineInventories: 1, vaccineUses: 1,
    vaccinePackages: 1, vaccinePackageUses: 1, packageInventories: 1,
};

export const FACTORIES = {
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

export const PRISMA_CLIENT_MAP = {
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

export const MODEL_ENUM_FIELDS = {
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
