import prisma from '../prisma/index.js';
import searchService from '../modules/search/search.service.js';

async function verifyUnifiedSearch() {
    console.log("Starting Unified Search Verification...");
    try {
        // 1. Get a sample product
        const product = await prisma.product.findFirst();
        // 2. Get a sample medicine
        const medicine = await prisma.medicine.findFirst();

        if (product) {
            const words = product.product_name.split(' ');
            const q = words[words.length - 1];
            console.log(`\nTesting Product Search ['${q}', category='product']...`);
            // We pass 'food' or 'accessory' depending on type to match logic, or just 'all'
            // Let's test 'all'
            const res = await searchService.searchItems(q, 'all');
            console.log(`Found ${res.length} items.`);
            console.log(JSON.stringify(res.slice(0,2), (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));
        }

        if (medicine) {
            const words = medicine.medicine_name.split(' ');
            const q = words[words.length - 1];
            console.log(`\nTesting Medicine Search ['${q}', category='medication']...`);
            const res = await searchService.searchItems(q, 'medication');
            console.log(`Found ${res.length} items.`);
            console.log(JSON.stringify(res.slice(0,2), (k,v) => typeof v === 'bigint' ? v.toString() : v, 2));
        }

        // Test Category Filtering
        console.log(`\nTesting Category Filtering (expected 0 medicines when category='food')...`);
        const resFiltered = await searchService.searchItems('', 'food'); // Empty query = all? Logic check
        // My logic only searches if query is present OR returns everything if query is empty?
        // Code: `if (cleanQuery) where...` -> if no query, it returns ALL (limit 20).
        console.log(`Found ${resFiltered.length} items in 'food' category.`);
        const hasMedication = resFiltered.some(i => i.category === 'medication');
        console.log(`Contains medication? ${hasMedication}`);

    } catch (error) {
        console.error("Verification Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUnifiedSearch();
