// NOUR Coffee Atelier — public site. Vanilla JS modules, no build step.
import { CAFE, CATEGORIES, MENU, OPTS, BEANS, BEAN_SIZES, GRINDS, SUB_PLANS, BREW, EVENTS, GIFT_AMOUNTS, GIFT_DESIGNS, AMENITIES, photoOf } from './data.js';
import { LANGS, STR } from './i18n.js';
import { drinkSVG, foodSVG, artFor, bagSVG } from './art.js';
import * as db from './store.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── i18n ──────────────────────────────────────────────────────────────────
const guess = () => { const n = (navigator.language || 'en').slice(0, 2); return ['fr', 'ar'].includes(n) ? n : 'en'; };
let lang = db.get().lang || guess();
const t = (k, v = {}) => String(STR[lang][k] ?? STR.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const days = () => STR[lang].days;
const L = (o) => (o ? o[lang] ?? o.en : '');
const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
const money = (n) => t('currency', { n: fmt(n) });
const locale = () => LANGS.find((x) => x.id === lang).locale;
const dateFmt = (d, o) => new Intl.DateTimeFormat(locale(), o).format(d);

const photo = (id, cls = 'photo') => { const src = photoOf(id); return src ? `<img class="${cls}" src="${src}" alt="" loading="lazy" decoding="async"/>` : ''; };
const TINT = { espresso: '#f3dcc4', slow: '#e3eadf', cold: '#dfe9f1', notcoffee: '#e8efd8', bakery: '#f6e3c3', brunch: '#f1dccf' };

function applyStatic() {
  const L0 = LANGS.find((x) => x.id === lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = L0.dir;
  $$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  $$('[data-t-ph]').forEach((el) => { el.placeholder = t(el.dataset.tPh); });
  $('#langs').innerHTML = LANGS.map((x) => `<button aria-pressed="${x.id === lang}" data-lang="${x.id}" aria-label="${x.id.toUpperCase()}">${x.label}</button>`).join('');
}
function setLang(l) {
  lang = l;
  db.update((s) => { s.lang = l; });
  renderAll();
}

// ── toast & overlays ──────────────────────────────────────────────────────
let toastT;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600);
}
let openSheet = null;
function open(el) {
  if (openSheet && openSheet !== el) openSheet.hidden = true;
  openSheet = el; el.hidden = false; $('#scrim').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => (el.querySelector('[data-autofocus]') || el.querySelector('.xbtn'))?.focus(), 30);
}
function close() {
  if (!openSheet) return;
  openSheet.hidden = true; openSheet = null; $('#scrim').hidden = true; document.body.style.overflow = '';
}
const head = (title, id = '') => `<div class="sheet-head"><h3 ${id ? `id="${id}"` : ''}>${title}</h3><button class="xbtn" data-close aria-label="${t('close')}">×</button></div>`;

// ── status (hours, wait, today's bean, banner) ────────────────────────────
function openText() {
  const o = db.openState();
  if (o.open) return { cls: o.soon ? 'soon' : '', txt: t(o.soon ? 'closesSoon' : 'openNow', { t: db.hhmm(o.until) }) };
  const d = o.k === 0 ? t('today') : o.k === 1 ? t('tomorrow') : days()[o.day];
  return { cls: 'closed', txt: t('closedNow', { d, t: db.hhmm(o.at ?? 0) }) };
}
function renderStatus() {
  const s = db.get().settings;
  const o = openText();
  $('#navStatus').className = `status ${o.cls}`; $('#navStatus').innerHTML = `<i></i>${esc(o.txt)}`;
  $('#chipOpen').className = `chip ${o.cls}`; $('#chipOpen').innerHTML = `<i></i>${esc(o.txt)}`;
  $('#chipWait').textContent = `⏱ ${t('wait', { n: s.wait })}`;
  const bean = BEANS.find((b) => b.id === s.todayBean) || BEANS[0];
  $('#chipBean').innerHTML = `${esc(t('onBar'))}: <b>${esc(L(bean.origin))}</b>`;
  const banner = s.banner;
  $('#announce').hidden = !banner;
  $('#announceText').textContent = s.bannerText || t('bannerDefault');
  $('#pausedNote').hidden = !s.paused;
}

// ── hero ──────────────────────────────────────────────────────────────────
const HERO = ['flat', 'blossom', 'spanish', 'tonic', 'matcha', 'capp'];
let heroI = 0;
function renderHero() {
  const item = MENU.find((m) => m.id === HERO[heroI % HERO.length]);
  const box = $('#heroGlass');
  const old = box.querySelector('.art');
  box.insertAdjacentHTML('beforeend', drinkSVG(item, {}, { cls: 'out' }));
  const neu = box.lastElementChild;
  requestAnimationFrame(() => requestAnimationFrame(() => { neu.classList.remove('out'); old?.classList.add('out'); }));
  setTimeout(() => old?.remove(), 700);
  $('#heroLabel').innerHTML = `<small>${esc(CATEGORIES.find((c) => c.id === item.cat) ? L(CATEGORIES.find((c) => c.id === item.cat).name) : '')}</small><b>${esc(L(item.name))}</b>${money(db.priceOf(item))}`;
}
function renderMarquee() {
  const names = MENU.filter((m) => m.kind === 'drink').map((m) => `<span>${esc(L(m.name))}</span>`).join('');
  $('#marquee').innerHTML = names + names;
}

// ── menu ──────────────────────────────────────────────────────────────────
let filter = 'all';
let query = '';
function renderMenu() {
  $('#filters').innerHTML = ['all', 'v', 'gf', 'df'].map((f) => `<button class="pill" aria-pressed="${f === filter}" data-filter="${f}">${t(`f_${f}`)}</button>`).join('');
  const q = query.trim().toLowerCase();
  const items = MENU.filter((m) => !db.itemState(m.id).hidden)
    .filter((m) => filter === 'all' || m.tags.includes(filter))
    .filter((m) => !q || [m.name.en, m.name.fr, m.name.ar, m.desc.en, m.desc.fr, m.desc.ar].some((x) => x.toLowerCase().includes(q)));
  const cats = CATEGORIES.filter((c) => items.some((m) => m.cat === c.id));
  $('#cats').innerHTML = cats.map((c, i) => `<a href="#cat-${c.id}" class="${i === 0 ? 'on' : ''}" data-cat="${c.id}">${esc(L(c.name))}</a>`).join('');
  $('#menuList').innerHTML = cats.length ? cats.map((c) => `
    <div class="cat-block" id="cat-${c.id}" data-catblock="${c.id}">
      <h3>${esc(L(c.name))} <small>${items.filter((m) => m.cat === c.id).length}</small></h3>
      <div class="grid">${items.filter((m) => m.cat === c.id).map(card).join('')}</div>
    </div>`).join('') : `<p class="empty">${t('noResults')}</p>`;
  watchCats();
}
function card(m) {
  const sold = db.isSoldOut(m.id);
  const tags = m.tags.map((x) => `<span class="tag ${x}">${t(`t_${x}`)}</span>`).join('');
  return `<button class="item ${sold ? 'sold' : ''}" data-item="${m.id}" style="--tint:${TINT[m.cat]}" ${sold ? 'aria-disabled="true"' : ''}>
    <div class="stage ${photoOf(m.id) ? 'has-photo' : ''}"><div class="tags">${tags}</div>${photo(m.id) || artFor(m, {})}</div>
    <div class="body"><h4>${esc(L(m.name))}</h4><p>${esc(L(m.desc))}</p>
      <div class="ifoot"><span class="price">${money(db.priceOf(m))}</span>${sold ? `<span class="sold-badge">${t('soldOut')}</span>` : '<span class="plus" aria-hidden="true">+</span>'}</div></div>
  </button>`;
}
let catObs;
function watchCats() {
  catObs?.disconnect();
  catObs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.dataset.catblock;
      $$('#cats a').forEach((a) => a.classList.toggle('on', a.dataset.cat === id));
      const on = $(`#cats a[data-cat="${id}"]`);
      if (on && window.innerWidth < 1024) on.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-catblock]').forEach((el) => catObs.observe(el));
}

