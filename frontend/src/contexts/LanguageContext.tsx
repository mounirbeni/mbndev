'use client';

import React, { createContext, useContext } from 'react';
import { t as translate } from '@/lib/i18n/translations';

interface LanguageContextValue {
  t: (key: string, fallback?: string) => string;
}

const tFn = (key: string, fallback?: string) => translate('en', key, fallback);

// One constant value: consumers never re-render because of the provider, and
// `t` is a stable reference that is safe in hook dependency arrays.
const VALUE: LanguageContextValue = { t: tFn };

const LanguageContext = createContext<LanguageContextValue>(VALUE);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageContext.Provider value={VALUE}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
