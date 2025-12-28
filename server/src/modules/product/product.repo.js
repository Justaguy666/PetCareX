import db from "../../config/db.js";
import * as Q from "./product.query.js";

class ProductRepo {
    listProducts = async (page = 1, limit = 12, search = '', category = 'all', sortBy = 'product_name', sortOrder = 'ASC') => {
        const offset = (page - 1) * limit;
        const params = [];
        let whereClause = '';

        if (category !== 'all') {
            params.push(category);
            whereClause += ` WHERE product_type = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            whereClause += whereClause ? ` AND ` : ` WHERE `;
            whereClause += `product_name ILIKE $${params.length}`;
        }

        const countQuery = Q.COUNT_PRODUCTS + whereClause;
        const countResult = await db.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        const allowedSortColumns = ['product_name', 'price', 'created_at'];
        const finalSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'product_name';
        const finalSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const dataParams = [...params, limit, offset];
        const dataQuery = Q.LIST_PRODUCTS + `
                    ${whereClause}
                    ORDER BY ${finalSortBy} ${finalSortOrder}
                    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`;

        const dataResult = await db.query(dataQuery, dataParams);

        return {
            products: dataResult.rows,
            totalCount
        };
    }
}

export default new ProductRepo();
