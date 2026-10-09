// Booking wizard and "My bookings". A specialist can only be booked for the treatments she is trained for.
import { SHOP, SERVICES, CATEGORIES, TEAM, photoOf } from './data.js';
import * as db from './store.js';
import { icon } from './icons.js';
import { $, esc, t, L, money, mins, dateText, dayWord, toast, openSheet, sheetHead, avatar, openedSheet } from './ui.js';

const sheet = () => $('#sheet');
const svcById = (id) => SERVICES.find((s) => s.id === id);
const memberById = (id) => TEAM.find((m) => m.id === id);
const names = (ids) => ids.map((id) => L(svcById(id).name)).join(' + ');
const STATUS = { pending: 'st_pending', confirmed: 'st_confirmed', arrived: 'st_arrived', inchair: 'st_inchair', done: 'st_done', noshow: 'st_noshow', cancelled: 'st_cancelled' };
const chip = (s) => `<span class="st st-${s}">${t(STATUS[s])}</span>`;
const formatPhone = (p) => String(p).replace(/(\d{2})(?=\d)/g, '$1 ').trim();

let bk = null;
let view = ''; // 'book' | 'mine' | ''

/** preset: { services?, barber?, resched? (a booking) } */
export function openBooking(preset = {}) {
  const my = db.get().my;
  bk = { step: 1, member: preset.member || null, services: preset.services || [], barber: preset.member || preset.barber || 'any', date: null, start: null, name: '', phone: my.phone ? formatPhone(my.phone) : '', note: '', promo: '', gift: '', useReward: false, cat: 'all', resched: null, dur: 0, done: null };
  const known = my.phone ? db.clientOf(my.phone) : null;
  if (known) bk.name = known.name;
  if (preset.resched) {
    const b = preset.resched;
    Object.assign(bk, { resched: b.id, services: b.services, barber: b.anyBarber ? 'any' : b.barber, dur: b.dur, step: 3 });
  } else if (bk.services.length) bk.step = preset.barber ? 3 : 2;
  view = 'book';
  renderBooking(); openSheet(sheet());
}

const curDur = () => (bk.resched ? bk.dur : db.dur(bk.services));
const curCats = () => db.catsOf(bk.services);
const slotsOf = (date) => db.slotsFor(date, bk.barber, curDur(), bk.resched || undefined, curCats());

function ensureDate() {
  const n = db.shopNow().date;
  if (bk.date && slotsOf(bk.date).length) return;
  for (let k = 0; k <= SHOP.horizon; k++) {
    const d = db.addDays(n, k);
    if (slotsOf(d).length) { bk.date = d; return; }
  }
  bk.date = n;
}

function stepsHtml() {
  if (bk.resched) return '';
  const labels = ['bkStep1', 'bkStep2', 'bkStep3', 'bkStep4'];
  return `<ol class="steps" aria-label="Steps">${labels.map((l, i) => `<li class="${i + 1 === bk.step ? 'on' : i + 1 < bk.step ? 'ok' : ''}"><span>${i + 1 < bk.step ? icon('check') : i + 1}</span><em>${t(l)}</em></li>`).join('')}</ol>`;
}

function renderBooking() {
  if (bk.step === 5) { renderDone(); return; }
  const body = [null, stepServices, stepWho, stepTime, stepDetails][bk.step]();
  sheet().innerHTML = `${sheetHead(t(bk.resched ? 'rescheduleT' : 'bookT'), bk.resched ? `${esc(names(bk.services))}` : '')}${stepsHtml()}<div class="sheet-body" id="bkBody">${body.html}</div><div class="sheet-foot" id="bkFoot">${body.foot}</div>`;
}

const summaryLine = () => `<div class="foot-sum"><b>${t('nServices', { n: bk.services.length })}</b><span>${mins(db.dur(bk.services))} · ${money(db.priceOf(bk.services))}</span></div>`;

