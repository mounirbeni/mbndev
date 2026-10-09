// Demo "backend": one JSON document in localStorage, shared by the site and the owner dashboard.
// Every tab listens to the `storage` event, so a booking made on the site shows up on the dashboard
// instantly, and a status change on the dashboard updates the client's "My bookings" view.
import { SHOP, SERVICES, BARBERS, PRODUCTS } from './data.js';

const KEY = 'tarz-demo-v1';
const listeners = new Set();

// ── Shop clock ─────────────────────────────────────────────────────────────
// Everything is compared in "shop-local epoch" minutes so the demo behaves the same in any timezone.
export const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const ymd = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
const dateOf = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const addDays = (s, n) => { const d = dateOf(s); d.setUTCDate(d.getUTCDate() + n); return ymd(d); };
export const weekdayOf = (s) => dateOf(s).getUTCDay();
/** Minutes since 1970 in the shop's local time. */
export const epochOf = (s, m) => dateOf(s).getTime() / 60000 + m;

export function shopNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: SHOP.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t) => Number(parts.find((p) => p.type === t).value);
  const date = `${g('year')}-${String(g('month')).padStart(2, '0')}-${String(g('day')).padStart(2, '0')}`;
  const minutes = g('hour') * 60 + g('minute');
  return { date, minutes, day: weekdayOf(date), epoch: epochOf(date, minutes) };
}

