// Bennani & Associés owner dashboard (demo). Reads and writes the same localStorage document as the site,
// so appointments, callback requests and client uploads made on the website appear here live (and back).
import { SHOP, AREAS, MEETINGS, MODES, TEAM, PLANS, STAGES, COURTS } from './data.js';
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
    t_live: 'Today', t_cal: 'Calendar', t_cases: 'Cases', t_clients: 'Clients', t_req: 'Requests', t_bill: 'Billing', t_team: 'Lawyers', t_stats: 'Insights', t_set: 'Settings',
    s_live: 'Appointments and hearings of the day, and where every lawyer is right now.', s_cal: 'Any day, any lawyer. Add appointments and set days off.', s_cases: 'Every file: stage, hearings, documents, notes and fees.',
    s_clients: 'Who consults, how often, and the history behind each client.', s_req: 'Callback requests and retainer enquiries from the website.', s_bill: 'Invoices, payments and what is still outstanding.',
    s_team: 'Practice areas, working hours and today’s numbers per lawyer.', s_stats: 'Revenue, practice areas and the busiest hours.', s_set: 'Opening hours, consultation fees and how online booking behaves.',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], cur: '{n} MAD', min: '{n} min', none: '—', free: 'Free',
    k_rev: 'Revenue today', k_appt: 'Appointments today', k_hear: 'Hearings today', k_req: 'New requests', k_out: 'Outstanding fees', k_open: 'Open cases', expected: 'of {n} expected',
    floorT: 'The firm right now', stFree: 'Available', stBusy: 'In a meeting', stCourt: 'In court', stOff: 'Off', withC: 'With {n} until {t}', inHearing: 'Hearing at {t}', nextAt: 'Next at {t}', nothingNext: 'Nothing else today',
    columnEmpty: 'Nothing scheduled.', confirm: 'Confirm', checkin: 'Arrived', startS: 'Start', complete: 'Complete', noshow: 'No-show', cancel: 'Cancel', decline: 'Decline',
    st_pending: 'To confirm', st_confirmed: 'Confirmed', st_arrived: 'Arrived', st_inprogress: 'In progress', st_done: 'Completed', st_noshow: 'No-show', st_cancelled: 'Cancelled',
    hearingWord: 'Hearing', online: 'Online', manual: 'By phone', newBooking: 'New appointment: {n} at {t}', newReq: 'New request: {n}', newDoc: '{n} uploaded a document',
    addBooking: 'Add appointment', addBookingT: 'Add an appointment', client: 'Client', phone: 'Phone', area: 'Practice area', meeting: 'Meeting', mode: 'Format', lawyer: 'Lawyer', anyone: 'First available', date: 'Date', time: 'Time',
    noSlots: 'No free time on that day', pickAreaFirst: 'Pick a practice area and a meeting first.',
    save: 'Save', close: 'Close', needName: 'Enter a name and a phone number.', needArea: 'Pick a practice area and a meeting.', needSlot: 'Pick a time.', booked: 'Appointment added.', slotTaken: 'That slot was just taken.',
    offDay: 'Days off on {d}', working: 'working', dayOff: 'off', offBooked: '{n} appointment(s) already booked — move them first.',
    casesT: 'Cases', search: 'Search file, client, phone…', allLawyers: 'All lawyers', fOpen: 'Open', fClosed: 'Closed', fAll: 'All', newCase: 'Open a case', noCases: 'No case matches.',
    c_file: 'File', c_client: 'Client', c_area: 'Area', c_lawyer: 'Lawyer', c_stage: 'Stage', c_hearing: 'Next hearing', c_due: 'Due', c_matter: 'Matter',
    newCaseT: 'Open a new case', matterTitle: 'Matter title', needCase: 'Enter the client, phone and a title.', caseOpened: 'Case {r} opened.',
    caseT: 'Case {r}', stageT: 'Stage', hearingT: 'Hearing', noHearing: 'No hearing', court: 'Court', hearingSaved: 'Hearing saved.', clearHearing: 'Clear',
    updateT: 'Message to the client', updatePh: 'Write a short update the client will see on “Track my case”…', sendUpdate: 'Send update', updateSent: 'Update sent to the client.',
    notesT: 'Internal notes', notePh: 'Private note (never shown to the client)…', addNote: 'Add note', docsT: 'Documents', docPh: 'Document name, e.g. Court summons.pdf', addDoc: 'Add document', byClient: 'client', byFirm: 'firm', newTag: 'NEW',
    feesT: 'Fees', issueInvoice: 'Issue invoice', invDescPh: 'Description (e.g. Fees — stage 2)', invAmount: 'Amount (MAD)', needInv: 'Enter an amount and a description.', invoiceIssued: 'Invoice issued.', noInvoice: 'No invoice yet.',
    clientsT: 'Clients', c_name: 'Client', c_visits: 'Consultations', c_spent: 'Billed', c_matters: 'Files', c_last: 'Last seen', c_ns: 'No-shows', c_notes: 'Notes', notesPh: 'Private note…', noClients: 'No client matches.',
    reqT: 'Requests', noReq: 'No requests yet. They arrive here when someone asks for a callback or a retainer on the website.', r_new: 'New', r_contacted: 'Contacted', r_booked: 'Booked', r_declined: 'Declined',
    callback: 'Callback', planReq: 'Retainer: {p}', received: 'received {t}', whatsapp: 'WhatsApp', callWord: 'Call', markContacted: 'Mark contacted', markBooked: 'Mark done', declineReq: 'Decline',
    billT: 'Invoices', i_no: 'Invoice', i_client: 'Client', i_file: 'File', i_date: 'Date', i_amount: 'Amount', i_status: 'Status', due: 'Due', paid: 'Paid', markPaid: 'Mark paid', remind: 'Remind', reminded: 'Reminder sent by SMS (demo).',
    k_paidMonth: 'Collected (28 days)', k_invoices: 'Invoices due', noInv: 'Nothing to show.',
    teamT: 'Working hours', visible: 'Shown on the website', skillsT: 'Practises', todayRev: 'Today', todayN: 'Meetings', rating: 'Rating',
    revWeek: 'Revenue · 7 days', vsPrev: '{p}% vs last week', avgTicket: 'Average consultation', noShowRate: 'No-show rate', repeat: 'Returning clients', revDays: 'Revenue · last 14 days', topAreas: 'Practice areas', busy: 'Busiest hours', less: 'quiet', more: 'busy',
    hoursT: 'Opening hours', feesSetT: 'Consultation fees', bookingT: 'Online booking', pauseT: 'Pause online booking', pauseS: 'Visitors can still browse; booking explains there are no slots.', autoConfT: 'Confirm appointments automatically', autoConfS: 'Off: every appointment waits for you to confirm it.',
    bufferT: 'Buffer between appointments', bufferS: 'Extra minutes kept free after each meeting.',
    autoFlowT: 'Auto-advance appointments (demo)', autoFlowS: 'Appointments start and finish by themselves as the clock moves, so the demo stays alive.',
    bannerT: 'Announcement banner', bannerS: 'Shown at the top of the website.', bannerPh: 'Leave empty for the default message',
    dataT: 'Demo data', exportCsv: 'Export appointments (CSV)', resetD: 'Reset demo data', resetS: 'Reset all demo data?', resetDone: 'Demo data reset.', saved: 'Saved.', lawyersWord: 'lawyers',
  },
  fr: {
    owner: 'Espace gérant', pinLabel: 'Entrez votre code', pinHintN: 'Code démo : {pin}', unlock: 'Déverrouiller', backSite: 'Retour au site', language: 'Langue',
    tooMany: 'Trop d’essais — réessayez dans quelques minutes.', offline: 'Serveur injoignable — vérifiez votre connexion.', badPin: 'Code incorrect.',
    offTitle: 'Cette démo est désactivée', offBody: 'Demandez à MBN DEV de la rouvrir.', offExpired: 'Cette démo a expiré',
    viewSite: 'Voir le site', demoTag: 'Démo par MBN DEV', live: 'En direct', soundOn: 'Son activé', soundOff: 'Son coupé',
    t_live: 'Aujourd’hui', t_cal: 'Calendrier', t_cases: 'Dossiers', t_clients: 'Clients', t_req: 'Demandes', t_bill: 'Facturation', t_team: 'Avocats', t_stats: 'Statistiques', t_set: 'Réglages',
    s_live: 'Rendez-vous et audiences du jour, et où se trouve chaque avocat en ce moment.', s_cal: 'N’importe quel jour, n’importe quel avocat. Ajoutez des rendez-vous et des congés.', s_cases: 'Chaque dossier : étape, audiences, documents, notes et honoraires.',
    s_clients: 'Qui consulte, à quelle fréquence, et l’historique de chaque client.', s_req: 'Demandes de rappel et d’abonnement venues du site.', s_bill: 'Factures, paiements et ce qui reste dû.',
    s_team: 'Domaines, horaires et chiffres du jour par avocat.', s_stats: 'Chiffre d’affaires, domaines et heures de pointe.', s_set: 'Horaires, tarifs des consultations et comportement de la réservation en ligne.',
    days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], cur: '{n} MAD', min: '{n} min', none: '—', free: 'Gratuit',
    k_rev: 'Chiffre du jour', k_appt: 'Rendez-vous du jour', k_hear: 'Audiences du jour', k_req: 'Nouvelles demandes', k_out: 'Honoraires dus', k_open: 'Dossiers ouverts', expected: 'sur {n} prévus',
    floorT: 'Le cabinet en ce moment', stFree: 'Disponible', stBusy: 'En rendez-vous', stCourt: 'Au tribunal', stOff: 'Absent', withC: 'Avec {n} jusqu’à {t}', inHearing: 'Audience à {t}', nextAt: 'Prochain à {t}', nothingNext: 'Plus rien aujourd’hui',
    columnEmpty: 'Rien de prévu.', confirm: 'Confirmer', checkin: 'Arrivé', startS: 'Démarrer', complete: 'Terminer', noshow: 'Absent', cancel: 'Annuler', decline: 'Refuser',
    st_pending: 'À confirmer', st_confirmed: 'Confirmé', st_arrived: 'Arrivé', st_inprogress: 'En cours', st_done: 'Terminé', st_noshow: 'Absent', st_cancelled: 'Annulé',
    hearingWord: 'Audience', online: 'En ligne', manual: 'Par téléphone', newBooking: 'Nouveau rendez-vous : {n} à {t}', newReq: 'Nouvelle demande : {n}', newDoc: '{n} a déposé un document',
    addBooking: 'Ajouter un rendez-vous', addBookingT: 'Ajouter un rendez-vous', client: 'Client', phone: 'Téléphone', area: 'Domaine', meeting: 'Rendez-vous', mode: 'Format', lawyer: 'Avocat', anyone: 'Premier disponible', date: 'Date', time: 'Heure',
    noSlots: 'Aucun créneau ce jour-là', pickAreaFirst: 'Choisissez d’abord un domaine et un type de rendez-vous.',
    save: 'Enregistrer', close: 'Fermer', needName: 'Entrez un nom et un téléphone.', needArea: 'Choisissez un domaine et un rendez-vous.', needSlot: 'Choisissez une heure.', booked: 'Rendez-vous ajouté.', slotTaken: 'Ce créneau vient d’être pris.',
    offDay: 'Congés le {d}', working: 'présent', dayOff: 'congé', offBooked: '{n} rendez-vous déjà pris — déplacez-les d’abord.',
    casesT: 'Dossiers', search: 'Rechercher dossier, client, téléphone…', allLawyers: 'Tous les avocats', fOpen: 'Ouverts', fClosed: 'Clôturés', fAll: 'Tous', newCase: 'Ouvrir un dossier', noCases: 'Aucun dossier.',
    c_file: 'Dossier', c_client: 'Client', c_area: 'Domaine', c_lawyer: 'Avocat', c_stage: 'Étape', c_hearing: 'Prochaine audience', c_due: 'Dû', c_matter: 'Affaire',
    newCaseT: 'Ouvrir un nouveau dossier', matterTitle: 'Intitulé de l’affaire', needCase: 'Entrez le client, le téléphone et un intitulé.', caseOpened: 'Dossier {r} ouvert.',
    caseT: 'Dossier {r}', stageT: 'Étape', hearingT: 'Audience', noHearing: 'Aucune audience', court: 'Juridiction', hearingSaved: 'Audience enregistrée.', clearHearing: 'Effacer',
    updateT: 'Message au client', updatePh: 'Rédigez un court point que le client verra dans « Suivre mon dossier »…', sendUpdate: 'Envoyer', updateSent: 'Point envoyé au client.',
    notesT: 'Notes internes', notePh: 'Note privée (jamais montrée au client)…', addNote: 'Ajouter', docsT: 'Documents', docPh: 'Nom du document, ex. Convocation.pdf', addDoc: 'Ajouter', byClient: 'client', byFirm: 'cabinet', newTag: 'NOUVEAU',
    feesT: 'Honoraires', issueInvoice: 'Émettre une facture', invDescPh: 'Description (ex. Honoraires — étape 2)', invAmount: 'Montant (MAD)', needInv: 'Entrez un montant et une description.', invoiceIssued: 'Facture émise.', noInvoice: 'Aucune facture.',
    clientsT: 'Clients', c_name: 'Client', c_visits: 'Consultations', c_spent: 'Facturé', c_matters: 'Dossiers', c_last: 'Dernière visite', c_ns: 'Absences', c_notes: 'Notes', notesPh: 'Note privée…', noClients: 'Aucun client.',
    reqT: 'Demandes', noReq: 'Aucune demande. Elles arrivent ici quand quelqu’un demande un rappel ou un abonnement sur le site.', r_new: 'Nouveau', r_contacted: 'Contacté', r_booked: 'Traité', r_declined: 'Refusé',
    callback: 'Rappel', planReq: 'Abonnement : {p}', received: 'reçue {t}', whatsapp: 'WhatsApp', callWord: 'Appeler', markContacted: 'Marquer contacté', markBooked: 'Marquer traité', declineReq: 'Refuser',
    billT: 'Factures', i_no: 'Facture', i_client: 'Client', i_file: 'Dossier', i_date: 'Date', i_amount: 'Montant', i_status: 'Statut', due: 'À payer', paid: 'Payée', markPaid: 'Marquer payée', remind: 'Relancer', reminded: 'Relance envoyée par SMS (démo).',
    k_paidMonth: 'Encaissé (28 jours)', k_invoices: 'Factures à payer', noInv: 'Rien à afficher.',
    teamT: 'Horaires de travail', visible: 'Affiché sur le site', skillsT: 'Pratique', todayRev: 'Aujourd’hui', todayN: 'Rendez-vous', rating: 'Note',
    revWeek: 'Chiffre · 7 jours', vsPrev: '{p} % vs semaine dernière', avgTicket: 'Consultation moyenne', noShowRate: 'Taux d’absence', repeat: 'Clients fidèles', revDays: 'Chiffre · 14 derniers jours', topAreas: 'Domaines', busy: 'Heures de pointe', less: 'calme', more: 'chargé',
    hoursT: 'Horaires d’ouverture', feesSetT: 'Tarifs des consultations', bookingT: 'Réservation en ligne', pauseT: 'Suspendre la réservation en ligne', pauseS: 'Les visiteurs peuvent naviguer ; la réservation indique qu’il n’y a pas de créneau.', autoConfT: 'Confirmer automatiquement', autoConfS: 'Désactivé : chaque rendez-vous attend votre confirmation.',
    bufferT: 'Pause entre les rendez-vous', bufferS: 'Minutes laissées libres après chaque rendez-vous.',
    autoFlowT: 'Avancement automatique (démo)', autoFlowS: 'Les rendez-vous démarrent et se terminent seuls avec l’horloge, pour garder la démo vivante.',
    bannerT: 'Bandeau d’annonce', bannerS: 'Affiché en haut du site.', bannerPh: 'Laissez vide pour le message par défaut',
    dataT: 'Données de démo', exportCsv: 'Exporter les rendez-vous (CSV)', resetD: 'Réinitialiser la démo', resetS: 'Réinitialiser toutes les données de démo ?', resetDone: 'Démo réinitialisée.', saved: 'Enregistré.', lawyersWord: 'avocats',
  },
};
let lang = sessionStorage.getItem('law-admin-lang') || ((navigator.language || '').startsWith('fr') ? 'fr' : 'en');
const t = (k, v = {}) => String(A[lang][k] ?? A.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
const loc = () => (lang === 'fr' ? 'fr-FR' : 'en-GB');
const money = (n) => t('cur', { n: (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) });
const memberById = (id) => TEAM.find((m) => m.id === id);
const areaById = (id) => AREAS.find((a) => a.id === id);
const meetingById = (id) => MEETINGS.find((m) => m.id === id);
const modeById = (id) => MODES.find((m) => m.id === id);
const L = (o) => (o ? o[lang] ?? o.en : '');
const hm = db.hhmm;
const days = () => A[lang].days;
const HOURS = Array.from({ length: 23 }, (_, i) => 360 + i * 30);
const timeSel = (attr, minutes, disabled) => `<select class="in" data-${attr} ${disabled ? 'disabled' : ''}>${HOURS.map((m) => `<option value="${hm(m)}" ${m === minutes ? 'selected' : ''}>${hm(m)}</option>`).join('')}</select>`;
const dateTxt = (date, o) => { const [y, m, d] = date.split('-').map(Number); return new Intl.DateTimeFormat(loc(), { ...o, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d))); };

