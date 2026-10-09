// TARZ owner dashboard (demo). Reads and writes the same localStorage document as the site,
// so bookings, queue tickets and reservations made on the website appear here live (and back).
import { SHOP, SERVICES, CATEGORIES, BARBERS, PRODUCTS, PLANS } from './data.js';
import * as db from './store.js';
import { icon, langDropdown } from './icons.js';
import { fetchConfig, verifyPin } from './gate.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const A = {
  en: {
    owner: 'Owner dashboard', pinLabel: 'Enter your PIN', pinHintN: 'Demo PIN: {pin}', unlock: 'Unlock', backSite: 'Back to the website', language: 'Language',
    tooMany: 'Too many attempts — try again in a few minutes.', offline: 'Cannot reach the server — check your connection.', badPin: 'Wrong PIN.',
    offTitle: 'This demo is switched off', offBody: 'Ask MBN DEV to open it again.', offExpired: 'This demo has expired',
    viewSite: 'View website', demoTag: 'Demo by MBN DEV', live: 'Live', soundOn: 'Sound on', soundOff: 'Sound off',
    t_live: 'Today', t_cal: 'Calendar', t_clients: 'Clients', t_menu: 'Services & shelf', t_team: 'Team', t_stats: 'Insights', t_set: 'Settings',
    s_live: 'The chairs, the queue and today’s appointments — all in real time.', s_cal: 'Any day, any barber. Add bookings and set days off.', s_clients: 'Who comes, how often, and who is close to a free cut.',
    s_menu: 'Prices, availability and stock for the website.', s_team: 'Working hours and today’s numbers per barber.', s_stats: 'What sells, when you are busy, and how the week is going.', s_set: 'Opening hours and how online booking behaves.',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], daysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], cur: '{n} MAD', min: '{n} min', today: 'Today', tomorrow: 'Tomorrow',
    k_rev: 'Revenue today', k_book: 'Booked today', k_chairs: 'Chairs busy', k_queue: 'Waiting in line', k_next: 'Next arrival', expected: 'of {n} expected', none: '—',
    chairsT: 'Chairs', chairFree: 'Free', chairBusy: 'With a client', chairOff: 'Off', withC: 'With {n} until {t}', nextAt: 'Next at {t}', nothingNext: 'Nothing else today',
    queueT: 'Walk-in queue', noQueue: 'Nobody waiting. Add a walk-in below or wait for the website.', joined: 'joined {n} min ago', justNow: 'just now', start: 'Start', startOn: 'Start with…', done: 'Done', leave: 'Remove', inChairNow: 'In the chair',
    walkName: 'Name', addWalk: 'Add walk-in', pickBarber: 'Pick a free chair first.',
    columnEmpty: 'No appointments.', confirm: 'Confirm', checkin: 'Check in', startS: 'Start', complete: 'Complete', noshow: 'No-show', cancel: 'Cancel', decline: 'Decline',
    st_pending: 'New', st_confirmed: 'Confirmed', st_arrived: 'Checked in', st_inchair: 'In chair', st_done: 'Completed', st_noshow: 'No-show', st_cancelled: 'Cancelled', walkinSrc: 'Walk-in', online: 'Online', manual: 'By phone',
    newBooking: 'New booking: {n} at {t}', newQueue: 'New walk-in in the queue',
    addBooking: 'Add booking', addBookingT: 'Add a booking', client: 'Client', phone: 'Phone', services: 'Services', barber: 'Barber', anyone: 'First available', date: 'Date', time: 'Time', noSlots: 'No free time on that day',
    save: 'Save', close: 'Close', needName: 'Enter a name and a phone number.', needSvc: 'Pick at least one service.', needSlot: 'Pick a time.', booked: 'Booking added.', slotTaken: 'That slot was just taken.',
    offDay: 'Days off on {d}', working: 'working', dayOff: 'off', offBooked: '{n} appointment(s) already booked — move them first.',
    clientsT: 'Clients', search: 'Search name or phone…', c_name: 'Client', c_visits: 'Visits', c_spent: 'Spent', c_stamps: 'Stamps', c_last: 'Last visit', c_ns: 'No-shows', c_notes: 'Notes', addStamp: '+1 stamp', giftCut: 'Free cut', notesPh: 'Private note…', noClients: 'No client matches.',
    gifts: 'Gift cards', balance: 'balance', subs: 'Membership requests', newsletter: 'Newsletter', none2: 'Nothing yet.', subsOf: '{p} plan',
    svcT: 'Services', s_name: 'Service', s_dur: 'Duration', s_price: 'Price', s_on: 'Bookable', shelfT: 'Shelf', p_name: 'Product', p_stock: 'Stock', resT: 'Click & collect', resNone: 'No reservations.', r_new: 'New', r_ready: 'Ready', r_picked: 'Picked up', r_cancelled: 'Cancelled', markReady: 'Mark ready', markPicked: 'Picked up',
    teamT: 'Working hours', visible: 'Shown on the website', off: 'Off', from: 'From', to: 'To', todayRev: 'Today', todayCuts: 'Cuts', rating: 'Rating',
    revWeek: 'Revenue · 7 days', vsPrev: '{p}% vs last week', avgTicket: 'Average ticket', noShowRate: 'No-show rate', repeat: 'Returning clients', revDays: 'Revenue · last 14 days', topSvc: 'Top services', busy: 'Busiest hours', less: 'quiet', more: 'busy',
    hoursT: 'Opening hours', closed: 'Closed', open: 'Open', bookingT: 'Online booking', pauseT: 'Pause online booking', pauseS: 'Guests can still browse; the Book button explains there are no slots.', autoConfT: 'Confirm bookings automatically', autoConfS: 'Off: every booking waits for you to confirm it.',
    queueOpenT: 'Walk-in queue is open', queueOpenS: 'Lets guests join the line from the website.', bufferT: 'Buffer between appointments', bufferS: 'Extra minutes kept free after each cut.',
    autoFlowT: 'Auto-advance appointments (demo)', autoFlowS: 'Appointments start and finish by themselves as the clock moves, so the demo stays alive.',
    bannerT: 'Announcement banner', bannerS: 'Shown at the top of the website.', bannerPh: 'Leave empty for the default message',
    dataT: 'Demo data', exportCsv: 'Export bookings (CSV)', resetD: 'Reset demo data', resetS: 'Reset all demo data?', resetDone: 'Demo data reset.', saved: 'Saved.',
  },
  fr: {
    owner: 'Espace gérant', pinLabel: 'Entrez votre code', pinHintN: 'Code démo : {pin}', unlock: 'Déverrouiller', backSite: 'Retour au site', language: 'Langue',
    tooMany: 'Trop d’essais — réessayez dans quelques minutes.', offline: 'Serveur injoignable — vérifiez votre connexion.', badPin: 'Code incorrect.',
    offTitle: 'Cette démo est désactivée', offBody: 'Demandez à MBN DEV de la rouvrir.', offExpired: 'Cette démo a expiré',
    viewSite: 'Voir le site', demoTag: 'Démo par MBN DEV', live: 'En direct', soundOn: 'Son activé', soundOff: 'Son coupé',
    t_live: 'Aujourd’hui', t_cal: 'Calendrier', t_clients: 'Clients', t_menu: 'Prestations & étagère', t_team: 'Équipe', t_stats: 'Statistiques', t_set: 'Réglages',
    s_live: 'Les fauteuils, la file et les rendez-vous du jour — en temps réel.', s_cal: 'N’importe quel jour, n’importe quel barbier. Ajoutez des réservations et des congés.', s_clients: 'Qui vient, à quelle fréquence, et qui approche d’une coupe offerte.',
    s_menu: 'Prix, disponibilité et stock du site.', s_team: 'Horaires et chiffres du jour par barbier.', s_stats: 'Ce qui se vend, quand c’est chargé, et comment va la semaine.', s_set: 'Horaires et comportement de la réservation en ligne.',
    days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], daysFull: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'], cur: '{n} MAD', min: '{n} min', today: 'Aujourd’hui', tomorrow: 'Demain',
    k_rev: 'Chiffre du jour', k_book: 'Réservés aujourd’hui', k_chairs: 'Fauteuils occupés', k_queue: 'En attente', k_next: 'Prochain client', expected: 'sur {n} prévus', none: '—',
    chairsT: 'Fauteuils', chairFree: 'Libre', chairBusy: 'Avec un client', chairOff: 'Absent', withC: 'Avec {n} jusqu’à {t}', nextAt: 'Prochain à {t}', nothingNext: 'Plus rien aujourd’hui',
    queueT: 'File d’attente', noQueue: 'Personne n’attend. Ajoutez un client ci-dessous ou attendez le site.', joined: 'arrivé il y a {n} min', justNow: 'à l’instant', start: 'Démarrer', startOn: 'Démarrer avec…', done: 'Terminé', leave: 'Retirer', inChairNow: 'Au fauteuil',
    walkName: 'Nom', addWalk: 'Ajouter un client', pickBarber: 'Choisissez d’abord un fauteuil libre.',
    columnEmpty: 'Aucun rendez-vous.', confirm: 'Confirmer', checkin: 'Arrivé', startS: 'Démarrer', complete: 'Terminer', noshow: 'Absent', cancel: 'Annuler', decline: 'Refuser',
    st_pending: 'Nouveau', st_confirmed: 'Confirmé', st_arrived: 'Arrivé', st_inchair: 'Au fauteuil', st_done: 'Terminé', st_noshow: 'Absent', st_cancelled: 'Annulé', walkinSrc: 'Sans rdv', online: 'En ligne', manual: 'Par téléphone',
    newBooking: 'Nouvelle réservation : {n} à {t}', newQueue: 'Nouveau client dans la file',
    addBooking: 'Ajouter une réservation', addBookingT: 'Ajouter une réservation', client: 'Client', phone: 'Téléphone', services: 'Prestations', barber: 'Barbier', anyone: 'Premier disponible', date: 'Date', time: 'Heure', noSlots: 'Aucun créneau ce jour-là',
    save: 'Enregistrer', close: 'Fermer', needName: 'Entrez un nom et un téléphone.', needSvc: 'Choisissez au moins une prestation.', needSlot: 'Choisissez une heure.', booked: 'Réservation ajoutée.', slotTaken: 'Ce créneau vient d’être pris.',
    offDay: 'Congés le {d}', working: 'présent', dayOff: 'congé', offBooked: '{n} rendez-vous déjà pris — déplacez-les d’abord.',
    clientsT: 'Clients', search: 'Rechercher nom ou téléphone…', c_name: 'Client', c_visits: 'Visites', c_spent: 'Dépensé', c_stamps: 'Tampons', c_last: 'Dernière visite', c_ns: 'Absences', c_notes: 'Notes', addStamp: '+1 tampon', giftCut: 'Coupe offerte', notesPh: 'Note privée…', noClients: 'Aucun client.',
    gifts: 'Cartes cadeaux', balance: 'solde', subs: 'Demandes d’abonnement', newsletter: 'Newsletter', none2: 'Rien pour l’instant.', subsOf: 'Abonnement {p}',
    svcT: 'Prestations', s_name: 'Prestation', s_dur: 'Durée', s_price: 'Prix', s_on: 'Réservable', shelfT: 'Étagère', p_name: 'Produit', p_stock: 'Stock', resT: 'Retrait en boutique', resNone: 'Aucune réservation.', r_new: 'Nouveau', r_ready: 'Prêt', r_picked: 'Retiré', r_cancelled: 'Annulé', markReady: 'Marquer prêt', markPicked: 'Retiré',
    teamT: 'Horaires de travail', visible: 'Affiché sur le site', off: 'Congé', from: 'De', to: 'À', todayRev: 'Aujourd’hui', todayCuts: 'Coupes', rating: 'Note',
    revWeek: 'Chiffre · 7 jours', vsPrev: '{p} % vs semaine dernière', avgTicket: 'Ticket moyen', noShowRate: 'Taux d’absence', repeat: 'Clients fidèles', revDays: 'Chiffre · 14 derniers jours', topSvc: 'Prestations phares', busy: 'Heures de pointe', less: 'calme', more: 'chargé',
    hoursT: 'Horaires d’ouverture', closed: 'Fermé', open: 'Ouvert', bookingT: 'Réservation en ligne', pauseT: 'Suspendre la réservation en ligne', pauseS: 'Les visiteurs peuvent naviguer ; le bouton Réserver indique qu’il n’y a pas de créneau.', autoConfT: 'Confirmer automatiquement', autoConfS: 'Désactivé : chaque réservation attend votre confirmation.',
    queueOpenT: 'La file d’attente est ouverte', queueOpenS: 'Permet de rejoindre la file depuis le site.', bufferT: 'Pause entre les rendez-vous', bufferS: 'Minutes laissées libres après chaque coupe.',
    autoFlowT: 'Avancement automatique (démo)', autoFlowS: 'Les rendez-vous démarrent et se terminent seuls avec l’horloge, pour garder la démo vivante.',
    bannerT: 'Bandeau d’annonce', bannerS: 'Affiché en haut du site.', bannerPh: 'Laissez vide pour le message par défaut',
    dataT: 'Données de démo', exportCsv: 'Exporter les réservations (CSV)', resetD: 'Réinitialiser la démo', resetS: 'Réinitialiser toutes les données de démo ?', resetDone: 'Démo réinitialisée.', saved: 'Enregistré.',
  },
};
let lang = sessionStorage.getItem('tarz-admin-lang') || ((navigator.language || '').startsWith('fr') ? 'fr' : 'en');
const t = (k, v = {}) => String(A[lang][k] ?? A.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const loc = () => (lang === 'fr' ? 'fr-FR' : 'en-GB');
const money = (n) => t('cur', { n: (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) });
const svcById = (id) => SERVICES.find((s) => s.id === id);
const barberById = (id) => BARBERS.find((b) => b.id === id);
const L = (o) => o[lang] ?? o.en;
const names = (ids) => ids.map((id) => L(svcById(id).name)).join(' + ');
const hm = db.hhmm;
const days = () => A[lang].days;
const timeSel = (attr, minutes, disabled) => `<select class="in" data-${attr} ${disabled ? 'disabled' : ''}>${Array.from({ length: 36 }, (_, i) => 360 + i * 30).map((m) => `<option value="${hm(m)}" ${m === minutes ? 'selected' : ''}>${hm(m)}</option>`).join('')}</select>`;
const parseTime = (v) => { const [h, m] = String(v).split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const dateTxt = (date, o) => { const [y, m, d] = date.split('-').map(Number); return new Intl.DateTimeFormat(loc(), { ...o, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d))); };

let tab = sessionStorage.getItem('tarz-admin-tab') || 'live';
const TABS = [['live', 'armchair'], ['cal', 'calendar'], ['clients', 'users'], ['menu', 'clipboard'], ['team', 'scissors'], ['stats', 'chart'], ['set', 'sliders']];
let calDate = null;
let clientQ = '';
let fresh = new Set();

// ── chrome ─────────────────────────────────────────────────────────────────
let toastT;
function toast(msg, cls = '') {
  const el = $('#atoast'); el.textContent = msg; el.className = `atoast on ${cls}`;
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600);
}
let ac;
function ding() {
  if (!db.get().settings.sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    [880, 1318].forEach((f, i) => { const o = ac.createOscillator(); const g = ac.createGain(); o.frequency.value = f; o.connect(g); g.connect(ac.destination); g.gain.setValueAtTime(0.0001, ac.currentTime + i * 0.12); g.gain.exponentialRampToValueAtTime(0.18, ac.currentTime + i * 0.12 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.12 + 0.3); o.start(ac.currentTime + i * 0.12); o.stop(ac.currentTime + i * 0.12 + 0.32); });
  } catch { /* no audio */ }
}
let ddOpen = null;
let gateCfg = null;
function renderGateText() {
  const h = $('#pinHint'); if (!h) return;
  const pin = gateCfg?.ok && gateCfg.live ? gateCfg.pinHint : null;
  h.hidden = !pin; h.textContent = pin ? t('pinHintN', { pin }) : '';
  const off = gateCfg?.ok && !gateCfg.live;
  $('#gateForm').hidden = off; $('#gateOff').hidden = !off;
  if (off) { $('#offTitle').textContent = t(gateCfg.state === 'expired' ? 'offExpired' : 'offTitle'); $('#offBody').textContent = t('offBody'); }
}
function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-a]').forEach((el) => { el.textContent = t(el.dataset.a); });
  renderGateText();
  const opts = [{ id: 'en', short: 'EN', name: 'English' }, { id: 'fr', short: 'FR', name: 'Français' }];
  $('#alang').innerHTML = langDropdown({ options: opts, current: lang, open: ddOpen === 'alang', label: t('language'), cls: 'up' });
  $('#alang2').innerHTML = langDropdown({ options: opts, current: lang, open: ddOpen === 'alang2', label: t('language'), cls: 'light' });
}
function renderTabs() {
  const s = db.get(); const n = db.shopNow();
  const pending = s.bookings.filter((b) => b.status === 'pending').length;
  const waiting = s.walkins.filter((w) => w.status === 'waiting').length;
  $('#tabs').innerHTML = TABS.map(([id, ic]) => `<button data-tab="${id}" ${id === tab ? 'aria-current="page"' : ''}>${icon(ic)}${t(`t_${id}`)}${id === 'live' && (pending + waiting) ? `<span class="n">${pending + waiting}</span>` : ''}${id === 'cal' && pending ? `<span class="n">${pending}</span>` : ''}</button>`).join('');
  $('#pageTitle').textContent = t(`t_${tab}`);
  $('#pageSub').textContent = t(`s_${tab}`);
  $('#liveState').textContent = `${t('live')} · ${hm(n.minutes)}`;
  $('#soundBtn').innerHTML = `${icon(s.settings.sound ? 'bell' : 'bellOff')}<span>${t(s.settings.sound ? 'soundOn' : 'soundOff')}</span>`;
}