// ── Seed ───────────────────────────────────────────────────────────────────
function rng(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
const svcById = (id) => SERVICES.find((x) => x.id === id);
const durOf = (ids) => ids.reduce((n, id) => n + svcById(id).dur, 0);
const sumOf = (ids) => ids.reduce((n, id) => n + svcById(id).price, 0);

function seed() {
  const now = shopNow();
  const today = now.date;
  const R = rng(20260101);

  // 28 days of history (aggregated) so the insights are alive from the first second
  const w = { 0: 0.55, 1: 0.8, 2: 0.8, 3: 0.9, 4: 1, 5: 1.1, 6: 1.35 };
  const mix = { classic: 0.19, fade: 0.27, taper: 0.1, buzz: 0.05, scissor: 0.04, beardtrim: 0.08, beardsculpt: 0.05, shave: 0.04, cutbeard: 0.1, royal: 0.02, facial: 0.02, wash: 0.01, grey: 0.01, kids: 0.04 };
  const history = [];
  for (let i = 28; i >= 1; i--) {
    const date = addDays(today, -i);
    const day = weekdayOf(date);
    const n = Math.round((26 + R() * 10) * w[day]);
    const svc = {};
    let rev = 0;
    for (let k = 0; k < n; k++) {
      let r = R(); let pick = 'classic';
      for (const [id, p] of Object.entries(mix)) { r -= p; if (r <= 0) { pick = id; break; } }
      svc[pick] = (svc[pick] || 0) + 1; rev += svcById(pick).price;
    }
    history.push({ date, n, rev, noshow: R() < 0.55 ? 1 + Math.floor(R() * 2) : 0, svc });
  }
  const heat = Array.from({ length: 7 }, (_, d) => Array.from({ length: 12 }, (_, h) => {
    const hour = 10 + h; // 10:00 … 21:00
    const base = hour >= 17 && hour <= 20 ? 1 : hour >= 12 && hour <= 14 ? 0.7 : 0.4;
    return Math.round(base * w[d] * (4 + R() * 5));
  }));

  // clients
  const D = (n) => addDays(today, -n);
  const clients = {};
  [['0612345678', 'Demo guest', 5, 540, 5, 0, 1, 12], ['0661223344', 'Mehdi Berrada', 14, 1450, 6, 1, 0, 3], ['0677889900', 'Reda Kabbaj', 31, 3480, 7, 3, 0, 5],
    ['0655443322', 'Hamza Lahlou', 9, 960, 1, 1, 0, 9], ['0644221100', 'Othmane Rhazi', 22, 2310, 6, 2, 1, 2], ['0633112233', 'Ayoub Tazi', 6, 870, 6, 0, 0, 7],
    ['0622334455', 'Zakaria Mansouri', 1, 110, 1, 0, 0, 21], ['0611998877', 'Yassine El Idrissi', 17, 1990, 1, 2, 0, 4], ['0699887766', 'Amine Chraibi', 11, 1180, 3, 1, 0, 6],
    ['0688776655', 'Karim Ouazzani', 1, 90, 1, 0, 1, 34], ['0677665544', 'Badr Alaoui', 25, 2750, 1, 3, 0, 1], ['0666554433', 'Walid Sbai', 8, 760, 0, 1, 0, 15]]
    .forEach(([ph, name, visits, spent, stamps, rewards, noShows, last]) => {
      clients[ph] = { name, phone: ph, since: D(60 + visits * 6), visits, spent, stamps, rewards, noShows, last: D(last), notes: '' };
    });
  clients['0661223344'].notes = 'Prefers Younes. Fade #1 on the sides.';
  clients['0677889900'].notes = 'Beard sculpt every visit — allergic to menthol aftershave.';

  // today's bookings: [barber, start, services, name, phone]
  const plan = [
    ['younes', 600, ['fade'], 'Mehdi Berrada', '0661223344'], ['anas', 660, ['beardsculpt'], 'Reda Kabbaj', '0677889900'], ['ilyas', 600, ['classic'], 'Hamza Lahlou', '0655443322'],
    ['soufiane', 660, ['kids'], 'Adam (kid)', '0600000001'], ['younes', 660, ['cutbeard'], 'Walid Sbai', '0666554433'], ['ilyas', 690, ['wash', 'scissor'], 'Yassine El Idrissi', '0611998877'],
    ['anas', 720, ['shave'], 'Tarik Naciri', '0600000002'], ['soufiane', 750, ['buzz'], 'Imad Bennis', '0600000003'], ['younes', 780, ['fade'], 'Othmane Rhazi', '0644221100'],
    ['ilyas', 840, ['taper'], 'Anouar Fassi', '0600000004'], ['anas', 840, ['cutbeard'], 'Badr Alaoui', '0677665544'], ['soufiane', 870, ['fade'], 'Ismail Zniber', '0600000005'],
    ['younes', 900, ['royal'], 'Hicham Berrada', '0600000006'], ['ilyas', 930, ['classic', 'beardtrim'], 'Nabil Skalli', '0600000007'], ['anas', 960, ['beardsculpt'], 'Ayoub Tazi', '0633112233'],
    ['soufiane', 990, ['taper'], 'Saad Lamrani', '0600000008'], ['younes', 1050, ['fade', 'beardtrim'], 'Rayan Chami', '0600000009'], ['ilyas', 1080, ['scissor'], 'Zakaria Mansouri', '0622334455'],
    ['anas', 1110, ['shave'], 'Driss Kettani', '0600000010'], ['soufiane', 1140, ['buzz'], 'Mounir Haddad', '0600000011'], ['younes', 1170, ['classic'], 'Fouad Benjelloun', '0600000012'],
  ];
  const bookings = [];
  let seq = 4800;
  const mk = (date, [barber, start, services, name, phone]) => {
    const dur = durOf(services);
    const done = epochOf(date, start + dur) <= now.epoch;
    const b = { id: `b${++seq}`, code: `TZ-${seq}`, at: epochOf(date, start) - 60 * 24 - Math.floor(R() * 600), date, start, dur, barber, anyBarber: false, services, total: sumOf(services), name, phone, note: '', status: done ? 'done' : 'confirmed', source: R() < 0.2 ? 'manual' : 'online', manual: done, seeded: true };
    bookings.push(b);
  };
  plan.forEach((p) => mk(today, p));
  [['younes', 600, ['fade'], 'Saad Alami', '0600000013'], ['anas', 690, ['cutbeard'], 'Reda Kabbaj', '0677889900'], ['ilyas', 660, ['classic'], 'Hamza Lahlou', '0655443322'],
    ['soufiane', 720, ['kids'], 'Yanis (kid)', '0600000014'], ['younes', 840, ['taper'], 'Mehdi Berrada', '0661223344'], ['anas', 900, ['royal'], 'Othmane Rhazi', '0644221100'],
    ['ilyas', 1020, ['scissor'], 'Amine Chraibi', '0699887766']].forEach((p) => mk(addDays(today, 1), p));

  // the shop's own clients are credited with today's finished visits
  const walkins = [];
  if (now.minutes >= 600 && now.minutes < 1260) {
    walkins.push({ id: 'w1', no: 1, name: 'Anouar', phone: '', services: ['classic'], dur: 40, total: 80, joined: now.epoch - 14, status: 'waiting', manual: false });
    walkins.push({ id: 'w2', no: 2, name: 'Marouane', phone: '', services: ['fade', 'beardtrim'], dur: 75, total: 140, joined: now.epoch - 6, status: 'waiting', manual: false });
  }

  return {
    v: 1, seq, wseq: 2,
    settings: { paused: false, autoConfirm: true, autoFlow: true, buffer: 0, banner: true, bannerText: '', hours: JSON.parse(JSON.stringify(SHOP.hours)), sound: true, queueOpen: true },
    svc: {}, barbers: {}, stock: Object.fromEntries(PRODUCTS.map((p, i) => [p.id, 6 + ((i * 5) % 11)])),
    bookings, walkins, clients, reservations: [
      { id: 'r1', no: 1, items: [{ id: 'oil', qty: 1 }, { id: 'balm', qty: 1 }], total: 205, name: 'Reda Kabbaj', phone: '0677889900', at: now.epoch - 60 * 20, status: 'new' },
    ],
    gifts: [{ code: 'TARZ-7Q4K-2M', amount: 200, balance: 200, design: 'brass', to: 'Amine', from: 'Sara', msg: '', at: now.epoch - 60 * 24 * 3 }],
    subs: [{ id: 's1', plan: 'club', name: 'Ayoub Tazi', phone: '0633112233', at: now.epoch - 60 * 24 * 12 }],
    newsletter: ['lina@example.com'],
    history, heat, cart: [], my: { phone: '', ids: [], queue: '' }, lang: null,
  };
}

let state = load();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) return s; }
  } catch { /* storage unavailable — keep an in-memory copy */ }
  const s = seed();
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  return s;
}

