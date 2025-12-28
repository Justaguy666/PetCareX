import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });
const { Pool } = pkg;

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Fallback to individual parameters if connectionString is not provided or fails
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME,
});

db.on('connect', () => {
    //console.log('Connected to the database');
});

db.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export default db;