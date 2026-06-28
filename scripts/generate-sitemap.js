import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://dztechhunt-v3.vercel.app';
const LAST_MOD = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { url: `${SITE_URL}/`, priority: 1.0, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search`, priority: 0.9, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=rtx+5060`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=graphics+card`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=cpu`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=motherboard`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=ram`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=ssd`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=monitor`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=gaming+pc`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=gaming+mouse`, priority: 0.8, changefreq: 'daily' },
  { url: `${SITE_URL}/#/search?q=mechanical+keyboard`, priority: 0.8, changefreq: 'daily' },
];

function generateSitemap() {
  const data = JSON.parse(readFileSync(join(__dirname, '../public/data/products.json'), 'utf8'));
  const products = data.products || [];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const route of staticRoutes) {
    xml += '  <url>\n';
    xml += `    <loc>${route.url}</loc>\n`;
    xml += `    <lastmod>${LAST_MOD}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  const topProducts = [...products]
    .sort((a, b) => (b.current_price || 0) - (a.current_price || 0))
    .slice(0, 200);

  for (const product of topProducts) {
    if (!product.slug) continue;
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/#/product/${product.slug}</loc>\n`;
    xml += `    <lastmod>${LAST_MOD}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  writeFileSync(join(__dirname, '../public/sitemap.xml'), xml);
  console.log(`Sitemap generated: ${staticRoutes.length} static + ${topProducts.length} products = ${staticRoutes.length + topProducts.length} URLs`);
}

generateSitemap();
