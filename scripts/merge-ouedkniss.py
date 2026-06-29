#!/usr/bin/env python3
"""
Quick merge script: loads existing clean-products.json, removes old Ouedkniss data,
adds fresh Ouedkniss data from scripts/ouedkniss-raw.json, and saves.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

OUEDKNISS_NAMES = {
    'ouedkniss', 'admin informatique', 'it device', 'v2 tech', 'kpc solutions',
    'br informatique', 'hiprospace', 'microsoft pro dz', 'informatics',
    'best buy dz', 'tech mania', 'orbitech', 'gamingzone by divatech', 'pc pro dz',
}


def is_ouedkniss(source: str) -> bool:
    return source.strip().lower() in OUEDKNISS_NAMES


def convert_ouedkniss_to_frontend(raw_products):
    """Convert Ouedkniss raw products to frontend CleanProduct format."""
    from collections import defaultdict
    
    # Group by name (lowercase, normalized)
    groups = defaultdict(list)
    for p in raw_products:
        name = p.get('name', '').strip()
        if not name or len(name) < 3:
            continue
        # Parse price
        price_str = p.get('price', '').replace(',', '').replace(' DA', '').strip()
        try:
            price = int(price_str) if price_str else 0
        except:
            price = 0
        old_price_str = (p.get('old_price') or '').replace(',', '').replace(' DA', '').strip()
        try:
            old_price = int(old_price_str) if old_price_str else None
        except:
            old_price = None
        
        # Simple category detection
        lower = name.lower()
        category = 'pc_part'
        if any(x in lower for x in ['gpu', 'rtx', 'gtx', 'rx ', 'radeon', 'graphics card', 'carte graphique']):
            category = 'graphics-cards'
        elif any(x in lower for x in ['cpu', 'processeur', 'processor', 'core i', 'ryzen', 'intel']):
            category = 'processors'
        elif any(x in lower for x in ['ram', 'memoire', 'memory', 'ddr']):
            category = 'memory'
        elif any(x in lower for x in ['motherboard', 'carte mere', 'mainboard']):
            category = 'motherboards'
        elif any(x in lower for x in ['ssd', 'hdd', 'disque dur', 'stockage', 'nvme', 'hard drive']):
            category = 'storage'
        elif any(x in lower for x in ['psu', 'alimentation', 'power supply']):
            category = 'power-supplies'
        elif any(x in lower for x in ['case', 'boitier', 'chassis']):
            category = 'cases'
        elif any(x in lower for x in ['cooler', 'refroidissement', 'watercooling', 'fan']):
            category = 'cooling'
        elif any(x in lower for x in ['monitor', 'ecran', 'moniteur', 'display']):
            category = 'monitors'
        elif any(x in lower for x in ['keyboard', 'clavier']):
            category = 'keyboards'
        elif any(x in lower for x in ['mouse', 'souris']):
            category = 'mice'
        elif any(x in lower for x in ['headset', 'casque', 'headphone']):
            category = 'headsets'
        
        # Simple brand detection
        brand = None
        brands = ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Corsair', 'EVGA', 'AMD', 'Intel', 
                  'NVIDIA', 'Samsung', 'Crucial', 'Kingston', 'WD', 'Seagate', 'Cooler Master',
                  'NZXT', 'Be Quiet', 'Thermaltake', 'Fractal', 'Phanteks', 'Noctua',
                  'Logitech', 'Razer', 'SteelSeries', 'HyperX', 'AOC', 'LG', 'Dell', 'HP']
        for b in brands:
            if b.lower() in lower:
                brand = b
                break
        
        key = f"{category}::{name.lower().replace(' ', '-')[:40]}"
        groups[key].append({
            'name': name,
            'price': price,
            'old_price': old_price,
            'url': p.get('url', ''),
            'image': p.get('image', ''),
            'retailer_name': p.get('retailer_name', 'Ouedkniss'),
            'brand': brand,
            'category': category,
        })
    
    products = []
    for group_key, items in groups.items():
        if not items:
            continue
        first = items[0]
        prices = [p['price'] for p in items if p['price'] > 0]
        
        seen_urls = set()
        listings = []
        for p in items:
            url = p.get('url', '')
            if url in seen_urls or not url:
                continue
            seen_urls.add(url)
            listings.append({
                'source': p.get('retailer_name', 'Ouedkniss'),
                'price': p['price'],
                'old_price': p.get('old_price') or 0,
                'condition': 'new',
                'location': 'Algeria',
                'url': url,
                'imageUrl': p.get('image', '') or None,
            })
        
        if not listings or not prices:
            continue
        
        products.append({
            'id': f"prd-{group_key.replace('::', '-').replace('/', '-')[:40]}-{datetime.now().strftime('%H%M')}",
            'name': first['name'],
            'canonicalName': first['name'],
            'brand': first.get('brand'),
            'category': first.get('category', 'pc_part') if first.get('category') != 'pc_part' else 'pc_part',
            'specs': {},
            'imageUrl': first.get('image', '') or None,
            'bestPrice': min(prices) if prices else 0,
            'worstPrice': max(prices) if prices else 0,
            'averagePrice': round(sum(prices) / len(prices)) if prices else 0,
            'listingCount': len(listings),
            'storeCount': len(set(l['source'] for l in listings)),
            'listings': sorted(listings, key=lambda x: x['price']),
        })
    
    products.sort(key=lambda x: x['listingCount'], reverse=True)
    return products


def main():
    project_root = Path(__file__).parent.parent
    clean_path = project_root / 'public' / 'clean-products.json'
    oued_path = project_root / 'scripts' / 'ouedkniss-raw.json'
    
    print("[1/3] Loading existing clean-products.json...")
    with open(clean_path, 'r', encoding='utf-8') as f:
        clean_data = json.load(f)
    
    existing_products = clean_data.get('products', [])
    print(f"  [i] Loaded {len(existing_products)} existing products")
    
    # Remove old Ouedkniss products
    non_oued = [p for p in existing_products 
                if not any(is_ouedkniss(l.get('source', '')) for l in p.get('listings', []))]
    removed = len(existing_products) - len(non_oued)
    print(f"  [i] Removed {removed} old Ouedkniss products, kept {len(non_oued)} non-Ouedkniss")
    
    print("\n[2/3] Loading fresh Ouedkniss data...")
    with open(oued_path, 'r', encoding='utf-8') as f:
        oued_data = json.load(f)
    oued_raw = oued_data.get('products', [])
    print(f"  [+] Loaded {len(oued_raw)} raw Ouedkniss products")
    
    print("\n[3/3] Converting and merging Ouedkniss data...")
    oued_frontend = convert_ouedkniss_to_frontend(oued_raw)
    print(f"  [+] Converted to {len(oued_frontend)} frontend products")
    
    merged = non_oued + oued_frontend
    oued_count = sum(1 for p in merged if any(is_ouedkniss(l.get('source', '')) for l in p.get('listings', [])))
    print(f"\n[+] Final: {len(merged)} total ({oued_count} Ouedkniss, {len(merged) - oued_count} non-Ouedkniss)")
    
    output = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'total': len(merged),
        'stats': {
            'originalCount': len(oued_raw) + len(non_oued),
            'cleanCount': len(merged),
            'uniqueCount': len(merged),
            'ouedknissCount': oued_count,
            'nonOuedknissCount': len(merged) - oued_count,
        },
        'products': merged,
    }
    
    with open(clean_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\n[+] Saved to {clean_path}")
    
    # Also save to server data dir
    server_path = project_root / 'server' / 'data' / 'clean-products.json'
    server_path.parent.mkdir(parents=True, exist_ok=True)
    with open(server_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"[+] Saved to {server_path}")


if __name__ == '__main__':
    main()
