// User and Authentication
export type UserRole = "customer" | "receptionist" | "veterinarian" | "sales" | "admin";
export type MembershipLevel = "Cơ bản" | "Thân thiết" | "VIP";

export interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  membershipLevel?: MembershipLevel; // Only for customers
  loyaltyPoints?: number; // Only for customers
  yearlySpending?: number; // Only for customers - total spending in current year
  branchId?: string;
  profileImage?: string;
  phone?: string;
  citizenId?: string;
  gender?: string;
  dateOfBirth?: string;
  specialization?: string;
  licenseNumber?: string;
  availability?: DoctorAvailability[];
  createdAt: string;
}

export interface DoctorAvailability {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Hospital Branches
export interface Branch {
  id: string;
  branch_name: string;
  address: string;
  phone_number: string;
  opening_at: string;
  closing_at: string;
  manager_id: string;
  createdAt: string;
}

// Pets
export interface Pet {
  id: string;
  customerId: string;
  name: string;
  type: "dog" | "cat" | "rabbit" | "bird" | "other";
  breed: string;
  age: number;
  weight: number;
  color?: string;
  microchipId?: string;
  medicalHistory: MedicalRecord[];
  vaccinations: Vaccination[];
  createdAt: string;
}

// Medical Records - Unified Model
export interface MedicalRecord {
  id: string;
  petId: string;
  petName: string;
  customerId: string;
  customerName: string;
  veterinarianId: string;
  veterinarianName: string;
  symptoms: string;
  diagnosis: string;
  conclusion: string;
  prescription: PrescriptionItem[];
  followUpDate?: string;
  createdAt: string;
  branchId: string;
  weight?: number;
  temperature?: number;
  bloodPressure?: string;
  appointmentId?: string;
}

// Prescriptions
export interface PrescriptionItem {
  drugName: string;
  quantity: number;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

// Vaccinations
export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  administeredDate: string;
  nextBoosterDate?: string;
  veterinarianId: string;
  branchId: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  pet_id: string;
  owner_id: string;
  branch_id: string;
  doctor_id: string;
  service_type: string;
  appointment_time: string;
  reason?: string;
  status: string;
  cancelled_reason?: string;
  pet_name?: string;
  doctor_name?: string;
  branch_name?: string;
  createdAt: string;
  updatedAt: string;
}

// Medications/Inventory
export interface Medication {
  id: string;
  name: string;
  description: string;
  strength: string;
  unit: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  reorderLevel: number;
  price: number;
  branchId?: string;
}

export interface MedicationUsage {
  id: string;
  medicationId: string;
  appointmentId: string;
  quantityUsed: number;
  usedDate: string;
  usedBy: string;
  notes?: string;
}

// Services
export interface Service {
  id: string;
  name: string;
  description: string;
  category: "checkup" | "vaccination" | "surgery" | "grooming" | "dental" | "other";
  price: number;
  duration: number;
  branchId: string;
  availableVeterinarians: string[];
  rating: number;
  reviews: ServiceReview[];
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  customerId: string;
  rating: number;
  comment: string;
  dateCreated: string;
}

// Pet Products/Items
export interface PetItem {
  id: string;
  productCode?: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock?: number;
  image?: string;
  branchId?: string;
  createdAt?: string;
}

export interface CartItem {
  itemId: string;
  quantity: number;
  price: number;
}

// Orders
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  loyaltyPointsApplied: number;
  loyaltyDiscount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDate?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Loyalty Program
export type LoyaltyTier = "bronze" | "silver" | "gold";

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  points: number;
  tier: LoyaltyTier;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export const LOYALTY_CONFIG = {
  pointsPerVND: 1 / 50000, // 1 point per 50K VND
  tiers: {
    bronze: { minSpent: 0, discount: 0.05 },
    silver: { minSpent: 5000000, discount: 0.1 },
    gold: { minSpent: 12000000, discount: 0.15 },
  },
} as const;

// Invoices
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  appointmentId?: string;
  medicalRecordId?: string;
  customerId: string;
  branchId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  veterinarianId?: string;
  medicalServiceType?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type?: "service" | "medication" | "product";
}

