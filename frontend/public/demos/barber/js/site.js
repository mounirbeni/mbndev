// TARZ Barber Club — public site. Vanilla JS modules, no build step.
import { SHOP, CATEGORIES, SERVICES, BARBERS, STYLES, FINDER, matchStyle, PLANS, GIFT_AMOUNTS, GIFT_DESIGNS, PRODUCTS, REVIEWS, FAQ, AMENITIES, photoOf } from './data.js';
import { LANGS } from './i18n.js';
import * as db from './store.js';
import { icon, langDropdown } from './icons.js';
import { bust, serviceArt, styleArt, productArt, heroArt, stars } from './art.js';
import { fetchConfig } from './gate.js';
import { $, $$, esc, ui, t, L, money, mins, dateText, dayWord, dayNames, toast, openSheet, closeSheet, sheetHead, avatar, openedSheet } from './ui.js';
import { openBooking, openMine, openQueue, refreshSheets, wireBooking } from './booking.js';

const svcById = (id) => SERVICES.find((s) => s.id === id);
const barberById = (id) => BARBERS.find((b) => b.id === id);
const fmtPhone = (p) => String(p).replace(/(\d{2})(?=\d)/g, '$1 ').trim();

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
}
function setLang(l) { ui.lang = l; db.update((s) => { s.lang = l; }); renderAll(); }

// ── status: open/closed, next free chair, live card ────────────────────────
function openText() {
  const o = db.openState();
  if (o.open) return { cls: o.soon ? 'soon' : '', txt: t(o.soon ? 'closesSoon' : 'openNow', { t: db.hhmm(o.until) }) };
  const d = o.k === 0 ? t('today') : o.k === 1 ? t('tomorrow') : dayNames()[o.day];
  return { cls: 'closed', txt: t('closedNow', { d, t: db.hhmm(o.at ?? 0) }) };
}
function renderStatus() {
  const o = openText();
  const dot = `<i class="${o.cls}"></i>${esc(o.txt)}`;
  $('#chipOpen').innerHTML = dot; $('#navStatus').innerHTML = dot;
  const nf = db.nextFree('any', 30);
  $('#chipNext').innerHTML = nf ? `${icon('clock')}<span>${t('nextFreeChair', { w: esc(dayWord(nf.date)), t: db.hhmm(nf.start) })}</span>` : `${icon('clock')}<span>${t('noSlots')}</span>`;
  const mineCount = myUpcoming();
  const dotn = $('#myDot'); if (dotn) { dotn.hidden = !mineCount; dotn.textContent = mineCount; }
  renderLive();
}
function myUpcoming() {
  const s = db.get(); const n = db.shopNow();
  return s.bookings.filter((b) => s.my.ids.includes(b.id) && ['pending', 'confirmed', 'arrived', 'inchair'].includes(b.status) && db.epochOf(b.date, b.start + b.dur) >= n.epoch).length;
}

function renderLive() {
  const s = db.get();
  const ch = db.chairs(); const q = db.queueInfo();
  const mine = s.walkins.find((w) => w.id === s.my.queue && ['waiting', 'inchair'].includes(w.status));
  const rows = ch.map((c) => {
    const b = barberById(c.barber);
    const txt = c.state === 'off' ? t('chairOff') : c.state === 'busy' ? (c.until ? t('chairBusyUntil', { t: db.hhmm(c.until) }) : t('chairBusy')) : t('chairFree');
    return `<li class="${c.state}"><span class="dotc" style="--c:${b.color}"></span><b>${esc(b.name)}</b><em>${txt}</em></li>`;
  }).join('');
  const summary = q.waiting ? t('waitingSummary', { n: q.waiting, m: q.wait }) : (q.free ? t('noWait') : t('allBusy'));
  $('#liveCard').innerHTML = `<header><span class="pulse"></span><b>${t('liveT')}</b><small>${esc(summary)}</small></header><ul>${rows}</ul>
    ${mine ? `<button class="btn gold block" id="liveTicket">${icon('armchair')} ${mine.status === 'inchair' ? t('yourTurn') : t('yourPositionN', { n: db.positionOf(mine.id) })}</button>`
    : `<button class="btn ghost block" id="liveJoin">${icon('users')} ${t('joinQueue')}</button>`}`;
}

