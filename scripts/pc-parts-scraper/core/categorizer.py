"""
PC Parts Categorizer & Spec Extractor
The brain of the scraper - takes raw product names and extracts structured data.
"""
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# ═══════════════════════════════════════════════════════════
#  KEYWORD DATABASE
# ═══════════════════════════════════════════════════════════

BRANDS = {
    'cpu': ['intel', 'amd', 'ryzen', 'core', 'xeon', 'threadripper', 'athlon', 'pentium', 'celeron'],
    'gpu': ['nvidia', 'geforce', 'amd', 'radeon', 'asus', 'msi', 'gigabyte', 'evga', 'sapphire', 'xfx',
            'powercolor', 'zotac', 'palit', 'pny', 'intel', 'arc'],
    'ram': ['corsair', 'gskill', 'g.skill', 'kingston', 'crucial', 'adata', 'teamgroup', 'patriot',
            'thermaltake', 'lexar', 'fury', 'vengeance', 'trident'],
    'storage': ['samsung', 'wd', 'western digital', 'seagate', 'crucial', 'kingston', 'adata',
                'teamgroup', 'lexar', 'gigabyte', 'msi', 'sandisk', 'intel'],
    'monitor': ['asus', 'msi', 'lg', 'samsung', 'benq', 'aoc', 'dell', 'hp', 'lenovo', 'philips',
                'viewsonic', 'gigabyte', 'acer', 'predator', 'nzxt', 'magma', 'maxipower',
                'game revolution', 'benq', 'proart', 'xiaomi'],
    'motherboard': ['asus', 'msi', 'gigabyte', 'asrock', 'biostar', 'evga'],
    'psu': ['corsair', 'evga', 'seasonic', 'be quiet', 'thermaltake', 'cooler master', 'msi',
            'gigabyte', 'asus', 'coolermaster'],
    'case': ['nzxt', 'corsair', 'cooler master', 'fractal design', 'phanteks', 'lian li',
             'thermaltake', 'be quiet', 'deepcool', 'antec'],
    'cooling': ['nzxt', 'corsair', 'cooler master', 'noctua', 'be quiet', 'deepcool',
                'thermaltake', 'arctic', 'asus', 'msi'],
}

ALL_BRANDS = list(dict.fromkeys(
    brand for brands in BRANDS.values() for brand in brands
))

