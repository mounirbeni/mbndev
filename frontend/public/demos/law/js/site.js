// Cabinet Alaoui — public site. Vanilla JS modules, no build step.
import { SHOP, AREAS, MEETINGS, MODES, TEAM, URGENCY, PLANS, GUIDES, REVIEWS, AMENITIES, STAGES, FACTS, COURTS, photoOf } from './data.js';
import { LANGS } from './i18n.js';
import * as db from './store.js';
import { icon, langDropdown } from './icons.js';
import { heroArt, stars } from './art.js';
import { fetchConfig } from './gate.js';
import { $, $$, esc, ui, t, L, money, mins, dayWord, dayNames, dateText, toast, openSheet, closeSheet, sheetHead, avatar, openedSheet } from './ui.js';
import { openBooking, openMine, refreshSheets, wireBooking } from './booking.js';

const areaById = (id) => AREAS.find((a) => a.id === id);
const memberById = (id) => TEAM.find((m) => m.id === id);
const meetingById = (id) => MEETINGS.find((m) => m.id === id);
const SOLO = TEAM.length === 1;
const DEMO_REF = 'DOS-2026-0142'; const DEMO_PHONE = '0661223344';

// ── language ───────────────────────────────────────────────────────────────
function applyStatic() {
  const lg = LANGS.find((x) => x.id === ui.lang);
  document.documentElement.lang = ui.lang; document.documentElement.dir = lg.dir;
  $$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  $$('[data-t-ph]').forEach((el) => { el.placeholder = t(el.dataset.tPh); });
  $$('[data-ic]').forEach((el) => { el.innerHTML = icon(el.dataset.ic); });
  $('#langs').innerHTML = langDropdown({ options: LANGS.map((x) => ({ id: x.id, short: x.label, name: x.name })), current: ui.lang, label: t('language') });
  $('#myBtn').innerHTML = `${icon('calendar')}<span class="dotn" id="myDot" hidden></span>`;
  $('#myBtn').setAttribute('aria-label', t('myBookings'));
  const s = db.get().settings;
  const a = $('#announce'); a.hidden = !(s.banner && (s.bannerText || t('announce')));
  $('#announceText').textContent = s.bannerText || t('announce');
  splitHero();
}
function splitHero() {
  let i = 0;
  $$('#heroTitle > [data-t]').forEach((el) => {
    el.innerHTML = el.textContent.split(' ').filter(Boolean).map((w) => `<span class="w" style="--i:${i++}">${esc(w)}</span>`).join(' ');
  });
}
function setLang(l) { ui.lang = l; db.update((s) => { s.lang = l; }); renderAll(); }