let tab = sessionStorage.getItem('law-admin-tab') || 'live';
const TABS = [['live', 'landmark'], ['cal', 'calendar'], ['cases', 'folder'], ['clients', 'users'], ['req', 'phone'], ['bill', 'receipt'], ['team', 'scale'], ['stats', 'chart'], ['set', 'sliders']];
let calDate = null; let clientQ = ''; let caseQ = ''; let caseFilter = 'open'; let caseLawyer = 'all'; let billFilter = 'due';
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
let ddOpen = null; let gateCfg = null;
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
  const newReq = s.requests.filter((r) => r.status === 'new').length;
  const newDocs = s.cases.reduce((a, c) => a + c.docs.filter((d) => d.isNew).length, 0);
  const dueInv = s.invoices.filter((i) => i.status === 'due').length;
  const badge = { live: pending, cal: pending, cases: newDocs, req: newReq, bill: dueInv };
  $('#tabs').innerHTML = TABS.map(([id, ic]) => `<button data-tab="${id}" ${id === tab ? 'aria-current="page"' : ''}>${icon(ic)}${t(`t_${id}`)}${badge[id] ? `<span class="n">${badge[id]}</span>` : ''}</button>`).join('');
  $('#pageTitle').textContent = t(`t_${tab}`);
  $('#pageSub').textContent = t(`s_${tab}`);
  $('#liveState').textContent = `${t('live')} · ${hm(n.minutes)}`;
  $('#soundBtn').innerHTML = `${icon(s.settings.sound ? 'bell' : 'bellOff')}<span>${t(s.settings.sound ? 'soundOn' : 'soundOff')}</span>`;
}

