'use strict';

/**
 * reconcile.js — Background payment reconciliation job
 *
 * Finds and corrects inconsistent payment/order/project states that can arise
 * from network failures, interrupted transactions, server restarts, or bugs.
 *
 * Checks performed on every run:
 *  1. Stuck "processing" payments   → roll back to pending_verification
 *  2. Expired pending_verification  → mark as failed + notify client
 *  3. Orphaned paid payments        → paid but project never created (alerts admin)
 *  4. Order/payment sync drift      → order says "paid" but payment says otherwise
 *  5. Abandoned orders              → pending > 7 days with no payment attempt
 *
 * In production (Vercel serverless) this runs:
 *   - On every cold-start via server.js
 *   - On demand via POST /api/payments/reconcile  (admin only)
 *
 * In development it also runs every 10 minutes via setInterval.
 */

const prisma = require('../lib/prisma');
const { logPaymentEvent, logAdminAction } = require('../lib/paymentAudit');
const { notify, notifyAdmins }            = require('../lib/notifications');
const { sendEmail, templates }            = require('../lib/email');

const STUCK_PROCESSING_MS  = 10 * 60 * 1000;   // 10 min
const ABANDONED_ORDER_MS   = 7  * 24 * 3600 * 1000; // 7 days

let _running = false;  // reentrant guard

// ─── Main reconciliation pass ────────────────────────────────────────────────

async function runReconciliation() {
  if (_running) {
    console.log('[reconcile] Already running — skipping concurrent call');
    return { skipped: true };
  }
  _running = true;
  const report = {
    startedAt:           new Date().toISOString(),
    stuckProcessing:     0,
    expiredPayments:     0,
    orphanedPaid:        0,
    orderSyncFixed:      0,
    abandonedOrders:     0,
    errors:              [],
  };

  try {
    await fixStuckProcessing(report);
    await expireStalePayments(report);
    await detectOrphanedPaid(report);
    await fixOrderPaymentSync(report);
    await detectAbandonedOrders(report);
  } catch (err) {
    report.errors.push({ step: 'top_level', error: err.message });
    console.error('[reconcile] Fatal error:', err.message);
  } finally {
    _running = false;
  }

  report.finishedAt = new Date().toISOString();
  console.log('[reconcile] Done —', JSON.stringify(report));
  return report;
}

// ─── 1. Stuck processing ─────────────────────────────────────────────────────
// A payment enters "processing" as an optimistic lock during approval.
// If the server crashed mid-approval the lock is never released.
// After STUCK_PROCESSING_MS we roll it back so the admin can retry.

async function fixStuckProcessing(report) {
  const cutoff = new Date(Date.now() - STUCK_PROCESSING_MS);
  try {
    const stuck = await prisma.payment.findMany({
      where:  { status: 'processing', updatedAt: { lte: cutoff } },
      select: { id: true, updatedAt: true },
    });

    for (const p of stuck) {
      try {
        const result = await prisma.payment.updateMany({
          where: { id: p.id, status: 'processing' },
          data:  { status: 'pending_verification' },
        });
        if (result.count > 0) {
          report.stuckProcessing++;
          await logPaymentEvent({
            paymentId: p.id,
            event:     'rolled_back',
            fromStatus: 'processing',
            toStatus:   'pending_verification',
            note:       `Auto-rollback by reconciler: stuck in "processing" since ${p.updatedAt.toISOString()}`,
          }).catch(() => {});
          console.warn(`[reconcile] Rolled back stuck payment: ${p.id}`);
        }
      } catch (err) {
        report.errors.push({ step: 'fixStuckProcessing', paymentId: p.id, error: err.message });
      }
    }
  } catch (err) {
    report.errors.push({ step: 'fixStuckProcessing', error: err.message });
  }
}

// ─── 2. Expire stale pending_verification payments ───────────────────────────
// After 72 h the admin has not acted. Mark failed, allow client to resubmit.