// ── status: open/closed, next free slot, live card ─────────────────────────
function openText() {
  const o = db.openState();
  if (o.open) return { cls: o.soon ? 'soon' : '', txt: t(o.soon ? 'closesSoon' : 'openNow', { t: db.hhmm(o.until) }) };
  const d = o.k === 0 ? t('today') : o.k === 1 ? t('tomorrow') : dayNames()[o.day];
  return { cls: 'closed', txt: t('closedNow', { d, t: db.hhmm(o.at ?? 0) }) };
}
function renderStatus() {
  const o = openText();
  $('#navStatus').innerHTML = `<i class="${o.cls}"></i>${esc(o.txt)}`;
  const mineCount = myUpcoming();
  const dotn = $('#myDot'); if (dotn) { dotn.hidden = !mineCount; dotn.textContent = mineCount; }
  renderLive();
}
function myUpcoming() {
  const s = db.get(); const n = db.shopNow();
  return s.bookings.filter((b) => s.my.ids.includes(b.id) && ['pending', 'confirmed', 'arrived', 'inprogress'].includes(b.status) && db.epochOf(b.date, b.start + b.dur) >= n.epoch).length;
}
const STATE_KEY = { free: 'stFree', busy: 'stBusy', court: 'stCourt', off: 'stOff' };
function renderLive() {
  const fl = db.floor();
  const nf = db.nextFree('any', 30, '');
  const next = `<p class="live-next">${icon('clock')} ${nf ? t('nextFreeSlot', { w: esc(dayWord(nf.date)), t: db.hhmm(nf.start) }) : t('noSlots')}</p>`;
  if (SOLO) {
    const f = fl[0]; const m = memberById(f.member);
    $('#liveCard').innerHTML = `<header><span class="pulse"></span><b>${t('liveT')}</b></header>
      <div class="live-solo f-${f.state}">${avatar(m, photoOf.team(m.id))}<p><b>${esc(m.name)}</b><span class="stline s-${f.state}">${t(STATE_KEY[f.state])}${f.state === 'court' && f.hearing ? ` · ${f.hearing.hearing.time}` : ''}</span></p></div>${next}`;
    return;
  }
  const free = fl.filter((c) => c.state === 'free').length;
  const court = fl.filter((c) => c.state === 'court').length;
  const faces = fl.map((c) => { const m = memberById(c.member); return `<li class="f-${c.state}" title="${esc(m.name)} — ${esc(t(STATE_KEY[c.state]))}">${avatar(m, photoOf.team(m.id))}</li>`; }).join('');
  $('#liveCard').innerHTML = `<header><span class="pulse"></span><b>${t('liveT')}</b></header>
    <ul class="faces">${faces}</ul>
    <p class="live-line"><b>${free ? t('freeNow', { n: free }) : t('noneFree')}</b>${court ? ` · ${t('inCourtN', { n: court })}` : ''}</p>${next}`;
}

let heroTimer = null; let heroI = 0;
function renderHero() {
  const photos = photoOf.hero();
  const el = $('#heroFrame');
  el.classList.toggle('art', photos.length === 0);
  if (!photos.length) { el.innerHTML = heroArt(); return; }
  if (el.querySelector('img')) return;
  el.innerHTML = photos.map((src, i) => `<img src="${src}" alt="" class="${i === 0 ? 'on' : ''}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`).join('');
  clearInterval(heroTimer);
  if (photos.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroTimer = setInterval(() => {
      const imgs = $$('#heroFrame img'); if (!imgs.length) return;
      imgs[heroI].classList.remove('on'); heroI = (heroI + 1) % imgs.length; imgs[heroI].classList.add('on');
    }, 5200);
  }
}
function renderQuick() {
  const sel = $('#quickArea'); const keep = sel.value;
  sel.innerHTML = `<option value="">${esc(t('pickArea'))}</option>` + AREAS.map((a) => `<option value="${a.id}">${esc(L(a.name))}</option>`).join('');
  sel.value = keep;
}

