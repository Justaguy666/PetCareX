import db from '../../config/db.js';
import * as Q from './vaccine.query.js';

const vaccineRepo = {
  getAllVaccines: async () => {
    const { rows } = await db.query(Q.GET_ALL_VACCINES);
    return rows;
  },
};

export default vaccineRepo;
