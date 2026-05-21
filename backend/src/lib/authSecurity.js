// ─── Auth Security Utilities ──────────────────────────────────────────────────
// Brute-force protection, phone normalisation, email normalisation.
// DB-backed — works correctly on Vercel serverless (no in-memory state needed).

const prisma = require('./prisma');

// ─── Constants ────────────────────────────────────────────────────────────────

const LOGIN_WINDOW_MS   = 15 * 60 * 1000;  // 15-minute rolling window
const LOGIN_MAX_FAILS   = 5;               // lock after 5 failures in window
const LOGIN_LOCK_MS     = 15 * 60 * 1000;  // lockout duration: 15 minutes

const REG_WINDOW_MS     = 60 * 60 * 1000;  // 1-hour rolling window
const REG_MAX_ATTEMPTS  = 5;              // max registration attempts per IP/hour

// ─── Email normalisation ──────────────────────────────────────────────────────

/**
 * Normalise an email address for consistent storage and lookup.
 * Lowercases and trims; does NOT strip dots or aliases — preserves deliverability.
 */
function normalizeEmail(raw) {
  if (!raw) return '';
  return String(raw).trim().toLowerCase();
}

// ─── Phone normalisation ──────────────────────────────────────────────────────

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

  // Replace 00 international prefix with +
  if (s.startsWith('00')) s = '+' + s.slice(2);

  const hasPlus = s.startsWith('+');

  // Strip everything except digits
  const digits = s.replace(/\D/g, '');

  if (!digits || digits.length < 7 || digits.length > 15) return null;

  return hasPlus ? `+${digits}` : digits;
}

/**
 * Returns true if the raw phone string is syntactically valid (after normalisation).
 */
function isValidPhone(raw) {
  return normalizePhone(raw) !== null;
}

// ─── Brute-force / login-attempt tracking ────────────────────────────────────

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
 * Record a login attempt (success or failure) for the given normalised email.
 * Also performs a probabilistic cleanup of old records (1% chance per call).
 */
async function recordLoginAttempt(email, req, success) {
  const ip = getIp(req);

  await prisma.loginAttempt.create({
    data: { email: normalizeEmail(email), ip, success },
  });

  // Probabilistic cleanup — delete attempts older than 24 h
  if (Math.random() < 0.01) {
    prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }).catch(() => {});
  }
}

/**
 * Check whether an email is currently locked out due to too many failed logins.
 *
 * Returns: { locked: boolean, remainingMs: number, attemptsLeft: number }
 */
async function checkLoginBruteForce(email) {
  const since = new Date(Date.now() - LOGIN_WINDOW_MS);
  const normalised = normalizeEmail(email);

  const failCount = await prisma.loginAttempt.count({
    where: {
      email:   normalised,
      success: false,
      createdAt: { gte: since },
    },
  });

  if (failCount < LOGIN_MAX_FAILS) {
    return { locked: false, remainingMs: 0, attemptsLeft: LOGIN_MAX_FAILS - failCount };
  }

  // Find the most recent failure to calculate remaining lockout time
  const latest = await prisma.loginAttempt.findFirst({
    where: { email: normalised, success: false, createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
  });

  const lockUntil = latest
    ? new Date(latest.createdAt.getTime() + LOGIN_LOCK_MS)
    : new Date();
  const remainingMs = Math.max(0, lockUntil.getTime() - Date.now());

  return { locked: remainingMs > 0, remainingMs, attemptsLeft: 0 };
}

/**
 * Clear all failed login attempts for an email (called on successful login).
 */
async function clearLoginAttempts(email) {
  await prisma.loginAttempt.deleteMany({
    where: { email: normalizeEmail(email), success: false },
  });
}

// ─── Registration rate limiting ───────────────────────────────────────────────

/**
 * Check whether this IP has exceeded the registration rate limit.
 * Returns { limited: boolean, remainingMs: number }
 */
async function checkRegistrationRate(req) {
  const ip = getIp(req);
  if (!ip) return { limited: false, remainingMs: 0 };

  const since = new Date(Date.now() - REG_WINDOW_MS);

  const count = await prisma.loginAttempt.count({
    where: {
      ip,
      // We reuse LoginAttempt; use a sentinel email to mark registration attempts
      email:     '__registration__',
      createdAt: { gte: since },
    },
  });

  if (count < REG_MAX_ATTEMPTS) return { limited: false, remainingMs: 0 };

  const earliest = await prisma.loginAttempt.findFirst({
    where: { ip, email: '__registration__', createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
  });

  const resetAt     = earliest ? new Date(earliest.createdAt.getTime() + REG_WINDOW_MS) : new Date();
  const remainingMs = Math.max(0, resetAt.getTime() - Date.now());

  return { limited: remainingMs > 0, remainingMs };
}

/**
 * Record a registration attempt for IP-based rate limiting.
 */
async function recordRegistrationAttempt(req) {
  const ip = getIp(req);
  if (!ip) return;
  await prisma.loginAttempt.create({
    data: { email: '__registration__', ip, success: false },
  });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  normalizeEmail,
  normalizePhone,
  isValidPhone,
  getIp,
  recordLoginAttempt,
  checkLoginBruteForce,
  clearLoginAttempts,
  checkRegistrationRate,
  recordRegistrationAttempt,
};
