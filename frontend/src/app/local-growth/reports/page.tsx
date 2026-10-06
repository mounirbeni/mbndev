'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Trash2, MapPin } from 'lucide-react';
import { localGrowthAPI, type LocalGrowthReport } from '@/lib/api';

const scoreCls = (n: number) => (n >= 70 ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : n >= 45 ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' : 'text-rose-300 border-rose-500/30 bg-rose-500/10');

export default function LocalGrowthReportsPage() {
  const [items, setItems] = useState<LocalGrowthReport[] | null>(null);

  const load = useCallback(() => localGrowthAPI.list().then(
    ({ data }) => setItems(data.reports),
    () => { toast.error('Could not load your reports.'); setItems([]); },
  ), []);
  useEffect(() => { load(); }, [load]);

  const remove = async (r: LocalGrowthReport) => {
    if (!window.confirm(`Delete the report for ${r.name}? Its shared link will stop working.`)) return;
    setItems((prev) => prev?.filter((x) => x.id !== r.id) ?? null);
    try { await localGrowthAPI.remove(r.id); } catch { toast.error('Could not delete the report.'); load(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Reports</h1>
      {items === null ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
      ) : items.length === 0 ? (
        <div className="mt-10 text-center text-slate-400">
          <p>No reports yet.</p>
          <Link href="/local-growth" className="mt-2 inline-block text-emerald-300 underline">Create your first report</Link>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06]">
          {items.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/local-growth/reports/${r.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className={`inline-flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${scoreCls(r.score)}`}>{r.score}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-white hover:underline">{r.name}</span>
                  <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500"><MapPin className="h-3 w-3 shrink-0" />{r.address} · {new Date(r.createdAt).toLocaleDateString()}</span>
                </span>
              </Link>
              <button onClick={() => remove(r)} aria-label={`Delete report for ${r.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
