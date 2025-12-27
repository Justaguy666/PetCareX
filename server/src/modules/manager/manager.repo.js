import db from '../../config/db.js';

class ManagerRepo {
  fetchRevenueStatistics = async (type) => {
    const query = (
      type === 'branch' ?
      `SELECT * FROM fn_statistics_branches_revenue()` :
      `SELECT * FROM fn_statistics_doctors_revenue()`
    );

    const { rows } = await db.query(query);

    return rows;
  };

  fetchAppointmentStatistics = async (branch_id) => {
    const query = (
      branch_id ?
      `SELECT * FROM fn_statistic_appointments_by_branch($1)` :
      `SELECT * FROM fn_statistic_appointments_all()` 
    )

    const values = branch_id ? [branch_id] : [];
      
    const { rows } = await db.query(query, values);

    return rows;
  };

  fetchProductRevenueStatistics = async (branch_id) => {
    const query = (
      branch_id ?
      `SELECT * FROM fn_statistics_products_revenue_by_branch($1)` :
      `SELECT * FROM fn_statistics_products_revenue_all()`
    )
    
    const values = branch_id ? [branch_id] : [];

    const { rows } = await db.query(query, values);

    return rows;
  };
};

export default new ManagerRepo();