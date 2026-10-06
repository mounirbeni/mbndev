'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Copy, ExternalLink, KeyRound, Loader2, RefreshCw, Search, Sparkles, Star, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useReviewBooster } from '@/components/review-booster/ReviewBoosterShell';
import { reviewBoosterAPI, type GoogleReview, type PlaceResult, type ReviewBusiness, type ReviewSnapshot } from '@/lib/api';

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
const DAY = 24 * 60 * 60 * 1000;

/** Reviews gained and rating change since `days` ago, from the daily snapshots. */
function change(snapshots: ReviewSnapshot[], business: ReviewBusiness, days: number) {
  // Latest snapshot from before the window, else the oldest one (tracking started inside it).
  const since = Date.now() - days * DAY;
  const base = [...snapshots].reverse().find((s) => Date.parse(s.createdAt) <= since) ?? snapshots[0];
  if (!base || business.ratingCount == null || Date.parse(base.createdAt) > Date.now() - DAY) return null;
  const rating = business.rating != null && base.rating != null ? Math.round((business.rating - base.rating) * 10) / 10 : null;
  return { reviews: business.ratingCount - base.ratingCount, rating };
}

function Stars({ n, size = 'h-4 w-4' }: { n: number; size?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`${size} ${i <= n ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />)}
    </span>
  );
}

export default function GoogleReviewsTab({ business, onChange }: { business: ReviewBusiness; onChange: (b: ReviewBusiness) => void }) {
  const { account } = useReviewBooster();
  const [reviews, setReviews] = useState<GoogleReview[] | null>(null);
  const [snapshots, setSnapshots] = useState<ReviewSnapshot[]>([]);
  const [checking, setChecking] = useState(false);
  const [query, setQuery] = useState(business.name);
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = useCallback(() => reviewBoosterAPI.reviews(business.id).then(({ data }) => {
    setReviews(data.reviews);
    setSnapshots(data.snapshots);
    setDrafts(Object.fromEntries(data.reviews.filter((r: GoogleReview) => r.replyDraft).map((r: GoogleReview) => [r.id, r.replyDraft as string])));
  }, () => setReviews([])), [business.id]);

  useEffect(() => { if (business.placeId) load(); }, [business.placeId, load]);

  const check = async () => {
    setChecking(true);
    try {
      const { data } = await reviewBoosterAPI.checkNow(business.id);
      onChange(data.business);
      toast.success(data.newCount ? `${data.newCount} new review${data.newCount === 1 ? '' : 's'}` : 'Up to date');
      await load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not check Google.'));
    } finally {
      setChecking(false);
    }
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const { data } = await reviewBoosterAPI.placeSearch(business.id, query.trim());
      setResults(data.results);
    } catch (err) {
      toast.error(errMsg(err, 'Search failed.'));
    } finally {
      setSearching(false);
    }
  };

  const connect = async (placeId: string) => {
    try {
      const { data } = await reviewBoosterAPI.updateBusiness(business.id, { placeId });
      onChange(data.business);
      setResults(null);
      toast.success('Connected — checking Google…');
      setChecking(true);
      const r = await reviewBoosterAPI.checkNow(business.id);
      onChange(r.data.business);
      await load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not connect.'));
    } finally {
      setChecking(false);
    }
  };

  const draft = async (r: GoogleReview) => {
    setDrafting(r.id);
    try {
      const { data } = await reviewBoosterAPI.replyDraft(business.id, r.id);
      setDrafts((d) => ({ ...d, [r.id]: data.review.replyDraft }));
    } catch (err) {
      toast.error(errMsg(err, 'Could not draft a reply.'));
    } finally {
      setDrafting(null);
    }
  };

  const keyBanner = (text: string) => (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
      <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{text} <Link href="/review-booster/settings" className="font-semibold underline">Open Settings</Link></p>
    </div>
  );

  if (!business.placeId) {
    return (
      <section className="mt-5 max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="font-semibold text-white">Watch this business on Google</h2>
        <p className="mt-1 text-sm text-slate-400">Get an alert for every new review (an email for 3★ or less), a daily rating check, a weekly summary, and AI-written replies.</p>
        {!account.hasGoogleKey ? keyBanner('Add your Google Places API key to turn on monitoring.') : (
          <>
            <form onSubmit={search} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Business name and city" aria-label="Business name and city"
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none" />
              <Button type="submit" loading={searching}><Search className="h-4 w-4" />Find on Google</Button>
            </form>
            {results && (results.length === 0 ? <p className="mt-3 text-sm text-slate-400">No match — try adding the city or neighbourhood.</p> : (
              <ul className="mt-3 space-y-2">
                {results.map((p) => (
                  <li key={p.placeId} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="truncate text-xs text-slate-500">{p.address}{p.rating != null ? ` · ${p.rating}★ (${p.reviews ?? 0})` : ''}</p>
                    </div>
                    <Button size="sm" onClick={() => connect(p.placeId)} loading={checking}>This is it</Button>
                  </li>
                ))}
              </ul>
            ))}
          </>
        )}
      </section>
    );
  }

  const week = change(snapshots, business, 7);
  const month = change(snapshots, business, 30);
  const fmt = (n: number | null | undefined, unit = '') => (n == null ? '—' : `${n > 0 ? '+' : ''}${n}${unit}`);

  return (
    <div className="mt-5 space-y-4">
      <section className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div>
          <p className="text-xs text-slate-500">Google rating</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-white">{business.rating ?? '—'} {business.rating != null && <Stars n={Math.round(business.rating)} size="h-5 w-5" />}</p>
          <p className="text-xs text-slate-500">{business.ratingCount ?? 0} reviews</p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <span className="text-slate-500">Last 7 days</span><span className="text-white">{fmt(week?.reviews)} reviews · {fmt(week?.rating, '★')}</span>
          <span className="text-slate-500">Last 30 days</span><span className="text-white">{fmt(month?.reviews)} reviews · {fmt(month?.rating, '★')}</span>
        </div>
        <div className="ml-auto text-right">
          <Button size="sm" variant="secondary" onClick={check} loading={checking}><RefreshCw className="h-4 w-4" />Check now</Button>
          <p className="mt-1.5 text-xs text-slate-500">{business.monitoredAt ? `Checked ${new Date(business.monitoredAt).toLocaleString()} · daily` : 'Not checked yet'}</p>
        </div>
        {business.monitorError && <p className="flex w-full items-center gap-2 text-sm text-rose-300"><AlertTriangle className="h-4 w-4" />{business.monitorError}</p>}
      </section>

      {!account.hasOpenaiKey && keyBanner('Add your OpenAI API key to get AI-written replies to your reviews.')}

      <p className="text-xs text-slate-500">Google shares the 5 most relevant reviews at each check, so the list grows over time. New ones are flagged as soon as the review count goes up.</p>

      {reviews === null ? <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" /> : reviews.length === 0 ? (
        <p className="text-slate-400">No reviews seen yet.</p>
      ) : reviews.map((r) => (
        <article key={r.id} className={`rounded-2xl border p-4 ${r.rating <= 3 ? 'border-rose-500/25 bg-rose-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Stars n={r.rating} />
            <span className="font-medium text-slate-300">{r.author || 'Google user'}</span>
            {r.publishedAt && <span className="ml-auto">{new Date(r.publishedAt).toLocaleDateString()}</span>}
          </div>
          {r.text && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{r.text}</p>}
          {drafts[r.id] !== undefined ? (
            <div className="mt-3">
              <textarea value={drafts[r.id]} onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })} rows={4} aria-label="Reply draft"
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-slate-100 focus:border-amber-400/50 focus:outline-none" />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(drafts[r.id]); toast.success('Copied — paste it on Google'); } catch { toast.error('Copy failed'); } }}><Copy className="h-4 w-4" />Copy reply</Button>
                <a href="https://business.google.com/reviews" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:text-white"><ExternalLink className="h-4 w-4" />Reply on Google</a>
                <Button size="sm" variant="secondary" onClick={() => draft(r)} loading={drafting === r.id}><RefreshCw className="h-4 w-4" />New draft</Button>
              </div>
            </div>
          ) : (
            <Button className="mt-3" size="sm" variant="secondary" onClick={() => draft(r)} loading={drafting === r.id} disabled={!account.hasOpenaiKey}>
              <Sparkles className="h-4 w-4" />Draft a reply with AI
            </Button>
          )}
        </article>
      ))}
    </div>
  );
}
