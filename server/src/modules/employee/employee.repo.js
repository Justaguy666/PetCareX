import db from '../../config/db.js';

class EmployeeRepo {
  insertAppointment = async ({ customer_id, pet_id, branch_id, doctor_id, appointment_time }) => {
    const query = `SELECT fn_create_appointment($1, $2, $3, $4, $5) AS appointment_id`;

    const values = [customer_id, pet_id, branch_id, doctor_id, appointment_time];

    const { rows } = await db.query(query, values);
    return rows[0]?.appointment_id;
  };

  fetchPetById = async (petId) => {
    const query = `
      SELECT p.*, la.id AS last_appointment_id, la.appointment_time AS last_appointment_time
      FROM pets p
      LEFT JOIN LATERAL (
        SELECT id, appointment_time
        FROM appointments
        WHERE pet_id = p.id AND status = 'Hoàn thành'
        ORDER BY appointment_time DESC
        LIMIT 1
      ) la ON true
      WHERE p.id = $1
    `;

    const { rows } = await db.query(query, [petId]);
    return rows[0];
  };
}

export default new EmployeeRepo();