export const get = () => state;
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }
export function update(fn) { fn(state); save(); listeners.forEach((l) => l(state, 'local')); }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
window.addEventListener('storage', (e) => {
  if (e.key !== KEY || !e.newValue) return;
  try { state = JSON.parse(e.newValue); } catch { return; }
  listeners.forEach((l) => l(state, 'remote'));
});
export function resetDemo() { state = seed(); save(); listeners.forEach((l) => l(state, 'local')); }

// ── Services, barbers, hours ───────────────────────────────────────────────
export const svcPrice = (s) => state.svc[s.id]?.price ?? s.price;
export const svcActive = (id) => state.svc[id]?.active !== false;
export const services = () => SERVICES.filter((s) => svcActive(s.id)).map((s) => ({ ...s, price: svcPrice(s) }));
export const dur = (ids) => durOf(ids);
export const priceOf = (ids) => ids.reduce((n, id) => n + svcPrice(svcById(id)), 0);
export const barberWeek = (id) => state.barbers[id]?.week || BARBERS.find((b) => b.id === id).week;
export const barberOff = (id, date) => !!state.barbers[id]?.off?.[date];
export const barberActive = (id) => state.barbers[id]?.hidden !== true;

export function openState() {
  const n = shopNow();
  const h = state.settings.hours[n.day];
  if (h && n.minutes >= h[0] && n.minutes < h[1]) return { open: true, until: h[1], soon: h[1] - n.minutes <= 45 };
  for (let k = 0; k < 8; k++) {
    const d = (n.day + k) % 7; const hh = state.settings.hours[d];
    if (hh && (k > 0 || n.minutes < hh[0])) return { open: false, day: d, k, at: hh[0] };
  }
  return { open: false };
}

