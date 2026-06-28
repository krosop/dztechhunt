import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingDown, Store, RotateCcw, ChevronDown } from 'lucide-react';
import { useData } from '@/components/DataProvider';
import { useTranslation } from '@/i18n/useTranslation';
import NavigationBar from '@/components/NavigationBar';
import ProductCard from '@/components/ProductCard';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import SEO from '@/components/SEO';

const PAGE_SIZE = 20;

type DealSort = 'savings-desc' | 'savings-asc' | 'price-asc' | 'price-desc';

export default function DealsPage() {
  const { t, isRTL } = useTranslation();
  const { loaded, loading, liveDeals } = useData();
  const [sortBy, setSortBy] = useState<DealSort>('savings-desc');
  const [activeStore, setActiveStore] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Deduplicate by product_id — show best deal per product
  const uniqueDeals = useMemo(() => {
    const byProduct = new Map<string, typeof liveDeals[number]>();
    for (const d of liveDeals) {
      const existing = byProduct.get(d.product_id);
      if (!existing || d.savings > existing.savings) {
        byProduct.set(d.product_id, d);
      }
    }
    return Array.from(byProduct.values());
  }, [liveDeals]);

  // Available stores from liveDeals
  const stores = useMemo(() => {
    const s = new Map<string, string>();
    s.set('all', t.search_all);
    uniqueDeals.forEach((d) => {
      if (!s.has(d.store_name)) {
        s.set(d.store_name, d.store_name);
      }
    });
    return Array.from(s.entries());
  }, [uniqueDeals, t]);

  // Filtered + sorted deals
  const filtered = useMemo(() => {
    let results = [...uniqueDeals];

    if (activeStore !== 'all') {
      results = results.filter((d) => d.store_name === activeStore);
    }

    switch (sortBy) {
      case 'savings-desc':
        results.sort((a, b) => b.savings - a.savings);
        break;
      case 'savings-asc':
        results.sort((a, b) => a.savings - b.savings);
        break;
      case 'price-asc':
        results.sort((a, b) => a.current_price - b.current_price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.current_price - a.current_price);
        break;
    }

    return results;
  }, [uniqueDeals, activeStore, sortBy]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const totalSavings = useMemo(() => {
    return uniqueDeals.reduce((sum, d) => sum + d.savings, 0);
  }, [uniqueDeals]);

  const sortLabels: Record<DealSort, string> = {
    'savings-desc': t.search_sort_savings,
    'savings-asc': t.search_sort_relevance,
    'price-asc': t.search_sort_price_asc,
    'price-desc': t.search_sort_price_desc,
  };

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <SEO
        title={`${t.page_deals_title} — PC Deals Algeria`}
        description={t.page_deals_desc}
        keywords="PC deals Algeria, graphics card sale, CPU discount, SSD promo, RAM deal Algeria"
        url="https://dztechhunt-v3.vercel.app/#/deals"
      />
      <NavigationBar />

      <main className="pt-16">
        {/* Header */}
        <section className="bg-[#070a10] border-b border-[#1a2332] py-8 sm:py-10">
          <div className="page-padding">
            {/* Breadcrumb */}
            <div className={`flex items-center gap-1.5 text-[11px] text-[#4a5568] mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link to="/" className="hover:text-[#00d4aa] transition-colors">{t.breadcrumb_home}</Link>
              <span>/</span>
              <span className="text-[#7a8a9e]">{t.page_breadcrumb_deals}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#00d4aa]">
                    {t.deals_title}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.page_deals_title}</h1>
                <p className="mt-2 text-[13px] sm:text-[15px] text-[#5a6a7e] max-w-[600px]">
                  {t.page_deals_desc}
                </p>
              </motion.div>

              {/* Stats pills */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-3"
              >
                <div className="bg-[#111821] border border-[#1a2332] rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-bold text-[#00d4aa]">{uniqueDeals.length}</p>
                  <p className="text-[10px] text-[#4a5568] uppercase tracking-wider font-medium">Deals</p>
                </div>
                <div className="bg-[#111821] border border-[#1a2332] rounded-xl px-4 py-3 text-center">
                  <p className="text-xl font-bold text-[#00d4aa]">
                    {(totalSavings / 1000).toFixed(0)}K
                  </p>
                  <p className="text-[10px] text-[#4a5568] uppercase tracking-wider font-medium">DA Saved</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="page-padding py-6 sm:py-8">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto pb-2 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-none">
              <Store className="w-4 h-4 text-[#4a5568] shrink-0 hidden sm:block" />
              {stores.map(([slug, name]) => (
                <button
                  key={slug}
                  onClick={() => { setActiveStore(slug); setPage(1); }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-medium whitespace-nowrap transition-all shrink-0 ${
                    activeStore === slug
                      ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/30'
                      : 'bg-[#131b26] text-[#7a8a9e] border border-[#1a2332] hover:border-[#2a3545]'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as DealSort); setPage(1); }}
              className="bg-[#131b26] border border-[#1a2332] text-[#c8d0d9] text-[12px] font-medium rounded-lg px-3 py-2 outline-none focus:border-[#00d4aa]/50 cursor-pointer shrink-0"
            >
              {(Object.keys(sortLabels) as DealSort[]).map((k) => (
                <option key={k} value={k}>{sortLabels[k]}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <span className="text-xs sm:text-[13px] text-[#5a6a7e]">
              {loading || !loaded ? (
                t.loading
              ) : (
                <>
                  <span className="text-white font-semibold">{filtered.length.toLocaleString()}</span> {t.search_products_found}
                  {hasMore && (
                    <span className="text-[#4a5568] ml-1">({t.search_showing} {paginated.length})</span>
                  )}
                </>
              )}
            </span>

            {activeStore !== 'all' && (
              <button
                onClick={() => { setActiveStore('all'); setPage(1); }}
                className="inline-flex items-center gap-1 text-[11px] text-[#4a5568] hover:text-[#00d4aa] transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> {t.search_clear}
              </button>
            )}
          </div>

          {/* Results grid */}
          {loading || !loaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <TrendingDown className="w-12 h-12 text-[#1a2332] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{t.search_no_results}</h3>
              <p className="text-[13px] text-[#5a6a7e]">{t.search_try_different}</p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
              >
                {paginated.map((deal, i) => (
                  <ProductCard
                    key={deal.product_id}
                    product={deal}
                    index={i}
                    animate={false}
                  />
                ))}
              </motion.div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#131b26] border border-[#1a2332] text-[#c8d0d9] text-sm font-medium rounded-xl hover:border-[#00d4aa]/30 hover:text-[#00d4aa] transition-all"
                  >
                    <ChevronDown className="w-4 h-4" />
                    {t.search_load_more} ({filtered.length - paginated.length} {t.search_remaining})
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
