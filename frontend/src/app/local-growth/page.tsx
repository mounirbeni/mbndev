'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Search, KeyRound, MapPin, Star, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLocalGrowth } from '@/components/local-growth/LocalGrowthShell';
import { localGrowthAPI, type LeadsAiBusiness } from '@/lib/api';

const LANG_NAMES: Record<string, string> = { en: 'English', fr: 'Français', es: 'Español', ar: 'العربية' };
const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export default function LocalGrowthNewReportPage() {
  const router = useRouter();
  const { account, languages, setAccount } = useLocalGrowth();
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('en');
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<LeadsAiBusiness[] | null>(null);
  const [building, setBuilding] = useState<string | null>(null);

  const search = async () => {
    if (query.trim().length < 3) return;
    setSearching(true);
    try {
      const { data } = await localGrowthAPI.search(query.trim());
      setCandidates(data.results);
      if (!data.results.length) toast('No business found — add the city to the name.');
    } catch (err) {
      toast.error(errMsg(err, 'Search failed.'));
    } finally {
      setSearching(false);
    }
  };

  const build = async (placeId: string) => {
    setBuilding(placeId);
    try {
      const { data } = await localGrowthAPI.create(placeId, lang);
      localGrowthAPI.me().then(({ data: me }) => setAccount(me.account)).catch(() => {});
      router.push(`/local-growth/reports/${data.report.id}`);
    } catch (err) {
      toast.error(errMsg(err, 'Could not create the report.'));
      setBuilding(null);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">New growth report</h1>
      <p className="mt-1 text-slate-400">Find the business, and we compare it with its nearest competitors and build a prioritised action plan.</p>

      {!account.hasGoogleKey && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Add your Google Places API key first. <Link href="/local-growth/settings" className="font-semibold underline">Open Settings</Link></p>
        </div>
      )}

      <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); search(); }}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Business name and city, e.g. "Riad Yasmine Marrakech"'
            aria-label="Business name and city"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-3 text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none"
          />
        </div>
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Summary language" className="rounded-xl border border-white/10 bg-[#07060f] px-3 py-3 text-sm">
          {languages.map((l) => <option key={l} value={l}>{LANG_NAMES[l] || l}</option>)}
        </select>
        <Button type="submit" loading={searching} disabled={!account.hasGoogleKey || query.trim().length < 3}>Find business</Button>
      </form>

      {candidates && candidates.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-slate-300">Which one is it?</h2>
          <ul className="mt-2 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06]">
            {candidates.map((c) => (
              <li key={c.placeId} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{c.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{c.address}</span>
                    {c.rating != null && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{c.rating} ({c.reviews ?? 0})</span>}
                  </p>
                </div>
                <Button size="sm" onClick={() => build(c.placeId)} loading={building === c.placeId} disabled={building !== null}>
                  Create report
                </Button>
              </li>
            ))}
          </ul>
          {building && (
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking Google, the website and nearby competitors… this takes 10–20 seconds.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
