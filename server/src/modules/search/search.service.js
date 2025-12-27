import prisma from '../../prisma/index.js';

class SearchService {
    async searchProducts(query) {
        if (!query) return [];

        // Format query for Postgres to_tsquery if needed, 
        // effectively treating spaces as AND
        const formattedQuery = query.trim().replace(/\s+/g, ' & ');

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    {
                        product_name: {
                            search: formattedQuery,
                        },
                    },

                ],
            },
        });

        return products;
    }
}

export default new SearchService();