// ── bookings: cards and board ──────────────────────────────────────────────
const NEXT = { pending: ['confirmed', 'confirm'], confirmed: ['arrived', 'checkin'], arrived: ['inchair', 'startS'], inchair: ['done', 'complete'] };
const srcLabel = (b) => (b.source === 'manual' ? t('manual') : t('online'));
function bkCard(b, n) {
  const next = NEXT[b.status];
  const isNow = b.status === 'inchair';
  const closed = ['done', 'noshow', 'cancelled'].includes(b.status);
  const cls = `${fresh.has(b.id) ? 'fresh' : ''} ${isNow ? 'now' : ''} ${b.status === 'cancelled' ? 'cancelled' : ''} ${closed && b.status !== 'cancelled' ? 'past' : ''}`;
  const acts = closed ? '' : `<div>
    ${b.status === 'pending' ? `<button class="abtn danger sm" data-b="${b.id}" data-to="cancelled">${t('decline')}</button>` : `<button class="abtn danger sm" data-b="${b.id}" data-to="noshow" title="${t('noshow')}">${icon('ban')}</button>`}
    ${next ? `<button class="abtn ${b.status === 'inchair' ? 'ok' : 'sun'} sm" data-b="${b.id}" data-to="${next[0]}">${t(next[1])}</button>` : ''}
    ${b.status !== 'pending' ? `<button class="abtn ghost sm" data-b="${b.id}" data-to="cancelled" title="${t('cancel')}">${icon('x')}</button>` : ''}</div>`;
  return `<article class="ord ${cls}">
    <div class="ord-h"><b>${hm(b.start)}–${hm(b.start + b.dur)}</b><span class="st st-${b.status}">${t(`st_${b.status}`)}</span></div>
    <div class="who"><b>${esc(b.name)}</b> · ${esc(b.phone)}</div>
    <ul><li>${esc(names(b.services))}</li></ul>
    ${b.note ? `<div class="note">${icon('message')} ${esc(b.note)}</div>` : ''}
    <div class="ord-f"><span>${money(b.total)} <small>· ${srcLabel(b)} · ${esc(b.code)}${b.reward ? ` · ${icon('gift')}` : ''}</small></span>${acts}</div>
  </article>`;
}
function board(date) {
  const s = db.get(); const n = db.shopNow();
  const cols = BARBERS.filter((b) => db.barberActive(b.id)).map((b) => {
    const list = s.bookings.filter((x) => x.barber === b.id && x.date === date).sort((p, q) => p.start - q.start);
    const off = db.barberOff(b.id, date) || !db.barberWeek(b.id)[db.weekdayOf(date)];
    return `<div class="bcol" style="--c:${b.color}"><div class="bcol-h"><i></i><b>${esc(b.name)}</b>${off ? `<small class="pillst off">${t('chairOff')}</small>` : ''}<span>${list.filter((x) => x.status !== 'cancelled').length}</span></div>
      ${list.length ? list.map((x) => bkCard(x, n)).join('') : `<div class="empty-col">${t('columnEmpty')}</div>`}</div>`;
  }).join('');
  return `<div class="board b4">${cols}</div>`;
}

