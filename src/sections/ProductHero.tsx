import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, ExternalLink, Bell, Zap } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import type { PriceView } from '@/supabase/types';
import { fmtDZD } from '@/data/dzProducts';
import StarRating from '@/components/StarRating';

interface Props {
  entries: PriceView[];
  product: PriceView;
}

export default function ProductHero({ entries, product }: Props) {
  const { t, isRTL } = useTranslation();
  const [activeImage, setActiveImage] = useState(0);
  const images = [
    product.product_image || '/images/product-pc-case.jpg',
    product.product_image || '/images/product-pc-case.jpg',
  ];

  const uniqueStores = new Set(entries.map(e => e.store_name)).size;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section className="bg-[#0a0e14] border-t border-[#1a2332]">
      <div className="page-padding py-6 sm:py-10 pb-8 sm:pb-12">
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-center gap-1.5 text-[11px] sm:text-[12px] text-[#4a5568] mb-4 sm:mb-6 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Link to="/" className="hover:text-[#00d4aa] transition-colors">{t.breadcrumb_home}</Link>
          <ChevronIcon className="w-3 h-3 shrink-0" />
          <span className="hover:text-[#00d4aa] transition-colors cursor-pointer truncate max-w-[100px]">
            {product.category_name_fr}
          </span>
          <ChevronIcon className="w-3 h-3 shrink-0 hidden sm:block" />
          <span className="text-[#5a6a7e] truncate max-w-[150px] hidden sm:inline">{product.product_name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 sm:gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="aspect-square bg-[#111821] border border-[#1a2332] rounded-xl overflow-hidden flex items-center justify-center max-w-[400px] mx-auto lg:max-w-none">
              <img src={images[activeImage]} alt={product.product_name} className="w-[80%] h-[80%] object-contain" />
            </div>
            <div className="flex gap-2 mt-3 justify-center lg:justify-start">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-[#111821] border flex items-center justify-center overflow-hidden transition-all ${
                    activeImage === i ? 'border-[#00d4aa]' : 'border-[#1a2332] hover:border-[#2a3545]'
                  }`}
                >
                  <img src={img} alt="" className="w-[65%] h-[65%] object-contain" />
                </button>
              ))}
            </div>
          </motion.div>

          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#5a6a7e] bg-[#1a2332] px-2.5 py-1 rounded-md">
                {product.product_brand}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#00d4aa] bg-[#00d4aa]/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Zap className="w-3 h-3" /> {uniqueStores} {t.prices_found}
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-3 leading-tight">
              {product.product_name}
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-3">
              <StarRating rating={product.product_rating} size={16} showValue reviewCount={product.product_review_count} />
            </motion.div>

            {product.product_description && (
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] text-[#5a6a7e] leading-relaxed">
                {product.product_description}
              </motion.p>
            )}

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-6 sm:mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] sm:text-[15px] font-semibold text-[#c8d0d9] uppercase tracking-wider">{t.price_comparison}</h3>
                <span className="text-[11px] text-[#4a5568]">Supabase</span>
              </div>

              <div className="space-y-2">
                {entries.map((entry, i) => {
                  const isBest = i === 0;
                  return (
                    <motion.div
                      key={`${entry.store_id}-${i}`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className={`p-3 sm:p-3.5 rounded-lg transition-all ${
                        isBest
                          ? 'bg-[#00d4aa]/5 border border-[#00d4aa]/30'
                          : 'bg-[#111821] border border-[#1a2332]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          {isBest && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-[#0a0e14] bg-[#00d4aa] px-1.5 py-0.5 rounded shrink-0">
                              {t.best_deal}
                            </span>
                          )}
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.store_color }} />
                          <span className="text-[13px] sm:text-[14px] font-semibold text-[#c8d0d9] truncate">{entry.store_name}</span>
                        </div>
                        {entry.product_url && (
                          <a
                            href={entry.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 ml-2 flex items-center gap-1 text-[11px] sm:text-[12px] font-medium text-[#00d4aa] border border-[#00d4aa]/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-[#00d4aa]/10 transition-colors"
                          >
                            <span className="hidden sm:inline">{t.view_store}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 mt-2 pl-0 sm:pl-0">
                        <span className="text-sm sm:text-base font-bold text-white">{fmtDZD(entry.current_price)}</span>
                        {entry.original_price > entry.current_price && (
                          <span className="text-[11px] sm:text-[12px] text-[#4a5568] line-through">{fmtDZD(entry.original_price)}</span>
                        )}
                        {entry.savings > 0 && (
                          <span className="text-[10px] sm:text-[11px] font-bold text-[#00d4aa]">-{fmtDZD(entry.savings)}</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button className="mt-4 w-full h-11 bg-[#00d4aa] hover:bg-[#00b894] text-[#0a0e14] font-bold rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98] touch-manipulation">
                <Bell className="w-4 h-4" />
                <span className="text-[14px]">{t.price_alert}</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
