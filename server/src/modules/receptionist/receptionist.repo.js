import db from '../../config/db.js';
import * as Q from './receptionist.query.js';

class ReceptionistRepo {
  getTodayAppointments = async (branchId) => {
    const result = await db.query(Q.GET_TODAY_APPOINTMENTS, [branchId]);
    return result.rows;
  };

  getBranchAppointments = async (branchId, date) => {
    let query = Q.GET_BRANCH_APPOINTMENTS;
    const params = [branchId];
    
    if (date) {
      query += ` AND DATE(a.appointment_time) = $2`;
      params.push(date);
    }
    
    query += ` ORDER BY a.appointment_time DESC`;
    const result = await db.query(query, params);
    return result.rows;
  };

  checkinAppointment = async (appointmentId) => {
    const result = await db.query(Q.CHECKIN_APPOINTMENT, [appointmentId]);
    return result.rows[0];
  };

  searchCustomers = async (searchTerm) => {
    const result = await db.query(Q.SEARCH_CUSTOMERS, [`%${searchTerm}%`]);
    return result.rows;
  };

  getCustomerPets = async (customerId) => {
    const result = await db.query(Q.GET_CUSTOMER_PETS, [customerId]);
    return result.rows;
  };

  getAvailableDoctors = async (branchId) => {
    const result = await db.query(Q.GET_AVAILABLE_DOCTORS, [branchId]);
    return result.rows;
  };

  getReceptionistBranch = async (accountId) => {
    const result = await db.query(Q.GET_RECEPTIONIST_BRANCH, [accountId]);
    return result.rows[0];
  };
}

export default new ReceptionistRepo();
