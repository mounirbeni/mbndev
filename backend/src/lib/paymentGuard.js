'use strict';

/**
 * paymentGuard.js
 *
 * State machine + fraud/risk engine for the payment system.
 *
 * Rules:
 *  - assertTransition()  → hard-blocks illegal state changes at the DB layer
 *  - computeRiskScore()  → returns { score 0-100, flags[] } at submission time
 *  - isExpired()         → true when a pending_verification payment passed expiresAt
 *  - PAYMENT_TTL_MS      → how long a pending_verification survives before auto-expiry
 */

const prisma = require('./prisma');
const {
  VALID_TRANSITIONS,
  assertTransition,
  PAYMENT_TTL_MS,
  expiryDate,
  isExpired,
  isHighRisk,
  isFlagged,
} = require('./paymentGuardPure');

// ─── Fraud / risk scoring ─────────────────────────────────────────────────────

/**
 * A set of externalRef values that are obviously fake.
 * Extended at runtime from env if FRAUD_BLOCKED_REFS is set (comma-separated).
 */
const BASE_FAKE_REFS = new Set([
  'test', 'abc', '123', '1234', '12345', 'demo', 'sample', 'fake',
  'none', 'null', 'n/a', 'na', 'xxx', 'aaa', '000', 'payment',
  'done', 'paid', 'sent', 'transfer', 'yes', 'ok',
]);

const FAKE_REFS = (() => {
  const extra = process.env.FRAUD_BLOCKED_REFS || '';
  const s = new Set(BASE_FAKE_REFS);
  extra.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean).forEach((r) => s.add(r));
  return s;
})();

/**
 * Compute a 0–100 risk score for a payment submission.
 *
 * score ≥ 60  → payment is auto-flagged; admin sees a warning badge.
 * score ≥ 80  → considered high-risk; admin gets an alert notification.
 *
 * Returns { score: number, flags: string[], flaggedReason: string|null }
 */
async function computeRiskScore({ clientId, orderId, externalRef, amount, method }) {
  let score = 0;
  const flags = [];

  // ── 1. No external reference submitted ──────────────────────────────────────
  if (!externalRef || !externalRef.trim()) {
    score += 20;
    flags.push('no_proof_submitted');
  } else {
    const ref = externalRef.trim().toLowerCase();

    // ── 2. Reference is too short to be real ─────────────────────────────────
    if (ref.length < 5) {
      score += 20;
      flags.push('ref_too_short');
    }

    // ── 3. Reference is an obviously fake value ───────────────────────────────
    if (FAKE_REFS.has(ref)) {
      score += 35;
      flags.push('obviously_fake_ref');
    }

    // ── 4. Duplicate reference — same ref used across any payment in 90 days ──
    // This catches clients re-submitting the same bank receipt for multiple orders.
    const [dupSameClient, dupOtherClient] = await Promise.all([
      // Same client, different order
      prisma.payment.findFirst({
        where: {
          clientId,
          externalRef: { equals: externalRef.trim(), mode: 'insensitive' },
          orderId:     { not: orderId },
          status:      { in: ['pending_verification', 'processing', 'paid'] },
          createdAt:   { gte: new Date(Date.now() - 90 * 24 * 3600_000) },
        },
        select: { id: true, orderId: true },
      }),
      // Different client entirely (cross-client ref reuse is a red flag)
      prisma.payment.findFirst({
        where: {
          clientId:    { not: clientId },
          externalRef: { equals: externalRef.trim(), mode: 'insensitive' },
          status:      { in: ['pending_verification', 'processing', 'paid'] },
          createdAt:   { gte: new Date(Date.now() - 90 * 24 * 3600_000) },
        },
        select: { id: true, clientId: true },
      }),
    ]);

    if (dupSameClient) {
      score += 50;
      flags.push('duplicate_ref_same_client');
    }
    if (dupOtherClient) {
      score += 70;
      flags.push('duplicate_ref_cross_client');
    }
  }

  // ── 5. Client already has other payments pending verification (for other orders)
  const otherPendingCount = await prisma.payment.count({
    where: {
      clientId,
      status:  'pending_verification',
      orderId: { not: orderId },
    },
  });
  if (otherPendingCount > 0) {
    score += 10 * Math.min(otherPendingCount, 3);
    flags.push('multiple_concurrent_submissions');
  }

  // ── 6. Client has had payments rejected in the last 14 days ──────────────────
  const recentRejections = await prisma.payment.count({
    where: {
      clientId,
      status:    'failed',
      updatedAt: { gte: new Date(Date.now() - 14 * 24 * 3600_000) },
    },
  });
  if (recentRejections >= 2) {
    score += 15 * Math.min(recentRejections, 3);
    flags.push('repeat_failed_submissions');
  }

  const finalScore = Math.min(score, 100);
  const flaggedReason = flags.length > 0
    ? `Risk flags: ${flags.join(', ')} (score ${finalScore}/100)`
    : null;

  return { score: finalScore, flags, flaggedReason };
}

module.exports = {
  assertTransition,
  VALID_TRANSITIONS,
  PAYMENT_TTL_MS,
  expiryDate,
  isExpired,
  computeRiskScore,
  isHighRisk,
  isFlagged,
};