function renderMarquee() {
  const names = SERVICES.map((x) => `<span>${esc(L(x.name))}</span>`).join('');
  $('#marquee').innerHTML = names + names;
}

function renderHero() {
  const photo = photoOf.hero();
  $('#heroArt').innerHTML = photo ? `<img src="${photo}" alt="" fetchpriority="high" />` : heroArt();
  $('#heroArt').classList.toggle('photo', !!photo);
}

// ── services ───────────────────────────────────────────────────────────────
let svcFilter = 'all';
function renderServices() {
  const cats = [{ id: 'all', name: { en: t('all'), fr: t('all'), ar: t('all') } }, ...CATEGORIES];
  $('#svcFilters').innerHTML = cats.map((c) => `<button class="pill ${svcFilter === c.id ? 'on' : ''}" role="tab" aria-selected="${svcFilter === c.id}" data-svcfilter="${c.id}">${esc(L(c.name))}</button>`).join('');
  const list = db.services().filter((s) => svcFilter === 'all' || s.cat === svcFilter);
  $('#svcGrid').innerHTML = list.map((s) => `<article class="svc ${s.pop ? 'pop' : ''}">
      <div class="svc-art">${serviceArt(s.art)}${s.pop ? `<span class="badge">${t('popular')}</span>` : ''}</div>
      <div class="svc-body"><h3>${esc(L(s.name))}</h3><p>${esc(L(s.desc))}</p></div>
      <footer><span class="meta"><b>${money(s.price)}</b><small>${icon('clock')} ${mins(s.dur)}</small></span><button class="btn gold sm" data-svc="${s.id}">${t('book')}</button></footer>
    </article>`).join('');
}

// ── barbers ────────────────────────────────────────────────────────────────
function renderTeam() {
  const ch = db.chairs();
  $('#teamGrid').innerHTML = BARBERS.filter((b) => db.barberActive(b.id)).map((b) => {
    const nf = db.nextFree(b.id, 30);
    const st = ch.find((c) => c.barber === b.id)?.state || 'off';
    const photo = photoOf.barber(b.id);
    return `<article class="barber">
      <div class="b-top">${avatar(b, photo)}<div><h3>${esc(b.name)}</h3><p>${esc(L(b.role))}</p><div class="rate-row">${stars(b.rating)}<b>${b.rating.toFixed(1)}</b><small>(${b.reviews})</small></div></div><span class="state ${st}">${t(st === 'free' ? 'chairFree' : st === 'busy' ? 'chairBusy' : 'chairOff')}</span></div>
      <p class="bio">${esc(L(b.bio))}</p>
      <div class="skills">${b.skills.map((id) => `<span>${esc(L(svcById(id).name))}</span>`).join('')}</div>
      <footer><span class="next">${icon('clock')} ${nf ? `${t('nextFree')}: <b>${esc(dayWord(nf.date))} ${db.hhmm(nf.start)}</b>` : t('noSlots')}</span><button class="btn gold sm" data-barber="${b.id}">${t('bookWith', { n: esc(b.name) })}</button></footer>
    </article>`;
  }).join('');
}

