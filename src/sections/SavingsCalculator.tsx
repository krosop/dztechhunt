import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import SectionHeader from '@/components/SectionHeader';

const PRESETS = [25, 75, 150, 300];

const CATEGORY_RATES: Record<string, number> = {
  'Graphics Cards': 0.15, Processors: 0.12, Memory: 0.18,
  Storage: 0.20, Motherboards: 0.10, Cooling: 0.15,
  Cases: 0.18, 'Power Supplies': 0.14, Monitors: 0.16,
};

export default function SavingsCalculator() {
  const [itemsPerMonth, setItemsPerMonth] = useState(4);
  const [avgPrice, setAvgPrice] = useState(250);
  const [selectedCats, setSelectedCats] = useState<string[]>(['Graphics Cards', 'Processors']);
  const [displayValue, setDisplayValue] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(resultRef, { once: true });

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const blendedRate = useMemo(() => {
    if (selectedCats.length === 0) return 0.15;
    const sum = selectedCats.reduce((acc, cat) => acc + (CATEGORY_RATES[cat] || 0.15), 0);
    return sum / selectedCats.length;
  }, [selectedCats]);

  const annualSavings = useMemo(() => {
    return Math.round(itemsPerMonth * 12 * avgPrice * blendedRate);
  }, [itemsPerMonth, avgPrice, blendedRate]);

  const annualBudget = itemsPerMonth * 12 * avgPrice;

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, annualSavings, {
      duration: 0.8, ease: 'easeOut',
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [annualSavings, isInView]);

  return (
    <section id="calculator" className="bg-[#070a10] py-20 border-y border-[#1a2332]">
      <div className="page-padding">
        <SectionHeader
          eyebrow="Savings Calculator"
          title="How Much Could You Save?"
          description="Tell us your PC building habits and we will estimate your annual savings."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#111821] border border-[#1a2332] rounded-xl overflow-hidden flex flex-col md:flex-row"
        >
          <div className="flex-1 p-8 md:p-10">
            <div>
              <label className="text-[15px] font-semibold text-[#c8d0d9]">
                PC parts bought per month
              </label>
              <div className="flex items-center gap-4 mt-3">
                <input
                  type="range" min={1} max={20} value={itemsPerMonth}
                  onChange={(e) => setItemsPerMonth(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-[#1a2332] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00d4aa] [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-xl font-bold text-[#00d4aa] w-10 text-right font-mono">
                  {itemsPerMonth}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <label className="text-[15px] font-semibold text-[#c8d0d9]">
                Average spend per part
              </label>
              <div className="flex flex-wrap gap-2 mt-3">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAvgPrice(p)}
                    className={`px-5 py-2.5 rounded-lg text-[14px] font-medium border transition-all duration-200 ${
                      avgPrice === p
                        ? 'border-[#00d4aa] text-[#00d4aa] bg-[#00d4aa]/10'
                        : 'border-[#1a2332] text-[#5a6a7e] hover:border-[#2a3545]'
                    }`}
                  >
                    ${p}
                  </button>
                ))}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568] text-sm font-mono">$</span>
                  <input
                    type="number" value={avgPrice}
                    onChange={(e) => setAvgPrice(Number(e.target.value) || 0)}
                    className="pl-7 pr-3 py-2.5 rounded-lg border border-[#1a2332] bg-[#0d131c] text-[14px] text-white w-28 focus:border-[#00d4aa]/50 focus:ring-1 focus:ring-[#00d4aa]/20 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <label className="text-[15px] font-semibold text-[#c8d0d9]">
                Parts you shop for
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                {Object.keys(CATEGORY_RATES).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13px] transition-all duration-200 ${
                      selectedCats.includes(cat)
                        ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-[#00d4aa]'
                        : 'border-[#1a2332] text-[#5a6a7e] hover:border-[#2a3545]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      selectedCats.includes(cat) ? 'bg-[#00d4aa] border-[#00d4aa]' : 'border-[#2a3545]'
                    }`}>
                      {selectedCats.includes(cat) && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="#0a0e14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div ref={resultRef} className="bg-[#0a0e14] border-t md:border-t-0 md:border-l border-[#1a2332] p-8 md:p-10 md:w-[360px] flex flex-col justify-center">
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#4a5568]">Estimated Annual Savings</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-[#00d4aa] font-mono">
                ${displayValue.toLocaleString()}
              </span>
              <span className="text-[14px] text-[#4a5568]">/yr</span>
            </div>

            <div className="mt-8 space-y-3 border-t border-[#1a2332] pt-6">
              {[
                { label: 'Monthly purchases', value: `${itemsPerMonth} parts` },
                { label: 'Avg. savings per part', value: `$${Math.round(avgPrice * blendedRate)}` },
                { label: 'Annual budget', value: `$${annualBudget.toLocaleString()}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[13px]">
                  <span className="text-[#4a5568]">{row.label}</span>
                  <span className="text-[#7a8a9e] font-mono">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
