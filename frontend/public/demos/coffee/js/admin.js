// NOUR owner dashboard (demo). Reads and writes the same localStorage document as the site,
// so orders, bookings and sign-ups made on the website appear here live (and back).
import { CAFE, CATEGORIES, MENU, BEANS, BEAN_SIZES, GRINDS, SUB_PLANS, EVENTS, GIFT_DESIGNS } from './data.js';
import * as db from './store.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PIN = '2468';

const A = {
  en: {
    owner: 'Owner dashboard', pinLabel: 'Enter your PIN', pinHint: 'Demo PIN: 2468', unlock: 'Unlock', backSite: '← Back to the website', badPin: 'Wrong PIN — try 2468.',
    viewSite: 'View website ↗', demoTag: 'Demo by MBN DEV', live: 'Live', soundOn: '🔔 Sound on', soundOff: '🔕 Sound off',
    t_live: 'Live orders', t_menu: 'Menu & stock', t_book: 'Bookings', t_people: 'Customers', t_stats: 'Insights', t_set: 'Settings',
    s_live: 'New orders arrive here instantly — tap to move them along.', s_menu: 'Prices and sold-out items update on the website immediately.', s_book: 'Workshop seats and catering requests.', s_people: 'Stamp cards, gift cards, bean subscriptions and newsletter.', s_stats: 'How the café is doing.', s_set: 'Opening hours, online ordering and the banner.',
    k_rev: 'Revenue today', k_orders: 'Orders', k_avg: 'Average ticket', k_drinks: 'Drinks', k_open: 'In progress',
    received: 'New', brewing: 'Brewing', ready: 'Ready', collected: 'Collected', cancelled: 'Cancelled',
    a_received: 'Start brewing', a_brewing: 'Mark ready', a_ready: 'Collected', cancel: 'Cancel', noOrders: 'Nothing here yet. Place an order on the website — it lands here in a second.',
    pickup: 'Pick up', table: 'Table', delivery: 'Delivery', asap: 'ASAP', counter: 'Pay at counter', card: 'Card', ago: '{n} min ago', now: 'just now',
    autoAdv: 'Auto-advance orders (demo)', autoAdvS: 'Orders move along on their own so the guest tracker can be shown without a barista.',
    newOrder: 'New order #{n} · {t}', newBooking: 'New booking · {e}', newQuote: 'New catering request', recent: 'Collected today',
    item: 'Item', price: 'Price', soldOut: 'Sold out', hidden: 'Hidden', todayBean: 'On the bar today', todayBeanS: 'Shown on the home page and used for the V60/AeroPress.', wait: 'Bar wait time', waitS: 'Shown to guests and used for pickup estimates.', min: 'min', saved: 'Saved — live on the website',
    workshops: 'Workshops & events', seats: 'Seats', booked: 'Booked', guests: 'Guests', when: 'When', name: 'Name', phone: 'Phone', none: 'No bookings yet.', quotes: 'Catering requests', company: 'Company', people: 'People', type: 'Type', date: 'Date',
    members: 'Stamp-card members', stamps: 'Stamps', visits: 'Visits', rewards: 'Rewards', since: 'Since', addStamp: '+1', giftCards: 'Gift cards sold', code: 'Code', amount: 'Amount', to: 'To', from: 'From', design: 'Design', subs: 'Bean subscriptions', bean: 'Bean', plan: 'Plan', news: 'Newsletter', subscribers: '{n} subscribers', export: 'Export CSV',
    rev14: 'Revenue · last 14 days', top: 'Best sellers', modes: 'How guests order', pays: 'Payment', byHour: 'Orders by hour · today',
    pause: 'Pause online orders', pauseS: 'Guests can still browse the menu; the order button is disabled.', banner: 'Announcement banner', bannerS: 'Shown at the top of the website.', bannerPh: 'Empty = default message', hours: 'Opening hours', closed: 'Closed', reset: 'Reset demo data', resetS: 'Puts every order, member and setting back to the start.', resetDone: 'Demo data reset',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], cur: '{n} dh', free: 'Free', sub_once: 'One-time', sub_w2: 'Every 2 weeks', sub_w4: 'Every 4 weeks', ty_office: 'Office', ty_event: 'Event', ty_wedding: 'Wedding',
  },
  fr: {
    owner: 'Espace gérant', pinLabel: 'Entrez votre code', pinHint: 'Code démo : 2468', unlock: 'Déverrouiller', backSite: '← Retour au site', badPin: 'Code incorrect — essayez 2468.',
    viewSite: 'Voir le site ↗', demoTag: 'Démo par MBN DEV', live: 'En direct', soundOn: '🔔 Son activé', soundOff: '🔕 Son coupé',
    t_live: 'Commandes', t_menu: 'Carte & stock', t_book: 'Réservations', t_people: 'Clients', t_stats: 'Statistiques', t_set: 'Réglages',
    s_live: 'Les nouvelles commandes arrivent ici instantanément — touchez pour les faire avancer.', s_menu: 'Prix et ruptures sont mis à jour immédiatement sur le site.', s_book: 'Places aux ateliers et demandes traiteur.', s_people: 'Cartes de fidélité, cartes cadeaux, abonnements café et newsletter.', s_stats: 'Comment va le café.', s_set: 'Horaires, commande en ligne et bandeau.',
    k_rev: 'CA du jour', k_orders: 'Commandes', k_avg: 'Panier moyen', k_drinks: 'Boissons', k_open: 'En cours',
    received: 'Nouvelles', brewing: 'En préparation', ready: 'Prêtes', collected: 'Récupérées', cancelled: 'Annulée',
    a_received: 'Préparer', a_brewing: 'Marquer prête', a_ready: 'Récupérée', cancel: 'Annuler', noOrders: 'Rien pour l’instant. Passez une commande sur le site — elle arrive ici en une seconde.',
    pickup: 'À emporter', table: 'Table', delivery: 'Livraison', asap: 'Dès que possible', counter: 'Au comptoir', card: 'Carte', ago: 'il y a {n} min', now: 'à l’instant',
    autoAdv: 'Avancement automatique (démo)', autoAdvS: 'Les commandes avancent seules pour montrer le suivi client sans barista.',
    newOrder: 'Nouvelle commande n°{n} · {t}', newBooking: 'Nouvelle réservation · {e}', newQuote: 'Nouvelle demande traiteur', recent: 'Récupérées aujourd’hui',
    item: 'Article', price: 'Prix', soldOut: 'Épuisé', hidden: 'Masqué', todayBean: 'Au bar aujourd’hui', todayBeanS: 'Affiché sur l’accueil et utilisé pour V60/AeroPress.', wait: 'Temps d’attente', waitS: 'Affiché aux clients et utilisé pour les retraits.', min: 'min', saved: 'Enregistré — en ligne sur le site',
    workshops: 'Ateliers & soirées', seats: 'Places', booked: 'Réservées', guests: 'Pers.', when: 'Quand', name: 'Nom', phone: 'Téléphone', none: 'Aucune réservation.', quotes: 'Demandes traiteur', company: 'Société', people: 'Personnes', type: 'Type', date: 'Date',
    members: 'Membres fidélité', stamps: 'Tampons', visits: 'Visites', rewards: 'Offertes', since: 'Depuis', addStamp: '+1', giftCards: 'Cartes cadeaux vendues', code: 'Code', amount: 'Montant', to: 'Pour', from: 'De', design: 'Design', subs: 'Abonnements café', bean: 'Café', plan: 'Formule', news: 'Newsletter', subscribers: '{n} abonnés', export: 'Exporter CSV',
    rev14: 'CA · 14 derniers jours', top: 'Meilleures ventes', modes: 'Mode de commande', pays: 'Paiement', byHour: 'Commandes par heure · aujourd’hui',
    pause: 'Mettre en pause la commande en ligne', pauseS: 'Les clients voient la carte ; le bouton commander est désactivé.', banner: 'Bandeau d’annonce', bannerS: 'Affiché en haut du site.', bannerPh: 'Vide = message par défaut', hours: 'Horaires', closed: 'Fermé', reset: 'Réinitialiser la démo', resetS: 'Remet commandes, membres et réglages à zéro.', resetDone: 'Démo réinitialisée',
    days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], cur: '{n} dh', free: 'Gratuit', sub_once: 'Une fois', sub_w2: 'Toutes les 2 semaines', sub_w4: 'Toutes les 4 semaines', ty_office: 'Bureau', ty_event: 'Événement', ty_wedding: 'Mariage',
  },
};
let lang = sessionStorage.getItem('nour-admin-lang') || ((navigator.language || '').startsWith('fr') ? 'fr' : 'en');
const t = (k, v = {}) => String(A[lang][k] ?? A.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const days = () => A[lang].days;
const money = (n) => t('cur', { n: (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) });
const nm = (o) => o?.[lang] ?? o?.en ?? '';
const ago = (ts) => { const m = Math.floor((Date.now() - ts) / 60000); return m < 1 ? t('now') : m < 600 ? t('ago', { n: m }) : new Date(ts).toLocaleDateString(); };
const hm = (ts) => new Date(ts).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
const isToday = (ts) => new Date(ts).toDateString() === new Date().toDateString();

let tab = sessionStorage.getItem('nour-admin-tab') || 'live';
const TABS = [['live', '☕'], ['menu', '📋'], ['book', '📅'], ['people', '💳'], ['stats', '📈'], ['set', '⚙️']];

let toastT;
function toast(msg, cls = '') { const el = $('#atoast'); el.textContent = msg; el.className = `atoast on ${cls}`; clearTimeout(toastT); toastT = setTimeout(() => { el.className = 'atoast'; }, 3000); }

// ── sound (WebAudio, no files) ────────────────────────────────────────────
let ac;
function ding() {
  if (!db.get().settings.sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    [880, 1318.5].forEach((f, i) => {
      const o = ac.createOscillator(); const g = ac.createGain(); const t0 = ac.currentTime + i * 0.14;
      o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + 0.55);
    });
  } catch { /* audio unavailable */ }
}

