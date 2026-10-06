'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Store, Loader2, Eye, MousePointerClick, Send, MessageSquareText, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useReviewBooster } from '@/components/review-booster/ReviewBoosterShell';
import { reviewBoosterAPI, type ReviewBusiness, type ReviewLanguage } from '@/lib/api';
import { REVIEW_LANGUAGES } from '@/lib/reviewBooster';

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const inputCls = 'rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none';

export default function ReviewBusinessesPage() {
  const router = useRouter();
  const { account, refresh } = useReviewBooster();
  const [businesses, setBusinesses] = useState<ReviewBusiness[] | null>(null);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [language, setLanguage] = useState<ReviewLanguage>('en');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => reviewBoosterAPI.businesses().then(
    ({ data }) => setBusinesses(data.businesses),
    () => { toast.error('Could not load your businesses.'); setBusinesses([]); },
  ), []);
  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await reviewBoosterAPI.createBusiness({ name: name.trim(), googleReviewUrl: link.trim(), language });
      toast.success('Business added');
      refresh();
      router.push(`/review-booster/businesses/${data.business.id}?tab=share`);
    } catch (err) {
      toast.error(errMsg(err, 'Could not add the business.'));
      setCreating(false);
    }
  };

  const full = account.businesses.used >= account.businesses.limit;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Your businesses</h1>
      <p className="mt-1 text-slate-400">Each business gets a review page, a QR poster and ready-to-send review requests.</p>

      {!full && (
        <form onSubmit={create} className="mt-6 grid gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-[1fr_1.5fr_auto_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" aria-label="Business name" maxLength={80} required className={inputCls} />
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Google review link or Place ID" aria-label="Google review link or Place ID" required className={inputCls} />
          <select value={language} onChange={(e) => setLanguage(e.target.value as ReviewLanguage)} aria-label="Customer language" className={`${inputCls} bg-[#0b0a14]`}>
            {REVIEW_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <Button type="submit" loading={creating}>Add business</Button>
          <details className="text-xs text-slate-400 sm:col-span-4">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 hover:text-slate-200"><HelpCircle className="h-3.5 w-3.5" />Where do I find the Google review link?</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Open your <a className="text-amber-300 underline" href="https://business.google.com" target="_blank" rel="noopener noreferrer">Google Business Profile</a> and choose <b>Ask for reviews</b> (or <b>Get more reviews</b>) — copy the link it shows.</li>
              <li>Or find the business&apos;s Place ID with <a className="text-amber-300 underline" href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer">Google&apos;s Place ID finder</a> and paste it (starts with ChIJ…).</li>
            </ol>
          </details>
        </form>
      )}
      <p className="mt-2 text-xs text-slate-500">{account.businesses.used} of {account.businesses.limit} business{account.businesses.limit === 1 ? '' : 'es'} used on your {account.plan} plan.</p>

      {businesses === null ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
      ) : businesses.length > 0 && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {businesses.map((b) => (
            <li key={b.id}>
              <Link href={`/review-booster/businesses/${b.id}`} className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/15">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: b.color }}><Store className="h-5 w-5" /></span>
                  <p className="min-w-0 flex-1 truncate font-semibold text-white">{b.name}</p>
                  {!b.active && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-slate-400">Paused</span>}
                </div>
                <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Send className="h-3.5 w-3.5" />{b.requestsSent} sent</span>
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{b.views} visits</span>
                  <span className="flex items-center gap-1"><MousePointerClick className="h-3.5 w-3.5" />{b.googleClicks} to Google</span>
                  <span className="flex items-center gap-1"><MessageSquareText className="h-3.5 w-3.5" />{b._count?.feedback ?? 0} private</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
