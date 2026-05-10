'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Locale, LOCALES, t as translate } from '@/lib/i18n/translations';

const STORAGE_KEY = 'mbndev_locale';

interface LanguageContextValue {
  locale:    Locale;
  dir:       'ltr' | 'rtl';
  setLocale: (l: Locale) => void;
  t:         (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale:    'en',
  dir:       'ltr',
  setLocale: () => {},
  t:         (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.find((l) => l.code === stored)) {
      setLocaleState(stored);
    } else {
      // Detect from browser
      const browserLang = navigator.language.slice(0, 2) as Locale;
      if (LOCALES.find((l) => l.code === browserLang)) {
        setLocaleState(browserLang);
      }
    }
  }, []);

  // Apply dir attribute to <html> element
  useEffect(() => {
    const meta = LOCALES.find((l) => l.code === locale);
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', meta?.dir ?? 'ltr');
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const tFn = useCallback(
    (key: string, fallback?: string) => translate(locale, key, fallback),
    [locale]
  );

  const dir = LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr';

  return (
    <LanguageContext.Provider value={{ locale, dir, setLocale, t: tFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
