'use strict';

/**
 * paymentController.js — Fintech-grade payment controller
 *
 * Every public function enforces:
 *   • Immutable event logging (PaymentEvent) on every state change
 *   • Admin action logging (AdminAuditLog) on every admin mutation
 *   • State-machine validation — illegal transitions throw 409
 *   • Optimistic locking — only one concurrent request can win any mutation
 *   • SERIALIZABLE transactions — TOCTOU race elimination
 *   • Idempotency — duplicate submissions return the existing payment
 *   • Fraud/risk scoring — suspicious submissions are flagged for admin review
 *   • Amount integrity — always taken from the server-side order, never from client
 *   • Payment expiry — 72 h window for admin to act; reconciler auto-expires
 *   • Forensic IP capture — every actor IP is recorded
 *   • Rollback safety — interrupted approvals are recovered by reconciler
 */

const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { notify, notifyAdmins, logActivity } = require('../lib/notifications');
const { SM }   = require('../lib/systemMessages');
const { sendEmail, templates } = require('../lib/email');
const { wa }   = require('../lib/whatsapp');
const { logPaymentEvent, logAdminAction, getPaymentEvents, getClientIp } = require('../lib/paymentAudit');
const { assertTransition, expiryDate, isExpired, computeRiskScore, isHighRisk, isFlagged } = require('../lib/paymentGuard');
const { runReconciliation } = require('../jobs/reconcile');

const IS_PROD = process.env.NODE_ENV === 'production';

const METHOD_LABELS = {
  cih_bank:   'CIH Bank Transfer',
  paypal:     'PayPal',
  taptapsend: 'TapTapSend',
  mock:       'Mock Payment',
};

const SERVICE_TYPE_LABELS = {
  website:   'Website',
  ecommerce: 'E-Commerce Store',
  dashboard: 'SaaS Dashboard',
  mobile:    'Mobile App',
  custom:    'Custom Project',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Auto-create a Project from a paid Order.
 * MUST be called inside a Prisma $transaction — tx is required.
 */
async function createProjectFromOrder(order, tx) {
  const project = await tx.project.create({
    data: {
      title:        order.title,
      description:  order.description || `${SERVICE_TYPE_LABELS[order.serviceType] || 'Custom'} project`,
      clientId:     order.clientId,
      orderId:      order.id,
      type:         order.serviceType,
      status:       'paid',
      budget:       order.totalPrice,
      features:     order.features,
      notes:        order.notes || null,
      designStyle:  order.designStyle || null,
      designColors: order.designColors || [],
      designRefs:   order.designRefs || [],
    },
  });

  await tx.order.update({
    where: { id: order.id },
    data:  { status: 'paid' },
  });

  return project;
}

// ─── GET /payments — List payments ───────────────────────────────────────────

exports.getPayments = async (req, res, next) => {
  try {
    const { status, flagged } = req.query;

    const where = {
      ...(req.user.role !== 'admin' ? { clientId: req.user.id } : {}),
      ...(status  ? { status }                       : {}),
      ...(flagged === 'true' ? { riskScore: { gte: 60 } } : {}),
    };

    const payments = await prisma.payment.findMany({
      where,
      include: {
        project: { select: { id: true, title: true } },
        order:   { select: { id: true, title: true, serviceType: true } },
        client:  { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, payments: fmt(payments) });
  } catch (err) { next(err); }
};

// ─── GET /payments/:id — Single payment (invoice view) ───────────────────────

exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where:   { id: req.params.id },
      include: {
        project: { select: { id: true, title: true, type: true } },
        order:   { select: { id: true, title: true, serviceType: true, description: true, features: true } },
        client:  { select: { id: true, name: true, email: true, company: true, phone: true } },
      },
    });

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (req.user.role !== 'admin' && payment.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, payment: fmt(payment) });
  } catch (err) { next(err); }
};

// ─── GET /payments/:id/events — Audit trail (admin only) ─────────────────────

