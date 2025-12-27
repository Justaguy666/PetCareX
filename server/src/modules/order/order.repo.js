import db from "../../config/db.js";

class OrderRepo {
    buy = async (userId, branchId, items, paymentMethod) => {
        const query = `
          SELECT fn_buy_product($1::bigint, $2::bigint, $3::jsonb, $4::payment_method) AS invoice_id
        `;

        const values = [userId, branchId, JSON.stringify(items), paymentMethod];

        const { rows } = await db.query(query, values);
        return rows[0].invoice_id;
    }
}

export default new OrderRepo();