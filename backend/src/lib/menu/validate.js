// MBN Menu — pure validation helpers (no DB). Everything a restaurant owner or a
// guest sends is cleaned here, and order totals are always recomputed from the
// saved menu so a guest can never set their own prices.

const crypto = require('crypto');

const LANGUAGES = ['en', 'fr', 'es', 'pt', 'it', 'de', 'ar'];
const CURRENCIES = ['EUR', 'MAD', 'USD', 'GBP', 'CHF'];
const PAYMENTS = ['card', 'cash', 'mbway', 'bizum', 'applepay', 'googlepay', 'paypal', 'satispay', 'ticket'];
const LIMITS = { categories: 30, items: 400, options: 10, extras: 10, orderLines: 40, qty: 20 };

class MenuError extends Error {
  constructor(message) { super(message); this.status = 400; }
}

const newId = () => crypto.randomBytes(6).toString('hex');
const cleanId = (v) => (typeof v === 'string' && /^[a-z0-9]{1,24}$/i.test(v) ? v : newId());
const text = (v, max) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(/\s+/g, ' ').trim().slice(0, max) : '');
const longText = (v, max) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '');
const money = (v, min, max) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.min(max, Math.max(min, n)) * 100) / 100;
};
const bool = (v) => v === true || v === 'true' || v === 1;

/** { en: 'Soup', xx: '…' } → only supported languages, trimmed, empty ones dropped. */
function localized(v, max, multiline = false) {
  const out = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const lang of LANGUAGES) {
    const s = multiline ? longText(v[lang], max) : text(v[lang], max);
    if (s) out[lang] = s;
  }
  return out;
}

/** Opening hours: { "0".."6": [[openMin, closeMin], …] } — close may pass midnight (≤ 30:00). */
function cleanHours(v) {
  const out = {};
  for (let d = 0; d < 7; d++) {
    const ranges = Array.isArray(v?.[d]) ? v[d] : Array.isArray(v?.[String(d)]) ? v[String(d)] : [];
    out[d] = ranges.slice(0, 3)
      .map((r) => [Math.round(Number(r?.[0])), Math.round(Number(r?.[1]))])
      .filter(([o, c]) => Number.isFinite(o) && Number.isFinite(c) && o >= 0 && o < 1440 && c > o && c <= 1800)
      .sort((a, b) => a[0] - b[0]);
  }
  return out;
}

const photoId = (v) => (typeof v === 'string' && /^[a-z0-9]{10,40}$/i.test(v) ? v : null);

function cleanChoice(list, minPrice, max) {
  return (Array.isArray(list) ? list : []).slice(0, max).map((o) => ({
    id: cleanId(o?.id),
    name: localized(o?.name, 60),
    price: money(o?.price, minPrice, 10000),
  })).filter((o) => Object.keys(o.name).length);
}

function cleanItem(it) {
  const allergens = [...new Set((Array.isArray(it?.allergens) ? it.allergens : []).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 14))].sort((a, b) => a - b);
  const kcal = Number(it?.kcal);
  return {
    id: cleanId(it?.id),
    name: localized(it?.name, 80),
    desc: localized(it?.desc, 300, true),
    price: money(it?.price, 0, 100000),
    photo: photoId(it?.photo),
    allergens,
    veg: bool(it?.veg) || bool(it?.vegan),
    vegan: bool(it?.vegan),
    spicy: Math.max(0, Math.min(3, Math.round(Number(it?.spicy) || 0))),
    chef: bool(it?.chef),
    isNew: bool(it?.isNew),
    available: it?.available === undefined ? true : bool(it.available),
    kcal: Number.isFinite(kcal) && kcal > 0 && kcal < 10000 ? Math.round(kcal) : null,
    options: cleanChoice(it?.options, -10000, LIMITS.options),
    extras: cleanChoice(it?.extras, 0, LIMITS.extras),
  };
}