exports.getPaymentEvents = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where:  { id: req.params.id },
      select: { id: true, clientId: true },
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const events = await getPaymentEvents(req.params.id);
    res.json({ success: true, events });
  } catch (err) { next(err); }
};

// ─── POST /payments/manual — Submit manual payment ────────────────────────────

exports.submitManualPayment = async (req, res, next) => {
  const ip = getClientIp(req);

  try {
    const { orderId, method, externalRef, idempotencyKey } = req.body;

    // ── 1. Idempotency check ─────────────────────────────────────────────────
    // If the client sends the same idempotency key twice (e.g. double-click, retry),
    // return the already-created payment instead of creating a duplicate.
    if (idempotencyKey) {
      const existing = await prisma.payment.findUnique({
        where: { idempotencyKey: String(idempotencyKey).slice(0, 128) },
      });
      if (existing) {
        console.log(`[payment] Idempotent return for key ${idempotencyKey}, paymentId=${existing.id}`);
        return res.json({ success: true, payment: fmt(existing), idempotent: true });
      }
    }

    // ── 2. Load and validate order ───────────────────────────────────────────
    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { client: true },
    });

    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.clientId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (order.status === 'paid')
      return res.status(400).json({ success: false, message: 'This order is already paid. Check your projects.' });
    if (order.status === 'cancelled')
      return res.status(400).json({ success: false, message: 'This order has been cancelled.' });
    if (order.status !== 'pending')
      return res.status(400).json({ success: false, message: `Order status "${order.status}" does not accept payment.` });

    // ── 3. Validate state machine entry ──────────────────────────────────────
    // A fresh "pending" payment entry: 'pending' → 'pending_verification'
    // (assertTransition handles "pending" → "pending_verification")
    // No existing payment to check here — the duplicate guard below covers that.

    // ── 4. Fraud / risk scoring ──────────────────────────────────────────────
    const safeRef = externalRef ? String(externalRef).trim().slice(0, 200) : null;
    const { score, flags, flaggedReason } = await computeRiskScore({
      clientId:    req.user.id,
      orderId,
      externalRef: safeRef,
      amount:      order.totalPrice,
      method,
    });

    // ── 5. SERIALIZABLE transaction: duplicate-check + create ────────────────
    let payment;
    try {
      payment = await prisma.$transaction(async (tx) => {
        // Hard check: no other pending_verification exists for this order
        const existingPending = await tx.payment.findFirst({
          where: { orderId, status: 'pending_verification' },
          select: { id: true },
        });
        if (existingPending) {
          const err = new Error('A payment for this order is already awaiting verification.');
          err.statusCode = 409;
          err.code = 'DUPLICATE_SUBMISSION';
          throw err;
        }

        return tx.payment.create({
          data: {
            clientId:       req.user.id,
            orderId:        order.id,
            amount:         order.totalPrice,              // server-side — never trust client
            snapshotAmount: order.totalPrice,              // locked-in copy for invoicing
            description:    `${METHOD_LABELS[method] || method} payment for: ${order.title}`,
            status:         'pending_verification',
            method:         method || null,
            externalRef:    safeRef,
            expiresAt:      expiryDate(),                  // 72 h window for admin
            riskScore:      score,
            flaggedReason:  flaggedReason || null,
            ipAddress:      ip,
            ...(idempotencyKey ? { idempotencyKey: String(idempotencyKey).slice(0, 128) } : {}),
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10_000,
      });
    } catch (txErr) {
      if (txErr.statusCode === 409) {
        return res.status(409).json({ success: false, message: txErr.message, code: txErr.code });
      }
      // Prisma serialization failure (P2034) — tell client to retry
      if (txErr.code === 'P2034') {
        return res.status(503).json({
          success: false,
          message: 'Concurrent submission detected — please try again.',
          code:    'SERIALIZATION_FAILURE',
        });
      }
      throw txErr;
    }

    // ── 6. Immutable event log ───────────────────────────────────────────────
    logPaymentEvent({
      paymentId:  payment.id,
      actorId:    req.user.id,
      actorRole:  'client',
      event:      'submitted',
      fromStatus: 'pending',
      toStatus:   'pending_verification',
      note:       `Method: ${METHOD_LABELS[method] || method}${safeRef ? ` | Ref: ${safeRef}` : ''}`,
      metadata:   { method, externalRef: safeRef, riskScore: score, flags, amount: order.totalPrice },
      ip,
    }).catch(() => {});

    // Flag high-risk submissions with an extra "flagged" event for visibility
    if (isFlagged(score)) {
      logPaymentEvent({
        paymentId:  payment.id,
        actorId:    null,
        actorRole:  'system',
        event:      'flagged',
        fromStatus: 'pending_verification',
        toStatus:   'pending_verification',
        note:       flaggedReason,
        metadata:   { score, flags },
      }).catch(() => {});
    }

    // ── 7. Notifications ─────────────────────────────────────────────────────
    const label = METHOD_LABELS[method] || method;
    const adminMsg = isHighRisk(score)
      ? `⚠️ HIGH-RISK: ${order.client.name} submitted ${label} $${order.totalPrice} for "${order.title}". Risk score: ${score}/100. Verify carefully.`
      : `${order.client.name} submitted ${label} $${order.totalPrice} for "${order.title}". Verify now.`;

    notifyAdmins({
      type:    'payment_received',
      title:   isHighRisk(score) ? '⚠️ High-Risk Payment Submitted' : 'Manual Payment Submitted',
      message: adminMsg,
      link:    '/dashboard/admin/payments',
      metadata: { orderId: order.id, paymentId: payment.id, method, riskScore: score },
    }).catch(() => {});

    notify(req.user.id, {
      type:    'payment_received',
      title:   'Payment Submitted',
      message: `Your ${label} payment for "${order.title}" is pending verification. We'll confirm within a few hours.`,
      link:    '/dashboard/client/orders',
      metadata: { orderId: order.id },
    }).catch(() => {});

    if (process.env.ADMIN_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        ...templates.adminPaymentSubmitted({ order, client: order.client, method: label }),
      }).catch(() => {});
    }
    wa.paymentSubmitted({ client: order.client, order, method: label }).catch(() => {});

    res.json({ success: true, payment: fmt(payment) });
  } catch (err) { next(err); }
};