// ── views ──────────────────────────────────────────────────────────────────
function viewLive() {
  const s = db.get(); const n = db.shopNow(); const ins = db.insights();
  const day = s.bookings.filter((b) => b.date === n.date && !['cancelled', 'noshow'].includes(b.status));
  const expected = day.reduce((a, b) => a + b.total, 0);
  const ch = db.chairs(); const q = db.queueInfo();
  const nextUp = day.filter((b) => ['pending', 'confirmed'].includes(b.status) && b.start >= n.minutes).sort((a, b) => a.start - b.start)[0];
  const busy = ch.filter((c) => c.state === 'busy').length;
  const chairRows = ch.map((c) => {
    const b = barberById(c.barber);
    const sub = c.state === 'off' ? '' : c.with ? t('withC', { n: esc(c.with.name), t: hm(c.until ?? (c.with.start ? c.with.start + c.with.dur : n.minutes + 20)) }) : c.next ? t('nextAt', { t: hm(c.next) }) : t('nothingNext');
    return `<div class="chair"><span class="av" style="--c:${b.color}">${esc(b.name[0])}</span><div><b>${esc(b.name)}</b><small>${sub}</small></div><span class="pillst ${c.state}">${t(c.state === 'free' ? 'chairFree' : c.state === 'busy' ? 'chairBusy' : 'chairOff')}</span></div>`;
  }).join('');
  const freeChairs = ch.filter((c) => c.state === 'free');
  const walk = s.walkins.filter((w) => ['waiting', 'inchair'].includes(w.status));
  const agoTxt = (w) => { const m = Math.max(0, n.epoch - w.joined); return m < 1 ? t('justNow') : t('joined', { n: Math.round(m) }); };
  const qRows = walk.map((w) => `<div class="qrow ${w.status}"><span class="no">${w.status === 'inchair' ? icon('armchair') : w.no}</span>
      <div><b>${esc(w.name)}</b><small class="muted" style="display:block">${esc(names(w.services))} · ${money(w.total)}</small><small class="muted">${w.status === 'inchair' ? `${t('inChairNow')} · ${esc(barberById(w.barber)?.name || '')}` : agoTxt(w)}</small></div>
      <div class="acts">${w.status === 'waiting'
    ? `<select data-wsel="${w.id}" aria-label="${t('startOn')}">${freeChairs.length ? freeChairs.map((c) => `<option value="${c.barber}">${esc(barberById(c.barber).name)}</option>`).join('') : `<option value="">${t('pickBarber')}</option>`}</select><button class="abtn sun sm" data-wstart="${w.id}">${t('start')}</button>`
    : `<button class="abtn ok sm" data-wdone="${w.id}">${t('done')}</button>`}<button class="abtn danger sm" data-wleave="${w.id}">${t('leave')}</button></div></div>`).join('');
  return `<div class="kpis">
      <div class="kpi"><span>${t('k_rev')}</span><b>${money(ins.today.rev)}</b><small>${t('expected', { n: money(expected) })}</small></div>
      <div class="kpi"><span>${t('k_book')}</span><b>${day.length}</b></div>
      <div class="kpi"><span>${t('k_chairs')}</span><b>${busy}/${ch.filter((c) => c.state !== 'off').length}</b></div>
      <div class="kpi"><span>${t('k_queue')}</span><b>${q.waiting}</b>${q.waiting ? `<small>~${q.wait} min</small>` : ''}</div>
      <div class="kpi"><span>${t('k_next')}</span><b>${nextUp ? hm(nextUp.start) : t('none')}</b>${nextUp ? `<small>${esc(nextUp.name)}</small>` : ''}</div>
    </div>
    <div class="grid2" style="margin-bottom:16px">
      <div class="card"><h2>${t('chairsT')}</h2><div class="chairs">${chairRows}</div></div>
      <div class="card"><h2>${t('queueT')} <small>${q.waiting ? `~${q.wait} min` : ''}</small></h2>
        <div class="queue">${qRows || `<div class="empty-col">${t('noQueue')}</div>`}</div>
        <div class="addwalk"><input class="in" id="awName" placeholder="${t('walkName')}" /><select class="in" id="awSvc">${db.services().filter((x) => ['cuts', 'beard', 'combo', 'kids'].includes(x.cat)).map((x) => `<option value="${x.id}">${esc(L(x.name))}</option>`).join('')}</select><button class="abtn ghost sm" data-addwalk>${icon('userPlus')} ${t('addWalk')}</button></div></div>
    </div>
    ${board(n.date)}`;
}

