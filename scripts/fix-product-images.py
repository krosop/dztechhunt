import sys
import json
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

def fetch_image(url, name):
    """Fetch a single product page and extract image."""
    try:
        import requests
        from bs4 import BeautifulSoup
        
        time.sleep(random.uniform(0.3, 0.8))
        resp = requests.get(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }, timeout=15)
        resp.raise_for_status()
        
        soup = BeautifulSoup(resp.text, 'lxml')
        
        # Strategy 1: Large product images (Shopify)
        best_img = None
        best_size = 0
        
        for img in soup.find_all('img'):
            src = img.get('src', '') or img.get('data-src', '') or img.get('data-lazy-src', '')
            if not src:
                continue
            if any(x in src.lower() for x in ['logo', 'icon', 'avatar', 'favicon', 'badge', 'payment']):
                continue
            
            # Remove thumbnail suffix to get full image
            if '70x' in src or '100x' in src or '150x' in src:
                src = src.replace('70x', '').replace('100x', '').replace('150x', '').replace('..', '.')
            
            w = img.get('width', '')
            h = img.get('height', '')
            try:
                size = (int(w) if w else 0) * (int(h) if h else 0)
            except ValueError:
                size = 0
            
            if size > best_size and size > 40000:
                best_size = size
                best_img = src
        
        if best_img:
            if best_img.startswith('//'):
                best_img = 'https:' + best_img
            return best_img
        
        # Strategy 2: Meta og:image
        meta_img = soup.find('meta', property='og:image')
        if meta_img and meta_img.get('content'):
            return meta_img['content']
        
        return None
    except Exception as e:
        return None


def fix_missing_images(data_path, output_path, max_workers=10):
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    products = data.get('products', [])
    
    # Collect products that need image fixing
    to_fix = []
    for i, p in enumerate(products):
        has_image = p.get('image') and len(p.get('image', '')) > 10
        if has_image:
            continue
        listings = p.get('listings', [])
        if not listings:
            continue
        url = listings[0].get('url', '')
        if not url or url.startswith('/'):
            continue
        to_fix.append((i, p, url))
    
    print(f"Products needing images: {len(to_fix)}")
    print(f"Processing with {max_workers} concurrent workers...\n")
    
    fixed = 0
    failed = 0
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(fetch_image, url, p['name']): (i, p, url) for i, p, url in to_fix}
        
        for future in as_completed(futures):
            i, p, url = futures[future]
            try:
                img = future.result(timeout=20)
                if img:
                    p['image'] = img
                    p['imageUrl'] = img
                    for l in p.get('listings', []):
                        l['image'] = img
                    fixed += 1
                    print(f"  FIXED [{fixed}]: {p['name'][:40]}...")
                else:
                    failed += 1
                    # print(f"  NO IMAGE: {p['name'][:40]}...")
            except Exception as e:
                failed += 1
                # print(f"  ERROR: {p['name'][:40]}... ({e})")
    
    print(f"\nFixed: {fixed}")
    print(f"Failed: {failed}")
    print(f"Total: {len(to_fix)}")
    
    data['timestamp'] = __import__('datetime').datetime.now().isoformat()
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved to {output_path}")


if __name__ == '__main__':
    data_path = sys.argv[1] if len(sys.argv) > 1 else 'public/clean-products.json'
    output_path = sys.argv[2] if len(sys.argv) > 2 else data_path
    fix_missing_images(data_path, output_path)
