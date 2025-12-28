import db from '../../config/db.js';
import * as Q from './sales.query.js';

class SalesRepo {
  getSalesBranch = async (accountId) => {
    const result = await db.query(Q.GET_SALES_BRANCH, [accountId]);
    return result.rows[0];
  };

  getBranchInventory = async (branchId) => {
    const result = await db.query(Q.GET_BRANCH_INVENTORY, [branchId]);
    return result.rows;
  };

  updateStock = async (branchId, productId, quantity) => {
    const result = await db.query(Q.UPDATE_STOCK, [branchId, productId, quantity]);
    return result.rows[0];
  };

  adjustStock = async (branchId, productId, adjustment) => {
    const result = await db.query(Q.ADJUST_STOCK, [branchId, productId, adjustment]);
    return result.rows[0];
  };

  getTodaySales = async (branchId) => {
    const result = await db.query(Q.GET_TODAY_SALES, [branchId]);
    return result.rows;
  };

  getSalesStats = async (branchId) => {
    const result = await db.query(Q.GET_SALES_STATS, [branchId]);
    return result.rows[0];
  };

  getPendingServiceInvoices = async (branchId) => {
    const result = await db.query(Q.GET_PENDING_SERVICE_INVOICES, [branchId]);
    return result.rows;
  };
}

export default new SalesRepo();
