// Demo "backend": one JSON document in localStorage, shared by the site and the owner dashboard.
// Every tab listens to the `storage` event, so an appointment booked on the site shows up on the dashboard
// instantly, and a case stage changed on the dashboard updates the client's "Track my case" page.
import { SHOP, MEETINGS, AREAS, TEAM, STAGES } from './data.js';

const KEY = 'alaoui-demo-v1';
const listeners = new Set();

// ── Office clock ───────────────────────────────────────────────────────────
export const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const ymd = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
const dateOf = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const addDays = (s, n) => { const d = dateOf(s); d.setUTCDate(d.getUTCDate() + n); return ymd(d); };
export const weekdayOf = (s) => dateOf(s).getUTCDay();
/** Minutes since 1970 in the office's local time. */
export const epochOf = (s, m) => dateOf(s).getTime() / 60000 + m;
export const parseHm = (v) => { const [h, m] = String(v).split(':').map(Number); return (h || 0) * 60 + (m || 0); };

export function shopNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: SHOP.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t) => Number(parts.find((p) => p.type === t).value);
  const date = `${g('year')}-${String(g('month')).padStart(2, '0')}-${String(g('day')).padStart(2, '0')}`;
  const minutes = g('hour') * 60 + g('minute');
  return { date, minutes, day: weekdayOf(date), epoch: epochOf(date, minutes) };
}

// ── Meetings, areas & skills ───────────────────────────────────────────────
const meetingById = (id) => MEETINGS.find((x) => x.id === id);
const teamById = (id) => TEAM.find((x) => x.id === id);
/** Can this lawyer take matters in this practice area? */
export const canDo = (memberId, area) => !area || teamById(memberId).skills.includes(area);
/** Lawyers who practise the given area. */
export const qualified = (area) => TEAM.filter((m) => canDo(m.id, area)).map((m) => m.id);

