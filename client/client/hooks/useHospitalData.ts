import { useState, useCallback, useEffect } from "react";
import {
  User,
  Branch,
  Pet,
  Appointment,
  Medication,
  Service,
  PetItem,
  Invoice,
  MedicationUsage,
  MedicalRecord,
  Vaccination,
} from "@shared/types";

// Generic hook for managing data stored in localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error writing to localStorage key ${key}:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

// Branches
export const useBranches = () => {
  const [branches, setBranches] = useLocalStorage<Branch[]>("petcare_branches", []);

  const getBranch = useCallback((id: string) => branches.find((b) => b.id === id), [branches]);

  const createBranch = useCallback(
    (branch: Omit<Branch, "id" | "createdAt">) => {
      const newBranch: Branch = {
        ...branch,
        id: `branch-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setBranches([...branches, newBranch]);
      return newBranch;
    },
    [branches, setBranches]
  );

  const updateBranch = useCallback(
    (id: string, updates: Partial<Branch>) => {
      setBranches(branches.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    },
    [branches, setBranches]
  );

  const deleteBranch = useCallback(
    (id: string) => {
      setBranches(branches.filter((b) => b.id !== id));
    },
    [branches, setBranches]
  );

  return { branches, getBranch, createBranch, updateBranch, deleteBranch };
};

// Users/Staff
export const useUsers = () => {
  const [users, setUsers] = useLocalStorage<User[]>("petcare_users", []);

  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  const getUsersByRole = useCallback((role: string) => users.filter((u) => u.role === role), [users]);

  const getUsersByBranch = useCallback(
    (branchId: string) => users.filter((u) => u.branchId === branchId),
    [users]
  );

  const createUser = useCallback(
    (user: Omit<User, "id" | "createdAt">) => {
      const newUser: User = {
        ...user,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      return newUser;
    },
    [users, setUsers]
  );

  const updateUser = useCallback(
    (id: string, updates: Partial<User>) => {
      setUsers(users.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    },
    [users, setUsers]
  );

  const deleteUser = useCallback(
    (id: string) => {
      setUsers(users.filter((u) => u.id !== id));
    },
    [users, setUsers]
  );

  return { users, getUser, getUsersByRole, getUsersByBranch, createUser, updateUser, deleteUser };
};

// Pets
export const usePets = () => {
  const [pets, setPets] = useLocalStorage<Pet[]>("petcare_pets", []);

  const getPet = useCallback((id: string) => pets.find((p) => p.id === id), [pets]);

  const getPetsByCustomer = useCallback(
    (customerId: string) => pets.filter((p) => p.customerId === customerId),
    [pets]
  );

  const createPet = useCallback(
    (pet: Omit<Pet, "id" | "createdAt" | "medicalHistory" | "vaccinations">) => {
      const newPet: Pet = {
        ...pet,
        id: `pet-${Date.now()}`,
        medicalHistory: [],
        vaccinations: [],
        createdAt: new Date().toISOString(),
      };
      setPets([...pets, newPet]);
      return newPet;
    },
    [pets, setPets]
  );

  const updatePet = useCallback(
    (id: string, updates: Partial<Pet>) => {
      setPets(pets.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    },
    [pets, setPets]
  );

  return { pets, getPet, getPetsByCustomer, createPet, updatePet };
};

// Appointments
export const useAppointments = () => {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>("petcare_appointments", []);

  const getAppointment = useCallback((id: string) => appointments.find((a) => a.id === id), [appointments]);

  const getAppointmentsByCustomer = useCallback(
    (customerId: string) => appointments.filter((a) => a.customerId === customerId),
    [appointments]
  );

  const getAppointmentsByBranch = useCallback(
    (branchId: string) => appointments.filter((a) => a.branchId === branchId),
    [appointments]
  );

  const getAppointmentsByVeterinarian = useCallback(
    (veterinarianId: string) =>
      appointments.filter((a) => a.veterinarianId === veterinarianId),
    [appointments]
  );

  const createAppointment = useCallback(
    (apt: Omit<Appointment, "id" | "createdAt">) => {
      const newApt: Appointment = {
        ...apt,
        id: `apt-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setAppointments([...appointments, newApt]);
      return newApt;
    },
    [appointments, setAppointments]
  );

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Appointment>) => {
      setAppointments(
        appointments.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    },
    [appointments, setAppointments]
  );

  const assignVeterinarian = useCallback(
    (appointmentId: string, veterinarianId: string) => {
      updateAppointment(appointmentId, { veterinarianId });
    },
    [updateAppointment]
  );

  const deleteAppointment = useCallback(
    (id: string) => {
      setAppointments(appointments.filter((a) => a.id !== id));
    },
    [appointments, setAppointments]
  );

  return {
    appointments,
    getAppointment,
    getAppointmentsByCustomer,
    getAppointmentsByBranch,
    getAppointmentsByVeterinarian,
    createAppointment,
    updateAppointment,
    assignVeterinarian,
    deleteAppointment,
  };
};