// ── key figures (count up when they scroll into view) ──────────────────────
function renderFacts() {
  $('#facts').innerHTML = `<ul>${FACTS.map((f) => `<li><b data-count="${f.n}" data-suffix="${esc(f.suffix)}">${f.n}${esc(f.suffix)}</b><span>${esc(L(f.label))}</span></li>`).join('')}</ul>`;
}
function countUp(el) {
  const to = Number(el.dataset.count); const suf = el.dataset.suffix || '';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to.toLocaleString('en-US') + suf; return; }
  const t0 = performance.now(); const dur = 1400;
  const step = (now) => { const p = Math.min(1, (now - t0) / dur); const v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = v.toLocaleString('en-US') + suf; if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// ── practice areas (an index, one row open at a time) ──────────────────────
let openArea = 'family';
function renderAreas() {
  $('#areasList').innerHTML = AREAS.map((a, i) => {
    const on = openArea === a.id;
    const who = db.qualified(a.id).filter((id) => db.memberActive(id)).map(memberById);
    return `<article class="area ${on ? 'open' : ''}">
      <button class="area-head" data-area="${a.id}" aria-expanded="${on}" aria-controls="ap-${a.id}">
        <span class="num">${String(i + 1).padStart(2, '0')}</span><span class="ico">${icon(a.icon)}</span>
        <span class="nm">${esc(L(a.name))}</span><span class="brief">${esc(L(a.desc))}</span><span class="plus">${icon('plus')}</span>
      </button>
      <div class="area-body" id="ap-${a.id}" ${on ? '' : 'hidden'}><div>
        <p>${esc(L(a.desc))}</p>
        <ul class="cases">${a.cases.map((c) => `<li>${icon('check')} ${esc(L(c))}</li>`).join('')}</ul>
        <div class="area-foot ${SOLO ? 'solo' : ''}">${SOLO ? '' : `<span class="who">${who.map((m) => `<span class="mini-av" title="${esc(m.name)}">${avatar(m, photoOf.team(m.id))}</span>`).join('')}<small>${who.map((m) => esc(m.name)).join(' · ')}</small></span>`}
        <button class="btn pri sm" data-book-area="${a.id}">${t('bookArea')} ${icon('arrowRight')}</button></div>
      </div></div>
    </article>`;
  }).join('');
}

// ── finder: situation → right area, meeting and lawyers ───────────────────
const fnd = { area: 'family', urgency: 'week' };
function renderFinder() {
  const a = areaById(fnd.area); const u = URGENCY.find((x) => x.id === fnd.urgency); const m = meetingById(u.meeting);
  const who = db.qualified(a.id).filter((id) => db.memberActive(id)).map(memberById);
  const nf = db.nextFree('any', m.dur, a.id);
  $('#finderBox').innerHTML = `<div class="questions">
      <div class="q"><h4>${t('fq_area')}</h4><div class="tiles">${AREAS.map((x) => `<button class="tile ${fnd.area === x.id ? 'on' : ''}" data-fnd-area="${x.id}" aria-pressed="${fnd.area === x.id}"><span class="ti">${icon(x.icon)}</span>${esc(L(x.name))}</button>`).join('')}</div></div>
      <div class="q"><h4>${t('fq_when')}</h4><div class="opts">${URGENCY.map((x) => `<button class="pill ${fnd.urgency === x.id ? 'on' : ''}" data-fnd-urg="${x.id}" aria-pressed="${fnd.urgency === x.id}">${esc(L(x.label))}</button>`).join('')}</div></div>
    </div>
    <div class="result"><small>${t('yourMatch')}</small>
      <h3>${esc(L(a.name))}</h3>
      <p>${esc(L(a.desc))}</p>
      <ul>
        <li>${icon('calendar')} <span><b>${esc(L(m.name))}</b> · ${mins(m.dur)} · ${m.price ? money(m.price) : t('free')}</span></li>
        ${SOLO ? '' : `<li>${icon('user')} <span>${t('bestWith', { n: esc(who.map((w) => w.name).join(' / ')) })}</span></li>`}
        <li>${icon('clock')} <span>${nf ? t('nextFreeSlot', { w: esc(dayWord(nf.date)), t: db.hhmm(nf.start) }) : t('noSlots')}</span></li>
      </ul>
      <button class="btn pri" data-book-area="${a.id}" data-book-meeting="${m.id}">${t('bookThis')} ${icon('arrowRight')}</button>
    </div>`;
}

// ── team ───────────────────────────────────────────────────────────────────
function renderTeam() {
  const fl = db.floor();
  const grid = $('#teamGrid'); grid.classList.toggle('solo', SOLO);
  grid.innerHTML = TEAM.filter((m) => db.memberActive(m.id)).map((m) => {
    const nf = db.nextFree(m.id, 30, m.skills[0]);
    const st = fl.find((c) => c.member === m.id)?.state || 'off';
    const ph = photoOf.team(m.id);
    return `<article class="member ${SOLO ? 'solo' : ''}" style="--c:${m.color}">
      <div class="portrait">${ph ? `<img src="${ph}" alt="${esc(m.name)}" loading="lazy" decoding="async" />` : `<b aria-hidden="true">${esc(m.short[0])}</b>`}<span class="state ${st}">${t(STATE_KEY[st])}</span></div>
      <div class="m-body">
      <div class="m-info"><h3>${esc(m.name)}</h3><p class="role">${esc(L(m.role))}</p>
        <div class="rate-row">${stars(m.rating)}<b>${m.rating.toFixed(1)}</b><small>(${m.reviews})</small><span class="yrs">${t('yearsN', { n: m.years })}</span></div></div>
      <p class="bio">${esc(L(m.bio))}</p>
      <div class="skills">${m.skills.map((s) => `<span>${esc(L(areaById(s).name))}</span>`).join('')}</div>
      <p class="langs">${icon('globe')} ${m.langs.join(' · ')}</p>
      <footer><span class="next">${icon('clock')} ${nf ? `<b>${esc(dayWord(nf.date))} ${db.hhmm(nf.start)}</b>` : t('noSlots')}</span><button class="btn pri sm" data-member="${m.id}">${SOLO ? t('bookConsult') : t('bookWith', { n: esc(m.short) })}</button></footer></div>
    </article>`;
  }).join('');
}

// ── case tracking ──────────────────────────────────────────────────────────
const track = { caseId: null };
const fmtPhone = (p) => String(p).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
function daysUntil(date) { const n = db.shopNow().date; return Math.round((db.epochOf(date, 0) - db.epochOf(n, 0)) / 1440); }
function renderTrack() {
  const c = track.caseId ? db.caseById(track.caseId) : db.findCase(DEMO_REF, DEMO_PHONE);
  const box = $('#caseFile');
  if (!c) { box.innerHTML = `<p class="empty">${t('noFile')}</p>`; return; }
  const sample = !track.caseId;
  const m = memberById(c.lawyer); const a = areaById(c.area);
  const invs = db.invoicesOf(c.id);
  const due = invs.filter((i) => i.status === 'due').reduce((n, i) => n + i.amount, 0);
  const hr = c.hearing; const dd = hr ? daysUntil(hr.date) : 0;
  const stepper = STAGES.map((s, i) => `<li class="${i < c.stage ? 'ok' : i === c.stage ? 'cur' : ''}"><span class="dot">${i < c.stage ? icon('check') : i + 1}</span><b>${esc(L(s.label))}</b><small>${c.dates[s.id] ? dateText(c.dates[s.id], { day: 'numeric', month: 'short' }) : '—'}</small></li>`).join('');
  const pct = Math.round((c.stage / (STAGES.length - 1)) * 100);
  box.innerHTML = `${sample ? `<span class="sample">${t('sampleFile')}</span>` : ''}
    <header class="cf-head"><div><small>${esc(c.ref)} · ${esc(L(a.name))}</small><h3>${esc(L(c.title))}</h3></div>
      <div class="cf-who">${avatar(m, photoOf.team(m.id))}<span><small>${t('yourLawyer')}</small><b>${esc(m.name)}</b></span></div></header>
    <ol class="stepper" style="--pct:${pct}">${stepper}</ol>
    <div class="cf-grid">
      <section class="cf-card hearing"><h4>${icon('landmark')} ${t('nextHearing')}</h4>
        ${hr ? `<div class="hdate"><b>${Number(hr.date.slice(8))}</b><span>${dateText(hr.date, { month: 'short', weekday: 'short' })}</span></div><p><b>${hr.time}</b> · ${esc(L(COURTS[hr.court] || COURTS.tpi))}</p><small>${dd === 0 ? t('today') : dd === 1 ? t('tomorrow') : t('inDays', { n: dd })}</small>` : `<p class="muted">${t('noHearing')}</p>`}
      </section>
      <section class="cf-card"><h4>${icon('message')} ${t('lastUpdate')}</h4>
        ${c.updates[0] ? `<p>${esc(L(c.updates[0].text))}</p><small>${dateText(c.updates[0].date, { day: 'numeric', month: 'long' })} · ${esc(m.short)}</small>` : `<p class="muted">${t('noUpdate')}</p>`}
      </section>
      <section class="cf-card docs"><h4>${icon('folder')} ${t('documents')} <span class="cnt">${c.docs.length}</span></h4>
        <ul>${c.docs.slice(-5).reverse().map((d) => `<li>${icon('fileText')}<span><b>${esc(d.name)}</b><small>${d.by === 'client' ? t('byYou') : t('byFirm')} · ${dateText(d.date, { day: 'numeric', month: 'short' })}</small></span></li>`).join('')}</ul>
        <label class="upload"><input type="file" data-upload="${c.id}" multiple />${icon('upload')} <span>${t('uploadDoc')}</span></label><small class="muted">${icon('lock')} ${t('uploadNote')}</small>
      </section>
      <section class="cf-card inv"><h4>${icon('receipt')} ${t('invoices')}${due ? ` <span class="due">${t('dueAmount', { n: money(due) })}</span>` : ''}</h4>
        ${invs.length ? `<ul>${invs.map((i) => `<li><span><b>${esc(i.no)}</b><small>${esc(L(i.desc))}</small></span><span class="amt">${money(i.amount)}${i.status === 'paid' ? `<em class="paid">${t('paid')}</em>` : `<button class="btn pri sm" data-pay="${i.id}">${t('payNow')}</button>`}</span></li>`).join('')}</ul>` : `<p class="muted">${t('noInvoice')}</p>`}
      </section>
    </div>`;
}

// ── how we work ────────────────────────────────────────────────────────────
function renderHow() {
  const steps = [['phone', 'how1'], ['users2', 'how2'], ['fileText', 'how3'], ['folder', 'how4']];
  $('#howSteps').innerHTML = steps.map(([ic, k], i) => `<li><span class="n">0${i + 1}</span><span class="hi">${icon(ic)}</span><h3>${t(k + 't')}</h3><p>${t(k + 'p')}</p></li>`).join('');
}

// ── fees & retainers ───────────────────────────────────────────────────────
function renderMeets() {
  $('#meetList').innerHTML = db.meetings().map((m) => `<article class="meet ${m.pop ? 'pop' : ''}"><div class="mi"><h3>${esc(L(m.name))}${m.pop ? `<span class="tag">${t('popular')}</span>` : ''}</h3><p>${esc(L(m.desc))}</p>
      <div class="chips">${m.modes.map((md) => { const x = MODES.find((y) => y.id === md); return `<span>${icon(x.icon)} ${esc(L(x.name))}</span>`; }).join('')}</div></div>
      <div class="mp"><b>${m.price ? money(m.price) : t('free')}</b><small>${icon('clock')} ${mins(m.dur)}</small><button class="btn ${m.pop ? 'pri' : 'ghost'} sm" data-book-meeting-only="${m.id}">${t('book')}</button></div></article>`).join('');
}
function renderPlans() {
  $('#plans').innerHTML = PLANS.map((p) => `<article class="plan ${p.best ? 'best' : ''}">
    ${p.best ? `<span class="badge">${t('bestValue')}</span>` : ''}
    <h4>${esc(L(p.name))}</h4><div class="price">${p.price ? `<b>${money(p.price)}</b><small>${t('perMonth')}</small>` : `<b>${t('custom')}</b>`}</div>
    <ul>${p.perks.map((x) => `<li>${icon('check')} ${esc(L(x))}</li>`).join('')}</ul>
    <button class="btn ${p.best ? 'pri' : 'ghost'} block" data-plan="${p.id}">${p.price ? t('joinPlan') : t('askQuote')}</button></article>`).join('');
}
function openPlan(id) {
  const p = PLANS.find((x) => x.id === id);
  const el = $('#sheet');
  el.innerHTML = `${sheetHead(t('planSheetT', { n: esc(L(p.name)) }), p.price ? `${money(p.price)} ${t('perMonth')}` : t('custom'))}<form class="sheet-body form" id="planForm" data-plan-id="${id}">
    <label>${t('yourName')} / ${t('company')}<input name="name" required autocomplete="name" data-autofocus /></label>
    <label>${t('yourPhone')}<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" /></label>
    <ul class="perks">${p.perks.map((x) => `<li>${icon('check')} ${esc(L(x))}</li>`).join('')}</ul><p class="hint">${t('planHint')}</p>
    <button class="btn pri block" type="submit">${t('planConfirm')}</button></form>`;
  openSheet(el);
}

// ── reviews, contact ───────────────────────────────────────────────────────
function renderReviews() {
  const total = TEAM.reduce((n, m) => n + m.reviews, 0);
  const avg = TEAM.reduce((n, m) => n + m.rating * m.reviews, 0) / total;
  $('#revTop').innerHTML = `<div class="big-rate"><b>${avg.toFixed(1)}</b><div>${stars(avg)}<small>${t('reviewsCount', { n: total })}</small></div></div>`;
  $('#revGrid').innerHTML = REVIEWS.map((r) => `<figure class="rev"><div>${stars(r.stars)}</div><blockquote>${esc(L(r.text))}</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join('');
}
function renderOffice() {
  const pics = photoOf.office(); const sec = $('#office'); sec.hidden = pics.length < 3;
  if (sec.hidden) return;
  $('#gallery').innerHTML = pics.map((src) => `<figure><img src="${src}" alt="" loading="lazy" decoding="async" /></figure>`).join('');
}
let cbDone = false;
function renderContact() {
  const s = db.get(); const n = db.shopNow(); const o = openText();
  $('#faq').innerHTML = `<h3>${t('faqT')}</h3>${GUIDES.map((f) => `<details><summary>${esc(L(f.q))}${icon('chevron')}</summary><p>${esc(L(f.a))}</p></details>`).join('')}`;
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = s.settings.hours[d]; return `<li class="${d === n.day ? 'today' : ''}"><span>${dayNames()[d]}</span><b>${h ? `${db.hhmm(h[0])} – ${db.hhmm(h[1])}` : t('closed')}</b></li>`; }).join('');
  $('#visitCard').innerHTML = `<h3>${t('findUs')}</h3><p class="addr">${icon('pin')} ${esc(L(SHOP.address))}</p>
    <div class="map" aria-hidden="true"><svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#e9e4d8"/><g stroke="#fff" stroke-width="10" fill="none"><path d="M-10 40L330 70M40 -10L90 160M180 -10L230 160M-10 120L330 100"/></g><g stroke="#d9d1bf" stroke-width="5" fill="none"><path d="M-10 90L330 20M130 -10L150 160M260 -10L290 160"/></g><circle cx="150" cy="78" r="26" fill="rgba(23,41,74,.18)"/><path d="M150 52c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16Z" fill="#17294a"/><circle cx="150" cy="68" r="5.5" fill="#fff"/></svg></div>
    <div class="row-btns"><button class="btn pri sm" data-demo="call">${icon('phone')} ${t('call')}</button><button class="btn ghost sm" data-demo="WhatsApp">${icon('message')} WhatsApp</button><button class="btn ghost sm" data-demo="maps">${icon('pin')} ${t('directions')}</button></div>
    <p class="urgent">${icon('bell')} ${t('urgentLine')}: <b dir="ltr">${SHOP.urgentLine}</b></p>
    <p class="open-now"><i class="${o.cls}"></i>${esc(o.txt)}</p><ul class="hours">${rows}</ul>
    <ul class="amen">${AMENITIES.map((a) => `<li>${icon(a.icon)} ${esc(L(a.label))}</li>`).join('')}</ul>`;
  $('#callbackCard').innerHTML = cbDone
    ? `<div class="done"><div class="done-ic">${icon('check')}</div><h3>${t('cbDoneT')}</h3><p>${t('cbDoneS')}</p><button class="btn ghost" data-cb-again>${t('cbAgain')}</button></div>`
    : `<h3>${t('cbT')}</h3><p class="sub">${t('cbSub')}</p>
      <form class="form" id="cbForm"><label>${t('yourName')}<input name="name" required autocomplete="name" /></label>
      <label>${t('yourPhone')}<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" /></label>
      <label>${t('fq_area')}<select name="area">${AREAS.map((a) => `<option value="${a.id}">${esc(L(a.name))}</option>`).join('')}</select></label>
      <label>${t('noteLabel')}<textarea name="note" rows="2" placeholder="${t('cbNotePh')}"></textarea></label>
      <p class="err" id="cbErr" role="alert"></p><button class="btn pri block" type="submit">${icon('phone')} ${t('cbSend')}</button></form>`;
}

// ── render everything ──────────────────────────────────────────────────────
function renderAll() {
  applyStatic(); renderStatus(); renderHero(); renderQuick(); renderFacts(); renderAreas(); renderFinder(); renderTeam(); renderTrack();
  renderHow(); renderMeets(); renderPlans(); renderReviews(); renderOffice(); renderContact();
  $$('#facts [data-count]').forEach(countUp);
  if (openedSheet() && openedSheet() === $('#sheet')) refreshSheets();
}

// ── events ─────────────────────────────────────────────────────────────────
function wire() {
  document.addEventListener('click', (e) => {
    const g = (sel) => e.target.closest(sel);
    let x;
    if ((x = g('[data-ddtoggle]'))) { const box = x.closest('.dd'); const on = box.classList.toggle('open'); x.setAttribute('aria-expanded', on); return; }
    if (!g('.dd')) $$('.dd.open').forEach((d) => { d.classList.remove('open'); d.querySelector('[data-ddtoggle]').setAttribute('aria-expanded', 'false'); });
    if ((x = g('[data-lang]'))) { setLang(x.dataset.lang); return; }
    if (g('[data-close]')) { closeSheet(); return; }
    if ((x = g('[data-area]'))) { openArea = openArea === x.dataset.area ? '' : x.dataset.area; renderAreas(); return; }
    if ((x = g('[data-book-area]'))) { openBooking({ area: x.dataset.bookArea, meeting: x.dataset.bookMeeting || '' }); return; }
    if ((x = g('[data-book-meeting-only]'))) { openBooking({ meeting: x.dataset.bookMeetingOnly }); return; }
    if ((x = g('[data-member]'))) { const m = memberById(x.dataset.member); openBooking({ member: m.id, area: m.skills[0] }); return; }
    if (g('#heroBook')) { const v = $('#quickArea').value; openBooking(v ? { area: v } : {}); return; }
    if (g('#heroCall')) { openBooking({ meeting: 'intro' }); return; }
    if (g('#navBook, #tabBook')) { openBooking(); return; }
    if (g('#myBtn')) { openMine(); return; }
    if (g('[data-go-track]')) { closeSheet(); document.getElementById('track').scrollIntoView({ behavior: 'smooth' }); return; }
    if ((x = g('[data-fnd-area]'))) { fnd.area = x.dataset.fndArea; renderFinder(); return; }
    if ((x = g('[data-fnd-urg]'))) { fnd.urgency = x.dataset.fndUrg; renderFinder(); return; }
    if ((x = g('[data-plan]'))) { openPlan(x.dataset.plan); return; }
    if ((x = g('[data-pay]'))) { db.payInvoice(x.dataset.pay); toast(t('paidDemo')); renderTrack(); return; }
    if (g('#trackDemo')) { $('#trackRef').value = DEMO_REF; $('#trackPhone').value = fmtPhone(DEMO_PHONE); $('#trackErr').textContent = ''; return; }
    if (g('[data-cb-again]')) { cbDone = false; renderContact(); return; }
    if ((x = g('[data-demo]'))) { toast(t('demoAction', { x: x.dataset.demo === 'call' ? SHOP.phone : x.dataset.demo === 'maps' ? 'Maps' : 'WhatsApp' })); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'trackForm') {
      e.preventDefault();
      const c = db.findCase($('#trackRef').value, $('#trackPhone').value);
      if (!c) { $('#trackErr').textContent = t('fileNotFound'); return; }
      $('#trackErr').textContent = ''; track.caseId = c.id; renderTrack();
      if (matchMedia('(max-width: 900px)').matches) $('#caseFile').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (f.id === 'cbForm') {
      e.preventDefault(); const d = new FormData(f);
      if (db.digits(d.get('phone')).length < 9) { $('#cbErr').textContent = t('errPhone'); return; }
      db.addRequest({ type: 'callback', name: String(d.get('name')).trim(), phone: String(d.get('phone')), area: String(d.get('area')), note: String(d.get('note') || '').trim() });
      cbDone = true; renderContact(); return;
    }
    if (f.id === 'planForm') {
      e.preventDefault(); const d = new FormData(f);
      if (db.digits(d.get('phone')).length < 9) { toast(t('errPhone')); return; }
      db.addRequest({ type: 'plan', name: String(d.get('name')).trim(), phone: String(d.get('phone')), plan: f.dataset.planId, area: 'business', note: '' });
      closeSheet(); toast(t('planDone')); return;
    }
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('[data-upload]')) {
      const files = [...el.files]; if (!files.length) return;
      files.forEach((f) => db.addCaseDoc(el.dataset.upload, f.name, 'client'));
      toast(t('uploaded', { n: files.length })); renderTrack();
    }
  });
  $('#scrim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $$('.dd.open').forEach((d) => d.classList.remove('open')); closeSheet(); } });
  $('#demobarClose').addEventListener('click', () => { $('#demobar').hidden = true; });
  window.addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 10), { passive: true });
  wireBooking();

  // live updates from the owner dashboard (another tab) and the demo auto-flow
  db.subscribe(() => {
    renderStatus(); renderTeam(); renderTrack();
    refreshSheets();
  });
  setInterval(() => { db.tick(); }, 3000);
  setInterval(() => { renderStatus(); renderTeam(); }, 20000);

  // reveal on scroll, count-up, tab bar highlight
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in'); io.unobserve(en.target);
    if (en.target.matches('.facts')) $$('#facts [data-count]').forEach(countUp);
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.sec-head, .area, .member, .plan, .meet, .rev, .card, .finder, .casefile, .track-intro, .steps4 li, .facts').forEach((el, i) => { el.classList.add('rv'); el.style.setProperty('--d', `${(i % 4) * 70}ms`); io.observe(el); });
  const secs = ['top', 'areas', 'track', 'contact'].map((id) => document.getElementById(id));
  const tabIo = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { $$('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === en.target.id)); } }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((el) => el && tabIo.observe(el));
  // scroll progress
  const root = document.documentElement;
  const onScroll = () => { const max = root.scrollHeight - innerHeight; root.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(4) : 0); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

renderAll();
wire();

// The owner can switch the demo off (or let it expire) from the MBN DEV dashboard.
// If the server cannot be reached the site simply stays open: nothing here is sensitive.
fetchConfig().then((cfg) => {
  if (!cfg.ok || cfg.live) return;
  const o = document.createElement('div');
  o.className = 'demo-off'; o.setAttribute('role', 'alert');
  o.innerHTML = `<div><b>ALAOUI</b><h1>${esc(t(cfg.state === 'expired' ? 'offExpired' : 'offTitle'))}</h1><p>${esc(t('offBody'))}</p><a class="btn pri" href="https://mbndev.ma">mbndev.ma</a></div>`;
  document.body.append(o);
  document.documentElement.style.overflow = 'hidden';
});