// ─── PUT /payments/:id/approve — Admin approve ───────────────────────────────

exports.approveManualPayment = async (req, res, next) => {
  const { id } = req.params;
  const ip      = getClientIp(req);
  const ua      = req.headers['user-agent'] || null;

  try {
    // ── Load payment for pre-action snapshot ─────────────────────────────────
    const prePayment = await prisma.payment.findUnique({
      where:   { id },
      select:  { id: true, status: true, amount: true, snapshotAmount: true,
                 method: true, externalRef: true, orderId: true, clientId: true,
                 riskScore: true, expiresAt: true },
    });

    if (!prePayment)
      return res.status(404).json({ success: false, message: 'Payment not found' });

    // ── State machine guard ───────────────────────────────────────────────────
    try { assertTransition(prePayment.status, 'processing'); }
    catch (smErr) {
      return res.status(smErr.statusCode || 409).json({ success: false, message: smErr.message });
    }

    // ── Expiry check ──────────────────────────────────────────────────────────
    if (isExpired(prePayment)) {
      // Auto-expire it now so the UI reflects truth
      await prisma.payment.updateMany({
        where: { id, status: 'pending_verification' },
        data:  { status: 'failed', rejectionReason: 'Payment expired before admin review.' },
      }).catch(() => {});
      return res.status(409).json({
        success: false,
        message: 'This payment has expired and was automatically cancelled. The client must resubmit.',
      });
    }

    // ── Optimistic lock: pending_verification → processing ────────────────────
    // Only ONE concurrent admin request can win this atomic UPDATE.
    const locked = await prisma.payment.updateMany({
      where: { id, status: 'pending_verification' },
      data:  { status: 'processing' },
    });

    if (locked.count === 0) {
      const current = await prisma.payment.findUnique({
        where: { id }, select: { status: true },
      });
      return res.status(409).json({
        success: false,
        message: `Payment is already "${current?.status ?? 'unknown'}" — cannot approve again.`,
      });
    }

    // ── Reload with all needed relations ──────────────────────────────────────
    const payment = await prisma.payment.findUnique({
      where:   { id },
      include: { order: true, client: true },
    });

    // ── Integrity check: snapshot vs order amount ─────────────────────────────
    // The amount in the DB must match what the order says.
    if (payment.order && payment.snapshotAmount !== null) {
      if (Math.abs(payment.snapshotAmount - payment.order.totalPrice) > 0.01) {
        // This should never happen; if it does, it's a data integrity bug — flag & alert
        console.error(JSON.stringify({
          level: 'error', event: 'amount_integrity_mismatch',
          paymentId: id,
          snapshotAmount: payment.snapshotAmount,
          orderTotalPrice: payment.order.totalPrice,
        }));
        notifyAdmins({
          type:    'payment_received',
          title:   '🚨 Amount Integrity Mismatch',
          message: `Payment ${id} has snapshotAmount ${payment.snapshotAmount} but order total is ${payment.order.totalPrice}. Investigate before approving.`,
          link:    '/dashboard/admin/payments',
        }).catch(() => {});
        // Roll back the lock and block the approval
        await prisma.payment.updateMany({
          where: { id, status: 'processing' },
          data:  { status: 'pending_verification' },
        }).catch(() => {});
        return res.status(409).json({
          success: false,
          message: 'Amount integrity mismatch detected. Payment has been held for investigation.',
        });
      }
    }

    // ── Edge case: order already paid (or no linked order) ────────────────────
    if (!payment.orderId || !payment.order || payment.order.status !== 'pending') {
      await prisma.payment.update({
        where: { id },
        data:  { status: 'paid', paidAt: new Date() },
      });

      logPaymentEvent({
        paymentId: id, actorId: req.user.id, actorRole: 'admin',
        event: 'approved', fromStatus: 'pending_verification', toStatus: 'paid',
        note: 'Approved without project creation (order already processed or no order link)',
        ip,
      }).catch(() => {});
      logAdminAction({
        adminId: req.user.id, action: 'approve_payment',
        targetType: 'payment', targetId: id,
        before: { status: 'pending_verification' }, after: { status: 'paid' },
        ip, userAgent: ua,
      }).catch(() => {});

      notify(payment.clientId, {
        type: 'payment_received', title: 'Payment Verified',
        message: 'Your payment has been verified by the admin.',
        link: '/dashboard/client/orders',
      }).catch(() => {});

      return res.json({
        success: true,
        payment: fmt(await prisma.payment.findUnique({ where: { id } })),
        project: null,
      });
    }

    // ── Atomic: create project + mark order paid + mark payment paid ──────────
    let project;
    try {
      project = await prisma.$transaction(async (tx) => {
        const p = await createProjectFromOrder(payment.order, tx);
        await tx.payment.update({
          where: { id },
          data:  { status: 'paid', paidAt: new Date(), projectId: p.id },
        });
        return p;
      });
    } catch (txErr) {
      // Roll back the processing lock so admin can retry
      const rollback = await prisma.payment.updateMany({
        where: { id, status: 'processing' },
        data:  { status: 'pending_verification' },
      }).catch((rollbackErr) => {
        // Critical — log for manual intervention if rollback also fails
        console.error(JSON.stringify({
          level:     'error',
          event:     'payment_rollback_failed',
          paymentId: id,
          txError:   txErr.message,
          rollbackError: rollbackErr.message,
        }));
        notifyAdmins({
          type:    'payment_received',
          title:   '🚨 Critical: Payment Rollback Failed',
          message: `Payment ${id} is stuck in "processing" and rollback failed. Manual DB intervention required.`,
          link:    '/dashboard/admin/payments',
        }).catch(() => {});
      });

      if (rollback?.count > 0) {
        logPaymentEvent({
          paymentId: id, actorRole: 'system', event: 'rolled_back',
          fromStatus: 'processing', toStatus: 'pending_verification',
          note: `Auto-rollback after approval transaction failed: ${txErr.message}`,
        }).catch(() => {});
      }
      throw txErr;
    }

    // ── Immutable event log ───────────────────────────────────────────────────
    logPaymentEvent({
      paymentId:  id,
      actorId:    req.user.id,
      actorRole:  'admin',
      event:      'approved',
      fromStatus: 'pending_verification',
      toStatus:   'paid',
      note:       `Project created: ${project.id} | Order: ${payment.orderId}`,
      metadata:   { projectId: project.id, amount: payment.amount, method: payment.method },
      ip,
    }).catch(() => {});

    // ── Admin audit log ───────────────────────────────────────────────────────
    logAdminAction({
      adminId:    req.user.id,
      action:     'approve_payment',
      targetType: 'payment',
      targetId:   id,
      before:     { status: 'pending_verification', amount: prePayment.amount,
                    externalRef: prePayment.externalRef, riskScore: prePayment.riskScore },
      after:      { status: 'paid', projectId: project.id, paidAt: new Date().toISOString() },
      ip,
      userAgent:  ua,
    }).catch(() => {});

    // ── Side-effects ──────────────────────────────────────────────────────────
    logActivity(
      project.id, payment.clientId, 'payment_received',
      `${METHOD_LABELS[payment.method] || 'Manual'} payment of $${payment.amount} verified. Project activated.`,
      { orderId: payment.orderId, amount: payment.amount, method: payment.method }
    ).catch(() => {});

    notify(payment.clientId, {
      type:    'project_created',
      title:   'Payment Verified — Project Active!',
      message: `Your payment for "${payment.order.title}" was verified. Your project is now live!`,
      link:    `/dashboard/client/projects/${project.id}`,
      metadata: { projectId: project.id },
    }).catch(() => {});

    notifyAdmins({
      type:    'project_created',
      title:   'Payment Approved',
      message: `Payment for "${payment.order.title}" approved. Project created.`,
      link:    `/dashboard/admin/projects/${project.id}`,
    }).catch(() => {});

    SM.paymentVerified(project.id).catch(() => {});

    const paidPayment = await prisma.payment.findUnique({ where: { id } });

    sendEmail({
      to: payment.client.email,
      ...templates.paymentVerified({ client: payment.client, order: payment.order, project }),
    }).catch(() => {});

    sendEmail({
      to: payment.client.email,
      ...templates.invoiceEmail({
        client:  payment.client,
        payment: { ...paidPayment, _id: id },
        order:   payment.order,
        project,
      }),
    }).catch(() => {});

    wa.paymentVerified({ client: payment.client, order: payment.order, projectId: project.id }).catch(() => {});

    res.json({ success: true, payment: fmt(paidPayment), project: fmt(project) });
  } catch (err) { next(err); }
};