// ── appointments and hearings: cards and board ─────────────────────────────
const NEXT = { pending: ['confirmed', 'confirm'], confirmed: ['arrived', 'checkin'], arrived: ['inprogress', 'startS'], inprogress: ['done', 'complete'] };
const srcLabel = (b) => (b.source === 'manual' ? t('manual') : t('online'));
function bkCard(b) {
  const next = NEXT[b.status];
  const closed = ['done', 'noshow', 'cancelled'].includes(b.status);
  const cls = `${fresh.has(b.id) ? 'fresh' : ''} ${b.status === 'inprogress' ? 'now' : ''} ${b.status === 'cancelled' ? 'cancelled' : ''} ${closed && b.status !== 'cancelled' ? 'past' : ''}`;
  const acts = closed ? '' : `<div>
    ${b.status === 'pending' ? `<button class="abtn danger sm" data-b="${b.id}" data-to="cancelled">${t('decline')}</button>` : `<button class="abtn danger sm" data-b="${b.id}" data-to="noshow" title="${t('noshow')}" aria-label="${t('noshow')}">${icon('ban')}</button>`}
    ${next ? `<button class="abtn ${b.status === 'inprogress' ? 'ok' : 'pri'} sm" data-b="${b.id}" data-to="${next[0]}">${t(next[1])}</button>` : ''}
    ${b.status !== 'pending' ? `<button class="abtn ghost sm" data-b="${b.id}" data-to="cancelled" title="${t('cancel')}" aria-label="${t('cancel')}">${icon('x')}</button>` : ''}</div>`;
  return `<article class="ord ${cls}">
    <div class="ord-h"><b>${hm(b.start)}–${hm(b.start + b.dur)}</b><span class="st st-${b.status}">${t(`st_${b.status}`)}</span></div>
    <div class="who"><b>${esc(b.name)}</b> · <bdi dir="ltr">${esc(b.phone)}</bdi></div>
    <div class="tagrow"><span>${icon('scale')} ${esc(L(areaById(b.area).name))}</span><span>${icon(modeById(b.mode).icon)} ${esc(L(modeById(b.mode).name))}</span></div>
    <ul><li>${esc(L(meetingById(b.meeting).name))}</li></ul>
    ${b.note ? `<div class="note">${icon('message')} ${esc(b.note)}</div>` : ''}
    <div class="ord-f"><span>${b.total ? money(b.total) : t('free')} <small>· ${srcLabel(b)} · ${esc(b.code)}</small></span>${acts}</div>
  </article>`;
}
function hearingCard(c) {
  const a = areaById(c.area);
  return `<article class="ord hearing"><div class="ord-h"><b>${c.hearing.time}</b><span class="st st-inprogress">${t('hearingWord')}</span></div>
    <div class="who"><b>${esc(c.name)}</b> · ${esc(c.ref)}</div><ul><li>${esc(L(c.title))}</li></ul>
    <div class="tagrow"><span>${icon('landmark')} ${esc(L(COURTS[c.hearing.court] || COURTS.tpi))}</span><span>${icon('scale')} ${esc(L(a.name))}</span></div>
    <div class="ord-f"><span><button class="abtn ghost sm" data-case="${c.id}">${icon('folder')} ${esc(c.ref)}</button></span></div></article>`;
}
function board(date) {
  const s = db.get();
  const cols = TEAM.filter((m) => db.memberActive(m.id)).map((m) => {
    const list = s.bookings.filter((x) => x.member === m.id && x.date === date).sort((p, q) => p.start - q.start);
    const hears = s.cases.filter((c) => !c.closed && c.lawyer === m.id && c.hearing && c.hearing.date === date);
    const items = [...list.map((x) => ({ k: x.start, h: bkCard(x) })), ...hears.map((c) => ({ k: db.parseHm(c.hearing.time), h: hearingCard(c) }))].sort((p, q) => p.k - q.k);
    const off = db.memberOff(m.id, date) || !db.memberWeek(m.id)[db.weekdayOf(date)];
    return `<div class="bcol" style="--c:${m.color}"><div class="bcol-h"><i></i><div><b>${esc(m.short)}</b><small>${esc(L(m.role))}</small></div>${off ? `<small class="pillst off">${t('stOff')}</small>` : ''}<span>${list.filter((x) => x.status !== 'cancelled').length + hears.length}</span></div>
      ${items.length ? items.map((i) => i.h).join('') : `<div class="empty-col">${t('columnEmpty')}</div>`}</div>`;
  }).join('');
  return `<div class="board b4">${cols}</div>`;
}