// ── Seed ───────────────────────────────────────────────────────────────────
function rng(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
const L3 = (en, fr, ar) => ({ en, fr, ar });

function seed() {
  const now = shopNow();
  const today = now.date;
  const R = rng(20260412);
  const D = (n) => addDays(today, -n);

  // 28 days of history (aggregated) so the insights are alive from the first second
  const w = { 0: 0, 1: 1.1, 2: 1, 3: 1, 4: 1.05, 5: 0.9, 6: 0.45 };
  const mix = { family: 0.26, property: 0.2, labour: 0.16, criminal: 0.1, inheritance: 0.16, debt: 0.12 };
  const history = [];
  for (let i = 28; i >= 1; i--) {
    const date = D(i); const day = weekdayOf(date);
    const n = Math.round((4 + R() * 3) * w[day]);
    const areas = {}; let rev = 0;
    for (let k = 0; k < n; k++) {
      let r = R(); let pick = 'family';
      for (const [id, p] of Object.entries(mix)) { r -= p; if (r <= 0) { pick = id; break; } }
      areas[pick] = (areas[pick] || 0) + 1; rev += [300, 300, 500, 600, 700][Math.floor(R() * 5)];
    }
    const fees = day === 0 ? 0 : Math.round((1500 + R() * 3500) * w[day] / 100) * 100;
    history.push({ date, n, rev: rev + fees, fees, noshow: R() < 0.35 ? 1 : 0, areas });
  }
  const heat = Array.from({ length: 7 }, (_, d) => Array.from({ length: 10 }, (_, h) => {
    const hour = 9 + h;
    const base = hour >= 10 && hour <= 12 ? 1 : hour >= 15 && hour <= 17 ? 0.9 : hour === 13 || hour === 14 ? 0.45 : 0.6;
    return Math.round(base * w[d] * (2 + R() * 4));
  }));

  // clients: [phone, name, email, visits, spent, noShows, lastDaysAgo, notes]
  const clients = {};
  [
    ['0661223344', 'Salma Berrada', 'salma.b@example.com', 5, 3900, 0, 6, 'Prefers Arabic. Calls after 18:00.'],
    ['0655443322', 'Yassine Lahlou', 'y.lahlou@example.com', 3, 1700, 0, 12, ''],
    ['0677889900', 'Hind Kabbaj', 'hind.k@example.com', 4, 2600, 0, 3, 'Founder — retainer prospect (Business plan).'],
    ['0699887766', 'Omar Chraibi', '', 2, 900, 0, 19, ''],
    ['0622334455', 'Imane Mansouri', 'imane.m@example.com', 6, 5200, 0, 2, 'Long-standing client. Two active files.'],
    ['0644221100', 'Nouha Rhazi', '', 1, 300, 0, 24, ''],
    ['0633112233', 'Rania Tazi', 'rania.tazi@example.com', 3, 2100, 1, 9, ''],
    ['0666554433', 'Houda Sbai', '', 2, 1300, 0, 15, ''],
    ['0611998877', 'Karim El Idrissi', 'k.elidrissi@example.com', 4, 3000, 0, 5, 'Lives in Lyon — video only.'],
    ['0688776655', 'Lamia Ouazzani', '', 1, 600, 0, 30, ''],
    ['0600000001', 'Mehdi Fassi', '', 2, 1000, 0, 8, ''],
    ['0600000002', 'Ghita Skalli', 'ghita.s@example.com', 1, 300, 0, 17, ''],
  ].forEach(([ph, name, email, visits, spent, noShows, last, notes]) => {
    clients[ph] = { name, phone: ph, email, since: D(60 + visits * 18), visits, spent, matters: 0, noShows, last: D(last), notes };
  });

  // today's appointments: [lawyer, start, meeting, area, mode, name, phone]
  const plan = [
    ['alaoui', 540, 'review', 'property', 'office', 'Hind Kabbaj', '0677889900'], ['alaoui', 840, 'initial', 'family', 'office', 'Rania Tazi', '0633112233'],
    ['alaoui', 900, 'contract', 'property', 'video', 'Omar Chraibi', '0699887766'], ['alaoui', 990, 'initial', 'labour', 'phone', 'Mehdi Fassi', '0600000001'],
    ['alaoui', 1020, 'urgent', 'criminal', 'office', 'Yassine Lahlou', '0655443322'],
  ];
  const bookings = [];
  let seq = 4200;
  const mk = (date, [who, start, meeting, area, mode, name, phone]) => {
    const m = meetingById(meeting); const done = epochOf(date, start + m.dur) <= now.epoch;
    bookings.push({ id: `b${++seq}`, code: `RV-${seq}`, at: epochOf(date, start) - 60 * 24 - Math.floor(R() * 600), date, start, dur: m.dur, member: who, anyMember: false, meeting, area, mode, total: m.price, name, phone, email: '', note: '', status: done ? 'done' : 'confirmed', source: 'online', manual: false });
  };
  plan.forEach((p) => mk(today, p));
  [['alaoui', 570, 'initial', 'family', 'office', 'Hind Kabbaj', '0677889900'], ['alaoui', 660, 'review', 'inheritance', 'video', 'Salma Berrada', '0661223344'], ['alaoui', 840, 'contract', 'property', 'office', 'Yassine Lahlou', '0655443322'],
    ['alaoui', 930, 'initial', 'debt', 'office', 'Omar Chraibi', '0699887766'], ['alaoui', 990, 'initial', 'labour', 'video', 'Rania Tazi', '0633112233']]
    .forEach((p) => mk(addDays(today, 1), p));

  // cases
  const mkCase = (n, ref, phone, name, area, title, lawyer, stage, opened, hearing, docs, updates, notes) => {
    const dates = {}; STAGES.forEach((s, i) => { if (i <= stage) dates[s.id] = addDays(opened, i * 9 + (i ? 2 : 0)); });
    return { id: `c${n}`, ref, phone, name, area, title, lawyer, stage, opened, dates, hearing, docs: docs.map((d, i) => ({ id: `d${n}-${i}`, name: d[0], by: d[1], date: d[2], isNew: false })), updates, notes, closed: stage >= 5 };
  };
  const cases = [
    mkCase(1, 'DOS-2026-0142', '0661223344', 'Salma Berrada', 'inheritance', L3('Estate of the late Mr. Berrada', 'Succession de feu M. Berrada', 'تركة المرحوم بنعبدة'), 'alaoui', 2, D(41), { date: addDays(today, 9), time: '10:30', court: 'family' },
      [['Death certificate.pdf', 'client', D(38)], ['Family record book.pdf', 'client', D(36)], ['Draft heirs statement.docx', 'firm', D(20)]],
      [{ date: D(5), text: L3('Heirs statement filed. The court has set the first hearing.', 'Acte d’hérédité déposé. Le tribunal a fixé la première audience.', 'تم إيداع إراثة الورثة. وحددت المحكمة الجلسة الأولى.') }],
      [{ id: 'n1', date: D(12), text: 'Two heirs abroad; need powers of attorney.', by: 'alaoui' }]),
    mkCase(2, 'DOS-2026-0151', '0677889900', 'Hind Kabbaj', 'property', L3('Commercial lease — Kabbaj Studio premises', 'Bail commercial — locaux Kabbaj Studio', 'عقد كراء تجاري — محلات Kabbaj Studio'), 'alaoui', 1, D(14), null,
      [['Lease draft.pdf', 'client', D(12)], ['Landlord letter.pdf', 'client', D(9)]],
      [{ date: D(3), text: L3('Lease comments sent for your review.', 'Observations sur le bail envoyées pour votre revue.', 'أُرسلت ملاحظات عقد الكراء لمراجعتك.') }],
      [{ id: 'n2', date: D(6), text: 'Landlord asks for a higher deposit. Meeting Thursday.', by: 'alaoui' }]),
    mkCase(3, 'DOS-2026-0133', '0622334455', 'Imane Mansouri', 'property', L3('Purchase of apartment — Ain Diab', 'Achat d’appartement — Ain Diab', 'شراء شقة — عين الذئاب'), 'alaoui', 3, D(55), { date: today, time: '11:00', court: 'tpi' },
      [['Promise to sell.pdf', 'client', D(52)], ['Land title extract.pdf', 'firm', D(47)], ['Notary quote.pdf', 'firm', D(33)]],
      [{ date: D(2), text: L3('The hearing is today at the Court of First Instance. We will update you right after.', 'L’audience est aujourd’hui au tribunal de première instance. Nous vous informons juste après.', 'الجلسة اليوم بالمحكمة الابتدائية. سنوافيك بالمستجدات مباشرة بعدها.') }], []),
    mkCase(4, 'DOS-2026-0160', '0655443322', 'Yassine Lahlou', 'criminal', L3('Defence — traffic accident complaint', 'Défense — plainte accident de la route', 'دفاع — شكاية حادثة سير'), 'alaoui', 3, D(30), { date: addDays(today, 2), time: '14:30', court: 'tpi' },
      [['Police report.pdf', 'client', D(29)], ['Witness statements.pdf', 'firm', D(21)]], [], []),
    mkCase(5, 'DOS-2026-0129', '0633112233', 'Rania Tazi', 'family', L3('Divorce by mutual consent', 'Divorce par consentement mutuel', 'طلاق بالاتفاق'), 'alaoui', 4, D(62), null,
      [['Marriage certificate.pdf', 'client', D(60)], ['Agreement draft.docx', 'firm', D(40)], ['Signed agreement.pdf', 'client', D(25)]],
      [{ date: D(1), text: L3('The judgment has been issued. We are collecting the certified copy.', 'Le jugement a été rendu. Nous récupérons la copie certifiée.', 'صدر الحكم. نقوم بسحب النسخة المصادق عليها.') }], []),
    mkCase(6, 'DOS-2026-0166', '0611998877', 'Karim El Idrissi', 'inheritance', L3('Estate with heirs abroad', 'Succession avec héritiers à l’étranger', 'تركة بورثة بالخارج'), 'alaoui', 1, D(11), null,
      [['Passport copy.pdf', 'client', D(10)], ['Death certificate.pdf', 'client', D(9)]], [{ date: D(4), text: L3('Please upload the powers of attorney signed by your brother abroad.', 'Merci de déposer les procurations signées par votre frère à l’étranger.', 'المرجو رفع التوكيلات الموقعة من أخيك بالخارج.') }], []),
    mkCase(7, 'DOS-2026-0120', '0666554433', 'Houda Sbai', 'labour', L3('Unfair dismissal claim', 'Contentieux licenciement abusif', 'دعوى الفصل التعسفي'), 'alaoui', 3, D(70), { date: addDays(today, 3), time: '09:30', court: 'social' },
      [['Employment contract.pdf', 'client', D(68)], ['Dismissal letter.pdf', 'client', D(68)], ['Payslips 2025.pdf', 'client', D(60)]],
      [{ date: D(8), text: L3('Settlement offer received. Hearing date confirmed.', 'Offre de transaction reçue. Date d’audience confirmée.', 'تم التوصل بعرض تسوية. وتأكد تاريخ الجلسة.') }], []),
    mkCase(8, 'DOS-2026-0148', '0699887766', 'Omar Chraibi', 'debt', L3('Recovery of unpaid invoices — 184,000 MAD', 'Recouvrement de factures impayées — 184 000 MAD', 'استخلاص فواتير غير مؤداة — 184,000 درهم'), 'alaoui', 2, D(36), null,
      [['Invoices 2025.xlsx', 'client', D(35)], ['Formal notice.pdf', 'firm', D(28)]],
      [{ date: D(6), text: L3('Payment order requested from the Commercial Court.', 'Injonction de payer demandée au tribunal de commerce.', 'تم طلب أمر بالأداء من المحكمة التجارية.') }], []),
    mkCase(9, 'DOS-2026-0099', '0600000001', 'Mehdi Fassi', 'labour', L3('Employment contract dispute', 'Litige contrat de travail', 'نزاع حول عقد الشغل'), 'alaoui', 5, D(120), null,
      [['Final agreement.pdf', 'firm', D(30)]], [{ date: D(18), text: L3('The file is closed. Thank you for your trust.', 'Le dossier est clôturé. Merci de votre confiance.', 'تم إغلاق الملف. شكراً على ثقتكم.') }], []),
  ];

  // invoices
  const inv = (n, caseId, phone, amount, desc, date, status) => ({ id: `i${n}`, no: `F-2026-${String(n).padStart(3, '0')}`, caseId, phone, amount, desc, date, status, paidAt: status === 'paid' ? date : '' });
  const invoices = [
    inv(21, 'c1', '0661223344', 6000, L3('Fees — stage 1 (opening and heirs statement)', 'Honoraires — étape 1 (ouverture et acte d’hérédité)', 'أتعاب — المرحلة 1 (فتح الملف وإراثة الورثة)'), D(38), 'paid'),
    inv(22, 'c1', '0661223344', 5000, L3('Fees — stage 2 (court filing)', 'Honoraires — étape 2 (dépôt au tribunal)', 'أتعاب — المرحلة 2 (التقديم للمحكمة)'), D(5), 'due'),
    inv(23, 'c2', '0677889900', 8000, L3('Fees — commercial lease review', 'Honoraires — revue du bail commercial', 'أتعاب — مراجعة عقد الكراء التجاري'), D(9), 'due'),
    inv(24, 'c3', '0622334455', 9000, L3('Fees — sale contract and registration', 'Honoraires — contrat de vente et enregistrement', 'أتعاب — عقد البيع والتسجيل'), D(33), 'paid'),
    inv(25, 'c4', '0655443322', 7500, L3('Fees — defence, first instance', 'Honoraires — défense, première instance', 'أتعاب — الدفاع، الدرجة الأولى'), D(21), 'paid'),
    inv(26, 'c5', '0633112233', 6500, L3('Fees — divorce by mutual consent', 'Honoraires — divorce par consentement mutuel', 'أتعاب — الطلاق بالاتفاق'), D(25), 'paid'),
    inv(27, 'c7', '0666554433', 4000, L3('Fees — dismissal claim, stage 2', 'Honoraires — contentieux licenciement, étape 2', 'أتعاب — دعوى الفصل، المرحلة 2'), D(8), 'due'),
    inv(28, 'c8', '0699887766', 12000, L3('Fees — payment order and enforcement', 'Honoraires — injonction et exécution', 'أتعاب — أمر الأداء والتنفيذ'), D(6), 'due'),
  ];
  cases.forEach((c) => { clients[c.phone].matters += 1; });

  return {
    v: 3, seq, caseSeq: 170, invSeq: 29,
    settings: { paused: false, autoConfirm: true, autoFlow: true, buffer: 0, banner: true, bannerText: '', hours: JSON.parse(JSON.stringify(SHOP.hours)), sound: true },
    meet: {}, members: {},
    bookings, clients, cases, invoices,
    requests: [
      { id: 'q1', no: 1, type: 'callback', name: 'Soukaina Alaoui', phone: '0677665544', area: 'labour', note: 'Dismissed on Friday without notice. Please call after 5 pm.', at: now.epoch - 60 * 3, status: 'new' },
      { id: 'q2', no: 2, type: 'plan', name: 'Atlas Boutique', phone: '0600112233', area: 'debt', note: 'Business plan — small shop, recurring unpaid invoices.', plan: 'business', at: now.epoch - 60 * 26, status: 'contacted' },
    ],
    subs: [], newsletter: ['contact@atlas-studio.example'],
    history, heat, my: { phone: '', ids: [] }, lang: null,
  };
}

let state = load();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 3) return s; }
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
  try { state = JSON.parse(e.newValue); listeners.forEach((l) => l(state, 'remote')); } catch { /* ignore */ }
});
export function resetDemo() { state = seed(); save(); listeners.forEach((l) => l(state, 'local')); }