async function expireStalePayments(report) {
  try {
    const now     = new Date();
    const expired = await prisma.payment.findMany({
      where: {
        status:    'pending_verification',
        expiresAt: { lte: now },
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        order:  { select: { id: true, title: true } },
      },
    });

    for (const p of expired) {
      try {
        const result = await prisma.payment.updateMany({
          where: { id: p.id, status: 'pending_verification' },
          data:  {
            status:          'failed',
            rejectionReason: 'Payment verification timed out (72 h). Please resubmit.',
          },
        });
        if (result.count > 0) {
          report.expiredPayments++;

          await logPaymentEvent({
            paymentId: p.id,
            event:     'expired',
            fromStatus: 'pending_verification',
            toStatus:   'failed',
            note:       'Auto-expired by reconciler after 72 h without admin review',
          }).catch(() => {});

          // Notify client so they can resubmit
          notify(p.clientId, {
            type:    'payment_failed',
            title:   'Payment Verification Expired',
            message: `Your payment for "${p.order?.title || 'your order'}" expired before admin review. Please resubmit.`,
            link:    p.orderId ? `/checkout/${p.orderId}` : '/dashboard/client/orders',
          }).catch(() => {});

          if (p.client?.email) {
            sendEmail({
              to:      p.client.email,
              subject: 'Payment Verification Expired — Please Resubmit',
              html: `
                <p>Hi ${p.client.name},</p>
                <p>Your payment submission for <strong>${p.order?.title || 'your order'}</strong>
                   was not reviewed within 72 hours and has expired.</p>
                <p>Please return to your checkout page and resubmit your payment details.
                   We apologise for the delay.</p>
                <p>If you need help, contact us on WhatsApp.</p>
              `,
            }).catch(() => {});
          }

          console.warn(`[reconcile] Expired payment: ${p.id}`);
        }
      } catch (err) {
        report.errors.push({ step: 'expireStalePayments', paymentId: p.id, error: err.message });
      }
    }
  } catch (err) {
    report.errors.push({ step: 'expireStalePayments', error: err.message });
  }
}

// ─── 3. Detect orphaned paid payments ────────────────────────────────────────
// Payment is "paid" but the linked projectId is null — project was never created.
// This can happen if the transaction was interrupted after payment.update but
// before project.create. Flag it so the admin can manually create the project.

async function detectOrphanedPaid(report) {
  try {
    const orphans = await prisma.payment.findMany({
      where: {
        status:    'paid',
        projectId: null,
        orderId:   { not: null },
      },
      include: {
        order:  { select: { id: true, title: true, status: true } },
        client: { select: { id: true, name: true } },
      },
      take: 20,
    });

    for (const p of orphans) {
      report.orphanedPaid++;

      // Only alert if not already flagged
      if (!p.flaggedReason) {
        await prisma.payment.update({
          where: { id: p.id },
          data:  { flaggedReason: 'RECONCILER: paid but no project — requires manual project creation' },
        }).catch(() => {});

        await logPaymentEvent({
          paymentId: p.id,
          event:     'flagged',
          fromStatus: 'paid',
          toStatus:   'paid',
          note:       'Reconciler detected: payment marked paid but project was never created',
        }).catch(() => {});

        notifyAdmins({
          type:    'payment_received',
          title:   '⚠️ Orphaned Payment Detected',
          message: `Payment for "${p.order?.title}" is marked "paid" but no project exists. Manual intervention needed.`,
          link:    '/dashboard/admin/payments',
          metadata: { paymentId: p.id, orderId: p.orderId },
        }).catch(() => {});

        console.error(`[reconcile] ORPHANED PAID PAYMENT: ${p.id} (order: ${p.orderId})`);
      }
    }
  } catch (err) {
    report.errors.push({ step: 'detectOrphanedPaid', error: err.message });
  }
}

// ─── 4. Order/payment sync drift ─────────────────────────────────────────────
// An order is "paid" but all its payments are in non-paid states,
// or vice-versa. Detects split-brain between Order and Payment tables.

