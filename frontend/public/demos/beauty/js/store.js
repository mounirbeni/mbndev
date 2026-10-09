// Demo "backend": one JSON document in localStorage, shared by the site and the owner dashboard.
// Every tab listens to the `storage` event, so a booking made on the site shows up on the dashboard
// instantly, and a status change on the dashboard updates the client's "My bookings" view.
import { SHOP, SERVICES, TEAM, PRODUCTS } from './data.js';

const KEY = 'lalla-demo-v1';
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

// ── Services & skills ──────────────────────────────────────────────────────
const svcById = (id) => SERVICES.find((x) => x.id === id);
const teamById = (id) => TEAM.find((x) => x.id === id);
const durOf = (ids) => ids.reduce((n, id) => n + svcById(id).dur, 0);
export const catsOf = (ids) => [...new Set(ids.map((id) => svcById(id).cat))];
/** Can this specialist perform every category in the list? */
export const canDo = (teamId, cats) => cats.every((c) => teamById(teamId).skills.includes(c));
/** Specialists able to perform all the given services. */
export const qualified = (ids) => TEAM.filter((m) => canDo(m.id, catsOf(ids))).map((m) => m.id);

// ── Seed ───────────────────────────────────────────────────────────────────
function rng(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
const sumOf = (ids) => ids.reduce((n, id) => n + svcById(id).price, 0);

function seed() {
  const now = shopNow();
  const today = now.date;
  const R = rng(20260215);

  // 28 days of history (aggregated) so the insights are alive from the first second
  const w = { 0: 0.6, 1: 0.85, 2: 0.85, 3: 0.95, 4: 1, 5: 1.25, 6: 1.5 };
  const mix = { blowdry: 0.1, cutstyle: 0.06, colour: 0.07, balayage: 0.03, keratin: 0.015, hairmask: 0.03, updo: 0.02, manicure: 0.04, gelmani: 0.09, pedi: 0.05, nailart: 0.025, manipedi: 0.06, facial: 0.08, hydrafacial: 0.03, peel: 0.015, eyecare: 0.01, hammam: 0.08, gommage: 0.06, massage: 0.04, massage90: 0.02, makeupday: 0.03, makeupevening: 0.03, bridaltrial: 0.01, browshape: 0.05, browlam: 0.02, lashlift: 0.02, wax: 0.04 };
  const history = [];
  for (let i = 28; i >= 1; i--) {
    const date = addDays(today, -i);
    const day = weekdayOf(date);
    const n = Math.round((20 + R() * 8) * w[day]);
    const svc = {};
    let rev = 0;
    for (let k = 0; k < n; k++) {
      let r = R(); let pick = 'blowdry';
      for (const [id, p] of Object.entries(mix)) { r -= p; if (r <= 0) { pick = id; break; } }
      svc[pick] = (svc[pick] || 0) + 1; rev += svcById(pick).price;
    }
    history.push({ date, n, rev, noshow: R() < 0.5 ? 1 + Math.floor(R() * 2) : 0, svc });
  }
  const heat = Array.from({ length: 7 }, (_, d) => Array.from({ length: 11 }, (_, h) => {
    const hour = 10 + h; // 10:00 … 20:00
    const base = hour >= 14 && hour <= 18 ? 1 : hour >= 11 && hour <= 13 ? 0.75 : 0.4;
    return Math.round(base * w[d] * (3 + R() * 5));
  }));

  // clients
  const D = (n) => addDays(today, -n);
  const clients = {};
  [['0612345678', 'Demo guest', 6, 1780, 62, 0, 0, 11], ['0661223344', 'Salma Berrada', 18, 5900, 118, 1, 0, 3], ['0677889900', 'Hind Kabbaj', 34, 12400, 148, 3, 0, 5],
    ['0655443322', 'Yasmine Lahlou', 9, 2100, 41, 0, 0, 9], ['0644221100', 'Nouha Rhazi', 22, 7300, 96, 2, 1, 2], ['0633112233', 'Rania Tazi', 7, 1650, 34, 0, 0, 7],
    ['0622334455', 'Imane Mansouri', 3, 940, 18, 0, 0, 21], ['0611998877', 'Meryem El Idrissi', 17, 5200, 77, 2, 0, 4], ['0699887766', 'Ghita Chraibi', 11, 3400, 52, 1, 0, 6],
    ['0688776655', 'Lamia Ouazzani', 1, 350, 7, 0, 1, 34], ['0677665544', 'Soukaina Alaoui', 25, 8800, 131, 3, 0, 1], ['0666554433', 'Houda Sbai', 8, 2400, 30, 1, 0, 15]]
    .forEach(([ph, name, visits, spent, points, rewards, noShows, last]) => {
      clients[ph] = { name, phone: ph, since: D(60 + visits * 6), visits, spent, stamps: points, rewards, noShows, last: D(last), notes: '' };
    });
  clients['0661223344'].notes = 'Prefers Salma. Sensitive scalp — fragrance-free products.';
  clients['0677889900'].notes = 'Gel nails every 3 weeks with Kenza. Loves rose tea.';

  // today's bookings: [specialist, start, services, name, phone]
  const plan = [
    ['salma', 600, ['colour'], 'Salma Berrada', '0661223344'], ['meriem', 600, ['cutstyle'], 'Yasmine Lahlou', '0655443322'], ['kenza', 660, ['gelmani'], 'Hind Kabbaj', '0677889900'],
    ['hajar', 660, ['hammam'], 'Nadia Fassi', '0600000001'], ['imane', 660, ['facial'], 'Rania Tazi', '0633112233'], ['nada', 720, ['makeupday'], 'Kawtar Benjelloun', '0600000002'],
    ['zineb', 720, ['massage'], 'Siham Naciri', '0600000003'], ['meriem', 690, ['blowdry'], 'Ghita Chraibi', '0699887766'], ['kenza', 750, ['pedi'], 'Imane Mansouri', '0622334455'],
    ['hajar', 780, ['gommage'], 'Nouha Rhazi', '0644221100'], ['salma', 810, ['balayage'], 'Ikram Zniber', '0600000004'], ['imane', 780, ['browlam'], 'Wafaa Lamrani', '0600000005'],
    ['nada', 840, ['makeupevening'], 'Meryem El Idrissi', '0611998877'], ['kenza', 840, ['manipedi'], 'Soukaina Alaoui', '0677665544'], ['zineb', 840, ['massage90'], 'Btissam Berrada', '0600000006'],
    ['meriem', 870, ['cutstyle', 'hairmask'], 'Doha Skalli', '0600000007'], ['hajar', 900, ['hammam'], 'Hajar Haddad', '0600000008'], ['imane', 900, ['hydrafacial'], 'Houda Sbai', '0666554433'],
    ['salma', 990, ['blowdry'], 'Chaima Kettani', '0600000009'], ['nada', 960, ['makeupday', 'browshape'], 'Zineb Chami', '0600000010'], ['kenza', 1020, ['gelmani'], 'Lina Fassi', '0600000011'],
    ['zineb', 1020, ['massage'], 'Sanae Bennis', '0600000012'], ['meriem', 1080, ['updo'], 'Oumaima Tahiri', '0600000013'],
  ];
  const bookings = [];
  let seq = 6100;
  const mk = (date, [who, start, services, name, phone]) => {
    const dur = durOf(services);
    const done = epochOf(date, start + dur) <= now.epoch;
    bookings.push({ id: `b${++seq}`, code: `LA-${seq}`, at: epochOf(date, start) - 60 * 24 - Math.floor(R() * 600), date, start, dur, barber: who, anyBarber: false, services, total: sumOf(services), name, phone, note: '', status: done ? 'done' : 'confirmed', source: R() < 0.2 ? 'manual' : 'online', manual: done, seeded: true });
  };
  plan.forEach((p) => mk(today, p));
  [['salma', 600, ['cutstyle'], 'Hind Kabbaj', '0677889900'], ['hajar', 660, ['gommage'], 'Salma Berrada', '0661223344'], ['kenza', 660, ['manipedi'], 'Yasmine Lahlou', '0655443322'],
    ['nada', 720, ['makeupevening'], 'Ghita Chraibi', '0699887766'], ['imane', 780, ['facial'], 'Nouha Rhazi', '0644221100'], ['zineb', 840, ['massage90'], 'Meryem El Idrissi', '0611998877'],
    ['meriem', 900, ['blowdry'], 'Rania Tazi', '0633112233']].forEach((p) => mk(addDays(today, 1), p));

  return {
    v: 1, seq,
    settings: { paused: false, autoConfirm: true, autoFlow: true, buffer: 0, banner: true, bannerText: '', hours: JSON.parse(JSON.stringify(SHOP.hours)), sound: true },
    svc: {}, barbers: {}, stock: Object.fromEntries(PRODUCTS.map((p, i) => [p.id, 5 + ((i * 7) % 11)])),
    bookings, clients,
    requests: [
      { id: 'q1', no: 1, type: 'wedding', date: addDays(today, 41), people: 5, services: ['Bride make-up', 'Hair', 'Hammam'], name: 'Kenza Ouali', phone: '0600112233', note: 'Wedding in Rabat, ceremony at 6 pm. Looking for a home service.', at: now.epoch - 60 * 26, status: 'new' },
      { id: 'q2', no: 2, type: 'henna', date: addDays(today, 12), people: 8, services: ['Make-up', 'Hair'], name: 'Sara Idrissi', phone: '0600445566', note: 'Henna night for a friend.', at: now.epoch - 60 * 50, status: 'contacted' },
    ],
    reservations: [
      { id: 'r1', no: 1, items: [{ id: 'arganoil', qty: 1 }, { id: 'rosewater', qty: 2 }], total: 360, name: 'Hind Kabbaj', phone: '0677889900', at: now.epoch - 60 * 20, status: 'new' },
    ],
    gifts: [{ code: 'LALLA-7Q4K-2M', amount: 500, balance: 500, design: 'rose', to: 'Amina', from: 'Salma', msg: '', at: now.epoch - 60 * 24 * 3 }],
    subs: [{ id: 's1', plan: 'bloom', name: 'Rania Tazi', phone: '0633112233', at: now.epoch - 60 * 24 * 12 }],
    newsletter: ['lina@example.com'],
    history, heat, cart: [], my: { phone: '', ids: [] }, lang: null,
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

// ── Services, team, hours ──────────────────────────────────────────────────
export const svcPrice = (s) => state.svc[s.id]?.price ?? s.price;
export const svcActive = (id) => state.svc[id]?.active !== false;
export const services = () => SERVICES.filter((s) => svcActive(s.id)).map((s) => ({ ...s, price: svcPrice(s) }));
export const dur = (ids) => durOf(ids);
export const priceOf = (ids) => ids.reduce((n, id) => n + svcPrice(svcById(id)), 0);
export const memberWeek = (id) => state.barbers[id]?.week || teamById(id).week;
export const memberOff = (id, date) => !!state.barbers[id]?.off?.[date];
export const memberActive = (id) => state.barbers[id]?.hidden !== true;

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
const busyFor = (who, date, ignoreId) => state.bookings
  .filter((b) => b.barber === who && b.date === date && ACTIVE.has(b.status) && b.id !== ignoreId)
  .map((b) => [b.start, b.start + b.dur + state.settings.buffer]);
const loadOf = (who, date) => state.bookings.filter((b) => b.barber === who && b.date === date && ACTIVE.has(b.status)).length;

function memberWindow(id, date) {
  const hours = state.settings.hours[weekdayOf(date)];
  const sched = memberWeek(id)[weekdayOf(date)];
  if (!hours || !sched || memberOff(id, date) || !memberActive(id)) return null;
  const from = Math.max(hours[0], sched[0]); const to = Math.min(hours[1], sched[1]);
  return to > from ? [from, to] : null;
}

/**
 * Start times (every SHOP.step minutes) that fit `minutes` of chair time.
 * `cats` limits the search to specialists who can perform those categories.
 */
export function slotsFor(date, who, minutes, ignoreId, cats = []) {
  if (state.settings.paused) return [];
  const n = shopNow();
  if (date < n.date || date > addDays(n.date, SHOP.horizon)) return [];
  const pool = who === 'any' ? TEAM.map((m) => m.id) : [who];
  const ids = pool.filter((id) => canDo(id, cats));
  const out = new Map();
  for (const id of ids) {
    const win = memberWindow(id, date);
    if (!win) continue;
    const busy = busyFor(id, date, ignoreId);
    for (let t = win[0]; t + minutes <= win[1]; t += SHOP.step) {
      if (date === n.date && t < n.minutes + SHOP.lead) continue;
      if (busy.some(([a, b]) => t < b && t + minutes > a)) continue;
      if (!out.has(t)) out.set(t, []);
      out.get(t).push(id);
    }
  }
  return [...out.entries()].sort((a, b) => a[0] - b[0]).map(([start, who2]) => ({ start, barbers: who2 }));
}

export function nextFree(who, minutes = 30, cats = []) {
  const n = shopNow();
  for (let k = 0; k <= SHOP.horizon; k++) {
    const date = addDays(n.date, k);
    const s = slotsFor(date, who, minutes, undefined, cats);
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
  const g = { code: `LALLA-${part(4)}-${part(2)}`, amount, balance: amount, design, to, from, msg, at: shopNow().epoch };
  update((s) => { s.gifts.push(g); });
  return g;
}

/** Price breakdown for a basket of services (promo, Glow-points reward, gift card). */
export function quote({ services: ids, phone, promo, useReward, gift }) {
  const subtotal = priceOf(ids);
  const c = clientOf(phone);
  const canReward = !!c && c.stamps >= SHOP.pointsForReward;
  const reward = useReward && canReward ? Math.min(SHOP.rewardValue, subtotal) : 0;
  const code = String(promo || '').trim().toUpperCase();
  const pct = SHOP.promo[code] || 0;
  const promoOff = Math.round((subtotal - reward) * pct);
  const afterDiscount = subtotal - reward - promoOff;
  const g = gift ? giftBalance(gift) : null;
  const giftUsed = g ? Math.min(g.balance, afterDiscount) : 0;
  return { subtotal, reward, canReward, promoOff, promoOk: pct > 0, giftUsed, giftCode: g?.code || '', total: afterDiscount - giftUsed };
}

// ── Bookings ───────────────────────────────────────────────────────────────
const pickMember = (date, candidates) => [...candidates].sort((a, b) => loadOf(a, date) - loadOf(b, date))[0];

/** Create a booking. Re-checks the slot, so two people can never take the same specialist. */
export function book(d) {
  const minutes = durOf(d.services);
  const cats = catsOf(d.services);
  if (d.barber !== 'any' && !canDo(d.barber, cats)) return { error: 'skills' };
  const slots = slotsFor(d.date, d.barber, minutes, undefined, cats);
  const slot = slots.find((s) => s.start === d.start);
  if (!slot) return { error: 'taken' };
  const who = d.barber === 'any' ? pickMember(d.date, slot.barbers) : d.barber;
  const q = quote({ services: d.services, phone: d.phone, promo: d.promo, useReward: d.useReward, gift: d.gift });
  let saved;
  update((s) => {
    const n = ++s.seq;
    saved = { id: `b${n}`, code: `LA-${n}`, at: shopNow().epoch, date: d.date, start: d.start, dur: minutes, barber: who, anyBarber: d.barber === 'any', services: d.services, total: q.total, listed: q.subtotal, reward: q.reward, usedReward: q.reward > 0, promoOff: q.promoOff, giftUsed: q.giftUsed, name: d.name, phone: d.phone, note: d.note || '', status: s.settings.autoConfirm ? 'confirmed' : 'pending', source: d.source || 'online', manual: d.source === 'manual' };
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
  const cats = catsOf(b.services);
  const slot = slotsFor(date, b.anyBarber ? 'any' : b.barber, b.dur, id, cats).find((s) => s.start === start);
  if (!slot) return { error: 'taken' };
  update((s) => {
    const x = s.bookings.find((y) => y.id === id);
    if (x.anyBarber) x.barber = pickMember(date, slot.barbers);
    else if (!slot.barbers.includes(x.barber)) return;
    x.date = date; x.start = start; x.status = s.settings.autoConfirm ? 'confirmed' : 'pending'; x.manual = false;
  });
  return { booking: state.bookings.find((x) => x.id === id) };
}

export const minutesUntil = (b) => epochOf(b.date, b.start) - shopNow().epoch;
export function cancelBooking(id, { owner = false } = {}) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b || !ACTIVE.has(b.status)) return { error: 'missing' };
  if (!owner && minutesUntil(b) < SHOP.cancelHours * 60) return { error: 'late' };
  update((s) => { const x = s.bookings.find((y) => y.id === id); x.status = 'cancelled'; x.manual = true; });
  return { ok: true };
}

/** Credit the client (visit, spend, Glow points) when a visit is completed. */
function complete(s, b) {
  const c = touchClient(s, b);
  if (!c) return;
  c.visits += 1; c.spent += b.total; c.last = b.date || shopNow().date;
  if (b.usedReward) { c.stamps = Math.max(0, c.stamps - SHOP.pointsForReward); c.rewards += 1; }
  c.stamps += Math.floor(b.total / SHOP.pointsPerMad);
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

/** Who is working right now, and who is with a client. */
export function floor() {
  const n = shopNow();
  return TEAM.map((m) => {
    const win = memberWindow(m.id, n.date);
    const working = !!win && n.minutes >= win[0] && n.minutes < win[1] && memberActive(m.id);
    const cur = state.bookings.find((x) => x.barber === m.id && x.date === n.date && ACTIVE.has(x.status) && x.status !== 'pending'
      && (x.status === 'inchair' || (n.minutes >= x.start && n.minutes < x.start + x.dur)));
    const next = state.bookings.filter((x) => x.barber === m.id && x.date === n.date && ACTIVE.has(x.status) && x.start > n.minutes).sort((p, q) => p.start - q.start)[0];
    return { member: m.id, state: !working ? 'off' : cur ? 'busy' : 'free', until: cur ? cur.start + cur.dur : null, next: next ? next.start : null, with: cur || null };
  });
}

// ── Demo flow: the day moves along on its own unless the owner has touched a row ──
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
  }
  if (changed) { save(); listeners.forEach((l) => l(state, 'local')); }
  return changed;
}

// ── Bridal & event requests ────────────────────────────────────────────────
export function addRequest({ type, date, people, services: list, name, phone, note }) {
  let r;
  update((s) => {
    r = { id: `q${Date.now()}`, no: s.requests.length + 1, type, date, people, services: list, name, phone, note: note || '', at: shopNow().epoch, status: 'new' };
    s.requests.push(r); touchClient(s, { name, phone });
  });
  return r;
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
  const todayRev = todayDone.reduce((a, b) => a + b.total, 0);
  const days = [...state.history, { date: n.date, n: todayDone.length, rev: todayRev, noshow: state.bookings.filter((b) => b.date === n.date && b.status === 'noshow').length, svc: {} }];
  todayDone.forEach((b) => b.services.forEach((id) => { days[days.length - 1].svc[id] = (days[days.length - 1].svc[id] || 0) + 1; }));
  const last = (k) => days.slice(-k);
  const sum = (arr, f) => arr.reduce((a, d) => a + f(d), 0);
  const svc = {};
  days.forEach((d) => Object.entries(d.svc).forEach(([id, c]) => { svc[id] = (svc[id] || 0) + c; }));
  const cuts = sum(days, (d) => d.n); const ns = sum(days, (d) => d.noshow);
  const returning = Object.values(state.clients).filter((c) => c.visits >= 2).length;
  return {
    days, today: { rev: todayRev, n: todayDone.length, booked: state.bookings.filter((b) => b.date === n.date && b.status !== 'cancelled').length },
    week: sum(last(7), (d) => d.rev), prevWeek: sum(days.slice(-14, -7), (d) => d.rev),
    avg: cuts ? Math.round(sum(days, (d) => d.rev) / cuts) : 0, noShowRate: cuts + ns ? ns / (cuts + ns) : 0,
    rebook: Object.keys(state.clients).length ? returning / Object.keys(state.clients).length : 0,
    svc: Object.entries(svc).sort((a, b) => b[1] - a[1]), heat: state.heat, span: days.length,
  };
}
