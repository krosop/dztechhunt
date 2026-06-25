import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fmtDZD } from '@/data/dzProducts';
import { useTranslation } from '@/i18n/useTranslation';
import type { PriceView } from '@/supabase/types';
import StarRating from './StarRating';

interface ProductCardProps {
  product: PriceView;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useTranslation();
  const savingsPercent = product.original_price > 0
    ? Math.round((product.savings / product.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Link
        to={`/product/${product.product_slug}`}
        className="group block bg-[#111821] border border-[#1a2332] rounded-xl p-4 hover:border-[#00d4aa]/30 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="h-44 bg-[#0d131c] rounded-lg overflow-hidden flex items-center justify-center mb-4">
          <img
            src={product.product_image || '/images/product-pc-case.jpg'}
            alt={product.product_name}
            className="w-[80%] h-[80%] object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>

        <span
          className="inline-block text-[11px] font-semibold uppercase tracking-[0.06em] px-2.5 py-1 rounded-md mb-2"
          style={{ color: product.store_color, backgroundColor: `${product.store_color}15` }}
        >
          {product.product_brand}
        </span>

        <h3 className="text-[15px] font-semibold text-[#c8d0d9] group-hover:text-white truncate mb-2 leading-tight transition-colors">
          {product.product_name}
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-[#00d4aa]">
            {fmtDZD(product.current_price)}
          </span>
          {product.original_price > product.current_price && (
            <span className="text-[12px] text-[#4a5568] line-through">
              {fmtDZD(product.original_price)}
            </span>
          )}
        </div>

        {savingsPercent > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-0.5 rounded">
              {t.save} {savingsPercent}%
            </span>
            <span className="text-[11px] text-[#4a5568]">{t.at_store} {product.store_name}</span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-[#1a2332]">
          <StarRating rating={product.product_rating} size={12} reviewCount={product.product_review_count} />
        </div>
      </Link>
    </motion.div>
  );
}
