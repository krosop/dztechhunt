import { motion } from 'framer-motion';
import { useData } from '@/components/DataProvider';
import SectionHeader from '@/components/SectionHeader';
import { CategorySkeleton } from '@/components/LoadingSkeleton';

export default function PopularCategories() {
  const { loaded, loading, categories, productCount } = useData();

  if (loading || !loaded) {
    return (
      <section className="bg-[#0a0e14] py-20 page-padding">
        <div className="h-8 bg-[#1a2332] rounded w-48 mb-12 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="bg-[#0a0e14] py-20 page-padding">
      <SectionHeader
        eyebrow="تصفح"
        title="لقى كومبونانتك"
        description={`${productCount.toLocaleString('fr-DZ')} منتج حقيقي مجمع من ${categories.length} بوتيك جزائرية.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <motion.a
            key={cat.category_slug}
            href={`#${cat.category_slug}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="group relative flex items-center gap-4 bg-[#111821] border border-[#1a2332] hover:border-[#00d4aa]/30 rounded-xl p-4 transition-all duration-300 cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[#c8d0d9] group-hover:text-white transition-colors">
                {cat.category_name_fr}
              </h3>
              <p className="text-[12px] text-[#4a5568] mt-0.5">
                {cat.product_count.toLocaleString('fr-DZ')} منتج
              </p>
            </div>
            <div className="text-[#00d4aa] opacity-0 group-hover:opacity-100 transition-opacity text-lg font-light">
              &rarr;
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
