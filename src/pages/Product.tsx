import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug, getRelatedProducts } from '@/supabase/api';
import type { PriceView } from '@/supabase/types';
import { subscribeToProductUpdates } from '@/supabase/api';
import { useTranslation } from '@/i18n/useTranslation';
import NavigationBar from '@/components/NavigationBar';
import ProductHero from '@/sections/ProductHero';
import DealsTable from '@/sections/DealsTable';
import RelatedProducts from '@/sections/RelatedProducts';

export default function Product() {
  const { t, isRTL } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [entries, setEntries] = useState<PriceView[]>([]);
  const [related, setRelated] = useState<PriceView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [slug, t]);

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

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <NavigationBar />
      <main className="pt-16">
        <ProductHero entries={entries} product={product} />
        <DealsTable entries={entries} />
        <RelatedProducts products={related.length >= 3 ? related : []} />
      </main>
    </div>
  );
}
