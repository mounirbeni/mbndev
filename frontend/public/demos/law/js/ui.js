// Shared helpers for the public site: language, formatting, toasts and sheets.
import { LANGS, STR } from './i18n.js';
import * as db from './store.js';
import { icon } from './icons.js';

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ── language ───────────────────────────────────────────────────────────────
const guess = () => { const n = (navigator.language || 'en').slice(0, 2); return ['fr', 'ar'].includes(n) ? n : 'en'; };
export const ui = { lang: db.get().lang || guess() };
export const t = (k, v = {}) => String(STR[ui.lang][k] ?? STR.en[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? '');
export const L = (o) => (o ? o[ui.lang] ?? o.en : '');
export const locale = () => LANGS.find((x) => x.id === ui.lang).locale;
export const dayNames = () => STR[ui.lang].days;

export const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 });
export const money = (n) => t('currency', { n: fmt(n) });
export const mins = (m) => (m >= 60 ? t('hm', { h: Math.floor(m / 60), m: m % 60 ? ` ${m % 60}` : '' }) : t('min', { n: m }));

/** Format a shop-local date string (YYYY-MM-DD). */
export function dateText(date, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(locale(), { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}
/** "today", "tomorrow" or a short date. */
export function dayWord(date) {
  const n = db.shopNow().date;
  if (date === n) return t('today');
  if (date === db.addDays(n, 1)) return t('tomorrow');
  return dateText(date);
}

// ── toast ──────────────────────────────────────────────────────────────────
let toastT;
export function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2800);
}

// ── sheets (one open at a time) ────────────────────────────────────────────
let current = null;
export const openedSheet = () => current;
export function openSheet(el) {
  if (current && current !== el) current.hidden = true;
  current = el; el.hidden = false; $('#scrim').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => (el.querySelector('[data-autofocus]') || el.querySelector('.xbtn'))?.focus(), 30);
}
export function closeSheet() {
  if (!current) return;
  current.hidden = true; current = null; $('#scrim').hidden = true; document.body.style.overflow = '';
}
export const sheetHead = (title, sub = '') => `<div class="sheet-head"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div><button class="xbtn" data-close aria-label="${t('close')}">${icon('x')}</button></div>`;

/** Stars + count, e.g. ★★★★★ 4.9 (212) */
export const rate = (r, n) => `<span class="rate"><b>${r.toFixed(1)}</b><span class="rc">(${n})</span></span>`;

/** Avatar: photo when we have one, a monogram otherwise. */
export const avatar = (b, photo) => (photo
  ? `<img class="avatar" src="${photo}" alt="${esc(b.name)}" loading="lazy" decoding="async" />`
  : `<span class="avatar mono" style="--c:${b.color}" aria-hidden="true">${esc((b.short || b.name)[0])}</span>`);
