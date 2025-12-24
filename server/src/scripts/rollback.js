import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATION_DIR = path.join(__dirname, '../migrations/down');

async function rollback() {
  const client = await db.connect();
  try {
    console.log('🔄 Starting rollback...');
    await client.query('BEGIN');

    // Read migration files and sort descending (so highest -> lowest)
    const files = fs
      .readdirSync(MIGRATION_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()
      .reverse();

    for (const file of files) {
      console.log(`▶️  Running down ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATION_DIR, file), 'utf8');
      await client.query(sql);

      // Remove record from schema_migrations if present
      await client.query('DELETE FROM schema_migrations WHERE version = $1', [file]);
    }

    await client.query('COMMIT');
    console.log('✅ Rollback completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Rollback failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

rollback();