// ── builder (customiser) ──────────────────────────────────────────────────
let build = null; // { item, sel, qty, note, editKey }
function defaults(item) {
  const sel = {};
  (item.opts || []).forEach((g) => {
    const o = OPTS[g];
    if (o.type === 'many') sel[g] = [];
    else if (g === 'bean') sel[g] = db.get().settings.todayBean;
    else sel[g] = o.def;
  });
  return sel;
}
const choicesOf = (g) => (OPTS[g].choices === 'beans' ? BEANS.map((b) => ({ id: b.id, label: b.origin, d: 0 })) : OPTS[g].choices);
function unitPrice(item, sel) {
  let p = db.priceOf(item);
  (item.opts || []).forEach((g) => {
    const cs = choicesOf(g);
    if (OPTS[g].type === 'many') (sel[g] || []).forEach((id) => { p += cs.find((c) => c.id === id)?.d || 0; });
    else p += cs.find((c) => c.id === sel[g])?.d || 0;
  });
  return Math.max(0, p);
}
function selSummary(item, sel, l = lang) {
  return (item.opts || []).flatMap((g) => {
    const cs = choicesOf(g);
    const o = OPTS[g];
    const ids = o.type === 'many' ? sel[g] || [] : [sel[g]];
    return ids.filter((id) => id && (o.type === 'many' || id !== o.def || g === 'bean')).map((id) => { const c = cs.find((x) => x.id === id); return c ? (c.label[l] ?? c.label.en) : ''; });
  }).filter(Boolean).join(' · ');
}
function artSel(item, sel) {
  const size = sel.size ? OPTS.size.choices.find((c) => c.id === sel.size)?.scale : 1;
  return { ...sel, sizeScale: size };
}
function openBuilder(id, editKey) {
  const item = MENU.find((m) => m.id === id);
  if (!item || db.isSoldOut(id)) return;
  const line = editKey && db.get().cart.find((l) => l.key === editKey);
  build = { item, sel: line ? structuredClone(line.sel) : defaults(item), qty: line ? line.qty : 1, note: line ? line.note : '', editKey };
  renderBuilder();
  open($('#builder'));
}
function renderBuilder() {
  const { item, sel, qty, note } = build;
  const unit = unitPrice(item, sel);
  const groups = (item.opts || []).map((g) => {
    const o = OPTS[g];
    const pills = choicesOf(g).map((c) => {
      const on = o.type === 'many' ? (sel[g] || []).includes(c.id) : sel[g] === c.id;
      const d = c.d ? `<small>${c.d > 0 ? '+' : '−'}${fmt(Math.abs(c.d))}</small>` : '';
      return `<button class="pill" aria-pressed="${on}" data-opt="${g}" data-val="${c.id}">${esc(L(c.label))}${d}</button>`;
    }).join('');
    return `<div class="opt"><span>${esc(L(o.label))}</span><div class="pills">${pills}</div></div>`;
  }).join('');
  $('#builder').setAttribute('aria-label', L(item.name));
  $('#builder').innerHTML = `${head(L(item.name))}
    <div class="sheet-body builder">
      <div class="preview ${photoOf(item.id) ? 'has-photo' : ''}" style="--tint:${TINT[item.cat]}">${photoOf(item.id)
        ? `${photo(item.id)}${item.kind === 'drink' ? `<div class="mini">${drinkSVG(item, artSel(item, sel), { steam: false })}</div>` : ''}`
        : item.kind === 'drink' ? drinkSVG(item, artSel(item, sel)) : foodSVG(item.art)}<span class="meta">${item.kcal} ${t('kcal')}</span></div>
      <div>
        <p class="desc">${esc(L(item.desc))}</p>
        ${groups}
        ${item.kind === 'drink' ? `<label class="field opt"><span>${t('note')}</span><input id="bNote" maxlength="80" value="${esc(note)}" placeholder="${esc(t('notePh'))}"/></label>` : ''}
        <div class="qty-row"><span class="price">${money(unit)} <small>${t('each')}</small></span>
          <div class="stepper"><button data-qty="-1" aria-label="−">−</button><output>${qty}</output><button data-qty="1" aria-label="+">+</button></div></div>
      </div>
    </div>
    <div class="sheet-foot"><button class="btn sun wide" id="bAdd" data-autofocus>${t('addFor', { p: money(unit * qty) })}</button></div>`;
}
function builderClick(e) {
  const b = e.target.closest('button'); if (!b || !build) return;
  if (b.dataset.opt) {
    const g = b.dataset.opt; const v = b.dataset.val;
    if (OPTS[g].type === 'many') { const a = new Set(build.sel[g] || []); a.has(v) ? a.delete(v) : a.add(v); build.sel[g] = [...a]; } else build.sel[g] = v;
    build.note = $('#bNote')?.value ?? build.note;
    renderBuilder();
  } else if (b.dataset.qty) {
    build.note = $('#bNote')?.value ?? build.note;
    build.qty = Math.min(20, Math.max(1, build.qty + Number(b.dataset.qty)));
    renderBuilder();
  } else if (b.id === 'bAdd') {
    const note = ($('#bNote')?.value || '').trim();
    const { item, sel, qty, editKey } = build;
    db.update((s) => {
      const line = { key: editKey || `l${Date.now()}`, kind: 'menu', id: item.id, sel, qty, note, unit: unitPrice(item, sel) };
      if (editKey) s.cart = s.cart.map((l) => (l.key === editKey ? line : l)); else s.cart.push(line);
    });
    close(); build = null;
    toast(`${t('added')} · ${L(item.name)}`);
    bump();
  }
}

