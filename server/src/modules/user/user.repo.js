import db from "../../config/db.js";

class UserRepo {
    listOrders = async (user_id) => {
        const query = `
            SELECT
              i.id                         AS invoice_id,
              i.customer_id,
              i.branch_id,
              i.payment_method,
              i.total_amount,
              i.total_discount,
              i.final_amount,
              i.created_at,
              i.updated_at,

              s.id                         AS service_id,
              s.type_of_service,

              jsonb_agg(
                jsonb_build_object(
                  'product_id',   p.id,
                  'product_name', p.product_name,
                  'product_type', p.product_type,
                  'quantity',     sp.quantity,
                  'price',        p.price
                )
                ORDER BY p.id
              ) AS items
            FROM invoices i
            JOIN services s       ON s.invoice_id = i.id
            JOIN sell_products sp ON sp.service_id = s.id
            JOIN products p       ON p.id = sp.product_id
            WHERE i.customer_id = $1
            GROUP BY
              i.id, i.customer_id, i.branch_id, i.payment_method,
              i.total_amount, i.total_discount, i.final_amount,
              i.created_at, i.updated_at,
              s.id, s.type_of_service
            ORDER BY i.created_at DESC, i.id DESC;
        `;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }

    listAppointments = async (user_id) => {
        const query =  `SELECT *
                        FROM appointments
                        WHERE owner_id = $1
                        ORDER BY appointment_time DESC`;
        const result = await db.query(query, [user_id]);
        return result.rows;
    }
}

export default new UserRepo();