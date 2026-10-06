'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Printer, XCircle, Clock } from 'lucide-react';
import { PROPOSAL_COPY, formatMoney, totalOf } from '@/lib/proposals';
import type { ProposalContent, ProposalItem, ProposalLanguage, ProposalStatus } from '@/lib/api';

interface PublicProposal {
  title: string; clientName: string; clientCompany: string | null; language: ProposalLanguage; currency: string;
  content: ProposalContent; items: ProposalItem[]; status: ProposalStatus; validUntil: string | null; createdAt: string; expired: boolean;
  acceptedAt: string | null; acceptedName: string | null; acceptedItems: string[] | null; acceptedTotal: number | null;
}
interface Brand { name: string | null; color: string; email: string | null; website: string | null; branding: boolean }

const post = (token: string, path: string, body: unknown = {}) =>
  fetch(`/api/proposal-ai/public/${encodeURIComponent(token)}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Text with "- " lines rendered as a list. */
function Rich({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        const lines = b.split('\n').filter(Boolean);
        if (lines.length && lines.every((l) => /^\s*[-•]\s+/.test(l))) {
          return <ul key={i} className="list-disc space-y-1 ps-5">{lines.map((l, j) => <li key={j}>{l.replace(/^\s*[-•]\s+/, '')}</li>)}</ul>;
        }
        return <p key={i} className="whitespace-pre-wrap">{b}</p>;
      })}
    </div>
  );
}

function H2({ color, children }: { color: string; children: React.ReactNode }) {
  return <h2 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color }}>{children}</h2>;
}

export default function ProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<{ proposal: PublicProposal; brand: Brand } | null>(null);
  const [missing, setMissing] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetch(`/api/proposal-ai/public/${encodeURIComponent(token)}`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.proposal) { setMissing(true); return; }
        setData({ proposal: d.proposal, brand: d.brand });
        setPicked(new Set(d.proposal.acceptedItems ?? []));
        if (!new URLSearchParams(window.location.search).has('preview')) {
          try {
            const key = `mbn_pr_view_${token}`;
            if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); post(token, 'view').catch(() => {}); }
          } catch { post(token, 'view').catch(() => {}); }
        }
      })
      .catch(() => setMissing(true));
  }, [token]);

  const p = data?.proposal;
  const total = useMemo(() => (p ? totalOf(p.items, picked) : 0), [p, picked]);

  if (missing) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-500">This proposal is not available.</main>;
  if (!data || !p) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></main>;

  const { brand } = data;
  const t = PROPOSAL_COPY[p.language] ?? PROPOSAL_COPY.en;
  const locale = p.language === 'ar' ? 'ar-MA' : p.language;
  const date = (d: string) => new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  const money = (n: number) => formatMoney(n, p.currency, p.language);
  const open = !['accepted', 'declined'].includes(p.status) && !p.expired;
  const preview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('preview');

  const toggle = (id: string) => {
    if (!open) return;
    setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const accept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) { setError('Preview — your client will sign here.'); return; }
    setBusy(true); setError('');
    try {
      const res = await post(token, 'accept', { name, selectedItemIds: [...picked] });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Could not accept.');
      setData({ brand, proposal: { ...p, status: 'accepted', acceptedAt: d.acceptedAt, acceptedName: name.trim(), acceptedTotal: d.acceptedTotal, acceptedItems: [...picked] } });
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };

  const decline = async () => {
    if (preview) { setError('Preview — your client can decline here.'); return; }
    setBusy(true); setError('');
    try {
      const res = await post(token, 'decline', { reason });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Could not send.');
      setData({ brand, proposal: { ...p, status: 'declined' } });
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  };

  return (
    <main dir={p.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-100 px-4 py-8 text-slate-800 print:bg-white print:p-0">
      <style>{'@media print{html,body{background:#fff!important}}'}</style>
      <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-sm print:rounded-none print:shadow-none">
        <header className="px-8 py-10 text-white sm:px-12" style={{ background: brand.color }}>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold opacity-90">{brand.name || ''}</p>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25 print:hidden"><Printer className="h-3.5 w-3.5" />{t.print}</button>
          </div>
          <h1 className="mt-8 text-3xl font-bold leading-tight sm:text-4xl">{p.title}</h1>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="opacity-75">{t.preparedFor}</dt><dd className="font-semibold">{p.clientName}{p.clientCompany ? ` · ${p.clientCompany}` : ''}</dd></div>
            {brand.name && <div><dt className="opacity-75">{t.preparedBy}</dt><dd className="font-semibold">{brand.name}</dd></div>}
            {p.validUntil && <div><dt className="opacity-75">{t.validUntil}</dt><dd className="font-semibold">{date(p.validUntil)}</dd></div>}
          </dl>
        </header>

        <div className="space-y-10 px-8 py-10 leading-relaxed sm:px-12">
          {p.content.intro && <section><H2 color={brand.color}>{t.overview}</H2><div className="mt-3"><Rich text={p.content.intro} /></div></section>}
          {p.content.solution && <section><H2 color={brand.color}>{t.solution}</H2><div className="mt-3"><Rich text={p.content.solution} /></div></section>}

          {p.content.phases.length > 0 && (
            <section>
              <H2 color={brand.color}>{t.plan}</H2>
              <ol className="mt-4 space-y-4">
                {p.content.phases.map((ph, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: brand.color }}>{i + 1}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{ph.title}{ph.duration && <span className="ms-2 inline-flex items-center gap-1 text-xs font-normal text-slate-500"><Clock className="h-3 w-3" />{ph.duration}</span>}</p>
                      {ph.description && <p className="mt-1 text-sm text-slate-600">{ph.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {p.items.length > 0 && (
            <section>
              <H2 color={brand.color}>{t.investment}</H2>
              <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {p.items.map((it) => {
                  const on = !it.optional || picked.has(it.id);
                  return (
                    <li key={it.id} className={`flex items-start gap-3 p-4 ${it.optional && !on ? 'opacity-60' : ''}`}>
                      {it.optional ? (
                        <input type="checkbox" checked={on} onChange={() => toggle(it.id)} disabled={!open} aria-label={it.name} className="mt-1 h-4 w-4 shrink-0" style={{ accentColor: brand.color }} />
                      ) : <span className="mt-1 h-4 w-4 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{it.name}{it.optional && <span className="ms-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">{t.optional}</span>}</p>
                        {it.description && <p className="mt-0.5 text-sm text-slate-500">{it.description}</p>}
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums text-slate-900">{money(it.price)}</p>
                    </li>
                  );
                })}
                <li className="flex items-center justify-between rounded-b-2xl bg-slate-50 p-4">
                  <span className="font-bold text-slate-900">{t.total}</span>
                  <span className="text-xl font-black tabular-nums" style={{ color: brand.color }}>{money(p.status === 'accepted' && p.acceptedTotal != null ? p.acceptedTotal : total)}</span>
                </li>
              </ul>
            </section>
          )}

          {p.content.terms && <section><H2 color={brand.color}>{t.terms}</H2><div className="mt-3 text-sm text-slate-600"><Rich text={p.content.terms} /></div></section>}

          <section className="rounded-2xl border-2 p-6 print:border-slate-300" style={{ borderColor: `${brand.color}40` }}>
            {p.status === 'accepted' && p.acceptedName && p.acceptedAt ? (
              <p className="flex items-start gap-2 font-medium text-emerald-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />{t.accepted(p.acceptedName, date(p.acceptedAt))}</p>
            ) : p.status === 'declined' ? (
              <p className="flex items-center gap-2 text-slate-600"><XCircle className="h-5 w-5" />{t.declined}</p>
            ) : p.expired ? (
              <p className="flex items-center gap-2 text-slate-600"><Clock className="h-5 w-5" />{t.expired}</p>
            ) : (
              <form onSubmit={accept} className="space-y-3 print:hidden">
                <p className="text-lg font-bold text-slate-900">{t.acceptTitle}</p>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.acceptName} aria-label={t.acceptName} maxLength={120} required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-serif text-lg italic outline-none focus:border-slate-500" />
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" style={{ accentColor: brand.color }} />{t.acceptCheck}
                </label>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={busy || !agree || name.trim().length < 2} className="flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white disabled:opacity-40" style={{ background: brand.color }}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}{t.accept} · {money(total)}
                  </button>
                  <button type="button" onClick={() => setShowDecline((v) => !v)} className="text-sm text-slate-500 underline hover:text-slate-800">{t.decline}</button>
                </div>
                {showDecline && (
                  <div className="space-y-2 pt-2">
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={1000} placeholder={t.declineReason} aria-label={t.declineReason}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
                    <button type="button" onClick={decline} disabled={busy} className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">{t.declineSend}</button>
                  </div>
                )}
              </form>
            )}
          </section>

          {(brand.email || brand.website) && (
            <p className="text-center text-sm text-slate-500">
              {brand.email && <a href={`mailto:${brand.email}`} className="hover:underline">{brand.email}</a>}
              {brand.email && brand.website && ' · '}
              {brand.website && <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{brand.website.replace(/^https?:\/\//, '')}</a>}
            </p>
          )}
        </div>
      </article>
      {brand.branding && (
        <a href="https://mbndev.ma/products/proposal-ai" target="_blank" rel="noopener noreferrer" className="mt-6 block text-center text-xs text-slate-400 hover:text-slate-600 print:hidden">
          Made with MBN Proposal AI
        </a>
      )}
    </main>
  );
}
