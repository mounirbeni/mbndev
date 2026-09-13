// ─── Pure auth-security helpers ───────────────────────────────────────────
// No database dependency — kept separate from authSecurity.js so this logic
// (especially the lockout math) is unit-testable without a live Postgres
// connection, which lib/prisma.js requires at require-time.
'use strict';

const LOGIN_WINDOW_MS   = 15 * 60 * 1000;  // 15-minute rolling window
const LOGIN_MAX_FAILS   = 5;               // lock after 5 failures in window
const LOGIN_LOCK_MS     = 15 * 60 * 1000;  // lockout duration: 15 minutes

// A single source IP failing LOGIN_MAX_FAILS times against one email is the
// realistic credential-stuffing signal, so that pair is what gets locked.
// Locking the account by email alone (regardless of IP) let anyone who just
// knew a victim's email — e.g. via the public check-email endpoint — lock
// that account indefinitely for free, from a single IP, with no password
// guess required. The wider per-email counter below still catches a
// distributed attack (many source IPs), just at a much higher, harder-to-
// reach threshold, so real credential stuffing is still stopped.
const GLOBAL_WINDOW_MS  = 60 * 60 * 1000;  // 1-hour rolling window, any IP
const GLOBAL_MAX_FAILS  = 20;              // requires a genuinely distributed attempt

const REG_WINDOW_MS     = 60 * 60 * 1000;  // 1-hour rolling window
const REG_MAX_ATTEMPTS  = 5;               // max registration attempts per IP/hour

/**
 * Normalise an email address for consistent storage and lookup.
 * Lowercases and trims; does NOT strip dots or aliases — preserves deliverability.
 */
function normalizeEmail(raw) {
  if (!raw) return '';
  return String(raw).trim().toLowerCase();
}

/**
 * Normalise a phone number to a digit-only (or E.164) string.
 * Returns null if the input is empty or invalid.
 *
 * Rules:
 *  - Strip spaces, dashes, parentheses, dots
 *  - Replace leading 00 with + (international prefix)
 *  - Must be 7–15 digits (E.164 max = 15)
 */
function normalizePhone(raw) {
  if (!raw) return null;

  let s = String(raw).trim();
  if (!s) return null;

  if (s.startsWith('00')) s = '+' + s.slice(2);

  const hasPlus = s.startsWith('+');
  const digits  = s.replace(/\D/g, '');

  if (!digits || digits.length < 7 || digits.length > 15) return null;

  return hasPlus ? `+${digits}` : digits;
}

/**
 * Returns true if the raw phone string is syntactically valid (after normalisation).
 */
function isValidPhone(raw) {
  return normalizePhone(raw) !== null;
}

/**
 * Get IP address from Express request, handling common proxy headers.
 */
function getIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    null
  );
}

/**
 * Pure decision function — given the failure timestamps already fetched from
 * the database, decides whether a login attempt is locked.
 *
 * Two independent gates, either of which can lock the attempt:
 *  - per-IP: LOGIN_MAX_FAILS failures from THIS ip against this email within
 *    LOGIN_WINDOW_MS — the normal "someone is guessing this password" signal.
 *  - global: GLOBAL_MAX_FAILS failures against this email from ANY ip within
 *    GLOBAL_WINDOW_MS — catches a distributed attempt, at a threshold that
 *    can't be hit for free from a single source.
 *
 * @param {{ ipFails: Date[], globalFails: Date[], now: number }} args
 *   ipFails/globalFails are failure timestamps, newest first, already capped
 *   to at most (threshold + 1) entries by the caller's query.
 * @returns {{ locked: boolean, remainingMs: number, attemptsLeft: number }}
 */
function computeLockout({ ipFails, globalFails, now }) {
  const candidates = [];
  if (ipFails.length >= LOGIN_MAX_FAILS) {
    candidates.push(ipFails[0].getTime() + LOGIN_LOCK_MS);
  }
  if (globalFails.length >= GLOBAL_MAX_FAILS) {
    candidates.push(globalFails[0].getTime() + LOGIN_LOCK_MS);
  }

  if (candidates.length === 0) {
    return {
      locked: false,
      remainingMs: 0,
      attemptsLeft: Math.max(0, LOGIN_MAX_FAILS - ipFails.length),
    };
  }

  const remainingMs = Math.max(0, Math.max(...candidates) - now);
  return { locked: remainingMs > 0, remainingMs, attemptsLeft: 0 };
}

module.exports = {
  normalizeEmail,
  normalizePhone,
  isValidPhone,
  getIp,
  computeLockout,
  LOGIN_WINDOW_MS,
  LOGIN_MAX_FAILS,
  LOGIN_LOCK_MS,
  GLOBAL_WINDOW_MS,
  GLOBAL_MAX_FAILS,
  REG_WINDOW_MS,
  REG_MAX_ATTEMPTS,
};