// ── Availability engine ────────────────────────────────────────────────────
const ACTIVE = new Set(['pending', 'confirmed', 'arrived', 'inchair']);
const busyFor = (barber, date, ignoreId) => state.bookings
  .filter((b) => b.barber === barber && b.date === date && ACTIVE.has(b.status) && b.id !== ignoreId)
  .map((b) => [b.start, b.start + b.dur + state.settings.buffer]);
const loadOf = (barber, date) => state.bookings.filter((b) => b.barber === barber && b.date === date && ACTIVE.has(b.status)).length;

function barberWindow(id, date) {
  const hours = state.settings.hours[weekdayOf(date)];
  const sched = barberWeek(id)[weekdayOf(date)];
  if (!hours || !sched || barberOff(id, date) || !barberActive(id)) return null;
  const from = Math.max(hours[0], sched[0]); const to = Math.min(hours[1], sched[1]);
  return to > from ? [from, to] : null;
}

/** Start times (every SHOP.step minutes) that fit `minutes` of chair time. */
export function slotsFor(date, barberId, minutes, ignoreId) {
  if (state.settings.paused) return [];
  const n = shopNow();
  if (date < n.date || date > addDays(n.date, SHOP.horizon)) return [];
  const ids = barberId === 'any' ? BARBERS.map((b) => b.id) : [barberId];
  const out = new Map();
  for (const id of ids) {
    const win = barberWindow(id, date);
    if (!win) continue;
    const busy = busyFor(id, date, ignoreId);
    for (let t = win[0]; t + minutes <= win[1]; t += SHOP.step) {
      if (date === n.date && t < n.minutes + SHOP.lead) continue;
      if (busy.some(([a, b]) => t < b && t + minutes > a)) continue;
      if (!out.has(t)) out.set(t, []);
      out.get(t).push(id);
    }
  }
  return [...out.entries()].sort((a, b) => a[0] - b[0]).map(([start, barbers]) => ({ start, barbers }));
}

export function nextFree(barberId, minutes = 30) {
  const n = shopNow();
  for (let k = 0; k <= SHOP.horizon; k++) {
    const date = addDays(n.date, k);
    const s = slotsFor(date, barberId, minutes);
    if (s.length) return { date, start: s[0].start, k };
  }
  return null;
}

// ── Clients, loyalty, gifts ────────────────────────────────────────────────
export const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^212/, '0');
export const clientOf = (phone) => state.clients[digits(phone)] || null;
const touchClient = (s, { name, phone }) => {
  const key = digits(phone); if (key.length < 9) return null;
  return s.clients[key] || (s.clients[key] = { name, phone: key, since: shopNow().date, visits: 0, spent: 0, stamps: 0, rewards: 0, noShows: 0, last: '', notes: '' });
};

export function giftBalance(code) {
  const g = state.gifts.find((x) => x.code === String(code || '').trim().toUpperCase());
  return g && g.balance > 0 ? g : null;
}
export function createGift({ amount, design, to, from, msg }) {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (n) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join('');
  const g = { code: `TARZ-${part(4)}-${part(2)}`, amount, balance: amount, design, to, from, msg, at: shopNow().epoch };
  update((s) => { s.gifts.push(g); });
  return g;
}

