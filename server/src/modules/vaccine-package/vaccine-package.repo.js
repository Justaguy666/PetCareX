import db from '../../config/db.js';
import * as Q from './vaccine-package.query.js';

const vaccinePackageRepo = {
  getAllVaccinePackages: async () => {
    const { rows } = await db.query(Q.GET_ALL_VACCINE_PACKAGES);
    return rows;
  },
};

export default vaccinePackageRepo;
