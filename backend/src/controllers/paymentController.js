const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { notify, notifyAdmins, logActivity } = require('../lib/notifications');
const { SM } = require('../lib/systemMessages');
const { sendEmail, templates } = require('../lib/email');

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

/** Auto-create a Project from a paid Order. Atomic via $transaction. */
async function createProjectFromOrder(order, tx = prisma) {
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

// ─── Submit manual payment (CIH Bank / PayPal / TapTapSend) ─────────────────

exports.submitManualPayment = async (req, res, next) => {
  try {
    const { orderId, method, externalRef } = req.body;

    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { client: true },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order is not pending' });
    }

    // Prevent duplicate submission
    const existing = await prisma.payment.findFirst({
      where: { orderId, status: 'pending_verification' },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Payment already submitted — awaiting verification' });
    }

    const label = METHOD_LABELS[method] || method;

    const payment = await prisma.payment.create({
      data: {
        clientId:    req.user.id,
        orderId:     order.id,
        amount:      order.totalPrice,
        description: `${label} payment for: ${order.title}`,
        status:      'pending_verification',
        method,
        externalRef: externalRef ? String(externalRef).slice(0, 200) : null,
      },
    });

    // Notify admins (in-app)
    notifyAdmins({
      type:    'payment_received',
      title:   'Manual Payment Submitted',
      message: `${order.client.name} submitted a ${label} payment of $${order.totalPrice} for "${order.title}". Please verify.`,
      link:    `/dashboard/admin/payments`,
      metadata: { orderId: order.id, paymentId: payment.id, method },
    }).catch(() => {});

    // Notify client (in-app)
    notify(req.user.id, {
      type:    'payment_received',
      title:   'Payment Submitted',
      message: `Your ${label} payment for "${order.title}" is pending verification. We'll confirm within a few hours.`,
      link:    `/dashboard/client/orders`,
      metadata: { orderId: order.id },
    }).catch(() => {});

    // Email admin
    if (process.env.ADMIN_EMAIL) {
      sendEmail({
        to:      process.env.ADMIN_EMAIL,
        ...templates.adminPaymentSubmitted({ order, client: order.client, method: label }),
      }).catch(() => {});
    }

    res.json({ success: true, payment: fmt(payment) });
  } catch (err) { next(err); }
};

// ─── Admin: approve a manual payment ─────────────────────────────────────────

exports.approveManualPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where:   { id },
      include: { order: true, client: true },
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'pending_verification') {
      return res.status(400).json({ success: false, message: 'Payment is not pending verification' });
    }

    let project = null;
    if (payment.orderId && payment.order && payment.order.status === 'pending') {
      // Atomically: create project, link order=paid, mark payment=paid
      project = await prisma.$transaction(async (tx) => {
        const p = await createProjectFromOrder(payment.order, tx);
        await tx.payment.update({
          where: { id },
          data:  { status: 'paid', paidAt: new Date(), projectId: p.id },
        });
        return p;
      });

      await logActivity(
        project.id,
        payment.clientId,
        'payment_received',
        `${METHOD_LABELS[payment.method] || 'Manual'} payment of $${payment.amount} verified. Project created.`,
        { orderId: payment.orderId, amount: payment.amount, method: payment.method }
      );

      notify(payment.clientId, {
        type:    'project_created',
        title:   'Payment Verified — Project Active!',
        message: `Your payment for "${payment.order.title}" has been verified. Your project is now active!`,
        link:    `/dashboard/client/projects/${project.id}`,
        metadata: { projectId: project.id },
      }).catch(() => {});

      // System message in project chat
      SM.paymentVerified(project.id).catch(() => {});

      // Email client
      sendEmail({
        to:      payment.client.email,
        ...templates.paymentVerified({
          client:  payment.client,
          order:   payment.order,
          project,
        }),
      }).catch(() => {});
    } else {
      await prisma.payment.update({
        where: { id },
        data:  { status: 'paid', paidAt: new Date() },
      });

      notify(payment.clientId, {
        type:    'payment_received',
        title:   'Payment Verified',
        message: `Your payment has been verified by the admin.`,
        link:    `/dashboard/client/orders`,
      }).catch(() => {});
    }

    res.json({
      success: true,
      payment: fmt(await prisma.payment.findUnique({ where: { id } })),
      project: project ? fmt(project) : null,
    });
  } catch (err) { next(err); }
};

// ─── Mock payment (dev / demo) ────────────────────────────────────────────────

exports.mockPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.clientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order already paid or cancelled' });
    }

    // Atomic: project create + order paid + payment recorded
    const { project, payment } = await prisma.$transaction(async (tx) => {
      const p = await createProjectFromOrder(order, tx);
      const pay = await tx.payment.create({
        data: {
          clientId:    req.user.id,
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
    );

    notify(req.user.id, {
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