// ── style finder ───────────────────────────────────────────────────────────
const fnd = { length: 'short', vibe: 'clean', beard: 'none' };
function renderFinder() {
  const row = (key, label) => `<div class="q"><h4>${t(label)}</h4><div class="opts">${FINDER[key].map((o) => `<button class="pill ${fnd[key] === o.id ? 'on' : ''}" data-fnd="${key}" data-val="${o.id}" aria-pressed="${fnd[key] === o.id}">${esc(L(o.label))}</button>`).join('')}</div></div>`;
  const st = STYLES.find((x) => x.id === matchStyle(fnd));
  const svc = db.services().find((x) => x.id === st.service) || svcById(st.service);
  const b = barberById(st.barber);
  const photo = photoOf.style(st.id);
  $('#finder').innerHTML = `<div class="questions">${row('length', 'fq_length')}${row('vibe', 'fq_vibe')}${row('beard', 'fq_beard')}</div>
    <div class="result"><div class="r-art">${photo ? `<img src="${photo}" alt="${esc(L(st.name))}" loading="lazy" />` : styleArt(st.art)}</div>
      <div class="r-body"><small>${t('yourMatch')}</small><h3>${esc(L(st.name))}</h3><p>${esc(L(st.why))}</p>
        <ul><li>${icon('scissors')} ${esc(L(svc.name))} · ${money(db.svcPrice(svcById(st.service)))} · ${mins(svc.dur)}</li><li>${icon('user')} ${t('bestWith', { n: esc(b.name) })}</li></ul>
        <button class="btn gold" data-style="${st.id}">${t('bookThisCut')} ${icon('arrowRight')}</button></div></div>`;
}

// ── club: stamp card, gift cards, memberships ──────────────────────────────
let lookup = '';
function renderStampCard() {
  const s = db.get();
  const key = db.digits(lookup || s.my.phone);
  const c = key.length >= 9 ? db.clientOf(key) : null;
  const demo = !c;
  const stamps = c ? c.stamps : 5;
  const n = SHOP.stampsForReward;
  const filled = Math.min(stamps, n);
  const circles = Array.from({ length: n }, (_, i) => `<span class="stamp ${i < filled ? 'on' : ''} ${i === n - 1 ? 'last' : ''}" style="--i:${i}">${i === n - 1 ? icon('gift') : (i < filled ? icon('scissors') : i + 1)}</span>`).join('');
  const left = Math.max(0, n - stamps);
  $('#stampCard').innerHTML = `<div class="sc-top"><span>${t('stampCardT')}</span><small>${demo ? t('sampleCard') : esc(c.name)}</small></div>
    <div class="stamps">${circles}</div>
    <p class="sc-msg">${stamps >= n ? `<b>${icon('gift')} ${t('rewardReady')}</b>` : t('toGo', { n: left })}</p>
    <form class="lookup" id="lookupForm"><input id="lookupPhone" inputmode="tel" value="${esc(lookup || (s.my.phone ? fmtPhone(s.my.phone) : ''))}" placeholder="06 12 34 56 78" aria-label="${t('yourPhone')}" /><button class="btn ghost sm" type="submit">${t('checkCard')}</button></form>
    <small class="tiny">${demo && key.length >= 9 ? t('noCardYet') : t('tryDemo')}</small>`;
}

let gift = { amount: GIFT_AMOUNTS[1], design: 'brass', to: '', from: '', msg: '', code: '' };
function giftCardView(g, code) {
  const d = GIFT_DESIGNS.find((x) => x.id === g.design);
  return `<div class="gcard" style="--a:${d.a};--b:${d.b}"><span class="gc-brand">TARZ</span><b>${money(g.amount)}</b><small>${t('giftFor', { n: esc(g.to || '—') })}</small><code>${esc(code || 'TARZ-XXXX-XX')}</code></div>`;
}
function renderGift() {
  if (gift.code) {
    $('#giftBox').innerHTML = `<h3>${t('giftDoneT')}</h3>${giftCardView(gift, gift.code)}<p class="hint">${t('giftDoneSub')}</p><div class="row-btns"><button class="btn gold sm" data-copy="${esc(gift.code)}">${icon('download')} ${t('copyCode')}</button><button class="btn ghost sm" data-giftagain>${t('giftAnother')}</button></div>`;
    return;
  }
  $('#giftBox').innerHTML = `<h3>${t('giftT')}</h3><p class="sub">${t('giftSub')}</p>
    ${giftCardView(gift, '')}
    <div class="opts">${GIFT_AMOUNTS.map((a) => `<button class="pill ${gift.amount === a ? 'on' : ''}" data-gamount="${a}">${money(a)}</button>`).join('')}</div>
    <div class="opts">${GIFT_DESIGNS.map((d) => `<button class="pill ${gift.design === d.id ? 'on' : ''}" data-gdesign="${d.id}">${esc(L(d.name))}</button>`).join('')}</div>
    <form class="form" id="giftForm"><div class="two"><label>${t('giftTo')}<input data-gf="to" value="${esc(gift.to)}" required /></label><label>${t('giftFrom')}<input data-gf="from" value="${esc(gift.from)}" required /></label></div>
    <button class="btn gold block" type="submit">${icon('gift')} ${t('giftBuy', { p: money(gift.amount) })}</button></form>`;
}

