import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');

const filesToRemove = [
  'clean-products.json',
  'scrape-data.json',
];

const distDir = join(__dirname, '..', 'dist');

for (const file of filesToRemove) {
  const filepath = join(distDir, file);
  if (existsSync(filepath)) {
    unlinkSync(filepath);
    console.log(`Removed: ${file}`);
  }
}

console.log('Dist cleanup complete.');
