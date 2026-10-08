// Demo "backend": one JSON document in localStorage, shared by the site and the owner dashboard.
// Every tab listens to the `storage` event, so an order placed on the site shows up on the
// dashboard instantly, and a status change on the dashboard updates the guest's tracker.
import { CAFE, MENU, EVENTS } from './data.js';

const KEY = 'nour-demo-v1';
const listeners = new Set();
let state = load();

function seed() {
  const now = Date.now();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const at = (h, m) => today.getTime() + (h * 60 + m) * 60000;
  const pick = (id, qty = 1) => { const m = MENU.find((x) => x.id === id); return { id, kind: 'menu', name: m.name.en, qty, unit: m.price, opts: {} }; };
  const past = [
    ['Yasmine', 'pickup', [pick('flat'), pick('croissant')], 8, 5], ['Karim', 'table', [pick('capp', 2), pick('almondcr')], 8, 20],
    ['Lina', 'pickup', [pick('icedlatte'), pick('banana')], 8, 42], ['Omar', 'delivery', [pick('latte', 2), pick('avo')], 9, 10],
    ['Sara', 'table', [pick('shak'), pick('atay')], 9, 35], ['Mehdi', 'pickup', [pick('esp', 2)], 10, 2],
    ['Nadia', 'pickup', [pick('spanish'), pick('bun')], 10, 30], ['Hamza', 'table', [pick('v60'), pick('msemen')], 11, 5],
    ['Imane', 'pickup', [pick('blossom'), pick('painchoc')], 11, 48], ['Youssef', 'table', [pick('eggs'), pick('flat')], 12, 15],
    ['Salma', 'delivery', [pick('matcha', 2), pick('granola')], 12, 50], ['Rayan', 'pickup', [pick('tonic')], 13, 40],
  ];
  let seq = 1040;
  const orders = past
    .map(([name, mode, items, h, m]) => {
      const t = at(h, m);
      if (t > now - 10 * 60000) return null; // only orders that are already in the past
      const subtotal = items.reduce((n, i) => n + i.unit * i.qty, 0);
      const fee = mode === 'delivery' ? CAFE.deliveryFee : 0;
      return { id: `o${t}`, no: ++seq, at: t, items, subtotal, discount: 0, fee, total: subtotal + fee, mode, table: mode === 'table' ? String(3 + (seq % 9)) : '', address: mode === 'delivery' ? 'Rue Ibnou Mounir, Maârif' : '', name, phone: '06 00 00 00 00', pay: seq % 2 ? 'card' : 'counter', status: 'collected', manual: true, stamps: items.length, seeded: true };
    })
    .filter(Boolean);
  return {
    v: 1, seq,
    settings: { paused: false, banner: true, bannerText: '', wait: 6, todayBean: 'guji', autoAdvance: true, hours: { ...CAFE.hours }, sound: true },
    menu: {}, // per item: { soldOut, price, hidden }
    orders,
    members: {
      '0612345678': { name: 'Demo guest', stamps: 7, since: now - 1000 * 3600 * 24 * 74, visits: 16, rewards: 1 },
      '0661223344': { name: 'Yasmine', stamps: 3, since: now - 1000 * 3600 * 24 * 21, visits: 4, rewards: 0 },
      '0677889900': { name: 'Karim', stamps: 8, since: now - 1000 * 3600 * 24 * 130, visits: 27, rewards: 2 },
    },
    gifts: [{ code: 'NOUR-7Q4K-2M', amount: 200, design: 'zellige', to: 'Amine', from: 'Sara', msg: '', at: now - 86400000 * 3 }],
    bookings: [],
    quotes: [{ id: 'q1', company: 'Atlas Studio', people: 40, date: '', type: 'office', name: 'Rachid', phone: '06 11 22 33 44', at: now - 86400000 }],
    subs: [{ id: 's1', bean: 'huila', size: '250', grind: 'espresso', plan: 'w2', name: 'Mehdi', phone: '06 55 44 33 22', at: now - 86400000 * 12 }],
    newsletter: ['lina@example.com', 'omar@example.com'],
    cart: [], myOrders: [], lang: null, myPhone: '',
  };
}

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

