'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BellRing, CalendarDays, ChefHat, Loader2, Receipt, Volume2, VolumeX } from 'lucide-react';
import { menuAPI, type MenuGuestRequest, type MenuRestaurant } from '@/lib/api';
import { formatMoney, loc } from '@/lib/menu';
import { timeAgo } from '@/lib/utils';

const ORDER_NEXT: Record<string, { status: string; label: string }> = {
  new: { status: 'preparing', label: 'Start preparing' },
  preparing: { status: 'ready', label: 'Ready — on its way' },
  ready: { status: 'done', label: 'Served' },
};
const STATUS_STYLE: Record<string, string> = {
  new: 'bg-rose-500/20 text-rose-200', preparing: 'bg-amber-500/20 text-amber-200', ready: 'bg-sky-500/20 text-sky-200',
  done: 'bg-white/10 text-slate-400', cancelled: 'bg-white/10 text-slate-500 line-through', confirmed: 'bg-emerald-500/20 text-emerald-200', declined: 'bg-white/10 text-slate-500',
};

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.18].forEach((t, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = i ? 1046 : 784; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.16);
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
    });
    setTimeout(() => ctx.close(), 800);
  } catch { /* no audio available */ }
}

export default function LiveTab({ restaurant }: { restaurant: MenuRestaurant }) {
  const [requests, setRequests] = useState<MenuGuestRequest[] | null>(null);
  const [scope, setScope] = useState<'open' | 'all'>('open');
  const [sound, setSound] = useState(false);
  const seen = useRef<Set<string> | null>(null);
  const money = (n: number) => formatMoney(n, restaurant.currency, 'en');
  const name = (v: Parameters<typeof loc>[0]) => loc(v, restaurant.defaultLanguage, restaurant.defaultLanguage);

  const load = useCallback(() => menuAPI.requests(restaurant.id, scope).then(({ data }) => {
    const list = data.requests as MenuGuestRequest[];
    const fresh = list.filter((r) => r.status === 'new' && seen.current && !seen.current.has(r.id));
    if (fresh.length) {
      if (sound) beep();
      toast(`${fresh.length} new request${fresh.length === 1 ? '' : 's'}`, { icon: '🔔' });
    }
    seen.current = new Set(list.map((r) => r.id));
    setRequests(list);
  }, () => setRequests((r) => r ?? [])), [restaurant.id, scope, sound]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (r: MenuGuestRequest, status: string) => {
    setRequests((list) => list?.map((x) => (x.id === r.id ? { ...x, status } : x)) ?? null);
    try { await menuAPI.updateRequest(restaurant.id, r.id, status); } catch { toast.error('Could not update.'); load(); }
  };

  if (!requests) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>;

  const orders = requests.filter((r) => r.kind === 'order');
  const calls = requests.filter((r) => r.kind === 'waiter' || r.kind === 'bill');
  const bookings = requests.filter((r) => r.kind === 'booking').sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const pill = (st: string) => <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${STATUS_STYLE[st] ?? 'bg-white/10'}`}>{st}</span>;
  const btn = 'rounded-lg px-3 py-1.5 text-xs font-semibold';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-white/10 p-1 text-sm">
          {(['open', 'all'] as const).map((s) => <button key={s} onClick={() => { setScope(s); setRequests(null); }} className={`rounded-lg px-3 py-1.5 ${scope === s ? 'bg-white/10 text-white' : 'text-slate-400'}`}>{s === 'open' ? 'Open now' : 'History'}</button>)}
        </div>
        <button onClick={() => { setSound((v) => !v); if (!sound) beep(); }} className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${sound ? 'border-emerald-400/40 text-emerald-200' : 'border-white/10 text-slate-400'}`}>
          {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}{sound ? 'Sound on' : 'Turn sound on'}
        </button>
        <span className="text-xs text-slate-500">Updates every 10 seconds. Keep this tab open on the kitchen or counter tablet.</span>
      </div>

      {calls.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-white"><BellRing className="h-4 w-4 text-rose-300" />Tables calling</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {calls.map((r) => (
              <div key={r.id} className={`flex items-center gap-3 rounded-2xl border p-4 ${r.status === 'new' ? 'border-rose-400/40 bg-rose-500/10' : 'border-white/[0.06] bg-white/[0.02] opacity-60'}`}>
                {r.kind === 'bill' ? <Receipt className="h-5 w-5 text-rose-200" /> : <BellRing className="h-5 w-5 text-rose-200" />}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">Table {r.tableLabel} · {r.kind === 'bill' ? `bill${r.notes ? ` (${r.notes})` : ''}` : 'waiter'}</p>
                  <p className="text-xs text-slate-400">{timeAgo(r.updatedAt)}</p>
                </div>
                {r.status === 'new' && <button onClick={() => setStatus(r, 'done')} className={`${btn} bg-white text-[#14092b]`}>Done</button>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-white"><ChefHat className="h-4 w-4 text-amber-300" />Table orders</h2>
        {orders.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">No {scope === 'open' ? 'open ' : ''}orders. Guests order by scanning the table QR code.</p> : (
          <div className="grid gap-3 lg:grid-cols-2">
            {orders.map((r) => (
              <article key={r.id} className={`rounded-2xl border p-4 ${r.status === 'new' ? 'border-rose-400/40 bg-rose-500/[0.07]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                <header className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-bold text-white">Table {r.tableLabel}</p>{pill(r.status)}
                  <span className="ml-auto text-xs text-slate-400">{timeAgo(r.createdAt)}{r.language ? ` · ${r.language.toUpperCase()}` : ''}</span>
                </header>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {(r.items ?? []).map((l, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-7 shrink-0 font-bold text-white">{l.qty}×</span>
                      <span className="min-w-0 flex-1 text-slate-200">
                        {name(l.name)}
                        {(l.option || l.extras.length > 0) && <span className="text-slate-400"> · {[l.option && name(l.option.name), ...l.extras.map((e) => `+ ${name(e.name)}`)].filter(Boolean).join(', ')}</span>}
                        {l.note && <span className="block text-amber-200">“{l.note}”</span>}
                      </span>
                      <span className="text-slate-400">{money(l.unit * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <footer className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
                  <span className="font-semibold text-white">{money(r.total ?? 0)}</span>
                  <span className="ml-auto flex gap-2">
                    {ORDER_NEXT[r.status] && <button onClick={() => setStatus(r, ORDER_NEXT[r.status].status)} className={`${btn} bg-white text-[#14092b]`}>{ORDER_NEXT[r.status].label}</button>}
                    {['new', 'preparing'].includes(r.status) && <button onClick={() => { if (window.confirm('Cancel this order?')) setStatus(r, 'cancelled'); }} className={`${btn} text-slate-400 hover:text-rose-300`}>Cancel</button>}
                  </span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      {restaurant.booking && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-white"><CalendarDays className="h-4 w-4 text-sky-300" />Bookings</h2>
          {bookings.length === 0 ? <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">No {scope === 'open' ? 'upcoming ' : ''}bookings.</p> : (
            <div className="grid gap-2 lg:grid-cols-2">
              {bookings.map((r) => (
                <div key={r.id} className={`flex flex-wrap items-center gap-3 rounded-2xl border p-4 ${r.status === 'new' ? 'border-sky-400/40 bg-sky-500/[0.07]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{r.date} · {r.time} · {r.guests} guest{r.guests === 1 ? '' : 's'} {pill(r.status)}</p>
                    <p className="text-sm text-slate-300">{r.name} · <a href={`tel:${r.phone}`} className="underline">{r.phone}</a></p>
                    {r.notes && <p className="text-xs text-amber-200">{r.notes}</p>}
                  </div>
                  {r.status === 'new' && (
                    <span className="flex gap-2">
                      <button onClick={() => setStatus(r, 'confirmed')} className={`${btn} bg-emerald-400 text-[#06281a]`}>Confirm</button>
                      <button onClick={() => setStatus(r, 'declined')} className={`${btn} border border-white/15 text-slate-300`}>Decline</button>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500">The guest sees “Confirmed” or “Not available” on their phone as soon as you answer.</p>
        </section>
      )}
    </div>
  );
}
