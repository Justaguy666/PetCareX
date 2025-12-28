import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MedicalRecord } from "@shared/types";

interface MedicalRecordsContextType {
    records: MedicalRecord[];
    getAllRecords: () => MedicalRecord[];
    getRecordById: (id: string) => MedicalRecord | undefined;
    getRecordsByPetId: (petId: string) => MedicalRecord[];
    getRecordsByCustomerId: (customerId: string) => MedicalRecord[];
    getRecordsByVeterinarianId: (vetId: string) => MedicalRecord[];
    addRecord: (record: Omit<MedicalRecord, "id" | "createdAt">) => MedicalRecord;
    updateRecord: (id: string, updates: Partial<MedicalRecord>) => void;
    deleteRecord: (id: string) => void;
    refreshRecords: () => void;
}

const MedicalRecordsContext = createContext<MedicalRecordsContextType | undefined>(undefined);

const STORAGE_KEY = "petcare_medical_records";

export function MedicalRecordsProvider({ children }: { children: ReactNode }) {
    const [records, setRecords] = useState<MedicalRecord[]>([]);

    // Load records from localStorage on mount
    useEffect(() => {
        // TODO: replace localStorage with backend API calls when available.
        // Preferred endpoints (backend):
        // - GET /api/pets/:petId/medical-records -> returns [{ id, petId, petName, veterinarianName, diagnosis, symptoms, prescription[], followUpDate, createdAt, ... }]
        // - OR GET /api/me/medical-records -> returns all records for authenticated customer's pets
        // If these endpoints are implemented, call them here and populate `records`.
        loadRecords();
    }, []);

    const loadRecords = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setRecords(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load medical records:", error);
        }
    };

    const saveRecords = (newRecords: MedicalRecord[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
            setRecords(newRecords);
        } catch (error) {
            console.error("Failed to save medical records:", error);
        }
    };

    const getAllRecords = () => records;

    const getRecordById = (id: string) => {
        return records.find((r) => r.id === id);
    };

    const getRecordsByPetId = (petId: string) => {
        return records.filter((r) => r.petId === petId);
    };

    const getRecordsByCustomerId = (customerId: string) => {
        return records.filter((r) => r.customerId === customerId);
    };

    const getRecordsByVeterinarianId = (vetId: string) => {
        return records.filter((r) => r.veterinarianId === vetId);
    };

    const addRecord = (recordData: Omit<MedicalRecord, "id" | "createdAt">) => {
        const newRecord: MedicalRecord = {
            ...recordData,
            id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        const updatedRecords = [...records, newRecord];
        saveRecords(updatedRecords);
        return newRecord;
    };

    const updateRecord = (id: string, updates: Partial<MedicalRecord>) => {
        const updatedRecords = records.map((record) =>
            record.id === id ? { ...record, ...updates } : record
        );
        saveRecords(updatedRecords);
    };

    const deleteRecord = (id: string) => {
        const updatedRecords = records.filter((record) => record.id !== id);
        saveRecords(updatedRecords);
    };

    const refreshRecords = () => {
        loadRecords();
    };

    return (
        <MedicalRecordsContext.Provider
            value={{
                records,
                getAllRecords,
                getRecordById,
                getRecordsByPetId,
                getRecordsByCustomerId,
                getRecordsByVeterinarianId,
                addRecord,
                updateRecord,
                deleteRecord,
                refreshRecords,
            }}
        >
            {children}
        </MedicalRecordsContext.Provider>
    );
}

export function useMedicalRecords() {
    const context = useContext(MedicalRecordsContext);
    if (!context) {
        throw new Error("useMedicalRecords must be used within MedicalRecordsProvider");
    }
    return context;
}
