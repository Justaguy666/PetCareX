import db from '../../config/db.js';

class AppointmentRepo {
  listAppointments = async (doctor, date) => {
    const query =  `SELECT *
                    FROM appointments
                    WHERE doctor_id = $1
                    AND appointment_time::date = $2
                    ORDER BY appointment_time`;
    const result = await db.query(query, [doctor, date]);
    return result.rows;
  };

  insertAppointment = async ({ customer_id, pet_id, branch_id, doctor_id, appointment_time }) => {
    const query = `SELECT fn_create_appointment($1, $2, $3, $4, $5) AS appointment_id`;
    const values = [customer_id, pet_id, branch_id, doctor_id, appointment_time];
    const { rows } = await db.query(query, values);
    return rows[0]?.appointment_id;
  };
}

export default new AppointmentRepo();
