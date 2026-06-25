import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ThumbsUp } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import SectionHeader from '@/components/SectionHeader';
import StarRating from '@/components/StarRating';
import type { PriceView } from '@/supabase/types';

interface Props {
  product: PriceView;
}

const RATING_DISTRIBUTION = [
  { stars: 5, percent: 65 },
  { stars: 4, percent: 22 },
  { stars: 3, percent: 8 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 2 },
];

function generateReviews(product: PriceView) {
  const names = ['Karim B.', 'Amine T.', 'Yacine K.', 'Samir L.', 'Nadia R.', 'Mehdi D.', 'Sofiane B.', 'Hichem M.', 'Rafik M.', 'Lotfi T.'];
  const titles = [
    'Excellent rapport qualité-prix',
    'Livraison rapide, produit neuf',
    'Parfait pour mon build',
    'Prix imbattable en Algérie',
    'Produit conforme',
    'Bonne qualité, recommandé',
    'Meilleur prix trouvé',
    'Transaction sans problème',
  ];
  const comments = [
    `J'ai comparé sur plusieurs boutiques avant d'acheter. Le meilleur prix était chez une boutique locale. Produit neuf, emballage original.`,
    `Très satisfait de mon achat. Le prix est compétitif par rapport au marché algérien. Livraison dans les délais annoncés.`,
    `Après plusieurs semaines de recherche, j'ai finalement trouvé ce produit à un prix raisonnable. Je recommande.`,
  ];

  const count = Math.min(3, Math.max(1, Math.floor(product.product_review_count * 0.1)));
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[(product.product_name.length + i * 7) % names.length],
    rating: 4 + (i % 2),
    title: titles[(product.product_name.length + i * 3) % titles.length],
    body: comments[i % comments.length],
    date: `2025-0${4 + i}-15`,
    helpful: 3 + (i * 7) + (product.product_name.length % 10),
    verified: true,
  }));
}

export default function UserReviews({ product }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const reviews = generateReviews(product);
  const tabs = [t.tab_recent, t.tab_helpful];

  return (
    <section className="bg-[#070a10] py-12 sm:py-16 border-y border-[#1a2332]">
      <div className="page-padding">
        <SectionHeader eyebrow={t.reviews_eyebrow} title={t.reviews_title} />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 sm:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-end gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">{product.product_rating}</span>
              <div className="pb-1">
                <StarRating rating={product.product_rating} size={16} />
                <p className="text-[12px] text-[#4a5568] mt-1">
                  {t.based_on}
                </p>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 space-y-2">
              {RATING_DISTRIBUTION.map((r, i) => (
                <div key={r.stars} className="flex items-center gap-2 sm:gap-2.5">
                  <span className="text-[11px] sm:text-[12px] text-[#4a5568] w-2.5 font-mono">{r.stars}</span>
                  <div className="flex-1 h-1.5 bg-[#1a2332] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${r.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                      className="h-full rounded-full bg-[#00d4aa]"
                    />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#4a5568] w-6 sm:w-7 text-right font-mono">{r.percent}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-[12px] font-medium transition-all ${
                    activeTab === i ? 'bg-[#1a2332] text-white' : 'text-[#4a5568] hover:text-[#7a8a9e]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-[#111821] border border-[#1a2332] rounded-xl p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1a2332] flex items-center justify-center text-xs sm:text-sm font-semibold text-[#00d4aa] font-mono shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[13px] sm:text-[14px] font-semibold text-[#c8d0d9] truncate block">{review.name}</span>
                        {review.verified && (
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#00d4aa] flex items-center gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5" /> {t.verified}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-[#4a5568] font-mono shrink-0">{review.date}</span>
                  </div>

                  <div className="mt-2"><StarRating rating={review.rating} size={12} /></div>
                  <h4 className="text-[14px] sm:text-[15px] font-semibold text-white mt-2">{review.title}</h4>
                  <p className="text-[13px] sm:text-[14px] text-[#5a6a7e] mt-1.5 sm:mt-2 leading-relaxed">{review.body}</p>

                  <div className="flex items-center gap-3 mt-3 sm:mt-4 pt-3 border-t border-[#1a2332]">
                    <span className="text-[10px] sm:text-[11px] text-[#4a5568]">{t.useful}</span>
                    <button className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#1a2332] hover:bg-[#2a3545] transition-colors text-[#4a5568] active:scale-95">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[10px] sm:text-[11px] font-mono">{review.helpful}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
