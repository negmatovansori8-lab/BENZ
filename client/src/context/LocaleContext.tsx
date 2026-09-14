import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dict, LOCALES, type Locale, type Msg } from '../i18n/dict';

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: Msg) => string;
}

const LocaleContext = createContext<LocaleState | null>(null);

function readSavedLocale(): Locale {
  try {
    const saved = localStorage.getItem('ah_locale');
    if (saved === 'tg' || saved === 'ru' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return 'tg';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readSavedLocale);

  useEffect(() => {
    localStorage.setItem('ah_locale', locale);
    document.documentElement.lang = locale === 'tg' ? 'tg' : locale;
  }, [locale]);

  const value = useMemo<LocaleState>(
    () => ({
      locale,
      setLocale: (l) => setLocaleState(l),
      t: (key) => dict[locale][key] || dict.tg[key],
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useI18n');
  return ctx;
}

export { LOCALES };
export type { Locale, Msg };
