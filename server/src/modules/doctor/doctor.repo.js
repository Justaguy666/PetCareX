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

    createExamRecord = async ({ pet_id, doctor_id, diagnosis, conclusion, appointment_date, weight, temperature, blood_pressure, symptoms }) => {
        const values = [
            pet_id, 
            doctor_id, 
            diagnosis, 
            conclusion, 
            appointment_date || null,
            weight || null,
            temperature || null,
            blood_pressure || null,
            symptoms || null
        ];
        const { rows } = await db.query(Q.CREATE_EXAM_RECORD, values);
        return rows[0];
    };
}

export default new DoctorRepo();
