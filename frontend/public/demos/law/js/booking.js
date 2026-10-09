// Booking wizard and "My appointments". A lawyer can only be booked for the practice areas he or she works in.
import { SHOP, AREAS, MEETINGS, MODES, TEAM, photoOf } from './data.js';
import * as db from './store.js';
import { icon } from './icons.js';
import { $, esc, t, L, money, mins, dateText, dayWord, toast, openSheet, sheetHead, avatar, openedSheet } from './ui.js';

const sheet = () => $('#sheet');
const areaById = (id) => AREAS.find((a) => a.id === id);
const meetingById = (id) => MEETINGS.find((m) => m.id === id);
const memberById = (id) => TEAM.find((m) => m.id === id);
const modeById = (id) => MODES.find((m) => m.id === id);
const STATUS = { pending: 'st_pending', confirmed: 'st_confirmed', arrived: 'st_arrived', inprogress: 'st_inprogress', done: 'st_done', noshow: 'st_noshow', cancelled: 'st_cancelled' };
const chip = (s) => `<span class="st st-${s}">${t(STATUS[s])}</span>`;
const formatPhone = (p) => String(p).replace(/(\d{2})(?=\d)/g, '$1 ').trim();

let bk = null;
let view = ''; // 'book' | 'mine' | ''

/** preset: { area?, meeting?, member?, resched? (a booking) } */
export function openBooking(preset = {}) {
  const my = db.get().my;
  bk = { step: 1, area: preset.area || '', meeting: preset.meeting || '', mode: 'office', member: preset.member || 'any', date: null, start: null, name: '', phone: my.phone ? formatPhone(my.phone) : '', email: '', note: '', resched: null, dur: 0, done: null };
  const known = my.phone ? db.clientOf(my.phone) : null;
  if (known) { bk.name = known.name; bk.email = known.email || ''; }
  if (preset.resched) {
    const b = preset.resched;
    Object.assign(bk, { resched: b.id, area: b.area, meeting: b.meeting, mode: b.mode, member: b.anyMember ? 'any' : b.member, dur: b.dur, step: 4 });
  } else if (bk.area && bk.meeting) bk.step = bk.member !== 'any' ? 4 : 3;
  else if (bk.area) bk.step = 2;
  if (bk.member !== 'any' && bk.area && !db.canDo(bk.member, bk.area)) bk.member = 'any';
  view = 'book';
  renderBooking(); openSheet(sheet());
}

const curDur = () => (bk.resched ? bk.dur : meetingById(bk.meeting).dur);
const slotsOf = (date) => db.slotsFor(date, bk.member, curDur(), bk.resched || undefined, bk.area);
const meetingPrice = () => db.meetPrice(meetingById(bk.meeting));

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
  const labels = ['bkStep1', 'bkStep2', 'bkStep3', 'bkStep4', 'bkStep5'];
  return `<ol class="steps" aria-label="Steps">${labels.map((l, i) => `<li class="${i + 1 === bk.step ? 'on' : i + 1 < bk.step ? 'ok' : ''}"><span>${i + 1 < bk.step ? icon('check') : i + 1}</span><em>${t(l)}</em></li>`).join('')}</ol>`;
}

function renderBooking() {
  if (bk.step === 6) { renderDone(); return; }
  const body = [null, stepArea, stepMeeting, stepWho, stepTime, stepDetails][bk.step]();
  sheet().innerHTML = `${sheetHead(t(bk.resched ? 'rescheduleT' : 'bookT'), bk.resched ? `${esc(L(meetingById(bk.meeting).name))}` : '')}${stepsHtml()}<div class="sheet-body" id="bkBody">${body.html}</div><div class="sheet-foot" id="bkFoot">${body.foot}</div>`;
}

function stepArea() {
  const html = `<p class="hint top">${t('pickAreaHint')}</p><div class="rows">${AREAS.map((a) => {
    const on = bk.area === a.id;
    return `<button class="row ${on ? 'on' : ''}" data-bkarea="${a.id}" aria-pressed="${on}"><span class="ico">${icon(a.icon)}</span><span class="row-main"><b>${esc(L(a.name))}</b><small>${esc(L(a.cases[0]))} · ${esc(L(a.cases[1]))}</small></span><span class="tick">${on ? icon('check') : ''}</span></button>`;
  }).join('')}</div>`;
  const foot = `<div class="foot-sum"><span>${bk.area ? esc(L(areaById(bk.area).name)) : t('pickArea')}</span></div><button class="btn pri" data-bknext ${bk.area ? '' : 'disabled'}>${t('continue')} ${icon('arrowRight')}</button>`;
  return { html, foot };
}