function viewCal() {
  const n = db.shopNow();
  if (!calDate) calDate = n.date;
  const dates = Array.from({ length: SHOP.horizon + 1 }, (_, k) => db.addDays(n.date, k));
  const strip = dates.map((d) => {
    const count = db.get().bookings.filter((b) => b.date === d && !['cancelled', 'noshow'].includes(b.status)).length;
    return `<button class="daybtn" data-caldate="${d}" aria-pressed="${d === calDate}"><small>${dateTxt(d, { weekday: 'short' })}</small><b>${Number(d.slice(8))}</b><i>${count || '·'}</i></button>`;
  }).join('');
  const offs = BARBERS.map((b) => {
    const works = !!db.barberWeek(b.id)[db.weekdayOf(calDate)];
    const off = db.barberOff(b.id, calDate);
    return `<button class="tg ${off || !works ? 'off' : ''}" style="--c:${b.color}" data-tgoff="${b.id}" ${works ? '' : 'disabled'}><i></i>${esc(b.name)} · ${off || !works ? t('dayOff') : t('working')}</button>`;
  }).join('');
  return `<div class="daystrip" id="calStrip">${strip}</div>
    <div class="top" style="margin-bottom:12px"><h2 style="margin:0;font:600 20px var(--display);letter-spacing:.04em;text-transform:uppercase">${dateTxt(calDate, { weekday: 'long', day: 'numeric', month: 'long' })}</h2><button class="abtn sun" data-addbk>${icon('plus')} ${t('addBooking')}</button></div>
    <p class="who" style="margin:0 0 6px">${t('offDay', { d: dateTxt(calDate, { day: 'numeric', month: 'short' }) })}</p><div class="offrow">${offs}</div>
    ${board(calDate)}`;
}

