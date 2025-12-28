import doctorRepo from './doctor.repo.js';
import { NotFoundError } from "../../errors/app.error.js";

class DoctorService {
    getAssignedPets = async (accountId) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            throw new NotFoundError("Doctor profile not found for this account.");
        }
        return await doctorRepo.getAssignedPets(doctorId);
    };

    getTodayAppointments = async (accountId) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            throw new NotFoundError("Doctor profile not found for this account.");
        }
        return await doctorRepo.getTodayAppointments(doctorId);
    };

    createExamRecord = async (data, accountId) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
             throw new NotFoundError("Doctor profile not found for this account.");
        }
        
        // data contains pet_id, diagnosis, conclusion, appointment_date
        const result = await doctorRepo.createExamRecord({ ...data, doctor_id: doctorId });
        return result;
    };

    getVaccineInventory = async (accountId) => {
        const branchId = await doctorRepo.getDoctorBranch(accountId);
        if (!branchId) {
            throw new NotFoundError("Doctor branch not found.");
        }
        return await doctorRepo.getVaccineInventory(branchId);
    };

    getPackageInventory = async (accountId) => {
        const branchId = await doctorRepo.getDoctorBranch(accountId);
        if (!branchId) {
            throw new NotFoundError("Doctor branch not found.");
        }
        return await doctorRepo.getPackageInventory(branchId);
    };

    createSingleInjection = async (data, accountId) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            throw new NotFoundError("Doctor profile not found for this account.");
        }

        const branchId = await doctorRepo.getDoctorBranch(accountId);
        if (!branchId) {
            throw new NotFoundError("Doctor branch not found.");
        }

        const { pet_id, vaccine_id } = data;

        // Get pet owner
        const customerId = await doctorRepo.getPetOwner(pet_id);
        if (!customerId) {
            throw new NotFoundError("Pet owner not found.");
        }

        // Get vaccine price
        const price = await doctorRepo.getVaccinePrice(vaccine_id);
        if (!price) {
            throw new NotFoundError("Vaccine not found.");
        }

        // Deduct vaccine stock first
        const stockResult = await doctorRepo.deductVaccineStock(branchId, vaccine_id, 1);
        if (!stockResult) {
            throw new NotFoundError("Insufficient vaccine stock.");
        }

        // Create invoice
        const invoiceId = await doctorRepo.createInvoice(doctorId, branchId, customerId, price);
        
        // Create service
        const serviceId = await doctorRepo.createService(invoiceId, 'Tiêm mũi lẻ', price);
        
        // Create single injection record
        const injection = await doctorRepo.createSingleInjection(serviceId, pet_id, doctorId);

        return {
            success: true,
            message: "Single injection recorded successfully",
            service_id: serviceId,
            invoice_id: invoiceId,
            ...injection
        };
    };

    createPackageInjection = async (data, accountId) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            throw new NotFoundError("Doctor profile not found for this account.");
        }

        const branchId = await doctorRepo.getDoctorBranch(accountId);
        if (!branchId) {
            throw new NotFoundError("Doctor branch not found.");
        }

        const { pet_id, package_id, cycle_stage } = data;

        // Get pet owner
        const customerId = await doctorRepo.getPetOwner(pet_id);
        if (!customerId) {
            throw new NotFoundError("Pet owner not found.");
        }

        // Get package price
        const price = await doctorRepo.getPackagePrice(package_id);
        if (!price) {
            throw new NotFoundError("Package not found.");
        }

        // Create invoice
        const invoiceId = await doctorRepo.createInvoice(doctorId, branchId, customerId, price);
        
        // Create service
        const serviceId = await doctorRepo.createService(invoiceId, 'Tiêm theo gói', price);
        
        // Create package injection record
        const injection = await doctorRepo.createPackageInjection(serviceId, pet_id, doctorId);

        // Create vaccine package use record
        await doctorRepo.createVaccinePackageUse(serviceId, package_id, cycle_stage || 1);

        return {
            success: true,
            message: "Package injection recorded successfully",
            service_id: serviceId,
            invoice_id: invoiceId,
            ...injection
        };
    };

    confirmAppointment = async (appointmentId, accountId) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            throw new NotFoundError("Doctor profile not found for this account.");
        }

        const result = await doctorRepo.confirmAppointment(appointmentId, doctorId);
        if (!result) {
            throw new NotFoundError("Appointment not found or you don't have permission to confirm it.");
        }
        return result;
    };

    cancelAppointment = async (appointmentId, accountId, reason) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            throw new NotFoundError("Doctor profile not found for this account.");
        }

        const result = await doctorRepo.cancelAppointment(appointmentId, doctorId, reason);
        if (!result) {
            throw new NotFoundError("Appointment not found or you don't have permission to cancel it.");
        }
        return result;
    };

    getPendingAppointmentsCount = async (accountId) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            return 0;
        }
        return await doctorRepo.getPendingAppointmentsCount(doctorId);
    };

    getMedicalRecordsByPet = async (petId) => {
        return await doctorRepo.getMedicalRecordsByPet(petId);
    };

    getPetsByAppointmentType = async (accountId, serviceType) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            throw new NotFoundError("Doctor profile not found for this account.");
        }
        return await doctorRepo.getPetsByAppointmentType(doctorId, serviceType);
    };

    getPetFullHistory = async (petId) => {
        return await doctorRepo.getPetFullHistory(petId);
    };

    getMedicines = async () => {
        return await doctorRepo.getMedicines();
    };

    createExamRecordWithPrescriptions = async (data, accountId, prescriptions) => {
        const doctorId = await doctorRepo.getDoctorIdByAccountId(accountId);
        if (!doctorId) {
            throw new NotFoundError("Doctor profile not found for this account.");
        }
        
        // Create exam record (now includes invoice creation in the DB function)
        const examResult = await doctorRepo.createExamRecord({ ...data, doctor_id: doctorId });
        const serviceId = examResult.service_id;

        // Create prescriptions if any
        if (prescriptions && prescriptions.length > 0) {
            for (const p of prescriptions) {
                await doctorRepo.createPrescription(
                    serviceId,
                    p.medicine_id,
                    p.quantity,
                    p.dosage,
                    p.duration,
                    p.instructions
                );
            }
        }

        return { ...examResult, prescriptions_count: prescriptions?.length || 0 };
    };
}

export default new DoctorService();
