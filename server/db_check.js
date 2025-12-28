import db from './src/config/db.js';

async function check() {
    try {
        const res = await db.query("SELECT COUNT(*) as total, AVG(overall_satisfaction_rating) as avg FROM invoices WHERE overall_satisfaction_rating IS NOT NULL");
        console.log('RATINGS: ' + JSON.stringify(res.rows, null, 2));

        const res2 = await db.query("SELECT overall_satisfaction_rating FROM invoices LIMIT 10");
        console.log('SAMPLE RATINGS: ' + JSON.stringify(res2.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
