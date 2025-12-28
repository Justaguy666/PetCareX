import db from '../../config/db.js';
import * as Q from './inventory.query.js';

const inventoryRepo = {
  getProductInventory: async () => {
    const { rows } = await db.query(Q.GET_PRODUCT_INVENTORY);
    return rows;
  },
  getVaccineInventory: async () => {
    const { rows } = await db.query(Q.GET_VACCINE_INVENTORY);
    return rows;
  },
  getPackageInventory: async () => {
    const { rows } = await db.query(Q.GET_PACKAGE_INVENTORY);
    return rows;
  },
};

export default inventoryRepo;