// ── bag & checkout ────────────────────────────────────────────────────────
const co = { mode: 'pickup', slot: 'asap', table: '', address: '', name: '', phone: '', pay: 'counter', promo: '', promoOff: 0, useReward: false, err: '' };
function bump() { ['#bagCount', '#bagCount2'].forEach((s) => { const el = $(s); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }); }
function renderBagCount() {
  const n = db.get().cart.reduce((a, l) => a + l.qty, 0);
  ['#bagCount', '#bagCount2'].forEach((s) => { $(s).textContent = n; $(s).classList.toggle('zero', !n); });
}
function lineView(l) {
  if (l.kind === 'beans') {
    const b = BEANS.find((x) => x.id === l.id);
    const sub = [BEAN_SIZES.find((x) => x.id === l.size).label, L(GRINDS.find((g) => g.id === l.grind).label), L(SUB_PLANS.find((p) => p.id === l.plan).label)].join(' · ');
    return { name: L(b.origin), sub, art: bagSVG(b.color, b.id.toUpperCase()), tint: '#efe4d3' };
  }
  const m = MENU.find((x) => x.id === l.id);
  const sub = [selSummary(m, l.sel), l.note && `“${l.note}”`].filter(Boolean).join(' · ');
  return { name: L(m.name), sub, art: photo(m.id) || (m.kind === 'drink' ? drinkSVG(m, artSel(m, l.sel), { steam: false }) : foodSVG(m.art)), tint: TINT[m.cat], editable: true };
}
function totals() {
  const s = db.get();
  const sub = s.cart.reduce((a, l) => a + l.unit * l.qty, 0);
  const member = s.members[db.digits(co.phone)];
  const canReward = member && member.stamps >= CAFE.stampsForReward;
  const drinkUnits = s.cart.filter((l) => l.kind === 'menu' && MENU.find((m) => m.id === l.id)?.kind === 'drink');
  const rewardVal = canReward && co.useReward && drinkUnits.length ? Math.min(...drinkUnits.map((l) => l.unit)) : 0;
  const promo = Math.round((sub - rewardVal) * co.promoOff * 100) / 100;
  const fee = co.mode === 'delivery' ? CAFE.deliveryFee : 0;
  return { sub, promo, rewardVal, fee, total: Math.max(0, sub - promo - rewardVal + fee), canReward: canReward && drinkUnits.length > 0 };
}
function slots() {
  const o = db.openState();
  const s = db.get().settings;
  const { minutes } = db.cafeNow();
  let start; let end;
  if (o.open) { start = Math.ceil((minutes + 15) / 15) * 15; end = o.until - 15; } else { start = (o.at ?? 480) + 15; end = start + 180; }
  const out = [];
  for (let m = start; m <= end && out.length < 12; m += 15) out.push(db.hhmm(m));
  return { list: out, asap: o.open ? t('asap', { n: s.wait }) : t('asapClosed', { t: db.hhmm(o.at ?? 480) }), closed: !o.open };
}
function renderBag() {
  const s = db.get();
  const el = $('#bag');
  if (!s.cart.length) {
    el.innerHTML = `${head(t('bag'), 'bagTitle')}<div class="sheet-body empty-bag">${drinkSVG(MENU[2], {}, { steam: false })}<p>${t('bagEmpty')}</p><a class="btn ink" href="#order" data-close>${t('browse')}</a></div>`;
    return;
  }
  const tot = totals();
  const sl = slots();
  const modes = ['pickup', 'table', 'delivery'].map((m) => `<button aria-pressed="${co.mode === m}" data-mode="${m}">${t(m)}</button>`).join('');
  const lines = s.cart.map((l) => {
    const v = lineView(l);
    return `<div class="line"><div class="thumb" style="--tint:${v.tint}">${v.art}</div>
      <div style="min-width:0"><b>${esc(v.name)}</b><small>${esc(v.sub)}</small><small>${money(l.unit)}${v.editable ? ` · <a href="#" data-edit="${l.key}">${t('edit')}</a>` : ''}</small></div>
      <div class="stepper"><button data-line="${l.key}" data-d="-1" aria-label="−">−</button><output>${l.qty}</output><button data-line="${l.key}" data-d="1" aria-label="+">+</button></div></div>`;
  }).join('');
  const hasBeans = s.cart.some((l) => l.kind === 'beans');
  el.innerHTML = `${head(t('bag'), 'bagTitle')}
    <div class="sheet-body">
      <div class="bag-lines">${lines}</div>
      ${hasBeans ? `<p class="hint">📦 ${t('beansShip')}</p>` : ''}
      <div class="bag-section"><span>${t('how')}</span><div class="seg" role="group">${modes}</div>
        ${co.mode === 'pickup' ? `<span>${t('when')}</span>${sl.closed ? `<p class="hint" style="margin:0">${t('closedPre')}</p>` : ''}<div class="slots"><button class="pill" aria-pressed="${co.slot === 'asap'}" data-slot="asap">${esc(sl.asap)}</button>${sl.list.map((x) => `<button class="pill" aria-pressed="${co.slot === x}" data-slot="${x}">${x}</button>`).join('')}</div>` : ''}
        ${co.mode === 'table' ? `<label class="field"><span>${t('tableNo')}</span><input id="coTable" inputmode="numeric" maxlength="4" value="${esc(co.table)}" placeholder="7"/></label>` : ''}
        ${co.mode === 'delivery' ? `<label class="field"><span>${t('address')}</span><input id="coAddress" maxlength="120" value="${esc(co.address)}" placeholder="${esc(t('addressPh'))}" autocomplete="street-address"/></label>` : ''}
        <div class="two"><label class="field"><span>${t('name')}</span><input id="coName" maxlength="40" value="${esc(co.name)}" autocomplete="given-name"/></label>
          <label class="field"><span>${t('phone')}</span><input id="coPhone" type="tel" inputmode="tel" maxlength="20" value="${esc(co.phone)}" placeholder="06 12 34 56 78" autocomplete="tel"/></label></div>
        ${tot.canReward ? `<label class="reward"><input type="checkbox" id="coReward" ${co.useReward ? 'checked' : ''}/> 🎁 ${t('freeDrink', { p: money(tot.rewardVal || Math.min(...s.cart.filter((l) => l.kind === 'menu').map((l) => l.unit))) })}</label>` : ''}
        <span>${t('promo')}</span>
        <div class="promo-row"><div class="field" style="flex:1"><input id="coPromo" maxlength="12" value="${esc(co.promo)}" placeholder="${esc(t('promoHint'))}" autocapitalize="characters"/></div><button class="btn ghost sm" id="coApply">${t('apply')}</button></div>
        <span>${t('pay')}</span><div class="seg" role="group"><button aria-pressed="${co.pay === 'counter'}" data-pay="counter">${t('payCounter')}</button><button aria-pressed="${co.pay === 'card'}" data-pay="card">${t('payCard')}</button></div>
        <p class="hint">${t('payNote')}</p>
      </div>
      <div class="totals"><div><span>${t('subtotal')}</span><span>${money(tot.sub)}</span></div>
        ${tot.rewardVal ? `<div><span>🎁</span><span>−${money(tot.rewardVal)}</span></div>` : ''}
        ${tot.promo ? `<div><span>${t('discount')} (${co.promo})</span><span>−${money(tot.promo)}</span></div>` : ''}
        ${tot.fee ? `<div><span>${t('deliveryFee')}</span><span>${money(tot.fee)}</span></div>` : ''}
        <div class="grand"><span>${t('total')}</span><span>${money(tot.total)}</span></div></div>
      <p class="msg err" id="coErr" role="alert">${esc(co.err)}</p>
    </div>
    <div class="sheet-foot"><button class="btn sun wide" id="coPlace" ${s.settings.paused ? 'disabled' : ''}>${s.settings.paused ? t('paused') : t('place', { p: money(tot.total) })}</button></div>`;
}
function readCo() {
  ['Table', 'Address', 'Name', 'Phone', 'Promo'].forEach((k) => { const el = $(`#co${k}`); if (el) co[k.toLowerCase()] = el.value; });
}
function bagClick(e) {
  const a = e.target.closest('[data-edit]');
  if (a) { e.preventDefault(); const l = db.get().cart.find((x) => x.key === a.dataset.edit); close(); setTimeout(() => openBuilder(l.id, l.key), 60); return; }
  const b = e.target.closest('button'); if (!b) { if (e.target.id === 'coReward') { readCo(); co.useReward = e.target.checked; renderBag(); } return; }
  readCo();
  if (b.dataset.line) {
    db.update((s) => { s.cart = s.cart.flatMap((l) => (l.key === b.dataset.line ? (l.qty + Number(b.dataset.d) > 0 ? [{ ...l, qty: Math.min(20, l.qty + Number(b.dataset.d)) }] : []) : [l])); });
    renderBag(); renderBagCount();
  } else if (b.dataset.mode) { co.mode = b.dataset.mode; co.err = ''; renderBag(); }
  else if (b.dataset.slot) { co.slot = b.dataset.slot; renderBag(); }
  else if (b.dataset.pay) { co.pay = b.dataset.pay; renderBag(); }
  else if (b.id === 'coApply') {
    const code = co.promo.trim().toUpperCase(); co.promo = code;
    const off = CAFE.promo[code];
    co.promoOff = off || 0; co.err = '';
    renderBag(); toast(off ? t('promoOk', { n: Math.round(off * 100) }) : t('promoBad'));
  } else if (b.id === 'coPlace') place(b);
}
function place(btn) {
  const s = db.get();
  const tot = totals();
  co.err = '';
  if (!co.name.trim() || db.digits(co.phone).length < 9) co.err = t('needContact');
  else if (co.mode === 'table' && !co.table.trim()) co.err = t('needTable');
  else if (co.mode === 'delivery' && !co.address.trim()) co.err = t('needAddress');
  else if (co.mode === 'delivery' && tot.sub < CAFE.deliveryMin) co.err = t('minDelivery', { p: money(CAFE.deliveryMin) });
  if (co.err) { $('#coErr').textContent = co.err; return; }
  const items = s.cart.map((l) => {
    if (l.kind === 'beans') { const b = BEANS.find((x) => x.id === l.id); return { id: l.id, kind: 'beans', name: `${b.origin.en} beans`, qty: l.qty, unit: l.unit, summary: [BEAN_SIZES.find((x) => x.id === l.size).label, GRINDS.find((g) => g.id === l.grind).label.en, SUB_PLANS.find((p) => p.id === l.plan).label.en].join(' · '), plan: l.plan, size: l.size, grind: l.grind }; }
    const m = MENU.find((x) => x.id === l.id);
    return { id: l.id, kind: 'menu', drink: m.kind === 'drink', name: m.name.en, qty: l.qty, unit: l.unit, summary: [selSummary(m, l.sel, 'en'), l.note && `“${l.note}”`].filter(Boolean).join(' · '), sel: l.sel };
  });
  const stamps = items.filter((i) => i.drink).reduce((a, i) => a + i.qty, 0);
  const go = () => {
    const order = db.placeOrder({
      items, subtotal: tot.sub, discount: tot.promo + tot.rewardVal, fee: tot.fee, total: tot.total, promo: co.promoOff ? co.promo : '',
      mode: co.mode, slot: co.mode === 'pickup' ? co.slot : '', table: co.table.trim(), address: co.address.trim(), name: co.name.trim(), phone: co.phone.trim(),
      pay: co.pay, stamps, usedReward: !!tot.rewardVal, lang,
    });
    // beans on a schedule become subscriptions the owner can see
    items.filter((i) => i.kind === 'beans' && i.plan !== 'once').forEach((i) => db.update((st) => { st.subs.push({ id: `s${Date.now()}${i.id}`, bean: i.id, size: i.size, grind: i.grind, plan: i.plan, name: co.name, phone: co.phone, at: Date.now() }); }));
    co.useReward = false; co.promo = ''; co.promoOff = 0;
    close(); renderBagCount(); renderCard();
    setTimeout(() => openTracker(order.id), 120);
  };
  if (co.pay === 'card') { btn.disabled = true; btn.textContent = '•••'; setTimeout(go, 1100); } else go();
}