// Medications
export const useMedications = () => {
  const [medications, setMedications] = useLocalStorage<Medication[]>("petcare_medications", []);
  const [usage, setUsage] = useLocalStorage<MedicationUsage[]>("petcare_medication_usage", []);

  const getMedication = useCallback((id: string) => medications.find((m) => m.id === id), [medications]);

  const getMedicationsByBranch = useCallback(
    (branchId: string) => medications.filter((m) => m.branchId === branchId),
    [medications]
  );

  const getExpiredMedications = useCallback(
    () =>
      medications.filter((m) => {
        const expiryDate = new Date(m.expiryDate);
        return expiryDate < new Date();
      }),
    [medications]
  );

  const getLowStockMedications = useCallback(
    () => medications.filter((m) => m.quantity <= m.reorderLevel),
    [medications]
  );

  const createMedication = useCallback(
    (med: Omit<Medication, "id">) => {
      const newMed: Medication = {
        ...med,
        id: `med-${Date.now()}`,
      };
      setMedications([...medications, newMed]);
      return newMed;
    },
    [medications, setMedications]
  );

  const updateMedication = useCallback(
    (id: string, updates: Partial<Medication>) => {
      setMedications(medications.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    },
    [medications, setMedications]
  );

  const useMedication = useCallback(
    (medicationId: string, appointmentId: string, quantityUsed: number, usedBy: string) => {
      const medication = medications.find((m) => m.id === medicationId);
      if (!medication) return;

      updateMedication(medicationId, { quantity: medication.quantity - quantityUsed });

      const newUsage: MedicationUsage = {
        id: `usage-${Date.now()}`,
        medicationId,
        appointmentId,
        quantityUsed,
        usedDate: new Date().toISOString(),
        usedBy,
      };

      setUsage([...usage, newUsage]);
    },
    [medications, updateMedication, usage, setUsage]
  );

  const getMedicationUsageHistory = useCallback(
    (medicationId: string) => usage.filter((u) => u.medicationId === medicationId),
    [usage]
  );

  const deleteMedication = useCallback(
    (id: string) => {
      setMedications(medications.filter((m) => m.id !== id));
    },
    [medications, setMedications]
  );

  return {
    medications,
    usage,
    getMedication,
    getMedicationsByBranch,
    getExpiredMedications,
    getLowStockMedications,
    createMedication,
    updateMedication,
    useMedication,
    getMedicationUsageHistory,
    deleteMedication,
  };
};

// Services
export const useServices = () => {
  const [services, setServices] = useLocalStorage<Service[]>("petcare_services", []);

  const getService = useCallback((id: string) => services.find((s) => s.id === id), [services]);

  const getServicesByBranch = useCallback(
    (branchId: string) => services.filter((s) => s.branchId === branchId),
    [services]
  );

  const createService = useCallback(
    (service: Omit<Service, "id" | "reviews">) => {
      const newService: Service = {
        ...service,
        id: `svc-${Date.now()}`,
        reviews: [],
      };
      setServices([...services, newService]);
      return newService;
    },
    [services, setServices]
  );

  const updateService = useCallback(
    (id: string, updates: Partial<Service>) => {
      setServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    },
    [services, setServices]
  );

  return { services, getService, getServicesByBranch, createService, updateService };
};

// Pet Items
export const usePetItems = () => {
  const [items, setItems] = useLocalStorage<PetItem[]>("petcare_pet_items", []);

  const getItem = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  const getItemsByBranch = useCallback(
    (branchId: string) => items.filter((i) => i.branchId === branchId),
    [items]
  );

  const createItem = useCallback(
    (item: Omit<PetItem, "id">) => {
      const newItem: PetItem = {
        ...item,
        id: `item-${Date.now()}`,
      };
      setItems([...items, newItem]);
      return newItem;
    },
    [items, setItems]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<PetItem>) => {
      setItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    },
    [items, setItems]
  );

  const deleteItem = useCallback(
    (id: string) => {
      setItems(items.filter((i) => i.id !== id));
    },
    [items, setItems]
  );

  return { items, getItem, getItemsByBranch, createItem, updateItem, deleteItem };
};

// Invoices
export const useInvoices = () => {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>("petcare_invoices", []);

  const getInvoice = useCallback((id: string) => invoices.find((i) => i.id === id), [invoices]);

  const getInvoicesByCustomer = useCallback(
    (customerId: string) => invoices.filter((i) => i.customerId === customerId),
    [invoices]
  );

  const getInvoicesByBranch = useCallback(
    (branchId: string) => invoices.filter((i) => i.branchId === branchId),
    [invoices]
  );

  const createInvoice = useCallback(
    (invoice: Omit<Invoice, "id" | "createdAt">) => {
      const newInvoice: Invoice = {
        ...invoice,
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setInvoices([...invoices, newInvoice]);
      return newInvoice;
    },
    [invoices, setInvoices]
  );

  const updateInvoice = useCallback(
    (id: string, updates: Partial<Invoice>) => {
      setInvoices(invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    },
    [invoices, setInvoices]
  );

  const deleteInvoice = useCallback(
    (id: string) => {
      setInvoices(invoices.filter((i) => i.id !== id));
    },
    [invoices, setInvoices]
  );

  return { invoices, getInvoice, getInvoicesByCustomer, getInvoicesByBranch, createInvoice, updateInvoice, deleteInvoice };
};
