import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Please provide module name');
  process.exit(1);
}

const baseDir = path.resolve(__dirname, '..', 'modules', moduleName);

const files = {
  controller: `${moduleName}.controller.js`,
  service: `${moduleName}.service.js`,
  repo: `${moduleName}.repo.js`,
  route: `${moduleName}.route.js`,
};

const templates = {
  controller: `
import * as ${moduleName}Service from './${moduleName}.service.js';

export const example = async (req, res, next) => {
  try {
    res.json({ message: '${moduleName} controller works' });
  } catch (err) {
    next(err);
  }
};
`.trim(),

  service: `
import * as ${moduleName}Repo from './${moduleName}.repo.js';

export const example = async () => {
  return '${moduleName} service works';
};
`.trim(),

  repo: `
export const example = async () => {
  return null;
};
`.trim(),

  route: `
import { Router } from 'express';
import * as ${moduleName}Controller from './${moduleName}.controller.js';

const router = Router();

router.get('/test', ${moduleName}Controller.example);

export default router;
`.trim(),
};

fs.mkdirSync(baseDir, { recursive: true });

Object.entries(files).forEach(([key, file]) => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, templates[key]);
  }
});

console.log(`✅ Module "${moduleName}" generated successfully`);