function viewClients() {
  const s = db.get();
  const q = clientQ.trim().toLowerCase();
  const list = Object.values(s.clients).filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q.replace(/\D/g, '') || '§')).sort((a, b) => b.visits - a.visits);
  const rows = list.map((c) => `<tr>
    <td><b>${esc(c.name)}</b><div class="muted">${esc(c.phone)}</div></td><td class="num">${c.visits}</td><td class="num">${money(c.spent)}</td>
    <td><span class="stamps-mini">${Array.from({ length: SHOP.stampsForReward }, (_, i) => `<i class="${i < c.stamps ? 'on' : ''}"></i>`).join('')}</span> ${c.stamps >= SHOP.stampsForReward ? `<span class="chip ok">${icon('gift', '', t('giftCut'))}</span>` : ''}</td>
    <td class="num">${c.last ? dateTxt(c.last, { day: 'numeric', month: 'short' }) : '—'}</td><td class="num">${c.noShows || '—'}</td>
    <td><input class="in" data-note="${c.phone}" value="${esc(c.notes)}" placeholder="${t('notesPh')}" style="min-width:150px" /></td>
    <td class="num"><button class="abtn ghost sm" data-stamp="${c.phone}">${t('addStamp')}</button> <button class="abtn ghost sm" data-gift="${c.phone}" title="${t('giftCut')}">${icon('gift')}</button></td></tr>`).join('');
  const gifts = s.gifts.slice().reverse().map((g) => `<div><div><span class="code">${esc(g.code)}</span><br/><small>${esc(g.from || '—')} → ${esc(g.to || '—')}</small></div><b>${money(g.balance)} <small>/ ${money(g.amount)}</small></b></div>`).join('');
  const subs = s.subs.slice().reverse().map((x) => `<div><div><b>${esc(x.name)}</b><br/><small>${esc(x.phone)}</small></div><span class="chip sun">${t('subsOf', { p: esc(L(PLANS.find((p) => p.id === x.plan).name)) })}</span></div>`).join('');
  return `<div class="card" style="margin-bottom:16px"><h2>${t('clientsT')} <small>${list.length}</small></h2>
      <input class="in search" id="clientQ" placeholder="${t('search')}" value="${esc(clientQ)}" style="margin-bottom:10px" />
      <div class="tbl-wrap"><table class="t"><thead><tr><th>${t('c_name')}</th><th>${t('c_visits')}</th><th>${t('c_spent')}</th><th>${t('c_stamps')}</th><th>${t('c_last')}</th><th>${t('c_ns')}</th><th>${t('c_notes')}</th><th></th></tr></thead>
      <tbody>${rows || `<tr><td colspan="8" class="muted">${t('noClients')}</td></tr>`}</tbody></table></div></div>
    <div class="grid2"><div class="card"><h2>${t('gifts')} <small>${s.gifts.length}</small></h2><div class="list-rows">${gifts || `<small class="muted">${t('none2')}</small>`}</div></div>
      <div class="card"><h2>${t('subs')} <small>${s.subs.length}</small></h2><div class="list-rows">${subs || `<small class="muted">${t('none2')}</small>`}</div>
      <h2 style="margin-top:16px">${t('newsletter')} <small>${s.newsletter.length}</small></h2><div class="who">${s.newsletter.map(esc).join(', ') || t('none2')}</div></div></div>`;
}

function viewMenu() {
  const s = db.get();
  const svcRows = SERVICES.map((x) => `<tr><td><b>${esc(L(x.name))}</b><div class="muted">${esc(L(CATEGORIES.find((c) => c.id === x.cat).name))}</div></td><td class="num">${t('min', { n: x.dur })}</td>
    <td><input class="price-in" type="number" min="0" step="5" value="${db.svcPrice(x)}" data-svcprice="${x.id}" aria-label="${t('s_price')}" /></td>
    <td><label class="sw on"><input type="checkbox" data-svcon="${x.id}" ${db.svcActive(x.id) ? 'checked' : ''} /><span></span></label></td></tr>`).join('');
  const prodRows = PRODUCTS.map((p) => `<tr><td><b>${esc(L(p.name))}</b></td><td class="num">${money(p.price)}</td>
    <td><div class="stepper"><button data-stock="${p.id}" data-d="-1" aria-label="−">${icon('minus')}</button><output>${s.stock[p.id] ?? 0}</output><button data-stock="${p.id}" data-d="1" aria-label="+">${icon('plus')}</button></div></td></tr>`).join('');
  const RES = { new: 'markReady', ready: 'markPicked' };
  const NXT = { new: 'ready', ready: 'picked' };
  const res = s.reservations.slice().reverse().map((r) => `<div><div><b>#${r.no} · ${esc(r.name)}</b> <small>${esc(r.phone)}</small><br/><small>${r.items.map((i) => `${i.qty}× ${esc(L(PRODUCTS.find((p) => p.id === i.id).name))}`).join(', ')} · ${money(r.total)}</small></div>
    <div style="display:flex;gap:6px;align-items:center"><span class="chip ${r.status === 'picked' ? 'ok' : r.status === 'cancelled' ? '' : 'sun'}">${t(`r_${r.status}`)}</span>${RES[r.status] ? `<button class="abtn sun sm" data-res="${r.id}" data-to="${NXT[r.status]}">${t(RES[r.status])}</button>` : ''}${['new', 'ready'].includes(r.status) ? `<button class="abtn ghost sm" data-res="${r.id}" data-to="cancelled">${icon('x')}</button>` : ''}</div></div>`).join('');
  return `<div class="card" style="margin-bottom:16px"><h2>${t('svcT')}</h2><div class="tbl-wrap"><table class="t fit"><thead><tr><th>${t('s_name')}</th><th>${t('s_dur')}</th><th>${t('s_price')}</th><th>${t('s_on')}</th></tr></thead><tbody>${svcRows}</tbody></table></div></div>
    <div class="grid2"><div class="card"><h2>${t('shelfT')}</h2><div class="tbl-wrap"><table class="t fit"><thead><tr><th>${t('p_name')}</th><th></th><th>${t('p_stock')}</th></tr></thead><tbody>${prodRows}</tbody></table></div></div>
      <div class="card"><h2>${t('resT')} <small>${s.reservations.length}</small></h2><div class="list-rows">${res || `<small class="muted">${t('resNone')}</small>`}</div></div></div>`;
}

