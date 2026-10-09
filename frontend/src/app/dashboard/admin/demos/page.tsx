'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Copy, Dices, ExternalLink, Eye, EyeOff, KeyRound, Loader2, MonitorPlay, Power, RefreshCw, Save } from 'lucide-react';
import AccentText from '@/components/ui/AccentText';
import { demosAPI, type DemoSite, type DemoSitePatch } from '@/lib/api';

const fieldCls = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-400/50 focus:outline-none';

const STATE_STYLE: Record<DemoSite['state'], { label: string; cls: string }> = {
  live:     { label: 'Live',     cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  disabled: { label: 'Switched off', cls: 'border-slate-400/30 bg-slate-400/10 text-slate-300' },
  expired:  { label: 'Expired',  cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
};

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const toDateInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
// An expiry date means "through the end of that day" in the owner's timezone.
const fromDateInput = (v: string) => (v ? new Date(`${v}T23:59:59`).toISOString() : null);
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const randomPin = () => String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000)).slice(0, 4);

export default function AdminDemosPage() {
  const [demos, setDemos] = useState<DemoSite[] | null>(null);

  const load = useCallback(() => demosAPI.list().then(
    ({ data }) => setDemos(data.demos),
    (err) => { toast.error(errMsg(err, 'Could not load the demo sites.')); setDemos([]); },
  ), []);
  useEffect(() => { load(); }, [load]);

  const replace = (next: DemoSite) => setDemos((list) => list?.map((d) => (d.slug === next.slug ? next : d)) ?? list);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300"><MonitorPlay className="h-5 w-5" /></div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white"><AccentText text="Demo Sites" /></h1>
          <p className="text-sm text-slate-500">Control the access PIN, availability and options of each demo you show to clients.</p>
        </div>
        <button onClick={() => { setDemos(null); load(); }} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-white/25">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {demos === null ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
      ) : demos.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-slate-500">No demo sites available.</div>
      ) : (
        <ul className="mt-5 space-y-4">
          {demos.map((d) => <DemoCard key={`${d.slug}:${d.updatedAt}`} demo={d} onSaved={replace} />)}
        </ul>
      )}

      <p className="mt-6 text-xs leading-relaxed text-slate-600">
        The PIN is stored encrypted and checked on the server, with a limit of 10 wrong attempts per 15 minutes per visitor.
        A demo&apos;s orders, bookings and sign-ups are kept in each visitor&apos;s own browser, so they are not visible from here.
      </p>
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-white/15'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