/** The whole menu document. Items without a name in any language are dropped. */
function cleanMenu(menu) {
  let total = 0;
  const categories = (Array.isArray(menu?.categories) ? menu.categories : []).slice(0, LIMITS.categories).map((c) => {
    const items = [];
    for (const raw of Array.isArray(c?.items) ? c.items : []) {
      if (total >= LIMITS.items) break;
      const it = cleanItem(raw);
      if (!Object.keys(it.name).length) continue;
      items.push(it); total++;
    }
    return { id: cleanId(c?.id), name: localized(c?.name, 60), items };
  }).filter((c) => Object.keys(c.name).length || c.items.length);
  // ids must be unique — duplicates (e.g. a pasted dish) get a fresh one
  const seen = new Set();
  for (const c of categories) {
    if (seen.has(c.id)) c.id = newId();
    seen.add(c.id);
    for (const it of c.items) { if (seen.has(it.id)) it.id = newId(); seen.add(it.id); }
  }
  return { categories };
}

/** Photo ids a menu/restaurant still points to. */
function photoIdsIn(restaurant) {
  const ids = new Set([restaurant.logoPhotoId, restaurant.coverPhotoId].filter(Boolean));
  for (const c of restaurant.menu?.categories || []) for (const it of c.items || []) if (it.photo) ids.add(it.photo);
  return ids;
}

