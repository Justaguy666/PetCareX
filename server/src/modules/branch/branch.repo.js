import db from '../../config/db.js';

class BranchRepo {
  fetchAllBranches = async () => {
    const query = `SELECT *
                   FROM branches`;

    const { rows } = await db.query (query);

    return rows;
  };

  fetchBranchById = async (branch_id) => {
    const query = `SELECT *
                   FROM branches
                   WHERE id = $1`;
                   
    const { rows } = await db.query (query, [branch_id]);

    return rows[0];
  };
};

export default new BranchRepo();