function stepServices() {
  const all = db.services().filter((s) => !bk.member || memberById(bk.member).skills.includes(s.cat));
  const cats = [{ id: 'all', name: { en: t('all'), fr: t('all'), ar: t('all') } }, ...CATEGORIES.filter((c) => !bk.member || memberById(bk.member).skills.includes(c.id))];
  const list = all.filter((s) => bk.cat === 'all' || s.cat === bk.cat);
  const html = `<div class="chips-row" role="tablist">${cats.map((c) => `<button class="pill ${bk.cat === c.id ? 'on' : ''}" data-bkcat="${c.id}">${esc(L(c.name))}</button>`).join('')}</div>
    <p class="mixed" id="mixedNote" hidden>${icon('sparkles')} ${t('mixed')}</p>
    <div class="rows">${list.map((s) => {
    const on = bk.services.includes(s.id);
    return `<button class="row ${on ? 'on' : ''}" data-bksvc="${s.id}" aria-pressed="${on}">
        <span class="tick">${on ? icon('check') : ''}</span>
        <span class="row-main"><b>${esc(L(s.name))}</b><small>${mins(s.dur)}${s.pop ? ` · ${t('popular')}` : ''}</small></span>
        <span class="row-price">${money(s.price)}</span></button>`;
  }).join('')}</div>`;
  const foot = `${bk.services.length ? summaryLine() : `<div class="foot-sum"><span>${t('pickService')}</span></div>`}<button class="btn rose" data-bknext ${bk.services.length ? '' : 'disabled'}>${t('continue')} ${icon('arrowRight')}</button>`;
  return { html, foot };
}

function stepWho() {
  const d = curDur(); const cats = curCats();
  const able = db.qualified(bk.services).filter((id) => db.memberActive(id));
  const opts = [{ id: 'any', any: true }, ...able.map((id) => ({ id, m: memberById(id) }))];
  const html = `<p class="hint top">${t('forThis')}</p><div class="rows">${opts.map((o) => {
    const nf = db.nextFree(o.id, d, cats);
    const when = nf ? `${t('nextFree')}: ${dayWord(nf.date)} ${db.hhmm(nf.start)}` : t('noSlots');
    const on = bk.barber === o.id;
    if (o.any) {
      return `<button class="row who ${on ? 'on' : ''}" data-bkwho="any" aria-pressed="${on}"><span class="avatar mono any">${icon('sparkles')}</span><span class="row-main"><b>${t('anySpecialist')}</b><small>${t('anySpecialistSub')} · ${when}</small></span><span class="tick">${on ? icon('check') : ''}</span></button>`;
    }
    const m = o.m;
    return `<button class="row who ${on ? 'on' : ''}" data-bkwho="${m.id}" aria-pressed="${on}" ${nf ? '' : 'disabled'}>${avatar(m, photoOf.team(m.id))}<span class="row-main"><b>${esc(m.name)}</b><small>${esc(L(m.role))} · ★ ${m.rating.toFixed(1)}</small><small class="next">${when}</small></span><span class="tick">${on ? icon('check') : ''}</span></button>`;
  }).join('')}</div>`;
  const foot = `<button class="btn ghost" data-bkback>${icon('chevronLeft')} ${t('back')}</button><button class="btn rose" data-bknext>${t('continue')} ${icon('arrowRight')}</button>`;
  return { html, foot };
}