# Category detection patterns with weights
CATEGORY_PATTERNS = {
    'cpu': [
        (r'\bprocesseur\b|\bcpu\b|\bcore\s+i[3579]\b|\bryzen\s+[3579]\b|\bathlon\b|\bpentium\b|\bceleron\b|\bthreadripper\b|\bxeon\b|\bultra\s+[579]', 10),
        (r'\d+\s*c(?:oeurs?)?[\/\s]\d+\s*t\b', 8),
        (r'\d+\.?\d*\s*ghz.*\d+\s*core', 5),
        (r'\b(socket\s+(?:am[45]|lga\d+)|am[45]\b|lga\d+)', 6),
    ],
    'gpu': [
        (r'\brtc\s*\d{4}\s*(?:ti|super)?\b|\bgtx\s*\d{3,4}\b|\bgt\s*\d{3,4}\b|\brx\s*\d{4}\s*(?:xt|xtx)?\b', 10),
        (r'\bgeforce\b|\bradeon\b|\bcarte\s+graphique\b|\bgraphics\s+card\b', 8),
        (r'\bgddr[56]x?\b|\bvram\b', 7),
        (r'\bgraphics\b|\bvideo\s+card\b', 5),
    ],
    'ram': [
        (r'\bddr[345]\b|\bram\b|\bm[eé]moire\b|\bmemory\b', 10),
        (r'\bcl\d+\b|\bcas\s+latency\b', 7),
        (r'\bkit\s+\d+x\d+\b|\bdual\s+channel\b|\bquad\s+channel\b', 6),
    ],
    'storage': [
        (r'\bssd\b|\bhdd\b|\bnvme\b|\bm\.2\b|\bhard\s+drive\b|\bdisque\s+dur\b', 10),
        (r'\bsata\s+ssd\b|\bpcie\s+ssd\b', 6),
        (r'\b\d+\s*(?:go|gb|tb|to)\s+(?:ssd|hdd|nvme)\b', 5),
    ],
    'monitor': [
        (r'\b[eé]cran\b|\bmonitor\b|\bdisplay\b|\b[eé]cran\s+pc\b', 10),
        (r'\b\d+[\"\']?\s*(?:\d+\s*hz|\bhz\b|\bpouces?\b|\binch\b)', 7),
        (r'\b(?:fhd|qhd|uhd|4k|full\s+hd|2k|wqhd)\b.*\d+\s*hz', 5),
        (r'\bips\b|\bva\b|\btn\b|\boled\b|\bmini[-\s]?led\b', 4),
    ],
    'motherboard': [
        (r'\bcarte\s+m[eè]re\b|\bmotherboard\b|\bmainboard\b', 10),
        (r'\b(?:z\d{3}|b\d{3}|x\d{3}|h\d{3})\b', 5),
        (r'\bddr[45].*(?:lga|am|socket)\b', 4),
    ],
    'psu': [
        (r'\balimentation\b|\bpower\s+supply\b|\bpsu\b|\b80\s*plus\b', 10),
        (r'\b\d{3,4}\s*w\b', 3),
    ],
    'case': [
        (r'\bbo[iî]tier\b|\bcase\b|\bchassis\b|\btower\b', 10),
    ],
    'cooling': [
        (r'\bcooler\b|\bventilateur\b|\bfan\b|\bradiator\b|\baio\b|\bwater\s+cooling\b|\bliquid\s+cooler\b', 10),
        (r'\b\d+\s*mm\s*(?:aio|fan|radiator)\b', 5),
    ],
    'keyboard': [
        (r'\bclavier\b|\bkeyboard\b', 10),
    ],
    'mouse': [
        (r'\bsouris\b|\bmouse\b', 10),
    ],
    'headset': [
        (r'\bcasque\b|\bheadset\b|\bheadphone\b', 10),
    ],
}

# URL-based category hints
URL_CATEGORY_HINTS = {
    'processeur': 'cpu', 'processor': 'cpu', 'cpu': 'cpu',
    'carte-graphique': 'gpu', 'graphics-card': 'gpu', 'gpu': 'gpu',
    'ram': 'ram', 'memoire': 'ram', 'memory': 'ram',
    'carte-mere': 'motherboard', 'motherboard': 'motherboard',
    'disque': 'storage', 'storage': 'storage', 'ssd': 'storage', 'hdd': 'storage',
    'monitor': 'monitor', 'ecran': 'monitor', 'display': 'monitor',
    'alimentation': 'psu', 'psu': 'psu', 'power': 'psu',
    'boitier': 'case', 'case': 'case', 'chassis': 'case',
    'cooling': 'cooling', 'ventilateur': 'cooling', 'fan': 'cooling',
    'clavier': 'keyboard', 'keyboard': 'keyboard',
    'souris': 'mouse', 'mouse': 'mouse',
    'casque': 'headset', 'headset': 'headset',
}

# ═══════════════════════════════════════════════════════════
#  SPEC EXTRACTION FUNCTIONS
# ═══════════════════════════════════════════════════════════

def extract_cpu_specs(name: str) -> Dict:
    """Extract CPU-specific specs from product name."""
    specs = {}

    # Cores
    m = re.search(r'(\d+)\s*(?:c(?:oeurs?)?|cores?)', name, re.I)
    if m:
        specs['cores'] = int(m.group(1))

    # Threads
    m = re.search(r'(\d+)\s*(?:threads?)', name, re.I)
    if m:
        specs['threads'] = int(m.group(1))

    # Base frequency
    m = re.search(r'(\d+[\.,]?\d*)\s*ghz', name, re.I)
    if m:
        specs['base_clock'] = m.group(1).replace(',', '.') + ' GHz'

    # Boost frequency
    m = re.search(r'(?:up to|jusqu\'[aà])\s+(\d+[\.,]?\d*)\s*ghz', name, re.I)
    if m:
        specs['boost_clock'] = m.group(1).replace(',', '.') + ' GHz'

    # Cache
    m = re.search(r'(\d+)\s*(?:mo|mb)\s*(?:cache|smart cache)', name, re.I)
    if m:
        specs['cache'] = m.group(1) + ' MB'

    # Socket
    socket_map = {
        'am5': 'AM5', 'socket am5': 'AM5',
        'am4': 'AM4', 'socket am4': 'AM4',
        'lga1700': 'LGA1700', 'lga 1700': 'LGA1700', 'socket 1700': 'LGA1700',
        'lga1200': 'LGA1200', 'lga 1200': 'LGA1200',
    }
    lower = name.lower()
    for key, val in socket_map.items():
        if key in lower:
            specs['socket'] = val
            break

    # Generation
    m = re.search(r'(\d+)(?:th|°)\s*gen', name, re.I)
    if m:
        specs['generation'] = m.group(1) + 'th Gen'

    # Integrated graphics
    if 'f' in lower.split() or name.endswith('F') or '-F' in name:
        specs['igpu'] = 'No'
    elif any(x in lower for x in ['uhd', 'radeon graphics', 'vega', '8600g', '8700g', '5700g']):
        specs['igpu'] = 'Yes'

    return specs


