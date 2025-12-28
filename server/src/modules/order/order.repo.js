import db from "../../config/db.js";
import * as Q from "./order.query.js";

class OrderRepo {
    buy = async (userId, branchId, items, paymentMethod) => {
        const values = [userId, branchId, JSON.stringify(items), paymentMethod];
        const { rows } = await db.query(Q.BUY_PRODUCT, values);
        return rows[0].invoice_id;
    }
}

export default new OrderRepo();