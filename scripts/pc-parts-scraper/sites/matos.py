"""
Matos Gaming Scraper — https://matos-gaming.com
WooCommerce store. Static HTML — uses requests + BeautifulSoup.
Scrapes monitors, mini-LED monitors, professional monitors, and audio.
"""
import sys
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from typing import List, Dict
from datetime import datetime
import xml.etree.ElementTree as ET

sys.path.insert(0, str(Path(__file__).parent.parent))


class MatosScraper:
    """Scraper for Matos Gaming — Algerian gaming monitor brand (WooCommerce)."""

    CATEGORIES = {
        'monitor': 'https://matos-gaming.com/product-category/matos-gaming-monitors/',
        'mini-led': 'https://matos-gaming.com/product-category/matos-gaming-monitors/mini-led-monitors/',
        'professional': 'https://matos-gaming.com/product-category/matos-gaming-monitors/professional-monitors/',
        'audio': 'https://matos-gaming.com/product-category/audio/',
    }

    def __init__(self, delay: float = 1.5):
        self.delay = delay
        self.base_url = 'https://matos-gaming.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        })

    def _fetch(self, url: str) -> str:
        import time, random
        time.sleep(random.uniform(0.8, self.delay))
        resp = self.session.get(url, timeout=20)
        resp.raise_for_status()
        return resp.text

    def _parse_price(self, text: str) -> tuple:
        """Extract current and old price from WooCommerce price text."""
        current_price = None
        old_price = None

        lines = text.replace('\xa0', ' ').split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            prices = []
            for match in __import__('re').finditer(r'[\d,\.]+', line):
                val = match.group().replace(',', '').replace(' ', '')
                try:
                    p = float(val)
                    if p > 1000:
                        prices.append(p)
                except ValueError:
                    continue

            if len(prices) >= 2:
                prices.sort()
                current_price = prices[0]
                old_price = prices[-1]
            elif len(prices) == 1:
                current_price = prices[0]

        current_str = f"{current_price:,.0f} DA" if current_price else ''
        old_str = f"{old_price:,.0f} DA" if old_price else None
        return current_str, old_str, current_price, old_price

    def _parse_page(self, html: str) -> List[Dict]:
        soup = BeautifulSoup(html, 'lxml')
        products = []

        for card in soup.find_all('li', class_=lambda c: c and 'product' in c.lower()):
            try:
                name_el = card.find('h2', class_=lambda c: c and 'woocommerce-loop-product__title' in c) or \
                          card.find('h2', class_=lambda c: c and 'product__title' in c) or \
                          card.find('a', class_=lambda c: c and 'woocommerce-LoopProduct-link' in c)
                if not name_el:
                    continue

                name = name_el.get_text(strip=True).split('\n')[0].strip()
                if not name or len(name) < 3:
                    continue

                url = ''
                link = card.find('a', href=True)
                if link:
                    url = link.get('href', '')
                    if url and not url.startswith('http'):
                        url = self.base_url + url

                price_str = ''
                old_price = None
                price_el = card.find('span', class_='price') or card.find('div', class_='price')
                if price_el:
                    price_text = price_el.get_text(' ', strip=True)
                    price_str, old_price, _, _ = self._parse_price(price_text)

                image = ''
                img = card.find('img', class_=lambda c: c and 'attachment-woocommerce_thumbnail' in c)
                if img:
                    image = img.get('data-nectar-img-src') or img.get('data-src') or img.get('src', '')
                    if image and ('data:image/svg' in image or 'placeholder' in image):
                        image = img.get('data-nectar-img-src') or ''

                availability = 'In stock'
                card_text = card.get_text().lower()
                if 'non disponible' in card_text or 'rupture' in card_text or 'indisponible' in card_text:
                    availability = 'Out of stock'

                if name and price_str:
                    products.append({
                        'name': name,
                        'price': price_str,
                        'old_price': old_price,
                        'availability': availability,
                        'url': url,
                        'image': image,
                        'site': 'matos-gaming.com',
                        'retailer_name': 'Matos Gaming',
                        'sku': '',
                        'scraped_at': datetime.utcnow().isoformat(),
                    })
            except Exception:
                continue

        return products

    def _parse_product_page(self, html: str, url: str) -> Dict:
        """Parse a single Matos product page."""
        soup = BeautifulSoup(html, 'lxml')
        try:
            name = ''
            h1 = soup.select_one('h1.product_title, h1.entry-title')
            if h1:
                name = h1.get_text(strip=True)

            price = ''
            old_price = None
            price_el = soup.select_one('p.price .woocommerce-Price-amount bdi')
            if price_el:
                price = price_el.get_text(strip=True)

            old_price_el = soup.select_one('p.price del .woocommerce-Price-amount bdi')
            if old_price_el:
                old_price = old_price_el.get_text(strip=True)

            image = ''
            img = soup.select_one('img.wp-post-image, img.woocommerce-main-image')
            if img:
                image = img.get('src', '') or img.get('data-src', '')

            availability = 'In stock'
            if soup.select_one('.out-of-stock, .sold-out, .outofstock'):
                availability = 'Out of stock'

            if name and price:
                price_text = price + (' ' + old_price if old_price else '')
                price_str, old_price_str, _, _ = self._parse_price(price_text)
                if price_str:
                    return {
                        'name': name,
                        'price': price_str,
                        'old_price': old_price_str,
                        'availability': availability,
                        'url': url,
                        'image': image,
                        'site': 'matos-gaming.com',
                        'retailer_name': 'Matos Gaming',
                        'sku': '',
                        'scraped_at': datetime.utcnow().isoformat(),
                    }
        except Exception:
            pass
        return None

    def _get_sitemap_product_urls(self) -> List[str]:
        """Fetch WordPress native product sitemap."""
        try:
            sitemap_url = f"{self.base_url}/wp-sitemap-posts-product-1.xml"
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

    def scrape_category(self, url: str, name: str) -> List[Dict]:
        print(f"[+] Matos scraping {name}: {url}")
        all_products = []
        seen_names = set()
        seen_urls = set()

        page_url = url
        if '?' not in page_url:
            page_url = f"{page_url}?per_page=100"
        else:
            page_url = f"{page_url}&per_page=100"

        try:
            html = self._fetch(page_url)
            products = self._parse_page(html)
            for p in products:
                if p['name'] not in seen_names and p['url'] not in seen_urls:
                    seen_names.add(p['name'])
                    seen_urls.add(p['url'])
                    all_products.append(p)
            print(f"    Page 1: {len(products)} products")
        except Exception as e:
            print(f"    [!] Failed: {e}")

        for page in range(2, 15):
            try:
                page_url = f"{url}&page={page}" if '?' in url else f"{url}?page={page}"
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

        print(f"[+] {name}: {len(all_products)} total")
        return all_products

    def scrape_all(self, categories: list = None) -> List[Dict]:
        cats = categories or list(self.CATEGORIES.keys())
        all_products = []
        seen_names = set()
        seen_urls = set()

        for cat in cats:
            if cat not in self.CATEGORIES:
                print(f"[!] Unknown: {cat}"); continue
            try:
                products = self.scrape_category(self.CATEGORIES[cat], cat)
                for p in products:
                    if p['name'] not in seen_names and p['url'] not in seen_urls:
                        seen_names.add(p['name'])
                        seen_urls.add(p['url'])
                        all_products.append(p)
            except Exception as e:
                print(f"[!] Failed {cat}: {e}")

        # Sitemap fallback
        if len(all_products) < 20:
            sitemap_urls = self._get_sitemap_product_urls()
            if sitemap_urls:
                print(f"    [i] Matos sitemap: {len(sitemap_urls)} product URLs")
                new_count = 0
                for url in sitemap_urls:
                    if url in seen_urls:
                        continue
                    try:
                        html = self._fetch(url)
                        product = self._parse_product_page(html, url)
                        if product and product['name'] not in seen_names:
                            seen_names.add(product['name'])
                            seen_urls.add(url)
                            all_products.append(product)
                            new_count += 1
                    except Exception:
                        continue
                print(f"    [i] Sitemap fallback added {new_count} new products")

        print(f"\n[+] Matos: {len(all_products)} products total")
        return all_products


if __name__ == '__main__':
    scraper = MatosScraper()
    products = scraper.scrape_all()
    print(f"Scraped {len(products)} products")
    for p in products[:3]:
        print(f"  {p['name']} @ {p['price']}")