function renderPlans() {
  $('#plans').innerHTML = PLANS.map((p) => `<article class="plan ${p.best ? 'best' : ''}">
    ${p.best ? `<span class="badge">${t('bestValue')}</span>` : ''}
    <h4>${esc(L(p.name))}</h4><div class="price"><b>${money(p.price)}</b><small>${t('perMonth')}</small></div>
    <ul>${p.perks.map((x) => `<li>${icon('check')} ${esc(L(x))}</li>`).join('')}</ul>
    <button class="btn ${p.best ? 'gold' : 'ghost'} block" data-plan="${p.id}">${t('joinPlan')}</button></article>`).join('');
}
function openPlan(id) {
  const p = PLANS.find((x) => x.id === id);
  const el = $('#sheet');
  el.innerHTML = `${sheetHead(t('planSheetT', { n: esc(L(p.name)) }), `${money(p.price)} ${t('perMonth')}`)}<form class="sheet-body form" id="planForm" data-plan-id="${id}">
    <label>${t('yourName')}<input name="name" required autocomplete="name" data-autofocus /></label>
    <label>${t('yourPhone')}<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" /></label>
    <ul class="perks">${p.perks.map((x) => `<li>${icon('check')} ${esc(L(x))}</li>`).join('')}</ul><p class="hint">${t('planHint')}</p>
    <button class="btn gold block" type="submit">${t('planConfirm')}</button></form>`;
  openSheet(el);
}

