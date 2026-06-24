"""
LICB Plus Scraper — https://www.licbplus.com.dz
Static HTML site, uses requests + BeautifulSoup (fast, no browser needed).
"""
import sys
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from typing import List, Dict

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scraper.base import BaseScraper


class LicbplusScraper(BaseScraper):
    """Scraper for LICB Plus — Algerian PC retailer with static HTML."""

    # Category URLs to scrape
    CATEGORIES = {
        'monitor': 'https://www.licbplus.com.dz/monitor/pc-monitor',
        'cpu': 'https://www.licbplus.com.dz/pc-components/processor',
        'gpu': 'https://www.licbplus.com.dz/pc-components/graphics-card',
        'ram': 'https://www.licbplus.com.dz/pc-components/ram-memory',
        'motherboard': 'https://www.licbplus.com.dz/pc-components/motherboard',
        'storage': 'https://www.licbplus.com.dz/pc-components/disque-dur',
        'psu': 'https://www.licbplus.com.dz/pc-components/power-supply',
        'case': 'https://www.licbplus.com.dz/pc-components/case',
        'cooling': 'https://www.licbplus.com.dz/pc-components/cooling',
        'keyboard': 'https://www.licbplus.com.dz/gaming/gaming-keyboard',
        'mouse': 'https://www.licbplus.com.dz/gaming/gaming-mouse',
        'headset': 'https://www.licbplus.com.dz/gaming/gaming-headset',
    }

    # CSS Selectors (verified from real HTML)
    SELECTORS = {
        'product_card': 'div.product-cart-wrap',
        'name': 'h2 a.designation-truncate',
        'price_current': 'div.product-price span:not(.old-price)',
        'price_old': 'div.product-price span.old-price',
        'image': 'img.default-img',
        'link': 'h2 a.designation-truncate',
        'badge': 'span.bac-inline-badge',
    }

    def __init__(self, delay: tuple = (1, 2)):
        super().__init__('licbplus', 'https://www.licbplus.com.dz', delay)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
        })

    def _fetch(self, url: str) -> str:
        """Fetch page with retry logic."""
        for attempt in range(3):
            try:
                self._sleep()
                resp = self.session.get(url, timeout=15)
                resp.raise_for_status()
                return resp.text
            except Exception as e:
                print(f"    [!] Attempt {attempt + 1} failed for {url}: {e}")
                if attempt == 2:
                    raise
        return ''

    def _parse_page(self, html: str, category: str) -> List[Dict]:
        """Parse product cards from HTML."""
        soup = BeautifulSoup(html, 'lxml')
        products = []

        cards = soup.select(self.SELECTORS['product_card'])
        print(f"    Found {len(cards)} product cards")

        for card in cards:
            try:
                # Name
                name_el = card.select_one(self.SELECTORS['name'])
                if not name_el:
                    continue

                # Remove badge text from name
                name = name_el.get_text(strip=True)
                badge_el = card.select_one(self.SELECTORS['badge'])
                badge = badge_el.get_text(strip=True) if badge_el else ''

                # Price
                price_el = card.select_one(self.SELECTORS['price_current'])
                price = price_el.get_text(strip=True) if price_el else ''

                old_price_el = card.select_one(self.SELECTORS['price_old'])
                old_price = old_price_el.get_text(strip=True) if old_price_el else None

                # Image
                img_el = card.select_one(self.SELECTORS['image'])
                image = img_el.get('src', '') if img_el else ''
                if not image and img_el:
                    image = img_el.get('data-src', '')

                # URL
                link = name_el.get('href', '')
                if link and not link.startswith('http'):
                    link = self.base_url + link

                # Availability
                stock_el = card.select_one('.product-stock, .stock-status')
                availability = stock_el.get_text(strip=True) if stock_el else 'In stock'

                # Product ID from data attribute if available
                product_id = card.get('data-id', '') or ''

                product = {
                    'name': name,
                    'price': price,
                    'old_price': old_price,
                    'availability': availability,
                    'url': link,
                    'image': image,
                    'site': 'licbplus.com.dz',
                    'retailer_name': 'LICB Plus',
                    'sku': product_id,
                    'scraped_at': datetime.utcnow().isoformat(),
                }

                # Only keep products with valid names and prices
                if name and price and self.normalize_price(price):
                    products.append(product)

            except Exception as e:
                print(f"    [!] Parse error: {e}")
                continue

        return products

    def scrape_category(self, category_url: str, category_name: str) -> List[Dict]:
        """Scrape a single category (handles pagination)."""
        print(f"[+] Scraping {category_name}: {category_url}")
        all_products = []

        # Page 1
        html = self._fetch(category_url)
        products = self._parse_page(html, category_name)
        all_products.extend(products)
        print(f"    Page 1: {len(products)} products")

        # Try pagination (page 2+)
        for page in range(2, 10):
            page_url = f"{category_url}?page={page}"
            try:
                html = self._fetch(page_url)
                products = self._parse_page(html, category_name)
                if not products:
                    break
                all_products.extend(products)
                print(f"    Page {page}: {len(products)} products")
            except Exception as e:
                print(f"    [!] Pagination stopped at page {page}: {e}")
                break

        print(f"[+] {category_name}: {len(all_products)} total")
        return all_products

    def scrape_all(self, categories: list = None) -> List[Dict]:
        """Scrape all configured categories."""
        cats = categories or list(self.CATEGORIES.keys())
        all_products = []

        for cat_name in cats:
            if cat_name not in self.CATEGORIES:
                print(f"[!] Unknown category: {cat_name}")
                continue

            try:
                products = self.scrape_category(
                    self.CATEGORIES[cat_name],
                    cat_name
                )
                all_products.extend(products)
            except Exception as e:
                print(f"[!] Failed to scrape {cat_name}: {e}")
                continue

        self.raw_products = all_products
        print(f"\n[+] LICB Plus: {len(all_products)} products scraped total")
        return all_products


if __name__ == '__main__':
    from datetime import datetime

    scraper = LicbplusScraper()

    # Scrape specific categories for testing
    test_cats = ['cpu', 'monitor']
    products = scraper.scrape_all(categories=test_cats)

    # Save raw data
    scraper.save_raw(Path('data/raw'))