async function fixOrderPaymentSync(report) {
  try {
    // Orders marked "paid" with no paid Payment
    const paidOrdersNoPaidPayment = await prisma.order.findMany({
      where:   { status: 'paid' },
      include: { payments: { where: { status: 'paid' }, select: { id: true } } },
      take:    50,
    });

    for (const order of paidOrdersNoPaidPayment) {
      if (order.payments.length === 0) {
        report.orderSyncFixed++;
        await logAdminAction({
          adminId:    'system',
          action:     'reconcile',
          targetType: 'order',
          targetId:   order.id,
          before:     { status: 'paid', note: 'no paid payment found' },
          after:      null,
        }).catch(() => {});

        notifyAdmins({
          type:    'payment_received',
          title:   '⚠️ Order/Payment Sync Drift',
          message: `Order "${order.title}" is marked "paid" but has no confirmed payment record.`,
          link:    '/dashboard/admin/payments',
          metadata: { orderId: order.id },
        }).catch(() => {});

        console.error(`[reconcile] SYNC DRIFT: Order ${order.id} is paid but has no paid payment`);
      }
    }
  } catch (err) {
    report.errors.push({ step: 'fixOrderPaymentSync', error: err.message });
  }
}

// ─── 5. Abandoned orders ─────────────────────────────────────────────────────
// A "pending" order that was created > 7 days ago and has NO payment attempt at all.
// We notify the client once (check flaggedReason to avoid repeat spam).

async function detectAbandonedOrders(report) {
  try {
    const cutoff = new Date(Date.now() - ABANDONED_ORDER_MS);
    const abandoned = await prisma.order.findMany({
      where: {
        status:    'pending',
        createdAt: { lte: cutoff },
        payments:  { none: {} },  // no payment record of any kind
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
      take: 30,
    });

    for (const order of abandoned) {
      report.abandonedOrders++;

      // Notify client (once — tagged with a meta field in their notification)
      const alreadyNotified = await prisma.notification.findFirst({
        where: {
          userId:   order.clientId,
          type:     'status_update',
          metadata: { path: ['orderId'], equals: order.id },
        },
        select: { id: true },
      });

      if (!alreadyNotified) {
        notify(order.clientId, {
          type:    'status_update',
          title:   'Complete Your Order',
          message: `Your order "${order.title}" is waiting for payment. Click to continue checkout.`,
          link:    `/checkout/${order.id}`,
          metadata: { orderId: order.id, reason: 'abandoned_checkout' },
        }).catch(() => {});

        if (order.client?.email) {
          sendEmail({
            to:      order.client.email,
            subject: `Your Order is Waiting — "${order.title}"`,
            html: `
              <p>Hi ${order.client.name},</p>
              <p>You started an order for <strong>${order.title}</strong> but haven't completed payment yet.</p>
              <p>Your order is still saved and ready to go.</p>
              <p><a href="${process.env.FRONTEND_URL || 'https://mbndev.vercel.app'}/checkout/${order.id}"
                    style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:12px">
                Complete Your Order →
              </a></p>
              <p style="color:#888;font-size:12px;margin-top:24px">If you no longer want this order, you can cancel it from your dashboard.</p>
            `,
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    report.errors.push({ step: 'detectAbandonedOrders', error: err.message });
  }
}

// ─── Scheduler (dev only) ────────────────────────────────────────────────────

let _intervalHandle = null;

/**
 * Start a periodic reconciliation loop (10-minute interval).
 * Only called in non-production environments where a persistent process runs.
 */
function startReconcilerLoop() {
  if (process.env.NODE_ENV === 'production') return; // Vercel: use on-demand endpoint
  if (_intervalHandle) return;

  const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  // Run once immediately on startup, then every 10 min
  runReconciliation().catch(() => {});
  _intervalHandle = setInterval(() => {
    runReconciliation().catch((err) => {
      console.error('[reconcile] Periodic run error:', err.message);
    });
  }, INTERVAL_MS);

  console.log(`[reconcile] Periodic reconciler started (every ${INTERVAL_MS / 60_000} min)`);
}

function stopReconcilerLoop() {
  if (_intervalHandle) {
    clearInterval(_intervalHandle);
    _intervalHandle = null;
  }
}

module.exports = { runReconciliation, startReconcilerLoop, stopReconcilerLoop };
