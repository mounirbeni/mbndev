'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Locale } from '@/lib/i18n/translations';

const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'ar', label: 'العربية', flag: '🇲🇦' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative" data-testid="language-switcher">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Switch language"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-150"
        style={{
          color:      'rgba(148,163,184,0.8)',
          background: open ? 'rgba(255,255,255,0.07)' : 'transparent',
          border:     '1px solid rgba(255,255,255,0.08)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = open ? '#fff' : 'rgba(148,163,184,0.8)'; }}
      >
        <span>{current.flag}</span>
        <span>{current.value.toUpperCase()}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-36 rounded-xl overflow-hidden shadow-2xl z-50"
          style={{ background: 'rgba(18,17,30,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {LOCALES.map((l) => (
            <button
              key={l.value}
              onClick={() => { setLocale(l.value); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors duration-100 text-left"
              style={{
                color:      l.value === locale ? '#fff' : 'rgba(148,163,184,0.8)',
                background: l.value === locale ? 'rgba(124,58,237,0.25)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (l.value !== locale) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = l.value === locale ? 'rgba(124,58,237,0.25)' : 'transparent'; }}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {l.value === locale && (
                <svg className="ml-auto" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
