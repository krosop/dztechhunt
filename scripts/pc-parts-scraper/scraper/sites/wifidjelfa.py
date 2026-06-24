"""
WIFI Djelfa Scraper — https://wifidjelfa.com
Dynamic JS-rendered site with Cloudflare protection.
Uses Scrapling's StealthyFetcher to bypass anti-bot measures.
"""
import sys
import re
from pathlib import Path
from typing import List, Dict
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scraper.base import BaseScraper

# Try to import Scrapling — fallback gracefully if not installed
try:
    from scrapling.fetchers import StealthyFetcher
    SCRAPLING_AVAILABLE = True
except ImportError:
    SCRAPLING_AVAILABLE = False
    print("[!] Scrapling not installed. Install with: pip install 'scrapling[fetchers]' && scrapling install")


class WifidjelfaScraper(BaseScraper):
    """Scraper for WIFI Djelfa — Cloudflare-protected WooCommerce store."""

    # Category URLs (WooCommerce product category pages)
    CATEGORIES = {
        'cpu': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008520/',
        'gpu': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008523/',
        'ram': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008525/',
        'motherboard': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008524/',
        'storage': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008527/',
        'monitor': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008521/',
        'psu': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008526/',
        'case': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008528/',
        'cooling': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008529/',
        'keyboard': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008532/',
        'mouse': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008533/',
        'headset': 'https://wifidjelfa.com/product-category/99236150627014130/99236150627008534/',
        'desktop': 'https://wifidjelfa.com/product-category/99940244966604812/',
    }

    def __init__(self, delay: tuple = (2, 4)):
        super().__init__('wifidjelfa', 'https://wifidjelfa.com', delay)
        if not SCRAPLING_AVAILABLE:
            raise ImportError(
                "Scrapling is required for this scraper.\n"
                "Install: pip install 'scrapling[fetchers]'\n"
                "Then:    scrapling install"
            )

    def _fetch_page(self, url: str) -> str:
        """Fetch page using Scrapling's stealth browser to bypass Cloudflare."""
        print(f"    [Browser] Fetching {url}")

        page = StealthyFetcher.fetch(
            url,
            headless=True,
            network_idle=True,
            solve_cloudflare=True,
        )

        html = page.text()
        print(f"    [Browser] Page loaded: {len(html)} bytes")
        return html

    def _parse_products_from_page(self, html: str, category: str) -> List[Dict]:
        """
        Parse products from rendered HTML.
        Uses Scrapling's CSS selector engine.
        """
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html, 'lxml')
        products = []

        # WoodMart theme product grid selectors (verified working)
        product_cards = soup.select('div.wd-product.product-grid-item')
        print(f"    Found {len(product_cards)} product cards")

        if not product_cards:
            # Fallback: try alternative selectors
            product_cards = soup.select('.product-grid-item, .product-item, .wd-product')
            print(f"    Fallback found {len(product_cards)} cards")

        for card in product_cards:
            try:
                # Product ID from data attribute
                product_id = card.get('data-id', '') or card.get('data-product-id', '')

                # Name & URL
                title_el = card.select_one('h3.wd-entities-title a')
                if not title_el:
                    title_el = card.select_one('.wd-entities-title a')
                if not title_el:
                    title_el = card.select_one('a[href*="/product/"]')

                if not title_el:
                    continue

                name = title_el.get_text(strip=True)
                url = title_el.get('href', '')
                if url and not url.startswith('http'):
                    url = self.base_url + url

                # Skip non-product links
                if '/product/' not in url:
                    continue

                # Price handling (sale vs regular)
                price_container = card.select_one('span.price')
                price = ''
                old_price = None

                if price_container:
                    # Check for sale price: <del>old</del> <ins>new</ins>
                    sale_price_el = price_container.select_one('ins .woocommerce-Price-amount bdi')
                    if sale_price_el:
                        price = sale_price_el.get_text(strip=True)
                        old_price_el = price_container.select_one('del .woocommerce-Price-amount bdi')
                        if old_price_el:
                            old_price = old_price_el.get_text(strip=True)
                    else:
                        # Regular price
                        regular_price_el = price_container.select_one('.woocommerce-Price-amount bdi')
                        if regular_price_el:
                            price = regular_price_el.get_text(strip=True)

                # Image (lazy-loaded)
                img_el = card.select_one('img')
                image = ''
                if img_el:
                    image = img_el.get('src', '') or img_el.get('data-src', '') or img_el.get('data-lazy-src', '')

                # Stock status
                is_in_stock = 'out-of-stock' not in ' '.join(card.get('class', []))
                availability = 'In stock' if is_in_stock else 'Out of stock'

                # Validate
                if name and price and self.normalize_price(price):
                    products.append({
                        'name': name,
                        'price': price,
                        'old_price': old_price,
                        'availability': availability,
                        'url': url,
                        'image': image,
                        'site': 'wifidjelfa.com',
                        'retailer_name': 'WIFI Djelfa',
                        'sku': product_id,
                        'scraped_at': datetime.utcnow().isoformat(),
                    })

            except Exception as e:
                print(f"    [!] Parse error: {e}")
                continue

        return products

    def scrape_category(self, category_url: str, category_name: str) -> List[Dict]:
        """Scrape a category with pagination support."""
        print(f"[+] Scraping {category_name}: {category_url}")
        all_products = []

        # Try page 1
        try:
            html = self._fetch_page(category_url)
            products = self._parse_products_from_page(html, category_name)
            all_products.extend(products)
            print(f"    Page 1: {len(products)} products")
        except Exception as e:
            print(f"    [!] Failed to fetch page 1: {e}")
            return all_products

        # Try pagination (page/2/, page/3/, etc.)
        for page_num in range(2, 20):
            page_url = category_url.rstrip('/') + f'/page/{page_num}/'
            try:
                html = self._fetch_page(page_url)
                products = self._parse_products_from_page(html, category_name)

                if not products:
                    print(f"    Page {page_num}: no more products")
                    break

                all_products.extend(products)
                print(f"    Page {page_num}: {len(products)} products")

                # Safety: stop if we keep getting same products
                if len(products) < 3:
                    break

            except Exception as e:
                print(f"    [!] Pagination stopped at page {page_num}: {e}")
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
        print(f"\n[+] WIFI Djelfa: {len(all_products)} products scraped total")
        return all_products


if __name__ == '__main__':
    scraper = WifidjelfaScraper()

    # Scrape specific categories for testing
    test_cats = ['cpu', 'gpu']
    products = scraper.scrape_all(categories=test_cats)

    # Save raw data
    scraper.save_raw(Path('data/raw'))