// ── tracker ───────────────────────────────────────────────────────────────
let trackId = null;
function openTracker(id) { trackId = id; renderTracker(); open($('#tracker')); }
function renderTracker() {
  if (!trackId) return;
  const o = db.get().orders.find((x) => x.id === trackId); if (!o) return;
  const i = db.STATUSES.indexOf(o.status);
  const msg = o.status === 'cancelled' ? t('trackCancelled') : o.status === 'received' ? t('trackReceived') : o.status === 'brewing' ? t('trackBrewing')
    : o.status === 'ready' ? (o.mode === 'table' ? t('trackReadyTable', { n: o.table }) : o.mode === 'delivery' ? t('trackReadyDelivery') : t('trackReady')) : t('trackCollected');
  const first = o.items.find((x) => x.drink) || o.items[0];
  const m = MENU.find((x) => x.id === first?.id);
  const art = m ? (photo(m.id) || (m.kind === 'drink' ? drinkSVG(m, artSel(m, first.sel || {})) : foodSVG(m.art))) : bagSVG('#d9a05b', 'BEANS');
  $('#tracker').innerHTML = `${head(t('orderNo', { n: o.no }))}
    <div class="trk">
      <span class="live-dot">${t('liveTrack')}</span>
      <p class="big">${esc(msg)}</p>
      <div class="prog-steps">${db.STATUSES.map((st, k) => `<div class="${k <= i ? 'on' : ''} ${k === i && k < 3 ? 'now' : ''}"></div>`).join('')}</div>
      <div class="prog-labels">${db.STATUSES.map((st, k) => `<span class="${k <= i ? 'on' : ''}">${t(`st_${st}`)}</span>`).join('')}</div>
      <div class="track-art ${o.status === 'ready' || o.status === 'collected' ? 'ready' : ''}">${art}</div>
      <div class="bag-lines">${o.items.map((x) => `<div class="line" style="grid-template-columns:1fr auto"><div style="min-width:0"><b>${x.qty}× ${esc(nameOf(x))}</b><small>${esc(x.summary || '')}</small></div><span class="price">${money(x.unit * x.qty)}</span></div>`).join('')}</div>
      <div class="totals"><div class="grand"><span>${t('total')}</span><span>${money(o.total)}</span></div></div>
      ${o.stamps ? `<div class="stamp-earned">☕ <span>${t('stampsEarned', { n: `<b>${o.stamps}</b>` })}</span></div>` : ''}
      <p style="margin-top:16px"><a class="btn ghost wide" href="#order" data-close>${t('orderAgain')}</a></p>
    </div>`;
}
const nameOf = (x) => { if (x.kind === 'beans') { const b = BEANS.find((y) => y.id === x.id); return b ? L(b.origin) : x.name; } const m = MENU.find((y) => y.id === x.id); return m ? L(m.name) : x.name; };
function renderLivePill() {
  const s = db.get();
  const live = s.myOrders.map((id) => s.orders.find((o) => o.id === id)).find((o) => o && o.status !== 'collected' && o.status !== 'cancelled');
  const el = $('#livePill');
  if (!live) { el.hidden = true; return; }
  el.hidden = false; el.dataset.id = live.id;
  el.className = `livepill ${live.status === 'ready' ? 'ready' : ''}`;
  el.innerHTML = `<i></i>${esc(t('orderNo', { n: live.no }))} · ${esc(t(`st_${live.status}`))}`;
}

