'use client';

import { use, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2, Printer } from 'lucide-react';
import type { MenuLang, MenuRestaurant } from '@/lib/api';
import { photoUrl } from '@/lib/menu';
import { DEMO_MENUS } from '@/lib/menuDemo';

const SCAN: Record<MenuLang, [string, string]> = {
  en: ['Scan for the menu', 'Scan for the menu & to order'],
  fr: ['Scannez pour voir le menu', 'Scannez pour le menu et commander'],
  es: ['Escanea para ver la carta', 'Escanea para ver la carta y pedir'],
  pt: ['Leia para ver o menu', 'Leia para ver o menu e pedir'],
  it: ['Inquadra per il menù', 'Inquadra per il menù e ordinare'],
  de: ['Scannen für die Speisekarte', 'Scannen für Speisekarte & Bestellung'],
  ar: ['امسح لعرض القائمة', 'امسح لعرض القائمة والطلب'],
};
const TABLE: Record<MenuLang, string> = { en: 'Table', fr: 'Table', es: 'Mesa', pt: 'Mesa', it: 'Tavolo', de: 'Tisch', ar: 'طاولة' };

/** Printable QR codes: one card per table (?tables=12) or a single A4 poster. */
export default function MenuQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<MenuRestaurant | null>(null);
  const [codes, setCodes] = useState<{ label: string | null; src: string }[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const n = Math.max(0, Math.min(120, Number(new URLSearchParams(window.location.search).get('tables')) || 0));
    const base = `${window.location.origin}/m/${id}`;
    const targets = n ? Array.from({ length: n }, (_, i) => ({ label: String(i + 1), url: `${base}?t=${i + 1}` })) : [{ label: null, url: base }];
    Promise.all(targets.map((tg) => QRCode.toDataURL(tg.url, { width: 600, margin: 1, errorCorrectionLevel: 'M' }).then((src) => ({ label: tg.label, src }))))
      .then(setCodes, () => setMissing(true));
    (Object.hasOwn(DEMO_MENUS, id)
      ? Promise.resolve({ restaurant: DEMO_MENUS[id] })
      : fetch(`/api/menu/public/${encodeURIComponent(id)}`).then((r) => (r.ok ? r.json() : null)))
      .then((d) => (d?.restaurant ? setData(d.restaurant) : setMissing(true)))
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) return <main className="flex min-h-screen items-center justify-center bg-white p-6 text-slate-500">This menu is not available.</main>;
  if (!data || !codes.length) return <main className="flex min-h-screen items-center justify-center bg-white"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></main>;

  const langs = data.languages.slice(0, 4);
  const lines = langs.map((l) => SCAN[l][data.ordering ? 1 : 0]);
  const logo = data.logoPhotoId
    // eslint-disable-next-line @next/next/no-img-element -- our own resized photo
    ? (size: string) => <img src={photoUrl(data.logoPhotoId)!} alt="" className={`${size} rounded-2xl object-cover`} />
    : (size: string) => <span className={`${size} flex items-center justify-center rounded-2xl text-white`} style={{ background: data.color, fontFamily: 'var(--font-serif), Georgia, serif', fontSize: '1.6em' }}>{data.name.trim().charAt(0).toUpperCase()}</span>;
  const tableWord = TABLE[data.defaultLanguage] ?? 'Table';

  return (
    <main className="min-h-screen bg-slate-100 py-8 text-slate-900 print:bg-white print:py-0">
      <style>{'@page{size:A4;margin:10mm}@media print{html,body{background:#fff!important}}'}</style>
      <div className="mx-auto mb-5 flex max-w-[190mm] items-center justify-between gap-3 px-4 print:hidden">
        <p className="text-sm text-slate-500">{codes.length > 1 ? `${codes.length} table cards — cut along the lines.` : 'A4 poster for the window or the counter.'}</p>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {codes.length === 1 && !codes[0].label ? (
        <section className="mx-auto flex min-h-[277mm] w-full max-w-[190mm] flex-col items-center justify-center bg-white px-10 py-14 text-center shadow-sm print:shadow-none">
          {logo('h-20 w-20')}
          <p className="mt-5 text-4xl font-bold" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>{data.name}</p>
          <div className="mt-8 rounded-3xl border-[6px] p-5" style={{ borderColor: data.color }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data: URL */}
            <img src={codes[0].src} alt="QR code" className="h-[300px] w-[300px]" />
          </div>
          <div className="mt-8 space-y-1.5">{lines.map((l, i) => <p key={i} className={i === 0 ? 'text-2xl font-semibold' : 'text-lg text-slate-500'} dir={langs[i] === 'ar' ? 'rtl' : 'ltr'}>{l}</p>)}</div>
          {data.branding !== false && <p className="mt-auto pt-10 text-xs text-slate-400">MBN Menu · mbndev.ma</p>}
        </section>
      ) : (
        <section className="mx-auto grid w-full max-w-[190mm] grid-cols-2 gap-0 bg-white print:bg-white">
          {codes.map((c) => (
            <article key={c.label} className="flex h-[92mm] flex-col items-center justify-center border border-dashed border-slate-300 p-4 text-center [break-inside:avoid]">
              <div className="flex items-center gap-2">{logo('h-8 w-8 text-sm')}<p className="max-w-[60mm] truncate text-base font-semibold">{data.name}</p></div>
              {/* eslint-disable-next-line @next/next/no-img-element -- generated data: URL */}
              <img src={c.src} alt={`QR code table ${c.label}`} className="mt-2 h-[44mm] w-[44mm]" />
              <p className="mt-1 text-2xl font-black" style={{ color: data.color }}>{tableWord} {c.label}</p>
              <p className="text-[11px] leading-tight text-slate-500">{lines.slice(0, 3).join(' · ')}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
