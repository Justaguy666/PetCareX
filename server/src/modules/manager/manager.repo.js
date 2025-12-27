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
  }
};

export default new ManagerRepo();