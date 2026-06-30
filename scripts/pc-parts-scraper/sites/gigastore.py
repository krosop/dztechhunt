"""
GigaStore DZ Scraper — https://gigastore-dz.com
WordPress/WooCommerce. Static HTML — uses requests + BeautifulSoup.
"""
import sys
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from typing import List, Dict
from datetime import datetime
import xml.etree.ElementTree as ET
import re

sys.path.insert(0, str(Path(__file__).parent.parent))


class GigastoreScraper:
    """Scraper for GigaStore DZ — WooCommerce store."""

    CATEGORIES = {
        'cpu': 'https://gigastore-dz.com/composants/processeur/',
        'gpu': 'https://gigastore-dz.com/composants/carte-graphique/',
        'ram': 'https://gigastore-dz.com/composants/ram/',
        'motherboard': 'https://gigastore-dz.com/composants/carte-mere/',
        'storage': 'https://gigastore-dz.com/composants/stockage-ssd-hdd/',
        'psu': 'https://gigastore-dz.com/composants/alimentation/',
        'case': 'https://gigastore-dz.com/composants/boitier/',
        'cooling': 'https://gigastore-dz.com/composants/refroidissement/',
        'monitor': 'https://gigastore-dz.com/moniteur/',
        'keyboard': 'https://gigastore-dz.com/peripheriques/clavier/',
        'mouse': 'https://gigastore-dz.com/peripheriques/souris/',
        'headset': 'https://gigastore-dz.com/peripheriques/casque/',
    }

    def __init__(self, delay: float = 1.5):
        self.delay = delay
        self.base_url = 'https://gigastore-dz.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        })

    def _fetch(self, url: str) -> str:
        import time, random
        time.sleep(random.uniform(0.8, self.delay))
        resp = self.session.get(url, timeout=15)
        resp.raise_for_status()
        return resp.text

    def _parse_page(self, html: str) -> List[Dict]:
        soup = BeautifulSoup(html, 'lxml')
        products = []

        # GigaStore uses li.product (not div.product)
        for card in soup.select('li.product'):
            try:
                name_el = card.select_one('h2.woocommerce-loop-product__title a, a.woocommerce-LoopProduct-link h2')
                if not name_el:
                    continue

                name = name_el.get_text(strip=True)
                url = ''
                link_el = card.select_one('a.woocommerce-LoopProduct-link')
                if link_el:
                    url = link_el.get('href', '')

                price_el = card.select_one('span.woocommerce-Price-amount bdi')
                price = price_el.get_text(strip=True) if price_el else ''

                old_price_el = card.select_one('del span.woocommerce-Price-amount bdi')
                old_price = old_price_el.get_text(strip=True) if old_price_el else None

                img_el = card.select_one('img.attachment-woocommerce_thumbnail, img.woocommerce-placeholder')
                image = ''
                if img_el:
                    image = img_el.get('src', '') or img_el.get('data-src', '') or img_el.get('data-lazy-src', '')

                badge_el = card.select_one('span.onsale')
                badge = badge_el.get_text(strip=True) if badge_el else ''

                clean = price.replace('DA', '').replace(' ', '').replace(',', '').strip()
                if name and clean:
                    try:
                        float(clean)
                        products.append({
                            'name': name,
                            'price': price,
                            'old_price': old_price,
                            'availability': badge or 'In stock',
                            'url': url,
                            'image': image,
                            'site': 'gigastore-dz.com',
                            'retailer_name': 'GigaStore DZ',
                            'sku': '',
                            'scraped_at': datetime.utcnow().isoformat(),
                        })
                    except ValueError:
                        pass
            except Exception:
                continue
        return products

    def _parse_product_page(self, html: str, url: str) -> Dict:
        """Parse a single product page for name, price, image."""
        soup = BeautifulSoup(html, 'lxml')
        try:
            name = ''
            h1 = soup.select_one('h1.product-title, h1.product_title, h1.entry-title')
            if h1:
                name = h1.get_text(strip=True)

            price = ''
            old_price = None
            price_el = soup.select_one('p.price span.woocommerce-Price-amount bdi')
            if price_el:
                price = price_el.get_text(strip=True)

            # Check for sale price
            old_price_el = soup.select_one('p.price del span.woocommerce-Price-amount bdi')
            if old_price_el:
                old_price = old_price_el.get_text(strip=True)

            # Image
            image = ''
            img = soup.select_one('img.wp-post-image, img.woocommerce-main-image')
            if img:
                image = img.get('src', '') or img.get('data-src', '')

            # Availability
            avail = 'In stock'
            if soup.select_one('.out-of-stock, .sold-out'):
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
                        'site': 'gigastore-dz.com',
                        'retailer_name': 'GigaStore DZ',
                        'sku': '',
                        'scraped_at': datetime.utcnow().isoformat(),
                    }
                except ValueError:
                    pass
        except Exception:
            pass
        return None

    def _get_sitemap_product_urls(self, category_path: str) -> List[str]:
        """Fetch product sitemap and filter by category path."""
        try:
            sitemap_url = f"{self.base_url}/product-sitemap.xml"
            resp = self.session.get(sitemap_url, timeout=20)
            resp.raise_for_status()

            # Parse XML
            root = ET.fromstring(resp.text.encode('utf-8'))
            urls = []
            ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

            for url_el in root.findall('ns:url', ns):
                loc = url_el.find('ns:loc', ns)
                if loc is not None:
                    url = loc.text
                    if category_path in url and url != self.base_url + '/shop/':
                        urls.append(url)
            return urls
        except Exception as e:
            print(f"    [i] Sitemap fetch failed: {e}")
            return []

    def _sitemap_fallback(self, category_url: str, seen_urls: set, seen_names: set) -> List[Dict]:
        """Use sitemap to discover and scrape product pages not found in category archive."""
        products = []
        # Extract category path from URL, e.g. /composants/processeur/
        match = re.search(r'https?://[^/]+(/.*)', category_url)
        if not match:
            return products
        category_path = match.group(1).rstrip('/')

        sitemap_urls = self._get_sitemap_product_urls(category_path)
        if not sitemap_urls:
            return products

        print(f"    [i] Sitemap found {len(sitemap_urls)} product URLs for {category_path}")
        
        import concurrent.futures
        def _fetch_and_parse(url):
            try:
                html = self._fetch(url)
                return self._parse_product_page(html, url)
            except Exception:
                return None

        new_count = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(_fetch_and_parse, url): url for url in sitemap_urls if url not in seen_urls}
            for future in concurrent.futures.as_completed(futures):
                product = future.result()
                if product and product['name'] not in seen_names:
                    seen_names.add(product['name'])
                    seen_urls.add(futures[future])
                    products.append(product)
                    new_count += 1

        print(f"    [i] Sitemap fallback added {new_count} new products")
        return products

    def scrape_category(self, url: str, name: str) -> List[Dict]:
        print(f"[+] GigaStore scraping {name}: {url}")
        all_products = []
        seen_names = set()
        seen_urls = set()

        # Try to get more products per page
        page_url = url
        if '?' not in page_url:
            page_url = f"{page_url}?per_page=100"
        else:
            page_url = f"{page_url}&per_page=100"

        html = self._fetch(page_url)
        products = self._parse_page(html)
        for p in products:
            if p['name'] not in seen_names and p['url'] not in seen_urls:
                seen_names.add(p['name'])
                seen_urls.add(p['url'])
                all_products.append(p)
        print(f"    Page 1: {len(products)} products")

        for page in range(2, 15):
            try:
                page_url = f"{url}?per_page=100&page={page}" if '?' not in url else f"{url}&per_page=100&page={page}"
                html = self._fetch(page_url)
                products = self._parse_page(html)
                if not products:
                    break
                new_count = 0
                for p in products:
                    if p['name'] not in seen_names and p['url'] not in seen_urls:
                        seen_names.add(p['name'])
                        seen_urls.add(p['url'])
                        all_products.append(p)
                        new_count += 1
                print(f"    Page {page}: {new_count} new products")
                if new_count == 0:
                    break
            except Exception as e:
                print(f"    Pagination stopped: {e}")
                break

        # Sitemap fallback: if we got few products from category archive, try sitemap
        if len(all_products) < 30:
            sitemap_products = self._sitemap_fallback(url, seen_urls, seen_names)
            all_products.extend(sitemap_products)

        print(f"[+] {name}: {len(all_products)} total")
        return all_products

    def scrape_all(self, categories: list = None) -> List[Dict]:
        cats = categories or list(self.CATEGORIES.keys())
        all_products = []
        for cat in cats:
            if cat not in self.CATEGORIES:
                print(f"[!] Unknown: {cat}"); continue
            try:
                products = self.scrape_category(self.CATEGORIES[cat], cat)
                all_products.extend(products)
            except Exception as e:
                print(f"[!] Failed {cat}: {e}")
        print(f"\n[+] GigaStore: {len(all_products)} products total")
        return all_products


if __name__ == '__main__':
    scraper = GigastoreScraper()
    products = scraper.scrape_all(categories=['cpu', 'gpu'])
    print(f"Scraped {len(products)} products")