const URL_RE = /^https?:\/\/[^\s/$.?#][^\s]*$/i;
const PHONE_RE = /^\+?[0-9 ().-]{6,24}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

function validTimezone(tz) {
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch { return false; }
}

/** Owner edit of the restaurant's details → Prisma data. Throws MenuError on bad input. */
function cleanRestaurantPatch(b = {}, current = {}) {
  const data = {};
  if (b.name !== undefined) {
    const name = text(b.name, 80);
    if (!name) throw new MenuError('Give the restaurant a name.');
    data.name = name;
  }
  if (b.tagline !== undefined) data.tagline = localized(b.tagline, 140);
  if (b.about !== undefined) data.about = localized(b.about, 800, true);
  if (b.color !== undefined) {
    if (!/^#[0-9a-f]{6}$/i.test(b.color)) throw new MenuError('Colour must look like #1f4fd1.');
    data.color = b.color.toLowerCase();
  }
  if (b.languages !== undefined) {
    const langs = [...new Set((Array.isArray(b.languages) ? b.languages : []).filter((l) => LANGUAGES.includes(l)))];
    if (!langs.length) throw new MenuError('Choose at least one menu language.');
    data.languages = langs;
  }
  const langs = data.languages || current.languages || ['en'];
  if (b.defaultLanguage !== undefined || data.languages) {
    const def = b.defaultLanguage ?? current.defaultLanguage;
    data.defaultLanguage = langs.includes(def) ? def : langs[0];
  }
  if (b.currency !== undefined) {
    if (!CURRENCIES.includes(b.currency)) throw new MenuError(`Currency must be one of ${CURRENCIES.join(', ')}.`);
    data.currency = b.currency;
  }
  if (b.timezone !== undefined) {
    const tz = text(b.timezone, 60);
    if (!validTimezone(tz)) throw new MenuError('Unknown time zone.');
    data.timezone = tz;
  }
  for (const [field, max, re, label] of [
    ['address', 200, null, 'address'], ['phone', 24, PHONE_RE, 'phone number'], ['whatsapp', 24, PHONE_RE, 'WhatsApp number'],
    ['email', 120, EMAIL_RE, 'email'], ['instagram', 60, /^@?[A-Za-z0-9._]{1,30}$/, 'Instagram handle'], ['website', 200, URL_RE, 'website (start with https://)'],
    ['wifiName', 60, null, 'Wi-Fi name'], ['wifiPassword', 60, null, 'Wi-Fi password'],
  ]) {
    if (b[field] === undefined) continue;
    const v = text(b[field], max);
    if (v && re && !re.test(v)) throw new MenuError(`That ${label} doesn't look right.`);
    data[field] = v ? (field === 'instagram' ? v.replace(/^@/, '') : v) : null;
  }
  for (const field of ['logoPhotoId', 'coverPhotoId']) if (b[field] !== undefined) data[field] = photoId(b[field]);
  if (b.hours !== undefined) data.hours = cleanHours(b.hours);
  if (b.payments !== undefined) data.payments = [...new Set((Array.isArray(b.payments) ? b.payments : []).filter((p) => PAYMENTS.includes(p)))];
  for (const field of ['ordering', 'booking', 'waiterCall', 'active']) if (b[field] !== undefined) data[field] = bool(b[field]);
  if (b.coverCharge !== undefined) data.coverCharge = money(b.coverCharge, 0, 50);
  if (b.menu !== undefined) data.menu = cleanMenu(b.menu);
  return data;
}

/**
 * Guest order lines → priced items from the saved menu.
 * lines: [{ itemId, optionId?, extraIds?: [], qty, note? }]
 */
function priceOrder(menu, lines) {
  if (!Array.isArray(lines) || !lines.length) throw new MenuError('The order is empty.');
  if (lines.length > LIMITS.orderLines) throw new MenuError('That order is too long — please ask the staff.');
  const byId = new Map();
  for (const c of menu?.categories || []) for (const it of c.items || []) byId.set(it.id, it);
  const items = [];
  let total = 0;
  for (const l of lines) {
    const it = byId.get(String(l?.itemId || ''));
    if (!it || it.available === false) throw new MenuError('A dish in your order is no longer available. Please check your order.');
    const qty = Math.round(Number(l?.qty));
    if (!(qty >= 1 && qty <= LIMITS.qty)) throw new MenuError('Quantities must be between 1 and 20.');
    let option = null;
    if (it.options?.length) {
      option = it.options.find((o) => o.id === l?.optionId) || it.options[0];
    }
    const extraIds = [...new Set(Array.isArray(l?.extraIds) ? l.extraIds.map(String) : [])];
    const extras = (it.extras || []).filter((e) => extraIds.includes(e.id));
    const unit = Math.round((it.price + (option?.price || 0) + extras.reduce((s, e) => s + e.price, 0)) * 100) / 100;
    total += unit * qty;
    items.push({
      itemId: it.id, name: it.name, qty, unit,
      option: option ? { id: option.id, name: option.name } : null,
      extras: extras.map((e) => ({ id: e.id, name: e.name })),
      note: text(l?.note, 80) || null,
    });
  }
  return { items, total: Math.round(total * 100) / 100 };
}

/** Today's date (YYYY-MM-DD) and minute-of-day in the restaurant's time zone. */
function localNow(timezone, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** Booking slots (every 30 min, last one an hour before closing) for a weekday. */
function slotsFor(hours, weekday) {
  const out = [];
  for (const [o, c] of hours?.[weekday] || []) for (let m = Math.ceil(o / 30) * 30; m <= c - 60; m += 30) out.push(m);
  return out;
}
const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Validates a booking against the opening hours. Returns { date, time, guests }. */
function cleanBooking(b, restaurant, now = new Date()) {
  const date = String(b?.date || '');
  const time = String(b?.time || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) throw new MenuError('Choose a date.');
  if (!/^\d{2}:\d{2}$/.test(time)) throw new MenuError('Choose a time.');
  const guests = Math.round(Number(b?.guests));
  if (!(guests >= 1 && guests <= 30)) throw new MenuError('Bookings are for 1 to 30 guests.');
  const today = localNow(restaurant.timezone || 'UTC', now);
  const days = (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today.date}T12:00:00Z`)) / 86400000;
  if (days < 0 || days > 90) throw new MenuError('Bookings are open for the next 90 days.');
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const [h, m] = time.split(':').map(Number);
  const minutes = h * 60 + m;
  if (!slotsFor(restaurant.hours, weekday).includes(minutes)) throw new MenuError('That time is not available — please choose another.');
  if (days === 0 && minutes < today.minutes + 30) throw new MenuError('That time has passed — please choose a later one.');
  return { date, time, guests };
}

const tableLabel = (v) => text(v, 12).replace(/[^\p{L}\p{N} -]/gu, '') || null;

module.exports = {
  LANGUAGES, CURRENCIES, PAYMENTS, LIMITS, MenuError,
  localized, cleanHours, cleanMenu, cleanRestaurantPatch, photoIdsIn,
  priceOrder, cleanBooking, slotsFor, localNow, hhmm, tableLabel, text,
};
