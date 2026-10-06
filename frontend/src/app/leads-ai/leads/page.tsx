'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Download, Trash2, Globe, Mail, Phone, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ScoreBadge from '@/components/leads-ai/ScoreBadge';
import LeadPanel from '@/components/leads-ai/LeadPanel';
import { leadsAiAPI, type LeadsAiProspect, type LeadsAiAnalysis } from '@/lib/api';

const STATUSES = ['new', 'contacted', 'replied', 'won', 'lost'] as const;
const STATUS_STYLE: Record<string, string> = {
  new:       'text-slate-300',
  contacted: 'text-blue-300',
  replied:   'text-violet-300',
  won:       'text-emerald-300',
  lost:      'text-slate-500',
};

export default function LeadsAiLeadsPage() {
  const [items, setItems] = useState<LeadsAiProspect[] | null>(null);
  const [status, setStatus] = useState<string>('');
  const [open, setOpen] = useState<LeadsAiProspect | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(() => leadsAiAPI.prospects(status || undefined).then(
    ({ data }) => setItems(data.prospects),
    () => { toast.error('Could not load your leads.'); setItems([]); },
  ), [status]);

  useEffect(() => { load(); }, [load]);

  const update = async (p: LeadsAiProspect, patch: Partial<Pick<LeadsAiProspect, 'status' | 'notes'>>) => {
    setItems((prev) => prev?.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) ?? null);
    try { await leadsAiAPI.update(p.id, patch); } catch { toast.error('Could not update the lead.'); load(); }
  };

  const remove = async (p: LeadsAiProspect) => {
    if (!window.confirm(`Delete ${p.name} from your leads?`)) return;
    setItems((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
    try { await leadsAiAPI.remove(p.id); } catch { toast.error('Could not delete the lead.'); load(); }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { data } = await leadsAiAPI.exportCsv();
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mbn-leads.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  // The panel takes a search-style analysis; saved leads carry the same fields.
  const toAnalysis = (p: LeadsAiProspect): LeadsAiAnalysis | undefined =>
    p.audit ? { id: p.placeId, audit: p.audit, score: p.score, level: p.score >= 70 ? 'hot' : p.score >= 40 ? 'warm' : 'low', issues: p.issues } : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">My leads</h1>
          <p className="mt-1 text-slate-400">Track every business from first message to won deal.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv} loading={exporting} disabled={!items?.length}>
          <Download className="h-4 w-4" />Export CSV
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by status">
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} role="tab" aria-selected={status === s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs capitalize ${status === s ? 'bg-white text-[#14092b]' : 'border border-white/10 text-slate-400 hover:text-white'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
      ) : items.length === 0 ? (
        <div className="mt-10 text-center text-slate-400">
          <p>No leads here yet.</p>
          <Link href="/leads-ai" className="mt-2 inline-block text-violet-300 underline">Find your first leads</Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06]">
          {items.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
              <button onClick={() => setOpen(p)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <ScoreBadge score={p.score} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-white hover:underline">{p.name}</p>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                    {p.website ? <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{p.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}</span> : <span className="text-rose-300">No website</span>}
                    {p.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>}
                    {p.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <select
                  value={p.status}
                  onChange={(e) => update(p, { status: e.target.value as LeadsAiProspect['status'] })}
                  aria-label={`Status of ${p.name}`}
                  className={`rounded-lg border border-white/10 bg-[#07060f] px-2 py-1.5 text-xs capitalize ${STATUS_STYLE[p.status]}`}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <LeadPanel
          business={{ ...open, saved: true }}
          analysis={toAnalysis(open)}
          initialMessage={open.message}
          onClose={() => { setOpen(null); load(); }}
          onSaved={() => load()}
        />
      )}
    </div>
  );
}