// Service Invoice - For veterinary services
export interface ServiceInvoice {
  id: string;
  customerId: string;
  customerName: string;
  branchId: string;
  salesStaffId: string;
  salesStaffName: string;
  serviceInstanceIds: string[]; // Reference to ServiceInstance(s)
  subtotal: number;
  discount: number;
  discountRate: number;
  total: number;
  paymentMethod: "Cash" | "Bank transfer";
  staffAttitudeRating?: number; // 0-5: Staff attitude rating from customer
  overallSatisfaction?: number; // 0-5: Overall satisfaction from customer
  loyaltyPointsEarned: number;
  appliedPromotions: string[]; // Promotion IDs
  notes?: string;
  createdAt: string;
}

// Customer (extends User)
export interface Customer extends User {
  role: "customer";
  pets: string[];
  invoices: string[];
  appointments: string[];
}

// Service Types
export type ServiceTypeId = "purchase" | "single-vaccine" | "vaccine-package" | "medical-exam";

export interface ServiceType {
  id: ServiceTypeId;
  name: string;
  basePrice: number;
  description?: string;
  createdAt: string;
}

// Vaccines
export interface Vaccine {
  id: string;
  name: string;
  price: number;
  manufacturer?: string;
  description?: string;
  createdAt: string;
}

// Vaccine Packages
export interface VaccinePackage {
  id: string;
  name: string;
  monthMark: number; // Age in months for this package
  cycle: number; // How many cycles to repeat
  price: number;
  vaccines: VaccineInPackage[];
  description?: string;
  createdAt: string;
}

export interface VaccineInPackage {
  vaccineId: string;
  dosage: number; // Number of doses
}

// Promotions
export type TargetAudience = "All" | "Loyal+" | "VIP+";

export interface GlobalPromotion {
  id: string;
  description: string;
  targetAudience: TargetAudience;
  applicableServiceTypes: ServiceTypeId[];
  discountRate: number; // 5-15%
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface BranchPromotion {
  id: string;
  branchId: string;
  description: string;
  targetAudience: TargetAudience;
  applicableServiceTypes: ServiceTypeId[];
  discountRate: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

// Branch Inventory
export interface BranchInventory {
  branchId: string;
  products: BranchInventoryItem[];
  vaccines: BranchInventoryItem[];
  vaccinePackages: BranchInventoryItem[];
  lastUpdated: string;
}

export interface BranchInventoryItem {
  itemId: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
}

// Transfer History
export interface StaffTransfer {
  id: string;
  staffId: string;
  fromBranchId: string;
  toBranchId: string;
  transferDate: string;
  reason: string;
  approvedBy: string;
  notes?: string;
  createdAt: string;
}

// Service Instances - Track actual service delivery
export interface ServiceInstance {
  id: string;
  serviceType: ServiceTypeId;
  veterinarianId: string;
  veterinarianName: string;
  petId: string;
  petName: string;
  customerId: string;
  customerName: string;
  branchId: string;
  basePrice: number;
  vaccineCost?: number; // For single-dose injections
  packageCost?: number; // For package injections
  packageId?: string; // VaccinePackage ID if applicable
  vaccinesUsed: VaccineUsed[]; // List of vaccines administered
  datePerformed: string;
  notes?: string;
  invoiceId?: string; // Null if not yet invoiced
  // Rating fields (set later by customer)
  serviceQualityRating?: number; // 0-5: Điểm chất lượng dịch vụ
  staffAttitudeRating?: number; // 0-5: Điểm thái độ nhân viên
  overallSatisfaction?: number; // 0-5: Mức độ hài lòng tổng thể
  comment?: string; // Customer feedback comment
  rated?: boolean; // Whether customer has rated this service
  createdAt: string;
}

export interface VaccineUsed {
  vaccineId: string;
  vaccineName: string;
  dosage: number;
  administered: boolean; // For package injections tracking
  monthMark?: number; // Cycle stage for package injections
}

// Inventory Management - Branch-based stock tracking
export interface ProductInventory {
  id: string;
  branchId: string;
  productId: string;
  quantity: number;
  lastRestocked?: string;
  updatedAt: string;
}

export interface VaccineInventory {
  id: string;
  branchId: string;
  vaccineId: string;
  quantity: number;
  lastRestocked?: string;
  updatedAt: string;
}

export type StockStatus = "normal" | "low" | "critical" | "out";

export interface StockAlert {
  type: "product" | "vaccine";
  itemId: string;
  itemName: string;
  branchId: string;
  branchName: string;
  quantity: number;
  status: StockStatus;
}