// ── shop ───────────────────────────────────────────────────────────────────
const cartQty = () => db.get().cart.reduce((n, i) => n + i.qty, 0);
function renderProducts() {
  const s = db.get();
  const photo = (p) => photoOf.product(p.id);
  $('#prodGrid').innerHTML = `<div class="shop-bar"><span>${icon('bag')} ${t('shopNote')}</span><button class="btn ghost sm" id="bagBtn">${t('bag')} <b id="bagCount">${cartQty()}</b></button></div>` + PRODUCTS.map((p) => {
    const stock = s.stock[p.id] ?? 0;
    return `<article class="prod ${stock ? '' : 'out'}">
      <div class="p-art">${photo(p) ? `<img src="${photo(p)}" alt="${esc(L(p.name))}" loading="lazy" />` : productArt(p.art, p.tint)}${stock && stock <= 3 ? `<span class="badge warn">${t('onlyLeft', { n: stock })}</span>` : ''}</div>
      <h3>${esc(L(p.name))}</h3><p>${esc(L(p.note))}</p>
      <footer><b>${money(p.price)}</b><button class="btn ${stock ? 'gold' : 'ghost'} sm" data-addprod="${p.id}" ${stock ? '' : 'disabled'}>${stock ? `${icon('plus')} ${t('add')}` : t('soldOut')}</button></footer></article>`;
  }).join('');
}
function renderBag() {
  const s = db.get();
  const lines = s.cart.map((i) => { const p = PRODUCTS.find((x) => x.id === i.id); return { ...i, p }; });
  const total = lines.reduce((n, l) => n + l.p.price * l.qty, 0);
  const el = $('#bag');
  el.innerHTML = `${sheetHead(t('yourBag'), t('shopNote'))}<div class="sheet-body">${lines.length ? lines.map((l) => `<div class="bag-line"><div class="bl-art">${productArt(l.p.art, l.p.tint)}</div><div><b>${esc(L(l.p.name))}</b><small>${money(l.p.price)}</small></div>
      <div class="qty"><button data-bagminus="${l.id}" aria-label="−">${icon('minus')}</button><span>${l.qty}</span><button data-bagplus="${l.id}" aria-label="+">${icon('plus')}</button></div></div>`).join('')
    + `<form class="form" id="bagForm"><label>${t('yourName')}<input name="name" required autocomplete="name" /></label><label>${t('yourPhone')}<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" /></label>
       <div class="sum"><div class="tot"><span>${t('total')}</span><b>${money(total)}</b></div></div><p class="pay-note">${icon('wallet')} ${t('payInShop')}</p><button class="btn gold block" type="submit">${t('reserve')}</button></form>`
    : `<p class="empty">${t('bagEmpty')}</p>`}</div>`;
}
function addProduct(id, d = 1) {
  db.update((s) => {
    const line = s.cart.find((i) => i.id === id);
    const stock = s.stock[id] ?? 0;
    if (line) { line.qty = Math.min(stock, line.qty + d); if (line.qty <= 0) s.cart = s.cart.filter((i) => i.id !== id); }
    else if (d > 0 && stock > 0) s.cart.push({ id, qty: 1 });
  });
}

