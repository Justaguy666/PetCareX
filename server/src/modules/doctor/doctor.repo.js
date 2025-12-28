import db from '../../config/db.js';
import * as Q from './doctor.query.js';

class DoctorRepo {
    getDoctorIdByAccountId = async (accountId) => {
        const { rows } = await db.query(Q.GET_DOCTOR_ID_BY_ACCOUNT, [accountId]);
        return rows[0]?.employee_id;
    };

    getAssignedPets = async (doctorId) => {
        const { rows } = await db.query(Q.GET_ASSIGNED_PETS, [doctorId]);
        return rows;
    };

    getTodayAppointments = async (doctorId) => {
        const { rows } = await db.query(Q.GET_TODAY_APPOINTMENTS, [doctorId]);
        return rows;
    };

    createExamRecord = async ({ pet_id, doctor_id, diagnosis, conclusion, appointment_date }) => {
        const values = [
            pet_id, 
            doctor_id, 
            diagnosis, 
            conclusion, 
            appointment_date || null
        ];
        const { rows } = await db.query(Q.CREATE_EXAM_RECORD, values);
        return rows[0];
    };

    getDoctorBranch = async (accountId) => {
        const { rows } = await db.query(Q.GET_DOCTOR_BRANCH, [accountId]);
        return rows[0]?.branch_id;
    };

    getVaccineInventory = async (branchId) => {
        const { rows } = await db.query(Q.GET_VACCINE_INVENTORY_BY_BRANCH, [branchId]);
        return rows;
    };

    getPackageInventory = async (branchId) => {
        const { rows } = await db.query(Q.GET_PACKAGE_INVENTORY_BY_BRANCH, [branchId]);
        return rows;
    };

    deductVaccineStock = async (branchId, vaccineId, quantity) => {
        const { rows } = await db.query(Q.DEDUCT_VACCINE_STOCK, [branchId, vaccineId, quantity]);
        return rows[0];
    };

    createInvoice = async (doctorId, branchId, customerId, totalAmount) => {
        const { rows } = await db.query(Q.CREATE_INVOICE, [doctorId, branchId, customerId, totalAmount]);
        return rows[0]?.id;
    };

    createService = async (invoiceId, serviceType, unitPrice) => {
        const { rows } = await db.query(Q.CREATE_SERVICE, [invoiceId, serviceType, unitPrice]);
        return rows[0]?.id;
    };

    createSingleInjection = async (serviceId, petId, doctorId) => {
        const { rows } = await db.query(Q.CREATE_SINGLE_INJECTION, [serviceId, petId, doctorId]);
        return rows[0];
    };

    getPetOwner = async (petId) => {
        const { rows } = await db.query(Q.GET_PET_OWNER, [petId]);
        return rows[0]?.owner_id;
    };

    getVaccinePrice = async (vaccineId) => {
        const { rows } = await db.query(Q.GET_VACCINE_PRICE, [vaccineId]);
        return rows[0]?.price;
    };

    getPackagePrice = async (packageId) => {
        const { rows } = await db.query(Q.GET_PACKAGE_PRICE, [packageId]);
        return rows[0]?.price;
    };

    createPackageInjection = async (serviceId, petId, doctorId) => {
        const { rows } = await db.query(Q.CREATE_PACKAGE_INJECTION, [serviceId, petId, doctorId]);
        return rows[0];
    };

    createVaccinePackageUse = async (packageInjectionId, packageId, injectionNumber) => {
        const { rows } = await db.query(Q.CREATE_VACCINE_PACKAGE_USE, [packageInjectionId, packageId, injectionNumber]);
        return rows[0];
    };

    confirmAppointment = async (appointmentId, doctorId) => {
        const { rows } = await db.query(Q.CONFIRM_APPOINTMENT, [appointmentId, doctorId]);
        return rows[0];
    };

    cancelAppointment = async (appointmentId, doctorId, reason) => {
        const { rows } = await db.query(Q.CANCEL_APPOINTMENT, [appointmentId, doctorId, reason || null]);
        return rows[0];
    };

    getPendingAppointmentsCount = async (doctorId) => {
        const { rows } = await db.query(Q.GET_PENDING_APPOINTMENTS_COUNT, [doctorId]);
        return parseInt(rows[0]?.count || 0);
    };

    getMedicalRecordsByPet = async (petId) => {
        const { rows } = await db.query(Q.GET_MEDICAL_RECORDS_BY_PET, [petId]);
        return rows;
    };

    getPetsByAppointmentType = async (doctorId, serviceType) => {
        const { rows } = await db.query(Q.GET_PETS_BY_APPOINTMENT_TYPE, [doctorId, serviceType]);
        return rows;
    };

    getPetFullHistory = async (petId) => {
        const { rows } = await db.query(Q.GET_PET_FULL_HISTORY, [petId]);
        return rows;
    };

    getMedicines = async () => {
        const { rows } = await db.query(Q.GET_MEDICINES);
        return rows;
    };

    createPrescription = async (medicalExamId, medicineId, quantity, dosage, duration, instructions) => {
        const { rows } = await db.query(Q.CREATE_PRESCRIPTION, [
            medicalExamId, medicineId, quantity, dosage, duration, instructions || null
        ]);
        return rows[0];
    };
}

export default new DoctorRepo();