// ── Meetings & lawyers (with owner overrides) ──────────────────────────────
export const meetPrice = (m) => state.meet[m.id]?.price ?? m.price;
export const meetActive = (id) => state.meet[id]?.active !== false;
export const meetings = () => MEETINGS.filter((m) => meetActive(m.id)).map((m) => ({ ...m, price: meetPrice(m) }));
export const memberWeek = (id) => state.members[id]?.week || teamById(id).week;
export const memberOff = (id, date) => !!state.members[id]?.off?.[date];
export const memberActive = (id) => state.members[id]?.hidden !== true;

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
const ACTIVE = new Set(['pending', 'confirmed', 'arrived', 'inprogress']);
const busyFor = (who, date, ignoreId) => state.bookings
  .filter((b) => b.member === who && b.date === date && ACTIVE.has(b.status) && b.id !== ignoreId)
  .map((b) => [b.start, b.start + b.dur + state.settings.buffer]);
const hearingsOf = (who, date) => state.cases.filter((c) => !c.closed && c.lawyer === who && c.hearing && c.hearing.date === date).map((c) => { const s = parseHm(c.hearing.time); return [s - 30, s + 150]; });
const loadOf = (who, date) => state.bookings.filter((b) => b.member === who && b.date === date && ACTIVE.has(b.status)).length;