/** Price breakdown for a basket of services (promo, free-cut reward, gift card). */
export function quote({ services: ids, phone, promo, useReward, gift }) {
  const subtotal = priceOf(ids);
  const c = clientOf(phone);
  const canReward = !!c && c.stamps >= SHOP.stampsForReward;
  const cut = ids.map(svcById).filter((s) => s.cat === 'cuts' || s.cat === 'combo' || s.cat === 'kids').map(svcPrice).sort((a, b) => b - a)[0] || 0;
  const reward = useReward && canReward ? Math.min(cut, 110) : 0;
  const code = String(promo || '').trim().toUpperCase();
  const pct = SHOP.promo[code] || 0;
  const promoOff = Math.round((subtotal - reward) * pct);
  const afterDiscount = subtotal - reward - promoOff;
  const g = gift ? giftBalance(gift) : null;
  const giftUsed = g ? Math.min(g.balance, afterDiscount) : 0;
  return { subtotal, reward, canReward, promoOff, promoOk: pct > 0, giftUsed, giftCode: g?.code || '', total: afterDiscount - giftUsed };
}

// ── Bookings ───────────────────────────────────────────────────────────────
function pickBarber(date, start, minutes, candidates) {
  return [...candidates].sort((a, b) => loadOf(a, date) - loadOf(b, date))[0];
}

/** Create a booking. Re-checks the slot, so two people can never take the same chair. */
export function book(d) {
  const minutes = durOf(d.services);
  const slots = slotsFor(d.date, d.barber, minutes);
  const slot = slots.find((s) => s.start === d.start);
  if (!slot) return { error: 'taken' };
  const barber = d.barber === 'any' ? pickBarber(d.date, d.start, minutes, slot.barbers) : d.barber;
  const q = quote({ services: d.services, phone: d.phone, promo: d.promo, useReward: d.useReward, gift: d.gift });
  let saved;
  update((s) => {
    const n = ++s.seq;
    saved = { id: `b${n}`, code: `TZ-${n}`, at: shopNow().epoch, date: d.date, start: d.start, dur: minutes, barber, anyBarber: d.barber === 'any', services: d.services, total: q.total, listed: q.subtotal, reward: q.reward, usedReward: q.reward > 0, promoOff: q.promoOff, giftUsed: q.giftUsed, name: d.name, phone: d.phone, note: d.note || '', status: s.settings.autoConfirm ? 'confirmed' : 'pending', source: d.source || 'online', manual: d.source === 'manual' };
    if (q.giftUsed) { const g = s.gifts.find((x) => x.code === q.giftCode); if (g) g.balance -= q.giftUsed; }
    s.bookings.push(saved);
    if (d.source !== 'manual') { s.my.ids = [saved.id, ...s.my.ids].slice(0, 8); s.my.phone = digits(d.phone); }
    touchClient(s, d);
  });
  return { booking: saved };
}

export function reschedule(id, date, start) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b) return { error: 'missing' };
  const slot = slotsFor(date, b.anyBarber ? 'any' : b.barber, b.dur, id).find((s) => s.start === start);
  if (!slot) return { error: 'taken' };
  update((s) => {
    const x = s.bookings.find((y) => y.id === id);
    if (x.anyBarber) x.barber = pickBarber(date, start, x.dur, slot.barbers);
    else if (!slot.barbers.includes(x.barber)) return;
    x.date = date; x.start = start; x.status = s.settings.autoConfirm ? 'confirmed' : 'pending'; x.manual = false;
  });
  return { booking: state.bookings.find((x) => x.id === id) };
}

export const minutesUntil = (b) => epochOf(b.date, b.start) - shopNow().epoch;
export function cancelBooking(id, { owner = false } = {}) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b || !ACTIVE.has(b.status)) return { error: 'missing' };
  if (!owner && minutesUntil(b) < 120) return { error: 'late' };
  update((s) => { const x = s.bookings.find((y) => y.id === id); x.status = 'cancelled'; x.manual = true; });
  return { ok: true };
}