// ── views ──────────────────────────────────────────────────────────────────
function viewLive() {
  const s = db.get(); const n = db.shopNow(); const ins = db.insights();
  const day = s.bookings.filter((b) => b.date === n.date && !['cancelled', 'noshow'].includes(b.status));
  const expected = day.reduce((a, b) => a + b.total, 0);
  const fl = db.floor();
  const hearToday = s.cases.filter((c) => !c.closed && c.hearing && c.hearing.date === n.date).length;
  const newReq = s.requests.filter((r) => r.status === 'new').length;
  const rows = fl.map((c) => {
    const m = memberById(c.member);
    const sub = c.state === 'off' ? '' : c.state === 'court' ? t('inHearing', { t: c.hearing.hearing.time }) : c.with ? t('withC', { n: esc(c.with.name), t: hm(c.until ?? (c.with.start + c.with.dur)) }) : c.next ? t('nextAt', { t: hm(c.next) }) : t('nothingNext');
    return `<div class="chair"><span class="av" style="--c:${m.color}">${esc(m.short[0])}</span><div><b>${esc(m.name)} <small class="role">${esc(L(m.role))}</small></b><small>${sub}</small></div><span class="pillst ${c.state}">${t({ free: 'stFree', busy: 'stBusy', court: 'stCourt', off: 'stOff' }[c.state])}</span></div>`;
  }).join('');
  return `<div class="kpis">
      <div class="kpi"><span>${t('k_rev')}</span><b>${money(ins.today.rev)}</b><small>${t('expected', { n: money(expected) })}</small></div>
      <div class="kpi"><span>${t('k_appt')}</span><b>${day.length}</b></div>
      <div class="kpi"><span>${t('k_hear')}</span><b>${hearToday}</b></div>
      <div class="kpi"><span>${t('k_req')}</span><b>${newReq}</b></div>
      <div class="kpi"><span>${t('k_out')}</span><b>${money(ins.outstanding)}</b></div>
    </div>
    <div class="card" style="margin-bottom:16px"><h2>${t('floorT')}</h2><div class="chairs">${rows}</div></div>
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
  const offs = TEAM.map((m) => {
    const works = !!db.memberWeek(m.id)[db.weekdayOf(calDate)];
    const off = db.memberOff(m.id, calDate);
    return `<button class="tg ${off || !works ? 'off' : ''}" style="--c:${m.color}" data-tgoff="${m.id}" ${works ? '' : 'disabled'}><i></i>${esc(m.short)} · ${off || !works ? t('dayOff') : t('working')}</button>`;
  }).join('');
  return `<div class="daystrip" id="calStrip">${strip}</div>
    <div class="top" style="margin-bottom:12px"><h2 class="daytitle">${dateTxt(calDate, { weekday: 'long', day: 'numeric', month: 'long' })}</h2><button class="abtn pri" data-addbk>${icon('plus')} ${t('addBooking')}</button></div>
    <p class="who" style="margin:0 0 6px">${t('offDay', { d: dateTxt(calDate, { day: 'numeric', month: 'short' }) })}</p><div class="offrow">${offs}</div>
    ${board(calDate)}`;
}

const dueOf = (caseId) => db.invoicesOf(caseId).filter((i) => i.status === 'due').reduce((a, i) => a + i.amount, 0);
function viewCases() {
  const s = db.get();
  const q = caseQ.trim().toLowerCase();
  const list = s.cases.filter((c) => (caseFilter === 'all' || (caseFilter === 'open' ? !c.closed : c.closed)) && (caseLawyer === 'all' || c.lawyer === caseLawyer)
    && (!q || c.ref.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.phone.includes(q.replace(/\D/g, '') || '§') || L(c.title).toLowerCase().includes(q)))
    .sort((a, b) => (a.closed - b.closed) || ((a.hearing?.date || '9') < (b.hearing?.date || '9') ? -1 : 1));
  const rows = list.map((c) => {
    const due = dueOf(c.id); const newDocs = c.docs.filter((d) => d.isNew).length;
    return `<tr class="case-row" data-case="${c.id}"><td><b>${esc(c.ref)}</b>${newDocs ? `<span class="badge-new">${t('newTag')}</span>` : ''}<div class="muted">${esc(L(c.title))}</div></td>
      <td><b>${esc(c.name)}</b><div class="muted"><bdi dir="ltr">${esc(c.phone)}</bdi></div></td><td>${esc(L(areaById(c.area).name))}</td><td>${esc(memberById(c.lawyer).short)}</td>
      <td><span class="chip ${c.closed ? '' : 'pri'}">${esc(L(STAGES[c.stage].label))}</span></td>
      <td class="num">${c.hearing ? `${dateTxt(c.hearing.date, { day: 'numeric', month: 'short' })} · ${c.hearing.time}` : '—'}</td><td class="num">${due ? `<span class="chip warn">${money(due)}</span>` : '—'}</td></tr>`;
  }).join('');
  return `<div class="cases-top"><div class="segs">${[['open', 'fOpen'], ['closed', 'fClosed'], ['all', 'fAll']].map(([id, k]) => `<button data-cfilter="${id}" aria-pressed="${caseFilter === id}">${t(k)}</button>`).join('')}</div>
      <div class="inline-form" style="flex:1 1 320px;justify-content:flex-end"><input class="in search" id="caseQ" placeholder="${t('search')}" value="${esc(caseQ)}" style="flex:1 1 200px" />
      <select class="in" data-clawyer><option value="all">${t('allLawyers')}</option>${TEAM.map((m) => `<option value="${m.id}" ${caseLawyer === m.id ? 'selected' : ''}>${esc(m.short)}</option>`).join('')}</select>
      <button class="abtn pri" data-newcase>${icon('plus')} ${t('newCase')}</button></div></div>
    <div class="card"><h2>${t('casesT')} <small>${list.length}</small></h2><div class="tbl-wrap"><table class="t"><thead><tr><th>${t('c_file')}</th><th>${t('c_client')}</th><th>${t('c_area')}</th><th>${t('c_lawyer')}</th><th>${t('c_stage')}</th><th>${t('c_hearing')}</th><th>${t('c_due')}</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="7" class="muted">${t('noCases')}</td></tr>`}</tbody></table></div></div>`;
}

