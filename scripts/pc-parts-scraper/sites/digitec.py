"""
Digitec DZ Scraper — https://www.digitecdz.com
WordPress/WooCommerce (Electro theme). Category pages use JavaScript/AJAX for product loading,
so we use sitemap-based scraping to discover and visit all product pages directly.
"""
import sys
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from typing import List, Dict
from datetime import datetime
import xml.etree.ElementTree as ET

sys.path.insert(0, str(Path(__file__).parent.parent))


class DigitecScraper:
    """Scraper for Digitec DZ — sitemap-based since category archive uses JS."""

    CATEGORIES = {
        'cpu': 'https://www.digitecdz.com/product-category/composants-pc/processeurs/',
        'gpu': 'https://www.digitecdz.com/product-category/composants-pc/cartes-graphiques/',
        'ram': 'https://www.digitecdz.com/product-category/composants-pc/barrettes-memoire/',
        'motherboard': 'https://www.digitecdz.com/product-category/composants-pc/cartes-meres/',
        'storage': 'https://www.digitecdz.com/product-category/composants-pc/disques-durs-et-ssd/',
        'psu': 'https://www.digitecdz.com/product-category/composants-pc/alimentations-pc/',
        'case': 'https://www.digitecdz.com/product-category/composants-pc/boitiers-pc/',
        'cooling': 'https://www.digitecdz.com/product-category/composants-pc/radiateurs-refroidissement/',
        'monitor': 'https://www.digitecdz.com/product-category/peripheriques-pc/ecrans-pc/',
        'keyboard': 'https://www.digitecdz.com/product-category/peripheriques-pc/claviers/',
        'mouse': 'https://www.digitecdz.com/product-category/peripheriques-pc/souris/',
        'headset': 'https://www.digitecdz.com/product-category/peripheriques-pc/casques-micros-et-enceintes/',
    }

    def __init__(self, delay: float = 0.5):
        # Shorter delay for sitemap product pages (many requests)
        self.delay = delay
        self.base_url = 'https://www.digitecdz.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        })

    def _fetch(self, url: str) -> str:
        import time, random
        time.sleep(random.uniform(0.3, self.delay))
        resp = self.session.get(url, timeout=15)
        resp.raise_for_status()
        return resp.text

    def _parse_product_page(self, html: str, url: str) -> Dict:
        """Parse a single Digitec product page."""
        soup = BeautifulSoup(html, 'lxml')
        try:
            # Name
            name = ''
            h1 = soup.select_one('h1.product_title, h1.entry-title')
            if h1:
                name = h1.get_text(strip=True)

            # Price
            price = ''
            old_price = None
            price_el = soup.select_one('p.price .woocommerce-Price-amount bdi')
            if price_el:
                price = price_el.get_text(strip=True)

            old_price_el = soup.select_one('p.price del .woocommerce-Price-amount bdi')
            if old_price_el:
                old_price = old_price_el.get_text(strip=True)

            # Image
            image = ''
            img = soup.select_one('img.wp-post-image, img.woocommerce-main-image')
            if img:
                image = img.get('src', '') or img.get('data-src', '')

            # Availability
            avail = 'In stock'
            if soup.select_one('.out-of-stock, .sold-out, .outofstock'):
                avail = 'Out of stock'

            clean = price.replace('DA', '').replace(' ', '').replace(',', '').strip()
            if name and clean:
                try:
                    float(clean)
                    return {
                        'name': name,
                        'price': price,
                        'old_price': old_price,
                        'availability': avail,
                        'url': url,
                        'image': image,
                        'site': 'digitecdz.com',
                        'retailer_name': 'Digitec DZ',
                        'sku': '',
                        'scraped_at': datetime.utcnow().isoformat(),
                    }
                except ValueError:
                    pass
        except Exception:
            pass
        return None

    def _get_sitemap_product_urls(self) -> List[str]:
        """Fetch product sitemap and return all product URLs."""
        try:
            sitemap_url = f"{self.base_url}/product-sitemap.xml"
            resp = self.session.get(sitemap_url, timeout=20)
            resp.raise_for_status()

            root = ET.fromstring(resp.text.encode('utf-8'))
            urls = []
            ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

            for url_el in root.findall('ns:url', ns):
                loc = url_el.find('ns:loc', ns)
                if loc is not None:
                    url = loc.text
                    if '/product/' in url:
                        urls.append(url)
            return urls
        except Exception as e:
            print(f"    [i] Sitemap fetch failed: {e}")
            return []

    def scrape_all(self, categories: list = None) -> List[Dict]:
        """Scrape all Digitec products via sitemap using parallel requests."""
        print(f"[+] Digitec scraping via sitemap...")
        all_products = []
        seen_names = set()
        seen_urls = set()

        sitemap_urls = self._get_sitemap_product_urls()
        if not sitemap_urls:
            print(f"[!] Digitec: No products found in sitemap")
            return all_products

        print(f"    [i] Found {len(sitemap_urls)} product URLs in sitemap")

        import concurrent.futures
        def _fetch_and_parse(url):
            try:
                html = self._fetch(url)
                product = self._parse_product_page(html, url)
                return product
            except Exception:
                return None

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(_fetch_and_parse, url): url for url in sitemap_urls}
            for idx, future in enumerate(concurrent.futures.as_completed(futures), 1):
                product = future.result()
                url = futures[future]
                if product and product['name'] not in seen_names:
                    seen_names.add(product['name'])
                    seen_urls.add(url)
                    all_products.append(product)
                if idx % 50 == 0:
                    print(f"    Progress: {idx}/{len(sitemap_urls)} — {len(all_products)} products so far")

        print(f"[+] Digitec: {len(all_products)} products total")
        return all_products


if __name__ == '__main__':
    scraper = DigitecScraper()
    products = scraper.scrape_all()
    print(f"Scraped {len(products)} products")
    for p in products[:5]:
        print(f"  {p['name']} @ {p['price']}")
