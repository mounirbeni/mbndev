// LALLA Beauty House — public site. Vanilla JS modules, no build step.
import { SHOP, CATEGORIES, SERVICES, TEAM, FINDER, RITUALS, BRIDAL, EVENT_TYPES, PLANS, GIFT_AMOUNTS, GIFT_DESIGNS, PRODUCTS, REVIEWS, FAQ, AMENITIES, photoOf } from './data.js';
import { LANGS } from './i18n.js';
import * as db from './store.js';
import { icon, langDropdown } from './icons.js';
import { serviceArt, productArt, heroArt, stars } from './art.js';
import { fetchConfig } from './gate.js';
import { $, $$, esc, ui, t, L, money, mins, dayWord, dayNames, toast, openSheet, closeSheet, sheetHead, avatar, openedSheet } from './ui.js';
import { openBooking, openMine, refreshSheets, wireBooking } from './booking.js';
import { initFx, petalField, burst } from './fx.js';

const svcById = (id) => SERVICES.find((s) => s.id === id);
const memberById = (id) => TEAM.find((m) => m.id === id);
const catName = (id) => L(CATEGORIES.find((c) => c.id === id).name);
const fmtPhone = (p) => String(p).replace(/(\d{2})(?=\d)/g, '$1 ').trim();

// ── language ───────────────────────────────────────────────────────────────
function applyStatic() {
  const lg = LANGS.find((x) => x.id === ui.lang);
  document.documentElement.lang = ui.lang; document.documentElement.dir = lg.dir;
  $$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  $$('[data-t-ph]').forEach((el) => { el.placeholder = t(el.dataset.tPh); });
  $$('[data-t-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
  splitHero(); renderStamp();
  $$('[data-ic]').forEach((el) => { el.innerHTML = icon(el.dataset.ic); });
  $('#langs').innerHTML = langDropdown({ options: LANGS.map((x) => ({ id: x.id, short: x.label, name: x.name })), current: ui.lang, label: t('language') });
  $('#myBtn').innerHTML = `${icon('calendar')}<span class="dotn" id="myDot" hidden></span>`;
  $('#myBtn').setAttribute('aria-label', t('myBookings'));
  const s = db.get().settings;
  const a = $('#announce'); a.hidden = !(s.banner && (s.bannerText || t('announce')));
  $('#announceText').textContent = s.bannerText || t('announce');
}
// headline words rise in one by one
function splitHero() {
  let i = 0;
  $$('#heroTitle > [data-t]').forEach((el) => {
    el.innerHTML = el.textContent.split(' ').filter(Boolean).map((w) => `<span class="w" style="--i:${i++}">${esc(w)}</span>`).join(' ');
  });
}
function renderStamp() {
  const tp = $('#stampText'); if (!tp) return;
  const ar = ui.lang === 'ar'; const txt = ar ? t('badgeText') : t('badgeText').toUpperCase();
  tp.textContent = txt;
  if (!ar) { tp.setAttribute('textLength', '286'); tp.setAttribute('lengthAdjust', 'spacing'); tp.parentElement.style.fontSize = ''; return; }
  // Arabic letters must stay joined, so scale the type to fill the ring instead of stretching it
  tp.removeAttribute('textLength'); tp.removeAttribute('lengthAdjust');
  const fit = () => { const el = tp.parentElement; el.style.fontSize = '10px'; const len = tp.getComputedTextLength(); if (len) el.style.fontSize = `${Math.min(15, (10 * 284) / len).toFixed(2)}px`; };
  fit(); document.fonts?.ready.then(() => { if (ui.lang === 'ar') fit(); });
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
  const dot = `<i class="${o.cls}"></i>${esc(o.txt)}`;
  $('#chipOpen').innerHTML = dot; $('#navStatus').innerHTML = dot;
  const nf = db.nextFree('any', 30);
  $('#chipNext').innerHTML = nf ? `${icon('clock')}<span>${t('nextFreeSlot', { w: esc(dayWord(nf.date)), t: db.hhmm(nf.start) })}</span>` : `${icon('clock')}<span>${t('noSlots')}</span>`;
  const tot = TEAM.reduce((n, m) => n + m.reviews, 0); const avg = TEAM.reduce((n, m) => n + m.rating * m.reviews, 0) / tot;
  $('#chipRate').innerHTML = `${icon('star')}<b>${avg.toFixed(1)}</b><span>${t('reviewsCount', { n: tot })}</span>`;
  const mineCount = myUpcoming();
  const dotn = $('#myDot'); if (dotn) { dotn.hidden = !mineCount; dotn.textContent = mineCount; }
  renderLive();
}
function myUpcoming() {
  const s = db.get(); const n = db.shopNow();
  return s.bookings.filter((b) => s.my.ids.includes(b.id) && ['pending', 'confirmed', 'arrived', 'inchair'].includes(b.status) && db.epochOf(b.date, b.start + b.dur) >= n.epoch).length;
}
function renderLive() {
  const fl = db.floor();
  const free = fl.filter((c) => c.state === 'free').length;
  const rows = fl.map((c) => {
    const m = memberById(c.member);
    const txt = c.state === 'off' ? t('statusOff') : c.state === 'busy' ? (c.until ? t('busyUntil', { t: db.hhmm(c.until) }) : t('statusBusy')) : t('statusFree');
    return `<li><button class="bubble ${c.state}" data-member="${m.id}" ${c.state === 'off' ? 'disabled' : ''} aria-label="${esc(m.name)} — ${esc(txt)}"><span class="ring-av">${avatar(m, photoOf.team(m.id))}</span><b>${esc(m.name)}</b><small>${esc(txt)}</small></button></li>`;
  }).join('');
  $('#liveCard').innerHTML = `<header><span class="pulse"></span><b>${t('liveT')}</b><small>${esc(free ? t('freeNow', { n: free }) : t('noneFree'))}</small></header><ul class="bubbles">${rows}</ul>`;
}
function renderMarquee() {
  const list = SERVICES.map((x) => `<span>${esc(L(x.name))}</span>`).join('');
  $('#marquee').innerHTML = list + list;
}

let heroTimer = null;
let heroI = 0;
const SHAPES = ['#heroArt', '#heroOrb', '#heroBean'];
function renderHero() {
  const photos = photoOf.hero();
  const col = $('#collage');
  col.classList.toggle('nophoto', photos.length === 0);
  if (!photos.length) { $('#heroArt').innerHTML = heroArt(); return; }
  if ($('#heroArt img')) return; // already built — the rotation keeps running across language changes
  SHAPES.forEach((sel, k) => {
    $(sel).innerHTML = photos.map((src, i) => `<img src="${src}" alt="" class="${i === k % photos.length ? 'on' : ''}" ${k === 0 && i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`).join('');
  });
  clearInterval(heroTimer);
  if (photos.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroTimer = setInterval(() => {
      heroI = (heroI + 1) % photos.length;
      SHAPES.forEach((sel, k) => $$(`${sel} img`).forEach((im, i) => im.classList.toggle('on', i === (heroI + k) % photos.length)));
    }, 4400);
  }
}
/** Quick booking bar: pick a treatment, then jump straight to the specialist step. */
function renderQuick() {
  const sel = $('#quickSvc'); const keep = sel.value;
  sel.innerHTML = `<option value="">${esc(t('pickTreatment'))}</option>` + CATEGORIES.map((c) => `<optgroup label="${esc(L(c.name))}">${db.services().filter((s) => s.cat === c.id).map((s) => `<option value="${s.id}">${esc(L(s.name))} · ${money(s.price)}</option>`).join('')}</optgroup>`).join('');
  sel.value = keep;
}

// ── treatments ─────────────────────────────────────────────────────────────
let svcFilter = 'all';
const svcVisual = (s) => { const p = photoOf.service(s.id); return p ? `<img class="svc-photo" src="${p}" alt="" loading="lazy" decoding="async" />` : serviceArt(s.art); };
function renderServices() {
  const cats = [{ id: 'all', icon: 'sparkles', name: { en: t('all'), fr: t('all'), ar: t('all') } }, ...CATEGORIES];
  $('#svcFilters').innerHTML = cats.map((c) => `<button class="bub c-${c.id} ${svcFilter === c.id ? 'on' : ''}" role="tab" aria-selected="${svcFilter === c.id}" data-svcfilter="${c.id}"><span class="bub-ic">${icon(c.icon)}</span><small>${esc(L(c.name))}</small></button>`).join('');
  const list = db.services().filter((s) => svcFilter === 'all' || s.cat === svcFilter);
  $('#svcGrid').innerHTML = list.map((s) => `<article class="svc c-${s.cat} ${s.pop ? 'pop' : ''}">
      <div class="svc-art">${svcVisual(s)}${s.pop ? `<span class="badge">${t('popular')}</span>` : ''}</div>
      <div class="svc-body"><h3>${esc(L(s.name))}</h3><p>${esc(L(s.desc))}</p></div>
      <footer><span class="meta"><b>${money(s.price)}</b><small>${icon('clock')} ${mins(s.dur)}</small></span><button class="btn rose sm" data-svc="${s.id}">${t('book')}</button></footer>
    </article>`).join('');
  stagger('#svcGrid .svc');
}

// ── team ───────────────────────────────────────────────────────────────────
function renderTeam() {
  const fl = db.floor();
  $('#teamGrid').innerHTML = TEAM.filter((m) => db.memberActive(m.id)).map((m) => {
    const nf = db.nextFree(m.id, 30, m.skills);
    const st = fl.find((c) => c.member === m.id)?.state || 'off';
    const ph = photoOf.team(m.id);
    return `<article class="member" style="--c:${m.color}">
      <div class="portrait">${ph ? `<img src="${ph}" alt="${esc(m.name)}" loading="lazy" decoding="async" />` : `<b aria-hidden="true">${esc(m.name[0])}</b>`}<span class="state ${st}">${t(st === 'free' ? 'statusFree' : st === 'busy' ? 'statusBusy' : 'statusOff')}</span></div>
      <div class="m-info"><h3>${esc(m.name)}</h3><p class="role">${esc(L(m.role))}</p><div class="rate-row">${stars(m.rating)}<b>${m.rating.toFixed(1)}</b><small>(${m.reviews})</small></div></div>
      <div class="skills">${m.skills.map((c) => `<span>${esc(catName(c))}</span>`).join('')}</div>
      <p class="bio">${esc(L(m.bio))}</p>
      <footer><span class="next">${icon('clock')} ${nf ? `${t('nextFree')}: <b>${esc(dayWord(nf.date))} ${db.hhmm(nf.start)}</b>` : t('noSlots')}</span><button class="btn rose sm" data-member="${m.id}">${t('bookWith', { n: esc(m.name) })}</button></footer>
    </article>`;
  }).join('');
}

// ── find your ritual ───────────────────────────────────────────────────────
const fnd = { goal: 'glow', time: 'quick' };
function renderFinder() {
  const GOAL = { glow: ['skin', 'sparkles'], relax: ['spa', 'flower'], hair: ['hair', 'scissors'], nails: ['nails', 'gem'], event: ['makeup', 'crown'] };
  const row = (key, label) => (key === 'goal'
    ? `<div class="q"><h4>${t(label)}</h4><div class="tiles">${FINDER.goal.map((o) => `<button class="tile c-${GOAL[o.id][0]} ${fnd.goal === o.id ? 'on' : ''}" data-fnd="goal" data-val="${o.id}" aria-pressed="${fnd.goal === o.id}"><span class="ti">${icon(GOAL[o.id][1])}</span>${esc(L(o.label))}</button>`).join('')}</div></div>`
    : `<div class="q"><h4>${t(label)}</h4><div class="opts">${FINDER[key].map((o) => `<button class="pill ${fnd[key] === o.id ? 'on' : ''}" data-fnd="${key}" data-val="${o.id}" aria-pressed="${fnd[key] === o.id}">${esc(L(o.label))}</button>`).join('')}</div></div>`);
  const r = RITUALS.find((x) => x.goal === fnd.goal && x.time === fnd.time);
  const ids = r.services; const first = svcById(ids[0]);
  const who = db.qualified(ids).map(memberById);
  const photo = photoOf.service(ids[0]);
  const total = db.priceOf(ids); const mn = db.dur(ids);
  $('#finder').innerHTML = `<div class="questions">${row('goal', 'fq_goal')}${row('time', 'fq_time')}</div>
    <div class="result"><div class="r-art">${photo ? `<img src="${photo}" alt="${esc(L(r.name))}" loading="lazy" />` : serviceArt(r.art)}</div>
      <div class="r-body"><small>${t('yourMatch')}</small><h3>${esc(L(r.name))}</h3><p>${esc(L(r.why))}</p>
        <ul>${ids.map((id) => `<li>${icon('sparkles')} ${esc(L(svcById(id).name))} · ${mins(svcById(id).dur)}</li>`).join('')}
          <li>${icon('wallet')} ${money(total)} · ${mins(mn)}</li>${r.quote ? '' : `<li>${icon('user')} ${t('bestWith', { n: esc(who.map((m) => m.name).join(' / ')) })}</li>`}</ul>
        ${r.quote ? `<button class="btn rose" data-goquote>${t('askQuote')} ${icon('arrowRight')}</button>` : `<button class="btn rose" data-ritual="${r.id}">${t('bookThisRitual')} ${icon('arrowRight')}</button>`}</div></div>`;
  void first;
}

// ── bridal & events ────────────────────────────────────────────────────────
const quoteState = { type: 'wedding', date: '', people: 4, needs: new Set(['makeup', 'hair']), name: '', phone: '', note: '', sent: null };
const NEEDS = ['makeup', 'hair', 'hammam', 'nails', 'home'];
function renderBridalPic() {
  const photos = photoOf.hero(); const el = $('#bridalPic');
  el.classList.toggle('nophoto', photos.length < 4);
  if (photos.length < 4) return;
  el.innerHTML = `<div class="shape"><img class="on" src="${photos[3]}" alt="" loading="lazy" decoding="async" /></div><span class="chip"><b>${esc(t('newThisMonth'))}</b><small>${esc(t('brides'))}</small></span>`;
}
function renderBridal() {
  renderBridalPic();
  $('#bridalGrid').innerHTML = BRIDAL.map((p) => `<article class="pack ${p.best ? 'best' : ''}">${p.best ? `<span class="badge">${t('bestValue')}</span>` : ''}
    <h4>${esc(L(p.name))}</h4><div class="price"><small>${t('fromWord')}</small><b>${money(p.from)}</b></div>
    <ul>${p.items.map((x) => `<li>${icon('check')} ${esc(L(x))}</li>`).join('')}</ul></article>`).join('');
  const q = quoteState;
  if (q.sent) {
    $('#quoteBox').innerHTML = `<div class="done"><div class="done-ic">${icon('check')}</div><h3>${t('requestSent')}</h3><p class="code">${t('requestRef', { n: q.sent })}</p><button class="btn ghost" data-quoteagain>${t('giftAnother')}</button></div>`;
    return;
  }
  const min = db.addDays(db.shopNow().date, 1);
  $('#quoteBox').innerHTML = `<h3>${t('requestT')}</h3><p class="sub">${t('requestSub')}</p>
    <form class="form" id="quoteForm">
      <div class="q"><h4>${t('eventType')}</h4><div class="tiles">${EVENT_TYPES.map((e) => `<button type="button" class="tile ev-${e.id === 'wedding' ? 'wedding' : e.id} ${q.type === e.id ? 'on' : ''}" data-qtype="${e.id}" aria-pressed="${q.type === e.id}"><span class="ti">${icon({ wedding: 'gem', engagement: 'heart', henna: 'flower', party: 'sparkles' }[e.id] || 'sparkles')}</span>${esc(L(e.label))}</button>`).join('')}</div></div>
      <div class="two"><label>${t('eventDate')}<input type="date" data-qf="date" min="${min}" value="${esc(q.date)}" required /></label><label>${t('guests')}<input type="number" data-qf="people" min="1" max="40" value="${q.people}" inputmode="numeric" /></label></div>
      <div class="q"><h4>${t('needHelp')}</h4><div class="opts">${NEEDS.map((k) => `<button type="button" class="pill ${q.needs.has(k) ? 'on' : ''}" data-qneed="${k}" aria-pressed="${q.needs.has(k)}">${t('need_' + k)}</button>`).join('')}</div></div>
      <div class="two"><label>${t('yourName')}<input data-qf="name" value="${esc(q.name)}" autocomplete="name" required /></label><label>${t('yourPhone')}<input data-qf="phone" value="${esc(q.phone)}" inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" required /></label></div>
      <label>${t('quoteNote')}<textarea data-qf="note" rows="2" placeholder="${t('quoteNotePh')}">${esc(q.note)}</textarea></label>
      <p class="err" id="qErr" role="alert"></p>
      <button class="btn rose block" type="submit">${icon('sparkles')} ${t('sendRequest')}</button></form>`;
}

// ── club: Glow points, gift cards, plans ───────────────────────────────────
let lookup = '';
function renderPointsCard() {
  const s = db.get();
  const key = db.digits(lookup || s.my.phone);
  const c = key.length >= 9 ? db.clientOf(key) : null;
  const demo = !c;
  const pts = c ? c.stamps : 96;
  const goal = SHOP.pointsForReward;
  const pct = Math.min(100, Math.round((pts / goal) * 100));
  const reached = pts >= goal;
  $('#pointsCard').innerHTML = `<div class="sc-top"><span>${t('pointsCardT')}</span><small>${demo ? t('sampleCard') : esc(c.name)}</small></div>
    <div class="ring" style="--p:${pct}"><div><b>${pts}</b><small>${t('ptsShort')}</small></div></div>
    <p class="sc-msg">${reached ? `<b>${icon('gift')} ${t('rewardReady')}</b>` : t('toReward', { n: goal - pts })}</p>
    <form class="lookup" id="lookupForm"><input id="lookupPhone" inputmode="tel" value="${esc(lookup || (s.my.phone ? fmtPhone(s.my.phone) : ''))}" placeholder="06 12 34 56 78" aria-label="${t('yourPhone')}" /><button class="btn ghost sm" type="submit">${t('checkCard')}</button></form>
    <small class="tiny">${demo && key.length >= 9 ? t('noCardYet') : t('tryDemo')}</small><small class="tiny">${t('earnNote')}</small>`;
}

let gift = { amount: GIFT_AMOUNTS[1], design: 'rose', to: '', from: '', msg: '', code: '' };
function giftCardView(g, code) {
  const d = GIFT_DESIGNS.find((x) => x.id === g.design);
  return `<div class="gcard" style="--a:${d.a};--b:${d.b}"><span class="gc-brand">LALLA</span><b>${money(g.amount)}</b><small>${t('giftFor', { n: esc(g.to || '—') })}</small><code>${esc(code || 'LALLA-XXXX-XX')}</code></div>`;
}
function renderGift() {
  if (gift.code) {
    $('#giftBox').innerHTML = `<h3>${t('giftDoneT')}</h3>${giftCardView(gift, gift.code)}<p class="hint">${t('giftDoneSub')}</p><div class="row-btns"><button class="btn rose sm" data-copy="${esc(gift.code)}">${icon('download')} ${t('copyCode')}</button><button class="btn ghost sm" data-giftagain>${t('giftAnother')}</button></div>`;
    return;
  }
  $('#giftBox').innerHTML = `<h3>${t('giftT')}</h3><p class="sub">${t('giftSub')}</p>
    ${giftCardView(gift, '')}
    <div class="opts">${GIFT_AMOUNTS.map((a) => `<button class="pill ${gift.amount === a ? 'on' : ''}" data-gamount="${a}">${money(a)}</button>`).join('')}</div>
    <div class="opts">${GIFT_DESIGNS.map((d) => `<button class="pill ${gift.design === d.id ? 'on' : ''}" data-gdesign="${d.id}">${esc(L(d.name))}</button>`).join('')}</div>
    <form class="form" id="giftForm"><div class="two"><label>${t('giftTo')}<input data-gf="to" value="${esc(gift.to)}" required /></label><label>${t('giftFrom')}<input data-gf="from" value="${esc(gift.from)}" required /></label></div>
    <button class="btn rose block" type="submit">${icon('gift')} ${t('giftBuy', { p: money(gift.amount) })}</button></form>`;
}
function renderPlans() {
  $('#plans').innerHTML = PLANS.map((p) => `<article class="plan ${p.best ? 'best' : ''}">
    ${p.best ? `<span class="badge">${t('bestValue')}</span>` : ''}
    <h4>${esc(L(p.name))}</h4><div class="price"><b>${money(p.price)}</b><small>${t('perMonth')}</small></div>
    <ul>${p.perks.map((x) => `<li>${icon('check')} ${esc(L(x))}</li>`).join('')}</ul>
    <button class="btn ${p.best ? 'rose' : 'ghost'} block" data-plan="${p.id}">${t('joinPlan')}</button></article>`).join('');
}
function openPlan(id) {
  const p = PLANS.find((x) => x.id === id);
  const el = $('#sheet');
  el.innerHTML = `${sheetHead(t('planSheetT', { n: esc(L(p.name)) }), `${money(p.price)} ${t('perMonth')}`)}<form class="sheet-body form" id="planForm" data-plan-id="${id}">
    <label>${t('yourName')}<input name="name" required autocomplete="name" data-autofocus /></label>
    <label>${t('yourPhone')}<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" /></label>
    <ul class="perks">${p.perks.map((x) => `<li>${icon('check')} ${esc(L(x))}</li>`).join('')}</ul><p class="hint">${t('planHint')}</p>
    <button class="btn rose block" type="submit">${t('planConfirm')}</button></form>`;
  openSheet(el);
}

// ── shop ───────────────────────────────────────────────────────────────────
const cartQty = () => db.get().cart.reduce((n, i) => n + i.qty, 0);
function renderProducts() {
  const s = db.get();
  $('#prodGrid').innerHTML = `<div class="shop-bar"><span>${icon('bag')} ${t('shopNote')}</span><button class="btn ghost sm" id="bagBtn">${t('bag')} <b id="bagCount">${cartQty()}</b></button></div>` + PRODUCTS.map((p) => {
    const stock = s.stock[p.id] ?? 0; const ph = photoOf.product(p.id);
    return `<article class="prod ${stock ? '' : 'out'}" style="--tint:${p.tint}">
      <div class="p-art">${ph ? `<img src="${ph}" alt="${esc(L(p.name))}" loading="lazy" />` : productArt(p.art, p.tint)}${stock && stock <= 3 ? `<span class="badge warn">${t('onlyLeft', { n: stock })}</span>` : ''}</div>
      <h3>${esc(L(p.name))}</h3><p>${esc(L(p.note))}</p>
      <footer><b>${money(p.price)}</b><button class="btn ${stock ? 'rose' : 'ghost'} sm" data-addprod="${p.id}" ${stock ? '' : 'disabled'}>${stock ? `${icon('plus')} ${t('add')}` : t('soldOut')}</button></footer></article>`;
  }).join('');
}
function renderBag() {
  const s = db.get();
  const lines = s.cart.map((i) => ({ ...i, p: PRODUCTS.find((x) => x.id === i.id) }));
  const total = lines.reduce((n, l) => n + l.p.price * l.qty, 0);
  $('#bag').innerHTML = `${sheetHead(t('yourBag'), t('shopNote'))}<div class="sheet-body">${lines.length ? lines.map((l) => `<div class="bag-line"><div class="bl-art">${photoOf.product(l.p.id) ? `<img src="${photoOf.product(l.p.id)}" alt="" />` : productArt(l.p.art, l.p.tint)}</div><div><b>${esc(L(l.p.name))}</b><small>${money(l.p.price)}</small></div>
      <div class="qty"><button data-bagminus="${l.id}" aria-label="−">${icon('minus')}</button><span>${l.qty}</span><button data-bagplus="${l.id}" aria-label="+">${icon('plus')}</button></div></div>`).join('')
    + `<form class="form" id="bagForm"><label>${t('yourName')}<input name="name" required autocomplete="name" /></label><label>${t('yourPhone')}<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" /></label>
       <div class="sum"><div class="tot"><span>${t('total')}</span><b>${money(total)}</b></div></div><p class="pay-note">${icon('wallet')} ${t('payInShop')}</p><button class="btn rose block" type="submit">${t('reserve')}</button></form>`
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
  const total = TEAM.reduce((n, m) => n + m.reviews, 0);
  const avg = TEAM.reduce((n, m) => n + m.rating * m.reviews, 0) / total;
  $('#revTop').innerHTML = `<div class="big-rate"><b>${avg.toFixed(1)}</b><div>${stars(avg)}<small>${t('reviewsCount', { n: total })}</small></div></div>`;
  const cards = REVIEWS.map((r) => `<figure class="rev"><div>${stars(r.stars)}</div><blockquote>${esc(L(r.text))}</blockquote><figcaption>${esc(r.name)}</figcaption></figure>`).join('');
  $('#revGrid').innerHTML = cards + cards;
}
function renderVisit() {
  const s = db.get(); const n = db.shopNow(); const o = openText();
  $('#visitInfo').innerHTML = `<h3>${t('findUs')}</h3><p class="addr">${icon('pin')} ${esc(L(SHOP.address))}</p>
    <div class="map" aria-hidden="true"><svg viewBox="0 0 320 150"><rect width="320" height="150" fill="#f1e4dc"/><g stroke="#fff" stroke-width="10" fill="none"><path d="M-10 40L330 70M40 -10L90 160M180 -10L230 160M-10 120L330 100"/></g><g stroke="#e8d3c9" stroke-width="5" fill="none"><path d="M-10 90L330 20M130 -10L150 160M260 -10L290 160"/></g><circle cx="150" cy="78" r="26" fill="rgba(194,108,127,.2)"/><path d="M150 52c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16Z" fill="var(--rose)"/><circle cx="150" cy="68" r="5.5" fill="#fff"/></svg></div>
    <div class="row-btns"><button class="btn rose sm" data-demo="call">${icon('phone')} ${t('call')}</button><button class="btn ghost sm" data-demo="WhatsApp">${icon('message')} WhatsApp</button><button class="btn ghost sm" data-demo="maps">${icon('pin')} ${t('directions')}</button></div>
    <ul class="amen">${AMENITIES.map((a) => `<li>${icon(a.icon)} ${esc(L(a.label))}</li>`).join('')}</ul>`;
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = s.settings.hours[d]; return `<li class="${d === n.day ? 'today' : ''}"><span>${dayNames()[d]}</span><b>${h ? `${db.hhmm(h[0])} – ${db.hhmm(h[1])}` : t('closed')}</b></li>`; }).join('');
  $('#hoursCard').innerHTML = `<h3>${t('hoursT')}</h3><p class="open-now"><i class="${o.cls}"></i>${esc(o.txt)}</p><ul class="hours">${rows}</ul>`;
  $('#faq').innerHTML = `<h3>${t('faqT')}</h3>${FAQ.map((f) => `<details><summary>${esc(L(f.q))}${icon('chevron')}</summary><p>${esc(L(f.a))}</p></details>`).join('')}`;
}

// ── moments: a mosaic of every photo we have (shown once there are enough) ──
function renderMoments() {
  const pics = [...photoOf.hero(), ...[...new Set(SERVICES.map((x) => photoOf.service(x.id)).filter(Boolean))]].slice(0, 8);
  const sec = $('#moments'); sec.hidden = pics.length < 6;
  if (sec.hidden) return;
  $('#mosaic').innerHTML = pics.map((src) => `<figure><img src="${src}" alt="" loading="lazy" decoding="async" /></figure>`).join('');
}

// ── render everything ──────────────────────────────────────────────────────
function renderAll() {
  applyStatic(); renderStatus(); renderHero(); renderQuick(); renderMarquee(); renderServices(); renderTeam(); renderFinder(); renderBridal();
  renderPointsCard(); renderGift(); renderPlans(); renderProducts(); renderReviews(); renderMoments(); renderVisit();
  if (openedSheet() === $('#bag')) renderBag();
}

/** Stagger the reveal of siblings. */
function stagger(sel) { $$(sel).forEach((el, i) => el.style.setProperty('--d', `${(i % 6) * 70}ms`)); }

// ── events ─────────────────────────────────────────────────────────────────
function copy(text) { try { navigator.clipboard.writeText(text); toast(t('copied')); } catch { toast(text); } }
function wire() {
  document.addEventListener('click', (e) => {
    const g = (sel) => e.target.closest(sel);
    let x;
    if ((x = g('[data-ddtoggle]'))) { const box = x.closest('.dd'); const on = box.classList.toggle('open'); x.setAttribute('aria-expanded', on); return; }
    if (!g('.dd')) $$('.dd.open').forEach((d) => { d.classList.remove('open'); d.querySelector('[data-ddtoggle]').setAttribute('aria-expanded', 'false'); });
    if ((x = g('[data-lang]'))) { setLang(x.dataset.lang); return; }
    if (g('[data-close]')) { closeSheet(); return; }
    if ((x = g('[data-svc]'))) { openBooking({ services: [x.dataset.svc] }); return; }
    if ((x = g('[data-member]'))) { const m = memberById(x.dataset.member); openBooking({ member: m.id }); return; }
    if ((x = g('[data-ritual]'))) { const r = RITUALS.find((y) => y.id === x.dataset.ritual); openBooking({ services: r.services }); return; }
    if (g('[data-goquote]')) { document.getElementById('bridal').scrollIntoView({ behavior: 'smooth' }); return; }
    if (g('#heroBook')) { const v = $('#quickSvc').value; openBooking(v ? { services: [v] } : {}); return; }
    if (g('#navBook, #tabBook')) { openBooking(); return; }
    if (g('#heroBridal')) { document.getElementById('bridal').scrollIntoView({ behavior: 'smooth' }); return; }
    if (g('#myBtn')) { openMine(); return; }
    if ((x = g('[data-svcfilter]'))) { svcFilter = x.dataset.svcfilter; renderServices(); return; }
    if ((x = g('[data-fnd]'))) { fnd[x.dataset.fnd] = x.dataset.val; renderFinder(); return; }
    if ((x = g('[data-qtype]'))) { quoteState.type = x.dataset.qtype; renderBridal(); return; }
    if ((x = g('[data-qneed]'))) { const k = x.dataset.qneed; if (quoteState.needs.has(k)) quoteState.needs.delete(k); else quoteState.needs.add(k); renderBridal(); return; }
    if (g('[data-quoteagain]')) { Object.assign(quoteState, { sent: null, date: '', note: '' }); renderBridal(); return; }
    if ((x = g('[data-gamount]'))) { gift.amount = Number(x.dataset.gamount); renderGift(); return; }
    if ((x = g('[data-gdesign]'))) { gift.design = x.dataset.gdesign; renderGift(); return; }
    if (g('[data-giftagain]')) { gift = { ...gift, to: '', from: '', msg: '', code: '' }; renderGift(); return; }
    if ((x = g('[data-copy]'))) { copy(x.dataset.copy); return; }
    if ((x = g('[data-plan]'))) { openPlan(x.dataset.plan); return; }
    if ((x = g('[data-addprod]'))) { addProduct(x.dataset.addprod); toast(t('addedToBag')); requestAnimationFrame(() => $('#bagBtn')?.classList.add('bump')); return; }
    if (g('#bagBtn')) { renderBag(); openSheet($('#bag')); return; }
    if ((x = g('[data-bagplus]'))) { addProduct(x.dataset.bagplus, 1); renderBag(); return; }
    if ((x = g('[data-bagminus]'))) { addProduct(x.dataset.bagminus, -1); renderBag(); return; }
    if ((x = g('[data-demo]'))) { toast(t('demoAction', { x: x.dataset.demo === 'call' ? SHOP.phone : x.dataset.demo === 'maps' ? 'Maps' : 'WhatsApp' })); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'lookupForm') { e.preventDefault(); lookup = $('#lookupPhone').value; renderPointsCard(); return; }
    if (f.id === 'giftForm') {
      e.preventDefault();
      gift.to = gift.to.trim(); gift.from = gift.from.trim();
      gift.code = db.createGift({ amount: gift.amount, design: gift.design, to: gift.to, from: gift.from, msg: '' }).code;
      renderGift(); burst($('#giftBox .gcard')); return;
    }
    if (f.id === 'quoteForm') {
      e.preventDefault();
      const q = quoteState; const err = $('#qErr');
      if (!q.date || q.date <= db.shopNow().date) { err.textContent = t('errDate'); return; }
      if (q.name.trim().length < 2) { err.textContent = t('errName'); return; }
      if (db.digits(q.phone).length < 9) { err.textContent = t('errPhone'); return; }
      const r = db.addRequest({ type: q.type, date: q.date, people: Number(q.people) || 1, services: [...q.needs].map((k) => t('need_' + k)), name: q.name.trim(), phone: q.phone, note: q.note.trim() });
      q.sent = r.no; renderBridal(); return;
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
      db.update((s) => { if (!s.newsletter.includes(v)) s.newsletter.push(v); }); f.reset(); toast(t('subscribed'));
    }
  });
  document.addEventListener('input', (e) => {
    const d = e.target.dataset || {};
    if (d.gf) gift[d.gf] = e.target.value;
    if (d.qf) quoteState[d.qf] = e.target.value;
  });
  $('#scrim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $$('.dd.open').forEach((d) => d.classList.remove('open')); closeSheet(); }
  });
  $('#demobarClose').addEventListener('click', () => { $('#demobar').hidden = true; });
  window.addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 10), { passive: true });
  wireBooking();

  // live updates from the owner dashboard (another tab) and the demo auto-flow
  db.subscribe(() => {
    renderStatus(); renderTeam(); renderProducts();
    if (openedSheet() === $('#bag')) renderBag();
    refreshSheets();
    if (!openedSheet()) renderPointsCard();
  });
  setInterval(() => { db.tick(); }, 3000);
  setInterval(() => { renderStatus(); renderTeam(); }, 20000);

  // reveal on scroll + tab bar highlight
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.sec-head, .svc, .member, .prod, .plan, .visit-card, .finder, .points-card, .gift-box, .pack, .quote-box, .bridal-top, .mosaic figure').forEach((el) => { el.classList.add('rv'); io.observe(el); });
  ['.member', '.prod', '.plan', '.pack', '.visit-card', '.mosaic figure'].forEach(stagger);
  const secs = ['top', 'team', 'bridal', 'club', 'visit'].map((id) => document.getElementById(id));
  const tabIo = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { $$('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === en.target.id)); } }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((el) => el && tabIo.observe(el));
}

renderAll();
wire();
petalField($('#petalField'));
initFx();

// The owner can switch the demo off (or let it expire) from the MBN DEV dashboard.
// If the server cannot be reached the site simply stays open: nothing here is sensitive.
fetchConfig().then((cfg) => {
  if (!cfg.ok || cfg.live) return;
  const o = document.createElement('div');
  o.className = 'demo-off'; o.setAttribute('role', 'alert');
  o.innerHTML = `<div><b>LALLA</b><h1>${esc(t(cfg.state === 'expired' ? 'offExpired' : 'offTitle'))}</h1><p>${esc(t('offBody'))}</p><a class="btn rose" href="https://mbndev.ma">mbndev.ma</a></div>`;
  document.body.append(o);
  document.documentElement.style.overflow = 'hidden';
});
