'use client';

import { use, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Star, Printer, Loader2 } from 'lucide-react';
import { REVIEW_COPY } from '@/lib/reviewBooster';
import type { ReviewLanguage } from '@/lib/api';

interface PageData { name: string; color: string; language: ReviewLanguage; branding: boolean }

/** Printable counter / table poster with the review page's QR code. */
export default function ReviewPoster({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PageData | null>(null);
  const [qr, setQr] = useState('');
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const link = `${window.location.origin}/r/${id}`;
    QRCode.toDataURL(link, { width: 640, margin: 1, errorCorrectionLevel: 'M' }).then(setQr, () => setMissing(true));
    fetch(`/api/review-booster/public/${encodeURIComponent(id)}`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => (d?.business ? setData(d.business) : setMissing(true)))
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) return <main className="flex min-h-screen items-center justify-center bg-white p-6 text-slate-500">This poster is not available.</main>;
  if (!data || !qr) return <main className="flex min-h-screen items-center justify-center bg-white"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></main>;

  const t = REVIEW_COPY[data.language] ?? REVIEW_COPY.en;

  return (
    <main dir={data.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-100 py-8 text-slate-900 print:bg-white print:py-0">
      <style>{'@page{size:A4;margin:0}@media print{html,body{background:#fff!important}}'}</style>
      <div className="mx-auto mb-5 flex max-w-[210mm] justify-end px-4 print:hidden">
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>
      <section className="mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col items-center justify-center bg-white px-12 py-16 text-center shadow-sm print:shadow-none">
        <p className="text-sm font-semibold uppercase tracking-[0.25em]" style={{ color: data.color }}>{data.name}</p>
        <h1 className="mt-6 text-5xl font-black leading-tight">{t.posterTitle}</h1>
        <p className="mt-4 max-w-md text-xl text-slate-600">{t.posterSub}</p>
        <div className="mt-8 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-10 w-10 fill-amber-400 text-amber-400" />)}
        </div>
        <div className="mt-10 rounded-3xl border-[6px] p-5" style={{ borderColor: data.color }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated data: URL */}
          <img src={qr} alt="QR code" width={300} height={300} className="h-[300px] w-[300px]" />
        </div>
        <p className="mt-6 text-lg font-medium text-slate-500">{t.scan}</p>
        {data.branding && <p className="mt-auto pt-12 text-xs text-slate-400">MBN Review Booster · mbndev.ma</p>}
      </section>
    </main>
  );
}