// ── beans: flavour compass ────────────────────────────────────────────────
const bean = { x: -0.35, y: -0.25, size: '250', grind: 'filter', plan: 'once' };
const nearest = () => BEANS.map((b) => ({ b, d: Math.hypot(b.x - bean.x, b.y - bean.y) })).sort((a, z) => a.d - z.d);
function renderCompass() {
  const best = nearest()[0].b;
  const pos = (v) => `${((v + 1) / 2) * 84 + 8}%`;
  $('#beanDots').innerHTML = BEANS.map((b) => `<div class="bdot ${b === best ? 'best' : ''}" style="left:${pos(b.x)};top:${pos(b.y)};--c:${b.color}"><i></i><span>${esc(L(b.origin).split('·').pop().trim())}</span></div>`).join('');
  const k = $('#knob'); k.style.left = pos(bean.x); k.style.top = pos(bean.y);
  const size = BEAN_SIZES.find((x) => x.id === bean.size);
  const plan = SUB_PLANS.find((p) => p.id === bean.plan);
  const unit = Math.round(best.price * size.mult * (1 - plan.off));
  const badge = best.badge ? `<span class="badge ${best.badge === 'espresso' ? 'alt' : ''}">${t(`b_${best.badge}`)}</span>` : '';
  const pills = (key, list, cur) => list.map((x) => `<button class="pill" aria-pressed="${x.id === cur}" data-bean="${key}" data-val="${x.id}">${esc(typeof x.label === 'string' ? x.label : L(x.label))}</button>`).join('');
  $('#match').innerHTML = `
    <div class="bagart">${bagSVG(best.color, best.id.toUpperCase())}</div>
    <div style="min-width:0"><span class="kicker" style="margin:0">${t('bestMatch')}</span> ${badge}
      <h3>${esc(L(best.origin))}</h3><p class="notes">${esc(L(best.notes))}</p></div>
    <div class="full">
      <dl class="specs"><div><dt>${t('process')}</dt><dd>${esc(L(best.process))}</dd></div><div><dt>${t('altitude')}</dt><dd>${best.alt ? `${best.alt} m` : '—'}</dd></div><div><dt>${t('roast')}</dt><dd>${t(`r_${best.roast}`)}</dd></div></dl>
      <div class="opt"><span>${t('size')}</span><div class="pills">${pills('size', BEAN_SIZES, bean.size)}</div></div>
      <div class="opt"><span>${t('grind')}</span><div class="pills">${pills('grind', GRINDS, bean.grind)}</div></div>
      <div class="opt"><span>${t('plan')}</span><div class="pills">${pills('plan', SUB_PLANS, bean.plan)}</div></div>
      <button class="btn sun wide" id="beanAdd" data-id="${best.id}">${t('addBag', { p: money(unit) })}</button>
      <p class="hint">${t('subNote')}</p>
    </div>`;
  $('#beanRow').innerHTML = BEANS.map((b) => `<button class="bean-card" aria-pressed="${b === best}" data-goto="${b.id}">${bagSVG(b.color, b.id.toUpperCase())}<span style="min-width:0"><b>${esc(L(b.origin))}</b><small>${esc(L(b.notes))}</small><small>${money(b.price)} · 250 g</small></span></button>`).join('');
}
function compassDrag() {
  const pad = $('#pad');
  let drag = false;
  const move = (e) => {
    const r = pad.getBoundingClientRect();
    const fx = ((e.clientX - r.left) / r.width - 0.08) / 0.84; const fy = ((e.clientY - r.top) / r.height - 0.08) / 0.84;
    bean.x = Math.max(-1, Math.min(1, fx * 2 - 1)); bean.y = Math.max(-1, Math.min(1, fy * 2 - 1));
    renderCompass();
  };
  pad.addEventListener('pointerdown', (e) => { drag = true; pad.setPointerCapture(e.pointerId); move(e); });
  pad.addEventListener('pointermove', (e) => drag && move(e));
  pad.addEventListener('pointerup', () => { drag = false; });
  $('#knob').addEventListener('keydown', (e) => {
    const s = 0.1; const k = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
    if (!k) return; e.preventDefault();
    bean.x = Math.max(-1, Math.min(1, bean.x + k[0])); bean.y = Math.max(-1, Math.min(1, bean.y + k[1])); renderCompass(); $('#knob').focus();
  });
}

