import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Lang } from './translations';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  isRTL: false,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('pricezap-lang');
    if (saved === 'en' || saved === 'fr' || saved === 'ar') return saved;
    return 'en';
  });

  const isRTL = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    localStorage.setItem('pricezap-lang', lang);
  }, [lang, isRTL]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}
