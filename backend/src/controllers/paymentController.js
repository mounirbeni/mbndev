const prisma = require('../lib/prisma');
const { Prisma } = require('@prisma/client');
const { fmt } = require('../lib/format');
const { notify, notifyAdmins, logActivity } = require('../lib/notifications');
const { SM } = require('../lib/systemMessages');
const { sendEmail, templates } = require('../lib/email');
const { wa } = require('../lib/whatsapp');

const IS_PROD = process.env.NODE_ENV === 'production';

const SERVICE_TYPE_LABELS = {
  website:   'Website',
  ecommerce: 'E-Commerce Store',
  dashboard: 'SaaS Dashboard',
  mobile:    'Mobile App',
  custom:    'Custom Project',
};

const METHOD_LABELS = {
  cih_bank:   'CIH Bank Transfer',
  paypal:     'PayPal',
  taptapsend: 'TapTapSend',
  mock:       'Mock Payment',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Auto-create a Project from a paid Order inside a transaction.
 * Caller MUST pass tx (Prisma transaction client).
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

// ─── Get single payment (invoice view) ───────────────────────────────────────

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

    // Strict access control: client can only see their own
    if (req.user.role !== 'admin' && payment.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, payment: fmt(payment) });
  } catch (err) {
    next(err);
  }
};

// ─── Get payments ────────────────────────────────────────────────────────────

exports.getPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: req.user.role === 'admin' ? {} : { clientId: req.user.id },
      include: {
        project: { select: { id: true, title: true } },
        order:   { select: { id: true, title: true, serviceType: true } },
        client:  { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, payments: fmt(payments) });
  } catch (err) {
    next(err);
  }
};

// ─── Submit manual payment ────────────────────────────────────────────────────
// TOCTOU protection: run duplicate-check + payment creation in a SERIALIZABLE
// transaction so concurrent submissions are serialised at the DB level.

exports.submitManualPayment = async (req, res, next) => {
  try {
    const { orderId, method, externalRef } = req.body;

    // ── 1. Load order with access control ──────────────────────────────────
    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { client: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: order.status === 'paid'
          ? 'This order has already been paid. Check your projects.'
          : 'This order is cancelled and cannot be paid.',
      });
    }

    // ── 2. Idempotency: check for an existing active submission ────────────
    // Wrap in SERIALIZABLE transaction so two simultaneous requests cannot
    // both pass the findFirst check before either creates the payment.
    let payment;
    try {
      payment = await prisma.$transaction(async (tx) => {
        const existing = await tx.payment.findFirst({
          where: { orderId, status: 'pending_verification' },
        });
        if (existing) {
          const err = new Error('Payment already submitted — awaiting admin verification.');
          err.statusCode = 409;
          throw err;
        }

        // Reject stale 'failed' payments for this order (don't count them as duplicate)
        // They remain in DB as audit trail — we just create a new submission.

        return await tx.payment.create({
          data: {
            clientId:    req.user.id,
            orderId:     order.id,
            amount:      order.totalPrice,   // always server-side amount
            description: `${METHOD_LABELS[method] || method} payment for: ${order.title}`,
            status:      'pending_verification',
            method,
            externalRef: externalRef ? String(externalRef).trim().slice(0, 200) : null,
          },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10_000,
      });
    } catch (txErr) {
      if (txErr.statusCode === 409) {
        return res.status(409).json({ success: false, message: txErr.message });
      }
      throw txErr;
    }

    // ── 3. Notifications (fire-and-forget) ─────────────────────────────────
    const label = METHOD_LABELS[method] || method;

    notifyAdmins({
      type:    'payment_received',
      title:   'Manual Payment Submitted',
      message: `${order.client.name} submitted a ${label} payment of $${order.totalPrice} for "${order.title}". Verify now.`,
      link:    `/dashboard/admin/payments`,
      metadata: { orderId: order.id, paymentId: payment.id, method },
    }).catch(() => {});

    notify(req.user.id, {
      type:    'payment_received',
      title:   'Payment Submitted',
      message: `Your ${label} payment for "${order.title}" is pending verification. We'll confirm within a few hours.`,
      link:    `/dashboard/client/orders`,
      metadata: { orderId: order.id },
    }).catch(() => {});

    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        ...templates.adminPaymentSubmitted({ order, client: order.client, method: label }),
      }).catch(() => {});
    }
    wa.paymentSubmitted({ client: order.client, order, method: label }).catch(() => {});

    res.json({ success: true, payment: fmt(payment) });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: approve a manual payment ─────────────────────────────────────────

