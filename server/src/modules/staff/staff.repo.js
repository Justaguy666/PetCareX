import db from '../../config/db.js';
import * as Q from './staff.query.js';

const staffRepo = {
  getAllStaff: async () => {
    const { rows } = await db.query(Q.GET_ALL_STAFF);
    return rows;
  },

  createStaff: async (fullName, role, email, hashedPassword, branchId) => {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      const employeeRes = await client.query(Q.CREATE_EMPLOYEE, [fullName, role]);
      const employeeId = employeeRes.rows[0].id;

      const accountType = role; // Assuming employee_role enum matches account_type enum
      await client.query(Q.CREATE_ACCOUNT, [email, hashedPassword, employeeId, accountType]);

      if (branchId) {
        await client.query(Q.CREATE_MOBILIZATION, [employeeId, branchId]);
      }

      await client.query('COMMIT');
      
      return { id: employeeId, fullName, email, role, branchId };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

export default staffRepo;
