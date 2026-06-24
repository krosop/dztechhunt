"""
Base scraper class and utilities.
"""
import re
import time
import random
import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime


class BaseScraper(ABC):
    """Abstract base scraper — all site scrapers inherit from this."""

    def __init__(self, site_name: str, base_url: str, delay: tuple = (1, 3)):
        self.site_name = site_name
        self.base_url = base_url.rstrip('/')
        self.delay = delay
        self.raw_products: List[Dict] = []

    @abstractmethod
    def scrape_category(self, category_url: str, category_name: str) -> List[Dict]:
        """Scrape a single category page. Returns list of raw product dicts."""
        pass

    @abstractmethod
    def scrape_all(self) -> List[Dict]:
        """Scrape all configured categories. Returns list of raw product dicts."""
        pass

    def normalize_price(self, price_str: str) -> Optional[float]:
        """Convert price string to float."""
        if not price_str:
            return None
        cleaned = re.sub(r'[\s\u00A0]', '', str(price_str))
        cleaned = re.sub(r'DA|DZD|\$|€|£', '', cleaned, flags=re.I)
        cleaned = cleaned.replace(',', '')
        try:
            return float(cleaned)
        except ValueError:
            return None

    def save_raw(self, output_dir: Path):
        """Save raw scraped data to JSON."""
        output_dir.mkdir(parents=True, exist_ok=True)
        filepath = output_dir / f"{self.site_name}_{datetime.utcnow().strftime('%Y%m%d')}.json"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.raw_products, f, indent=2, ensure_ascii=False)
        print(f"[+] Saved {len(self.raw_products)} raw products to {filepath}")
        return filepath

    def _sleep(self):
        """Random delay between requests."""
        time.sleep(random.uniform(*self.delay))
