#!/usr/bin/env python3
"""
Download images for deals and trending products to public/images/.
These are served from Vercel's CDN instead of slow external store servers.

Usage:
    python scripts/download-deal-images.py

After running, images are saved in public/images/ and products.json references them.
"""
import json
import requests
import os
import hashlib
from pathlib import Path
from urllib.parse import urlparse

IMAGES_DIR = Path('public/images')
IMAGES_DIR.mkdir(exist_ok=True)


def download_image(url, product_id):
    """Download image and return local path."""
    if not url or not url.startswith('http'):
        return None
    
    try:
        # Determine extension from URL
        parsed = urlparse(url)
        ext = Path(parsed.path).suffix
        if not ext:
            ext = '.jpg'
        ext = ext.split('?')[0]  # Remove query params
        if ext not in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
            ext = '.jpg'
        
        filename = f"{product_id}{ext}"
        local_path = IMAGES_DIR / filename
        
        # Skip if already exists
        if local_path.exists():
            return f"/images/{filename}"
        
        # Download
        resp = requests.get(url, timeout=15, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp.raise_for_status()
        
        # Only save if it's actually an image
        content_type = resp.headers.get('Content-Type', '')
        if not content_type.startswith('image/'):
            return None
        
        local_path.write_bytes(resp.content)
        print(f"  [+] Downloaded {filename} ({len(resp.content)//1024}KB)")
        return f"/images/{filename}"
    
    except Exception as e:
        print(f"  [!] Failed: {e}")
        return None


def main():
    print("=" * 60)
    print("  Downloading deal + trending images")
    print("=" * 60)
    
    with open('public/data/products.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    products = {p['id']: p for p in data['products']}
    
    # Pick deal + trending images (same logic as frontend)
    # Products with savings (sorted by savings desc)
    with_savings = sorted(
        [p for p in products.values() if p.get('savings', 0) > 0],
        key=lambda p: p['savings'], reverse=True
    )
    deals = with_savings[:10]
    
    # Random-ish trending (take top 15 by review count as proxy)
    trending = sorted(
        products.values(),
        key=lambda p: p.get('reviewCount', 0), reverse=True
    )[:15]
    
    # Unique products to download
    to_download = {}
    for p in list(deals) + list(trending):
        if p['id'] not in to_download:
            to_download[p['id']] = p
    
    print(f"\n[+] Downloading {len(to_download)} unique images...")
    
    downloaded = 0
    failed = 0
    
    for pid, p in to_download.items():
        img_url = p.get('image', '')
        if not img_url or not img_url.startswith('http'):
            failed += 1
            continue
        
        local_url = download_image(img_url, pid)
        if local_url:
            # Update product image to local path
            p['image'] = local_url
            # Update in main data too
            if pid in products:
                products[pid]['image'] = local_url
            downloaded += 1
        else:
            failed += 1
    
    print(f"\n[+] Downloaded: {downloaded}, Failed: {failed}")
    
    # Save updated products.json
    with open('public/data/products.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"[+] Updated public/data/products.json")
    print(f"\nNext: git add public/images public/data/products.json && git commit")


if __name__ == '__main__':
    main()
