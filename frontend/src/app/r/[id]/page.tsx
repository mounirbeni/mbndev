'use client';

import { use, useEffect, useState } from 'react';
import { Star, MessageSquareText, Loader2, CheckCircle2 } from 'lucide-react';
import { REVIEW_COPY } from '@/lib/reviewBooster';
import type { ReviewLanguage } from '@/lib/api';

interface PageData { name: string; color: string; language: ReviewLanguage; googleReviewUrl: string; branding: boolean }

const post = (id: string, path: string, body: unknown) =>
  fetch(`/api/review-booster/public/${encodeURIComponent(id)}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  });

/**
 * Public review page a business shares with its customers (link / QR code).
 * The Google review button is always shown to everyone — private feedback is
 * an extra option, never a filter in front of Google.
 */
export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PageData | null>(null);
  const [missing, setMissing] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [form, setForm] = useState({ rating: 0, message: '', name: '', contact: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/review-booster/public/${encodeURIComponent(id)}`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.business) { setMissing(true); return; }
        setData(d.business);
        try {
          const key = `mbn_rb_view_${id}`;
          if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); post(id, 'event', { type: 'view' }).catch(() => {}); }
        } catch { /* storage blocked — skip the view count */ }
      })
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center text-slate-500">This page is not available.</main>;
  if (!data) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></main>;

  const t = REVIEW_COPY[data.language] ?? REVIEW_COPY.en;
  const color = data.color;

  const sendPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await post(id, 'feedback', { ...form, rating: form.rating || undefined });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Could not send.');
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400';

  return (
    <main dir={data.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white p-7 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ background: color }}>
            {data.name.trim().charAt(0).toUpperCase()}
          </span>
          <h1 className="mt-5 text-2xl font-bold leading-snug">{t.title(data.name)}</h1>
          <p className="mt-2 text-slate-500">{t.subtitle}</p>
          <div className="mt-5 flex justify-center gap-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-7 w-7 fill-amber-400 text-amber-400" />)}
          </div>
          <a
            href={data.googleReviewUrl}
            onClick={() => { post(id, 'event', { type: 'google' }).catch(() => {}); }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: color }}
          >
            <GoogleG /> {t.google}
          </a>
        </div>

        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
          {sent ? (
            <p className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-5 w-5" />{t.thanks}</p>
          ) : !showPrivate ? (
            <button onClick={() => setShowPrivate(true)} className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800">
              <MessageSquareText className="h-4 w-4" />{t.privateLink}
            </button>
          ) : (
            <form onSubmit={sendPrivate} className="space-y-3">
              <p className="font-semibold">{t.privateTitle}</p>
              <div>
                <p className="text-xs text-slate-500">{t.rating}</p>
                <div className="mt-1 flex gap-1" role="radiogroup" aria-label={t.rating}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n}`} onClick={() => setForm({ ...form, rating: form.rating === n ? 0 : n })}>
                      <Star className={`h-6 w-6 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea className={inputCls} rows={3} required maxLength={2000} placeholder={t.message} aria-label={t.message} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <input className={inputCls} maxLength={100} placeholder={t.name} aria-label={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={inputCls} maxLength={160} placeholder={t.contact} aria-label={t.contact} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <button type="submit" disabled={sending || !form.message.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
                {sending && <Loader2 className="h-4 w-4 animate-spin" />}{t.send}
              </button>
            </form>
          )}
        </div>

        {data.branding && (
          <a href="https://mbndev.ma/products/review-booster" target="_blank" rel="noopener noreferrer" className="mt-6 block text-center text-xs text-slate-400 hover:text-slate-600">
            Powered by MBN Review Booster
          </a>
        )}
      </div>
    </main>
  );
}

function GoogleG() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold" style={{ color: '#4285F4' }} aria-hidden="true">G</span>
  );
}