function stepTime() {
  ensureDate();
  const n = db.shopNow().date;
  const dates = Array.from({ length: SHOP.horizon + 1 }, (_, k) => db.addDays(n, k));
  const strip = dates.map((d) => {
    const has = slotsOf(d).length > 0;
    const [, , dd] = d.split('-');
    return `<button class="day ${bk.date === d ? 'on' : ''}" data-bkdate="${d}" ${has ? '' : 'disabled'} aria-pressed="${bk.date === d}"><small>${dateText(d, { weekday: 'short' })}</small><b>${Number(dd)}</b>${d === n ? `<i>${t('today')}</i>` : ''}</button>`;
  }).join('');
  const slots = slotsOf(bk.date);
  const group = (key, from, to) => {
    const g = slots.filter((s) => s.start >= from && s.start < to);
    return g.length ? `<div class="slot-group"><h4>${t(key)}</h4><div class="slots">${g.map((s) => `<button class="slot ${bk.start === s.start ? 'on' : ''}" data-bkslot="${s.start}" aria-pressed="${bk.start === s.start}">${db.hhmm(s.start)}</button>`).join('')}</div></div>` : '';
  };
  const html = `<div class="strip" id="dayStrip">${strip}</div>
    <p class="sel-date">${dateText(bk.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${mins(curDur())}</p>
    ${slots.length ? group('morning', 0, 720) + group('afternoon', 720, 1020) + group('evening', 1020, 1440) : `<p class="empty">${t('noSlotsDay')}</p>`}`;
  const sel = bk.start != null;
  const foot = bk.resched
    ? `<button class="btn ghost" data-close>${t('cancel')}</button><button class="btn rose" data-bkmove ${sel ? '' : 'disabled'}>${t('confirmNewTime')}</button>`
    : `<button class="btn ghost" data-bkback>${icon('chevronLeft')} ${t('back')}</button><button class="btn rose" data-bknext ${sel ? '' : 'disabled'}>${t('continue')} ${icon('arrowRight')}</button>`;
  return { html, foot };
}

const quoteNow = () => db.quote({ services: bk.services, phone: bk.phone, promo: bk.promo, useReward: bk.useReward, gift: bk.gift });
function summaryHtml() {
  const q = quoteNow();
  const rows = bk.services.map((id) => `<div><span>${esc(L(svcById(id).name))}</span><span>${money(db.priceOf([id]))}</span></div>`).join('');
  const extra = [
    q.reward ? `<div class="disc"><span>${icon('gift')} ${t('freePoints')}</span><span>−${money(q.reward)}</span></div>` : '',
    q.promoOff ? `<div class="disc"><span>${icon('tag')} ${esc(bk.promo.toUpperCase())}</span><span>−${money(q.promoOff)}</span></div>` : '',
    q.giftUsed ? `<div class="disc"><span>${icon('gift')} ${esc(q.giftCode)}</span><span>−${money(q.giftUsed)}</span></div>` : '',
  ].join('');
  const msgs = [
    bk.promo && !q.promoOk ? `<small class="bad">${t('promoBad')}</small>` : q.promoOff ? `<small class="good">${t('promoOk', { n: 10 })}</small>` : '',
    bk.gift && !q.giftCode ? `<small class="bad">${t('giftBad')}</small>` : '',
  ].join('');
  const reward = q.canReward ? `<label class="reward"><input type="checkbox" data-bkf="useReward" ${bk.useReward ? 'checked' : ''}/> ${icon('gift')}<span>${t('useReward')}</span></label>` : '';
  return `${reward}<div class="sum">${rows}${extra}<div class="tot"><span>${t('total')}</span><b>${money(q.total)}</b></div></div>${msgs ? `<div class="msgs">${msgs}</div>` : ''}<p class="pay-note">${icon('wallet')} ${t('payInShop')}</p>`;
}

