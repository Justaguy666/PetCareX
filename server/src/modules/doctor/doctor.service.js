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
}

export default new DoctorService();
