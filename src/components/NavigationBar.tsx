import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/translations';

export default function NavigationBar() {
  const { t, lang } = useTranslation();
  const { setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { label: t.nav_deals, to: '/deals', badge: 'Live' as const },
    { label: t.nav_trending, to: '/trending' },
    { label: t.nav_how, to: '/how-it-works' },
  ];

  const languages: { code: Lang; label: string }[] = [
    { code: 'en', label: t.lang_en },
    { code: 'fr', label: t.lang_fr },
    { code: 'ar', label: t.lang_ar },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 flex items-center transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0e14]/95 backdrop-blur-xl border-b border-[#1a2332]'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full page-padding flex items-center justify-between">
          <Link to="/" className="flex items-center gap-0 shrink-0">
            <span className="text-lg sm:text-[22px] font-extrabold text-white tracking-tight">
              DZ<span className="text-[#00d4aa]">TechHunt</span>
            </span>
            <span className="ml-1.5 text-[9px] sm:text-[10px] font-semibold text-[#4a5568] uppercase tracking-wider">DZ</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative text-sm font-medium text-[#7a8a9e] hover:text-white transition-colors duration-150 group flex items-center gap-2"
              >
                {'badge' in link && link.badge && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4aa] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4aa]"></span>
                  </span>
                )}
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00d4aa] transition-all duration-150 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-lg bg-[#131b26] border border-[#1a2332] flex items-center gap-1.5 hover:border-[#00d4aa]/50 text-[#7a8a9e] hover:text-[#00d4aa] transition-all duration-200 text-xs sm:text-sm font-semibold"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : 'AR'}</span>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 z-50 bg-[#111821] border border-[#1a2332] rounded-lg shadow-2xl overflow-hidden min-w-[100px]"
                    >
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { setLang(l.code); setLangOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#1a2332] ${
                            lang === l.code ? 'text-[#00d4aa]' : 'text-[#7a8a9e]'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/search"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#131b26] border border-[#1a2332] flex items-center justify-center hover:border-[#00d4aa]/50 hover:text-[#00d4aa] text-[#7a8a9e] transition-all duration-200 active:scale-95"
            >
              <Search className="w-4 h-4" />
            </Link>
            <button
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#7a8a9e] rounded-lg bg-[#131b26] border border-[#1a2332] active:scale-95 transition-transform"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            <div className="absolute inset-0 bg-[#0a0e14]/90 backdrop-blur-lg" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-[#111821] border-l border-[#1a2332] shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#1a2332]">
                <span className="text-lg font-bold text-white">{t.nav_menu}</span>
                <button onClick={() => setMobileOpen(false)} className="w-9 h-9 flex items-center justify-center text-[#7a8a9e] active:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-[15px] font-medium text-[#7a8a9e] hover:text-white hover:bg-[#1a2332] px-4 py-3.5 rounded-lg transition-all active:bg-[#1a2332]"
                  >
                    {'badge' in link && link.badge && (
                      <span className="relative flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4aa]"></span>
                      </span>
                    )}
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Language Switcher */}
              <div className="px-4 py-3 border-t border-[#1a2332]">
                <p className="text-[11px] text-[#4a5568] mb-2 uppercase tracking-wider">Language / Langue / اللغة</p>
                <div className="flex gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        lang === l.code
                          ? 'bg-[#00d4aa]/10 border-[#00d4aa]/30 text-[#00d4aa]'
                          : 'bg-[#131b26] border-[#1a2332] text-[#7a8a9e] hover:text-white'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1a2332]">
                <p className="text-[11px] text-[#4a5568] text-center">{t.nav_footer}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
