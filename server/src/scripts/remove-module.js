import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Please provide module name');
  process.exit(1);
}

const targetDir = path.resolve(__dirname, '..', 'modules', moduleName);

if (!fs.existsSync(targetDir)) {
  console.error('❌ Module does not exist');
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });

console.log(`🗑️ Module "${moduleName}" removed successfully`);
