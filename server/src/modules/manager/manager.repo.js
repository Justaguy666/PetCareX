import db from '../../config/db.js';
import * as Q from './manager.query.js';

class ManagerRepo {
  fetchRevenueStatistics = async (type) => {
    const query = type === 'branch' ? Q.GET_BRANCHES_REVENUE : Q.GET_DOCTORS_REVENUE;
    const { rows } = await db.query(query);
    return rows;
  };

  fetchAppointmentStatistics = async (branch_id) => {
    if (branch_id) {
      const { rows } = await db.query(Q.GET_APPOINTMENTS_BY_BRANCH, [branch_id]);
      return rows;
    }
    const { rows } = await db.query(Q.GET_APPOINTMENTS_ALL);
    return rows;
  };

  fetchProductRevenueStatistics = async (branch_id) => {
    if (branch_id) {
      const { rows } = await db.query(Q.GET_PRODUCTS_REVENUE_BY_BRANCH, [branch_id]);
      return rows;
    }
    const { rows } = await db.query(Q.GET_PRODUCTS_REVENUE_ALL);
    return rows;
  };
}

export default new ManagerRepo();