// ── brew guide ────────────────────────────────────────────────────────────
const brew = { m: 'v60', cups: 2, t: 0, run: false, timer: null };
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function renderBrew() {
  const r = BREW.find((x) => x.id === brew.m);
  $('#brewMethods').innerHTML = BREW.map((x) => `<button aria-pressed="${x.id === brew.m}" data-method="${x.id}">${x.name}</button>`).join('');
  $('#cupN').textContent = brew.cups;
  const water = brew.cups * (r.id === 'moka' ? 120 : 250);
  const coffee = Math.round(water / r.ratio);
  $('#brewOut').innerHTML = `<div><dt>${t('coffee')}</dt><dd>${coffee}<small>g</small></dd></div><div><dt>${t('water')}</dt><dd>${water}<small>ml</small></dd></div>
    <div><dt>${t('grind')}</dt><dd style="font-size:22px">${esc(L(r.grind))}</dd></div><div><dt>${t('temp')}</dt><dd>${r.temp}<small>°C</small></dd></div>
    <div><dt>${t('ratio')}</dt><dd>1:${r.ratio}</dd></div><div><dt>⏱</dt><dd>${mmss(r.time)}</dd></div>`;
  renderBrewTimer();
}
function renderBrewTimer() {
  const r = BREW.find((x) => x.id === brew.m);
  $('#brewClock').textContent = mmss(brew.t);
  $('#brewProg').style.strokeDashoffset = 553 * (1 - Math.min(1, brew.t / r.time));
  const cur = [...r.steps].reverse().find(([s]) => s <= brew.t) || r.steps[0];
  $('#brewStep').textContent = L(cur[1]);
  $('#brewSteps').innerHTML = r.steps.map(([s, txt], i) => {
    const next = r.steps[i + 1]?.[0] ?? Infinity;
    const cls = brew.t >= next ? 'done' : brew.t >= s && (brew.run || brew.t > 0) ? 'on' : '';
    return `<li class="${cls}"><b>${mmss(s)}</b><span>${esc(L(txt))}</span></li>`;
  }).join('');
  $('#brewStart').textContent = brew.run ? t('pause') : t('start');
}
function brewToggle() {
  const r = BREW.find((x) => x.id === brew.m);
  if (brew.run) { brew.run = false; clearInterval(brew.timer); renderBrewTimer(); return; }
  if (brew.t >= r.time) brew.t = 0;
  brew.run = true;
  const t0 = Date.now() - brew.t * 1000;
  brew.timer = setInterval(() => {
    brew.t = Math.min(r.time, (Date.now() - t0) / 1000);
    if (brew.t >= r.time) { brew.run = false; clearInterval(brew.timer); toast(`☕ ${L(r.steps[r.steps.length - 1][1])}`); }
    renderBrewTimer();
  }, 250);
  renderBrewTimer();
}
function brewReset() { brew.run = false; clearInterval(brew.timer); brew.t = 0; renderBrewTimer(); }

// ── loyalty card ──────────────────────────────────────────────────────────
const CUP = '<svg viewBox="0 0 24 24"><path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V8Z" fill="currentColor"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
let cardPhone = '';
function renderCard() {
  const s = db.get();
  const key = cardPhone || s.myPhone || '0612345678';
  const m = s.members[key];
  const n = m ? Math.min(m.stamps, CAFE.stampsForReward) : 0;
  const reward = m && m.stamps >= CAFE.stampsForReward;
  const pretty = key.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  const circles = Array.from({ length: CAFE.stampsForReward }, (_, i) => `<span class="stamp ${i < n ? 'on' : ''}" style="--i:${i}">${i < n ? CUP : ''}</span>`).join('')
    + `<span class="stamp gift ${reward ? 'on' : ''}" style="--i:9">${reward ? '🎁' : 'FREE'}</span>`;
  $('#stampcard').innerHTML = `
    <div class="sc-top"><div><b>NOUR</b><small>stamp card</small></div><span>${esc(m?.name || '')}<br/>${esc(pretty)}</span></div>
    <div class="stamps">${circles}</div>
    <div class="sc-bottom"><span>${reward ? `🎁 ${t('reward')}` : esc(t('toGo', { n: CAFE.stampsForReward - n }))}</span><small>${esc(t('stampsOf', { n, m: CAFE.stampsForReward }))}</small></div>`;
}
function loyalty() {
  $('#loyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const key = db.digits($('#loyPhone').value);
    const msg = $('#loyMsg');
    if (key.length < 9) { msg.className = 'msg err'; msg.textContent = t('needContact'); return; }
    if (!db.get().members[key]) { msg.className = 'msg err'; msg.textContent = t('cardNotFound'); return; }
    cardPhone = key; msg.className = 'msg'; const m = db.get().members[key];
    msg.textContent = t('member', { d: dateFmt(new Date(m.since), { month: 'long', year: 'numeric' }) });
    renderCard();
  });
  $('#loyJoin').addEventListener('click', () => {
    const key = db.digits($('#loyPhone').value);
    const msg = $('#loyMsg');
    if (key.length < 9) { msg.className = 'msg err'; msg.textContent = t('needContact'); $('#loyPhone').focus(); return; }
    db.update((s) => { if (!s.members[key]) s.members[key] = { name: '', stamps: 0, since: Date.now(), visits: 0, rewards: 0 }; s.myPhone = key; });
    cardPhone = key; msg.className = 'msg'; msg.textContent = t('joined'); renderCard();
  });
}

// ── gift cards ────────────────────────────────────────────────────────────
const gift = { amount: 200, design: 'sun', code: '' };
function renderGift() {
  $('#giftAmounts').innerHTML = GIFT_AMOUNTS.map((a) => `<button type="button" class="pill" aria-pressed="${a === gift.amount}" data-amt="${a}">${money(a)}</button>`).join('');
  $('#giftDesigns').innerHTML = GIFT_DESIGNS.map((d) => `<button type="button" class="pill" aria-pressed="${d.id === gift.design}" data-design="${d.id}">${esc(L(d.label))}</button>`).join('');
  $('#giftBuy').textContent = t('buyGift', { p: money(gift.amount) });
  renderGiftCard();
}
function renderGiftCard() {
  const to = $('#giftTo').value.trim(); const from = $('#giftFrom').value.trim(); const msg = $('#giftMsg').value.trim();
  const until = new Date(); until.setFullYear(until.getFullYear() + 1);
  $('#giftCard').className = `giftcard gc-${gift.design}`;
  $('#giftCard').innerHTML = `<div class="gc-row"><b>NOUR</b><span>${gift.code ? `<span class="code">${esc(gift.code)}</span>` : 'GIFT CARD'}</span></div>
    <p class="gc-msg">${esc(msg || t('messagePh'))}</p>
    <div class="gc-row"><div>${to ? `${t('to')} <b style="font-size:16px">${esc(to)}</b>` : ''}${from ? `<br/>${t('from')} ${esc(from)}` : ''}</div><div class="gc-amt">${money(gift.amount)}</div></div>`;
  return until;
}
function gifts() {
  $('#giftForm').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.amt) { gift.amount = Number(b.dataset.amt); gift.code = ''; renderGift(); }
    if (b.dataset.design) { gift.design = b.dataset.design; renderGift(); }
  });
  ['#giftTo', '#giftFrom', '#giftMsg'].forEach((s) => $(s).addEventListener('input', () => { gift.code = ''; renderGiftCard(); }));
  $('#giftForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const r = () => Math.random().toString(36).slice(2, 6).toUpperCase();
    gift.code = `NOUR-${r()}-${r().slice(0, 2)}`;
    const until = renderGiftCard();
    db.update((s) => { s.gifts.unshift({ code: gift.code, amount: gift.amount, design: gift.design, to: $('#giftTo').value.trim(), from: $('#giftFrom').value.trim(), msg: $('#giftMsg').value.trim(), at: Date.now() }); });
    $('#giftMsgOut').textContent = `${t('giftReady', { c: gift.code })} ${t('validUntil', { d: dateFmt(until, { day: 'numeric', month: 'long', year: 'numeric' }) })}`;
  });
}

