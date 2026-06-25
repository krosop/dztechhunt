import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowUpDown } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import SectionHeader from '@/components/SectionHeader';
import type { PriceView } from '@/supabase/types';
import { fmtDZD } from '@/data/dzProducts';

interface Props {
  entries: PriceView[];
}

type SortKey = 'store' | 'price' | 'savings';
type SortDir = 'asc' | 'desc';

export default function DealsTable({ entries }: Props) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    const arr = [...entries];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'price': cmp = a.current_price - b.current_price; break;
        case 'savings': cmp = b.savings - a.savings; break;
        case 'store': cmp = a.store_name.localeCompare(b.store_name); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [entries, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <section className="bg-[#0a0e14] py-12 sm:py-16">
      <div className="page-padding">
        <SectionHeader
          eyebrow={t.dt_eyebrow}
          title={t.dt_title}
          description={t.dt_desc}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-[#111821] border border-[#1a2332] rounded-xl overflow-hidden"
        >
          {/* Desktop header */}
          <div className="hidden sm:flex bg-[#0d131c] px-6 py-3 border-b border-[#1a2332]">
            {[
              { key: 'store' as SortKey, label: t.dt_store, width: '35%' },
              { key: 'price' as SortKey, label: t.dt_price, width: '25%' },
              { key: 'savings' as SortKey, label: t.dt_savings, width: '20%' },
            ].map((col) => (
              <button
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#4a5568] hover:text-[#7a8a9e] transition-colors text-left"
                style={{ width: col.width }}
              >
                {col.label}
                <ArrowUpDown className="w-3 h-3" />
              </button>
            ))}
            <div className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#4a5568] text-right">
              {t.dt_link}
            </div>
          </div>

          {/* Mobile header */}
          <div className="flex sm:hidden bg-[#0d131c] px-4 py-3 border-b border-[#1a2332] gap-2">
            {[
              { key: 'store' as SortKey, label: t.dt_store_mobile },
              { key: 'price' as SortKey, label: t.dt_price_mobile },
              { key: 'savings' as SortKey, label: t.dt_savings_mobile },
            ].map((col) => (
              <button
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-[#4a5568] hover:text-[#7a8a9e] transition-colors py-1.5 rounded-md bg-[#111821]"
              >
                {col.label}
                <ArrowUpDown className="w-3 h-3" />
              </button>
            ))}
          </div>

          {/* Rows */}
          {sorted.map((entry, i) => (
            <motion.div
              key={`${entry.store_id}-${i}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`px-4 sm:px-6 py-3 sm:py-3.5 border-b border-[#1a2332]/50 hover:bg-[#00d4aa]/[0.02] transition-colors ${
                i % 2 === 1 ? 'bg-[#0d131c]' : 'bg-[#111821]'
              }`}
            >
              {/* Desktop row */}
              <div className="hidden sm:flex items-center">
                <div className="flex items-center gap-2" style={{ width: '35%' }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.store_color }} />
                  <span className="text-[14px] font-semibold text-[#c8d0d9] truncate">{entry.store_name}</span>
                </div>
                <div style={{ width: '25%' }}>
                  <span className="text-[15px] font-bold text-white">{fmtDZD(entry.current_price)}</span>
                  {entry.original_price > entry.current_price && (
                    <span className="text-[12px] text-[#4a5568] line-through ml-2">{fmtDZD(entry.original_price)}</span>
                  )}
                </div>
                <div style={{ width: '20%' }}>
                  {entry.savings > 0 ? (
                    <span className="text-[13px] font-bold text-[#00d4aa]">{fmtDZD(entry.savings)}</span>
                  ) : (
                    <span className="text-[13px] text-[#4a5568]">—</span>
                  )}
                </div>
                <div className="flex-1 text-right">
                  {entry.product_url ? (
                    <a href={entry.product_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-[#00d4aa] border border-[#00d4aa]/30 px-3 py-1.5 rounded-lg hover:bg-[#00d4aa]/10 transition-colors">
                      {t.dt_boutique} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-[12px] text-[#4a5568]">—</span>}
                </div>
              </div>

              {/* Mobile row */}
              <div className="flex sm:hidden items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.store_color }} />
                  <div>
                    <span className="text-[13px] font-semibold text-[#c8d0d9] block truncate max-w-[120px]">{entry.store_name}</span>
                    <span className="text-[12px] font-bold text-white">{fmtDZD(entry.current_price)}</span>
                    {entry.savings > 0 && (
                      <span className="text-[10px] text-[#00d4aa] ml-1.5">-{Math.round((entry.savings / entry.original_price) * 100)}%</span>
                    )}
                  </div>
                </div>
                {entry.product_url ? (
                  <a href={entry.product_url} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#00d4aa] border border-[#00d4aa]/30 px-2.5 py-1.5 rounded-lg hover:bg-[#00d4aa]/10 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-[12px] text-[#4a5568] mt-4">
          {sorted.length} {t.prices_found}
        </p>
      </div>
    </section>
  );
}
