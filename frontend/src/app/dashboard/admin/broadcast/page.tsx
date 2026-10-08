'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ElementType } from 'react';
import { createPortal } from 'react-dom';
import { m as motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Users, Send, CheckCircle2, Clock, Archive, CalendarClock, Smartphone, Monitor,
  X, ChevronRight, FlaskConical, AlertTriangle, Loader2, RefreshCcw, Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI, type BroadcastStatus, type BroadcastTemplate } from '@/lib/api';
import { cn } from '@/lib/utils';
import AccentText from '@/components/ui/AccentText';

type Group = 'live' | 'upcoming' | 'archived';
const GROUPS: { id: Group; label: string; icon: ElementType }[] = [
  { id: 'live',     label: 'Ready to send', icon: Send },
  { id: 'upcoming', label: 'Coming up',     icon: CalendarClock },
  { id: 'archived', label: 'Archived',      icon: Archive },
];

const STATUS_BADGE: Record<BroadcastStatus, string> = {
  live:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  upcoming: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  archived: 'bg-white/5 text-slate-400 border-white/10',
};

function badgeText(t: BroadcastTemplate) {
  if (t.kind === 'evergreen') return 'Anytime';
  if (t.status === 'live') return `${t.monthLabel} · now`;
  if (t.status === 'upcoming') return `Opens ${t.monthLabel}`;
  return t.monthLabel ?? 'Retired';
}

interface SentItem { key: string; label: string; sentAt: string; count: number }
const HISTORY_KEY = 'mbndev_broadcast_history';