// ── events ────────────────────────────────────────────────────────────────
function renderEvents() {
  $('#eventList').innerHTML = EVENTS.map((ev) => {
    const d = db.nextDate(ev);
    const left = db.seatsLeft(ev);
    const pct = Math.round(((ev.seats - left) / ev.seats) * 100);
    return `<article class="event" style="--c:${ev.color}">
      <div class="date"><b>${d.getDate()}</b><span>${esc(dateFmt(d, { weekday: 'long' }))}<br/>${esc(dateFmt(d, { month: 'short' }))} · ${db.hhmm(ev.at)}</span></div>
      <div class="ev-body"><h4>${esc(L(ev.name))}</h4><p>${esc(L(ev.desc))}</p></div>
      <div class="ev-foot"><div class="seatbar"><i style="width:${pct}%"></i></div>
        <div class="ev-meta"><span>${left ? t('seatsLeft', { n: left }) : t('full')}</span><span>${ev.price ? money(ev.price) : t('free')}</span></div>
        <button class="btn ${left ? 'ink' : 'ghost'} wide" data-book="${ev.id}" ${left ? '' : 'disabled'}>${left ? t('book') : t('full')}</button></div>
    </article>`;
  }).join('');
}
const booking = { id: '', seats: 1 };
function openBooking(id) { booking.id = id; booking.seats = 1; renderBooking(); open($('#bookSheet')); }
function renderBooking() {
  const ev = db.eventById(booking.id); const d = db.nextDate(ev); const left = db.seatsLeft(ev);
  $('#bookSheet').innerHTML = `${head(L(ev.name))}<form class="sheet-body" id="bookForm" style="display:grid;gap:12px">
    <p class="lead" style="margin:0">${esc(dateFmt(d, { weekday: 'long', day: 'numeric', month: 'long' }))} · ${db.hhmm(ev.at)} · ${ev.price ? money(ev.price) : t('free')}</p>
    <div class="cups"><span>${t('seats')}</span><div class="stepper"><button type="button" data-seat="-1">−</button><output>${booking.seats}</output><button type="button" data-seat="1">+</button></div></div>
    <div class="two"><label class="field"><span>${t('name')}</span><input id="bkName" required maxlength="40" value="${esc(co.name)}" data-autofocus/></label>
      <label class="field"><span>${t('phone')}</span><input id="bkPhone" type="tel" required value="${esc(co.phone)}" placeholder="06 12 34 56 78"/></label></div>
    <p class="msg err" id="bkErr"></p>
    <button class="btn sun wide" type="submit">${t('book')}${ev.price ? ` · ${money(ev.price * booking.seats)}` : ''}</button>
    <small class="hint">${t('seatsLeft', { n: left })}</small></form>`;
}
function bookingEvents() {
  $('#bookSheet').addEventListener('click', (e) => {
    const b = e.target.closest('[data-seat]'); if (!b) return;
    const ev = db.eventById(booking.id);
    const name = $('#bkName').value; const phone = $('#bkPhone').value;
    booking.seats = Math.max(1, Math.min(db.seatsLeft(ev), 6, booking.seats + Number(b.dataset.seat)));
    renderBooking(); $('#bkName').value = name; $('#bkPhone').value = phone;
  });
  $('#bookSheet').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#bkName').value.trim(); const phone = $('#bkPhone').value.trim();
    if (!name || db.digits(phone).length < 9) { $('#bkErr').textContent = t('needContact'); return; }
    const ev = db.eventById(booking.id); const d = db.nextDate(ev);
    db.update((s) => { s.bookings.push({ id: `b${Date.now()}`, event: ev.id, date: d.getTime(), seats: booking.seats, name, phone, at: Date.now() }); });
    co.name = name; co.phone = phone;
    close(); renderEvents();
    toast(t('booked', { e: L(ev.name), d: dateFmt(d, { weekday: 'long', day: 'numeric', month: 'long' }) }));
  });
}

// ── catering quote, newsletter ────────────────────────────────────────────
function forms() {
  $('#quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = { id: `q${Date.now()}`, company: $('#qCompany').value.trim(), people: Number($('#qPeople').value) || 0, date: $('#qDate').value, type: $('#qType').value, name: $('#qName').value.trim(), phone: $('#qPhone').value.trim(), at: Date.now() };
    const msg = $('#quoteMsg');
    if (!q.name || db.digits(q.phone).length < 9) { msg.className = 'msg err'; msg.textContent = t('needContact'); return; }
    db.update((s) => { s.quotes.unshift(q); });
    msg.className = 'msg'; msg.textContent = t('quoteSent'); e.target.reset(); renderQuoteTypes();
  });
  $('#newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#newsEmail').value.trim();
    db.update((s) => { if (!s.newsletter.includes(v)) s.newsletter.unshift(v); });
    $('#newsMsg').textContent = t('subscribed'); $('#newsEmail').value = '';
  });
}
function renderQuoteTypes() { const cur = $('#qType').value; $('#qType').innerHTML = ['office', 'event', 'wedding'].map((x) => `<option value="${x}" ${x === cur ? 'selected' : ''}>${t(`ty_${x}`)}</option>`).join(''); }

