import productRepo from "./product.repo.js";

class ProductService {
    listProducts = async (page, limit, search, category, sortBy, sortOrder) => {
        return productRepo.listProducts(page, limit, search, category, sortBy, sortOrder);
    }
}

export default new ProductService();