def extract_gpu_specs(name: str) -> Dict:
    """Extract GPU-specific specs from product name."""
    specs = {}

    # VRAM
    m = re.search(r'(\d+)\s*(?:gb|go)', name, re.I)
    if m:
        specs['vram'] = m.group(1) + ' GB'

    # Chipset model
    for pattern in [r'rtx\s*(\d{4})\s*(ti|super)?', r'gtx\s*(\d{3,4})', r'gt\s*(\d{3,4})',
                    r'rx\s*(\d{4})\s*(xt|xtx)?', r'arc\s*a(\d+)']:
        m = re.search(pattern, name, re.I)
        if m:
            specs['chipset'] = m.group(0).upper()
            break

    # Boost clock
    m = re.search(r'(\d+)\s*mhz', name, re.I)
    if m:
        specs['boost_clock'] = m.group(1) + ' MHz'

    # Manufacturer variant
    variants = ['strix', 'tuf', 'gaming x', 'gaming', 'aero', 'ventus', 'suprim',
                'eagle', 'windforce', 'phantom', 'challenger', 'dual']
    lower = name.lower()
    for v in variants:
        if v in lower:
            specs['variant'] = v.title()
            break

    return specs


def extract_ram_specs(name: str) -> Dict:
    """Extract RAM-specific specs from product name."""
    specs = {}

    # Type
    lower = name.lower()
    if 'ddr5' in lower:
        specs['type'] = 'DDR5'
    elif 'ddr4' in lower:
        specs['type'] = 'DDR4'
    elif 'ddr3' in lower:
        specs['type'] = 'DDR3'

    # Capacity
    m = re.search(r'(\d+)\s*(?:gb|go)', name, re.I)
    if m:
        specs['capacity'] = m.group(1) + ' GB'

    # Speed
    m = re.search(r'(\d{4,5})\s*(?:mhz|mt/s)', name, re.I)
    if m:
        specs['speed'] = m.group(1) + ' MHz'

    # CAS Latency
    m = re.search(r'cl(\d+)', name, re.I)
    if m:
        specs['cas_latency'] = 'CL' + m.group(1)

    # Kit configuration
    m = re.search(r'(\d+)x(\d+)', name, re.I)
    if m:
        specs['sticks'] = m.group(1)
        specs['stick_size'] = m.group(2) + ' GB'
    elif 'single' in lower:
        specs['sticks'] = '1'

    # RGB
    if 'rgb' in lower:
        specs['rgb'] = 'Yes'

    return specs


def extract_monitor_specs(name: str) -> Dict:
    """Extract Monitor-specific specs from product name."""
    specs = {}

    # Size
    m = re.search(r'(\d+[\.,]?\d*)\s*(?:"|inch|pouces)', name, re.I)
    if m:
        specs['size'] = m.group(1).replace(',', '.') + '"'

    # Refresh rate
    m = re.search(r'(\d+)\s*hz', name, re.I)
    if m:
        specs['refresh_rate'] = m.group(1) + ' Hz'

    # Resolution
    lower = name.lower()
    if '4k' in lower or 'uhd' in lower:
        specs['resolution'] = '4K UHD'
    elif '2k' in lower or 'qhd' in lower or 'wqhd' in lower:
        specs['resolution'] = 'QHD 2K'
    elif 'fhd' in lower or 'full hd' in lower:
        specs['resolution'] = 'Full HD'
    elif 'hd' in lower:
        specs['resolution'] = 'HD'

    # Panel type
    for panel in ['ips', 'va', 'tn', 'oled', 'qled', 'mini-led']:
        if panel in lower:
            specs['panel'] = panel.upper()
            break

    # Response time
    m = re.search(r'(\d+(?:[\.,]\d+)?)\s*ms', name, re.I)
    if m:
        specs['response_time'] = m.group(1).replace(',', '.') + 'ms'

    return specs


