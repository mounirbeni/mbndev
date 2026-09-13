'use strict';

/**
 * paymentGuardPure.js
 *
 * The state-machine and expiry logic from paymentGuard.js, split out with no
 * database dependency so it's unit-testable without a live Postgres
 * connection (lib/prisma.js throws at require-time if DATABASE_URL is unset).
 * paymentGuard.js re-exports all of this alongside the DB-backed
 * computeRiskScore().
 */

// ─── State machine ────────────────────────────────────────────────────────────
// Maps every legal status to the set of statuses it can move into.
// Any transition NOT listed here is an illegal state change and will throw 409.

const VALID_TRANSITIONS = {
  pending:              new Set(['pending_verification']),
  pending_verification: new Set(['processing', 'failed']),
  processing:           new Set(['paid', 'failed', 'pending_verification']), // internal lock state
  paid:                 new Set(['refunded']),
  failed:               new Set([]),   // terminal
  refunded:             new Set([]),   // terminal
};

/**
 * Throws a 409 error if the transition from → to is not in the state machine.
 */
function assertTransition(from, to) {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) {
    const err = new Error(`Unknown payment status "${from}"`);
    err.statusCode = 500;
    throw err;
  }
  if (!allowed.has(to)) {
    const err = new Error(`Illegal payment transition: ${from} → ${to}`);
    err.statusCode = 409;
    err.code = 'INVALID_TRANSITION';
    throw err;
  }
}

// ─── Expiry ───────────────────────────────────────────────────────────────────

/** pending_verification payments expire after 72 hours if admin takes no action. */
const PAYMENT_TTL_MS = 72 * 60 * 60 * 1000;

/** Returns a Date 72 h from now to store as expiresAt. */
function expiryDate() {
  return new Date(Date.now() + PAYMENT_TTL_MS);
}

/** Returns true if a payment's expiresAt is in the past. */
function isExpired(payment) {
  return payment.expiresAt && new Date(payment.expiresAt) < new Date();
}

/** Returns true if a risk score meets the threshold for high-risk alerting. */
function isHighRisk(score) { return score >= 80; }

/** Returns true if a risk score means the payment should be flagged for admin review. */
function isFlagged(score) { return score >= 60; }

module.exports = {
  VALID_TRANSITIONS,
  assertTransition,
  PAYMENT_TTL_MS,
  expiryDate,
  isExpired,
  isHighRisk,
  isFlagged,
};