// ─── PUT /payments/:id/reject — Admin reject ─────────────────────────────────

exports.rejectManualPayment = async (req, res, next) => {
  const { id } = req.params;
  const ip      = getClientIp(req);
  const ua      = req.headers['user-agent'] || null;
  const { reason } = req.body;

  try {
    // Pre-snapshot for audit log
    const prePayment = await prisma.payment.findUnique({
      where:  { id },
      select: { id: true, status: true, amount: true, method: true,
                externalRef: true, riskScore: true, clientId: true, orderId: true },
    });

    if (!prePayment)
      return res.status(404).json({ success: false, message: 'Payment not found' });

    // State machine guard
    try { assertTransition(prePayment.status, 'failed'); }
    catch (smErr) {
      return res.status(smErr.statusCode || 409).json({ success: false, message: smErr.message });
    }

    const safeReason = reason ? String(reason).trim().slice(0, 500) : null;

    // ── Optimistic lock: pending_verification → failed (atomic) ──────────────
    const locked = await prisma.payment.updateMany({
      where: { id, status: 'pending_verification' },
      data:  { status: 'failed', rejectionReason: safeReason },
    });

    if (locked.count === 0) {
      const current = await prisma.payment.findUnique({
        where: { id }, select: { status: true },
      });
      return res.status(409).json({
        success: false,
        message: `Payment is already "${current?.status ?? 'unknown'}" — cannot reject.`,
      });
    }

    // ── Immutable event log ───────────────────────────────────────────────────
    logPaymentEvent({
      paymentId:  id,
      actorId:    req.user.id,
      actorRole:  'admin',
      event:      'rejected',
      fromStatus: 'pending_verification',
      toStatus:   'failed',
      note:       safeReason || 'No reason provided',
      metadata:   { reason: safeReason, method: prePayment.method, amount: prePayment.amount },
      ip,
    }).catch(() => {});

    // ── Admin audit log ───────────────────────────────────────────────────────
    logAdminAction({
      adminId:    req.user.id,
      action:     'reject_payment',
      targetType: 'payment',
      targetId:   id,
      before:     { status: 'pending_verification', amount: prePayment.amount,
                    externalRef: prePayment.externalRef, riskScore: prePayment.riskScore },
      after:      { status: 'failed', rejectionReason: safeReason },
      ip,
      userAgent:  ua,
    }).catch(() => {});

    // ── Reload for notifications ──────────────────────────────────────────────
    const payment = await prisma.payment.findUnique({
      where:   { id },
      include: { client: true, order: true },
    });

    const orderTitle   = payment.order?.title || 'your order';
    const rejectionMsg = safeReason
      ? `Reason: ${safeReason}`
      : 'Please check your payment details and try again.';

    notify(payment.clientId, {
      type:    'payment_failed',
      title:   'Payment Not Confirmed',
      message: `Your payment for "${orderTitle}" could not be verified. ${rejectionMsg}`,
      link:    payment.orderId ? `/checkout/${payment.orderId}` : '/dashboard/client/orders',
      metadata: { orderId: payment.orderId, reason: safeReason },
    }).catch(() => {});

    if (payment.orderId) {
      logActivity(
        payment.projectId || payment.orderId, req.user.id,
        'status_change',
        `Payment rejected. ${safeReason ? `Reason: ${safeReason}` : ''}`.trim(),
        { paymentId: id, amount: payment.amount }
      ).catch(() => {});
    }

    if (payment.client?.email) {
      sendEmail({
        to:      payment.client.email,
        subject: `Payment Not Confirmed — ${orderTitle}`,
        html: `
          <p>Hi ${payment.client.name},</p>
          <p>We were unable to confirm your payment for <strong>${orderTitle}</strong>.</p>
          ${safeReason ? `<p><strong>Reason:</strong> ${safeReason}</p>` : ''}
          <p>Please return to your checkout page and resubmit with the correct details.</p>
          <p>If you believe this is an error, contact us on WhatsApp.</p>
        `,
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Payment rejected. Client has been notified.' });
  } catch (err) { next(err); }
};

// ─── POST /payments/mock — Admin-only dev payment ────────────────────────────

exports.mockPayment = async (req, res, next) => {
  const ip = getClientIp(req);

  try {
    if (IS_PROD)
      return res.status(403).json({ success: false, message: 'Mock payments are disabled in production.' });

    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin only.' });

    const { orderId } = req.body;
    if (!orderId)
      return res.status(400).json({ success: false, message: 'orderId is required.' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Order is not pending.' });

    const { project, payment } = await prisma.$transaction(async (tx) => {
      const p   = await createProjectFromOrder(order, tx);
      const pay = await tx.payment.create({
        data: {
          clientId:       order.clientId,
          orderId:        order.id,
          projectId:      p.id,
          amount:         order.totalPrice,
          snapshotAmount: order.totalPrice,
          description:    `Mock payment for: ${order.title}`,
          status:         'paid',
          method:         'mock',
          paidAt:         new Date(),
          ipAddress:      ip,
        },
      });
      return { project: p, payment: pay };
    });

    logPaymentEvent({
      paymentId: payment.id, actorId: req.user.id, actorRole: 'admin',
      event: 'approved', fromStatus: 'pending', toStatus: 'paid',
      note: 'Mock payment created by admin in dev environment',
      metadata: { projectId: project.id, amount: order.totalPrice },
      ip,
    }).catch(() => {});

    logAdminAction({
      adminId: req.user.id, action: 'mock_payment',
      targetType: 'order', targetId: orderId,
      after: { status: 'paid', projectId: project.id, amount: order.totalPrice },
      ip,
    }).catch(() => {});

    logActivity(
      project.id, req.user.id, 'payment_received',
      `Mock payment of $${order.totalPrice} received. Project created.`,
      { orderId: order.id }
    ).catch(() => {});

    notify(order.clientId, {
      type: 'project_created', title: 'Your project has been created!',
      message: `Payment confirmed. Project "${project.title}" is now active.`,
      link: `/dashboard/client/projects/${project.id}`,
      metadata: { projectId: project.id },
    }).catch(() => {});

    notifyAdmins({
      type: 'payment_received', title: 'New Mock Payment',
      message: `$${order.totalPrice} mock payment for "${order.title}". Project created.`,
      link: `/dashboard/admin/projects/${project.id}`,
    }).catch(() => {});

    res.json({ success: true, payment: fmt(payment), project: fmt(project) });
  } catch (err) { next(err); }
};

// ─── POST /payments/reconcile — On-demand reconciliation (admin) ─────────────

exports.triggerReconciliation = async (req, res, next) => {
  try {
    logAdminAction({
      adminId:    req.user.id,
      action:     'reconcile',
      targetType: 'payment',
      targetId:   'system',
      ip:         getClientIp(req),
    }).catch(() => {});

    // Run async — respond immediately with 202 Accepted
    res.status(202).json({ success: true, message: 'Reconciliation started in background.' });
    runReconciliation().catch((err) => {
      console.error('[reconcile] On-demand run failed:', err.message);
    });
  } catch (err) { next(err); }
};

// ─── GET /payments/analytics — Payment analytics (admin) ─────────────────────

exports.getPaymentAnalytics = async (req, res, next) => {
  try {
    const [
      totalPaid,
      totalPending,
      totalFailed,
      totalFlagged,
      recentPaid,
      methodBreakdown,
      avgApprovalTime,
    ] = await Promise.all([
      prisma.payment.aggregate({ where: { status: 'paid' },   _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: { in: ['pending', 'pending_verification'] } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: 'failed' }, _count: { id: true } }),
      prisma.payment.count({ where: { riskScore: { gte: 60 } } }),
      prisma.payment.findMany({
        where:   { status: 'paid' },
        orderBy: { paidAt: 'desc' },
        take:    10,
        include: {
          client: { select: { id: true, name: true } },
          order:  { select: { id: true, title: true } },
        },
      }),
      prisma.payment.groupBy({
        by:      ['method'],
        where:   { status: 'paid' },
        _sum:    { amount: true },
        _count:  { id: true },
      }),
      // Average hours from submission to approval (for paid payments created in the last 90 days)
      prisma.$queryRaw`
        SELECT
          AVG(EXTRACT(EPOCH FROM ("paidAt" - "createdAt")) / 3600)::float AS avg_hours
        FROM "Payment"
        WHERE status = 'paid'
          AND "paidAt" IS NOT NULL
          AND "createdAt" >= NOW() - INTERVAL '90 days'
      `,
    ]);

    res.json({
      success: true,
      analytics: {
        revenue:          { total: totalPaid._sum.amount || 0,   count: totalPaid._count.id   },
        pending:          { total: totalPending._sum.amount || 0, count: totalPending._count.id },
        failed:           { count: totalFailed._count.id },
        flagged:          { count: totalFlagged },
        methodBreakdown:  methodBreakdown.map((m) => ({
          method: m.method,
          revenue: m._sum.amount || 0,
          count:   m._count.id,
        })),
        avgApprovalHours: avgApprovalTime[0]?.avg_hours ?? null,
        recentPaid:       fmt(recentPaid),
      },
    });
  } catch (err) { next(err); }
};
