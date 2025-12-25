import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const rollbackPath = path.resolve(__dirname, 'rollback.js');
const migratePath = path.resolve(__dirname, 'migrate.js');
const seedPath = path.resolve(__dirname, '..', 'mock', 'seed.js');

function run(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: 'inherit', ...opts });
    proc.on('close', code => {
      if (code === 0) return resolve();
      return reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`));
    });
    proc.on('error', reject);
  });
}

async function reset() {
  try {
    console.log('🔁 Running rollback...');
    await run(process.execPath, [rollbackPath]);

    console.log('🔄 Running migrate...');
    await run(process.execPath, [migratePath]);

    console.log('🧰 Generating Prisma client...');
    await run('npx', ['prisma', 'generate', '--schema=./src/prisma/schema.prisma'], { cwd: ROOT_DIR, shell: true });

    console.log('🌱 Running seed...');
    await run(process.execPath, [seedPath]);

    console.log('✅ Reset complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
}

reset();
