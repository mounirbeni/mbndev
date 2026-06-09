'use client';

import React, { createContext, useContext } from 'react';
import { t as translate } from '@/lib/i18n/translations';

interface LanguageContextValue {
  t: (key: string, fallback?: string) => string;
}

const tFn = (key: string, fallback?: string) => translate('en', key, fallback);

const LanguageContext = createContext<LanguageContextValue>({ t: tFn });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageContext.Provider value={{ t: tFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