// ── chrome ────────────────────────────────────────────────────────────────
function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-a]').forEach((el) => { el.textContent = t(el.dataset.a); });
  const lb = ['en', 'fr'].map((l) => `<button aria-pressed="${l === lang}" data-lang="${l}">${l.toUpperCase()}</button>`).join('');
  $('#alang').innerHTML = lb; $('#alang2').innerHTML = lb;
}
function renderTabs() {
  const s = db.get();
  const open = s.orders.filter((o) => ['received', 'brewing', 'ready'].includes(o.status)).length;
  const newB = s.bookings.length + s.quotes.length;
  $('#tabs').innerHTML = TABS.map(([id, ic]) => `<button data-tab="${id}" ${id === tab ? 'aria-current="page"' : ''}><span aria-hidden="true">${ic}</span>${t(`t_${id}`)}${id === 'live' && open ? `<span class="n">${open}</span>` : ''}${id === 'book' && newB ? `<span class="n">${newB}</span>` : ''}</button>`).join('');
  $('#pageTitle').textContent = t(`t_${tab}`);
  $('#pageSub').textContent = t(`s_${tab}`);
  $('#liveState').textContent = t('live');
  $('#soundBtn').textContent = s.settings.sound ? t('soundOn') : t('soundOff');
}

// ── live orders ───────────────────────────────────────────────────────────
const NEXT = { received: 'brewing', brewing: 'ready', ready: 'collected' };
const COLORS = { received: '#ff5a1f', brewing: '#d97706', ready: '#16a34a' };
let fresh = new Set();
function orderCard(o) {
  const mode = o.mode === 'table' ? `<span class="mode table">🪑 ${t('table')} ${esc(o.table)}</span>` : o.mode === 'delivery' ? `<span class="mode delivery">🛵 ${t('delivery')}</span>` : `<span class="mode">🛍 ${t('pickup')}${o.slot && o.slot !== 'asap' ? ` · ${esc(o.slot)}` : ` · ${t('asap')}`}</span>`;
  const items = o.items.map((i) => `<li><b>${i.qty}×</b> ${esc(itemName(i))}${i.summary ? `<small>${esc(i.summary).replace(/“(.*?)”/g, '<em>“$1”</em>')}</small>` : ''}</li>`).join('');
  return `<article class="ord ${fresh.has(o.id) ? 'fresh' : ''}">
    <div class="ord-h"><b>#${o.no}</b>${mode}<time>${ago(o.at)}</time></div>
    <div class="who"><b>${esc(o.name)}</b> · ${esc(o.phone)}${o.address ? `<br/>📍 ${esc(o.address)}` : ''}</div>
    <ul>${items}</ul>
    <div class="ord-f"><span>${money(o.total)} <small>· ${o.pay === 'card' ? t('card') : t('counter')}</small></span>
      <div style="display:flex;gap:6px">${o.status === 'received' ? `<button class="abtn danger sm" data-cancel="${o.id}">${t('cancel')}</button>` : ''}<button class="abtn ${o.status === 'ready' ? 'ok' : o.status === 'received' ? 'sun' : ''} sm" data-adv="${o.id}">${t(`a_${o.status}`)}</button></div></div>
  </article>`;
}
const itemName = (i) => { if (i.kind === 'beans') { const b = BEANS.find((x) => x.id === i.id); return b ? `${nm(b.origin)} · beans` : i.name; } const m = MENU.find((x) => x.id === i.id); return m ? nm(m.name) : i.name; };
function todayStats() {
  const s = db.get();
  const today = s.orders.filter((o) => isToday(o.at) && o.status !== 'cancelled');
  const rev = today.reduce((a, o) => a + o.total, 0);
  const drinks = today.reduce((a, o) => a + o.items.filter((i) => MENU.find((m) => m.id === i.id)?.kind === 'drink').reduce((x, i) => x + i.qty, 0), 0);
  return { today, rev, n: today.length, avg: today.length ? rev / today.length : 0, drinks, open: today.filter((o) => o.status !== 'collected').length };
}
function viewLive() {
  const s = db.get(); const st = todayStats();
  const cols = ['received', 'brewing', 'ready'].map((k) => {
    const list = s.orders.filter((o) => o.status === k).sort((a, b) => a.at - b.at);
    return `<div class="col"><div class="col-h"><div><i style="background:${COLORS[k]}"></i>${t(k)}</div><span>${list.length}</span></div>${list.length ? list.map(orderCard).join('') : `<div class="empty-col">${k === 'received' ? t('noOrders') : '—'}</div>`}</div>`;
  }).join('');
  const done = s.orders.filter((o) => o.status === 'collected' && isToday(o.at)).sort((a, b) => b.at - a.at).slice(0, 8);
  return `<div class="kpis">
      <div class="kpi"><span>${t('k_rev')}</span><b>${money(st.rev)}</b></div>
      <div class="kpi"><span>${t('k_orders')}</span><b>${st.n}</b></div>
      <div class="kpi"><span>${t('k_avg')}</span><b>${money(Math.round(st.avg))}</b></div>
      <div class="kpi"><span>${t('k_drinks')}</span><b>${st.drinks}</b></div>
      <div class="kpi"><span>${t('k_open')}</span><b>${st.open}</b></div></div>
    <div class="board">${cols}</div>
    <div class="grid2" style="margin-top:14px">
      <div class="card"><h2>${t('recent')} <small>${done.length}</small></h2><div class="tbl-wrap"><table class="t"><tbody>${done.map((o) => `<tr><td class="num">#${o.no}</td><td>${esc(o.name)}<div class="muted">${o.items.map((i) => `${i.qty}× ${esc(itemName(i))}`).join(', ')}</div></td><td class="num">${hm(o.at)}</td><td class="num"><b>${money(o.total)}</b></td></tr>`).join('')}</tbody></table></div></div>
      <div class="card"><div class="frow"><div><b>${t('autoAdv')}</b><small>${t('autoAdvS')}</small></div><label class="sw on"><input type="checkbox" data-set="autoAdvance" ${s.settings.autoAdvance ? 'checked' : ''}/><span></span></label></div>
        <div class="frow"><div><b>${t('pause')}</b><small>${t('pauseS')}</small></div><label class="sw"><input type="checkbox" data-set="paused" ${s.settings.paused ? 'checked' : ''}/><span></span></label></div>
        <div class="frow"><div><b>${t('wait')}</b><small>${t('waitS')}</small></div><div class="stepper"><button data-wait="-1">−</button><output>${s.settings.wait}</output><button data-wait="1">+</button></div></div></div>
    </div>`;
}

// ── menu & stock ──────────────────────────────────────────────────────────
function viewMenu() {
  const s = db.get();
  const beanOpts = BEANS.map((b) => `<option value="${b.id}" ${b.id === s.settings.todayBean ? 'selected' : ''}>${esc(nm(b.origin))}</option>`).join('');
  return `<div class="card" style="margin-bottom:14px"><div class="frow"><div><b>${t('todayBean')}</b><small>${t('todayBeanS')}</small></div><select class="in" data-bean>${beanOpts}</select></div>
      <div class="frow"><div><b>${t('wait')}</b><small>${t('waitS')}</small></div><div class="stepper"><button data-wait="-1">−</button><output>${s.settings.wait}</output><button data-wait="1">+</button></div></div></div>
    ${CATEGORIES.map((c) => `<div class="card" style="margin-bottom:14px"><h2>${esc(nm(c.name))}</h2><div class="tbl-wrap"><table class="t fit">
      <thead><tr><th>${t('item')}</th><th>${t('price')}</th><th>${t('soldOut')}</th><th>${t('hidden')}</th></tr></thead><tbody>
      ${MENU.filter((m) => m.cat === c.id).map((m) => { const st = db.itemState(m.id); return `<tr><td><b>${esc(nm(m.name))}</b>${st.soldOut ? ' <span class="chip sun">' + t('soldOut') + '</span>' : ''}</td>
        <td><input class="price-in" type="number" min="0" step="0.5" value="${db.priceOf(m)}" data-price="${m.id}" aria-label="${t('price')}"/></td>
        <td><label class="sw"><input type="checkbox" data-sold="${m.id}" ${st.soldOut ? 'checked' : ''}/><span></span></label></td>
        <td><label class="sw"><input type="checkbox" data-hide="${m.id}" ${st.hidden ? 'checked' : ''}/><span></span></label></td></tr>`; }).join('')}
      </tbody></table></div></div>`).join('')}`;
}

// ── bookings ──────────────────────────────────────────────────────────────
function viewBook() {
  const s = db.get();
  const ev = EVENTS.map((e) => {
    const d = db.nextDate(e); const list = s.bookings.filter((b) => b.event === e.id); const left = db.seatsLeft(e);
    return `<div class="card"><h2>${esc(nm(e.name))} <small>${d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${db.hhmm(e.at)}</small></h2>
      <p style="margin:0 0 10px"><span class="chip">${t('seats')}: ${e.seats - left}/${e.seats}</span> <span class="chip ok">${e.price ? money(e.price) : t('free')}</span></p>
      ${list.length ? `<div class="tbl-wrap"><table class="t"><thead><tr><th>${t('name')}</th><th>${t('phone')}</th><th>${t('guests')}</th><th>${t('booked')}</th></tr></thead><tbody>${list.map((b) => `<tr><td><b>${esc(b.name)}</b></td><td class="num">${esc(b.phone)}</td><td class="num">${b.seats}</td><td class="muted">${ago(b.at)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="muted" style="margin:0;color:var(--muted)">${t('none')} · ${e.taken} ${t('booked').toLowerCase()} offline</p>`}</div>`;
  }).join('');
  const q = s.quotes.map((x) => `<tr><td><b>${esc(x.company || '—')}</b><div class="muted">${esc(x.name)} · ${esc(x.phone)}</div></td><td class="num">${x.people}</td><td>${t(`ty_${x.type}`)}</td><td class="num">${esc(x.date || '—')}</td><td class="muted">${ago(x.at)}</td></tr>`).join('');
  return `<div class="grid2">${ev}</div><div class="card" style="margin-top:14px"><h2>${t('quotes')} <small>${s.quotes.length}</small></h2><div class="tbl-wrap"><table class="t"><thead><tr><th>${t('company')}</th><th>${t('people')}</th><th>${t('type')}</th><th>${t('date')}</th><th></th></tr></thead><tbody>${q}</tbody></table></div></div>`;
}

// ── customers ─────────────────────────────────────────────────────────────
function viewPeople() {
  const s = db.get();
  const mem = Object.entries(s.members).sort((a, b) => b[1].stamps - a[1].stamps).map(([k, m]) => {
    const n = Math.min(m.stamps, CAFE.stampsForReward);
    return `<tr><td><b>${esc(m.name || '—')}</b><div class="muted">${k.replace(/(\d{2})(?=\d)/g, '$1 ')}</div></td>
      <td><span class="stamps-mini">${Array.from({ length: CAFE.stampsForReward }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span> ${m.stamps >= CAFE.stampsForReward ? '<span class="chip ok">🎁</span>' : ''}</td>
      <td class="num">${m.visits}</td><td class="num">${m.rewards}</td><td class="muted">${new Date(m.since).toLocaleDateString()}</td><td><button class="abtn ghost sm" data-stamp="${k}">${t('addStamp')}</button></td></tr>`;
  }).join('');
  const gifts = s.gifts.map((g) => `<tr><td class="num"><b>${esc(g.code)}</b></td><td class="num">${money(g.amount)}</td><td>${esc(g.to || '—')}</td><td>${esc(g.from || '—')}</td><td>${esc(nm(GIFT_DESIGNS.find((d) => d.id === g.design)?.label))}</td><td class="muted">${ago(g.at)}</td></tr>`).join('');
  const subs = s.subs.map((x) => { const b = BEANS.find((y) => y.id === x.bean); return `<tr><td><b>${esc(nm(b?.origin))}</b><div class="muted">${BEAN_SIZES.find((z) => z.id === x.size)?.label} · ${esc(nm(GRINDS.find((g) => g.id === x.grind)?.label))}</div></td><td>${t(`sub_${x.plan}`)}</td><td>${esc(x.name)}<div class="muted">${esc(x.phone)}</div></td><td class="muted">${ago(x.at)}</td></tr>`; }).join('');
  return `<div class="card" style="margin-bottom:14px"><h2>${t('members')} <small>${Object.keys(s.members).length}</small></h2><div class="tbl-wrap"><table class="t"><thead><tr><th>${t('name')}</th><th>${t('stamps')}</th><th>${t('visits')}</th><th>${t('rewards')}</th><th>${t('since')}</th><th></th></tr></thead><tbody>${mem}</tbody></table></div></div>
    <div class="grid2"><div class="card"><h2>${t('giftCards')} <small>${money(s.gifts.reduce((a, g) => a + g.amount, 0))}</small></h2><div class="tbl-wrap"><table class="t"><thead><tr><th>${t('code')}</th><th>${t('amount')}</th><th>${t('to')}</th><th>${t('from')}</th><th>${t('design')}</th><th></th></tr></thead><tbody>${gifts}</tbody></table></div></div>
      <div class="card"><h2>${t('subs')} <small>${s.subs.length}</small></h2><div class="tbl-wrap"><table class="t"><thead><tr><th>${t('bean')}</th><th>${t('plan')}</th><th>${t('name')}</th><th></th></tr></thead><tbody>${subs}</tbody></table></div>
        <h2 style="margin-top:18px">${t('news')} <small>${t('subscribers', { n: s.newsletter.length })}</small></h2><button class="abtn ghost sm" data-export>${t('export')}</button></div></div>`;
}

// ── insights ──────────────────────────────────────────────────────────────
function seeded(d) { let x = Math.sin(d * 9301 + 49297) * 233280; return x - Math.floor(x); }
function viewStats() {
  const s = db.get(); const st = todayStats();
  const range = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i)); return d; });
  const vals = range.map((d, i) => (i === 13 ? st.rev : Math.round(2200 + seeded(d.getTime() / 864e5) * 1600 + ([0, 6].includes(d.getDay()) ? 900 : 0))));
  const max = Math.max(...vals, 1);
  const bars = range.map((d, i) => `<div class="${i === 13 ? 'today' : ''}" title="${money(vals[i])}"><i style="height:${Math.max(4, (vals[i] / max) * 150)}px"></i><span>${days()[d.getDay()].slice(0, 2)}</span></div>`).join('');
  const counts = {};
  s.orders.filter((o) => o.status !== 'cancelled').forEach((o) => o.items.forEach((i) => { counts[i.id] = (counts[i.id] || 0) + i.qty; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6); const tmax = top[0]?.[1] || 1;
  const modes = ['pickup', 'table', 'delivery'].map((m) => [m, st.today.filter((o) => o.mode === m).length]);
  const pays = ['counter', 'card'].map((p) => [p, st.today.filter((o) => o.pay === p).length]);
  const mc = { pickup: '#ff5a1f', table: '#2563eb', delivery: '#0f3d2e', counter: '#17120e', card: '#ffb547' };
  const split = (arr) => { const tot = arr.reduce((a, [, n]) => a + n, 0) || 1; return `<div class="split">${arr.map(([k, n]) => `<i style="width:${(n / tot) * 100}%;background:${mc[k]}"></i>`).join('')}</div><div class="legend">${arr.map(([k, n]) => `<span><i style="background:${mc[k]}"></i>${t(k)} · ${n}</span>`).join('')}</div>`; };
  const hours = Array.from({ length: 16 }, (_, i) => i + 7);
  const hc = hours.map((h) => st.today.filter((o) => new Date(o.at).getHours() === h).length); const hmax = Math.max(...hc, 1);
  return `<div class="kpis"><div class="kpi"><span>${t('k_rev')}</span><b>${money(st.rev)}</b></div><div class="kpi"><span>${t('k_orders')}</span><b>${st.n}</b></div><div class="kpi"><span>${t('k_avg')}</span><b>${money(Math.round(st.avg))}</b></div><div class="kpi"><span>14d</span><b>${money(vals.reduce((a, b) => a + b, 0))}</b></div><div class="kpi"><span>${t('members')}</span><b>${Object.keys(s.members).length}</b></div></div>
    <div class="grid2"><div class="card"><h2>${t('rev14')}</h2><div class="bars">${bars}</div></div>
      <div class="card"><h2>${t('top')}</h2><div class="hbar">${top.map(([id, n]) => { const i = { id, kind: MENU.some((m) => m.id === id) ? 'menu' : 'beans' }; return `<div><b>${esc(itemName(i))}</b><span>${n}</span><i style="width:${(n / tmax) * 100}%"></i></div>`; }).join('')}</div></div>
      <div class="card"><h2>${t('byHour')}</h2><div class="bars" style="height:140px">${hours.map((h, i) => `<div><i style="height:${Math.max(3, (hc[i] / hmax) * 110)}px;background:${hc[i] ? '#ff5a1f' : '#e3d8ca'}"></i><span>${h}</span></div>`).join('')}</div></div>
      <div class="card"><h2>${t('modes')}</h2>${split(modes)}<h2 style="margin-top:20px">${t('pays')}</h2>${split(pays)}</div></div>`;
}

// ── settings ──────────────────────────────────────────────────────────────
function viewSet() {
  const s = db.get(); const h = s.settings.hours;
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => `<div><b>${days()[d]}</b><label class="sw on"><input type="checkbox" data-dayopen="${d}" ${h[d] ? 'checked' : ''}/><span></span></label>
    <input class="in" type="time" data-open="${d}" value="${h[d] ? db.hhmm(h[d][0]) : '08:00'}" ${h[d] ? '' : 'disabled'}/><input class="in" type="time" data-close="${d}" value="${h[d] ? db.hhmm(h[d][1]) : '22:00'}" ${h[d] ? '' : 'disabled'}/></div>`).join('');
  return `<div class="grid2"><div class="card">
      <div class="frow"><div><b>${t('pause')}</b><small>${t('pauseS')}</small></div><label class="sw"><input type="checkbox" data-set="paused" ${s.settings.paused ? 'checked' : ''}/><span></span></label></div>
      <div class="frow"><div><b>${t('banner')}</b><small>${t('bannerS')}</small></div><label class="sw on"><input type="checkbox" data-set="banner" ${s.settings.banner ? 'checked' : ''}/><span></span></label></div>
      <div class="frow" style="display:block"><input class="in wide" data-banner maxlength="120" value="${esc(s.settings.bannerText)}" placeholder="${esc(t('bannerPh'))}"/></div>
      <div class="frow"><div><b>${t('autoAdv')}</b><small>${t('autoAdvS')}</small></div><label class="sw on"><input type="checkbox" data-set="autoAdvance" ${s.settings.autoAdvance ? 'checked' : ''}/><span></span></label></div>
      <div class="frow"><div><b>${t('reset')}</b><small>${t('resetS')}</small></div><button class="abtn danger sm" data-reset>${t('reset')}</button></div></div>
    <div class="card"><h2>${t('hours')}</h2><div class="hours-grid">${rows}</div></div></div>`;
}

