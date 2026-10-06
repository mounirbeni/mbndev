'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, KeyRound, Loader2, Sparkles, FilePlus2, LayoutTemplate } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useProposalAi } from '@/components/proposal-ai/ProposalShell';
import { proposalAPI, type NewProposal, type ProposalLanguage, type ProposalSummary } from '@/lib/api';
import { CURRENCIES, PROPOSAL_LANGUAGES, STATUS_STYLE, formatMoney } from '@/lib/proposals';

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
const fieldCls = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-400/50 focus:outline-none';

export default function ProposalsPage() {
  const router = useRouter();
  const { account, refresh } = useProposalAi();
  const [proposals, setProposals] = useState<ProposalSummary[] | null>(null);
  const [form, setForm] = useState({ clientName: '', clientCompany: '', clientEmail: '', clientPhone: '', brief: '', language: 'en' as ProposalLanguage, currency: account.currency, templateId: '' });
  const [creating, setCreating] = useState<'ai' | 'blank' | null>(null);

  const load = useCallback(() => proposalAPI.list().then(
    ({ data }) => setProposals(data.proposals),
    () => { toast.error('Could not load your proposals.'); setProposals([]); },
  ), []);
  useEffect(() => { load(); }, [load]);

  const templates = (proposals ?? []).filter((p) => p.isTemplate);
  const limitReached = account.proposals.limit !== null && account.proposals.used >= account.proposals.limit;

  const create = async (mode: 'ai' | 'blank') => {
    if (!form.clientName.trim()) { toast.error('Add the client name first.'); return; }
    setCreating(mode);
    try {
      const body: NewProposal = {
        clientName: form.clientName, clientCompany: form.clientCompany, clientEmail: form.clientEmail, clientPhone: form.clientPhone,
        language: form.language, currency: form.currency,
        ...(form.templateId ? { templateId: form.templateId } : mode === 'blank' ? { blank: true } : { brief: form.brief }),
      };
      const { data } = await proposalAPI.create(body);
      refresh();
      router.push(`/proposal-ai/proposals/${data.proposal.id}`);
    } catch (err) {
      toast.error(errMsg(err, 'Could not create the proposal.'));
      setCreating(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Proposals</h1>
      <p className="mt-1 text-slate-400">Describe the project — get a complete proposal your client can sign online.</p>

      {!account.hasOpenaiKey && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Add your OpenAI API key to write proposals with AI (you can still start from a blank proposal). <Link href="/proposal-ai/settings" className="font-semibold underline">Open Settings</Link></p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); create(form.templateId ? 'blank' : 'ai'); }} className="mt-6 grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-4">
        <input className={fieldCls} placeholder="Client name *" aria-label="Client name" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} maxLength={100} required />
        <input className={fieldCls} placeholder="Company" aria-label="Client company" value={form.clientCompany} onChange={(e) => setForm({ ...form, clientCompany: e.target.value })} maxLength={120} />
        <input className={fieldCls} placeholder="Client email" aria-label="Client email" type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} maxLength={160} />
        <input className={fieldCls} placeholder="Client WhatsApp" aria-label="Client WhatsApp" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} maxLength={30} />
        {templates.length > 0 && (
          <select className={`${fieldCls} bg-[#0b0a14] sm:col-span-4`} aria-label="Start from a template" value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })}>
            <option value="">Write a new proposal with AI</option>
            {templates.map((t) => <option key={t.id} value={t.id}>Template: {t.title}</option>)}
          </select>
        )}
        {!form.templateId && (
          <textarea className={`${fieldCls} sm:col-span-4`} rows={4} aria-label="Project brief" maxLength={4000} value={form.brief} onChange={(e) => setForm({ ...form, brief: e.target.value })}
            placeholder="What does the client need? e.g. “Riad in Marrakech, 8 rooms, wants a new bilingual website with direct booking to stop paying Booking.com commissions. Budget around 2,000 €. Launch before the summer season.”" />
        )}
        <select className={`${fieldCls} bg-[#0b0a14]`} aria-label="Proposal language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as ProposalLanguage })}>
          {PROPOSAL_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
        <select className={`${fieldCls} bg-[#0b0a14]`} aria-label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex flex-wrap gap-2 sm:col-span-2 sm:justify-end">
          {form.templateId ? (
            <Button type="submit" loading={creating !== null}><LayoutTemplate className="h-4 w-4" />Create from template</Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => create('blank')} loading={creating === 'blank'} disabled={creating !== null}><FilePlus2 className="h-4 w-4" />Start blank</Button>
              <Button type="submit" loading={creating === 'ai'} disabled={creating !== null || !account.hasOpenaiKey || limitReached || form.brief.trim().length < 20}><Sparkles className="h-4 w-4" />Write with AI</Button>
            </>
          )}
        </div>
        {creating === 'ai' && <p className="flex items-center gap-2 text-sm text-slate-400 sm:col-span-4"><Loader2 className="h-4 w-4 animate-spin" />Writing your proposal… about 20 seconds.</p>}
        {limitReached && <p className="text-sm text-amber-300 sm:col-span-4">You&apos;ve used your {account.proposals.limit} AI proposals this month — upgrade to Pro for unlimited.</p>}
      </form>

      {proposals === null ? (
        <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
      ) : proposals.length > 0 && (
        <ul className="mt-6 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.06]">
          {proposals.map((p) => {
            const st = STATUS_STYLE[p.status];
            return (
              <li key={p.id}>
                <Link href={`/proposal-ai/proposals/${p.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-white/[0.02] px-5 py-4 hover:bg-white/[0.04]">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{p.title}</p>
                    <p className="truncate text-xs text-slate-500">{p.clientName}{p.clientCompany ? ` · ${p.clientCompany}` : ''} · {new Date(p.updatedAt).toLocaleDateString()}</p>
                  </div>
                  {p.isTemplate ? <span className="rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-xs text-fuchsia-300">Template</span> : <span className={`rounded-full px-2.5 py-1 text-xs ${st.cls}`}>{st.label}</span>}
                  {p.viewCount > 0 && <span className="flex items-center gap-1 text-xs text-slate-500"><Eye className="h-3.5 w-3.5" />{p.viewCount}</span>}
                  <span className="w-28 text-right font-semibold tabular-nums text-white">{formatMoney(p.acceptedTotal ?? p.total, p.currency)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