function viewTeam() {
  const s = db.get(); const n = db.shopNow();
  return `<div class="grid2">${BARBERS.map((b) => {
    const week = db.barberWeek(b.id);
    const done = s.bookings.filter((x) => x.barber === b.id && x.date === n.date && x.status === 'done');
    const rev = done.reduce((a, x) => a + x.total, 0);
    const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => { const w = week[d]; return `<div><b>${days()[d]}</b><label class="sw on"><input type="checkbox" data-wk="${b.id}:${d}:off" ${w ? 'checked' : ''} /><span></span></label>${timeSel(`wk="${b.id}:${d}:0"`, w ? w[0] : 600, !w)}${timeSel(`wk="${b.id}:${d}:1"`, w ? w[1] : 1200, !w)}</div>`; }).join('');
    return `<div class="card barb-card" style="--c:${b.color}"><header><span class="av">${esc(b.name[0])}</span><div><b>${esc(b.name)}</b><small>${esc(L(b.role))}</small></div><label class="sw on" title="${t('visible')}"><input type="checkbox" data-show="${b.id}" ${db.barberActive(b.id) ? 'checked' : ''} /><span></span></label></header>
      <div class="mini-kpis"><div><span>${t('todayRev')}</span><b>${money(rev)}</b></div><div><span>${t('todayCuts')}</span><b>${done.length}</b></div><div><span>${t('rating')}</span><b>★ ${b.rating.toFixed(1)}</b></div></div>
      <div><p class="who" style="margin:0 0 6px"><b>${t('teamT')}</b></p><div class="sched">${rows}</div></div></div>`;
  }).join('')}</div>`;
}

function viewStats() {
  const ins = db.insights();
  const last = ins.days.slice(-14); const max = Math.max(...last.map((d) => d.rev), 1);
  const bars = last.map((d, i) => `<div class="${i === last.length - 1 ? 'today' : ''}"><i style="height:${Math.max(4, Math.round((d.rev / max) * 128))}px" title="${money(d.rev)}"></i><span>${Number(d.date.slice(8))}</span></div>`).join('');
  const delta = ins.prevWeek ? Math.round(((ins.week - ins.prevWeek) / ins.prevWeek) * 100) : 0;
  const top = ins.svc.slice(0, 6); const topMax = top[0]?.[1] || 1;
  const hmax = Math.max(...ins.heat.flat(), 1);
  const order = [1, 2, 3, 4, 5, 6, 0];
  const heat = `<div class="heat"><span></span>${Array.from({ length: 12 }, (_, h) => `<span>${10 + h}</span>`).join('')}${order.map((d) => `<span>${days()[d]}</span>${ins.heat[d].map((v) => `<i style="opacity:${(0.1 + 0.9 * v / hmax).toFixed(2)}" title="${v}"></i>`).join('')}`).join('')}</div>`;
  return `<div class="kpis">
      <div class="kpi"><span>${t('revWeek')}</span><b>${money(ins.week)}</b><small class="${delta < 0 ? 'down' : ''}">${delta >= 0 ? '+' : ''}${t('vsPrev', { p: delta })}</small></div>
      <div class="kpi"><span>${t('avgTicket')}</span><b>${money(ins.avg)}</b></div>
      <div class="kpi"><span>${t('noShowRate')}</span><b>${(ins.noShowRate * 100).toFixed(1)}%</b></div>
      <div class="kpi"><span>${t('repeat')}</span><b>${Math.round(ins.rebook * 100)}%</b></div>
      <div class="kpi"><span>${t('k_rev')}</span><b>${money(ins.today.rev)}</b></div></div>
    <div class="grid2" style="margin-bottom:16px"><div class="card"><h2>${t('revDays')}</h2><div class="bars">${bars}</div></div>
      <div class="card"><h2>${t('topSvc')}</h2><div class="hbar">${top.map(([id, c]) => `<div><b>${esc(L(svcById(id).name))}</b><span>${c}</span><i style="width:${(c / topMax) * 100}%"></i></div>`).join('')}</div></div></div>
    <div class="card"><h2>${t('busy')} <small>${t('less')} → ${t('more')}</small></h2>${heat}</div>`;
}

function viewSet() {
  const s = db.get(); const st = s.settings;
  const sw = (key, on, inverse = false) => `<label class="sw ${inverse ? '' : 'on'}"><input type="checkbox" data-set="${key}" ${(inverse ? on : on) ? 'checked' : ''} /><span></span></label>`;
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = st.hours[d]; return `<div><b>${days()[d]}</b><label class="sw on"><input type="checkbox" data-hrs="${d}:off" ${h ? 'checked' : ''} /><span></span></label>${timeSel(`hrs="${d}:0"`, h ? h[0] : 600, !h)}${timeSel(`hrs="${d}:1"`, h ? h[1] : 1260, !h)}</div>`; }).join('');
  return `<div class="grid2"><div class="card"><h2>${t('hoursT')}</h2><div class="hours-grid">${rows}</div></div>
    <div class="card"><h2>${t('bookingT')}</h2>
      <div class="frow"><div><b>${t('pauseT')}</b><small>${t('pauseS')}</small></div>${sw('paused', st.paused, true)}</div>
      <div class="frow"><div><b>${t('autoConfT')}</b><small>${t('autoConfS')}</small></div>${sw('autoConfirm', st.autoConfirm)}</div>
      <div class="frow"><div><b>${t('queueOpenT')}</b><small>${t('queueOpenS')}</small></div>${sw('queueOpen', st.queueOpen)}</div>
      <div class="frow"><div><b>${t('bufferT')}</b><small>${t('bufferS')}</small></div><select class="in" data-buffer>${[0, 5, 10, 15].map((m) => `<option value="${m}" ${st.buffer === m ? 'selected' : ''}>${t('min', { n: m })}</option>`).join('')}</select></div>
      <div class="frow"><div><b>${t('autoFlowT')}</b><small>${t('autoFlowS')}</small></div>${sw('autoFlow', st.autoFlow)}</div>
      <div class="frow"><div><b>${t('bannerT')}</b><small>${t('bannerS')}</small></div>${sw('banner', st.banner)}</div>
      <input class="in wide" data-banner value="${esc(st.bannerText)}" placeholder="${t('bannerPh')}" style="margin-top:8px" />
      <h2 style="margin-top:18px">${t('dataT')}</h2><div class="frow" style="border:0"><button class="abtn ghost" data-export>${icon('download')} ${t('exportCsv')}</button><button class="abtn danger" data-reset>${icon('refresh')} ${t('resetD')}</button></div></div></div>`;
}

