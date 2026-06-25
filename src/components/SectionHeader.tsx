import { motion } from 'framer-motion';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  rightAction?: React.ReactNode;
}

export default function SectionHeader({ eyebrow, title, description, rightAction }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={`mb-8 sm:mb-12 ${rightAction ? 'flex flex-col md:flex-row md:items-end md:justify-between gap-3 sm:gap-4' : ''}`}
    >
      <div>
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] text-[#00d4aa]">
          {eyebrow}
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1.5 sm:mt-2 tracking-tight text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-2 sm:mt-3 text-[13px] sm:text-[15px] leading-relaxed max-w-[600px] text-[#5a6a7e]">
            {description}
          </p>
        )}
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </motion.div>
  );
}
