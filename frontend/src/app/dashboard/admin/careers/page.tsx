'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Briefcase, ChevronDown, Clock, ExternalLink, FileText, Globe, Linkedin, Loader2,
  Mail, MapPin, Phone, RefreshCw, Search, Trash2,
} from 'lucide-react';
import AccentText from '@/components/ui/AccentText';
import { careersAPI, type JobApplication } from '@/lib/api';
import {
  AVAILABILITY_OPTIONS, EXPERIENCE_OPTIONS, HOURS_OPTIONS, ROLE_QUESTIONS, ROLE_TITLES, STATUS_STYLE,
  labelOf, type ApplicationStatus, type CareerRole,
} from '@/lib/careers';

const STATUSES = Object.keys(STATUS_STYLE) as ApplicationStatus[];
const fieldCls = 'rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-400/50 focus:outline-none';

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const waLink = (phone: string) => `https://wa.me/${phone.replace(/[^\d]/g, '')}`;

export default function AdminCareersPage() {
  const [apps, setApps] = useState<JobApplication[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [role, setRole] = useState<CareerRole | ''>('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const deepLinked = useRef(false);

  const load = useCallback(() => careersAPI.list({ status: status || undefined, role: role || undefined, q: query || undefined }).then(
    ({ data }) => {
      setApps(data.applications);
      setCounts(data.counts);
      // Notification links point here with ?id=… — open that application once.
      if (!deepLinked.current) {
        deepLinked.current = true;
        const id = new URLSearchParams(window.location.search).get('id');
        if (id) setOpen(id);
      }
    },
    (err) => {
      toast.error(errMsg(err, 'Could not load applications.'));
      setApps([]);
    },
  ), [status, role, query]);

  useEffect(() => { load(); }, [load]);

  const patch = (next: JobApplication) => setApps((list) => list?.map((a) => (a.id === next.id ? next : a)) ?? list);

  const changeStatus = async (app: JobApplication, value: ApplicationStatus) => {
    try {
      const { data } = await careersAPI.update(app.id, { status: value });
      patch(data.application);
      setCounts((c) => ({ ...c, [app.status]: Math.max(0, (c[app.status] ?? 1) - 1), [value]: (c[value] ?? 0) + 1 }));
    } catch (err) {
      toast.error(errMsg(err, 'Could not update the status.'));
    }
  };

  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15 text-lime-300"><Briefcase className="h-5 w-5" /></div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white"><AccentText text="Job Applications" /></h1>
          <p className="text-sm text-slate-500">Applications sent from the careers page.</p>
        </div>
        <button onClick={() => { setApps(null); load(); }} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-white/25">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={() => setStatus('')} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${status === '' ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-slate-400'}`}>
          All · {total}
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${status === s ? STATUS_STYLE[s].cls : 'border-white/10 text-slate-400'}`}>
            {STATUS_STYLE[s].label} · {counts[s] ?? 0}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); }} className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input className={`${fieldCls} w-full pl-9`} placeholder="Search name, email or city…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search applications" />
        </form>
        <select className={`${fieldCls} bg-[#0b0a14]`} value={role} onChange={(e) => setRole(e.target.value as CareerRole | '')} aria-label="Filter by role">
          <option value="">All roles</option>
          {(Object.keys(ROLE_TITLES) as CareerRole[]).map((r) => <option key={r} value={r}>{ROLE_TITLES[r]}</option>)}
        </select>
      </div>

      {apps === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
      ) : apps.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-slate-500">
          No applications {status || role || query ? 'match these filters' : 'yet'}.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {apps.map((app) => (
            <ApplicationCard
              key={app.id} app={app} open={open === app.id}
              onToggle={() => setOpen((o) => (o === app.id ? null : app.id))}
              onStatus={(s) => changeStatus(app, s)} onSaved={patch}
              onDeleted={() => { setApps((l) => l?.filter((a) => a.id !== app.id) ?? l); setCounts((c) => ({ ...c, [app.status]: Math.max(0, (c[app.status] ?? 1) - 1) })); }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ApplicationCard({ app, open, onToggle, onStatus, onSaved, onDeleted }: {
  app: JobApplication; open: boolean; onToggle: () => void;
  onStatus: (s: ApplicationStatus) => void; onSaved: (a: JobApplication) => void; onDeleted: () => void;
}) {
  const [notes, setNotes] = useState(app.adminNotes ?? '');
  const [busy, setBusy] = useState<'cv' | 'notes' | 'delete' | null>(null);
  const st = STATUS_STYLE[app.status];
  const questions = ROLE_QUESTIONS[app.role] ?? [];

  const openCv = async () => {
    // Open the tab synchronously (popup blockers), then point it at the blob.
    const tab = window.open('', '_blank');
    setBusy('cv');
    try {
      const { data } = await careersAPI.cv(app.id);
      const url = URL.createObjectURL(data as Blob);
      if (/\.pdf$/i.test(app.cvName) && tab) {
        tab.location.href = url;
      } else {
        tab?.close();
        const a = document.createElement('a');
        a.href = url; a.download = app.cvName; a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      toast.error(errMsg(err, 'Could not open the CV.'));
    } finally {
      setBusy(null);
    }
  };

  const saveNotes = async () => {
    setBusy('notes');
    try {
      const { data } = await careersAPI.update(app.id, { adminNotes: notes });
      onSaved(data.application);
      toast.success('Notes saved');
    } catch (err) {
      toast.error(errMsg(err, 'Could not save the notes.'));
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${app.fullName}'s application and CV? This cannot be undone.`)) return;
    setBusy('delete');
    try {
      await careersAPI.remove(app.id);
      onDeleted();
      toast.success('Application deleted');
    } catch (err) {
      toast.error(errMsg(err, 'Could not delete the application.'));
      setBusy(null);
    }
  };

  return (
    <li className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-200">
            {app.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{app.fullName}</p>
            <p className="truncate text-xs text-slate-500">
              {ROLE_TITLES[app.role] ?? app.role} · {labelOf(EXPERIENCE_OPTIONS, app.experienceYears)} · {fmtDate(app.createdAt)}
            </p>
          </div>
        </button>
        <select
          value={app.status} onChange={(e) => onStatus(e.target.value as ApplicationStatus)} aria-label="Application status"
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold focus:outline-none ${st.cls} bg-[#0b0a14]`}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
        </select>
        <button onClick={onToggle} aria-label={open ? 'Collapse' : 'Expand'} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="space-y-5 border-t border-white/8 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <button onClick={openCv} disabled={busy === 'cv'} className="flex items-center gap-2 rounded-xl bg-[#ede6ff] px-4 py-2 text-sm font-semibold text-[#14092b] hover:bg-white disabled:opacity-60">
              {busy === 'cv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Open CV
            </button>
            <a href={`mailto:${app.email}?subject=${encodeURIComponent(`Your application — ${ROLE_TITLES[app.role] ?? 'MBN DEV'}`)}`} className="flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2 text-sm text-slate-200 hover:border-white/30">
              <Mail className="h-4 w-4" /> Email
            </a>
            {app.phone && (
              <a href={waLink(app.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2 text-sm text-slate-200 hover:border-white/30">
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Info icon={Mail} label="Email" value={app.email} />
            <Info icon={Phone} label="Phone" value={app.phone} />
            <Info icon={MapPin} label="Location" value={app.location} />
            <Info icon={Clock} label="Can start" value={labelOf(AVAILABILITY_OPTIONS, app.availability)} />
            <Info icon={Clock} label="Weekly time" value={app.weeklyHours ? labelOf(HOURS_OPTIONS, app.weeklyHours) : null} />
            <Info icon={Briefcase} label="Expected rate" value={app.expectedRate} />
            <Info icon={Globe} label="Languages" value={app.languages.length ? app.languages.join(', ') : null} />
            <Info icon={FileText} label="CV" value={`${app.cvName} · ${(app.cvSize / 1024 / 1024).toFixed(1)} MB`} />
          </dl>

          <div className="flex flex-wrap gap-2">
            {app.portfolioUrl && <LinkChip href={app.portfolioUrl} icon={Globe} label="Portfolio" />}
            {app.linkedinUrl && <LinkChip href={app.linkedinUrl} icon={Linkedin} label="LinkedIn" />}
          </div>

          {questions.some((q) => app.answers?.[q.key]) && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-300">Role questions</p>
              <dl className="space-y-2 text-sm">
                {questions.filter((q) => app.answers?.[q.key]).map((q) => (
                  <div key={q.key}>
                    <dt className="text-xs text-slate-500">{q.label}</dt>
                    <dd className="break-words text-slate-200">
                      {q.type === 'url'
                        ? <a href={app.answers[q.key]} target="_blank" rel="noopener noreferrer" className="text-violet-300 underline-offset-2 hover:underline">{app.answers[q.key]}</a>
                        : app.answers[q.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {app.message && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">About them</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{app.message}</p>
            </div>
          )}

          <div>
            <label htmlFor={`notes-${app.id}`} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Private notes</label>
            <textarea id={`notes-${app.id}`} rows={3} className={`${fieldCls} w-full`} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} placeholder="Interview notes, trial task, rate agreed…" />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <button onClick={saveNotes} disabled={busy === 'notes' || notes === (app.adminNotes ?? '')} className="rounded-xl border border-white/12 px-4 py-2 text-sm text-slate-200 hover:border-white/30 disabled:opacity-40">
                {busy === 'notes' ? 'Saving…' : 'Save notes'}
              </button>
              <button onClick={remove} disabled={busy === 'delete'} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 disabled:opacity-40">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="break-words text-slate-200">{value || '—'}</dd>
      </div>
    </div>
  );
}

function LinkChip({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-xs text-slate-200 hover:border-white/30">
      <Icon className="h-3.5 w-3.5" /> {label} <ExternalLink className="h-3 w-3 text-slate-500" />
    </a>
  );
}
