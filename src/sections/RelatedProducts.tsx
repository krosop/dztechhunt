import { useTranslation } from '@/i18n/useTranslation';
import SectionHeader from '@/components/SectionHeader';
import ProductCard from '@/components/ProductCard';
import HorizontalCarousel from '@/components/HorizontalCarousel';
import type { PriceView } from '@/supabase/types';

interface Props {
  products: PriceView[];
}

export default function RelatedProducts({ products }: Props) {
  const { t } = useTranslation();
  if (products.length === 0) return null;

  return (
    <section className="bg-[#0a0e14] py-16 pb-20">
      <div className="page-padding">
        <SectionHeader eyebrow={t.related_eyebrow} title={t.related_title} />

        <HorizontalCarousel cardWidth={260} gap={12}>
          {products.map((product, i) => (
            <div key={`${product.product_id}-${i}`} className="snap-start w-[260px] sm:w-[280px] shrink-0">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </HorizontalCarousel>
      </div>
    </section>
  );
}
