// For testing search functionality

import prisma from '../prisma/index.js';

async function verifySearch() {
    console.log("Starting Search Verification...");
    try {
        // Get a sample product to find a valid search term
        const sampleProduct = await prisma.product.findFirst();
        
        if (!sampleProduct) {
             console.log("No products found in DB. Please run 'npm run seed' first.");
             return;
        }

        console.log(`Sample Product: ${sampleProduct.product_name}`);
        
        // Pick a word from the name (e.g. "Practical Cotton Shirt" -> "Cotton")
        const words = sampleProduct.product_name.split(' ');
        const query = words[words.length - 1]; // Pick last word, usually a noun

        console.log(`Searching for: '${query}'`);
        
        // Simulate what the service does
        const formattedQuery = query.trim().replace(/\s+/g, ' & ');
        console.log(`Formatted Query: '${formattedQuery}'`);

        const results = await prisma.product.findMany({
            where: {
                OR: [
                    { product_name: { search: formattedQuery } },
                ]
            },
            select: {
                id: true,
                product_name: true,
            },
            take: 5
        });

        console.log(`Found ${results.length} results.`);
        console.log(JSON.stringify(results, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value
        , 2));

        if (results.length === 0) {
             console.log("No results found. This might be expected if no data matches, but ensure DB is seeded.");
        }

    } catch (error) {
        console.error("Verification Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySearch();