def extract_storage_specs(name: str) -> Dict:
    """Extract Storage-specific specs from product name."""
    specs = {}

    # Capacity
    m = re.search(r'(\d+)\s*(tb|to|gb|go)', name, re.I)
    if m:
        specs['capacity'] = m.group(1) + ' ' + m.group(2).upper()

    # Type
    lower = name.lower()
    if 'nvme' in lower:
        specs['type'] = 'NVMe SSD'
    elif 'm.2' in lower:
        specs['type'] = 'M.2 SSD'
    elif 'sata' in lower and 'ssd' in lower:
        specs['type'] = 'SATA SSD'
    elif 'ssd' in lower:
        specs['type'] = 'SATA SSD'
    elif 'hdd' in lower:
        specs['type'] = 'HDD'

    # Read speed
    m = re.search(r'(\d{3,4})\s*(?:mo/s|mb/s)', name, re.I)
    if m:
        specs['read_speed'] = m.group(1) + ' MB/s'

    # Generation
    m = re.search(r'pcie\s*(\d[\.,]\d)', name, re.I)
    if m:
        specs['pcie'] = 'PCIe ' + m.group(1)

    return specs


def extract_motherboard_specs(name: str) -> Dict:
    """Extract motherboard-specific specs from product name."""
    specs = {}

    # Chipset
    m = re.search(r'\b([zbxh]\d{3}[a-z]?)\b', name, re.I)
    if m:
        specs['chipset'] = m.group(1).upper()

    # Memory type
    lower = name.lower()
    if 'ddr5' in lower:
        specs['memory'] = 'DDR5'
    elif 'ddr4' in lower:
        specs['memory'] = 'DDR4'

    # Socket
    for s in ['am5', 'am4', 'lga1700', 'lga 1700']:
        if s in lower:
            specs['socket'] = s.upper().replace(' ', '')
            break

    # Form factor
    for ff in ['eatx', 'atx', 'micro-atx', 'matx', 'mini-itx', 'mitx']:
        if ff in lower:
            specs['form_factor'] = ff.upper()
            break

    # WiFi
    if 'wifi' in lower:
        specs['wifi'] = 'Yes'

    return specs


def extract_psu_specs(name: str) -> Dict:
    """Extract PSU-specific specs from product name."""
    specs = {}

    # Wattage
    m = re.search(r'(\d{3,4})\s*w', name, re.I)
    if m:
        specs['wattage'] = m.group(1) + 'W'

    # Efficiency
    lower = name.lower()
    for cert in ['80 plus titanium', '80 plus platinum', '80 plus gold', '80 plus silver', '80 plus bronze']:
        if cert in lower:
            specs['efficiency'] = cert.title()
            break

    # Modular
    if 'fully modular' in lower:
        specs['modular'] = 'Full'
    elif 'semi modular' in lower:
        specs['modular'] = 'Semi'
    elif 'modular' in lower:
        specs['modular'] = 'Yes'

    return specs


# ═══════════════════════════════════════════════════════════
#  MAIN DETECTION & EXTRACTION
# ═══════════════════════════════════════════════════════════

def detect_category(name: str, url: str = '') -> str:
    """Detect product category from name and URL with weighted scoring."""
    lower_name = name.lower()
    lower_url = url.lower()
    scores: Dict[str, int] = {}

    # Score based on name patterns
    for category, patterns in CATEGORY_PATTERNS.items():
        for pattern, weight in patterns:
            if re.search(pattern, lower_name):
                scores[category] = scores.get(category, 0) + weight

    # URL hints
    for hint, cat in URL_CATEGORY_HINTS.items():
        if hint in lower_url:
            scores[cat] = scores.get(cat, 0) + 5

    # Return highest scoring category
    if scores:
        best = max(scores.items(), key=lambda x: x[1])
        if best[1] >= 3:
            return best[0]

    return 'unknown'


