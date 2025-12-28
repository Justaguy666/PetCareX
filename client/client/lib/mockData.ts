import { User, Branch, Pet, Appointment, Medication, Service, PetItem, Invoice, Order, LoyaltyAccount, MedicalRecord, ServiceType, Vaccine, VaccinePackage, GlobalPromotion, BranchPromotion, BranchInventory, StaffTransfer, ServiceInstance, ServiceInvoice, ProductInventory, VaccineInventory } from "@shared/types";

export const mockUsers: User[] = [
  {
    id: "user-admin",
    email: "admin@petcare.com",
    password: "admin123",
    fullName: "Admin User",
    role: "admin",
    branchId: "branch-1",
    phone: "(555) 100-0001",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-vet-1",
    email: "dr.smith@petcare.com",
    password: "vet123",
    fullName: "Dr. Smith",
    role: "veterinarian",
    branchId: "branch-1",
    specialization: "General Practice",
    licenseNumber: "VET001",
    phone: "(555) 111-0001",
    availability: [
      { day: "monday", startTime: "08:00", endTime: "17:00", isAvailable: true },
      { day: "tuesday", startTime: "08:00", endTime: "17:00", isAvailable: true },
      { day: "wednesday", startTime: "08:00", endTime: "17:00", isAvailable: true },
      { day: "thursday", startTime: "08:00", endTime: "17:00", isAvailable: true },
      { day: "friday", startTime: "08:00", endTime: "17:00", isAvailable: true },
      { day: "saturday", startTime: "09:00", endTime: "14:00", isAvailable: true },
      { day: "sunday", startTime: "", endTime: "", isAvailable: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-vet-2",
    email: "dr.johnson@petcare.com",
    password: "vet123",
    fullName: "Dr. Johnson",
    role: "veterinarian",
    branchId: "branch-1",
    specialization: "Surgery & Orthopedics",
    licenseNumber: "VET002",
    phone: "(555) 111-0002",
    availability: [
      { day: "monday", startTime: "09:00", endTime: "18:00", isAvailable: true },
      { day: "tuesday", startTime: "09:00", endTime: "18:00", isAvailable: true },
      { day: "wednesday", startTime: "09:00", endTime: "18:00", isAvailable: true },
      { day: "thursday", startTime: "", endTime: "", isAvailable: false },
      { day: "friday", startTime: "09:00", endTime: "18:00", isAvailable: true },
      { day: "saturday", startTime: "", endTime: "", isAvailable: false },
      { day: "sunday", startTime: "", endTime: "", isAvailable: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-receptionist",
    email: "reception@petcare.com",
    password: "rec123",
    fullName: "Sarah Reception",
    role: "receptionist",
    branchId: "branch-1",
    phone: "(555) 111-0003",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-sales",
    email: "sales@petcare.com",
    password: "sales123",
    fullName: "Mike Sales",
    role: "sales",
    branchId: "branch-1",
    phone: "(555) 111-0004",
    createdAt: new Date().toISOString(),
  },
  {
    id: "customer-1",
    email: "john@example.com",
    password: "customer123",
    fullName: "John Doe",
    role: "customer",
    membershipLevel: "Thân thiết",
    yearlySpending: 7000000, // Total from invoices: 1.5M + 1.8M + 3.7M = 7M (Loyal tier)
    loyaltyPoints: 140,
    branchId: "branch-1",
    phone: "(555) 123-4567",
    createdAt: new Date().toISOString(),
  },
  {
    id: "customer-2",
    email: "jane@example.com",
    password: "customer123",
    fullName: "Jane Smith",
    role: "customer",
    membershipLevel: "Cơ bản",
    yearlySpending: 2000000, // Total from invoices: 2M (Basic tier)
    loyaltyPoints: 40,
    branchId: "branch-2",
    phone: "(555) 123-4568",
    createdAt: new Date().toISOString(),
  },
];

export const mockBranches: Branch[] = [
  {
    id: "branch-1",
    name: "Downtown Pet Hospital",
    address: "123 Main Street",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    phone: "(555) 123-0001",
    email: "downtown@petcarepro.com",
    managerId: "user-admin",
    services: ["checkup", "vaccination", "surgery"],
    workingHours: {
      monday: { start: "08:00", end: "18:00" },
      tuesday: { start: "08:00", end: "18:00" },
      wednesday: { start: "08:00", end: "18:00" },
      thursday: { start: "08:00", end: "18:00" },
      friday: { start: "08:00", end: "18:00" },
      saturday: { start: "09:00", end: "14:00" },
      sunday: { start: "", end: "" },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "branch-2",
    name: "North Side Veterinary Clinic",
    address: "456 North Avenue",
    city: "Springfield",
    state: "IL",
    zipCode: "62702",
    phone: "(555) 123-0002",
    email: "northside@petcarepro.com",
    managerId: "user-admin",
    services: ["checkup", "vaccination", "grooming"],
    workingHours: {
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
      saturday: { start: "", end: "" },
      sunday: { start: "", end: "" },
    },
    createdAt: new Date().toISOString(),
  },
];

export const mockPets: Pet[] = [
  {
    id: "pet-1",
    customerId: "customer-1",
    name: "Max",
    type: "dog",
    breed: "Golden Retriever",
    age: 3,
    weight: 65,
    color: "Golden",
    medicalHistory: [],
    vaccinations: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "pet-2",
    customerId: "customer-1",
    name: "Bella",
    type: "cat",
    breed: "Persian",
    age: 2,
    weight: 8,
    color: "White",
    medicalHistory: [],
    vaccinations: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "pet-3",
    customerId: "customer-2",
    name: "Charlie",
    type: "dog",
    breed: "Labrador",
    age: 5,
    weight: 70,
    color: "Black",
    medicalHistory: [],
    vaccinations: [],
    createdAt: new Date().toISOString(),
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: "apt-1",
    petId: "pet-1",
    customerId: "customer-1",
    branchId: "branch-1",
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    appointmentTime: "10:00 AM",
    serviceType: "checkup",
    veterinarianId: "user-vet-1",
    reasonForVisit: "Regular check-up",
    status: "checked-in",
    createdAt: new Date().toISOString(),
  },
];

export const mockMedications: Medication[] = [
  {
    id: "med-1",
    name: "Amoxicillin",
    description: "Antibiotic for bacterial infections",
    strength: "250mg",
    unit: "tablet",
    manufacturer: "Generic Pharma",
    batchNumber: "BATCH001",
    expiryDate: new Date(Date.now() + 31536000000).toISOString().split("T")[0],
    quantity: 100,
    reorderLevel: 20,
    price: 0.50,
    branchId: "branch-1",
  },
  {
    id: "med-2",
    name: "Carprofen",
    description: "Pain relief and anti-inflammatory",
    strength: "100mg",
    unit: "tablet",
    manufacturer: "Generic Pharma",
    batchNumber: "BATCH002",
    expiryDate: new Date(Date.now() + 31536000000).toISOString().split("T")[0],
    quantity: 50,
    reorderLevel: 15,
    price: 1.25,
    branchId: "branch-1",
  },
  {
    id: "med-3",
    name: "Doxycycline",
    description: "Antibiotic for infections",
    strength: "100mg",
    unit: "tablet",
    manufacturer: "Generic Pharma",
    batchNumber: "BATCH003",
    expiryDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    quantity: 5,
    reorderLevel: 10,
    price: 0.75,
    branchId: "branch-1",
  },
];

export const mockServices: Service[] = [
  {
    id: "svc-1",
    name: "General Health Check-up",
    description: "Comprehensive physical examination",
    category: "checkup",
    price: 75,
    duration: 30,
    branchId: "branch-1",
    availableVeterinarians: ["user-vet-1", "user-vet-2"],
    rating: 4.8,
    reviews: [],
  },
  {
    id: "svc-2",
    name: "Vaccination",
    description: "Core and non-core vaccinations",
    category: "vaccination",
    price: 50,
    duration: 20,
    branchId: "branch-1",
    availableVeterinarians: ["user-vet-1"],
    rating: 4.9,
    reviews: [],
  },
  {
    id: "svc-3",
    name: "Surgical Procedure",
    description: "General and orthopedic surgery",
    category: "surgery",
    price: 500,
    duration: 120,
    branchId: "branch-1",
    availableVeterinarians: ["user-vet-2"],
    rating: 4.7,
    reviews: [],
  },
];

export const mockPetItems: PetItem[] = [
  {
    id: "item-1",
    productCode: "FOOD001",
    name: "Premium Dog Food",
    description: "High-quality dog kibble with chicken and vegetables",
    category: "food",
    price: 450000,
    stock: 50,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-2",
    productCode: "TOY001",
    name: "Interactive Dog Toy",
    description: "Durable rubber fetch toy for active dogs",
    category: "toy",
    price: 199000,
    stock: 30,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-3",
    productCode: "ACC001",
    name: "Pet Collar with ID",
    description: "Adjustable collar with personalized ID tag",
    category: "accessory",
    price: 249000,
    stock: 40,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-4",
    productCode: "FOOD002",
    name: "Cat Dry Food",
    description: "Nutritious dry food for adult cats",
    category: "food",
    price: 320000,
    stock: 45,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-5",
    productCode: "FOOD003",
    name: "Puppy Wet Food",
    description: "Soft and easy-to-digest food for puppies",
    category: "food",
    price: 380000,
    stock: 25,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-6",
    productCode: "TOY002",
    name: "Feather Cat Toy",
    description: "Interactive feather toy for cats",
    category: "toy",
    price: 89000,
    stock: 60,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-7",
    productCode: "TOY003",
    name: "Squeaky Ball Set",
    description: "Set of 3 colorful squeaky balls",
    category: "toy",
    price: 159000,
    stock: 35,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-8",
    productCode: "ACC002",
    name: "Dog Leash",
    description: "Strong nylon leash with comfortable grip",
    category: "accessory",
    price: 189000,
    stock: 55,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-9",
    productCode: "ACC003",
    name: "Pet Bed",
    description: "Comfortable orthopedic pet bed",
    category: "accessory",
    price: 899000,
    stock: 15,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-10",
    productCode: "MED001",
    name: "Pet Vitamins",
    description: "Multivitamin supplement for pets",
    category: "medication",
    price: 279000,
    stock: 40,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-11",
    productCode: "MED002",
    name: "Omega-3 Supplement",
    description: "Fish oil supplement for healthy coat",
    category: "medication",
    price: 349000,
    stock: 30,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-12",
    productCode: "TOY004",
    name: "Chew Stick Toy",
    description: "Long-lasting chew toy for dogs",
    category: "toy",
    price: 129000,
    stock: 50,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-13",
    productCode: "ACC004",
    name: "Pet Brush",
    description: "Grooming brush for dogs and cats",
    category: "accessory",
    price: 149000,
    stock: 70,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-14",
    productCode: "FOOD004",
    name: "Senior Dog Food",
    description: "Specially formulated for senior dogs",
    category: "food",
    price: 520000,
    stock: 20,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-15",
    productCode: "TOY005",
    name: "Kong Rubber Toy",
    description: "Durable rubber toy with treat pocket",
    category: "toy",
    price: 249000,
    stock: 25,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-16",
    productCode: "MED003",
    name: "Amoxicillin Tablets",
    description: "Antibiotic for treating bacterial infections in pets",
    category: "medication",
    price: 450000,
    stock: 18,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-17",
    productCode: "MED004",
    name: "Deworming Syrup",
    description: "Effective deworming treatment for dogs and cats",
    category: "medication",
    price: 280000,
    stock: 22,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-18",
    productCode: "MED005",
    name: "Vitamin Booster",
    description: "Complete vitamin and mineral supplement for pets",
    category: "medication",
    price: 390000,
    stock: 15,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-19",
    productCode: "MED006",
    name: "Antibiotic Drops",
    description: "Antibiotic ear drops for treating infections",
    category: "medication",
    price: 320000,
    stock: 8,
    branchId: "branch-1",
    createdAt: new Date().toISOString(),
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    appointmentId: "apt-1",
    customerId: "customer-1",
    branchId: "branch-1",
    items: [
      {
        id: "item-1",
        description: "General Health Check-up",
        quantity: 1,
        unitPrice: 75,
        total: 75,
      },
    ],
    subtotal: 75,
    tax: 7.5,
    total: 82.5,
    status: "pending",
    dueDate: new Date(Date.now() + 604800000).toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  },
];

export const mockOrders: Order[] = [
  {
    id: "order-1",
    customerId: "customer-1",
    items: [
      {
        id: "oi-1",
        itemId: "item-1",
        itemName: "Premium Dog Food",
        quantity: 2,
        unitPrice: 450000,
        total: 900000,
      },
      {
        id: "oi-2",
        itemId: "item-3",
        itemName: "Pet Collar with ID",
        quantity: 1,
        unitPrice: 249000,
        total: 249000,
      },
    ],
    subtotal: 1149000,
    tax: 114900,
    loyaltyPointsApplied: 0,
    loyaltyDiscount: 0,
    total: 1263900,
    status: "delivered",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "order-2",
    customerId: "customer-1",
    items: [
      {
        id: "oi-3",
        itemId: "item-4",
        itemName: "Cat Dry Food",
        quantity: 3,
        unitPrice: 320000,
        total: 960000,
      },
    ],
    subtotal: 960000,
    tax: 96000,
    loyaltyPointsApplied: 0,
    loyaltyDiscount: 0,
    total: 1056000,
    status: "delivered",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "order-3",
    customerId: "customer-1",
    items: [
      {
        id: "oi-4",
        itemId: "item-10",
        itemName: "Pet Vitamins",
        quantity: 2,
        unitPrice: 279000,
        total: 558000,
      },
      {
        id: "oi-5",
        itemId: "item-6",
        itemName: "Feather Cat Toy",
        quantity: 1,
        unitPrice: 89000,
        total: 89000,
      },
    ],
    subtotal: 647000,
    tax: 64700,
    loyaltyPointsApplied: 0,
    loyaltyDiscount: 0,
    total: 711700,
    status: "delivered",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "order-4",
    customerId: "customer-2",
    items: [
      {
        id: "oi-6",
        itemId: "item-9",
        itemName: "Pet Bed",
        quantity: 1,
        unitPrice: 899000,
        total: 899000,
      },
    ],
    subtotal: 899000,
    tax: 89900,
    loyaltyPointsApplied: 0,
    loyaltyDiscount: 0,
    total: 988900,
    status: "delivered",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockLoyaltyAccounts: LoyaltyAccount[] = [
  {
    id: "loyalty-1",
    customerId: "customer-1",
    points: 52,
    tier: "silver",
    totalSpent: 3031600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "loyalty-2",
    customerId: "customer-2",
    points: 18,
    tier: "bronze",
    totalSpent: 988900,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "med-rec-1",
    petId: "pet-1",
    petName: "Max",
    customerId: "customer-1",
    customerName: "John Doe",
    veterinarianId: "user-vet-1",
    veterinarianName: "Dr. Smith",
    symptoms: "Coughing, lethargy, loss of appetite",
    diagnosis: "Upper respiratory infection",
    conclusion: "Prescribed antibiotics and rest. Monitor for improvement over next 7 days.",
    prescription: [
      { drugName: "Amoxicillin", quantity: 14, dosage: "250mg", frequency: "Twice daily", duration: "7 days", instructions: "Give with food" },
      { drugName: "Cough Suppressant", quantity: 1, dosage: "10ml", frequency: "Once daily", duration: "5 days", instructions: "Administer in the evening" }
    ],
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    branchId: "branch-1",
    weight: 65,
    temperature: 102.5,
    bloodPressure: "140/90",
    appointmentId: "apt-1"
  },
  {
    id: "med-rec-2",
    petId: "pet-2",
    petName: "Bella",
    customerId: "customer-1",
    customerName: "John Doe",
    veterinarianId: "user-vet-2",
    veterinarianName: "Dr. Johnson",
    symptoms: "Ear scratching, head shaking, redness in ear canal",
    diagnosis: "Ear infection (Otitis externa)",
    conclusion: "Clean ears daily and apply prescribed drops. Should see improvement in 5-7 days.",
    prescription: [
      { drugName: "Antibiotic Ear Drops", quantity: 1, dosage: "5 drops", frequency: "Twice daily", duration: "10 days", instructions: "Clean ear before applying" }
    ],
    followUpDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    branchId: "branch-1",
    weight: 8,
    temperature: 101.8,
    appointmentId: "apt-1"
  },
  {
    id: "med-rec-3",
    petId: "pet-3",
    petName: "Charlie",
    customerId: "customer-2",
    customerName: "Jane Smith",
    veterinarianId: "user-vet-1",
    veterinarianName: "Dr. Smith",
    symptoms: "Limping on right front leg, visible swelling",
    diagnosis: "Sprained leg - Grade 1 strain",
    conclusion: "Rest and restrict activity for 2 weeks. Pain medication as needed. No jumping or running.",
    prescription: [
      { drugName: "Carprofen", quantity: 14, dosage: "100mg", frequency: "Once daily", duration: "14 days", instructions: "Give with food to prevent stomach upset" }
    ],
    followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    branchId: "branch-1",
    weight: 70,
    temperature: 101.5,
    bloodPressure: "130/85"
  },
  {
    id: "med-rec-4",
    petId: "pet-1",
    petName: "Max",
    customerId: "customer-1",
    customerName: "John Doe",
    veterinarianId: "user-vet-1",
    veterinarianName: "Dr. Smith",
    symptoms: "Routine wellness checkup",
    diagnosis: "Healthy - all parameters normal",
    conclusion: "Continue current diet and exercise routine. Next checkup in 6 months. Vaccinations up to date.",
    prescription: [],
    followUpDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    branchId: "branch-1",
    weight: 64,
    temperature: 101.2,
    bloodPressure: "120/80"
  },
  {
    id: "med-rec-5",
    petId: "pet-2",
    petName: "Bella",
    customerId: "customer-1",
    customerName: "John Doe",
    veterinarianId: "user-vet-2",
    veterinarianName: "Dr. Johnson",
    symptoms: "Vomiting, diarrhea, decreased appetite",
    diagnosis: "Gastroenteritis - likely dietary indiscretion",
    conclusion: "Bland diet for 3-5 days. Ensure adequate hydration. If symptoms persist beyond 48 hours, return for reassessment.",
    prescription: [
      { drugName: "Anti-nausea medication", quantity: 6, dosage: "10mg", frequency: "Twice daily", duration: "3 days", instructions: "Give 30 minutes before meals" },
      { drugName: "Probiotics", quantity: 30, dosage: "1 capsule", frequency: "Once daily", duration: "30 days", instructions: "Can mix with food" }
    ],
    followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    branchId: "branch-1",
    weight: 7.8,
    temperature: 102.0
  }
];

// Service Types
export const mockServiceTypes: ServiceType[] = [
  {
    id: "purchase",
    name: "Mua hàng",
    basePrice: 0,
    description: "Purchase of pet products and supplies",
    createdAt: new Date().toISOString(),
  },
  {
    id: "single-vaccine",
    name: "Tiêm mũi lẻ",
    basePrice: 50000,
    description: "Single vaccine injection service",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vaccine-package",
    name: "Tiêm theo gói",
    basePrice: 150000,
    description: "Vaccine package service with multiple doses",
    createdAt: new Date().toISOString(),
  },
  {
    id: "medical-exam",
    name: "Khám bệnh",
    basePrice: 200000,
    description: "General medical examination and consultation",
    createdAt: new Date().toISOString(),
  },
];

// Vaccines
export const mockVaccines: Vaccine[] = [
  {
    id: "vac-1",
    name: "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
    price: 250000,
    manufacturer: "Zoetis",
    description: "Core vaccine for dogs",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vac-2",
    name: "Rabies Vaccine",
    price: 180000,
    manufacturer: "Merial",
    description: "Required vaccine for rabies prevention",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vac-3",
    name: "Feline FVRCP",
    price: 220000,
    manufacturer: "Boehringer Ingelheim",
    description: "Core vaccine for cats (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vac-4",
    name: "Bordetella (Kennel Cough)",
    price: 150000,
    manufacturer: "Zoetis",
    description: "Non-core vaccine for respiratory infection",
    createdAt: new Date().toISOString(),
  },
  {
    id: "vac-5",
    name: "Leptospirosis Vaccine",
    price: 200000,
    manufacturer: "Intervet",
    description: "Protection against bacterial disease",
    createdAt: new Date().toISOString(),
  },
];

// Vaccine Packages
export const mockVaccinePackages: VaccinePackage[] = [
  {
    id: "pkg-1",
    name: "Puppy Starter Package",
    monthMark: 2,
    cycle: 3,
    price: 800000,
    vaccines: [
      { vaccineId: "vac-1", dosage: 1 },
      { vaccineId: "vac-4", dosage: 1 },
    ],
    description: "Essential vaccines for puppies starting at 2 months, 3 cycles",
    createdAt: new Date().toISOString(),
  },
  {
    id: "pkg-2",
    name: "Adult Dog Complete",
    monthMark: 12,
    cycle: 1,
    price: 650000,
    vaccines: [
      { vaccineId: "vac-1", dosage: 1 },
      { vaccineId: "vac-2", dosage: 1 },
      { vaccineId: "vac-5", dosage: 1 },
    ],
    description: "Annual vaccination package for adult dogs",
    createdAt: new Date().toISOString(),
  },
  {
    id: "pkg-3",
    name: "Kitten Starter Package",
    monthMark: 2,
    cycle: 3,
    price: 700000,
    vaccines: [
      { vaccineId: "vac-3", dosage: 1 },
    ],
    description: "Essential vaccines for kittens starting at 2 months, 3 cycles",
    createdAt: new Date().toISOString(),
  },
  {
    id: "pkg-4",
    name: "Adult Cat Complete",
    monthMark: 12,
    cycle: 1,
    price: 550000,
    vaccines: [
      { vaccineId: "vac-3", dosage: 1 },
      { vaccineId: "vac-2", dosage: 1 },
    ],
    description: "Annual vaccination package for adult cats",
    createdAt: new Date().toISOString(),
  },
];

// Global Promotions
export const mockGlobalPromotions: GlobalPromotion[] = [
  {
    id: "promo-global-1",
    description: "New Year Special - 10% off all medical exams",
    targetAudience: "All",
    applicableServiceTypes: ["medical-exam"],
    discountRate: 10,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "promo-global-2",
    description: "VIP Member Exclusive - 15% off vaccine packages",
    targetAudience: "VIP+",
    applicableServiceTypes: ["vaccine-package"],
    discountRate: 15,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "promo-global-3",
    description: "Loyal Customer Reward - 8% off single vaccines",
    targetAudience: "Loyal+",
    applicableServiceTypes: ["single-vaccine"],
    discountRate: 8,
    startDate: "2025-02-01",
    endDate: "2025-06-30",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Branch Promotions
export const mockBranchPromotions: BranchPromotion[] = [
  {
    id: "promo-branch-1",
    branchId: "branch-1",
    description: "Downtown Branch Special - 12% off all services",
    targetAudience: "All",
    applicableServiceTypes: ["medical-exam", "single-vaccine", "vaccine-package"],
    discountRate: 12,
    startDate: "2025-03-01",
    endDate: "2025-03-31",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "promo-branch-2",
    branchId: "branch-2",
    description: "Westside Grand Opening - 15% off for VIP members",
    targetAudience: "VIP+",
    applicableServiceTypes: ["medical-exam", "vaccine-package"],
    discountRate: 15,
    startDate: "2025-01-15",
    endDate: "2025-02-15",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Branch Inventory
export const mockBranchInventory: BranchInventory[] = [
  {
    branchId: "branch-1",
    products: [
      { itemId: "item-1", quantity: 50, minStock: 10, maxStock: 100, reorderPoint: 20 },
      { itemId: "item-2", quantity: 30, minStock: 5, maxStock: 50, reorderPoint: 10 },
      { itemId: "item-3", quantity: 45, minStock: 10, maxStock: 80, reorderPoint: 15 },
    ],
    vaccines: [
      { itemId: "vac-1", quantity: 25, minStock: 5, maxStock: 50, reorderPoint: 10 },
      { itemId: "vac-2", quantity: 20, minStock: 5, maxStock: 40, reorderPoint: 8 },
      { itemId: "vac-3", quantity: 15, minStock: 5, maxStock: 30, reorderPoint: 8 },
    ],
    vaccinePackages: [
      { itemId: "pkg-1", quantity: 10, minStock: 2, maxStock: 20, reorderPoint: 5 },
      { itemId: "pkg-2", quantity: 8, minStock: 2, maxStock: 15, reorderPoint: 4 },
    ],
    lastUpdated: new Date().toISOString(),
  },
  {
    branchId: "branch-2",
    products: [
      { itemId: "item-1", quantity: 40, minStock: 10, maxStock: 100, reorderPoint: 20 },
      { itemId: "item-4", quantity: 25, minStock: 5, maxStock: 50, reorderPoint: 10 },
    ],
    vaccines: [
      { itemId: "vac-1", quantity: 30, minStock: 5, maxStock: 50, reorderPoint: 10 },
      { itemId: "vac-4", quantity: 12, minStock: 3, maxStock: 25, reorderPoint: 6 },
    ],
    vaccinePackages: [
      { itemId: "pkg-3", quantity: 6, minStock: 2, maxStock: 15, reorderPoint: 4 },
    ],
    lastUpdated: new Date().toISOString(),
  },
];

// Staff Transfer History
export const mockStaffTransfers: StaffTransfer[] = [
  {
    id: "transfer-1",
    staffId: "user-vet-2",
    fromBranchId: "branch-2",
    toBranchId: "branch-1",
    transferDate: "2024-11-01",
    reason: "Branch consolidation and workload balancing",
    approvedBy: "user-admin",
    notes: "Dr. Johnson transferred to support increased patient volume",
    createdAt: new Date("2024-10-25").toISOString(),
  },
  {
    id: "transfer-2",
    staffId: "user-recep-1",
    fromBranchId: "branch-1",
    toBranchId: "branch-2",
    transferDate: "2024-10-15",
    reason: "Staff requested transfer closer to home",
    approvedBy: "user-admin",
    notes: "Approved due to personal circumstances",
    createdAt: new Date("2024-10-10").toISOString(),
  },
];

// Mock Service Instances
export const mockServiceInstances: ServiceInstance[] = [
  {
    id: "service-inst-1",
    serviceType: "medical-exam",
    veterinarianId: "user-vet-1",
    veterinarianName: "Dr. Smith",
    petId: "pet-1",
    petName: "Max",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    basePrice: 150000,
    vaccinesUsed: [],
    datePerformed: new Date("2024-11-15").toISOString(),
    notes: "Annual health checkup - all systems normal",
    invoiceId: "service-invoice-1",
    createdAt: new Date("2024-11-15").toISOString(),
  },
  {
    id: "service-inst-2",
    serviceType: "single-vaccine",
    veterinarianId: "user-vet-1",
    veterinarianName: "Dr. Smith",
    petId: "pet-2",
    petName: "Bella",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    basePrice: 100000,
    vaccineCost: 200000,
    vaccinesUsed: [
      {
        vaccineId: "vaccine-1",
        vaccineName: "Rabies Vaccine",
        dosage: 1.0,
        administered: true,
      }
    ],
    datePerformed: new Date("2024-11-20").toISOString(),
    notes: "Rabies vaccination completed successfully",
    invoiceId: "service-invoice-2",
    rated: true,
    serviceQualityRating: 5,
    staffAttitudeRating: 5,
    overallSatisfaction: 5,
    comment: "Excellent service! Dr. Smith was very gentle with Bella and explained everything clearly. The staff was friendly and professional.",
    createdAt: new Date("2024-11-20").toISOString(),
  },
  {
    id: "service-inst-3",
    serviceType: "vaccine-package",
    veterinarianId: "user-vet-2",
    veterinarianName: "Dr. Johnson",
    petId: "pet-1",
    petName: "Max",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    basePrice: 150000,
    packageCost: 800000,
    packageId: "vac-package-1",
    vaccinesUsed: [
      {
        vaccineId: "vaccine-1",
        vaccineName: "Rabies Vaccine",
        dosage: 1.0,
        administered: true,
        monthMark: 2,
      },
      {
        vaccineId: "vaccine-2",
        vaccineName: "Distemper Vaccine",
        dosage: 1.0,
        administered: true,
        monthMark: 2,
      },
      {
        vaccineId: "vaccine-3",
        vaccineName: "Parvovirus Vaccine",
        dosage: 1.0,
        administered: false,
        monthMark: 2,
      }
    ],
    datePerformed: new Date("2024-11-25").toISOString(),
    notes: "Package vaccination - 2 month cycle completed",
    invoiceId: "service-invoice-3",
    createdAt: new Date("2024-11-25").toISOString(),
  },
  {
    id: "service-inst-4",
    serviceType: "single-vaccine",
    veterinarianId: "user-vet-1",
    veterinarianName: "Dr. Smith",
    petId: "pet-3",
    petName: "Charlie",
    customerId: "customer-2",
    customerName: "Jane Smith",
    branchId: "branch-1",
    basePrice: 100000,
    vaccineCost: 180000,
    vaccinesUsed: [
      {
        vaccineId: "vaccine-4",
        vaccineName: "FVRCP Vaccine",
        dosage: 1.0,
        administered: true,
      }
    ],
    datePerformed: new Date("2024-11-28").toISOString(),
    notes: "FVRCP vaccination for cat",
    invoiceId: "service-invoice-4",
    rated: true,
    serviceQualityRating: 4,
    staffAttitudeRating: 4,
    overallSatisfaction: 4,
    comment: "Good service overall. The clinic was clean and the vet was knowledgeable. Waiting time was a bit long though.",
    createdAt: new Date("2024-11-28").toISOString(),
  },
  {
    id: "service-inst-5",
    serviceType: "medical-exam",
    veterinarianId: "user-vet-2",
    veterinarianName: "Dr. Johnson",
    petId: "pet-2",
    petName: "Bella",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    basePrice: 150000,
    vaccinesUsed: [],
    datePerformed: new Date("2024-12-01").toISOString(),
    notes: "Follow-up exam after vaccination - no adverse reactions",
    invoiceId: "service-invoice-5",
    createdAt: new Date("2024-12-01").toISOString(),
  },
  {
    id: "service-inst-6",
    serviceType: "single-vaccine",
    veterinarianId: "user-vet-1",
    veterinarianName: "Dr. Smith",
    petId: "pet-1",
    petName: "Max",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    basePrice: 100000,
    vaccineCost: 220000,
    vaccinesUsed: [
      {
        vaccineId: "vaccine-3",
        vaccineName: "Parvovirus Vaccine",
        dosage: 1.0,
        administered: true,
      }
    ],
    datePerformed: new Date("2024-11-10").toISOString(),
    notes: "Parvovirus vaccination - completed successfully",
    invoiceId: "service-invoice-6",
    createdAt: new Date("2024-11-10").toISOString(),
  },
  {
    id: "service-inst-7",
    serviceType: "medical-exam",
    veterinarianId: "user-vet-2",
    veterinarianName: "Dr. Johnson",
    petId: "pet-1",
    petName: "Max",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    basePrice: 150000,
    vaccinesUsed: [],
    datePerformed: new Date("2024-10-25").toISOString(),
    notes: "Pre-vaccination health check - cleared for vaccination program",
    invoiceId: "service-invoice-7",
    createdAt: new Date("2024-10-25").toISOString(),
  },
];

// Mock Service Invoices
export const mockServiceInvoices: ServiceInvoice[] = [
  {
    id: "service-invoice-1",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    salesStaffId: "user-sales",
    salesStaffName: "Mike Sales",
    serviceInstanceIds: ["service-inst-1"],
    subtotal: 1500000,
    discount: 0,
    discountRate: 0,
    total: 1500000,
    paymentMethod: "Cash",
    loyaltyPointsEarned: 30,
    appliedPromotions: [],
    notes: "Annual checkup - paid in full",
    createdAt: new Date("2025-01-15").toISOString(),
  },
  {
    id: "service-invoice-2",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    salesStaffId: "user-sales",
    salesStaffName: "Mike Sales",
    serviceInstanceIds: ["service-inst-2"],
    subtotal: 2000000,
    discount: 200000,
    discountRate: 10,
    total: 1800000,
    paymentMethod: "Bank transfer",
    staffAttitudeRating: 5,
    overallSatisfaction: 5,
    loyaltyPointsEarned: 36,
    appliedPromotions: ["promo-1"],
    notes: "Rabies vaccination with loyalty discount",
    createdAt: new Date("2025-02-20").toISOString(),
  },
  {
    id: "service-invoice-3",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    salesStaffId: "user-sales",
    salesStaffName: "Mike Sales",
    serviceInstanceIds: ["service-inst-3"],
    subtotal: 4200000,
    discount: 420000,
    discountRate: 10,
    total: 3700000,
    paymentMethod: "Bank transfer",
    loyaltyPointsEarned: 74,
    appliedPromotions: ["promo-1"],
    notes: "Vaccine package - loyalty member discount applied",
    createdAt: new Date("2025-03-25").toISOString(),
  },
  {
    id: "service-invoice-4",
    customerId: "customer-2",
    customerName: "Jane Smith",
    branchId: "branch-2",
    salesStaffId: "user-sales",
    salesStaffName: "Mike Sales",
    serviceInstanceIds: ["service-inst-4"],
    subtotal: 2000000,
    discount: 0,
    discountRate: 0,
    total: 2000000,
    paymentMethod: "Cash",
    staffAttitudeRating: 4,
    overallSatisfaction: 4,
    loyaltyPointsEarned: 40,
    appliedPromotions: [],
    notes: "FVRCP vaccination",
    createdAt: new Date("2025-02-28").toISOString(),
  },
  {
    id: "service-invoice-5",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    salesStaffId: "user-sales",
    salesStaffName: "Mike Sales",
    serviceInstanceIds: ["service-inst-5"],
    subtotal: 150000,
    discount: 15000,
    discountRate: 10,
    total: 135000,
    paymentMethod: "Bank transfer",
    loyaltyPointsEarned: 2,
    appliedPromotions: ["promo-1"],
    notes: "Follow-up exam with discount",
    createdAt: new Date("2024-12-01").toISOString(),
  },
  {
    id: "service-invoice-6",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    salesStaffId: "user-sales",
    salesStaffName: "Mike Sales",
    serviceInstanceIds: ["service-inst-6"],
    subtotal: 320000,
    discount: 32000,
    discountRate: 10,
    total: 288000,
    paymentMethod: "Cash",
    loyaltyPointsEarned: 5,
    appliedPromotions: ["promo-1"],
    notes: "Parvovirus vaccination - loyalty discount",
    createdAt: new Date("2024-11-10").toISOString(),
  },
  {
    id: "service-invoice-7",
    customerId: "customer-1",
    customerName: "John Doe",
    branchId: "branch-1",
    salesStaffId: "user-sales",
    salesStaffName: "Mike Sales",
    serviceInstanceIds: ["service-inst-7"],
    subtotal: 150000,
    discount: 0,
    discountRate: 0,
    total: 150000,
    paymentMethod: "Cash",
    loyaltyPointsEarned: 3,
    appliedPromotions: [],
    notes: "Pre-vaccination health assessment",
    createdAt: new Date("2024-10-25").toISOString(),
  },
];

// Product Inventory - Branch-based stock tracking
export const mockProductInventory: ProductInventory[] = [
  // Branch 1 - Downtown Pet Hospital
  { id: "pinv-1", branchId: "branch-1", productId: "item-1", quantity: 50, updatedAt: new Date().toISOString() },
  { id: "pinv-2", branchId: "branch-1", productId: "item-2", quantity: 30, updatedAt: new Date().toISOString() },
  { id: "pinv-3", branchId: "branch-1", productId: "item-3", quantity: 40, updatedAt: new Date().toISOString() },
  { id: "pinv-4", branchId: "branch-1", productId: "item-4", quantity: 45, updatedAt: new Date().toISOString() },
  { id: "pinv-5", branchId: "branch-1", productId: "item-5", quantity: 8, updatedAt: new Date().toISOString() }, // Low stock
  { id: "pinv-6", branchId: "branch-1", productId: "item-6", quantity: 2, updatedAt: new Date().toISOString() }, // Critical stock
  { id: "pinv-7", branchId: "branch-1", productId: "item-7", quantity: 35, updatedAt: new Date().toISOString() },
  { id: "pinv-8", branchId: "branch-1", productId: "item-8", quantity: 25, updatedAt: new Date().toISOString() },
  { id: "pinv-9", branchId: "branch-1", productId: "item-9", quantity: 15, updatedAt: new Date().toISOString() },
  { id: "pinv-10", branchId: "branch-1", productId: "item-10", quantity: 20, updatedAt: new Date().toISOString() },

  // Branch 2 - Westside Animal Clinic
  { id: "pinv-11", branchId: "branch-2", productId: "item-1", quantity: 35, updatedAt: new Date().toISOString() },
  { id: "pinv-12", branchId: "branch-2", productId: "item-2", quantity: 6, updatedAt: new Date().toISOString() }, // Low stock
  { id: "pinv-13", branchId: "branch-2", productId: "item-3", quantity: 28, updatedAt: new Date().toISOString() },
  { id: "pinv-14", branchId: "branch-2", productId: "item-4", quantity: 42, updatedAt: new Date().toISOString() },
  { id: "pinv-15", branchId: "branch-2", productId: "item-5", quantity: 18, updatedAt: new Date().toISOString() },

  // Branch 3 - Northside Veterinary Center
  { id: "pinv-16", branchId: "branch-3", productId: "item-1", quantity: 1, updatedAt: new Date().toISOString() }, // Critical stock
  { id: "pinv-17", branchId: "branch-3", productId: "item-2", quantity: 22, updatedAt: new Date().toISOString() },
  { id: "pinv-18", branchId: "branch-3", productId: "item-3", quantity: 30, updatedAt: new Date().toISOString() },
  { id: "pinv-19", branchId: "branch-3", productId: "item-6", quantity: 9, updatedAt: new Date().toISOString() }, // Low stock
];

// Vaccine Inventory - Branch-based stock tracking
export const mockVaccineInventory: VaccineInventory[] = [
  // Branch 1 - Downtown Pet Hospital
  { id: "vinv-1", branchId: "branch-1", vaccineId: "vac-1", quantity: 45, updatedAt: new Date().toISOString() },
  { id: "vinv-2", branchId: "branch-1", vaccineId: "vac-2", quantity: 38, updatedAt: new Date().toISOString() },
  { id: "vinv-3", branchId: "branch-1", vaccineId: "vac-3", quantity: 7, updatedAt: new Date().toISOString() }, // Low stock
  { id: "vinv-4", branchId: "branch-1", vaccineId: "vac-4", quantity: 2, updatedAt: new Date().toISOString() }, // Critical stock
  { id: "vinv-5", branchId: "branch-1", vaccineId: "vac-5", quantity: 30, updatedAt: new Date().toISOString() },

  // Branch 2 - Westside Animal Clinic
  { id: "vinv-6", branchId: "branch-2", vaccineId: "vac-1", quantity: 52, updatedAt: new Date().toISOString() },
  { id: "vinv-7", branchId: "branch-2", vaccineId: "vac-2", quantity: 5, updatedAt: new Date().toISOString() }, // Low stock
  { id: "vinv-8", branchId: "branch-2", vaccineId: "vac-3", quantity: 40, updatedAt: new Date().toISOString() },
  { id: "vinv-9", branchId: "branch-2", vaccineId: "vac-4", quantity: 25, updatedAt: new Date().toISOString() },
  { id: "vinv-10", branchId: "branch-2", vaccineId: "vac-5", quantity: 1, updatedAt: new Date().toISOString() }, // Critical stock

  // Branch 3 - Northside Veterinary Center
  { id: "vinv-11", branchId: "branch-3", vaccineId: "vac-1", quantity: 35, updatedAt: new Date().toISOString() },
  { id: "vinv-12", branchId: "branch-3", vaccineId: "vac-2", quantity: 28, updatedAt: new Date().toISOString() },
  { id: "vinv-13", branchId: "branch-3", vaccineId: "vac-3", quantity: 9, updatedAt: new Date().toISOString() }, // Low stock
  { id: "vinv-14", branchId: "branch-3", vaccineId: "vac-4", quantity: 32, updatedAt: new Date().toISOString() },
  { id: "vinv-15", branchId: "branch-3", vaccineId: "vac-5", quantity: 20, updatedAt: new Date().toISOString() },
];

export function initializeMockData() {
  // Force refresh users if not initialized or missing branchId for admin
  const existingUsers = localStorage.getItem("petcare_users");
  let needsRefresh = false;

  if (existingUsers) {
    try {
      const users = JSON.parse(existingUsers);
      // Check if data is valid
      if (!Array.isArray(users) || users.length === 0) {
        needsRefresh = true;
      }
      // Check if veterinarian account exists
      const vetExists = users.some((u: User) => u.email === "dr.smith@petcare.com");
      if (!vetExists) {
        needsRefresh = true;
      }
      // Check if admin has branchId (new requirement)
      const admin = users.find((u: User) => u.role === "admin");
      if (admin && !admin.branchId) {
        needsRefresh = true;
      }
    } catch (e) {
      needsRefresh = true;
    }
  }  // Force refresh if migration needed
  if (needsRefresh || !existingUsers) {
    localStorage.setItem("petcare_users", JSON.stringify(mockUsers));
    // Also update current user if logged in as admin
    const currentUser = localStorage.getItem("petcare_user");
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        if (user.role === "admin") {
          const updatedAdmin = mockUsers.find(u => u.role === "admin");
          if (updatedAdmin) {
            localStorage.setItem("petcare_user", JSON.stringify(updatedAdmin));
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }

  const existingBranches = localStorage.getItem("petcare_branches");
  if (!existingBranches) {
    localStorage.setItem("petcare_branches", JSON.stringify(mockBranches));
  }

  const existingPets = localStorage.getItem("petcare_pets");
  if (!existingPets) {
    localStorage.setItem("petcare_pets", JSON.stringify(mockPets));
  }

  const existingAppointments = localStorage.getItem("petcare_appointments");
  if (!existingAppointments) {
    localStorage.setItem("petcare_appointments", JSON.stringify(mockAppointments));
  }

  const existingMedications = localStorage.getItem("petcare_medications");
  if (!existingMedications) {
    localStorage.setItem("petcare_medications", JSON.stringify(mockMedications));
  }

  const existingServices = localStorage.getItem("petcare_services");
  if (!existingServices) {
    localStorage.setItem("petcare_services", JSON.stringify(mockServices));
  }

  const existingPetItems = localStorage.getItem("petcare_pet_items");
  if (!existingPetItems) {
    localStorage.setItem("petcare_pet_items", JSON.stringify(mockPetItems));
  }

  const existingInvoices = localStorage.getItem("petcare_invoices");
  if (!existingInvoices) {
    localStorage.setItem("petcare_invoices", JSON.stringify(mockInvoices));
  }

  const existingOrders = localStorage.getItem("petcare_orders");
  if (!existingOrders) {
    localStorage.setItem("petcare_orders", JSON.stringify(mockOrders));
  }

  const existingLoyalty = localStorage.getItem("petcare_loyalty");
  if (!existingLoyalty) {
    localStorage.setItem("petcare_loyalty", JSON.stringify(mockLoyaltyAccounts));
  }

  const existingMedicalRecords = localStorage.getItem("petcare_medical_records");
  if (!existingMedicalRecords) {
    localStorage.setItem("petcare_medical_records", JSON.stringify(mockMedicalRecords));
  }

  const existingServiceTypes = localStorage.getItem("petcare_service_types");
  if (!existingServiceTypes) {
    localStorage.setItem("petcare_service_types", JSON.stringify(mockServiceTypes));
  }

  const existingVaccines = localStorage.getItem("petcare_vaccines");
  if (!existingVaccines) {
    localStorage.setItem("petcare_vaccines", JSON.stringify(mockVaccines));
  }

  const existingVaccinePackages = localStorage.getItem("petcare_vaccine_packages");
  if (!existingVaccinePackages) {
    localStorage.setItem("petcare_vaccine_packages", JSON.stringify(mockVaccinePackages));
  }

  const existingGlobalPromotions = localStorage.getItem("petcare_global_promotions");
  if (!existingGlobalPromotions) {
    localStorage.setItem("petcare_global_promotions", JSON.stringify(mockGlobalPromotions));
  }

  const existingBranchPromotions = localStorage.getItem("petcare_branch_promotions");
  if (!existingBranchPromotions) {
    localStorage.setItem("petcare_branch_promotions", JSON.stringify(mockBranchPromotions));
  }

  const existingBranchInventory = localStorage.getItem("petcare_branch_inventory");
  if (!existingBranchInventory) {
    localStorage.setItem("petcare_branch_inventory", JSON.stringify(mockBranchInventory));
  }

  const existingStaffTransfers = localStorage.getItem("petcare_staff_transfers");
  if (!existingStaffTransfers) {
    localStorage.setItem("petcare_staff_transfers", JSON.stringify(mockStaffTransfers));
  }

  // Service Instances - Always refresh to get latest mock data
  localStorage.setItem("petcare_service_instances", JSON.stringify(mockServiceInstances));

  // Service Invoices - Always refresh to get latest mock data
  localStorage.setItem("petcare_service_invoices", JSON.stringify(mockServiceInvoices));

  // Initialize inventory data
  if (!localStorage.getItem("petcare_product_inventory")) {
    localStorage.setItem("petcare_product_inventory", JSON.stringify(mockProductInventory));
  }
  if (!localStorage.getItem("petcare_vaccine_inventory")) {
    localStorage.setItem("petcare_vaccine_inventory", JSON.stringify(mockVaccineInventory));
  }
}

// Helper function to reset all data (for development/testing)
export function resetMockData() {
  localStorage.clear();
  initializeMockData();
  console.log("✅ Mock data has been reset and reinitialized!");
}
