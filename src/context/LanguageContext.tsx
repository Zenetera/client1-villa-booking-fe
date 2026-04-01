import { createContext, useContext, useState, type ReactNode } from 'react';
import { en, el, type Translations, type Lang } from '../i18n/translations';

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const translationsMap: Record<Lang, Translations> = { en, el };

function getInitialLang(): Lang {
  const stored = localStorage.getItem('villa_lang');
  return stored === 'en' || stored === 'el' ? stored : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  const toggleLang = () => {
    setLang((prev) => {
      const next: Lang = prev === 'en' ? 'el' : 'en';
      localStorage.setItem('villa_lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: translationsMap[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