function stepDetails() {
  const m = bk.barber === 'any' ? null : memberById(bk.barber);
  const recap = `<div class="recap"><span>${icon('calendar')} ${dateText(bk.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${db.hhmm(bk.start)}</span><span>${icon('user')} ${m ? esc(m.name) : t('anySpecialist')}</span><span>${icon('clock')} ${mins(curDur())}</span></div>`;
  const html = `${recap}
    <div class="form">
      <label>${t('yourName')}<input data-bkf="name" value="${esc(bk.name)}" autocomplete="name" required data-autofocus /></label>
      <label>${t('yourPhone')}<input data-bkf="phone" value="${esc(bk.phone)}" inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" required /></label>
      <label>${t('noteLabel')}<textarea data-bkf="note" rows="2" placeholder="${t('notePh')}">${esc(bk.note)}</textarea></label>
      <div class="two"><label>${t('promoCode')}<input data-bkf="promo" value="${esc(bk.promo)}" placeholder="LALLA10" autocapitalize="characters" /></label>
      <label>${t('giftCode')}<input data-bkf="gift" value="${esc(bk.gift)}" placeholder="LALLA-XXXX-XX" autocapitalize="characters" /></label></div>
    </div>
    <div id="bkSummary">${summaryHtml()}</div><p class="err" id="bkErr" role="alert"></p>`;
  const foot = `<button class="btn ghost" data-bkback>${icon('chevronLeft')} ${t('back')}</button><button class="btn rose" data-bkconfirm>${t('confirmBooking')}</button>`;
  return { html, foot };
}

function renderDone() {
  const b = bk.done;
  const m = memberById(b.barber);
  sheet().innerHTML = `${sheetHead(t(bk.resched ? 'moved' : 'booked'))}<div class="sheet-body"><div class="done">
    <div class="done-ic">${icon('check')}</div>
    <p class="code">${esc(b.code)}</p>
    <div class="ticket">
      <div><small>${t('when')}</small><b>${dateText(b.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${db.hhmm(b.start)}</b></div>
      <div><small>${t('with')}</small><b>${esc(m.name)}${b.anyBarber ? ` (${t('assigned')})` : ''}</b></div>
      <div><small>${t('services')}</small><b>${esc(names(b.services))}</b></div>
      <div><small>${t('total')}</small><b>${money(b.total)} · ${t('payInShopShort')}</b></div>
    </div>
    <p class="hint">${b.status === 'pending' ? t('pendingNote') : t('confirmedNote')}</p>
  </div></div><div class="sheet-foot wrap-foot"><button class="btn ghost" data-ics="${b.id}">${icon('download')} ${t('addCalendar')}</button><button class="btn ghost" data-demo="WhatsApp">${icon('message')} ${t('shareWa')}</button><button class="btn rose" data-mine>${t('myBookings')}</button></div>`;
}