def extract_specs(name: str, category: str) -> Dict:
    """Extract all relevant specs based on category."""
    extractors = {
        'cpu': extract_cpu_specs,
        'gpu': extract_gpu_specs,
        'ram': extract_ram_specs,
        'monitor': extract_monitor_specs,
        'storage': extract_storage_specs,
        'motherboard': extract_motherboard_specs,
        'psu': extract_psu_specs,
    }

    extractor = extractors.get(category)
    return extractor(name) if extractor else {}


def detect_brand(name: str) -> str:
    """Detect brand from product name."""
    lower = name.lower()
    for brand in ALL_BRANDS:
        if brand.lower() in lower:
            return brand.title()
    return 'Unknown'


def detect_condition(name: str) -> str:
    """Detect product condition from name."""
    lower = name.lower()
    if any(w in lower for w in ['used', 'occasion', 'reconditionné', 'renewed', 'refurbished']):
        return 'Used'
    if any(w in lower for w in ['tray', 'oem', 'bulk', 'mpk']):
        return 'Tray/OEM'
    if any(w in lower for w in ['box', 'boite', 'retail']):
        return 'Box/Retail'
    return 'New'


def normalize_model_key(name: str, category: str) -> str:
    """Create a normalized key for matching same products across retailers."""
    lower = re.sub(r'[^\w\s\d]', ' ', name.lower())

    if category == 'cpu':
        # Extract Intel/AMD model numbers
        for pattern in [r'i[3579]\s*\d{4,5}[a-z]*', r'ryzen\s+[3579]\s*\d{4}[a-z]*',
                       r'athlon\s+\w+', r'xeon\s+\w+']:
            m = re.search(pattern, lower)
            if m:
                return m.group(0).replace(' ', '')

    elif category == 'gpu':
        for pattern in [r'rtx\s*\d{4}\s*(?:ti|super)?', r'gtx\s*\d{3,4}',
                       r'rx\s*\d{4}\s*(?:xt|xtx)?', r'arc\s*a\d+']:
            m = re.search(pattern, lower)
            if m:
                return m.group(0).replace(' ', '')

    elif category == 'ram':
        m = re.search(r'(\d+)\s*gb.*ddr[345].*\d{4}', lower)
        if m:
            return m.group(0).replace(' ', '')

    elif category == 'monitor':
        size = re.search(r'(\d+)\s*(?:"|inch)', lower)
        hz = re.search(r'(\d+)\s*hz', lower)
        if size and hz:
            return f"{size.group(1)}inch{hz.group(1)}hz"

    elif category == 'storage':
        m = re.search(r'(\d+)\s*(tb|gb).*\b(nvme|ssd|hdd)\b', lower)
        if m:
            return m.group(0).replace(' ', '')

    # Fallback: first 5 significant words
    words = [w for w in lower.split() if len(w) > 2]
    return ''.join(words[:5])


def clean_product(raw: dict) -> dict:
    """Full cleaning pipeline for a raw scraped product."""
    name = raw.get('name', '').strip()
    url = raw.get('url', '')

    # Clean HTML entities
    name = (name
        .replace('&amp;', '&')
        .replace('&quot;', '"')
        .replace('&#x27;', "'")
        .replace('&lt;', '<')
        .replace('&gt;', '>')
        .replace('&nbsp;', ' ')
        .replace('  ', ' ')
    )

    # Detect attributes
    category = detect_category(name, url)
    brand = detect_brand(name)
    specs = extract_specs(name, category)
    condition = detect_condition(name)
    model_key = normalize_model_key(name, category)

    # Parse price
    def parse_price(p):
        if not p:
            return None
        cleaned = re.sub(r'[\s\u00A0]', '', str(p))
        cleaned = re.sub(r'DA|DZD|\$|€|£', '', cleaned, flags=re.I)
        cleaned = cleaned.replace(',', '')
        try:
            return float(cleaned)
        except ValueError:
            return None

    price = parse_price(raw.get('price'))
    old_price = parse_price(raw.get('old_price'))

    # Format prices
    def fmt_price(p):
        if p is None:
            return ''
        return f"{p:,.0f} DA"

    return {
        'name': name,
        'price': price or 0,
        'price_formatted': fmt_price(price),
        'old_price': old_price,
        'old_price_formatted': fmt_price(old_price) if old_price else None,
        'availability': raw.get('availability', 'Unknown'),
        'in_stock': not bool(re.search(r'out of stock|rupture|épuisé|indisponible', raw.get('availability', ''), re.I)),
        'url': url,
        'image': raw.get('image', ''),
        'site': raw.get('site', ''),
        'retailer_name': raw.get('retailer_name', raw.get('site', '').replace('.com.dz', '').replace('.com', '').title()),
        'category': category,
        'brand': brand,
        'sku': raw.get('sku') or raw.get('product_id') or model_key,
        'model_key': model_key,
        'condition': condition,
        'specs': specs,
        'scraped_at': raw.get('scraped_at', datetime.utcnow().isoformat()),
    }


