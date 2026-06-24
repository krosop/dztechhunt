"""
PC Parts Data Models
Defines dataclasses for products, prices, and comparison results.
"""
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional, List, Dict
import json


@dataclass
class PCPart:
    """Represents a single PC part product."""
    name: str
    price: float
    currency: str = "DZD"
    price_formatted: str = ""
    old_price: Optional[float] = None
    old_price_formatted: Optional[str] = None
    availability: str = "Unknown"
    in_stock: bool = True
    url: str = ""
    image: str = ""
    site: str = ""                          # Retailer domain
    retailer_name: str = ""                 # Human-readable retailer name
    category: str = "unknown"               # cpu, gpu, ram, monitor, etc.
    brand: str = "Unknown"
    sku: Optional[str] = None               # Product ID from site
    condition: str = "New"                  # New, Used, Tray, Refurbished
    specs: Dict = field(default_factory=dict)
    scraped_at: str = ""

    # Computed fields
    @property
    def savings(self) -> float:
        if self.old_price and self.price and self.old_price > self.price:
            return self.old_price - self.price
        return 0.0

    @property
    def discount_percent(self) -> int:
        if self.old_price and self.price and self.old_price > self.price:
            return round(((self.old_price - self.price) / self.old_price) * 100)
        return 0

    @property
    def on_sale(self) -> bool:
        return self.discount_percent > 0

    def to_dict(self) -> dict:
        d = asdict(self)
        d['savings'] = self.savings
        d['discount_percent'] = self.discount_percent
        d['on_sale'] = self.on_sale
        return d

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2, ensure_ascii=False, default=str)


@dataclass
class PricePoint:
    """A single price observation for historical tracking."""
    product_sku: str
    price: float
    availability: str
    retailer: str
    date: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class ProductMatch:
    """Represents the same product found across multiple retailers."""
    product_key: str                          # Normalized model identifier
    name: str
    category: str
    brand: str
    specs: Dict
    listings: List[PCPart] = field(default_factory=list)

    @property
    def cheapest(self) -> Optional[PCPart]:
        valid = [p for p in self.listings if p.price > 0]
        return min(valid, key=lambda x: x.price) if valid else None

    @property
    def most_expensive(self) -> Optional[PCPart]:
        valid = [p for p in self.listings if p.price > 0]
        return max(valid, key=lambda x: x.price) if valid else None

    @property
    def savings(self) -> float:
        if self.cheapest and self.most_expensive:
            return self.most_expensive.price - self.cheapest.price
        return 0.0

    def to_dict(self) -> dict:
        return {
            'product_key': self.product_key,
            'name': self.name,
            'category': self.category,
            'brand': self.brand,
            'specs': self.specs,
            'listings': [p.to_dict() for p in self.listings],
            'cheapest_retailer': self.cheapest.retailer_name if self.cheapest else None,
            'cheapest_price': self.cheapest.price_formatted if self.cheapest else None,
            'savings': round(self.savings) if self.savings > 0 else 0,
            'listing_count': len(self.listings)
        }
