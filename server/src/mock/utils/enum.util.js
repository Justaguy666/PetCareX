import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadEnum(name) {
  try {
    const p = path.join(__dirname, '..', 'enums', `${name}.json`);
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export default loadEnum;