function memberWindow(id, date) {
  const hours = state.settings.hours[weekdayOf(date)];
  const sched = memberWeek(id)[weekdayOf(date)];
  if (!hours || !sched || memberOff(id, date) || !memberActive(id)) return null;
  const from = Math.max(hours[0], sched[0]); const to = Math.min(hours[1], sched[1]);
  return to > from ? [from, to] : null;
}

/**
 * Start times (every SHOP.step minutes) that fit `minutes`. `area` limits the search to lawyers who practise it.
 * A lawyer in court (hearing that day) is not offered around the hearing.
 */
export function slotsFor(date, who, minutes, ignoreId, area = '') {
  if (state.settings.paused) return [];
  const n = shopNow();
  if (date < n.date || date > addDays(n.date, SHOP.horizon)) return [];
  const pool = who === 'any' ? TEAM.map((m) => m.id) : [who];
  const ids = pool.filter((id) => canDo(id, area));
  const out = new Map();
  for (const id of ids) {
    const win = memberWindow(id, date);
    if (!win) continue;
    const busy = [...busyFor(id, date, ignoreId), ...hearingsOf(id, date)];
    for (let t = win[0]; t + minutes <= win[1]; t += SHOP.step) {
      if (date === n.date && t < n.minutes + SHOP.lead) continue;
      if (busy.some(([a, b]) => t < b && t + minutes > a)) continue;
      if (!out.has(t)) out.set(t, []);
      out.get(t).push(id);
    }
  }
  return [...out.entries()].sort((a, b) => a[0] - b[0]).map(([start, who2]) => ({ start, members: who2 }));
}