function DemoCard({ demo, onSaved }: { demo: DemoSite; onSaved: (d: DemoSite) => void }) {
  const initial = useMemo(() => ({
    name: demo.name, enabled: demo.enabled, pin: demo.pin ?? '', showPin: demo.showPin,
    expires: toDateInput(demo.expiresAt), notes: demo.notes,
  }), [demo]);
  const [f, setF] = useState(initial);
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const st = STATE_STYLE[demo.state];
  const pinChanged = f.pin !== initial.pin;
  const dirty = pinChanged || f.name !== initial.name || f.enabled !== initial.enabled || f.showPin !== initial.showPin
    || f.expires !== initial.expires || f.notes !== initial.notes;
  const pinOk = f.pin === '' || /^\d{4,8}$/.test(f.pin);
  const needsPin = f.showPin && !f.pin;

  const save = async () => {
    if (!pinOk) { toast.error('The PIN must be 4 to 8 digits.'); return; }
    if (needsPin) { toast.error('Enter the PIN to show it on the login screen.'); return; }
    const patch: DemoSitePatch = {};
    if (f.name !== initial.name) patch.name = f.name;
    if (f.enabled !== initial.enabled) patch.enabled = f.enabled;
    if (pinChanged && f.pin) patch.pin = f.pin;
    if (f.showPin !== initial.showPin) patch.showPin = f.showPin;
    if (f.expires !== initial.expires) patch.expiresAt = fromDateInput(f.expires);
    if (f.notes !== initial.notes) patch.notes = f.notes;
    setBusy(true);
    try {
      const { data } = await demosAPI.update(demo.slug, patch);
      onSaved(data.demo);
      toast.success('Saved.');
    } catch (err) {
      toast.error(errMsg(err, 'Could not save.'));
    } finally { setBusy(false); }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${demo.path}`);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { toast.error('Could not copy the link.'); }
  };

  return (
    <li className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-white">{demo.name}</p>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {demo.unlocks} dashboard unlock{demo.unlocks === 1 ? '' : 's'}
            {demo.lastUnlockAt ? ` · last ${fmtDateTime(demo.lastUnlockAt)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={demo.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-white/25"><ExternalLink className="h-3.5 w-3.5" /> Website</a>
          <a href={demo.adminPath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-white/25"><KeyRound className="h-3.5 w-3.5" /> Owner dashboard</a>
          <button onClick={copyLink} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-white/25">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>

      <div className="grid gap-5 border-t border-white/8 p-4 sm:p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Name</span>
            <input className={fieldCls} value={f.name} maxLength={80} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Owner dashboard PIN (4–8 digits)</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  className={`${fieldCls} pr-10 font-mono tracking-[0.3em]`} inputMode="numeric" maxLength={8} autoComplete="off"
                  type={reveal ? 'text' : 'password'} value={f.pin} placeholder={demo.showPin ? '' : 'Unchanged'}
                  onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, '') })} aria-label="PIN"
                />
                <button type="button" onClick={() => setReveal((r) => !r)} aria-label={reveal ? 'Hide PIN' : 'Show PIN'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:text-slate-300">
                  {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="button" onClick={() => { setF({ ...f, pin: randomPin() }); setReveal(true); }} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs text-slate-300 hover:border-white/25">
                <Dices className="h-4 w-4" /> Random
              </button>
            </div>
            {!pinOk && <p className="mt-1.5 text-xs text-rose-400">The PIN must be 4 to 8 digits.</p>}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 px-3.5 py-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Show the PIN on the login screen</p>
              <p className="text-xs text-slate-500">{f.showPin ? 'Visitors see “Demo PIN: …” under the field.' : 'Hidden — you give the PIN to the client yourself.'}</p>
            </div>
            <Switch on={f.showPin} onChange={(v) => setF({ ...f, showPin: v })} label="Show the PIN on the login screen" />
          </div>
          {needsPin && <p className="-mt-2 text-xs text-amber-400">Type the PIN above — it is stored encrypted, so it cannot be read back to be shown.</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 px-3.5 py-3">
            <div className="flex items-center gap-3">
              <Power className={`h-4 w-4 ${f.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <p className="text-sm font-medium text-slate-200">Demo is available</p>
                <p className="text-xs text-slate-500">When off, the website and the owner dashboard show “switched off”.</p>
              </div>
            </div>
            <Switch on={f.enabled} onChange={(v) => setF({ ...f, enabled: v })} label="Demo is available" />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Expires after (optional)</span>
            <div className="flex gap-2">
              <input type="date" className={`${fieldCls} [color-scheme:dark]`} value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} />
              {f.expires && <button type="button" onClick={() => setF({ ...f, expires: '' })} className="rounded-xl border border-white/10 px-3 text-xs text-slate-300 hover:border-white/25">Clear</button>}
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">Private notes</span>
            <textarea className={`${fieldCls} min-h-[84px] resize-y`} maxLength={1000} placeholder="Who is this demo for, what you promised…" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-white/8 px-4 py-3 sm:px-5">
        {dirty && <button onClick={() => setF(initial)} disabled={busy} className="rounded-xl px-3 py-2 text-sm text-slate-400 hover:text-slate-200">Discard</button>}
        <button
          onClick={save} disabled={!dirty || busy || !pinOk}
          className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </button>
      </div>
    </li>
  );
}