// ── visit ─────────────────────────────────────────────────────────────────
const AMEN_ICON = {
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/>',
  plug: '<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7ZM12 17v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  paw: '<circle cx="7" cy="9" r="2" fill="currentColor"/><circle cx="12" cy="6" r="2" fill="currentColor"/><circle cx="17" cy="9" r="2" fill="currentColor"/><path d="M7 17c0-3 2.5-5 5-5s5 2 5 5-2 3-5 3-5 0-5-3Z" fill="currentColor"/>',
  wheel: '<circle cx="10" cy="15" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="4" r="1.6" fill="currentColor"/><path d="M9 7v6h6l2 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  quiet: '<path d="M4 10v4h4l5 4V6L8 10H4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m17 9 4 6M21 9l-4 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
function renderVisit() {
  $('#addr').textContent = L(CAFE.address);
  $('#dirBtn').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CAFE.mapsQuery)}`;
  const { day } = db.cafeNow();
  const hours = db.get().settings.hours;
  $('#hoursTable').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => `<tr class="${d === day ? 'today' : ''}"><td>${days()[d]}</td><td>${hours[d] ? `${db.hhmm(hours[d][0])} – ${db.hhmm(hours[d][1])}` : t('closed')}</td></tr>`).join('');
  $('#amen').innerHTML = AMENITIES.map(([k, l]) => `<li><svg viewBox="0 0 24 24" aria-hidden="true">${AMEN_ICON[k]}</svg>${esc(L(l))}</li>`).join('');
  $('#map').innerHTML = `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill="#ece4d6"/>
      <g fill="#e2d8c6">${Array.from({ length: 40 }, (_, i) => `<rect x="${(i % 8) * 52 + 6}" y="${Math.floor(i / 8) * 64 + 6}" width="${38 + (i * 7) % 10}" height="${48 + (i * 5) % 8}" rx="4"/>`).join('')}</g>
      <path d="M-20 120 Q120 90 210 140 T430 150" stroke="#fffaf2" stroke-width="18" fill="none"/>
      <path d="M150 -20 L230 320" stroke="#fffaf2" stroke-width="14" fill="none"/>
      <path d="M-10 230 L420 200" stroke="#fffaf2" stroke-width="10" fill="none"/>
      <path d="M300 -10 L340 310" stroke="#fffaf2" stroke-width="8" fill="none"/>
      <ellipse cx="80" cy="60" rx="56" ry="34" fill="#cfe0c3"/>
      <text x="40" y="112" font-family="JetBrains Mono" font-size="9" fill="#8a7c6e" transform="rotate(-8 40 112)">BD ZERKTOUNI</text>
      <text x="236" y="40" font-family="JetBrains Mono" font-size="9" fill="#8a7c6e" transform="rotate(74 236 40)">RUE DES ORANGERS</text>
      <text x="300" y="260" font-family="JetBrains Mono" font-size="10" fill="#8a7c6e">MAÂRIF</text>
    </svg><div class="pin"><b>NOUR</b><i></i></div>`;
}

// ── render everything ─────────────────────────────────────────────────────
function renderAll() {
  applyStatic(); renderStatus(); renderMarquee(); renderMenu(); renderBagCount(); renderCompass(); renderBrew();
  renderCard(); renderGift(); renderEvents(); renderQuoteTypes(); renderVisit(); renderLivePill();
  heroI = 0; $('#heroGlass').innerHTML = ''; renderHero();
  if (openSheet === $('#bag')) renderBag();
  if (openSheet === $('#tracker')) renderTracker();
  if (openSheet === $('#builder') && build) renderBuilder();
}

function wire() {
  document.addEventListener('click', (e) => {
    const lb = e.target.closest('[data-lang]'); if (lb) { setLang(lb.dataset.lang); return; }
    if (e.target.closest('[data-close]')) { close(); return; }
    const it = e.target.closest('[data-item]'); if (it) { openBuilder(it.dataset.item); return; }
    const f = e.target.closest('[data-filter]'); if (f) { filter = f.dataset.filter; renderMenu(); return; }
    const bk = e.target.closest('[data-book]'); if (bk) { openBooking(bk.dataset.book); return; }
    const bb = e.target.closest('[data-bean]'); if (bb) { bean[bb.dataset.bean] = bb.dataset.val; renderCompass(); return; }
    const go = e.target.closest('[data-goto]'); if (go) { const b = BEANS.find((x) => x.id === go.dataset.goto); bean.x = b.x; bean.y = b.y; renderCompass(); $('#compass').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const dm = e.target.closest('[data-demo]'); if (dm) { toast(t('demoAction', { x: dm.dataset.demo === 'call' ? CAFE.phone : 'WhatsApp' })); return; }
    const me = e.target.closest('[data-method]'); if (me) { brew.m = me.dataset.method; brewReset(); renderBrew(); return; }
  });
  $('#scrim').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  $('#builder').addEventListener('click', builderClick);
  $('#bag').addEventListener('click', bagClick);
  $('#bag').addEventListener('change', (e) => { if (e.target.id === 'coReward') { readCo(); co.useReward = e.target.checked; renderBag(); } });
  ['#bagBtn', '#bagBtn2'].forEach((s) => $(s).addEventListener('click', () => { renderBag(); open($('#bag')); }));
  $('#livePill').addEventListener('click', (e) => openTracker(e.currentTarget.dataset.id));
  $('#q').addEventListener('input', (e) => { query = e.target.value; renderMenu(); });
  $('#match').addEventListener('click', (e) => {
    const b = e.target.closest('#beanAdd'); if (!b) return;
    const best = BEANS.find((x) => x.id === b.dataset.id);
    const unit = Math.round(best.price * BEAN_SIZES.find((x) => x.id === bean.size).mult * (1 - SUB_PLANS.find((p) => p.id === bean.plan).off));
    db.update((s) => { s.cart.push({ key: `l${Date.now()}`, kind: 'beans', id: best.id, size: bean.size, grind: bean.grind, plan: bean.plan, qty: 1, unit }); });
    renderBagCount(); bump(); toast(`${t('added')} · ${L(best.origin)}`);
  });
  $('#cupMinus').addEventListener('click', () => { brew.cups = Math.max(1, brew.cups - 1); renderBrew(); });
  $('#cupPlus').addEventListener('click', () => { brew.cups = Math.min(8, brew.cups + 1); renderBrew(); });
  $('#brewStart').addEventListener('click', brewToggle);
  $('#brewReset').addEventListener('click', brewReset);
  $('#demobarClose').addEventListener('click', () => { $('#demobar').hidden = true; });
  window.addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 10), { passive: true });
  compassDrag(); loyalty(); gifts(); bookingEvents(); forms();

  // live updates from the owner dashboard (another tab) and the demo auto-flow
  db.subscribe((s, src) => {
    renderStatus(); renderLivePill(); renderBagCount();
    if (src === 'remote') { renderMenu(); renderEvents(); renderCard(); renderVisit(); }
    if (openSheet === $('#tracker')) renderTracker();
  });
  setInterval(() => { db.tick(); renderStatus(); }, 3000);
  setInterval(() => { heroI += 1; renderHero(); }, 3800);

  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.sec-head, .compass-grid, .brew-grid, .loy-grid, .gift-grid, .events, .catering, .visit-grid').forEach((el) => { el.classList.add('rv'); io.observe(el); });
}

renderAll();
wire();
