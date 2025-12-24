import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATION_DIR = path.join(__dirname, '../migrations/up');

async function migrate() {
  const client = await db.connect();

  try {
    console.log('🔄 Starting migration...');
    await client.query('BEGIN');

    // Get executed migrations
    const { rows } = await client.query(
      'SELECT version FROM schema_migrations'
    );
    const executed = new Set(rows.map(r => r.version));

    // Read migration files
    const files = fs
      .readdirSync(MIGRATION_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (executed.has(file)) {
        console.log(`⏭️  Skip ${file}`);
        continue;
      }

      console.log(`▶️  Running ${file}`);
      const sql = fs.readFileSync(
        path.join(MIGRATION_DIR, file),
        'utf8'
      );

      await client.query(sql);

      // Record migration as executed
      await client.query(
        'INSERT INTO schema_migrations(version) VALUES ($1)',
        [file]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
