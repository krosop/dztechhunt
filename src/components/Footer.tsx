import { Link } from 'react-router-dom';

export default function Footer() {
  const columns = [
    { title: 'Shop', links: ["Today's Deals", 'Trending GPUs', 'Price Drops', 'New Arrivals', 'Bundle Deals'] },
    { title: 'Categories', links: ['Graphics Cards', 'Processors', 'Memory', 'Storage', 'Motherboards', 'Cooling', 'Cases', 'PSUs', 'Monitors'] },
    { title: 'Stores', links: ['Amazon', 'Newegg', 'Best Buy', 'Walmart', 'B&H Photo', 'Micro Center'] },
    { title: 'Resources', links: ['Build Guides', 'Compatibility Check', 'Benchmarks', 'Price History', 'News'] },
  ];

  return (
    <footer className="bg-[#070a10] border-t border-[#1a2332]">
      <div className="page-padding pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          <div className="lg:col-span-1">
            <Link to="/" className="text-xl font-extrabold text-white">
              Price<span className="text-[#00d4aa]">Zap</span>
            </Link>
            <p className="mt-4 text-sm text-[#5a6a7e] leading-relaxed">
              Compare prices across Amazon, Newegg, Best Buy, Walmart, and 40+ more retailers. Build your dream PC for less.
            </p>
            <div className="flex gap-3 mt-5">
              {['X', 'IG', 'DC'].map((s) => (
                <span
                  key={s}
                  className="w-9 h-9 rounded-lg bg-[#131b26] border border-[#1a2332] flex items-center justify-center text-xs font-bold text-[#5a6a7e] hover:text-[#00d4aa] hover:border-[#00d4aa]/30 transition-all duration-150 cursor-pointer"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-[#7a8a9e] uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-[#5a6a7e] hover:text-[#00d4aa] transition-colors duration-150 cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="page-padding">
        <div className="border-t border-[#1a2332]" />
      </div>

      <div className="page-padding py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[#4a5568]">2025 PriceZap. All rights reserved.</p>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Cookie Policy', 'Contact'].map((item) => (
            <span key={item} className="text-sm text-[#4a5568] hover:text-[#7a8a9e] transition-colors duration-150 cursor-pointer">
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
