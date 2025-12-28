import productService from "./product.service.js";

class ProductController {
    listProducts = async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || '';
        const category = req.query.category || 'all';
        const sortBy = req.query.sortBy || 'product_name';
        const sortOrder = req.query.sortOrder || 'ASC';

        const { products, totalCount } = await productService.listProducts(page, limit, search, category, sortBy, sortOrder);

        res.status(200).json({
            data: products,
            meta: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    }
}

export default new ProductController();
