import db from '../../config/db.js';
import * as Q from './branch.query.js';

class BranchRepo {
  fetchAllBranches = async () => {
    const { rows } = await db.query(Q.GET_ALL_BRANCHES);
    return rows;
  };

  fetchBranchById = async (branch_id) => {
    const { rows } = await db.query(Q.GET_BRANCH_BY_ID, [branch_id]);
    return rows[0];
  };
}

export default new BranchRepo();
