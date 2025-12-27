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
}

export default new AppointmentRepo();