function icsFor(b) {
  const m = memberById(b.barber);
  const stamp = (date, mm) => `${date.replace(/-/g, '')}T${String(Math.floor(mm / 60)).padStart(2, '0')}${String(mm % 60).padStart(2, '0')}00`;
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LALLA Beauty House//Demo//EN', 'BEGIN:VEVENT', `UID:${b.id}@lalla-demo`, `DTSTAMP:${stamp(db.shopNow().date, db.shopNow().minutes)}`,
    `DTSTART:${stamp(b.date, b.start)}`, `DTEND:${stamp(b.date, b.start + b.dur)}`, `SUMMARY:LALLA Beauty House — ${names(b.services)}`, `LOCATION:${L(SHOP.address)}`, `DESCRIPTION:With ${m.name}. Booking ${b.code}.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
function downloadIcs(id) {
  const b = db.get().bookings.find((x) => x.id === id); if (!b) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([icsFor(b)], { type: 'text/calendar' }));
  a.download = `${b.code}.ics`; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function confirmBooking() {
  const err = $('#bkErr');
  if (bk.name.trim().length < 2) { err.textContent = t('errName'); return; }
  if (db.digits(bk.phone).length < 9) { err.textContent = t('errPhone'); return; }
  const res = db.book({ date: bk.date, start: bk.start, barber: bk.barber, services: bk.services, name: bk.name.trim(), phone: bk.phone, note: bk.note.trim(), promo: bk.promo, useReward: bk.useReward, gift: bk.gift });
  if (res.error) { toast(t('slotTaken')); bk.start = null; bk.step = 3; renderBooking(); return; }
  bk.done = res.booking; bk.step = 5; renderDone();
}
function moveBooking() {
  const res = db.reschedule(bk.resched, bk.date, bk.start);
  if (res.error) { toast(t('slotTaken')); bk.start = null; renderBooking(); return; }
  bk.done = res.booking; bk.step = 5; renderDone();
}

// ─────────────────────────────────────────────────────────────────────────────
// My bookings
// ─────────────────────────────────────────────────────────────────────────────
let mine = { phone: '', cancelId: '' };

export function openMine() {
  const my = db.get().my;
  mine = { phone: my.phone ? formatPhone(my.phone) : '', cancelId: '' };
  view = 'mine'; renderMine(); openSheet(sheet());
}

function myList() {
  const s = db.get();
  const key = db.digits(mine.phone);
  const list = key.length >= 9 ? s.bookings.filter((b) => db.digits(b.phone) === key) : s.bookings.filter((b) => s.my.ids.includes(b.id));
  const n = db.shopNow();
  const upcoming = list.filter((b) => ['pending', 'confirmed', 'arrived', 'inchair'].includes(b.status) && db.epochOf(b.date, b.start + b.dur) >= n.epoch).sort((a, b) => db.epochOf(a.date, a.start) - db.epochOf(b.date, b.start));
  const past = list.filter((b) => !upcoming.includes(b)).sort((a, b) => db.epochOf(b.date, b.start) - db.epochOf(a.date, a.start)).slice(0, 4);
  return { upcoming, past };
}

function bookingCard(b, past) {
  const m = memberById(b.barber);
  const canEdit = !past && ['pending', 'confirmed'].includes(b.status);
  const confirming = mine.cancelId === b.id;
  return `<article class="bk-card ${past ? 'past' : ''}">
    <header><b>${dayWord(b.date)} · ${db.hhmm(b.start)}</b>${chip(b.status)}</header>
    <p>${esc(names(b.services))}</p>
    <small>${icon('user')} ${esc(m.name)} · ${mins(b.dur)} · ${money(b.total)} · ${esc(b.code)}</small>
    ${canEdit ? (confirming
    ? `<div class="bk-actions"><span>${t('cancelAsk')}</span><button class="btn danger sm" data-cancel-yes="${b.id}">${t('yesCancel')}</button><button class="btn ghost sm" data-cancel-no>${t('keep')}</button></div>`
    : `<div class="bk-actions"><button class="btn ghost sm" data-resched="${b.id}">${icon('refresh')} ${t('reschedule')}</button><button class="btn ghost sm" data-cancel="${b.id}">${icon('x')} ${t('cancel')}</button><button class="btn ghost sm" data-ics="${b.id}">${icon('download')}</button></div>`) : ''}
  </article>`;
}

function renderMine() {
  const { upcoming, past } = myList();
  sheet().innerHTML = `${sheetHead(t('myBookings'), t('myBookingsSub'))}<div class="sheet-body">
    <label class="find">${t('yourPhone')}<input data-minephone value="${esc(mine.phone)}" inputmode="tel" placeholder="06 12 34 56 78" data-autofocus /></label>
    <p class="hint">${t('tryDemo')}</p>
    <h4 class="mini">${t('upcoming')}</h4>
    ${upcoming.length ? upcoming.map((b) => bookingCard(b, false)).join('') : `<p class="empty">${t('noUpcoming')}</p>`}
    ${past.length ? `<h4 class="mini">${t('history')}</h4>${past.map((b) => bookingCard(b, true)).join('')}` : ''}
  </div><div class="sheet-foot"><button class="btn rose" data-newbook>${icon('sparkles')} ${t('bookTreatment')}</button></div>`;
}

/** Re-render whichever live view is open (called when the shop data changes). */
export function refreshSheets() {
  if (!openedSheet() || openedSheet() !== sheet()) return;
  if (view === 'mine') { const f = $('[data-minephone]'); if (document.activeElement !== f) renderMine(); }
  if (view === 'book' && bk && bk.step === 3) { const keep = $('#dayStrip')?.scrollLeft; renderBooking(); if (keep) $('#dayStrip').scrollLeft = keep; }
}

export function wireBooking() {
  const root = sheet();
  root.addEventListener('click', (e) => {
    const g = (sel) => e.target.closest(sel);
    if (view === 'book') {
      let x;
      if ((x = g('[data-bkcat]'))) { bk.cat = x.dataset.bkcat; renderBooking(); return; }
      if ((x = g('[data-bksvc]'))) {
        const id = x.dataset.bksvc;
        const next = bk.services.includes(id) ? bk.services.filter((i) => i !== id) : [...bk.services, id];
        if (next.length && !db.qualified(next).length) { const n = $('#mixedNote'); n.hidden = false; toast(t('mixed')); return; }
        bk.services = next; bk.barber = bk.member && db.canDo(bk.member, db.catsOf(next)) ? bk.member : 'any'; renderBooking(); return;
      }
      if ((x = g('[data-bkwho]'))) { bk.barber = x.dataset.bkwho; bk.start = null; renderBooking(); return; }
      if ((x = g('[data-bkdate]'))) { bk.date = x.dataset.bkdate; bk.start = null; const keep = $('#dayStrip').scrollLeft; renderBooking(); $('#dayStrip').scrollLeft = keep; return; }
      if ((x = g('[data-bkslot]'))) { bk.start = Number(x.dataset.bkslot); const keep = $('#dayStrip').scrollLeft; renderBooking(); $('#dayStrip').scrollLeft = keep; $('#bkFoot [data-bknext], #bkFoot [data-bkmove]')?.focus(); return; }
      if (g('[data-bknext]')) { bk.step += 1; if (bk.step === 3) bk.start = null; renderBooking(); $('#bkBody').scrollTop = 0; return; }
      if (g('[data-bkback]')) { bk.step -= 1; renderBooking(); return; }
      if (g('[data-bkconfirm]')) { confirmBooking(); return; }
      if (g('[data-bkmove]')) { moveBooking(); return; }
    }
    let x;
    if ((x = g('[data-ics]'))) { downloadIcs(x.dataset.ics); return; }
    if (g('[data-mine]')) { openMine(); return; }
    if (g('[data-newbook]')) { openBooking(); return; }
    if ((x = g('[data-resched]'))) { const b = db.get().bookings.find((y) => y.id === x.dataset.resched); if (b) openBooking({ resched: b }); return; }
    if ((x = g('[data-cancel]'))) { mine.cancelId = x.dataset.cancel; renderMine(); return; }
    if (g('[data-cancel-no]')) { mine.cancelId = ''; renderMine(); return; }
    if ((x = g('[data-cancel-yes]'))) {
      const r = db.cancelBooking(x.dataset.cancelYes);
      mine.cancelId = ''; if (r.error === 'late') toast(t('cancelLate')); else toast(t('cancelled'));
      renderMine();
    }
  });
  root.addEventListener('input', (e) => {
    const f = e.target.dataset;
    if (f.bkf && bk) {
      if (e.target.type === 'checkbox') bk.useReward = e.target.checked; else bk[f.bkf] = e.target.value;
      if (['phone', 'promo', 'gift'].includes(f.bkf) || e.target.type === 'checkbox') $('#bkSummary').innerHTML = summaryHtml();
    }
    if (f.minephone !== undefined) {
      mine.phone = e.target.value; const pos = e.target.selectionStart; renderMine();
      const el = $('[data-minephone]'); el.focus(); el.setSelectionRange(pos, pos);
    }
  });
  root.addEventListener('change', (e) => {
    if (e.target.dataset.bkf === 'useReward' && bk) { bk.useReward = e.target.checked; $('#bkSummary').innerHTML = summaryHtml(); }
  });
}
