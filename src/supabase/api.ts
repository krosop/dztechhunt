import { getSupabase } from './client';
import type { PriceView, CategoryStat, StoreRow } from './types';

export type { PriceView, CategoryStat, StoreRow };

function db() {
  const client = getSupabase();
  if (!client) throw new Error('Supabase not configured');
  return client;
}

// ── Stores ──────────────────────────────────────────────

export async function getStores() {
  try {
    const { data, error } = await db().from('stores').select('*').order('name');
    if (error) throw error;
    return (data || []) as StoreRow[];
  } catch { return []; }
}

// ── Categories ──────────────────────────────────────────

export async function getCategories() {
  try {
    const { data, error } = await db().from('category_stats').select('*').order('product_count', { ascending: false });
    if (error) throw error;
    return (data || []) as CategoryStat[];
  } catch { return []; }
}

// ── Products ────────────────────────────────────────────

export async function getProducts(opts?: { category?: string; search?: string; store?: string; sortBy?: string; limit?: number }) {
  try {
    let q = db().from('product_prices').select('*');
    if (opts?.category) q = q.eq('category_slug', opts.category);
    if (opts?.search) q = q.or(`product_name.ilike.%${opts.search}%,product_brand.ilike.%${opts.search}%`);
    if (opts?.store) q = q.eq('store_id', opts.store);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as PriceView[];
  } catch { return []; }
}

export async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await db().from('product_prices').select('*').eq('product_slug', slug);
    if (error) throw error;
    return (data || []) as PriceView[];
  } catch { return []; }
}

// ── Top Deals ───────────────────────────────────────────

export async function getTopDeals(limit = 10) {
  try {
    const { data, error } = await db().from('product_prices').select('*').gt('savings', 0).order('savings', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as PriceView[];
  } catch { return []; }
}

// ── Trending ────────────────────────────────────────────

export async function getTrending(limit = 10) {
  try {
    const { data, error } = await db().from('product_prices').select('*').order('product_review_count', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as PriceView[];
  } catch { return []; }
}

// ── Related Products ────────────────────────────────────

export async function getRelatedProducts(productId: string, categorySlug: string, limit = 6) {
  try {
    const { data, error } = await db().from('product_prices').select('*').eq('category_slug', categorySlug).neq('product_id', productId).order('current_price', { ascending: true }).limit(limit);
    if (error) throw error;
    return (data || []) as PriceView[];
  } catch { return []; }
}

// ── Counts ──────────────────────────────────────────────

export async function getProductCount() {
  try {
    const { count, error } = await db().from('products').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  } catch { return 0; }
}

export async function getStoreCount() {
  try {
    const { count, error } = await db().from('stores').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  } catch { return 0; }
}

// ── Real-time Subscriptions ─────────────────────────────

export function subscribeToPriceChanges(callback: (payload: any) => void) {
  const client = getSupabase();
  if (!client) return { unsubscribe: () => {} };
  return client.channel('price_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'prices' }, callback).subscribe();
}

export function subscribeToProductUpdates(productId: string, callback: (payload: any) => void) {
  const client = getSupabase();
  if (!client) return { unsubscribe: () => {} };
  return client.channel(`product_${productId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'prices', filter: `product_id=eq.${productId}` }, callback).subscribe();
}
