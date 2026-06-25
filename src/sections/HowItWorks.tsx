import { motion } from 'framer-motion';
import { Search, BarChart3, ShoppingCart } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import SectionHeader from '@/components/SectionHeader';

export default function HowItWorks() {
  const { t, isRTL } = useTranslation();

  const steps = [
    {
      num: '01',
      icon: Search,
      title: t.hiw_step1_title,
      desc: t.hiw_step1_desc,
    },
    {
      num: '02',
      icon: BarChart3,
      title: t.hiw_step2_title,
      desc: t.hiw_step2_desc,
    },
    {
      num: '03',
      icon: ShoppingCart,
      title: t.hiw_step3_title,
      desc: t.hiw_step3_desc,
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#0a0e14] py-16 sm:py-20 page-padding">
      <SectionHeader
        eyebrow={t.hiw_eyebrow}
        title={t.hiw_title}
        description={t.hiw_desc}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative bg-[#111821] border border-[#1a2332] hover:border-[#00d4aa]/20 rounded-xl p-6 sm:p-8 transition-all duration-300"
          >
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[#1a2332] font-mono text-3xl sm:text-4xl font-bold select-none">
              {step.num}
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#00d4aa]/10 border border-[#00d4aa]/20 flex items-center justify-center mb-4 sm:mb-5">
              <step.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00d4aa]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">{step.title}</h3>
            <p className="text-[13px] sm:text-[14px] text-[#5a6a7e] leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
