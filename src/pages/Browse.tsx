import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, PackageOpen, SlidersHorizontal, X } from 'lucide-react';
import { useData } from '@/components/DataProvider';
import { useTranslation } from '@/i18n/useTranslation';
import NavigationBar from '@/components/NavigationBar';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';

// Category display config with icons, labels, and sample images from data
const CATEGORY_CONFIG: Record<string, { label: string; labelFr: string; emoji: string; color: string; }> = {
  laptop: { label: 'Laptops', labelFr: 'PC Portables', emoji: '💻', color: '#00d4aa' },
  'graphics-cards': { label: 'Graphics Cards', labelFr: 'Cartes Graphiques', emoji: '🎮', color: '#3b82f6' },
  processors: { label: 'Processors', labelFr: 'Processeurs', emoji: '🔲', color: '#6366f1' },
  memory: { label: 'Memory', labelFr: 'Mémoire', emoji: '💾', color: '#8b5cf6' },
  storage: { label: 'Storage', labelFr: 'Stockage', emoji: '💿', color: '#06b6d4' },
  monitors: { label: 'Monitors', labelFr: 'Moniteurs', emoji: '🖥️', color: '#f59e0b' },
  'power-supplies': { label: 'Power Supplies', labelFr: 'Alimentations', emoji: '⚡', color: '#ef4444' },
  cooling: { label: 'Cooling', labelFr: 'Refroidissement', emoji: '❄️', color: '#0ea5e9' },
  keyboard: { label: 'Keyboards', labelFr: 'Claviers', emoji: '⌨️', color: '#10b981' },
  mouse: { label: 'Mice', labelFr: 'Souris', emoji: '🖱️', color: '#ec4899' },
  headset: { label: 'Headsets', labelFr: 'Casques', emoji: '🎧', color: '#f97316' },
  cases: { label: 'Cases', labelFr: 'Boîtiers', emoji: '🔲', color: '#64748b' },
  desktop: { label: 'Desktops', labelFr: 'PC Fixes', emoji: '🖥️', color: '#14b8a6' },
  'pc-parts': { label: 'PC Parts', labelFr: 'Pièces PC', emoji: '🔧', color: '#6b7280' },
};