export function update(fn) {
  fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l(state, 'local'));
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

window.addEventListener('storage', (e) => {
  if (e.key !== KEY || !e.newValue) return;
  try { state = JSON.parse(e.newValue); } catch { return; }
  listeners.forEach((l) => l(state, 'remote'));
});

export function resetDemo() {
  state = seed();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l(state, 'local'));
}

// ── Menu helpers (owner overrides) ─────────────────────────────────────────
export const itemState = (id) => state.menu[id] || {};
export const priceOf = (item) => (itemState(item.id).price ?? item.price);
export const isSoldOut = (id) => !!itemState(id).soldOut;

// ── Orders ────────────────────────────────────────────────────────────────
export const STATUSES = ['received', 'brewing', 'ready', 'collected'];

/** Demo flow: orders move along on their own unless the owner has touched them. */
export function autoStatus(o, now = Date.now()) {
  if (o.manual || !state.settings.autoAdvance) return o.status;
  const age = (now - o.at) / 1000;
  const slow = o.mode === 'delivery' ? 2 : 1;
  if (age < 12) return 'received';
  if (age < 40 * slow) return 'brewing';
  if (age < 240 * slow) return 'ready';
  return 'collected';
}

export function tick() {
  const now = Date.now();
  let changed = false;
  state.orders.forEach((o) => {
    const s = autoStatus(o, now);
    if (s !== o.status && STATUSES.indexOf(s) > STATUSES.indexOf(o.status)) { o.status = s; changed = true; }
  });
  if (changed) update(() => {});
}

export const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^212/, '0');

export function placeOrder(o) {
  let saved;
  update((s) => {
    const no = ++s.seq;
    saved = { ...o, id: `o${Date.now()}`, no, at: Date.now(), status: 'received', manual: false };
    s.orders.push(saved);
    s.myOrders = [saved.id, ...s.myOrders].slice(0, 5);
    // loyalty: one stamp per drink; a used reward resets the card
    const key = digits(o.phone);
    if (key.length >= 9) {
      const m = s.members[key] || (s.members[key] = { name: o.name, stamps: 0, since: Date.now(), visits: 0, rewards: 0 });
      if (o.usedReward) { m.stamps = Math.max(0, m.stamps - CAFE.stampsForReward); m.rewards += 1; }
      m.stamps += o.stamps; m.visits += 1; m.name = m.name || o.name;
      s.myPhone = key;
    }
    s.cart = [];
  });
  return saved;
}

export function setStatus(id, status) {
  update((s) => { const o = s.orders.find((x) => x.id === id); if (o) { o.status = status; o.manual = true; } });
}

// ── Events: next date of each weekly event, seats left ─────────────────────
export function nextDate(ev, from = new Date()) {
  const d = new Date(from); d.setHours(0, 0, 0, 0);
  const add = (ev.dow - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + add);
  d.setMinutes(ev.at);
  if (d.getTime() < from.getTime()) d.setDate(d.getDate() + 7);
  return d;
}
export function seatsLeft(ev) {
  const booked = state.bookings.filter((b) => b.event === ev.id).reduce((n, b) => n + b.seats, 0);
  return Math.max(0, ev.seats - ev.taken - booked);
}
export const eventById = (id) => EVENTS.find((e) => e.id === id);

// ── Opening hours (Africa/Casablanca) ──────────────────────────────────────
export function cafeNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: CAFE.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}
export function openState() {
  const { day, minutes } = cafeNow();
  const hours = state.settings.hours;
  const today = hours[day];
  if (today && minutes >= today[0] && minutes < today[1]) return { open: true, until: today[1], soon: today[1] - minutes <= 45 };
  for (let k = 0; k < 8; k++) {
    const d = (day + k) % 7;
    const h = hours[d];
    if (h && (k > 0 || minutes < h[0])) return { open: false, day: d, k, at: h[0] };
  }
  return { open: false };
}
export const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