/** Credit the client and the day's books when a visit is completed. */
function complete(s, b) {
  const c = touchClient(s, b);
  if (!c) return;
  c.visits += 1; c.spent += b.total; c.last = b.date || shopNow().date;
  if (b.usedReward) { c.stamps = Math.max(0, c.stamps - SHOP.stampsForReward); c.rewards += 1; }
  c.stamps += 1;
}

export function setStatus(id, status) {
  update((s) => {
    const b = s.bookings.find((x) => x.id === id); if (!b) return;
    const was = b.status;
    b.status = status; b.manual = true;
    if (status === 'done' && was !== 'done') complete(s, b);
    if (status === 'noshow' && was !== 'noshow') { const c = touchClient(s, b); if (c) c.noShows += 1; }
  });
}

// ── Live queue (walk-ins) ──────────────────────────────────────────────────
const onShift = (n = shopNow()) => BARBERS.filter((b) => {
  const win = barberWindow(b.id, n.date); return win && n.minutes >= win[0] && n.minutes < win[1];
});

/** Which chair is busy right now: a booking in progress or a walk-in in the chair. */
export function chairs() {
  const n = shopNow();
  return BARBERS.map((b) => {
    const win = barberWindow(b.id, n.date);
    const working = !!win && n.minutes >= win[0] && n.minutes < win[1];
    const cur = state.bookings.find((x) => x.barber === b.id && x.date === n.date && ACTIVE.has(x.status) && x.status !== 'pending'
      && (x.status === 'inchair' || (n.minutes >= x.start && n.minutes < x.start + x.dur)));
    const walk = state.walkins.find((w) => w.barber === b.id && w.status === 'inchair');
    const next = state.bookings.filter((x) => x.barber === b.id && x.date === n.date && ACTIVE.has(x.status) && x.start > n.minutes).sort((p, q) => p.start - q.start)[0];
    return { barber: b.id, state: !working ? 'off' : cur || walk ? 'busy' : 'free', until: cur ? cur.start + cur.dur : null, next: next ? next.start : null, with: cur || walk || null };
  });
}

export function queueInfo() {
  const waiting = state.walkins.filter((w) => w.status === 'waiting');
  const staff = Math.max(1, onShift().length);
  const free = chairs().filter((c) => c.state === 'free').length;
  const work = waiting.reduce((n, w) => n + w.dur, 0);
  // a free chair beyond everyone already waiting means no wait at all
  const wait = free > waiting.length ? 0 : Math.max(5, Math.ceil((work / staff + (free ? 0 : 10)) / 5) * 5);
  return { waiting: waiting.length, wait, free, staff };
}

export function joinQueue({ name, phone, services: ids, owner = false }) {
  const d = durOf(ids);
  let w;
  update((s) => {
    w = { id: `w${++s.wseq}`, no: s.wseq, name, phone, services: ids, dur: d, total: priceOf(ids), joined: shopNow().epoch, status: 'waiting', manual: owner };
    s.walkins.push(w);
    if (!owner) s.my.queue = w.id; // the owner adding a walk-in must not give this browser a ticket
    touchClient(s, { name, phone });
  });
  return w;
}
export const positionOf = (id) => {
  const waiting = state.walkins.filter((w) => w.status === 'waiting');
  const i = waiting.findIndex((w) => w.id === id);
  return i < 0 ? 0 : i + 1;
};
export function setWalkin(id, status, barber) {
  update((s) => {
    const w = s.walkins.find((x) => x.id === id); if (!w) return;
    const was = w.status;
    w.status = status; w.manual = true;
    if (barber) w.barber = barber;
    if (status === 'inchair') w.startedAt = Date.now();
    if (status === 'done' && was !== 'done') complete(s, { ...w, date: shopNow().date });
  });
}