/* ── Rendered email: sandboxed iframe, scaled to fit, phone or desktop width ── */
function EmailFrame({ html, device }: { html: string; device: 'phone' | 'desktop' }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [boxW, setBoxW] = useState(0);
  const [docH, setDocH] = useState(900);
  const target = device === 'phone' ? 390 : 680;
  const scale = boxW ? Math.min(1, boxW / target) : 1;

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Height of the email itself (sandbox allows same-origin reads but no scripts).
  const measure = useCallback(() => {
    const d = frame.current?.contentDocument;
    if (d?.body) setDocH(Math.max(d.documentElement.scrollHeight, d.body.scrollHeight));
  }, []);
  useEffect(() => { const t = setTimeout(measure, 150); return () => clearTimeout(t); }, [html, device, measure]);

  return (
    <div ref={box} className="w-full">
      <div className="mx-auto overflow-hidden rounded-2xl border border-white/10 bg-[#09090d]"
        style={{ width: target * scale, height: docH * scale }}>
        <iframe
          ref={frame}
          title="Email preview"
          srcDoc={html}
          sandbox="allow-same-origin"
          onLoad={measure}
          style={{ width: target, height: docH, border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', display: 'block' }}
        />
      </div>
    </div>
  );
}

/* ── Preview + send panel ─────────────────────────────────────────────────── */
function PreviewPanel({ tpl, recipients, onClose, onSent }: {
  tpl: BroadcastTemplate; recipients: number | null; onClose: () => void; onSent: (t: BroadcastTemplate) => void;
}) {
  const [device, setDevice] = useState<'phone' | 'desktop'>('phone');
  const [email, setEmail] = useState<{ subject: string; preheader: string; html: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    let alive = true;
    adminAPI.broadcastPreview(tpl.key)
      .then(({ data }) => { if (alive) setEmail(data); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [tpl.key]);

  const sendTest = async () => {
    setTesting(true);
    try { const { data } = await adminAPI.broadcastTest(tpl.key); toast.success(data.message); }
    catch (err: unknown) { toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Test email failed.'); }
    finally { setTesting(false); }
  };

  const sendAll = async () => {
    setSending(true);
    try {
      const { data } = await adminAPI.broadcast(tpl.key);
      toast.success(data.message || 'Sent.');
      onSent(tpl);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send. Try again.');
    } finally { setSending(false); setConfirm(false); }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-white/8 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{tpl.label}</p>
          <span className={cn('mt-1 inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-bold', STATUS_BADGE[tpl.status])}>{badgeText(tpl)}</span>
        </div>
        <button onClick={onClose} aria-label="Close preview" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white/8 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
        {/* How it looks in the inbox */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">In the inbox</p>
          <div className="mt-2 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">M</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">MBN DEV</p>
              <p className="truncate text-sm text-slate-200">{email?.subject ?? tpl.subject}</p>
              <p className="truncate text-xs text-slate-500">{email?.preheader ?? tpl.preheader}</p>
            </div>
          </div>
        </div>

        {/* Device toggle */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">As recipients will see it</p>
          <div className="flex rounded-xl border border-white/8 bg-white/4 p-1">
            {([['phone', Smartphone, 'Phone'], ['desktop', Monitor, 'Desktop']] as const).map(([d, Icon, label]) => (
              <button key={d} onClick={() => setDevice(d)} aria-pressed={device === d}
                className={cn('flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium', device === d ? 'bg-violet-500/25 text-violet-200' : 'text-slate-400 hover:text-white')}>
                <Icon className="h-3.5 w-3.5" />{label}
              </button>
            ))}
          </div>
        </div>

        {failed ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">Couldn’t load the preview. Close and try again.</p>
        ) : !email ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
        ) : (
          <EmailFrame html={email.html} device={device} />
        )}
        <p className="text-center text-[11px] text-slate-600">Shown with your name — each recipient sees their own first name.</p>
      </div>

      {/* Actions */}
      <div className="space-y-2 border-t border-white/8 px-4 py-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}>
        {tpl.status === 'archived' ? (
          <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/4 p-3 text-xs leading-relaxed text-slate-400">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {tpl.kind === 'retired' ? 'Retired email — kept for reference only. It can’t be sent.' : `Archived — ${tpl.monthLabel} has passed, so this email can no longer be sent.`}
          </p>
        ) : (
          <>
            {tpl.status === 'upcoming' && (
              <p className="flex items-start gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs leading-relaxed text-blue-200">
                <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Sending opens on 1 {tpl.monthLabel}. Until then you can preview it and send yourself a test.
              </p>
            )}
            {confirm ? (
              <div className="space-y-2">
                <p className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>This sends the email to <strong>{recipients ?? '…'} {recipients === 1 ? 'user' : 'users'}</strong> right now. It can’t be undone.</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setConfirm(false)} className="h-11 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-slate-300">Cancel</button>
                  <button onClick={sendAll} disabled={sending} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white disabled:opacity-60">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {sending ? 'Sending…' : 'Confirm send'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={cn('grid gap-2', tpl.status === 'live' ? 'grid-cols-2' : 'grid-cols-1')}>
                <button onClick={sendTest} disabled={testing} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-slate-200 disabled:opacity-60">
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />} Send me a test
                </button>
                {tpl.status === 'live' && (
                  <button onClick={() => setConfirm(true)} disabled={!email} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white disabled:opacity-60">
                    <Send className="h-4 w-4" /> Send to all
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function BroadcastPage() {
  const [templates, setTemplates] = useState<BroadcastTemplate[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [recipients, setRecipients] = useState<number | null>(null);
  const [group, setGroup] = useState<Group>('live');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [history, setHistory] = useState<SentItem[]>([]);
  const [wide, setWide] = useState(false);

  const load = useCallback(() => {
    setLoadError(false);
    adminAPI.broadcastTemplates().then(({ data }) => setTemplates(data.templates), () => setLoadError(true));
    adminAPI.broadcastCount().then(({ data }) => setRecipients(data.count), () => {});
  }, []);

  useEffect(() => {
    load();
    try { const s = localStorage.getItem(HISTORY_KEY); if (s) setHistory(JSON.parse(s)); } catch { /* ignore */ }
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setWide(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [load]);

  // Lock the page behind the full-screen preview on phones.
  useEffect(() => {
    if (!openKey || wide) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [openKey, wide]);

  const open = templates?.find((t) => t.key === openKey) ?? null;
  const counts = { live: 0, upcoming: 0, archived: 0 } as Record<Group, number>;
  templates?.forEach((t) => { counts[t.status] += 1; });
  const shown = (templates ?? []).filter((t) => t.status === group);

  const onSent = (t: BroadcastTemplate) => {
    const item: SentItem = { key: t.key, label: t.label, sentAt: new Date().toISOString(), count: recipients ?? 0 };
    const next = [item, ...history].slice(0, 10);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setOpenKey(null);
  };

  const panel = open && (
    <PreviewPanel key={open.key} tpl={open} recipients={recipients} onClose={() => setOpenKey(null)} onSent={onSent} />
  );

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl"><AccentText text="Broadcast" /></h1>
          <p className="mt-1 text-sm text-slate-400">Ready-made emails for all your users. Preview exactly what they’ll receive before sending.</p>
        </div>
        <div className="flex h-9 items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-sm font-bold text-white">{recipients ?? '…'}</span>
          <span className="text-xs text-slate-500">recipients</span>
        </div>
      </div>

      {/* Groups */}
      <div className="chip-row">
        {GROUPS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setGroup(id)} aria-pressed={group === id}
            className={cn('flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors',
              group === id ? 'border-violet-500/45 bg-violet-500/20 text-violet-200' : 'border-white/8 bg-white/4 text-slate-400 hover:text-white')}>
            <Icon className="h-4 w-4" />{label}
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold">{templates ? counts[id] : '…'}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Template list */}
        <div className="space-y-3">
          {group === 'archived' && (
            <p className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/4 p-3 text-xs leading-relaxed text-slate-400">
              <Archive className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              A monthly email is archived automatically when its month ends — it can still be previewed, but never sent.
            </p>
          )}
          {loadError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              Couldn’t load the templates.
              <button onClick={load} className="ml-2 inline-flex items-center gap-1 font-semibold underline"><RefreshCcw className="h-3.5 w-3.5" />Retry</button>
            </div>
          ) : !templates ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />)
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center text-sm text-slate-500">Nothing here.</div>
          ) : shown.map((t, i) => (
            <motion.button key={t.key}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setOpenKey(t.key)}
              className={cn('w-full rounded-2xl border p-4 text-left transition-colors',
                openKey === t.key ? 'border-violet-500/40 bg-violet-500/10' : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5')}>
              <div className="flex items-start gap-3">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  t.status === 'live' ? 'bg-violet-500/15 text-violet-300' : t.status === 'upcoming' ? 'bg-blue-500/15 text-blue-300' : 'bg-white/5 text-slate-500')}>
                  {t.status === 'archived' ? <Archive className="h-4 w-4" /> : t.status === 'upcoming' ? <CalendarClock className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-white">{t.label}</span>
                    <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-bold', STATUS_BADGE[t.status])}>{badgeText(t)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{t.description}</p>
                  <p className="mt-2 truncate text-[11px] text-slate-500"><span className="text-slate-600">Subject:</span> {t.subject}</p>
                </div>
                <ChevronRight className="mt-2.5 h-4 w-4 shrink-0 text-slate-600" />
              </div>
            </motion.button>
          ))}

          {/* Sent history (this browser) */}
          {history.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Sent from this device</p>
                <button onClick={() => { setHistory([]); try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ } }}
                  className="-mr-2 px-2 py-1.5 text-[11px] text-slate-500 hover:text-slate-300">Clear</button>
              </div>
              <ul className="divide-y divide-white/5">
                {history.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-slate-300">{h.label}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
                        <Clock className="h-3 w-3" />
                        {new Date(h.sentAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-emerald-400">{h.count} sent</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Desktop: preview beside the list */}
        {wide && (
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="flex h-[calc(100dvh-15rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0c0b14]">
              {panel || (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <Mail className="mb-3 h-10 w-10 text-slate-700" />
                  <p className="text-sm text-slate-500">Choose an email to see the full preview</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phones/tablets: full-screen preview sheet */}
      {!wide && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div key="sheet" className="fixed inset-0 z-[10000] flex flex-col bg-[#0c0b14]"
              style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              role="dialog" aria-modal="true" aria-label={`Preview: ${open.label}`}>
              {panel}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