export function nextFree(who, minutes = 30, area = '') {
  const n = shopNow();
  for (let k = 0; k <= SHOP.horizon; k++) {
    const date = addDays(n.date, k);
    const s = slotsFor(date, who, minutes, undefined, area);
    if (s.length) return { date, start: s[0].start, k };
  }
  return null;
}

// ── Clients ────────────────────────────────────────────────────────────────
export const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^212/, '0');
export const clientOf = (phone) => state.clients[digits(phone)] || null;
const touchClient = (s, { name, phone, email }) => {
  const key = digits(phone); if (key.length < 9) return null;
  const c = s.clients[key] || (s.clients[key] = { name, phone: key, email: email || '', since: shopNow().date, visits: 0, spent: 0, matters: 0, noShows: 0, last: '', notes: '' });
  if (email && !c.email) c.email = email;
  return c;
};

// ── Appointments ───────────────────────────────────────────────────────────
const pickMember = (date, candidates) => [...candidates].sort((a, b) => loadOf(a, date) - loadOf(b, date))[0];

/** Create an appointment. Re-checks the slot, so two people can never take the same lawyer. */
export function book(d) {
  const m = meetingById(d.meeting);
  if (d.member !== 'any' && !canDo(d.member, d.area)) return { error: 'skills' };
  const slot = slotsFor(d.date, d.member, m.dur, undefined, d.area).find((s) => s.start === d.start);
  if (!slot) return { error: 'taken' };
  const who = d.member === 'any' ? pickMember(d.date, slot.members) : d.member;
  let saved;
  update((s) => {
    const n = ++s.seq;
    saved = { id: `b${n}`, code: `RV-${n}`, at: shopNow().epoch, date: d.date, start: d.start, dur: m.dur, member: who, anyMember: d.member === 'any', meeting: d.meeting, area: d.area, mode: d.mode, total: meetPrice(m), name: d.name, phone: digits(d.phone), email: d.email || '', note: d.note || '', status: s.settings.autoConfirm ? 'confirmed' : 'pending', source: d.source || 'online', manual: false };
    s.bookings.push(saved);
    if (d.source !== 'manual') { s.my.ids = [saved.id, ...s.my.ids].slice(0, 8); s.my.phone = digits(d.phone); }
    touchClient(s, d);
  });
  return { booking: saved };
}

