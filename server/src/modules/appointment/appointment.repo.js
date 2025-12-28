import db from '../../config/db.js';
import * as Q from './appointment.query.js';

class AppointmentRepo {
  listAppointments = async (doctor, date, ownerId) => {
    let query = Q.LIST_APPOINTMENTS_BASE;
    const values = [];
    let paramIndex = 1;

    if (ownerId) {
      query += ` AND a.owner_id = $${paramIndex++}`;
      values.push(ownerId);
    }
    if (doctor) {
      query += ` AND a.doctor_id = $${paramIndex++}`;
      values.push(doctor);
    }
    if (date) {
      query += ` AND a.appointment_time::date = $${paramIndex++}`;
      values.push(date);
    }

    query += ` ORDER BY a.appointment_time DESC`;
    const result = await db.query(query, values);
    return result.rows;
  };

  insertAppointment = async ({ customer_id, owner_id, pet_id, branch_id, doctor_id, appointment_time, service_type }) => {
    const customerId = customer_id || owner_id;
    const values = [customerId, pet_id, branch_id, doctor_id, appointment_time, service_type || 'Khám bệnh'];
    const { rows } = await db.query(Q.INSERT_APPOINTMENT, values);
    return rows[0]?.appointment_id;
  };

  updateAppointment = async (id, updateData) => {
    const { appointment_time, doctor_id, status } = updateData;
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (appointment_time) {
      updates.push(`appointment_time = $${paramIndex++}`);
      values.push(appointment_time);
    }
    if (doctor_id) {
      updates.push(`doctor_id = $${paramIndex++}`);
      values.push(doctor_id);
    }
    if (status) {
      updates.push(`status = $${paramIndex++}::status`);
      values.push(status);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const { rows } = await db.query(query, values);
    return rows[0];
  };

  updateAppointmentStatus = async (id, status) => {
    const { rows } = await db.query(Q.UPDATE_APPOINTMENT_STATUS, [status, id]);
    return rows[0];
  };
}

export default new AppointmentRepo();
