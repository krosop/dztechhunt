import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useData } from '@/components/DataProvider';
import { fmtDZD } from '@/data/dzProducts';
import { TrendingDown, ArrowRight } from 'lucide-react';
import { DealSkeleton } from '@/components/LoadingSkeleton';
import { useTranslation } from '@/i18n/useTranslation';

export default function LiveDealsBanner() {
  const { t } = useTranslation();
  const { loaded, loading, liveDeals } = useData();

  if (loading || !loaded) {
    return (
      <section className="bg-[#070a10] border-y border-[#1a2332] py-5">
        <div className="page-padding flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <DealSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // Deduplicate by product_id so each unique product appears only once
  const uniqueDeals = liveDeals.filter((deal, index, self) =>
    index === self.findIndex((d) => d.product_id === deal.product_id)
  );

  // Duplicate once for seamless loop (not 4x)
  const allDeals = [...uniqueDeals, ...uniqueDeals];

  return (
    <section id="deals" className="bg-[#070a10] border-y border-[#1a2332] py-5 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4 }}
        className="page-padding"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-4 h-4 text-[#00d4aa]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{t.deals_title}</h3>
          </div>
          <Link
            to="/deals"
            className="text-sm font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <div className="relative group">
        <div className="flex gap-3 animate-[ticker-scroll_80s_linear_infinite] group-hover:[animation-play-state:paused] w-max px-6">
          {allDeals.map((deal, i) => (
            <Link
              key={`${deal.product_id}-${i}`}
              to={`/product/${deal.product_slug}`}
              className="flex-shrink-0 w-[260px] sm:w-[280px] bg-[#111821] border border-[#1a2332] hover:border-[#00d4aa]/30 rounded-lg p-3 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded"
                  style={{ color: deal.store_color, backgroundColor: `${deal.store_color}15` }}
                >
                  {deal.store_name}
                </span>
                {deal.savings > 0 && (
                  <span className="text-[11px] font-bold text-[#00d4aa]">
                    -{Math.round((deal.savings / deal.original_price) * 100)}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0d131c] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={deal.product_image || '/images/product-pc-case.jpg'}
                    alt=""
                    className="w-10 h-10 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] text-[#9ba3af] truncate leading-snug">
                    {deal.product_name}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-bold text-white">{fmtDZD(deal.current_price)}</span>
                    {deal.original_price > deal.current_price && (
                      <span className="text-[11px] text-[#4a5568] line-through">{fmtDZD(deal.original_price)}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
