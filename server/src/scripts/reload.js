import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATION_DIR = path.join(__dirname, '../migrations/up');

function splitSqlStatements(sql) {
  const statements = [];
  let cur = '';
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag = null;

  while (i < sql.length) {
    const ch = sql[i];
    const next2 = sql.slice(i, i + 2);

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
        cur += ch;
      } else {
        cur += ch;
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      if (next2 === '*/') {
        inBlockComment = false;
        cur += '*/';
        i += 2;
        continue;
      } else {
        cur += ch;
        i++;
        continue;
      }
    }

    if (dollarTag) {
      if (sql.slice(i, i + dollarTag.length) === dollarTag) {
        cur += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
        continue;
      } else {
        cur += ch;
        i++;
        continue;
      }
    }

    if (next2 === '--') {
      inLineComment = true;
      cur += next2;
      i += 2;
      continue;
    }

    if (next2 === '/*') {
      inBlockComment = true;
      cur += next2;
      i += 2;
      continue;
    }

    if (ch === '$') {
      const m = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
      if (m) {
        dollarTag = m[0];
        cur += dollarTag;
        i += dollarTag.length;
        continue;
      }
    }

    if (ch === "'") {
      inSingle = !inSingle;
      cur += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inDouble = !inDouble;
      cur += ch;
      i++;
      continue;
    }

    if (ch === ';' && !inSingle && !inDouble && !dollarTag && !inBlockComment && !inLineComment) {
      const stmt = cur.trim();
      if (stmt) statements.push(stmt);
      cur = '';
      i++;
      continue;
    }

    cur += ch;
    i++;
  }

  if (cur.trim()) statements.push(cur.trim());
  return statements;
}

async function reload() {
  const client = await db.connect();
  try {
    console.log('🔄 Running reload...');
    await client.query('BEGIN');

    const files = fs
      .readdirSync(MIGRATION_DIR)
      .filter(f => f.endsWith('.sql'))
      .filter(f => {
        const m = f.match(/^(\d+)-/);
        if (!m) return false;
        const num = parseInt(m[1], 10);
        return num >= 2;
      })
      .sort();

    for (const file of files) {
      console.log(`▶️  Running ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATION_DIR, file), 'utf8');
      const statements = splitSqlStatements(sql);

      for (const stmt of statements) {
        if (!stmt) continue;
        await client.query(stmt);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Reload completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Reload failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
  }
}

reload();