function viewClients() {
  const s = db.get();
  const q = clientQ.trim().toLowerCase();
  const list = Object.values(s.clients).filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q.replace(/\D/g, '') || '§')).sort((a, b) => b.visits - a.visits);
  const rows = list.map((c) => `<tr>
    <td><b>${esc(c.name)}</b><div class="muted"><bdi dir="ltr">${esc(c.phone)}</bdi>${c.email ? ` · ${esc(c.email)}` : ''}</div></td><td class="num">${c.visits}</td><td class="num">${money(c.spent)}</td><td class="num">${c.matters || '—'}</td>
    <td class="num">${c.last ? dateTxt(c.last, { day: 'numeric', month: 'short' }) : '—'}</td><td class="num">${c.noShows || '—'}</td>
    <td><input class="in" data-note="${c.phone}" value="${esc(c.notes)}" placeholder="${t('notesPh')}" style="min-width:170px" /></td></tr>`).join('');
  return `<div class="card"><h2>${t('clientsT')} <small>${list.length}</small></h2>
      <input class="in search" id="clientQ" placeholder="${t('search')}" value="${esc(clientQ)}" style="margin-bottom:10px" />
      <div class="tbl-wrap"><table class="t"><thead><tr><th>${t('c_name')}</th><th>${t('c_visits')}</th><th>${t('c_spent')}</th><th>${t('c_matters')}</th><th>${t('c_last')}</th><th>${t('c_ns')}</th><th>${t('c_notes')}</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="7" class="muted">${t('noClients')}</td></tr>`}</tbody></table></div></div>`;
}

function viewReq() {
  const s = db.get(); const n = db.shopNow();
  const ago = (r) => { const m = Math.max(0, n.epoch - r.at); return m < 60 ? `${Math.round(m)} min` : m < 1440 ? `${Math.round(m / 60)} h` : dateTxt(db.addDays(n.date, -Math.round(m / 1440)), { day: 'numeric', month: 'short' }); };
  const list = s.requests.slice().sort((a, b) => b.at - a.at);
  const cards = list.map((r) => {
    const d = db.digits(r.phone);
    const acts = r.status === 'new' ? `<button class="abtn pri sm" data-rq="${r.id}" data-to="contacted">${t('markContacted')}</button><button class="abtn danger sm" data-rq="${r.id}" data-to="declined">${t('declineReq')}</button>`
      : r.status === 'contacted' ? `<button class="abtn ok sm" data-rq="${r.id}" data-to="booked">${t('markBooked')}</button><button class="abtn danger sm" data-rq="${r.id}" data-to="declined">${t('declineReq')}</button>` : '';
    const planName = r.plan ? L(PLANS.find((p) => p.id === r.plan)?.name) : '';
    return `<article class="ord req ${r.status === 'declined' ? 'cancelled' : ''} ${fresh.has(r.id) ? 'fresh' : ''}">
      <div class="ord-h"><b>${r.type === 'plan' ? t('planReq', { p: esc(planName) }) : t('callback')}</b><span class="st rq-${r.status}">${t(`r_${r.status}`)}</span></div>
      <div class="who"><b>${esc(r.name)}</b> · <bdi dir="ltr">${esc(r.phone)}</bdi></div>
      <div class="req-meta">${r.area ? `<span>${icon('scale')} ${esc(L(areaById(r.area)?.name))}</span>` : ''}</div>
      ${r.note ? `<div class="note">${icon('message')} ${esc(r.note)}</div>` : ''}
      <div class="ord-f"><span><small>${t('received', { t: ago(r) })}</small></span><div>${acts}<a class="abtn ghost sm" href="tel:+212${d.replace(/^0/, '')}" aria-label="${t('callWord')}">${icon('phone')}</a><a class="abtn ghost sm" href="https://wa.me/212${d.replace(/^0/, '')}" target="_blank" rel="noopener" aria-label="${t('whatsapp')}">${icon('message')}</a></div></div>
    </article>`;
  }).join('');
  return `<div class="card"><h2>${t('reqT')} <small>${list.length}</small></h2>${cards ? `<div class="reqgrid">${cards}</div>` : `<div class="empty-col">${t('noReq')}</div>`}</div>`;
}

function viewBill() {
  const s = db.get(); const ins = db.insights(); const n = db.shopNow();
  const since = db.addDays(n.date, -28);
  const collected = s.invoices.filter((i) => i.status === 'paid' && i.paidAt >= since).reduce((a, i) => a + i.amount, 0);
  const dueCount = s.invoices.filter((i) => i.status === 'due').length;
  const list = s.invoices.filter((i) => billFilter === 'all' || i.status === billFilter).sort((a, b) => (a.date < b.date ? 1 : -1));
  const rows = list.map((i) => {
    const c = db.caseById(i.caseId);
    return `<tr><td><b>${esc(i.no)}</b><div class="muted">${esc(L(i.desc))}</div></td><td>${c ? esc(c.name) : '—'}</td><td>${c ? `<button class="abtn ghost sm" data-case="${c.id}">${esc(c.ref)}</button>` : '—'}</td>
      <td class="num">${dateTxt(i.date, { day: 'numeric', month: 'short' })}</td><td class="num"><b>${money(i.amount)}</b></td>
      <td><span class="chip ${i.status === 'paid' ? 'ok' : 'warn'}">${t(i.status === 'paid' ? 'paid' : 'due')}</span></td>
      <td class="num">${i.status === 'due' ? `<button class="abtn pri sm" data-paid="${i.id}">${t('markPaid')}</button> <button class="abtn ghost sm" data-remind="${i.id}">${t('remind')}</button>` : ''}</td></tr>`;
  }).join('');
  return `<div class="kpis">
      <div class="kpi"><span>${t('k_out')}</span><b>${money(ins.outstanding)}</b></div>
      <div class="kpi"><span>${t('k_invoices')}</span><b>${dueCount}</b></div>
      <div class="kpi"><span>${t('k_paidMonth')}</span><b>${money(collected)}</b></div></div>
    <div class="card"><div class="cases-top" style="margin-bottom:6px"><h2 style="margin:0">${t('billT')} <small>${list.length}</small></h2><div class="segs">${[['due', 'due'], ['paid', 'paid'], ['all', 'fAll']].map(([id, k]) => `<button data-bfilter="${id}" aria-pressed="${billFilter === id}">${t(k)}</button>`).join('')}</div></div>
    <div class="tbl-wrap"><table class="t"><thead><tr><th>${t('i_no')}</th><th>${t('i_client')}</th><th>${t('i_file')}</th><th>${t('i_date')}</th><th>${t('i_amount')}</th><th>${t('i_status')}</th><th></th></tr></thead><tbody>${rows || `<tr><td colspan="7" class="muted">${t('noInv')}</td></tr>`}</tbody></table></div></div>`;
}

function viewTeam() {
  const s = db.get(); const n = db.shopNow();
  return `<div class="grid2">${TEAM.map((m) => {
    const week = db.memberWeek(m.id);
    const done = s.bookings.filter((x) => x.member === m.id && x.date === n.date && x.status === 'done');
    const rev = done.reduce((a, x) => a + x.total, 0);
    const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => { const w = week[d]; return `<div><b>${days()[d]}</b><label class="sw on"><input type="checkbox" data-wk="${m.id}:${d}:off" ${w ? 'checked' : ''} aria-label="${days()[d]}" /><span></span></label>${timeSel(`wk="${m.id}:${d}:0"`, w ? w[0] : 540, !w)}${timeSel(`wk="${m.id}:${d}:1"`, w ? w[1] : 1080, !w)}</div>`; }).join('');
    return `<div class="card barb-card" style="--c:${m.color}"><header><span class="av">${esc(m.short[0])}</span><div><b>${esc(m.name)}</b><small>${esc(L(m.role))}</small></div><label class="sw on" title="${t('visible')}"><input type="checkbox" data-show="${m.id}" ${db.memberActive(m.id) ? 'checked' : ''} aria-label="${t('visible')}" /><span></span></label></header>
      <div class="tagrow"><small class="muted">${t('skillsT')}</small>${m.skills.map((c) => `<span class="chip pri">${esc(L(areaById(c).name))}</span>`).join('')}</div>
      <div class="mini-kpis"><div><span>${t('todayRev')}</span><b>${money(rev)}</b></div><div><span>${t('todayN')}</span><b>${done.length}</b></div><div><span>${t('rating')}</span><b>★ ${m.rating.toFixed(1)}</b></div></div>
      <div><p class="who" style="margin:0 0 6px"><b>${t('teamT')}</b></p><div class="sched">${rows}</div></div></div>`;
  }).join('')}</div>`;
}

function viewStats() {
  const ins = db.insights();
  const last = ins.days.slice(-14); const max = Math.max(...last.map((d) => d.rev), 1);
  const bars = last.map((d, i) => `<div class="${i === last.length - 1 ? 'today' : ''}"><i style="height:${Math.max(4, Math.round((d.rev / max) * 128))}px" title="${money(d.rev)}"></i><span>${Number(d.date.slice(8))}</span></div>`).join('');
  const delta = ins.prevWeek ? Math.round(((ins.week - ins.prevWeek) / ins.prevWeek) * 100) : 0;
  const top = ins.areas.slice(0, 8); const topMax = top[0]?.[1] || 1;
  const hmax = Math.max(...ins.heat.flat(), 1);
  const order = [1, 2, 3, 4, 5, 6, 0];
  const heat = `<div class="heat"><span></span>${Array.from({ length: 10 }, (_, h) => `<span>${9 + h}</span>`).join('')}${order.map((d) => `<span>${days()[d]}</span>${ins.heat[d].map((v) => `<i style="opacity:${(0.1 + 0.9 * v / hmax).toFixed(2)}" title="${v}"></i>`).join('')}`).join('')}</div>`;
  return `<div class="kpis">
      <div class="kpi"><span>${t('revWeek')}</span><b>${money(ins.week)}</b><small class="${delta < 0 ? 'down' : ''}">${delta >= 0 ? '+' : ''}${t('vsPrev', { p: delta })}</small></div>
      <div class="kpi"><span>${t('avgTicket')}</span><b>${money(ins.avg)}</b></div>
      <div class="kpi"><span>${t('noShowRate')}</span><b>${(ins.noShowRate * 100).toFixed(1)}%</b></div>
      <div class="kpi"><span>${t('repeat')}</span><b>${Math.round(ins.rebook * 100)}%</b></div>
      <div class="kpi"><span>${t('k_open')}</span><b>${ins.openCases}</b></div></div>
    <div class="grid2" style="margin-bottom:16px"><div class="card"><h2>${t('revDays')}</h2><div class="bars">${bars}</div></div>
      <div class="card"><h2>${t('topAreas')}</h2><div class="hbar">${top.map(([id, c]) => `<div><b>${esc(L(areaById(id).name))}</b><span>${c}</span><i style="width:${(c / topMax) * 100}%"></i></div>`).join('')}</div></div></div>
    <div class="card"><h2>${t('busy')} <small>${t('less')} → ${t('more')}</small></h2>${heat}</div>`;
}

function viewSet() {
  const s = db.get(); const st = s.settings;
  const sw = (key, on, inverse = false) => `<label class="sw ${inverse ? '' : 'on'}"><input type="checkbox" data-set="${key}" ${on ? 'checked' : ''} aria-label="${key}" /><span></span></label>`;
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = st.hours[d]; return `<div><b>${days()[d]}</b><label class="sw on"><input type="checkbox" data-hrs="${d}:off" ${h ? 'checked' : ''} aria-label="${days()[d]}" /><span></span></label>${timeSel(`hrs="${d}:0"`, h ? h[0] : 540, !h)}${timeSel(`hrs="${d}:1"`, h ? h[1] : 1080, !h)}</div>`; }).join('');
  const fees = MEETINGS.map((m) => `<tr><td><b>${esc(L(m.name))}</b><div class="muted">${t('min', { n: m.dur })}</div></td><td><input class="price-in" type="number" min="0" step="50" value="${db.meetPrice(m)}" data-meetprice="${m.id}" aria-label="${t('c_spent')}" /></td>
    <td><label class="sw on"><input type="checkbox" data-meeton="${m.id}" ${db.meetActive(m.id) ? 'checked' : ''} aria-label="${esc(L(m.name))}" /><span></span></label></td></tr>`).join('');
  return `<div class="grid2"><div><div class="card" style="margin-bottom:14px"><h2>${t('hoursT')}</h2><div class="hours-grid">${rows}</div></div>
      <div class="card"><h2>${t('feesSetT')}</h2><div class="tbl-wrap"><table class="t fit"><tbody>${fees}</tbody></table></div></div></div>
    <div class="card"><h2>${t('bookingT')}</h2>
      <div class="frow"><div><b>${t('pauseT')}</b><small>${t('pauseS')}</small></div>${sw('paused', st.paused, true)}</div>
      <div class="frow"><div><b>${t('autoConfT')}</b><small>${t('autoConfS')}</small></div>${sw('autoConfirm', st.autoConfirm)}</div>
      <div class="frow"><div><b>${t('bufferT')}</b><small>${t('bufferS')}</small></div><select class="in" data-buffer>${[0, 5, 10, 15].map((m) => `<option value="${m}" ${st.buffer === m ? 'selected' : ''}>${t('min', { n: m })}</option>`).join('')}</select></div>
      <div class="frow"><div><b>${t('autoFlowT')}</b><small>${t('autoFlowS')}</small></div>${sw('autoFlow', st.autoFlow)}</div>
      <div class="frow"><div><b>${t('bannerT')}</b><small>${t('bannerS')}</small></div>${sw('banner', st.banner)}</div>
      <input class="in wide" data-banner value="${esc(st.bannerText)}" placeholder="${t('bannerPh')}" style="margin-top:8px" />
      <h2 style="margin-top:18px">${t('dataT')}</h2><div class="frow" style="border:0"><button class="abtn ghost" data-export>${icon('download')} ${t('exportCsv')}</button><button class="abtn danger" data-reset>${icon('refresh')} ${t('resetD')}</button></div></div></div>`;
}

const VIEWS = { live: viewLive, cal: viewCal, cases: viewCases, clients: viewClients, req: viewReq, bill: viewBill, team: viewTeam, stats: viewStats, set: viewSet };
let modal = null; // { type: 'booking' | 'case' | 'newcase', id? }
function render() { applyStatic(); renderTabs(); $('#view').innerHTML = VIEWS[tab](); if (modal) renderModal(); }

// ── modals ─────────────────────────────────────────────────────────────────
function openModal(m) { modal = m; $('#amodal').hidden = false; $('#amodal').classList.toggle('wide', m.type === 'case'); renderModal(); }
function closeModal() { modal = null; $('#amodal').hidden = true; }
function renderModal() {
  if (!modal) return;
  if (modal.type === 'booking') renderAddBooking();
  else if (modal.type === 'newcase') renderNewCase();
  else if (modal.type === 'case') renderCase();
}

// add an appointment ---------------------------------------------------------
let nb = null;
function openAddBooking() { nb = { name: '', phone: '', area: '', meeting: '', mode: 'office', who: 'any', date: calDate || db.shopNow().date, start: null }; openModal({ type: 'booking' }); }
function renderAddBooking() {
  const m = nb.meeting ? meetingById(nb.meeting) : null;
  if (m && !m.modes.includes(nb.mode)) nb.mode = m.modes[0];
  const qual = nb.area ? db.qualified(nb.area) : TEAM.map((x) => x.id);
  if (nb.who !== 'any' && !qual.includes(nb.who)) { nb.who = 'any'; nb.start = null; }
  const slots = nb.area && m ? db.slotsFor(nb.date, nb.who, m.dur, undefined, nb.area) : [];
  if (nb.start != null && !slots.some((x) => x.start === nb.start)) nb.start = null;
  const n = db.shopNow();
  const dates = Array.from({ length: SHOP.horizon + 1 }, (_, k) => db.addDays(n.date, k));
  const slotsHtml = !nb.area || !m ? `<small class="muted">${t('pickAreaFirst')}</small>` : slots.length ? `<div class="pickrow">${slots.map((x) => `<button class="pk" data-nbslot="${x.start}" aria-pressed="${nb.start === x.start}">${hm(x.start)}</button>`).join('')}</div>` : `<small class="muted">${t('noSlots')}</small>`;
  $('#amodal').innerHTML = `<div class="box"><h2>${t('addBookingT')}<button class="xb" data-closemodal aria-label="${t('close')}">${icon('x')}</button></h2>
    <div class="two"><label>${t('client')}<input class="in" data-nb="name" value="${esc(nb.name)}" /></label><label>${t('phone')}<input class="in" data-nb="phone" value="${esc(nb.phone)}" inputmode="tel" /></label></div>
    <div class="two"><label>${t('area')}<select class="in" data-nb="area"><option value="">—</option>${AREAS.map((a) => `<option value="${a.id}" ${nb.area === a.id ? 'selected' : ''}>${esc(L(a.name))}</option>`).join('')}</select></label>
    <label>${t('meeting')}<select class="in" data-nb="meeting"><option value="">—</option>${db.meetings().map((x) => `<option value="${x.id}" ${nb.meeting === x.id ? 'selected' : ''}>${esc(L(x.name))} · ${t('min', { n: x.dur })}</option>`).join('')}</select></label></div>
    <div class="two"><label>${t('mode')}<select class="in" data-nb="mode">${MODES.filter((md) => !m || m.modes.includes(md.id)).map((md) => `<option value="${md.id}" ${nb.mode === md.id ? 'selected' : ''}>${esc(L(md.name))}</option>`).join('')}</select></label>
    <label>${t('lawyer')}<select class="in" data-nb="who"><option value="any" ${nb.who === 'any' ? 'selected' : ''}>${t('anyone')}</option>${qual.map((id) => `<option value="${id}" ${nb.who === id ? 'selected' : ''}>${esc(memberById(id).name)}</option>`).join('')}</select></label></div>
    <label>${t('date')}<select class="in" data-nb="date">${dates.map((d) => `<option value="${d}" ${nb.date === d ? 'selected' : ''}>${dateTxt(d, { weekday: 'short', day: 'numeric', month: 'short' })}</option>`).join('')}</select></label>
    <div class="lbl">${t('time')}${slotsHtml}</div>
    <p class="err" id="nbErr" role="alert"></p><div class="foot"><button class="abtn ghost" data-closemodal>${t('cancel')}</button><button class="abtn pri" data-nbsave>${t('save')}</button></div></div>`;
}
function saveNb() {
  const err = $('#nbErr');
  if (nb.name.trim().length < 2 || db.digits(nb.phone).length < 9) { err.textContent = t('needName'); return; }
  if (!nb.area || !nb.meeting) { err.textContent = t('needArea'); return; }
  if (nb.start == null) { err.textContent = t('needSlot'); return; }
  const r = db.book({ date: nb.date, start: nb.start, member: nb.who, meeting: nb.meeting, area: nb.area, mode: nb.mode, name: nb.name.trim(), phone: nb.phone, source: 'manual' });
  if (r.error) { err.textContent = t('slotTaken'); return; }
  closeModal(); toast(t('booked')); render();
}

// open a case ----------------------------------------------------------------
let nc = null;
function openNewCase() { nc = { name: '', phone: '', area: 'family', title: '', lawyer: db.qualified('family')[0] }; openModal({ type: 'newcase' }); }
function renderNewCase() {
  const qual = db.qualified(nc.area);
  if (!qual.includes(nc.lawyer)) nc.lawyer = qual[0];
  $('#amodal').innerHTML = `<div class="box"><h2>${t('newCaseT')}<button class="xb" data-closemodal aria-label="${t('close')}">${icon('x')}</button></h2>
    <div class="two"><label>${t('client')}<input class="in" data-nc="name" value="${esc(nc.name)}" /></label><label>${t('phone')}<input class="in" data-nc="phone" value="${esc(nc.phone)}" inputmode="tel" /></label></div>
    <div class="two"><label>${t('area')}<select class="in" data-nc="area">${AREAS.map((a) => `<option value="${a.id}" ${nc.area === a.id ? 'selected' : ''}>${esc(L(a.name))}</option>`).join('')}</select></label>
    <label>${t('lawyer')}<select class="in" data-nc="lawyer">${qual.map((id) => `<option value="${id}" ${nc.lawyer === id ? 'selected' : ''}>${esc(memberById(id).name)}</option>`).join('')}</select></label></div>
    <label>${t('matterTitle')}<input class="in" data-nc="title" value="${esc(nc.title)}" /></label>
    <p class="err" id="ncErr" role="alert"></p><div class="foot"><button class="abtn ghost" data-closemodal>${t('cancel')}</button><button class="abtn pri" data-ncsave>${t('save')}</button></div></div>`;
}
function saveNc() {
  const err = $('#ncErr');
  if (nc.name.trim().length < 2 || db.digits(nc.phone).length < 9 || nc.title.trim().length < 3) { err.textContent = t('needCase'); return; }
  const c = db.openCase({ name: nc.name.trim(), phone: nc.phone, area: nc.area, title: nc.title.trim(), lawyer: nc.lawyer });
  toast(t('caseOpened', { r: c.ref })); openModal({ type: 'case', id: c.id }); render();
}

// one case -------------------------------------------------------------------
function renderCase() {
  const c = db.caseById(modal.id); if (!c) { closeModal(); return; }
  const a = areaById(c.area); const m = memberById(c.lawyer); const invs = db.invoicesOf(c.id);
  const hr = c.hearing;
  $('#amodal').innerHTML = `<div class="box caseline"><h2>${t('caseT', { r: esc(c.ref) })}<button class="xb" data-closemodal aria-label="${t('close')}">${icon('x')}</button></h2>
    <div><b>${esc(c.name)}</b> · <bdi dir="ltr" class="ro">${esc(c.phone)}</bdi><div class="ro">${esc(L(c.title))} — ${esc(L(a.name))} · ${esc(m.name)}</div></div>
    <p class="sec-t">${t('stageT')}</p>
    <div class="stagebar">${STAGES.map((s, i) => `<button data-stage="${i}" class="${i < c.stage ? 'done' : i === c.stage ? 'cur' : ''}">${esc(L(s.label))}</button>`).join('')}</div>
    <p class="sec-t">${t('hearingT')}</p>
    <div class="inline-form"><input class="in" type="date" data-hdate value="${hr?.date || ''}" />${timeSelOpt('hseltime', hr ? db.parseHm(hr.time) : 570)}
      <select class="in" data-hcourt>${Object.keys(COURTS).map((k) => `<option value="${k}" ${hr?.court === k ? 'selected' : ''}>${esc(L(COURTS[k]))}</option>`).join('')}</select>
      <button class="abtn pri sm" data-hsave>${t('save')}</button>${hr ? `<button class="abtn ghost sm" data-hclear>${t('clearHearing')}</button>` : ''}</div>
    <p class="sec-t">${t('updateT')}</p>
    <div class="inline-form"><input class="in" id="cuText" placeholder="${esc(t('updatePh'))}" /><button class="abtn pri sm" data-sendupd>${icon('message')} ${t('sendUpdate')}</button></div>
    <div class="cols2"><div><p class="sec-t">${t('docsT')} <span class="chip">${c.docs.length}</span></p>
      <ul class="docs-list">${c.docs.slice().reverse().map((d) => `<li>${icon('fileText')}<span style="flex:1;min-width:0;word-break:break-word"><b>${esc(d.name)}</b> <small>· ${d.by === 'client' ? t('byClient') : t('byFirm')} · ${dateTxt(d.date, { day: 'numeric', month: 'short' })}</small></span>${d.isNew ? `<span class="newb">${t('newTag')}</span>` : ''}</li>`).join('')}</ul>
      <div class="inline-form" style="margin-top:8px"><input class="in" id="cdName" placeholder="${esc(t('docPh'))}" /><button class="abtn ghost sm" data-adddoc>${icon('plus')} ${t('addDoc')}</button></div></div>
    <div><p class="sec-t">${t('notesT')}</p>
      <ul class="notes-list">${c.notes.map((n) => `<li>${icon('lock')}<span><b>${esc(memberById(n.by)?.short || '·')}</b> <small class="muted">${dateTxt(n.date, { day: 'numeric', month: 'short' })}</small><br/>${esc(n.text)}</span></li>`).join('')}</ul>
      <div class="inline-form" style="margin-top:8px"><input class="in" id="cnText" placeholder="${esc(t('notePh'))}" /><button class="abtn ghost sm" data-addnote>${t('addNote')}</button></div></div></div>
    <p class="sec-t">${t('feesT')}</p>
    <ul class="docs-list">${invs.length ? invs.map((i) => `<li>${icon('receipt')}<span style="flex:1;min-width:0"><b>${esc(i.no)}</b> <small>· ${esc(L(i.desc))}</small></span><span class="chip ${i.status === 'paid' ? 'ok' : 'warn'}">${money(i.amount)} · ${t(i.status === 'paid' ? 'paid' : 'due')}</span>${i.status === 'due' ? `<button class="abtn pri sm" data-paid="${i.id}">${t('markPaid')}</button>` : ''}</li>`).join('') : `<li class="muted">${t('noInvoice')}</li>`}</ul>
    <div class="inline-form"><input class="in" id="ciDesc" placeholder="${esc(t('invDescPh'))}" /><input class="in" id="ciAmt" type="number" min="0" step="100" placeholder="${esc(t('invAmount'))}" style="flex:0 1 160px" /><button class="abtn ghost sm" data-addinv>${icon('plus')} ${t('issueInvoice')}</button></div>
    <p class="err" id="cErr" role="alert"></p></div>`;
  if (c.docs.some((d) => d.isNew)) db.markDocsSeen(c.id);
}
const timeSelOpt = (attr, minutes) => `<select class="in" data-${attr}>${HOURS.map((m) => `<option value="${hm(m)}" ${m === minutes ? 'selected' : ''}>${hm(m)}</option>`).join('')}</select>`;

// ── CSV ────────────────────────────────────────────────────────────────────
function exportCsv() {
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['code', 'date', 'start', 'end', 'lawyer', 'client', 'phone', 'area', 'meeting', 'format', 'fee', 'status', 'source'].join(',')]
    .concat(db.get().bookings.slice().sort((a, b) => db.epochOf(a.date, a.start) - db.epochOf(b.date, b.start)).map((b) => [b.code, b.date, hm(b.start), hm(b.start + b.dur), memberById(b.member).name, b.name, b.phone, L(areaById(b.area).name), L(meetingById(b.meeting).name), b.mode, b.total, b.status, b.source].map(q).join(',')));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' })); a.download = 'bennani-appointments.csv';
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
    if ((x = g('[data-lang]'))) { ddOpen = null; lang = x.dataset.lang; sessionStorage.setItem('law-admin-lang', lang); render(); return; }
    if ((x = g('[data-tab]'))) { tab = x.dataset.tab; sessionStorage.setItem('law-admin-tab', tab); render(); window.scrollTo(0, 0); return; }
    if ((x = g('[data-b]'))) { fresh.delete(x.dataset.b); db.setStatus(x.dataset.b, x.dataset.to); render(); return; }
    if ((x = g('[data-rq]'))) { fresh.delete(x.dataset.rq); db.update((s) => { s.requests.find((r) => r.id === x.dataset.rq).status = x.dataset.to; }); render(); return; }
    if ((x = g('[data-caldate]'))) { calDate = x.dataset.caldate; const keep = $('#calStrip')?.scrollLeft; render(); if (keep) $('#calStrip').scrollLeft = keep; return; }
    if ((x = g('[data-tgoff]'))) {
      const id = x.dataset.tgoff; const off = db.memberOff(id, calDate);
      if (!off) {
        const booked = db.get().bookings.filter((b) => b.member === id && b.date === calDate && ['pending', 'confirmed', 'arrived', 'inprogress'].includes(b.status)).length;
        if (booked) { toast(t('offBooked', { n: booked })); return; }
      }
      db.update((s) => { s.members[id] = s.members[id] || {}; s.members[id].off = { ...(s.members[id].off || {}), [calDate]: !off }; }); render(); return;
    }
    if (g('[data-addbk]')) { openAddBooking(); return; }
    if (g('[data-closemodal]')) { closeModal(); return; }
    if ((x = g('[data-nbslot]'))) { nb.start = Number(x.dataset.nbslot); renderAddBooking(); return; }
    if (g('[data-nbsave]')) { saveNb(); return; }
    if (g('[data-newcase]')) { openNewCase(); return; }
    if (g('[data-ncsave]')) { saveNc(); return; }
    if ((x = g('[data-case]'))) { openModal({ type: 'case', id: x.dataset.case }); return; }
    if ((x = g('[data-cfilter]'))) { caseFilter = x.dataset.cfilter; render(); return; }
    if ((x = g('[data-bfilter]'))) { billFilter = x.dataset.bfilter; render(); return; }
    if ((x = g('[data-stage]')) && modal?.type === 'case') { db.setStage(modal.id, Number(x.dataset.stage)); render(); return; }
    if (g('[data-hsave]') && modal?.type === 'case') {
      const d = $('[data-hdate]').value; if (!d) return;
      db.setHearing(modal.id, { date: d, time: $('[data-hseltime]').value, court: $('[data-hcourt]').value }); toast(t('hearingSaved')); render(); return;
    }
    if (g('[data-hclear]') && modal?.type === 'case') { db.setHearing(modal.id, null); render(); return; }
    if (g('[data-sendupd]') && modal?.type === 'case') { const v = $('#cuText').value.trim(); if (!v) return; db.addCaseUpdate(modal.id, v); toast(t('updateSent')); render(); return; }
    if (g('[data-addnote]') && modal?.type === 'case') { const v = $('#cnText').value.trim(); if (!v) return; db.addCaseNote(modal.id, v, db.caseById(modal.id).lawyer); render(); return; }
    if (g('[data-adddoc]') && modal?.type === 'case') { const v = $('#cdName').value.trim(); if (!v) return; db.addCaseDoc(modal.id, v, 'firm'); render(); return; }
    if (g('[data-addinv]') && modal?.type === 'case') {
      const amt = Number($('#ciAmt').value); const desc = $('#ciDesc').value.trim();
      if (!(amt > 0) || desc.length < 3) { $('#cErr').textContent = t('needInv'); return; }
      db.createInvoice({ caseId: modal.id, amount: amt, desc }); toast(t('invoiceIssued')); render(); return;
    }
    if ((x = g('[data-paid]'))) { db.update((s) => { const i = s.invoices.find((y) => y.id === x.dataset.paid); i.status = 'paid'; i.paidAt = db.shopNow().date; }); render(); return; }
    if (g('[data-remind]')) { toast(t('reminded')); return; }
    if ((x = g('[data-stock]'))) return;
    if (g('[data-export]')) { exportCsv(); return; }
    if (g('[data-reset]')) { if (confirm(t('resetS'))) { db.resetDemo(); fresh = new Set(); calDate = null; closeModal(); render(); toast(t('resetDone')); } return; }
    if (g('#soundBtn')) { db.update((s) => { s.settings.sound = !s.settings.sound; }); renderTabs(); if (db.get().settings.sound) ding(); }
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'clientQ') { clientQ = e.target.value; const pos = e.target.selectionStart; $('#view').innerHTML = viewClients(); const el = $('#clientQ'); el.focus(); el.setSelectionRange(pos, pos); return; }
    if (e.target.id === 'caseQ') { caseQ = e.target.value; const pos = e.target.selectionStart; $('#view').innerHTML = viewCases(); const el = $('#caseQ'); el.focus(); el.setSelectionRange(pos, pos); return; }
    const d = e.target.dataset;
    if (d.nb && nb) { nb[d.nb] = e.target.value; if (['area', 'meeting', 'who', 'date', 'mode'].includes(d.nb)) { nb.start = null; renderAddBooking(); } }
    if (d.nc && nc) { nc[d.nc] = e.target.value; if (d.nc === 'area') renderNewCase(); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target; const d = el.dataset;
    if (d.clawyer !== undefined) { caseLawyer = el.value; render(); return; }
    if (d.meetprice) { const v = Math.max(0, Number(el.value) || 0); db.update((s) => { s.meet[d.meetprice] = { ...(s.meet[d.meetprice] || {}), price: v }; }); toast(t('saved')); return; }
    if (d.meeton) { db.update((s) => { s.meet[d.meeton] = { ...(s.meet[d.meeton] || {}), active: el.checked }; }); render(); return; }
    if (d.note) { db.update((s) => { s.clients[d.note].notes = el.value; }); toast(t('saved')); return; }
    if (d.show) { db.update((s) => { s.members[d.show] = { ...(s.members[d.show] || {}), hidden: !el.checked }; }); render(); return; }
    if (d.wk) {
      const [id, day, part] = d.wk.split(':');
      db.update((s) => {
        const cur = s.members[id] || (s.members[id] = {});
        cur.week = cur.week || JSON.parse(JSON.stringify(db.memberWeek(id)));
        if (part === 'off') cur.week[day] = el.checked ? [540, 1080] : null;
        else { const w = cur.week[day] || [540, 1080]; w[Number(part)] = db.parseHm(el.value); cur.week[day] = w; }
      });
      render(); return;
    }
    if (d.hrs) {
      const [day, part] = d.hrs.split(':');
      db.update((s) => {
        if (part === 'off') s.settings.hours[day] = el.checked ? [540, 1080] : null;
        else { const h = s.settings.hours[day] || [540, 1080]; h[Number(part)] = db.parseHm(el.value); s.settings.hours[day] = h; }
      });
      render(); return;
    }
    if (d.set) { db.update((s) => { s.settings[d.set] = el.checked; }); render(); return; }
    if (d.buffer !== undefined) { db.update((s) => { s.settings.buffer = Number(el.value); }); toast(t('saved')); return; }
    if (d.banner !== undefined) { db.update((s) => { s.settings.bannerText = el.value.trim(); }); toast(t('saved')); }
  });

  // live updates from the website (another tab) and the demo auto-flow
  let known = new Set(db.get().bookings.map((b) => b.id)); let knownR = new Set(db.get().requests.map((r) => r.id));
  let knownDocs = new Set(db.get().cases.flatMap((c) => c.docs.map((d) => d.id)));
  db.subscribe((s, src) => {
    if (src === 'remote') {
      s.bookings.filter((b) => !known.has(b.id)).forEach((b) => { fresh.add(b.id); ding(); toast(t('newBooking', { n: b.name, t: hm(b.start) }), 'pri'); });
      s.requests.filter((r) => !knownR.has(r.id)).forEach((r) => { fresh.add(r.id); ding(); toast(t('newReq', { n: r.name }), 'pri'); });
      s.cases.forEach((c) => c.docs.filter((d) => !knownDocs.has(d.id)).forEach(() => { ding(); toast(t('newDoc', { n: c.name }), 'pri'); }));
    }
    known = new Set(s.bookings.map((b) => b.id)); knownR = new Set(s.requests.map((r) => r.id)); knownDocs = new Set(s.cases.flatMap((c) => c.docs.map((d) => d.id)));
    const active = document.activeElement;
    if (active && active.matches('input, select, textarea') && ($('#view').contains(active) || $('#amodal').contains(active))) { renderTabs(); return; } // don't clobber a field being edited
    render();
  });
  setInterval(() => { db.tick(); const a = document.activeElement; if (!(a && a.matches('input, select, textarea') && ($('#view').contains(a) || $('#amodal').contains(a)))) render(); }, 5000);
}

// ── gate ───────────────────────────────────────────────────────────────────
// Whether the demo is open and which PIN hint to show come from the MBN DEV dashboard.
function unlock() { $('#gate').hidden = true; $('#app').hidden = false; render(); }
applyStatic();
wire();
fetchConfig().then((cfg) => {
  gateCfg = cfg; renderGateText();
  if (cfg.ok && !cfg.live) { sessionStorage.removeItem('law-admin'); return; }
  if (cfg.ok && sessionStorage.getItem('law-admin') === '1') unlock();
  else if (!cfg.ok) $('#pinErr').textContent = t('offline');
});
$('#gateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#gateForm button[type="submit"]'); const err = $('#pinErr');
  btn.disabled = true; err.textContent = '';
  const res = await verifyPin($('#pin').value.trim());
  btn.disabled = false;
  if (res === 'ok') { sessionStorage.setItem('law-admin', '1'); unlock(); return; }
  if (res === 'unavailable') { gateCfg = { ok: true, live: false, state: 'disabled' }; renderGateText(); return; }
  err.textContent = t(res === 'bad' ? 'badPin' : res === 'limited' ? 'tooMany' : 'offline');
  const f = $('#gateForm'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); $('#pin').select();
});
$('#pin').focus();