const VIEWS = { live: viewLive, cal: viewCal, clients: viewClients, menu: viewMenu, team: viewTeam, stats: viewStats, set: viewSet };
function render() { applyStatic(); renderTabs(); $('#view').innerHTML = VIEWS[tab](); }

// ── add booking modal ──────────────────────────────────────────────────────
let nb = null;
function openAddBooking() {
  nb = { name: '', phone: '', services: [], barber: 'any', date: calDate || db.shopNow().date, start: null };
  renderAddBooking(); $('#amodal').hidden = false;
}
function renderAddBooking() {
  const dur = db.dur(nb.services) || 30;
  const slots = db.slotsFor(nb.date, nb.barber, dur);
  if (nb.start != null && !slots.some((x) => x.start === nb.start)) nb.start = null;
  const n = db.shopNow();
  const dates = Array.from({ length: SHOP.horizon + 1 }, (_, k) => db.addDays(n.date, k));
  $('#amodal').innerHTML = `<div class="box"><h2>${t('addBookingT')}<button class="xb" data-closemodal aria-label="${t('close')}">${icon('x')}</button></h2>
    <div class="two"><label>${t('client')}<input class="in" data-nb="name" value="${esc(nb.name)}" /></label><label>${t('phone')}<input class="in" data-nb="phone" value="${esc(nb.phone)}" inputmode="tel" /></label></div>
    <label>${t('services')}<div class="pickrow">${db.services().map((x) => `<button class="pk" data-nbsvc="${x.id}" aria-pressed="${nb.services.includes(x.id)}">${esc(L(x.name))}</button>`).join('')}</div></label>
    <div class="two"><label>${t('barber')}<select class="in" data-nb="barber"><option value="any" ${nb.barber === 'any' ? 'selected' : ''}>${t('anyone')}</option>${BARBERS.map((b) => `<option value="${b.id}" ${nb.barber === b.id ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></label>
    <label>${t('date')}<select class="in" data-nb="date">${dates.map((d) => `<option value="${d}" ${nb.date === d ? 'selected' : ''}>${dateTxt(d, { weekday: 'short', day: 'numeric', month: 'short' })}</option>`).join('')}</select></label></div>
    <label>${t('time')}${slots.length ? `<div class="pickrow">${slots.map((x) => `<button class="pk" data-nbslot="${x.start}" aria-pressed="${nb.start === x.start}">${hm(x.start)}</button>`).join('')}</div>` : `<small class="muted">${t('noSlots')}</small>`}</label>
    <p class="err" id="nbErr" role="alert"></p><div class="foot"><button class="abtn ghost" data-closemodal>${t('cancel')}</button><button class="abtn sun" data-nbsave>${t('save')}</button></div></div>`;
}
function saveNb() {
  const err = $('#nbErr');
  if (nb.name.trim().length < 2 || db.digits(nb.phone).length < 9) { err.textContent = t('needName'); return; }
  if (!nb.services.length) { err.textContent = t('needSvc'); return; }
  if (nb.start == null) { err.textContent = t('needSlot'); return; }
  const r = db.book({ date: nb.date, start: nb.start, barber: nb.barber, services: nb.services, name: nb.name.trim(), phone: nb.phone, source: 'manual' });
  if (r.error) { err.textContent = t('slotTaken'); return; }
  $('#amodal').hidden = true; toast(t('booked')); render();
}

// ── CSV ────────────────────────────────────────────────────────────────────
function exportCsv() {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['code', 'date', 'start', 'end', 'barber', 'client', 'phone', 'services', 'total', 'status', 'source'].join(',')]
    .concat(db.get().bookings.slice().sort((a, b) => db.epochOf(a.date, a.start) - db.epochOf(b.date, b.start)).map((b) => [b.code, b.date, hm(b.start), hm(b.start + b.dur), barberById(b.barber).name, b.name, b.phone, names(b.services), b.total, b.status, b.source].map(q).join(',')));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' })); a.download = 'tarz-bookings.csv';
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ── events ─────────────────────────────────────────────────────────────────
function wire() {
  document.addEventListener('click', (e) => {
    const g = (sel) => e.target.closest(sel);
    let x;
    if ((x = g('[data-ddtoggle]'))) {
      const host = x.closest('.dd').parentElement.id;
      ddOpen = ddOpen === host ? null : host;
      document.querySelectorAll('.dd').forEach((d) => { const on = d.parentElement.id === ddOpen; d.classList.toggle('open', on); d.querySelector('[data-ddtoggle]').setAttribute('aria-expanded', String(on)); });
      return;
    }
    if (ddOpen && !g('.dd')) { ddOpen = null; document.querySelectorAll('.dd.open').forEach((d) => { d.classList.remove('open'); d.querySelector('[data-ddtoggle]').setAttribute('aria-expanded', 'false'); }); }
    if ((x = g('[data-lang]'))) { ddOpen = null; lang = x.dataset.lang; sessionStorage.setItem('tarz-admin-lang', lang); render(); return; }
    if ((x = g('[data-tab]'))) { tab = x.dataset.tab; sessionStorage.setItem('tarz-admin-tab', tab); render(); window.scrollTo(0, 0); return; }
    if ((x = g('[data-b]'))) { const to = x.dataset.to; fresh.delete(x.dataset.b); db.setStatus(x.dataset.b, to); render(); return; }
    if ((x = g('[data-wstart]'))) {
      const sel = $(`[data-wsel="${x.dataset.wstart}"]`);
      if (!sel || !sel.value) { toast(t('pickBarber')); return; }
      db.setWalkin(x.dataset.wstart, 'inchair', sel.value); render(); return;
    }
    if ((x = g('[data-wdone]'))) { db.setWalkin(x.dataset.wdone, 'done'); render(); return; }
    if ((x = g('[data-wleave]'))) { db.setWalkin(x.dataset.wleave, 'left'); render(); return; }
    if (g('[data-addwalk]')) {
      const name = $('#awName').value.trim() || t('walkinSrc');
      db.joinQueue({ name, phone: '', services: [$('#awSvc').value], owner: true }); render(); return;
    }
    if ((x = g('[data-caldate]'))) { calDate = x.dataset.caldate; const keep = $('#calStrip')?.scrollLeft; render(); if (keep) $('#calStrip').scrollLeft = keep; return; }
    if ((x = g('[data-tgoff]'))) {
      const id = x.dataset.tgoff; const off = db.barberOff(id, calDate);
      if (!off) {
        const booked = db.get().bookings.filter((b) => b.barber === id && b.date === calDate && ['pending', 'confirmed', 'arrived', 'inchair'].includes(b.status)).length;
        if (booked) { toast(t('offBooked', { n: booked })); return; }
      }
      db.update((s) => { s.barbers[id] = s.barbers[id] || {}; s.barbers[id].off = { ...(s.barbers[id].off || {}), [calDate]: !off }; }); render(); return;
    }
    if (g('[data-addbk]')) { openAddBooking(); return; }
    if (g('[data-closemodal]')) { $('#amodal').hidden = true; return; }
    if ((x = g('[data-nbsvc]'))) { const id = x.dataset.nbsvc; nb.services = nb.services.includes(id) ? nb.services.filter((i) => i !== id) : [...nb.services, id]; renderAddBooking(); return; }
    if ((x = g('[data-nbslot]'))) { nb.start = Number(x.dataset.nbslot); renderAddBooking(); return; }
    if (g('[data-nbsave]')) { saveNb(); return; }
    if ((x = g('[data-stamp]'))) { db.update((s) => { s.clients[x.dataset.stamp].stamps += 1; }); render(); return; }
    if ((x = g('[data-gift]'))) { db.update((s) => { const c = s.clients[x.dataset.gift]; c.stamps = Math.max(c.stamps, SHOP.stampsForReward); }); render(); return; }
    if ((x = g('[data-stock]'))) { db.update((s) => { s.stock[x.dataset.stock] = Math.max(0, (s.stock[x.dataset.stock] ?? 0) + Number(x.dataset.d)); }); render(); return; }
    if ((x = g('[data-res]'))) { db.update((s) => { s.reservations.find((r) => r.id === x.dataset.res).status = x.dataset.to; }); render(); return; }
    if (g('[data-export]')) { exportCsv(); return; }
    if (g('[data-reset]')) { if (confirm(t('resetS'))) { db.resetDemo(); fresh = new Set(); calDate = null; render(); toast(t('resetDone')); } return; }
    if (g('#soundBtn')) { db.update((s) => { s.settings.sound = !s.settings.sound; }); renderTabs(); if (db.get().settings.sound) ding(); }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'clientQ') { clientQ = e.target.value; const pos = e.target.selectionStart; $('#view').innerHTML = viewClients(); const el = $('#clientQ'); el.focus(); el.setSelectionRange(pos, pos); return; }
    const d = e.target.dataset;
    if (d.nb && nb) { nb[d.nb] = e.target.value; if (['barber', 'date'].includes(d.nb)) { nb.start = null; renderAddBooking(); } }
  });
  document.addEventListener('change', (e) => {
    const el = e.target; const d = el.dataset;
    if (d.svcprice) { const v = Math.max(0, Number(el.value) || 0); db.update((s) => { s.svc[d.svcprice] = { ...(s.svc[d.svcprice] || {}), price: v }; }); toast(t('saved')); return; }
    if (d.svcon) { db.update((s) => { s.svc[d.svcon] = { ...(s.svc[d.svcon] || {}), active: el.checked }; }); render(); return; }
    if (d.note) { db.update((s) => { s.clients[d.note].notes = el.value; }); toast(t('saved')); return; }
    if (d.show) { db.update((s) => { s.barbers[d.show] = { ...(s.barbers[d.show] || {}), hidden: !el.checked }; }); render(); return; }
    if (d.wk) {
      const [id, day, part] = d.wk.split(':');
      db.update((s) => {
        const cur = s.barbers[id] || (s.barbers[id] = {});
        cur.week = cur.week || JSON.parse(JSON.stringify(db.barberWeek(id)));
        if (part === 'off') cur.week[day] = el.checked ? [600, 1200] : null;
        else { const w = cur.week[day] || [600, 1200]; w[Number(part)] = parseTime(el.value); cur.week[day] = w; }
      });
      render(); return;
    }
    if (d.hrs) {
      const [day, part] = d.hrs.split(':');
      db.update((s) => {
        if (part === 'off') s.settings.hours[day] = el.checked ? [600, 1260] : null;
        else { const h = s.settings.hours[day] || [600, 1260]; h[Number(part)] = parseTime(el.value); s.settings.hours[day] = h; }
      });
      render(); return;
    }
    if (d.set) { db.update((s) => { s.settings[d.set] = el.checked; }); render(); return; }
    if (d.buffer !== undefined) { db.update((s) => { s.settings.buffer = Number(el.value); }); toast(t('saved')); return; }
    if (d.banner !== undefined) { db.update((s) => { s.settings.bannerText = el.value.trim(); }); toast(t('saved')); }
  });

  // live updates from the website (another tab) and the demo auto-flow
  let known = new Set(db.get().bookings.map((b) => b.id)); let knownW = db.get().walkins.length;
  db.subscribe((s, src) => {
    if (src === 'remote') {
      s.bookings.filter((b) => !known.has(b.id)).forEach((b) => { fresh.add(b.id); ding(); toast(t('newBooking', { n: b.name, t: hm(b.start) }), 'sun'); });
      if (s.walkins.length > knownW) { toast(t('newQueue'), 'sun'); ding(); }
    }
    known = new Set(s.bookings.map((b) => b.id)); knownW = s.walkins.length;
    const active = document.activeElement;
    if (active && active.matches('input, select, textarea') && $('#view').contains(active)) { renderTabs(); return; } // don't clobber a field being edited
    if (!$('#amodal').hidden) { renderTabs(); return; }
    render();
  });
  setInterval(() => { db.tick(); if (!$('#amodal').hidden) return; const a = document.activeElement; if (!(a && a.matches('input, select, textarea') && $('#view').contains(a))) render(); }, 5000);
}

// ── gate ───────────────────────────────────────────────────────────────────
// Whether the demo is open and which PIN hint to show come from the MBN DEV dashboard.
function unlock() { $('#gate').hidden = true; $('#app').hidden = false; render(); }
applyStatic();
wire();
fetchConfig().then((cfg) => {
  gateCfg = cfg; renderGateText();
  if (cfg.ok && !cfg.live) { sessionStorage.removeItem('tarz-admin'); return; }
  if (cfg.ok && sessionStorage.getItem('tarz-admin') === '1') unlock();
  else if (!cfg.ok) $('#pinErr').textContent = t('offline');
});
$('#gateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#gateForm button[type="submit"]'); const err = $('#pinErr');
  btn.disabled = true; err.textContent = '';
  const res = await verifyPin($('#pin').value.trim());
  btn.disabled = false;
  if (res === 'ok') { sessionStorage.setItem('tarz-admin', '1'); unlock(); return; }
  if (res === 'unavailable') { gateCfg = { ok: true, live: false, state: 'disabled' }; renderGateText(); return; }
  err.textContent = t(res === 'bad' ? 'badPin' : res === 'limited' ? 'tooMany' : 'offline');
  const f = $('#gateForm'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); $('#pin').select();
});
$('#pin').focus();
