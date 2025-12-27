import prisma from '../../prisma/index.js';

class SearchService {
    async searchItems(query, category = 'all') {
        const results = [];
        const cleanQuery = query ? query.trim().replace(/\s+/g, ' & ') : undefined;

        // Helper to format price
        const formatItem = (item, type, categoryLabel) => ({
            id: item.id.toString(), // Convert BigInt
            name: item.product_name || item.medicine_name,
            category: categoryLabel || type,
            price: parseFloat(item.price),
            description: item.description || "",
            image: "", // Placeholder as DB doesn't have image
            stock: 0, // Placeholder
        });

        const promises = [];

        // 1. Search Products
        // Categories: food, toy, accessory -> map to ProductType
        // ProductType enum: ThucAn (Food), PhuKien (Accessory/Toy)
        if (['all', 'food', 'toy', 'accessory'].includes(category)) {
            let typeFilter = undefined;
            if (category === 'food') typeFilter = 'ThucAn';
            if (category === 'accessory' || category === 'toy') typeFilter = 'PhuKien';

            const where = {};
            if (cleanQuery) {
                where.product_name = { search: cleanQuery };
            }
            if (typeFilter) {
                where.product_type = typeFilter;
            }

            const productPromise = prisma.product.findMany({
                where,
                take: 20
            }).then(items => {
                return items.map(i => {
                    const cat = i.product_type === 'ThucAn' ? 'food' : 'accessory';
                    return formatItem(i, 'product', cat);
                });
            });
            promises.push(productPromise);
        }

        // 2. Search Medicines
        if (['all', 'medication'].includes(category)) {
            const where = {};
            // Enable full text search on medicine_name and description if feasible
            // Or use OR with search
            if (cleanQuery) {
                where.OR = [
                    { medicine_name: { search: cleanQuery } },
                    { description: { search: cleanQuery } }
                ];
            }

            const medicinePromise = prisma.medicine.findMany({
                where,
                take: 20
            }).then(items => {
                return items.map(i => formatItem(i, 'medication', 'medication'));
            });
            promises.push(medicinePromise);
        }

        const resultsArrays = await Promise.all(promises);
        
        // Flatten and maybe sort by closeness or just concat
        const allResults = resultsArrays.flat();
        
        return allResults;
    }
}

export default new SearchService();
