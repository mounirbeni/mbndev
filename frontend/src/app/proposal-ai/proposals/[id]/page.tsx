'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Copy, ExternalLink, Loader2, Mail, MessageCircle, Plus, Trash2, Files, CheckCircle2, XCircle, Eye, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useProposalAi } from '@/components/proposal-ai/ProposalShell';
import { proposalAPI, type Proposal, type ProposalItem, type ProposalLanguage, type ProposalPhase } from '@/lib/api';
import { CURRENCIES, PROPOSAL_LANGUAGES, STATUS_STYLE, formatMoney, shareMessage, totalOf } from '@/lib/proposals';

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
const fieldCls = 'mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-400/50 focus:outline-none disabled:opacity-60';
const cardCls = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5';
const newId = () => Math.random().toString(16).slice(2, 14).padEnd(12, '0');

export default function ProposalEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { account } = useProposalAi();
  const [p, setP] = useState<Proposal | null>(null);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    proposalAPI.get(id).then(({ data }) => setP(data.proposal), () => setMissing(true));
  }, [id]);

  if (missing) return <p className="py-20 text-center text-slate-400">Proposal not found. <Link href="/proposal-ai" className="underline">Back</Link></p>;
  if (!p) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>;

  const locked = p.status === 'accepted';
  const edit = (patch: Partial<Proposal>) => { setP({ ...p, ...patch }); setDirty(true); };
  const editContent = (patch: Partial<Proposal['content']>) => edit({ content: { ...p.content, ...patch } });
  const editPhase = (i: number, patch: Partial<ProposalPhase>) => editContent({ phases: p.content.phases.map((ph, j) => (j === i ? { ...ph, ...patch } : ph)) });
  const editItem = (i: number, patch: Partial<ProposalItem>) => edit({ items: p.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });

  const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://mbndev.ma'}/p/${p.shareToken}`;
  const message = shareMessage(p.language, p.clientName, p.title, link);
  const required = totalOf(p.items, new Set());
  const withOptions = totalOf(p.items, new Set(p.items.map((it) => it.id)));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await proposalAPI.update(id, {
        title: p.title, clientName: p.clientName, clientCompany: p.clientCompany ?? '', clientEmail: p.clientEmail ?? '', clientPhone: p.clientPhone ?? '',
        language: p.language, currency: p.currency, content: p.content, items: p.items, validUntil: p.validUntil,
      });
      setP(data.proposal);
      setDirty(false);
      toast.success('Saved');
      return true;
    } catch (err) {
      toast.error(errMsg(err, 'Could not save.'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const markSent = () => {
    proposalAPI.markSent(id).then(({ data }) => setP((cur) => (cur ? { ...cur, status: data.proposal.status, sentAt: data.proposal.sentAt } : cur)), () => {});
  };
  const share = async (open: () => void) => {
    if (dirty && !(await save())) return;
    open();
    markSent();
  };

  const duplicate = async () => {
    try { const { data } = await proposalAPI.duplicate(id); router.push(`/proposal-ai/proposals/${data.proposal.id}`); toast.success('Duplicated'); } catch { toast.error('Could not duplicate.'); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this proposal? Its link will stop working.')) return;
    try { await proposalAPI.remove(id); router.push('/proposal-ai'); } catch { toast.error('Could not delete.'); }
  };
  const toggleTemplate = async () => {
    try { const { data } = await proposalAPI.update(id, { isTemplate: !p.isTemplate }); setP(data.proposal); toast.success(data.proposal.isTemplate ? 'Saved as a template' : 'No longer a template'); } catch (err) { toast.error(errMsg(err, 'Could not update.')); }
  };

  const st = STATUS_STYLE[p.status];
  const phone = (p.clientPhone || '').replace(/[^\d]/g, '');

  return (
    <div className="pb-24">
      <Link href="/proposal-ai" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Proposals</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 flex-1 truncate text-2xl font-bold text-white sm:text-3xl">{p.title}</h1>
        {p.isTemplate ? <span className="rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-xs text-fuchsia-300">Template</span> : <span className={`rounded-full px-2.5 py-1 text-xs ${st.cls}`}>{st.label}</span>}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {locked && <p className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300"><Lock className="h-4 w-4" />Accepted proposals are locked. Duplicate it to make a new version.</p>}

          <section className={`${cardCls} grid gap-4 sm:grid-cols-2`}>
            <label className="block sm:col-span-2"><span className="text-sm font-medium text-white">Title</span>
              <input className={fieldCls} value={p.title} onChange={(e) => edit({ title: e.target.value })} maxLength={140} disabled={locked} />
            </label>
            <label className="block"><span className="text-sm font-medium text-white">Client name</span>
              <input className={fieldCls} value={p.clientName} onChange={(e) => edit({ clientName: e.target.value })} maxLength={100} disabled={locked} />
            </label>
            <label className="block"><span className="text-sm font-medium text-white">Company</span>
              <input className={fieldCls} value={p.clientCompany ?? ''} onChange={(e) => edit({ clientCompany: e.target.value })} maxLength={120} disabled={locked} />
            </label>
            <label className="block"><span className="text-sm font-medium text-white">Client email</span>
              <input className={fieldCls} type="email" value={p.clientEmail ?? ''} onChange={(e) => edit({ clientEmail: e.target.value })} maxLength={160} disabled={locked} />
            </label>
            <label className="block"><span className="text-sm font-medium text-white">Client WhatsApp</span>
              <input className={fieldCls} value={p.clientPhone ?? ''} onChange={(e) => edit({ clientPhone: e.target.value })} maxLength={30} disabled={locked} />
            </label>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <label className="block"><span className="text-sm font-medium text-white">Language</span>
                <select className={`${fieldCls} bg-[#0b0a14]`} value={p.language} onChange={(e) => edit({ language: e.target.value as ProposalLanguage })} disabled={locked}>
                  {PROPOSAL_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </label>
              <label className="block"><span className="text-sm font-medium text-white">Currency</span>
                <select className={`${fieldCls} bg-[#0b0a14]`} value={p.currency} onChange={(e) => edit({ currency: e.target.value })} disabled={locked}>
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block"><span className="text-sm font-medium text-white">Valid until</span>
                <input type="date" className={`${fieldCls} [color-scheme:dark]`} value={p.validUntil ? p.validUntil.slice(0, 10) : ''} onChange={(e) => edit({ validUntil: e.target.value ? new Date(`${e.target.value}T23:59:59`).toISOString() : null })} disabled={locked} />
              </label>
            </div>
          </section>

          <section className={`${cardCls} space-y-4`}>
            <label className="block"><span className="text-sm font-medium text-white">Overview</span>
              <textarea className={fieldCls} rows={4} value={p.content.intro} onChange={(e) => editContent({ intro: e.target.value })} maxLength={3000} disabled={locked} />
            </label>
            <label className="block"><span className="text-sm font-medium text-white">Solution</span>
              <textarea className={fieldCls} rows={7} value={p.content.solution} onChange={(e) => editContent({ solution: e.target.value })} maxLength={5000} disabled={locked} />
              <span className="mt-1 block text-xs text-slate-500">Start lines with “- ” to show a bullet list.</span>
            </label>
          </section>

          <section className={cardCls}>
            <h2 className="font-semibold text-white">Phases</h2>
            <div className="mt-3 space-y-3">
              {p.content.phases.map((ph, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[1fr_140px_auto]">
                  <input className={fieldCls.replace('mt-1.5 ', '')} placeholder="Phase title" aria-label={`Phase ${i + 1} title`} value={ph.title} onChange={(e) => editPhase(i, { title: e.target.value })} maxLength={120} disabled={locked} />
                  <input className={fieldCls.replace('mt-1.5 ', '')} placeholder="Duration" aria-label={`Phase ${i + 1} duration`} value={ph.duration} onChange={(e) => editPhase(i, { duration: e.target.value })} maxLength={60} disabled={locked} />
                  <button type="button" onClick={() => editContent({ phases: p.content.phases.filter((_, j) => j !== i) })} disabled={locked} aria-label={`Remove phase ${i + 1}`} className="rounded-lg p-2 text-slate-500 hover:text-rose-300 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                  <textarea className={`${fieldCls.replace('mt-1.5 ', '')} sm:col-span-3`} rows={2} placeholder="What happens in this phase" aria-label={`Phase ${i + 1} description`} value={ph.description} onChange={(e) => editPhase(i, { description: e.target.value })} maxLength={1500} disabled={locked} />
                </div>
              ))}
            </div>
            {!locked && <Button className="mt-3" size="sm" variant="secondary" onClick={() => editContent({ phases: [...p.content.phases, { title: '', description: '', duration: '' }] })}><Plus className="h-4 w-4" />Add phase</Button>}
          </section>

          <section className={cardCls}>
            <h2 className="font-semibold text-white">Pricing</h2>
            <p className="mt-1 text-xs text-slate-500">Optional items are extras your client can tick on the proposal page.</p>
            <div className="mt-3 space-y-3">
              {p.items.map((it, i) => (
                <div key={it.id} className="grid gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[1fr_130px_auto_auto]">
                  <input className={fieldCls.replace('mt-1.5 ', '')} placeholder="Item" aria-label={`Item ${i + 1} name`} value={it.name} onChange={(e) => editItem(i, { name: e.target.value })} maxLength={140} disabled={locked} />
                  <input className={fieldCls.replace('mt-1.5 ', '')} type="number" min={0} step="0.01" aria-label={`Item ${i + 1} price`} value={it.price} onChange={(e) => editItem(i, { price: Number(e.target.value) || 0 })} disabled={locked} />
                  <label className="flex items-center gap-1.5 text-xs text-slate-400"><input type="checkbox" checked={it.optional} onChange={(e) => editItem(i, { optional: e.target.checked })} disabled={locked} />Optional</label>
                  <button type="button" onClick={() => edit({ items: p.items.filter((_, j) => j !== i) })} disabled={locked} aria-label={`Remove item ${i + 1}`} className="rounded-lg p-2 text-slate-500 hover:text-rose-300 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                  <input className={`${fieldCls.replace('mt-1.5 ', '')} sm:col-span-4`} placeholder="Short description (optional)" aria-label={`Item ${i + 1} description`} value={it.description} onChange={(e) => editItem(i, { description: e.target.value })} maxLength={600} disabled={locked} />
                </div>
              ))}
            </div>
            {!locked && <Button className="mt-3" size="sm" variant="secondary" onClick={() => edit({ items: [...p.items, { id: newId(), name: '', description: '', price: 0, optional: false }] })}><Plus className="h-4 w-4" />Add item</Button>}
            <p className="mt-4 text-sm text-slate-300">Total <b className="text-white">{formatMoney(required, p.currency)}</b>{withOptions !== required && <span className="text-slate-500"> · up to {formatMoney(withOptions, p.currency)} with all options</span>}</p>
          </section>

          <section className={cardCls}>
            <label className="block"><span className="text-sm font-medium text-white">Terms</span>
              <textarea className={fieldCls} rows={5} value={p.content.terms} onChange={(e) => editContent({ terms: e.target.value })} maxLength={3000} disabled={locked} />
            </label>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {p.status === 'accepted' && (
            <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-200">
              <p className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5" />Accepted</p>
              <p className="mt-2">Signed by <b>{p.acceptedName}</b> on {p.acceptedAt && new Date(p.acceptedAt).toLocaleString()}.</p>
              {p.acceptedTotal != null && <p className="mt-1">Total: <b>{formatMoney(p.acceptedTotal, p.currency)}</b></p>}
            </section>
          )}
          {p.status === 'declined' && (
            <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-200">
              <p className="flex items-center gap-2 font-semibold"><XCircle className="h-5 w-5" />Declined</p>
              {p.declineReason && <p className="mt-2">“{p.declineReason}”</p>}
            </section>
          )}

          {!p.isTemplate && (
            <section className={cardCls}>
              <h2 className="font-semibold text-white">Send to {p.clientName}</h2>
              <div className="mt-3 flex gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-fuchsia-200">{link}</code>
                <button type="button" onClick={() => share(async () => { try { await navigator.clipboard.writeText(link); toast.success('Link copied'); } catch { toast.error('Copy failed'); } })} aria-label="Copy link" className="rounded-lg border border-white/10 px-2.5 text-slate-300 hover:text-white"><Copy className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 grid gap-2">
                <button type="button" onClick={() => share(() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener'))} className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400"><MessageCircle className="h-4 w-4" />Send on WhatsApp</button>
                <button type="button" onClick={() => share(() => { window.location.href = `mailto:${encodeURIComponent(p.clientEmail || '')}?subject=${encodeURIComponent(p.title)}&body=${encodeURIComponent(message)}`; })} className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-slate-200 hover:border-white/30"><Mail className="h-4 w-4" />Send by email</button>
                <a href={`/p/${p.shareToken}?preview=1`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-slate-200 hover:border-white/30"><ExternalLink className="h-4 w-4" />Preview as client</a>
              </div>
              <dl className="mt-4 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><dt>Sent</dt><dd>{p.sentAt ? new Date(p.sentAt).toLocaleString() : '—'}</dd></div>
                <div className="flex justify-between"><dt className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />Opened</dt><dd>{p.viewCount ? `${p.viewCount}× · last ${p.lastViewedAt ? new Date(p.lastViewedAt).toLocaleString() : ''}` : 'not yet'}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-slate-500">You&apos;ll get a notification when it&apos;s opened and when it&apos;s accepted — and a reminder to follow up after 3 days without an answer.</p>
            </section>
          )}

          <section className={`${cardCls} flex flex-wrap gap-2`}>
            <Button size="sm" variant="secondary" onClick={duplicate}><Files className="h-4 w-4" />Duplicate</Button>
            {account.templates && !locked && <Button size="sm" variant="secondary" onClick={toggleTemplate}>{p.isTemplate ? 'Unmark template' : 'Save as template'}</Button>}
            <Button size="sm" variant="secondary" onClick={remove}><Trash2 className="h-4 w-4" />Delete</Button>
          </section>
        </aside>
      </div>

      {!locked && dirty && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#07060f]/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-3">
            <span className="text-sm text-slate-400">Unsaved changes</span>
            <Button onClick={save} loading={saving}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