def clean_all(raw_products: List[dict]) -> List[dict]:
    """Clean a batch of raw products."""
    cleaned = []
    for raw in raw_products:
        try:
            product = clean_product(raw)
            if product['name'] and product['price'] > 0:
                cleaned.append(product)
        except Exception as e:
            print(f"[WARN] Failed to clean product: {e}")
            continue
    return cleaned


def find_matches(product: dict, all_products: List[dict], threshold: int = 20) -> List[dict]:
    """Find the same product across different retailers."""
    matches = []
    for other in all_products:
        if other['url'] == product['url']:
            continue
        if other['category'] != product['category']:
            continue

        score = 0
        # Model key match (strong signal)
        if product.get('model_key') and other.get('model_key'):
            if product['model_key'] == other['model_key']:
                score += 50
            elif product['model_key'] in other['model_key'] or other['model_key'] in product['model_key']:
                score += 25

        # Brand match
        if product['brand'] == other['brand'] and product['brand'] != 'Unknown':
            score += 10

        # Word overlap
        words_a = set(product['name'].lower().split())
        words_b = set(other['name'].lower().split())
        overlap = words_a & words_b - {'pc', 'ecran', 'processeur', 'carte', 'avec', 'the', 'de', 'le', 'la'}
        score += len(overlap) * 3

        if score >= threshold:
            matches.append({**other, '_match_score': score})

    return sorted(matches, key=lambda x: x['_match_score'], reverse=True)


def build_comparison_table(products: List[dict]) -> List[dict]:
    """Build cross-retailer comparison for products found on multiple sites."""
    # Group by model key
    groups: Dict[str, List[dict]] = {}
    for p in products:
        key = p.get('model_key', p['name'])
        if key not in groups:
            groups[key] = []
        groups[key].append(p)

    # Only keep groups with multiple retailers
    comparisons = []
    for key, listings in groups.items():
        if len(listings) < 2:
            continue

        valid = [l for l in listings if l.get('price', 0) > 0]
        if not valid:
            continue

        cheapest = min(valid, key=lambda x: x['price'])
        priciest = max(valid, key=lambda x: x['price'])

        comparisons.append({
            'product_key': key,
            'name': listings[0]['name'][:80],
            'category': listings[0]['category'],
            'brand': listings[0]['brand'],
            'specs': listings[0].get('specs', {}),
            'listings': [
                {
                    'retailer': l['retailer_name'],
                    'price': l['price'],
                    'price_formatted': l['price_formatted'],
                    'url': l['url'],
                    'in_stock': l.get('in_stock', True),
                    'on_sale': l.get('on_sale', False) if isinstance(l.get('on_sale'), bool) else bool(l.get('old_price')),
                }
                for l in sorted(valid, key=lambda x: x['price'])
            ],
            'cheapest_retailer': cheapest['retailer_name'],
            'cheapest_price': cheapest['price_formatted'],
            'highest_price': priciest['price_formatted'],
            'savings': round(priciest['price'] - cheapest['price']) if priciest['price'] > cheapest['price'] else 0,
            'listing_count': len(valid)
        })

    return sorted(comparisons, key=lambda x: x['savings'], reverse=True)