function stepMeeting() {
  const list = db.meetings();
  if (bk.meeting && !list.some((m) => m.id === bk.meeting)) bk.meeting = '';
  const cur = bk.meeting ? meetingById(bk.meeting) : null;
  if (cur && !cur.modes.includes(bk.mode)) bk.mode = cur.modes[0];
  const html = `<div class="rows">${list.map((m) => {
    const on = bk.meeting === m.id;
    return `<button class="row ${on ? 'on' : ''}" data-bkmeet="${m.id}" aria-pressed="${on}"><span class="tick">${on ? icon('check') : ''}</span><span class="row-main"><b>${esc(L(m.name))}</b><small>${mins(m.dur)}${m.pop ? ` · ${t('popular')}` : ''} · ${esc(L(m.desc))}</small></span><span class="row-price">${m.price ? money(m.price) : t('free')}</span></button>`;
  }).join('')}</div>
    <h4 class="mini">${t('howMeet')}</h4>
    <div class="modes">${MODES.map((md) => {
    const ok = !cur || cur.modes.includes(md.id);
    return `<button class="mode ${bk.mode === md.id ? 'on' : ''}" data-bkmode="${md.id}" aria-pressed="${bk.mode === md.id}" ${ok ? '' : 'disabled'}>${icon(md.icon)}<span>${esc(L(md.name))}</span></button>`;
  }).join('')}</div>`;
  const foot = `<button class="btn ghost" data-bkback>${icon('chevronLeft')} ${t('back')}</button><button class="btn pri" data-bknext ${bk.meeting ? '' : 'disabled'}>${t('continue')} ${icon('arrowRight')}</button>`;
  return { html, foot };
}