// ── reviews, visit ─────────────────────────────────────────────────────────
function renderReviews() {
  const total = BARBERS.reduce((n, b) => n + b.reviews, 0);
  const avg = BARBERS.reduce((n, b) => n + b.rating * b.reviews, 0) / total;
  $('#revTop').innerHTML = `<div class="big-rate"><b>${avg.toFixed(1)}</b><div>${stars(avg)}<small>${t('reviewsCount', { n: total })}</small></div></div>`;
  $('#revGrid').innerHTML = REVIEWS.map((r) => `<figure class="rev"><div>${stars(r.stars)}</div><blockquote>${esc(L(r.text))}</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join('');
}
function renderVisit() {
  const s = db.get(); const n = db.shopNow(); const o = openText();
  $('#visitInfo').innerHTML = `<h3>${t('findUs')}</h3><p class="addr">${icon('pin')} ${esc(L(SHOP.address))}</p>
    <div class="map" aria-hidden="true"><svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#1b2420"/><g stroke="#2d3a34" stroke-width="10" fill="none"><path d="M-10 40L330 70M40 -10L90 160M180 -10L230 160M-10 120L330 100"/></g><g stroke="#243029" stroke-width="5" fill="none"><path d="M-10 90L330 20M130 -10L150 160M260 -10L290 160"/></g><circle cx="150" cy="78" r="26" fill="rgba(201,162,77,.18)"/><path d="M150 52c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16Z" fill="var(--brass)"/><circle cx="150" cy="68" r="5.5" fill="#0d1210"/></svg></div>
    <div class="row-btns"><button class="btn gold sm" data-demo="call">${icon('phone')} ${t('call')}</button><button class="btn ghost sm" data-demo="WhatsApp">${icon('message')} WhatsApp</button><button class="btn ghost sm" data-demo="maps">${icon('pin')} ${t('directions')}</button></div>
    <ul class="amen">${AMENITIES.map((a) => `<li>${icon(a.icon)} ${esc(L(a.label))}</li>`).join('')}</ul>`;
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = s.settings.hours[d]; return `<li class="${d === n.day ? 'today' : ''}"><span>${dayNames()[d]}</span><b>${h ? `${db.hhmm(h[0])} – ${db.hhmm(h[1])}` : t('closed')}</b></li>`; }).join('');
  $('#hoursCard').innerHTML = `<h3>${t('hoursT')}</h3><p class="open-now"><i class="${o.cls}"></i>${esc(o.txt)}</p><ul class="hours">${rows}</ul>`;
  $('#faq').innerHTML = `<h3>${t('faqT')}</h3>${FAQ.map((f) => `<details><summary>${esc(L(f.q))}${icon('chevron')}</summary><p>${esc(L(f.a))}</p></details>`).join('')}`;
}

// ── render everything ──────────────────────────────────────────────────────
function renderAll() {
  applyStatic(); renderStatus(); renderHero(); renderMarquee(); renderServices(); renderTeam(); renderFinder();
  renderStampCard(); renderGift(); renderPlans(); renderProducts(); renderReviews(); renderVisit();
  if (openedSheet() === $('#bag')) renderBag();
}

// ── events ─────────────────────────────────────────────────────────────────
function copy(text) {
  try { navigator.clipboard.writeText(text); toast(t('copied')); } catch { toast(text); }
}
function wire() {
  document.addEventListener('click', (e) => {
    const g = (sel) => e.target.closest(sel);
    let x;
    if ((x = g('[data-ddtoggle]'))) { const box = x.closest('.dd'); const on = box.classList.toggle('open'); x.setAttribute('aria-expanded', on); return; }
    if (!g('.dd')) $$('.dd.open').forEach((d) => { d.classList.remove('open'); d.querySelector('[data-ddtoggle]').setAttribute('aria-expanded', 'false'); });
    if ((x = g('[data-lang]'))) { setLang(x.dataset.lang); return; }
    if (g('[data-close]')) { closeSheet(); return; }
    if ((x = g('[data-svc]'))) { openBooking({ services: [x.dataset.svc] }); return; }
    if ((x = g('[data-barber]'))) { openBooking({ barber: x.dataset.barber }); return; }
    if ((x = g('[data-style]'))) { const st = STYLES.find((y) => y.id === x.dataset.style); openBooking({ services: [st.service], barber: st.barber }); return; }
    if (g('#heroBook, #navBook, #tabBook')) { openBooking(); return; }
    if (g('#heroQueue, #liveJoin, #liveTicket')) { openQueue(); return; }
    if (g('#myBtn')) { openMine(); return; }
    if ((x = g('[data-svcfilter]'))) { svcFilter = x.dataset.svcfilter; renderServices(); return; }
    if ((x = g('[data-fnd]'))) { fnd[x.dataset.fnd] = x.dataset.val; renderFinder(); return; }
    if ((x = g('[data-gamount]'))) { gift.amount = Number(x.dataset.gamount); renderGift(); return; }
    if ((x = g('[data-gdesign]'))) { gift.design = x.dataset.gdesign; renderGift(); return; }
    if (g('[data-giftagain]')) { gift = { ...gift, to: '', from: '', msg: '', code: '' }; renderGift(); return; }
    if ((x = g('[data-copy]'))) { copy(x.dataset.copy); return; }
    if ((x = g('[data-plan]'))) { openPlan(x.dataset.plan); return; }
    if ((x = g('[data-addprod]'))) { addProduct(x.dataset.addprod); toast(t('addedToBag')); return; }
    if (g('#bagBtn')) { renderBag(); openSheet($('#bag')); return; }
    if ((x = g('[data-bagplus]'))) { addProduct(x.dataset.bagplus, 1); renderBag(); return; }
    if ((x = g('[data-bagminus]'))) { addProduct(x.dataset.bagminus, -1); renderBag(); return; }
    if ((x = g('[data-demo]'))) { toast(t('demoAction', { x: x.dataset.demo === 'call' ? SHOP.phone : x.dataset.demo === 'maps' ? 'Maps' : 'WhatsApp' })); return; }
  });
  // forms
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'lookupForm') { e.preventDefault(); lookup = $('#lookupPhone').value; renderStampCard(); return; }
    if (f.id === 'giftForm') {
      e.preventDefault();
      gift.to = gift.to.trim(); gift.from = gift.from.trim();
      gift.code = db.createGift({ amount: gift.amount, design: gift.design, to: gift.to, from: gift.from, msg: '' }).code;
      renderGift(); return;
    }
    if (f.id === 'planForm') {
      e.preventDefault(); const d = new FormData(f);
      db.update((s) => { s.subs.push({ id: `s${Date.now()}`, plan: f.dataset.planId, name: String(d.get('name')).trim(), phone: String(d.get('phone')), at: db.shopNow().epoch }); });
      closeSheet(); toast(t('planDone')); return;
    }
    if (f.id === 'bagForm') {
      e.preventDefault(); const d = new FormData(f);
      if (db.digits(d.get('phone')).length < 9) { toast(t('errPhone')); return; }
      const r = db.reserve({ name: String(d.get('name')).trim(), phone: String(d.get('phone')), items: db.get().cart.map((i) => ({ ...i })) });
      closeSheet(); toast(t('reserved', { n: r.no })); return;
    }
    if (f.id === 'newsForm') {
      e.preventDefault(); const v = $('#newsEmail').value.trim();
      db.update((s) => { if (!s.newsletter.includes(v)) s.newsletter.push(v); }); f.reset(); toast(t('subscribed')); return;
    }
  });
  document.addEventListener('input', (e) => {
    const k = e.target.dataset?.gf; if (k) gift[k] = e.target.value;
  });
  $('#scrim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $$('.dd.open').forEach((d) => d.classList.remove('open')); closeSheet(); }
  });
  $('#demobarClose').addEventListener('click', () => { $('#demobar').hidden = true; });
  window.addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 10), { passive: true });
  wireBooking();

  // live updates from the owner dashboard (another tab) and the demo auto-flow
  let lastQueue = '';
  db.subscribe((s) => {
    renderStatus(); renderTeam(); renderProducts();
    if (openedSheet() === $('#bag')) renderBag();
    refreshSheets();
    const w = s.walkins.find((y) => y.id === s.my.queue);
    const sig = w ? `${w.id}:${w.status}` : '';
    if (sig !== lastQueue) { if (w && w.status === 'inchair' && lastQueue.endsWith('waiting')) toast(t('yourTurn')); lastQueue = sig; }
    if (!openedSheet()) renderStampCard();
  });
  setInterval(() => { db.tick(); }, 3000);
  setInterval(() => { renderStatus(); renderTeam(); }, 20000);

  // reveal on scroll + tab bar highlight
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.sec-head, .svc, .barber, .prod, .plan, .rev, .visit-card, .finder, .stamp-card, .gift-box').forEach((el) => { el.classList.add('rv'); io.observe(el); });
  const secs = ['top', 'team', 'club', 'visit'].map((id) => document.getElementById(id));
  const tabIo = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { $$('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === en.target.id)); } }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((el) => el && tabIo.observe(el));
}

renderAll();
wire();

// The owner can switch the demo off (or let it expire) from the MBN DEV dashboard.
// If the server cannot be reached the site simply stays open: nothing here is sensitive.
fetchConfig().then((cfg) => {
  if (!cfg.ok || cfg.live) return;
  const o = document.createElement('div');
  o.className = 'demo-off'; o.setAttribute('role', 'alert');
  o.innerHTML = `<div><b>TARZ</b><h1>${esc(t(cfg.state === 'expired' ? 'offExpired' : 'offTitle'))}</h1><p>${esc(t('offBody'))}</p><a class="btn gold" href="https://mbndev.ma">mbndev.ma</a></div>`;
  document.body.append(o);
  document.documentElement.style.overflow = 'hidden';
});