// ── render & events ───────────────────────────────────────────────────────
const VIEWS = { live: viewLive, menu: viewMenu, book: viewBook, people: viewPeople, stats: viewStats, set: viewSet };
function render() { applyStatic(); renderTabs(); $('#view').innerHTML = VIEWS[tab](); }
const save = (fn, msg = t('saved')) => { db.update(fn); toast(msg); };
const toMin = (v) => { const [a, b] = v.split(':').map(Number); return a * 60 + b; };

function wire() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tab) { tab = b.dataset.tab; sessionStorage.setItem('nour-admin-tab', tab); render(); window.scrollTo(0, 0); }
    else if (b.dataset.lang) { lang = b.dataset.lang; sessionStorage.setItem('nour-admin-lang', lang); render(); }
    else if (b.dataset.adv) { const o = db.get().orders.find((x) => x.id === b.dataset.adv); fresh.delete(o.id); db.setStatus(o.id, NEXT[o.status]); render(); }
    else if (b.dataset.cancel) { db.setStatus(b.dataset.cancel, 'cancelled'); render(); }
    else if (b.dataset.wait) { db.update((s) => { s.settings.wait = Math.max(1, Math.min(45, s.settings.wait + Number(b.dataset.wait))); }); render(); }
    else if (b.dataset.stamp) { db.update((s) => { s.members[b.dataset.stamp].stamps += 1; }); render(); }
    else if (b.dataset.reset !== undefined) { if (confirm(t('resetS'))) { db.resetDemo(); fresh = new Set(); render(); toast(t('resetDone')); } }
    else if (b.dataset.export !== undefined) {
      const blob = new Blob([`email\n${db.get().newsletter.join('\n')}\n`], { type: 'text/csv' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nour-newsletter.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } else if (b.id === 'soundBtn') { db.update((s) => { s.settings.sound = !s.settings.sound; }); renderTabs(); if (db.get().settings.sound) ding(); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.set) save((s) => { s.settings[el.dataset.set] = el.checked; });
    else if (el.dataset.sold) save((s) => { s.menu[el.dataset.sold] = { ...s.menu[el.dataset.sold], soldOut: el.checked }; });
    else if (el.dataset.hide) save((s) => { s.menu[el.dataset.hide] = { ...s.menu[el.dataset.hide], hidden: el.checked }; });
    else if (el.dataset.price) { const v = Math.max(0, Number(el.value) || 0); save((s) => { s.menu[el.dataset.price] = { ...s.menu[el.dataset.price], price: v }; }); }
    else if (el.dataset.bean !== undefined) save((s) => { s.settings.todayBean = el.value; });
    else if (el.dataset.banner !== undefined) save((s) => { s.settings.bannerText = el.value.trim(); });
    else if (el.dataset.dayopen) save((s) => { const d = el.dataset.dayopen; s.settings.hours[d] = el.checked ? [480, 1320] : null; });
    else if (el.dataset.open || el.dataset.close) {
      const d = el.dataset.open || el.dataset.close;
      save((s) => { const cur = s.settings.hours[d] || [480, 1320]; s.settings.hours[d] = el.dataset.open ? [toMin(el.value), cur[1]] : [cur[0], toMin(el.value)]; });
    } else return;
    if (!el.matches('.price-in, [data-banner], [type=time]')) render();
  });

  // notify when something new arrives from the website (another tab)
  let known = new Set(db.get().orders.map((o) => o.id));
  let knownB = db.get().bookings.length; let knownQ = db.get().quotes.length;
  db.subscribe((s, src) => {
    if (src === 'remote') {
      s.orders.filter((o) => !known.has(o.id)).forEach((o) => { fresh.add(o.id); ding(); toast(t('newOrder', { n: o.no, t: money(o.total) }), 'sun'); });
      if (s.bookings.length > knownB) { const b = s.bookings[s.bookings.length - 1]; toast(t('newBooking', { e: nm(db.eventById(b.event)?.name) }), 'sun'); ding(); }
      if (s.quotes.length > knownQ) { toast(t('newQuote'), 'sun'); ding(); }
    }
    known = new Set(s.orders.map((o) => o.id)); knownB = s.bookings.length; knownQ = s.quotes.length;
    const active = document.activeElement;
    if (active && active.matches('input, select, textarea') && $('#view').contains(active)) { renderTabs(); return; } // don't clobber a field being edited
    render();
  });
  setInterval(() => { db.tick(); if (tab === 'live' && !(document.activeElement && document.activeElement.matches('input'))) render(); }, 5000);
}

// ── gate ──────────────────────────────────────────────────────────────────
function unlock() { $('#gate').hidden = true; $('#app').hidden = false; render(); }
applyStatic();
if (sessionStorage.getItem('nour-admin') === '1') unlock();
$('#gateForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if ($('#pin').value === PIN) { sessionStorage.setItem('nour-admin', '1'); unlock(); try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no audio */ } } else { $('#pinErr').textContent = t('badPin'); $('#gateForm').classList.remove('shake'); void $('#gateForm').offsetWidth; $('#gateForm').classList.add('shake'); $('#pin').select(); }
});
$('#pin').focus();
wire();