exports.approveManualPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ── Optimistic lock: atomically move from pending_verification → processing ──
    // Only one concurrent admin request can win this UPDATE.
    const locked = await prisma.payment.updateMany({
      where: { id, status: 'pending_verification' },
      data:  { status: 'processing' },
    });

    if (locked.count === 0) {
      const existing = await prisma.payment.findUnique({
        where:  { id },
        select: { id: true, status: true },
      });
      if (!existing) return res.status(404).json({ success: false, message: 'Payment not found' });
      return res.status(409).json({
        success: false,
        message: `Payment is already "${existing.status}" — cannot approve again.`,
      });
    }

    // ── Reload with all relations ───────────────────────────────────────────
    const payment = await prisma.payment.findUnique({
      where:   { id },
      include: { order: true, client: true },
    });

    if (!payment.orderId || !payment.order || payment.order.status !== 'pending') {
      // Edge case: order already paid or no linked order — just mark paid
      await prisma.payment.update({
        where: { id },
        data:  { status: 'paid', paidAt: new Date() },
      });

      notify(payment.clientId, {
        type:    'payment_received',
        title:   'Payment Verified',
        message: 'Your payment has been verified by the admin.',
        link:    '/dashboard/client/orders',
      }).catch(() => {});

      return res.json({
        success: true,
        payment: fmt(await prisma.payment.findUnique({ where: { id } })),
        project: null,
      });
    }

    // ── Atomic: create project + mark order paid + mark payment paid ────────
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
      // Roll back intermediate 'processing' state so payment can be retried
      await prisma.payment.updateMany({
        where: { id, status: 'processing' },
        data:  { status: 'pending_verification' },
      }).catch((rollbackErr) => {
        // Critical: rollback failed — log for manual intervention
        console.error(JSON.stringify({
          level:     'error',
          event:     'payment_rollback_failed',
          paymentId: id,
          message:   rollbackErr.message,
        }));
      });
      throw txErr;
    }

    // ── Side-effects (all outside transaction — best-effort) ───────────────
    await logActivity(
      project.id,
      payment.clientId,
      'payment_received',
      `${METHOD_LABELS[payment.method] || 'Manual'} payment of $${payment.amount} verified. Project activated.`,
      { orderId: payment.orderId, amount: payment.amount, method: payment.method }
    ).catch(() => {});

    notify(payment.clientId, {
      type:    'project_created',
      title:   'Payment Verified — Project Active!',
      message: `Your payment for "${payment.order.title}" has been verified. Your project is now live!`,
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

    await sendEmail({
      to: payment.client.email,
      ...templates.paymentVerified({ client: payment.client, order: payment.order, project }),
    }).catch(() => {});

    await sendEmail({
      to: payment.client.email,
      ...templates.invoiceEmail({
        client:  payment.client,
        payment: { ...paidPayment, _id: id },
        order:   payment.order,
        project,
      }),
    }).catch(() => {});

    wa.paymentVerified({
      client:    payment.client,
      order:     payment.order,
      projectId: project.id,
    }).catch(() => {});

    res.json({
      success: true,
      payment: fmt(paidPayment),
      project: fmt(project),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Admin: reject a manual payment ──────────────────────────────────────────

exports.rejectManualPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;  // optional rejection reason from admin

    // ── Optimistic lock (same pattern as approve) ───────────────────────────
    const locked = await prisma.payment.updateMany({
      where: { id, status: 'pending_verification' },
      data:  {
        status:          'failed',
        rejectionReason: reason ? String(reason).trim().slice(0, 500) : null,
      },
    });

    if (locked.count === 0) {
      const existing = await prisma.payment.findUnique({
        where:  { id },
        select: { id: true, status: true },
      });
      if (!existing) return res.status(404).json({ success: false, message: 'Payment not found' });
      return res.status(409).json({
        success: false,
        message: `Payment is already "${existing.status}" — cannot reject.`,
      });
    }

    // Reload to get relations for notifications
    const payment = await prisma.payment.findUnique({
      where:   { id },
      include: { client: true, order: true },
    });

    const orderTitle = payment.order?.title || 'your order';
    const rejectionMsg = payment.rejectionReason
      ? `Reason: ${payment.rejectionReason}`
      : 'Please check the payment details and try again.';

    notify(payment.clientId, {
      type:    'payment_failed',
      title:   'Payment Not Confirmed',
      message: `Your payment for "${orderTitle}" could not be verified. ${rejectionMsg}`,
      link:    `/checkout/${payment.orderId}`,
      metadata: { orderId: payment.orderId, reason: payment.rejectionReason },
    }).catch(() => {});

    // Audit log — attach to project if it exists, otherwise skip
    if (payment.projectId) {
      await logActivity(
        payment.projectId,
        req.user.id,
        'status_change',
        `Payment rejected. Reason: ${payment.rejectionReason || 'Not specified'}`,
        { paymentId: id, amount: payment.amount }
      ).catch(() => {});
    }

    // Email client with clear reason
    if (payment.client?.email) {
      await sendEmail({
        to:      payment.client.email,
        subject: `Payment Not Confirmed — ${orderTitle}`,
        html:    `
          <p>Hi ${payment.client.name},</p>
          <p>We were unable to confirm your payment for <strong>${orderTitle}</strong>.</p>
          ${payment.rejectionReason ? `<p><strong>Reason:</strong> ${payment.rejectionReason}</p>` : ''}
          <p>Please return to your checkout page and resubmit with the correct details.</p>
          <p>If you need help, contact us on WhatsApp.</p>
        `,
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Payment rejected. Client has been notified.' });
  } catch (err) {
    next(err);
  }
};

// ─── Mock payment (ADMIN ONLY — disabled in production) ───────────────────────

exports.mockPayment = async (req, res, next) => {
  try {
    // Hard-block in production — this route must not create free projects
    if (IS_PROD) {
      return res.status(403).json({
        success: false,
        message: 'Mock payments are disabled in production.',
      });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Admin-only — even in dev, only admins should use this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order already paid or cancelled' });
    }

    const { project, payment } = await prisma.$transaction(async (tx) => {
      const p = await createProjectFromOrder(order, tx);
      const pay = await tx.payment.create({
        data: {
          clientId:    order.clientId,
          orderId:     order.id,
          projectId:   p.id,
          amount:      order.totalPrice,
          description: `Mock payment for: ${order.title}`,
          status:      'paid',
          method:      'mock',
          paidAt:      new Date(),
        },
      });
      return { project: p, payment: pay };
    });

    await logActivity(
      project.id,
      req.user.id,
      'payment_received',
      `Mock payment of $${order.totalPrice} received. Project created.`,
      { orderId: order.id }
    ).catch(() => {});

    notify(order.clientId, {
      type:    'project_created',
      title:   'Your project has been created!',
      message: `Payment confirmed. Project "${project.title}" is now active.`,
      link:    `/dashboard/client/projects/${project.id}`,
      metadata: { projectId: project.id },
    }).catch(() => {});

    notifyAdmins({
      type:    'payment_received',
      title:   'New Mock Payment',
      message: `$${order.totalPrice} received for "${order.title}". Project created.`,
      link:    `/dashboard/admin/projects/${project.id}`,
      metadata: { projectId: project.id, amount: order.totalPrice },
    }).catch(() => {});

    res.json({ success: true, payment: fmt(payment), project: fmt(project) });
  } catch (err) {
    next(err);
  }
};
