require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/petcare'
});

async function seedRatings() {
    try {
        console.log('Starting bulk update of ratings...');
        // Randomly set ratings to 4 or 5 for all invoices where overall_satisfaction_rating is NULL
        const res = await pool.query(`
            UPDATE invoices 
            SET 
                overall_satisfaction_rating = floor(random() * 2 + 4)::int,
                sale_attitude_rating = floor(random() * 2 + 4)::int
            WHERE overall_satisfaction_rating IS NULL
        `);
        console.log(`Successfully updated ${res.rowCount} invoices with random ratings.`);
    } catch (err) {
        console.error('Error seeding ratings:', err);
    } finally {
        await pool.end();
    }
}

seedRatings();
