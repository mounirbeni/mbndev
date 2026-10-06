'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { ArrowLeft, Copy, Download, ExternalLink, Loader2, Mail, MessageCircle, Printer, Star, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useReviewBooster } from '@/components/review-booster/ReviewBoosterShell';
import GoogleReviewsTab from '@/components/review-booster/GoogleReviewsTab';
import { reviewBoosterAPI, type ReviewBusiness, type ReviewFeedback, type ReviewLanguage } from '@/lib/api';
import { REVIEW_LANGUAGES, requestMessage, requestSubject } from '@/lib/reviewBooster';

type Tab = 'share' | 'reviews' | 'feedback' | 'setup';
const TABS: [Tab, string][] = [['share', 'Share & ask'], ['reviews', 'Google reviews'], ['feedback', 'Private feedback'], ['setup', 'Setup']];
const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
const fieldCls = 'mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none';

const copy = async (text: string) => {
  try { await navigator.clipboard.writeText(text); toast.success('Copied'); } catch { toast.error('Copy failed'); }
};

export default function ReviewBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { refresh } = useReviewBooster();
  const [business, setBusiness] = useState<ReviewBusiness | null>(null);
  const [form, setForm] = useState<Partial<ReviewBusiness>>({});
  const [tab, setTab] = useState<Tab>('share');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<ReviewFeedback[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [qr, setQr] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [lang, setLang] = useState<ReviewLanguage>('en');

  const fill = (b: ReviewBusiness) => { setBusiness(b); setForm(b); };

  const loadTab = useCallback((t: Tab) => {
    if (t === 'feedback') reviewBoosterAPI.feedback(id).then(({ data }) => setFeedback(data.feedback), () => setFeedback([]));
  }, [id]);

  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}/r/${id}`, { width: 512, margin: 1 }).then(setQr, () => {});
    reviewBoosterAPI.business(id).then(({ data }) => {
      fill(data.business);
      setLang(data.business.language);
      const t = new URLSearchParams(window.location.search).get('tab') as Tab | null;
      if (t && TABS.some(([k]) => k === t)) { setTab(t); loadTab(t); }
    }, () => setMissing(true));
  }, [id, loadTab]);

  const switchTab = (t: Tab) => { setTab(t); loadTab(t); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await reviewBoosterAPI.updateBusiness(id, {
        name: form.name, googleReviewUrl: form.googleReviewUrl, color: form.color, language: form.language, active: form.active,
      });
      fill({ ...data.business, _count: business?._count });
      toast.success('Saved');
    } catch (err) {
      toast.error(errMsg(err, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!business || !window.confirm(`Delete ${business.name}? Its review page and QR code stop working and its private feedback is deleted.`)) return;
    try { await reviewBoosterAPI.deleteBusiness(id); await refresh(); router.push('/review-booster'); } catch { toast.error('Could not delete.'); }
  };

  const sent = () => {
    reviewBoosterAPI.markSent(id).then(() => setBusiness((b) => (b ? { ...b, requestsSent: b.requestsSent + 1 } : b)), () => {});
  };

  if (missing) return <p className="py-20 text-center text-slate-400">Business not found. <Link href="/review-booster" className="underline">Back</Link></p>;
  if (!business) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>;

  const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://mbndev.ma'}/r/${id}`;
  const message = requestMessage(lang, business.name, link, customer.name);
  const phone = customer.phone.replace(/[^\d]/g, '');
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const mailUrl = `mailto:${encodeURIComponent(customer.email.trim())}?subject=${encodeURIComponent(requestSubject[lang](business.name))}&body=${encodeURIComponent(message)}`;
  const conversion = business.views ? Math.round((business.googleClicks / business.views) * 100) : 0;

  return (
    <div>
      <Link href="/review-booster" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Businesses</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{business.name}</h1>
        {!business.active && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase text-slate-400">Paused</span>}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Requests sent', business.requestsSent],
          ['Review page visits', business.views],
          ['Sent to Google', business.googleClicks],
          ['Visit → Google', `${conversion}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-2xl font-bold text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-1.5" role="tablist">
        {TABS.map(([t, label]) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => switchTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-sm ${tab === t ? 'bg-white text-[#14092b]' : 'border border-white/10 text-slate-400 hover:text-white'}`}>{label}</button>
        ))}
      </div>

      {tab === 'share' && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
            <h2 className="font-semibold text-white">QR code</h2>
            <p className="mt-1 text-xs text-slate-400">Put it on the counter, tables, receipts or the menu.</p>
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element -- generated data: URL
              <img src={qr} alt={`QR code for ${business.name}`} width={220} height={220} className="mx-auto mt-4 rounded-xl bg-white p-2" />
            ) : <Loader2 className="mx-auto mt-10 h-5 w-5 animate-spin text-slate-500" />}
            <div className="mt-4 flex flex-col gap-2">
              <a href={`/r/${id}/poster`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#14092b]"><Printer className="h-4 w-4" />Print poster</a>
              {qr && <a href={qr} download={`${business.name.replace(/[^\w-]+/g, '-')}-review-qr.png`} className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-slate-200 hover:border-white/30"><Download className="h-4 w-4" />Download QR (PNG)</a>}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="font-semibold text-white">Your review link</h2>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <code className="flex-1 truncate rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-amber-200">{link}</code>
                <Button size="sm" variant="secondary" onClick={() => copy(link)}><Copy className="h-4 w-4" />Copy</Button>
                <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"><ExternalLink className="h-4 w-4" />Open</a>
              </div>
              <p className="mt-2 text-xs text-slate-500">Customers see one big “Leave a review on Google” button, plus an option to message you privately.</p>
            </section>

            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h2 className="font-semibold text-white">Ask a customer for a review</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <input className={fieldCls} placeholder="Customer name (optional)" aria-label="Customer name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} maxLength={60} />
                <input className={fieldCls} placeholder="WhatsApp number, e.g. +212…" aria-label="Customer WhatsApp number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} maxLength={25} />
                <input className={fieldCls} placeholder="Email (optional)" aria-label="Customer email" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} maxLength={160} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {REVIEW_LANGUAGES.map((l) => (
                  <button key={l.id} type="button" onClick={() => setLang(l.id)} aria-pressed={lang === l.id}
                    className={`rounded-full px-3 py-1 text-xs ${lang === l.id ? 'bg-amber-400/20 text-amber-200' : 'border border-white/10 text-slate-400 hover:text-white'}`}>{l.label}</button>
                ))}
              </div>
              <p dir={lang === 'ar' ? 'rtl' : 'ltr'} className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-3.5 text-sm text-slate-200">{message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={sent} className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"><MessageCircle className="h-4 w-4" />Send on WhatsApp</a>
                <a href={mailUrl} onClick={sent} className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30"><Mail className="h-4 w-4" />Send by email</a>
                <Button size="sm" variant="secondary" onClick={() => { copy(message); sent(); }}><Copy className="h-4 w-4" />Copy message</Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">Without a number, WhatsApp opens and lets you pick the contact. Best time to ask: right after the visit.</p>
            </section>
          </div>
        </div>
      )}

      {tab === 'reviews' && <GoogleReviewsTab business={business} onChange={(b) => fill({ ...b, _count: business._count })} />}

      {tab === 'feedback' && (
        <section className="mt-5 space-y-3">
          {feedback === null ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" /> : feedback.length === 0 ? (
            <p className="text-slate-400">No private feedback yet. When a customer writes to you from the review page, it shows up here and you get a notification.</p>
          ) : feedback.map((f) => (
            <article key={f.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {f.rating && <span className="flex items-center gap-0.5 text-amber-300">{Array.from({ length: f.rating }, (_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</span>}
                <span className="font-medium text-slate-300">{f.name || 'Anonymous'}</span>
                {f.contact && <span className="text-sky-300">{f.contact}</span>}
                <span className="ml-auto">{new Date(f.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{f.message}</p>
            </article>
          ))}
        </section>
      )}

      {tab === 'setup' && (
        <form onSubmit={save} className="mt-5 grid max-w-3xl gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2">
          <label className="block"><span className="text-sm font-medium text-white">Business name</span>
            <input className={fieldCls} value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} required />
          </label>
          <label className="block"><span className="text-sm font-medium text-white">Customer language</span>
            <select className={`${fieldCls} bg-[#0b0a14]`} value={form.language ?? 'en'} onChange={(e) => setForm({ ...form, language: e.target.value as ReviewLanguage })}>
              {REVIEW_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium text-white">Google review link or Place ID</span>
            <input className={fieldCls} value={form.googleReviewUrl ?? ''} onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })} required />
          </label>
          <div className="flex items-end gap-3">
            <label className="block"><span className="text-sm font-medium text-white">Brand colour</span>
              <input type="color" value={form.color ?? '#7c3aed'} onChange={(e) => setForm({ ...form, color: e.target.value })} className="mt-1.5 block h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent" aria-label="Brand colour" />
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Review page live
            </label>
          </div>
          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={remove}><Trash2 className="h-4 w-4" />Delete</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      )}
    </div>
  );
}