export function reschedule(id, date, start) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b) return { error: 'missing' };
  const slot = slotsFor(date, b.anyMember ? 'any' : b.member, b.dur, id, b.area).find((s) => s.start === start);
  if (!slot) return { error: 'taken' };
  update((s) => {
    const x = s.bookings.find((y) => y.id === id);
    if (x.anyMember) x.member = pickMember(date, slot.members);
    else if (!slot.members.includes(x.member)) return;
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

function complete(s, b) {
  const c = touchClient(s, b); if (!c) return;
  c.visits += 1; c.spent += b.total; c.last = b.date || shopNow().date;
}
export function setStatus(id, status) {
  update((s) => {
    const b = s.bookings.find((x) => x.id === id); if (!b) return;
    const was = b.status; b.status = status; b.manual = true;
    if (status === 'done' && was !== 'done') complete(s, b);
    if (status === 'noshow' && was !== 'noshow') { const c = touchClient(s, b); if (c) c.noShows += 1; }
  });
}

/** Who is where right now: with a client, in court, free, or off. */
export function floor() {
  const n = shopNow();
  return TEAM.map((m) => {
    const win = memberWindow(m.id, n.date);
    const working = !!win && n.minutes >= win[0] && n.minutes < win[1] && memberActive(m.id);
    const cur = state.bookings.find((x) => x.member === m.id && x.date === n.date && ACTIVE.has(x.status) && x.status !== 'pending'
      && (x.status === 'inprogress' || (n.minutes >= x.start && n.minutes < x.start + x.dur)));
    const court = state.cases.find((c) => !c.closed && c.lawyer === m.id && c.hearing && c.hearing.date === n.date && (() => { const s = parseHm(c.hearing.time); return n.minutes >= s - 20 && n.minutes < s + 150; })());
    const next = state.bookings.filter((x) => x.member === m.id && x.date === n.date && ACTIVE.has(x.status) && x.start > n.minutes).sort((p, q) => p.start - q.start)[0];
    const st = !working ? 'off' : court ? 'court' : cur ? 'busy' : 'free';
    return { member: m.id, state: st, until: cur ? cur.start + cur.dur : null, next: next ? next.start : null, with: cur || null, hearing: court || null };
  });
}

// ── Demo flow: the day moves along on its own unless the owner has touched a row ──
export function tick() {
  const n = shopNow(); const s = state; let changed = false;
  if (s.settings.autoFlow) {
    s.bookings.forEach((b) => {
      if (b.manual || ['pending', 'cancelled', 'noshow', 'done'].includes(b.status)) return;
      const end = epochOf(b.date, b.start + b.dur); const start = epochOf(b.date, b.start);
      if (n.epoch >= end) { b.status = 'done'; complete(s, b); changed = true; }
      else if (n.epoch >= start && b.status !== 'inprogress') { b.status = 'inprogress'; changed = true; }
    });
  }
  if (changed) { save(); listeners.forEach((l) => l(state, 'local')); }
  return changed;
}

// ── Cases (the client's "Track my case" page reads these) ──────────────────
export const caseById = (id) => state.cases.find((c) => c.id === id);
export function findCase(ref, phone) {
  const r = String(ref || '').trim().toUpperCase().replace(/\s+/g, '');
  const p = digits(phone);
  if (r.length < 6 || p.length < 9) return null;
  return state.cases.find((c) => c.ref.toUpperCase() === r && digits(c.phone) === p) || null;
}
export const invoicesOf = (caseId) => state.invoices.filter((i) => i.caseId === caseId);
export function openCase({ name, phone, area, title, lawyer }) {
  let c;
  update((s) => {
    const n = ++s.caseSeq; const today = shopNow().date;
    c = { id: `c${Date.now()}`, ref: `DOS-2026-${String(n).padStart(4, '0')}`, phone: digits(phone), name, area, title: { en: title, fr: title, ar: title }, lawyer, stage: 0, opened: today, dates: { intake: today }, hearing: null, docs: [], updates: [], notes: [], closed: false };
    s.cases.push(c);
    const cl = touchClient(s, { name, phone }); if (cl) cl.matters += 1;
  });
  return c;
}
export function setStage(id, stage) {
  update((s) => {
    const c = s.cases.find((x) => x.id === id); if (!c) return;
    const today = shopNow().date;
    c.stage = Math.max(0, Math.min(STAGES.length - 1, stage)); c.closed = c.stage >= STAGES.length - 1;
    STAGES.forEach((st, i) => { if (i <= c.stage) c.dates[st.id] = c.dates[st.id] || today; else delete c.dates[st.id]; });
    if (c.closed) c.hearing = null;
  });
}
export function setHearing(id, hearing) { update((s) => { const c = s.cases.find((x) => x.id === id); if (c) c.hearing = hearing; }); }
export function addCaseNote(id, text, by = 'owner') { update((s) => { const c = s.cases.find((x) => x.id === id); if (c) c.notes.unshift({ id: `n${Date.now()}`, date: shopNow().date, text, by }); }); }
export function addCaseUpdate(id, text) { update((s) => { const c = s.cases.find((x) => x.id === id); if (c) c.updates.unshift({ date: shopNow().date, text: { en: text, fr: text, ar: text } }); }); }
/** Documents: the client uploads from the site (by 'client'), the firm adds from the dashboard (by 'firm'). */
export function addCaseDoc(id, name, by) {
  update((s) => { const c = s.cases.find((x) => x.id === id); if (c) c.docs.push({ id: `d${Date.now()}`, name, by, date: shopNow().date, isNew: by === 'client' }); });
}
export function markDocsSeen(id) { update((s) => { const c = s.cases.find((x) => x.id === id); if (c) c.docs.forEach((d) => { d.isNew = false; }); }); }

// ── Invoices ───────────────────────────────────────────────────────────────
export function createInvoice({ caseId, amount, desc }) {
  let inv;
  update((s) => {
    const c = s.cases.find((x) => x.id === caseId); if (!c) return;
    const n = ++s.invSeq;
    inv = { id: `i${Date.now()}`, no: `F-2026-${String(n).padStart(3, '0')}`, caseId, phone: c.phone, amount, desc: { en: desc, fr: desc, ar: desc }, date: shopNow().date, status: 'due', paidAt: '' };
    s.invoices.push(inv);
  });
  return inv;
}
export function payInvoice(id) {
  update((s) => { const i = s.invoices.find((x) => x.id === id); if (i && i.status !== 'paid') { i.status = 'paid'; i.paidAt = shopNow().date; i.byClient = true; } });
}

// ── Requests (callbacks, retainer plans) ───────────────────────────────────
export function addRequest({ type, name, phone, area, note, plan }) {
  let r;
  update((s) => {
    r = { id: `q${Date.now()}`, no: s.requests.length + 1, type, name, phone, area: area || '', note: note || '', plan: plan || '', at: shopNow().epoch, status: 'new' };
    s.requests.push(r); touchClient(s, { name, phone });
  });
  return r;
}

// ── Insights (history + today's live data) ─────────────────────────────────
export function insights() {
  const n = shopNow();
  const todayDone = state.bookings.filter((b) => b.date === n.date && b.status === 'done');
  const paidToday = state.invoices.filter((i) => i.paidAt === n.date && i.byClient).reduce((a, i) => a + i.amount, 0);
  const todayRev = todayDone.reduce((a, b) => a + b.total, 0) + paidToday;
  const live = { date: n.date, n: todayDone.length, rev: todayRev, fees: paidToday, noshow: state.bookings.filter((b) => b.date === n.date && b.status === 'noshow').length, areas: {} };
  todayDone.forEach((b) => { live.areas[b.area] = (live.areas[b.area] || 0) + 1; });
  const days = [...state.history, live];
  const last = (k) => days.slice(-k);
  const sum = (arr, f) => arr.reduce((a, d) => a + f(d), 0);
  const areas = {};
  days.forEach((d) => Object.entries(d.areas).forEach(([id, c]) => { areas[id] = (areas[id] || 0) + c; }));
  const cons = sum(days, (d) => d.n); const ns = sum(days, (d) => d.noshow);
  const returning = Object.values(state.clients).filter((c) => c.visits >= 2).length;
  const outstanding = state.invoices.filter((i) => i.status === 'due').reduce((a, i) => a + i.amount, 0);
  return {
    days, today: { rev: todayRev, n: todayDone.length, booked: state.bookings.filter((b) => b.date === n.date && b.status !== 'cancelled').length },
    week: sum(last(7), (d) => d.rev), prevWeek: sum(days.slice(-14, -7), (d) => d.rev),
    avg: cons ? Math.round(sum(days, (d) => d.rev - d.fees) / cons) : 0, noShowRate: cons + ns ? ns / (cons + ns) : 0,
    rebook: Object.keys(state.clients).length ? returning / Object.keys(state.clients).length : 0,
    areas: Object.entries(areas).sort((a, b) => b[1] - a[1]), heat: state.heat, span: days.length,
    outstanding, openCases: state.cases.filter((c) => !c.closed).length, areasList: AREAS.map((a) => a.id),
  };
}