// ── Demo flow: the shop moves along on its own unless the owner has touched a row ──
export function tick() {
  const n = shopNow();
  const s = state;
  let changed = false;
  if (s.settings.autoFlow) {
    s.bookings.forEach((b) => {
      if (b.manual || b.status === 'pending' || b.status === 'cancelled' || b.status === 'noshow' || b.status === 'done') return;
      const end = epochOf(b.date, b.start + b.dur); const start = epochOf(b.date, b.start);
      if (n.epoch >= end) { b.status = 'done'; complete(s, b); changed = true; }
      else if (n.epoch >= start && b.status !== 'inchair') { b.status = 'inchair'; changed = true; }
    });
    // walk-ins: the head of the line takes a free chair after ~20 s and leaves ~45 s later (accelerated for the demo)
    s.walkins.forEach((w) => {
      if (!w.manual && w.status === 'inchair' && Date.now() - w.startedAt > 45000) { w.status = 'done'; complete(s, { ...w, date: n.date }); changed = true; }
    });
    const head = s.walkins.find((w) => w.status === 'waiting');
    if (head && !head.manual) {
      if (!head.seenAt) head.seenAt = Date.now();
      if (Date.now() - head.seenAt > 20000) {
        const free = chairs().find((c) => c.state === 'free');
        if (free) { head.status = 'inchair'; head.barber = free.barber; head.startedAt = Date.now(); changed = true; }
      }
    }
  }
  if (changed) { save(); listeners.forEach((l) => l(state, 'local')); }
  return changed;
}

// ── Shop reservations (click & collect) ────────────────────────────────────
export function reserve({ name, phone, items }) {
  let r;
  update((s) => {
    const total = items.reduce((n, i) => n + PRODUCTS.find((p) => p.id === i.id).price * i.qty, 0);
    r = { id: `r${Date.now()}`, no: s.reservations.length + 1, items, total, name, phone, at: shopNow().epoch, status: 'new' };
    s.reservations.push(r);
    items.forEach((i) => { s.stock[i.id] = Math.max(0, (s.stock[i.id] ?? 0) - i.qty); });
    s.cart = []; touchClient(s, { name, phone });
  });
  return r;
}

// ── Insights (history + today's live data) ─────────────────────────────────
export function insights() {
  const n = shopNow();
  const todayDone = state.bookings.filter((b) => b.date === n.date && b.status === 'done');
  const walkDone = state.walkins.filter((w) => w.status === 'done');
  const todayRev = todayDone.reduce((a, b) => a + b.total, 0) + walkDone.reduce((a, w) => a + w.total, 0);
  const days = [...state.history, { date: n.date, n: todayDone.length + walkDone.length, rev: todayRev, noshow: state.bookings.filter((b) => b.date === n.date && b.status === 'noshow').length, svc: {} }];
  todayDone.forEach((b) => b.services.forEach((id) => { days[days.length - 1].svc[id] = (days[days.length - 1].svc[id] || 0) + 1; }));
  const last = (k) => days.slice(-k);
  const sum = (arr, f) => arr.reduce((a, d) => a + f(d), 0);
  const svc = {};
  days.forEach((d) => Object.entries(d.svc).forEach(([id, c]) => { svc[id] = (svc[id] || 0) + c; }));
  const cuts = sum(days, (d) => d.n); const ns = sum(days, (d) => d.noshow);
  const total = days.length;
  const returning = Object.values(state.clients).filter((c) => c.visits >= 2).length;
  return {
    days, today: { rev: todayRev, n: todayDone.length + walkDone.length, booked: state.bookings.filter((b) => b.date === n.date && b.status !== 'cancelled').length },
    week: sum(last(7), (d) => d.rev), prevWeek: sum(days.slice(-14, -7), (d) => d.rev),
    avg: cuts ? Math.round(sum(days, (d) => d.rev) / cuts) : 0, noShowRate: cuts + ns ? ns / (cuts + ns) : 0,
    rebook: Object.keys(state.clients).length ? returning / Object.keys(state.clients).length : 0,
    svc: Object.entries(svc).sort((a, b) => b[1] - a[1]), heat: state.heat, span: total,
  };
}

export const productPrice = (id) => PRODUCTS.find((p) => p.id === id).price;
