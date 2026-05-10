'use client';

/**
 * HtmlLangSync
 * Applies the active locale's `lang` and `dir` attributes to <html> on every
 * locale change.  Rendered inside <LanguageProvider> so it always has access
 * to the current locale.  Returns null — no DOM output.
 */
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function HtmlLangSync() {
  const { locale, dir } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir  = dir;
  }, [locale, dir]);

  return null;
}
