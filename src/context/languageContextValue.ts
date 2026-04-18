import { createContext } from 'react';
import type { Translations, Lang } from '../i18n/translations';

export interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
