import db from '../../config/db.js';

class DoctorRepo {
    getDoctorIdByAccountId = async (accountId) => {
        const query = `SELECT employee_id FROM accounts WHERE id = $1`;
        const { rows } = await db.query(query, [accountId]);
        return rows[0]?.employee_id;
    };

    createExamRecord = async ({ pet_id, doctor_id, diagnosis, conclusion, appointment_date, weight, temperature, blood_pressure, symptoms }) => {
        const query = `
            SELECT fn_create_exam_record($1, $2, $3, $4, $5, $6, $7, $8, $9) as service_id
        `;
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

        const { rows } = await db.query(query, values);
        return rows[0];
    };
}

export default new DoctorRepo();
