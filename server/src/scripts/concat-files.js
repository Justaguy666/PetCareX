import fs from "fs";
import path from "path";

const INPUT_DIR = path.resolve("src/mock/factories");
const OUTPUT_FILE = path.resolve("src/all.md");

const ALLOWED_EXTENSIONS = [".sql", ".js", ".txt"];

function readAllFiles(dir) {
  let result = "";

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      result += readAllFiles(fullPath);
    } else {
      const ext = path.extname(item.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) continue;

      const content = fs.readFileSync(fullPath, "utf-8");

      result += `
-- =====================================================
-- FILE: ${fullPath}
-- =====================================================

${content}

`;
    }
  }

  return result;
}

const finalContent = readAllFiles(INPUT_DIR);
fs.writeFileSync(OUTPUT_FILE, finalContent.trim());

console.log(`✅ Done! Output file: ${OUTPUT_FILE}`);
