'use client';

import type { ReactNode } from 'react';
import type { Localized, MenuLang } from '@/lib/api';

export const fieldCls = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none';
export const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-slate-400';

export const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export const newId = () => Math.random().toString(36).slice(2, 10);

/** One language of a translated field; the default language shows as a hint while it's empty. */
export function LocalizedField({ label, value, lang, fallback, onChange, multiline, maxLength, required }: {
  label: string; value: Localized; lang: MenuLang; fallback: MenuLang; onChange: (v: Localized) => void;
  multiline?: boolean; maxLength: number; required?: boolean;
}) {
  const hint = lang !== fallback ? value[fallback] : undefined;
  const set = (text: string) => {
    const next = { ...value };
    if (text) next[lang] = text; else delete next[lang];
    onChange(next);
  };
  return (
    <label className="block">
      <span className={labelCls}>{label} <span className="font-mono text-[10px] text-violet-300">{lang.toUpperCase()}</span></span>
      {multiline
        ? <textarea value={value[lang] ?? ''} onChange={(e) => set(e.target.value)} maxLength={maxLength} rows={3} placeholder={hint ?? ''} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${fieldCls} mt-1.5 resize-y`} />
        : <input value={value[lang] ?? ''} onChange={(e) => set(e.target.value)} maxLength={maxLength} placeholder={hint ?? ''} required={required && lang === fallback} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${fieldCls} mt-1.5`} />}
      {hint && !value[lang] && <span className="mt-1 block text-[11px] text-amber-300/80">Not translated yet — guests see the {fallback.toUpperCase()} text.</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-sm text-slate-200">
      <span>{children}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 shrink-0 accent-violet-500" />
    </label>
  );
}
