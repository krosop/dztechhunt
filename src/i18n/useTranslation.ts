import { useLanguage } from './LanguageContext';
import { translations } from './translations';

export function useTranslation() {
  const { lang, isRTL } = useLanguage();
  const t = translations[lang];

  return { t, lang, isRTL };
}
