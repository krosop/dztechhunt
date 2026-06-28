import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useData } from '@/components/DataProvider';
import { useTranslation } from '@/i18n/useTranslation';
import SectionHeader from '@/components/SectionHeader';
import ProductCard from '@/components/ProductCard';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import { CardSkeleton } from '@/components/LoadingSkeleton';

export default function TrendingProducts() {
  const { t, isRTL } = useTranslation();
  const { loaded, loading, trending } = useData();

  if (loading || !loaded) {
    return (
      <section className="bg-[#070a10] py-20 border-y border-[#1a2332]">
        <div className="page-padding">
          <div className="h-8 bg-[#1a2332] rounded w-48 mb-12 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Deduplicate by product_id so each unique product appears only once
  const uniqueTrending = trending.filter((item, index, self) =>
    index === self.findIndex((t) => t.product_id === item.product_id)
  );

  return (
    <section id="trending" className="bg-[#070a10] py-20 border-y border-[#1a2332]">
      <div className="page-padding">
        <SectionHeader
          eyebrow={t.trending_eyebrow}
          title={t.trending_title}
          description={t.trending_desc}
          rightAction={
            <Link
              to="/trending"
              className="text-sm font-medium text-[#00d4aa] hover:text-[#00d4aa]/80 flex items-center gap-1 cursor-pointer transition-colors"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {t.trending_view_all} <ArrowIcon className="w-4 h-4" />
            </Link>
          }
        />
      </div>

      <div className="page-padding">
        <HorizontalCarousel cardWidth={260} gap={12}>
          {uniqueTrending.map((product, i) => (
            <div key={`${product.product_id}-${i}`} className="snap-start w-[260px] sm:w-[280px] shrink-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
}
