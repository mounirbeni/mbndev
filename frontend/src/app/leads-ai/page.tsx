'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Search, Globe, Star, BookmarkCheck, KeyRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import ScoreBadge from '@/components/leads-ai/ScoreBadge';
import LeadPanel from '@/components/leads-ai/LeadPanel';
import { useLeadsAi } from '@/components/leads-ai/LeadsAiShell';
import { leadsAiAPI, type LeadsAiAnalysis, type LeadsAiBusiness } from '@/lib/api';

const EXAMPLES = ['riads in Marrakech', 'dentists in London', 'restaurants in Lisbon', 'gyms in Dubai'];
type Filter = 'all' | 'hot' | 'no-website';

const host = (url: string | null) => (url ? url.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : null);
const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export default function LeadsAiSearchPage() {
  const { account, setAccount } = useLeadsAi();
  const [query, setQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<LeadsAiBusiness[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, LeadsAiAnalysis>>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<LeadsAiBusiness | null>(null);
  const runId = useRef(0);

  // Audit the websites in batches of 5, two batches at a time.
  const analyzeAll = async (list: LeadsAiBusiness[], run: number) => {
    const batches: LeadsAiBusiness[][] = [];
    for (let i = 0; i < list.length; i += 5) batches.push(list.slice(i, i + 5));
    const worker = async () => {
      while (batches.length && runId.current === run) {
        const batch = batches.shift()!;
        try {
          const { data } = await leadsAiAPI.analyze(batch.map((b) => ({ id: b.placeId, website: b.website })));
          if (runId.current !== run) return;
          setAnalysis((prev) => {
            const next = { ...prev };
            for (const r of data.results as LeadsAiAnalysis[]) next[r.id] = r;
            return next;
          });
        } catch { /* leave these rows unscored */ }
      }
    };
    await Promise.all([worker(), worker()]);
  };

  const search = async (q = query) => {
    const text = q.trim();
    if (text.length < 3) return;
    setSearching(true);
    try {
      const { data } = await leadsAiAPI.search(text);
      const run = ++runId.current;
      setResults(data.results);
      setAnalysis({});
      setLastQuery(data.query);
      setAccount(data.account);
      if (!data.results.length) toast('No businesses found — try a broader search.');
      analyzeAll(data.results, run);
    } catch (err) {
      toast.error(errMsg(err, 'Search failed.'));
    } finally {
      setSearching(false);
    }
  };

  const rows = useMemo(() => {
    const list = results.filter((b) => {
      if (filter === 'no-website') return !b.website;
      if (filter === 'hot') return (analysis[b.placeId]?.score ?? 0) >= 70;
      return true;
    });
    return list.sort((a, b) => (analysis[b.placeId]?.score ?? -1) - (analysis[a.placeId]?.score ?? -1));
  }, [results, analysis, filter]);

  const fromOsm = results.some((b) => b.placeId.startsWith('osm:'));
  const analyzed = Object.keys(analysis).length;
  const hot = results.filter((b) => (analysis[b.placeId]?.score ?? 0) >= 70).length;
  const noSite = results.filter((b) => !b.website).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Find businesses that need you</h1>
      <p className="mt-1 text-slate-400">Describe the businesses and the place. We find them, audit their websites and score the opportunity.</p>

      {account && !account.hasGoogleKey && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
          <p>Searching with free OpenStreetMap data. For fuller results with ratings and reviews, add a Google Places API key in <Link href="/leads-ai/settings" className="font-semibold text-white underline">Settings</Link> (optional).</p>
        </div>
      )}

      <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); search(); }}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "riads in Marrakech"'
            aria-label="What businesses are you looking for?"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-3 text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
          />
        </div>
        <Button type="submit" loading={searching} disabled={query.trim().length < 3}>Find leads</Button>
      </form>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" onClick={() => { setQuery(ex); search(ex); }} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400 hover:border-white/25 hover:text-white">
            {ex}
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Businesses', results.length],
              ['Analyzed', `${analyzed}/${results.length}`],
              ['Hot leads (70+)', hot],
              ['No website', noSite],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-1.5" role="tablist" aria-label="Filter results">
            {([['all', 'All'], ['hot', 'Hot only'], ['no-website', 'No website']] as [Filter, string][]).map(([key, label]) => (
              <button key={key} role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className={`rounded-full px-3 py-1.5 text-xs ${filter === key ? 'bg-white text-[#14092b]' : 'border border-white/10 text-slate-400 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>

          <ul className="mt-3 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06]">
            {rows.map((b) => {
              const a = analysis[b.placeId];
              return (
                <li key={b.placeId}>
                  <button onClick={() => setOpen(b)} className="flex w-full items-center gap-3 bg-white/[0.01] px-4 py-3 text-left hover:bg-white/[0.04]">
                    <ScoreBadge score={a?.score} loading={!a} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate font-medium text-white">
                        {b.name}
                        {b.saved && <BookmarkCheck className="h-3.5 w-3.5 shrink-0 text-violet-300" aria-label="Saved" />}
                      </p>
                      <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                        <span className={`flex items-center gap-1 truncate ${b.website ? '' : 'text-rose-300'}`}><Globe className="h-3 w-3 shrink-0" />{host(b.website) || 'No website'}</span>
                        {b.rating != null && <span className="flex shrink-0 items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{b.rating} ({b.reviews ?? 0})</span>}
                      </p>
                      {a && a.issues.length > 0 && (
                        <p className="mt-1.5 flex flex-wrap gap-1">
                          {a.issues.slice(0, 3).map((i) => <span key={i.key} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-300">{i.label}</span>)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {open && (
        <LeadPanel
          business={open}
          analysis={analysis[open.placeId]}
          query={lastQuery}
          onClose={() => setOpen(null)}
          onSaved={(id) => setResults((prev) => prev.map((b) => (b.placeId === id ? { ...b, saved: true } : b)))}
        />
      )}
      {fromOsm && (
        <p className="mt-4 text-[11px] text-slate-600">
          Business data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">OpenStreetMap contributors</a>
        </p>
      )}
    </div>
  );
}
