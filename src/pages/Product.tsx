import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug, getRelatedProducts, subscribeToProductUpdates } from '@/supabase/api';
import type { PriceView } from '@/supabase/types';
import { useData } from '@/components/DataProvider';
import { useTranslation } from '@/i18n/useTranslation';
import NavigationBar from '@/components/NavigationBar';
import ProductHero from '@/sections/ProductHero';
import DealsTable from '@/sections/DealsTable';
import RelatedProducts from '@/sections/RelatedProducts';
import SEO from '@/components/SEO';

export default function Product() {
  const { t, isRTL } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { loading: dataLoading, allProducts } = useData();

  // Try to find product from local data first (faster, no Supabase needed)
  const localEntries = useMemo(() => {
    if (!slug) return [];
    return allProducts.filter(p => p.product_slug === slug);
  }, [allProducts, slug]);

  const [entries, setEntries] = useState<PriceView[]>(localEntries);
  const [related, setRelated] = useState<PriceView[]>([]);
  const [loading, setLoading] = useState(dataLoading);
  const [error, setError] = useState<string | null>(null);

  // Use local data immediately if available
  useEffect(() => {
    if (localEntries.length > 0) {
      setEntries(localEntries);
      // Find related products from same category
      const first = localEntries[0];
      const rel = allProducts
        .filter(p => p.category_slug === first.category_slug && p.product_id !== first.product_id)
        .slice(0, 6);
      setRelated(rel);
      setLoading(false);
      return;
    }
  }, [localEntries, allProducts]);

  // Fall back to Supabase if local data doesn't have it
  useEffect(() => {
    if (localEntries.length > 0) return; // Already found locally

    let unsub: any = null;
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductBySlug(slug || '');
        if (!mounted) return;

        if (data.length === 0) {
          setError(t.product_not_found);
          setLoading(false);
          return;
        }

        setEntries(data);

        const first = data[0];
        const rel = await getRelatedProducts(first.product_id, first.category_slug, 6);
        if (mounted) setRelated(rel);

        unsub = subscribeToProductUpdates(first.product_id, () => {
          getProductBySlug(slug || '').then(fresh => {
            if (mounted) setEntries(fresh);
          });
        });
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      if (unsub) unsub.unsubscribe();
    };
  }, [slug, localEntries.length, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e14]">
        <NavigationBar />
        <main className="pt-16 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#4a5568] text-sm" dir={isRTL ? 'rtl' : 'ltr'}>{t.loading}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || entries.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e14]">
        <NavigationBar />
        <main className="pt-16 flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">{t.product_not_found}</h1>
            <Link to="/" className="mt-4 text-[#00d4aa] hover:underline inline-block" dir={isRTL ? 'rtl' : 'ltr'}>
              {t.back_home}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const product = entries[0];
  const cheapest = entries.reduce((min, e) => e.current_price < min.current_price ? e : min, entries[0]);

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <SEO
        title={`${product.product_name} — Price Comparison Algeria`}
        description={`Compare prices for ${product.product_name} in Algeria. Best price ${cheapest.current_price.toLocaleString()} DA from ${cheapest.store_name}.`}
        image={product.product_image || 'https://dztechhunt-v3.vercel.app/images/og-cover.jpg'}
        url={`https://dztechhunt-v3.vercel.app/product/${slug}`}
        type="product"
        price={cheapest.current_price}
        brand={product.product_brand}
        availability={cheapest.stock_status || 'In stock'}
        rating={product.product_rating}
        reviewCount={product.product_review_count}
      />
      <NavigationBar />
      <main className="pt-16">
        <ProductHero entries={entries} product={product} />
        <DealsTable entries={entries} />
        <RelatedProducts products={related.length >= 3 ? related : []} />
      </main>
    </div>
  );
}
