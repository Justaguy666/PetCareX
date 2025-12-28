import db from '../../config/db.js';
import * as Q from './branch.query.js';

class BranchRepo {
  fetchAllBranches = async () => {
    const query = `SELECT * FROM branches`;
    const { rows } = await db.query(query);
    return rows;
  };

  fetchBranchById = async (branch_id) => {
    const { rows } = await db.query(Q.GET_BRANCH_BY_ID, [branch_id]);
    return rows[0];
  };

  createBranch = async (branchData) => {
    const { name: branch_name, address, phone: phone_number } = branchData;
    const { rows } = await db.query(Q.CREATE_BRANCH, [branch_name, address, phone_number]);
    return rows[0];
  };

  updateBranch = async (id, branchData) => {
    const { name: branch_name, address, phone: phone_number } = branchData;
    const { rows } = await db.query(Q.UPDATE_BRANCH, [branch_name, address, phone_number, id]);
    return rows[0];
  };

  deleteBranch = async (id) => {
    await db.query(Q.DELETE_BRANCH, [id]);
  };
}

export default new BranchRepo();
