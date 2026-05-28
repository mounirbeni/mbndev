'use strict';

/**
 * paymentAudit.js
 *
 * Immutable append-only helpers for the payment event log and admin audit log.
 * Never updates or deletes rows — only inserts.
 *
 * PaymentEvent  → one row per state transition, accessible by payment ID.
 * AdminAuditLog → one row per sensitive admin action (approve, reject, delete…).
 */

const prisma = require('./prisma');

// ─── PaymentEvent ─────────────────────────────────────────────────────────────

/**
 * Record an immutable payment lifecycle event.
 *
 * @param {{
 *   paymentId:  string,
 *   actorId?:   string|null,   // null = system / automated
 *   actorRole?: string,        // 'admin' | 'client' | 'system'
 *   event:      string,        // created | submitted | approved | rejected | expired | rolled_back | flagged
 *   fromStatus?: string|null,
 *   toStatus:   string,
 *   note?:      string|null,
 *   metadata?:  object|null,
 *   ip?:        string|null,
 * }} params
 */
async function logPaymentEvent(params) {
  const {
    paymentId,
    actorId    = null,
    actorRole  = 'system',
    event,
    fromStatus = null,
    toStatus,
    note       = null,
    metadata   = null,
    ip         = null,
  } = params;

  try {
    return await prisma.paymentEvent.create({
      data: { paymentId, actorId, actorRole, event, fromStatus, toStatus, note, metadata, ip },
    });
  } catch (err) {
    // Audit logging must never break the main flow — only log to stderr
    console.error(JSON.stringify({
      level: 'error',
      source: 'paymentAudit.logPaymentEvent',
      paymentId,
      event,
      error: err.message,
    }));
  }
}

/**
 * Get the full event trail for a payment, newest-last.
 */
async function getPaymentEvents(paymentId) {
  return prisma.paymentEvent.findMany({
    where:   { paymentId },
    orderBy: { createdAt: 'asc' },
  });
}

// ─── AdminAuditLog ────────────────────────────────────────────────────────────

/**
 * Record a sensitive admin action with before/after snapshots.
 *
 * @param {{
 *   adminId:     string,
 *   action:      string,  // approve_payment | reject_payment | delete_client | …
 *   targetType:  string,  // 'payment' | 'order' | 'project' | 'user'
 *   targetId:    string,
 *   before?:     object|null,
 *   after?:      object|null,
 *   ip?:         string|null,
 *   userAgent?:  string|null,
 * }} params
 */
async function logAdminAction(params) {
  const {
    adminId,
    action,
    targetType,
    targetId,
    before    = null,
    after     = null,
    ip        = null,
    userAgent = null,
  } = params;

  try {
    return await prisma.adminAuditLog.create({
      data: { adminId, action, targetType, targetId, before, after, ip, userAgent },
    });
  } catch (err) {
    console.error(JSON.stringify({
      level: 'error',
      source: 'paymentAudit.logAdminAction',
      adminId,
      action,
      targetId,
      error: err.message,
    }));
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract a usable client IP from an Express request object.
 * Respects X-Forwarded-For (Vercel/proxies).
 */
function getClientIp(req) {
  if (!req) return null;
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || null;
}

module.exports = { logPaymentEvent, getPaymentEvents, logAdminAction, getClientIp };
