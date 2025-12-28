import db from '../../config/db.js';
import * as Q from './item.query.js';

const itemRepo = {
  getAllItems: async () => {
    const { rows } = await db.query(Q.GET_ALL_ITEMS);
    return rows;
  },
};

export default itemRepo;