function stepWho() {
  const d = curDur();
  const able = db.qualified(bk.area).filter((id) => db.memberActive(id));
  const opts = [{ id: 'any', any: true }, ...able.map((id) => ({ id, m: memberById(id) }))];
  const html = `<p class="hint top">${t('forThis', { a: esc(L(areaById(bk.area).name)) })}</p><div class="rows">${opts.map((o) => {
    const nf = db.nextFree(o.id, d, bk.area);
    const when = nf ? `${t('nextFree')}: ${dayWord(nf.date)} ${db.hhmm(nf.start)}` : t('noSlots');
    const on = bk.member === o.id;
    if (o.any) {
      return `<button class="row who ${on ? 'on' : ''}" data-bkwho="any" aria-pressed="${on}"><span class="avatar mono any">${icon('scale')}</span><span class="row-main"><b>${t('anyLawyer')}</b><small>${t('anyLawyerSub')} · ${when}</small></span><span class="tick">${on ? icon('check') : ''}</span></button>`;
    }
    const m = o.m;
    return `<button class="row who ${on ? 'on' : ''}" data-bkwho="${m.id}" aria-pressed="${on}" ${nf ? '' : 'disabled'}>${avatar(m, photoOf.team(m.id))}<span class="row-main"><b>${esc(m.name)}</b><small>${esc(L(m.role))} · ★ ${m.rating.toFixed(1)}</small><small class="next">${when}</small></span><span class="tick">${on ? icon('check') : ''}</span></button>`;
  }).join('')}</div>`;
  const foot = `<button class="btn ghost" data-bkback>${icon('chevronLeft')} ${t('back')}</button><button class="btn pri" data-bknext>${t('continue')} ${icon('arrowRight')}</button>`;
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
    ${slots.length ? group('morning', 0, 720) + group('afternoon', 720, 1440) : `<p class="empty">${t('noSlotsDay')}</p>`}`;
  const sel = bk.start != null;
  const foot = bk.resched
    ? `<button class="btn ghost" data-close>${t('cancel')}</button><button class="btn pri" data-bkmove ${sel ? '' : 'disabled'}>${t('confirmNewTime')}</button>`
    : `<button class="btn ghost" data-bkback>${icon('chevronLeft')} ${t('back')}</button><button class="btn pri" data-bknext ${sel ? '' : 'disabled'}>${t('continue')} ${icon('arrowRight')}</button>`;
  return { html, foot };
}

function stepDetails() {
  const m = bk.member === 'any' ? null : memberById(bk.member);
  const recap = `<div class="recap"><span>${icon('calendar')} ${dateText(bk.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${db.hhmm(bk.start)}</span><span>${icon('user')} ${m ? esc(m.name) : t('anyLawyer')}</span><span>${icon(modeById(bk.mode).icon)} ${esc(L(modeById(bk.mode).name))}</span><span>${icon('clock')} ${mins(curDur())}</span></div>`;
  const html = `${recap}
    <div class="form">
      <label>${t('yourName')}<input data-bkf="name" value="${esc(bk.name)}" autocomplete="name" required data-autofocus /></label>
      <div class="two"><label>${t('yourPhone')}<input data-bkf="phone" value="${esc(bk.phone)}" inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" required /></label>
      <label>${t('yourEmail')}<input data-bkf="email" value="${esc(bk.email)}" type="email" autocomplete="email" placeholder="name@email.com" /></label></div>
      <label>${t('noteLabel')}<textarea data-bkf="note" rows="3" placeholder="${t('notePh')}">${esc(bk.note)}</textarea></label>
    </div>
    <div class="sum"><div><span>${esc(L(meetingById(bk.meeting).name))}</span><span>${meetingPrice() ? money(meetingPrice()) : t('free')}</span></div><div class="tot"><span>${t('total')}</span><b>${meetingPrice() ? money(meetingPrice()) : t('free')}</b></div></div>
    <p class="pay-note">${icon('lock')} ${t('confidentialNote')}</p><p class="err" id="bkErr" role="alert"></p>`;
  const foot = `<button class="btn ghost" data-bkback>${icon('chevronLeft')} ${t('back')}</button><button class="btn pri" data-bkconfirm>${t('confirmBooking')}</button>`;
  return { html, foot };
}

function renderDone() {
  const b = bk.done;
  const m = memberById(b.member);
  sheet().innerHTML = `${sheetHead(t(bk.resched ? 'moved' : 'booked'))}<div class="sheet-body"><div class="done">
    <div class="done-ic">${icon('check')}</div>
    <p class="code">${esc(b.code)}</p>
    <div class="ticket">
      <div><small>${t('when')}</small><b>${dateText(b.date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${db.hhmm(b.start)}</b></div>
      <div><small>${t('with')}</small><b>${esc(m.name)}${b.anyMember ? ` (${t('assigned')})` : ''}</b></div>
      <div><small>${t('meeting')}</small><b>${esc(L(meetingById(b.meeting).name))} · ${esc(L(modeById(b.mode).name))}</b></div>
      <div><small>${t('total')}</small><b>${b.total ? `${money(b.total)} · ${t('payAtMeeting')}` : t('free')}</b></div>
    </div>
    <p class="hint">${b.mode === 'video' ? t('videoNote') : b.mode === 'phone' ? t('phoneNote') : t('officeNote')}</p>
    <p class="hint">${b.status === 'pending' ? t('pendingNote') : t('confirmedNote')}</p>
  </div></div><div class="sheet-foot wrap-foot"><button class="btn ghost" data-ics="${b.id}">${icon('download')} ${t('addCalendar')}</button><button class="btn ghost" data-go-track>${icon('folder')} ${t('trackCase')}</button><button class="btn pri" data-mine>${t('myBookings')}</button></div>`;
}

function icsFor(b) {
  const m = memberById(b.member);
  const stamp = (date, mm) => `${date.replace(/-/g, '')}T${String(Math.floor(mm / 60)).padStart(2, '0')}${String(mm % 60).padStart(2, '0')}00`;
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bennani & Associes//Demo//EN', 'BEGIN:VEVENT', `UID:${b.id}@bennani-demo`, `DTSTAMP:${stamp(db.shopNow().date, db.shopNow().minutes)}`,
    `DTSTART:${stamp(b.date, b.start)}`, `DTEND:${stamp(b.date, b.start + b.dur)}`, `SUMMARY:Bennani & Associés — ${L(meetingById(b.meeting).name)}`, `LOCATION:${L(SHOP.address)}`, `DESCRIPTION:With ${m.name}. Booking ${b.code}.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
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
  const res = db.book({ date: bk.date, start: bk.start, member: bk.member, meeting: bk.meeting, area: bk.area, mode: bk.mode, name: bk.name.trim(), phone: bk.phone, email: bk.email.trim(), note: bk.note.trim() });
  if (res.error) { toast(t('slotTaken')); bk.start = null; bk.step = 4; renderBooking(); return; }
  bk.done = res.booking; bk.step = 6; renderDone();
}
function moveBooking() {
  const res = db.reschedule(bk.resched, bk.date, bk.start);
  if (res.error) { toast(t('slotTaken')); bk.start = null; renderBooking(); return; }
  bk.done = res.booking; bk.step = 6; renderDone();
}

// ─────────────────────────────────────────────────────────────────────────────
// My appointments
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
  const upcoming = list.filter((b) => ['pending', 'confirmed', 'arrived', 'inprogress'].includes(b.status) && db.epochOf(b.date, b.start + b.dur) >= n.epoch).sort((a, b) => db.epochOf(a.date, a.start) - db.epochOf(b.date, b.start));
  const past = list.filter((b) => !upcoming.includes(b)).sort((a, b) => db.epochOf(b.date, b.start) - db.epochOf(a.date, a.start)).slice(0, 4);
  return { upcoming, past };
}

function bookingCard(b, past) {
  const m = memberById(b.member);
  const canEdit = !past && ['pending', 'confirmed'].includes(b.status);
  const confirming = mine.cancelId === b.id;
  return `<article class="bk-card ${past ? 'past' : ''}">
    <header><b>${dayWord(b.date)} · ${db.hhmm(b.start)}</b>${chip(b.status)}</header>
    <p>${esc(L(meetingById(b.meeting).name))} — ${esc(L(areaById(b.area).name))}</p>
    <small>${icon('user')} ${esc(m.name)} · ${icon(modeById(b.mode).icon)} ${esc(L(modeById(b.mode).name))} · ${mins(b.dur)} · ${esc(b.code)}</small>
    ${canEdit ? (confirming
    ? `<div class="bk-actions"><span>${t('cancelAsk')}</span><button class="btn danger sm" data-cancel-yes="${b.id}">${t('yesCancel')}</button><button class="btn ghost sm" data-cancel-no>${t('keep')}</button></div>`
    : `<div class="bk-actions"><button class="btn ghost sm" data-resched="${b.id}">${icon('refresh')} ${t('reschedule')}</button><button class="btn ghost sm" data-cancel="${b.id}">${icon('x')} ${t('cancel')}</button><button class="btn ghost sm" data-ics="${b.id}" aria-label="${t('addCalendar')}">${icon('download')}</button></div>`) : ''}
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
  </div><div class="sheet-foot"><button class="btn pri" data-newbook>${icon('calendar')} ${t('bookConsult')}</button></div>`;
}

/** Re-render whichever live view is open (called when the data changes). */
export function refreshSheets() {
  if (!openedSheet() || openedSheet() !== sheet()) return;
  if (view === 'mine') { const f = $('[data-minephone]'); if (document.activeElement !== f) renderMine(); }
  if (view === 'book' && bk && bk.step === 4) { const keep = $('#dayStrip')?.scrollLeft; renderBooking(); if (keep) $('#dayStrip').scrollLeft = keep; }
}

export function wireBooking() {
  const root = sheet();
  root.addEventListener('click', (e) => {
    const g = (sel) => e.target.closest(sel);
    if (view === 'book') {
      let x;
      if ((x = g('[data-bkarea]'))) { bk.area = x.dataset.bkarea; if (bk.member !== 'any' && !db.canDo(bk.member, bk.area)) bk.member = 'any'; renderBooking(); return; }
      if ((x = g('[data-bkmeet]'))) { bk.meeting = x.dataset.bkmeet; renderBooking(); return; }
      if ((x = g('[data-bkmode]'))) { bk.mode = x.dataset.bkmode; renderBooking(); return; }
      if ((x = g('[data-bkwho]'))) { bk.member = x.dataset.bkwho; bk.start = null; renderBooking(); return; }
      if ((x = g('[data-bkdate]'))) { bk.date = x.dataset.bkdate; bk.start = null; const keep = $('#dayStrip').scrollLeft; renderBooking(); $('#dayStrip').scrollLeft = keep; return; }
      if ((x = g('[data-bkslot]'))) { bk.start = Number(x.dataset.bkslot); const keep = $('#dayStrip').scrollLeft; renderBooking(); $('#dayStrip').scrollLeft = keep; $('#bkFoot [data-bknext], #bkFoot [data-bkmove]')?.focus(); return; }
      if (g('[data-bknext]')) { bk.step += 1; if (bk.step === 4) bk.start = null; renderBooking(); $('#bkBody').scrollTop = 0; return; }
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
    if (f.bkf && bk) bk[f.bkf] = e.target.value;
    if (f.minephone !== undefined) {
      mine.phone = e.target.value; const pos = e.target.selectionStart; renderMine();
      const el = $('[data-minephone]'); el.focus(); el.setSelectionRange(pos, pos);
    }
  });
}
