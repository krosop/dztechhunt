import { useState, useEffect, useRef } from 'react';

const imageCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

// SearchAPI.io key — free tier: 100 searches/month
const SEARCHAPI_KEY = 'SDLn9wHvG9fUTBJxKXkLE1X5';

/** Build a proxied image URL that handles CORS, caching, and resizing */
export function proxiedImageUrl(originalUrl: string, width: number = 300): string | null {
  if (!originalUrl || originalUrl.length < 10) return null;

  // Already proxied — don't double-proxy
  if (originalUrl.includes('weserv.nl') || originalUrl.includes('wsrv.nl')) {
    return originalUrl;
  }

  // Data URIs — pass through
  if (originalUrl.startsWith('data:')) return originalUrl;

  // Use weserv.nl proxy (free, global CDN, handles CORS, caches images)
  try {
    const encoded = encodeURIComponent(originalUrl);
    return `https://images.weserv.nl/?url=${encoded}&w=${width}&q=85&output=webp&n=-1&we`;
  } catch {
    return originalUrl;
  }
}

/** Search Google Images via SearchAPI.io for a product name */
async function searchGoogleImages(query: string): Promise<string | null> {
  const cacheKey = `searchapi_${query.trim().toLowerCase().replace(/[^\w\d]+/g, '_').substring(0, 40)}`;

  // Check localStorage cache (7 days)
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      const { url, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
        return url;
      }
    }
  } catch { /* ignore */ }

  // Deduplicate in-flight requests
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const request = fetch(
    `https://www.searchapi.io/api/v1/search?engine=google_images&q=${encodeURIComponent(query)}&api_key=${SEARCHAPI_KEY}&num=3`
  )
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      const images = data.images || data.images_results || data.image_results || [];
      
      // Find first valid image URL
      for (const img of images) {
        const url = img.original?.link || img.original || img.thumbnail;
        if (url && url.length > 10 && url.startsWith('http')) {
          // Cache result
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ url, timestamp: Date.now() }));
          } catch { /* ignore */ }
          return url;
        }
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, request);
  return request;
}

/** Preload images in batches — called from page components */
export async function preloadProductImages(items: { name: string; image?: string | null }[]): Promise<void> {
  // Just trigger browser preloading for existing images
  const existingUrls = items
    .map(i => i.image)
    .filter((u): u is string => !!u && u.length > 10);

  const BATCH_SIZE = 10;
  for (let i = 0; i < existingUrls.length; i += BATCH_SIZE) {
    const batch = existingUrls.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(url =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = proxiedImageUrl(url) || url;
        })
      )
    );
  }
}

export function useProductImage(productName: string, imageUrl: string | null | undefined) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(imageUrl || null);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    // If we already have a store image URL, proxy it and we're done
    if (imageUrl && imageUrl.length > 10) {
      const proxied = proxiedImageUrl(imageUrl);
      setResolvedUrl(proxied);
      return;
    }

    // No store image — try Google Images search
    if (!productName || fetched.current) return;
    fetched.current = true;

    const name = productName.trim();
    if (name.length < 3) {
      setResolvedUrl(null);
      return;
    }

    // Check if we already searched this product
    const cacheKey = `searchapi_${name.toLowerCase().replace(/[^\w\d]+/g, '_').substring(0, 40)}`;
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const { url } = JSON.parse(stored);
        if (url) {
          setResolvedUrl(proxiedImageUrl(url));
          return;
        }
      }
    } catch { /* ignore */ }

    setLoading(true);

    searchGoogleImages(name)
      .then((url) => {
        if (url) {
          setResolvedUrl(proxiedImageUrl(url));
        } else {
          setResolvedUrl(null);
        }
      })
      .finally(() => setLoading(false));
  }, [productName, imageUrl]);

  return { imageUrl: resolvedUrl, loading };
}