export default function BrowsePage() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { allProducts, loaded, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'savings'>('relevance');
  const [showSort, setShowSort] = useState(false);

  // Build category map with images from data
  const categories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number; image: string | null }>();
    for (const p of allProducts) {
      const slug = p.category_slug;
      if (!map.has(slug)) {
        map.set(slug, { slug, name: p.category_name_fr, count: 0, image: null });
      }
      const entry = map.get(slug)!;
      entry.count++;
      if (!entry.image && p.product_image) {
        entry.image = p.product_image;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allProducts]);

  // Filter products by category + search
  const filteredProducts = useMemo(() => {
    let pool = activeCategory
      ? allProducts.filter(p => p.category_slug === activeCategory)
      : allProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(p => p.product_name.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case 'price-asc': pool = [...pool].sort((a, b) => a.current_price - b.current_price); break;
      case 'price-desc': pool = [...pool].sort((a, b) => b.current_price - a.current_price); break;
      case 'savings': pool = [...pool].sort((a, b) => b.savings - a.savings); break;
      default: break;
    }

    // Deduplicate by product_id
    const seen = new Set<string>();
    const deduped: typeof pool = [];
    for (const p of pool) {
      if (!seen.has(p.product_id)) {
        seen.add(p.product_id);
        deduped.push(p);
      }
    }
    return deduped;
  }, [allProducts, activeCategory, searchQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sortLabels: Record<string, string> = {
    relevance: 'Relevance',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    savings: 'Best Deals',
  };

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <SEO
        title="Browse PC Parts — DZ TechHunt"
        description="Browse all PC component categories: graphics cards, CPUs, RAM, SSDs, monitors, laptops, and more from Algerian stores."
        url="https://dztechhunt-v3.vercel.app/browse"
      />
      <NavigationBar />

      <main className="pt-16">
        {/* Header */}
        <section className="bg-[#070a10] border-b border-[#1a2332] py-8 sm:py-10">
          <div className="page-padding">
            <div className={`flex items-center gap-1.5 text-[11px] text-[#4a5568] mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link to="/" className="hover:text-[#00d4aa] transition-colors">{t.breadcrumb_home}</Link>
              <span>/</span>
              <span className="text-[#7a8a9e]">Browse</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#00d4aa]">
                Categories
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">Browse All PC Parts</h1>
              <p className="mt-2 text-[13px] sm:text-[15px] text-[#5a6a7e] max-w-[600px]">
                Explore every category — from GPUs and CPUs to laptops and monitors. Compare prices across Algerian stores.
              </p>
            </motion.div>

            {/* Search bar */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSearch}
              className="mt-6 max-w-[640px]"
            >
              <div className="flex items-center bg-[#131b26] border border-[#1a2332] rounded-xl focus-within:border-[#00d4aa]/50 focus-within:ring-2 focus-within:ring-[#00d4aa]/10 transition-all">
                <Search className="w-5 h-5 text-[#4a5568] mx-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search within results..."
                  className="flex-1 h-12 px-3 text-[15px] text-white placeholder:text-[#4a5568] bg-transparent outline-none"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="p-2 text-[#4a5568] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button type="submit" className="h-9 mx-2 px-4 bg-[#00d4aa] hover:bg-[#00b894] text-[#0a0e14] text-sm font-bold rounded-lg transition-colors">
                  Search
                </button>
              </div>
            </motion.form>
          </div>
        </section>

        {/* Category Circles */}
        <section className="page-padding py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#00d4aa] mb-5">
              Categories
            </h2>
            <div className="flex flex-wrap gap-4 sm:gap-5">
              {/* All categories */}
              <button
                onClick={() => setActiveCategory(null)}
                className={`group flex flex-col items-center gap-2 transition-all ${!activeCategory ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 transition-all ${
                  !activeCategory
                    ? 'bg-[#00d4aa]/20 border-[#00d4aa] shadow-lg shadow-[#00d4aa]/20'
                    : 'bg-[#111821] border-[#1a2332] hover:border-[#00d4aa]/40'
                }`}>
                  📦
                </div>
                <span className={`text-[11px] sm:text-xs font-medium ${!activeCategory ? 'text-[#00d4aa]' : 'text-[#5a6a7e]'}`}>
                  All
                </span>
                <span className="text-[10px] text-[#4a5568]">{allProducts.length.toLocaleString()}</span>
              </button>

              {categories.map((cat) => {
                const config = CATEGORY_CONFIG[cat.slug] || { label: cat.slug, labelFr: cat.slug, emoji: '🔧', color: '#6b7280' };
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setActiveCategory(isActive ? null : cat.slug)}
                    className={`group flex flex-col items-center gap-2 transition-all ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all ${
                      isActive
                        ? 'border-[#00d4aa] shadow-lg shadow-[#00d4aa]/20'
                        : 'border-[#1a2332] hover:border-[#00d4aa]/40'
                    }`}>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={config.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="w-full h-full flex items-center justify-center text-xl bg-[#111821]">${config.emoji}</span>`; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-[#111821]">
                          {config.emoji}
                        </div>
                      )}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-medium ${isActive ? 'text-[#00d4aa]' : 'text-[#5a6a7e]'}`}>
                      {config.labelFr}
                    </span>
                    <span className="text-[10px] text-[#4a5568]">{cat.count.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Results */}
        <section className="page-padding py-8 sm:py-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xs text-[#5a6a7e]">
                {loading || !loaded ? (
                  'Loading...'
                ) : (
                  <>
                    <span className="text-[#00d4aa] font-semibold">{filteredProducts.length}</span>{' '}
                    products
                    {activeCategory && (
                      <span className="text-[#4a5568]"> in {CATEGORY_CONFIG[activeCategory]?.labelFr || activeCategory}</span>
                    )}
                  </>
                )}
              </span>
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#111821] border border-[#1a2332] rounded-lg text-[12px] text-[#5a6a7e] hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {sortLabels[sortBy]}
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 mt-1 w-40 bg-[#111821] border border-[#1a2332] rounded-lg shadow-xl z-20 overflow-hidden"
                  >
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key as any); setShowSort(false); }}
                        className={`w-full px-3 py-2 text-left text-[12px] transition-colors ${
                          sortBy === key ? 'text-[#00d4aa] bg-[#00d4aa]/10' : 'text-[#5a6a7e] hover:text-white hover:bg-[#1a2332]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Products grid */}
          {loading || !loaded ? (
            <div className="text-center py-12 text-[#5a6a7e]">Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <PackageOpen className="w-12 h-12 text-[#1a2332] mx-auto mb-3" />
              <p className="text-[#5a6a7e] text-sm">No products found</p>
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="mt-3 text-[#00d4aa] text-sm hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {filteredProducts.slice(0, 40).map((product, i) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          {filteredProducts.length > 40 && (
            <div className="text-center mt-8">
              <Link
                to={activeCategory ? `/search?cat=${activeCategory}` : '/search'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#111821] border border-[#1a2332] hover:border-[#00d4aa]/30 text-[#00d4aa] text-sm font-semibold rounded-xl transition-all"
              >
                View All {filteredProducts.length} Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
