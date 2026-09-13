// ─── Auth Security Utilities ──────────────────────────────────────────────────
// Brute-force protection, phone normalisation, email normalisation.
// DB-backed — works correctly on Vercel serverless (no in-memory state needed).
// Pure helpers/constants live in ./authSecurityPure (no DB dependency, so they
// can be unit-tested without a live Postgres connection); this module wraps
// them with the Prisma-backed queries.

const prisma = require('./prisma');
const {
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
} = require('./authSecurityPure');

// ─── Brute-force / login-attempt tracking ────────────────────────────────────

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
 * Check whether login should be blocked for this (email, ip) pair.
 * `ip` may be null (proxy misconfiguration) — in that case only the global
 * gate applies, which still protects the account, just at a higher bar.
 * See authSecurityPure.computeLockout for the decision logic.
 *
 * Returns: { locked: boolean, remainingMs: number, attemptsLeft: number }
 */
async function checkLoginBruteForce(email, ip) {
  const normalised = normalizeEmail(email);
  const now        = Date.now();

  const [ipFailRows, globalFailRows] = await Promise.all([
    ip
      ? prisma.loginAttempt.findMany({
          where: {
            email: normalised, ip, success: false,
            createdAt: { gte: new Date(now - LOGIN_WINDOW_MS) },
          },
          orderBy: { createdAt: 'desc' },
          take:    LOGIN_MAX_FAILS + 1,
          select:  { createdAt: true },
        })
      : [],
    prisma.loginAttempt.findMany({
      where: {
        email: normalised, success: false,
        createdAt: { gte: new Date(now - GLOBAL_WINDOW_MS) },
      },
      orderBy: { createdAt: 'desc' },
      take:    GLOBAL_MAX_FAILS + 1,
      select:  { createdAt: true },
    }),
  ]);

  return computeLockout({
    ipFails:     ipFailRows.map((r) => r.createdAt),
    globalFails: globalFailRows.map((r) => r.createdAt),
    now,
  });
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
  LOGIN_MAX_FAILS,
  GLOBAL_MAX_FAILS,
  LOGIN_LOCK_MS,
};
