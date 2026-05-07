const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { notify, notifyAdmins, logActivity } = require('../lib/notifications');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SERVICE_TYPE_LABELS = {
  website:   'Website',
  ecommerce: 'E-Commerce Store',
  dashboard: 'SaaS Dashboard',
  mobile:    'Mobile App',
  custom:    'Custom Project',
};

/** Auto-create a Project from a paid Order */
async function createProjectFromOrder(order) {
  const project = await prisma.project.create({
    data: {
      title:       order.title,
      description: order.description || `${SERVICE_TYPE_LABELS[order.serviceType] || 'Custom'} project`,
      clientId:    order.clientId,
      orderId:     order.id,
      type:        order.serviceType,
      status:      'paid',
      budget:      order.totalPrice,
      features:    order.features,
      notes:       order.notes || null,
      designStyle: order.designStyle || null,
      designColors: order.designColors || [],
      designRefs:  order.designRefs || [],
    },
  });

  // Link project back to order
  await prisma.order.update({
    where: { id: order.id },
    data:  { status: 'paid' },
  });

  return project;
}

// ─── Checkout session for an Order ───────────────────────────────────────────

exports.createOrderCheckout = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { client: true },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order is not in pending status' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: order.client.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name:        `${SERVICE_TYPE_LABELS[order.serviceType] || 'Custom'} — ${order.title}`,
            description: `${order.deliveryDays}-day delivery · ${order.features.length} features`,
          },
          unit_amount: Math.round(order.totalPrice * 100),
        },
        quantity: 1,
      }],
      success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url:  `${clientUrl}/checkout/cancel?order_id=${order.id}`,
      metadata: { orderId: order.id, clientId: req.user.id, type: 'order' },
    });

    // Save session ID on order
    await prisma.order.update({
      where: { id: order.id },
      data:  { stripeSessionId: session.id },
    });

    // Create pending payment record
    await prisma.payment.create({
      data: {
        clientId:       req.user.id,
        orderId:        order.id,
        amount:         order.totalPrice,
        description:    `Payment for: ${order.title}`,
        stripeSessionId: session.id,
      },
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

// ─── Stripe webhook ───────────────────────────────────────────────────────────

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object;
    const metadata = session.metadata || {};

    try {
      // Update payment record
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data:  {
          status:               'paid',
          paidAt:               new Date(),
          stripePaymentIntentId: session.payment_intent,
        },
      });

      // If this is an Order payment → auto-create project
      if (metadata.type === 'order' && metadata.orderId) {
        const order = await prisma.order.findUnique({
          where: { id: metadata.orderId },
        });

        if (order && order.status === 'pending') {
          const project = await createProjectFromOrder(order);

          // Update payment with projectId
          await prisma.payment.updateMany({
            where: { stripeSessionId: session.id },
            data:  { projectId: project.id },
          });

          // Activity log
          await logActivity(
            project.id,
            metadata.clientId,
            'payment_received',
            `Payment of $${order.totalPrice} received. Project created automatically.`,
            { orderId: order.id, amount: order.totalPrice }
          );

          // Notify client
          await notify(metadata.clientId, {
            type:    'project_created',
            title:   'Your project has been created! 🎉',
            message: `Payment confirmed. Project "${project.title}" is now active and will start soon.`,
            link:    `/dashboard/client/projects/${project.id}`,
            metadata: { projectId: project.id, orderId: order.id },
          });

          // Notify admins
          await notifyAdmins({
            type:    'payment_received',
            title:   'New Payment Received',
            message: `Payment of $${order.totalPrice} received for order "${order.title}". Project auto-created.`,
            link:    `/dashboard/admin/projects/${project.id}`,
            metadata: { projectId: project.id, orderId: order.id, amount: order.totalPrice },
          });
        }
      } else if (metadata.projectId) {
        // Milestone payment
        await logActivity(
          metadata.projectId,
          metadata.userId,
          'payment_received',
          `Milestone payment received.`,
          { amount: session.amount_total / 100 }
        );

        await notify(metadata.userId, {
          type:    'payment_received',
          title:   'Payment Confirmed',
          message: `Your milestone payment has been confirmed.`,
          link:    `/dashboard/client/payments`,
        });
      }
    } catch (err) {
      console.error('[webhook] Error processing payment:', err);
    }
  }

  res.json({ received: true });
};

// ─── Create checkout for a milestone (existing flow) ─────────────────────────

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { projectId, milestoneTitle, amount, description } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name:        milestoneTitle || `Payment for ${project.title}`,
            description: description || '',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      success_url: `${clientUrl}/dashboard/client/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${clientUrl}/dashboard/client/payments?cancelled=true`,
      metadata:    { projectId, milestoneTitle, userId: req.user.id, type: 'milestone' },
    });

    await prisma.payment.create({
      data: {
        projectId,
        clientId:        req.user.id,
        amount:          Number(amount),
        milestoneTitle,
        description,
        stripeSessionId: session.id,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    next(err);
  }
};

// ─── Get payments ─────────────────────────────────────────────────────────────

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

// ─── Submit manual payment (CIH Bank / PayPal / TapTapSend) ──────────────────

const METHOD_LABELS = {
  cih_bank:   'CIH Bank Transfer',
  paypal:     'PayPal',
  taptapsend: 'TapTapSend',
};

exports.submitManualPayment = async (req, res, next) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId || !method) {
      return res.status(400).json({ success: false, message: 'orderId and method are required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
      },
    });

    // Notify admins
    await notifyAdmins({
      type:    'payment_received',
      title:   'Manual Payment Submitted',
      message: `${order.client.name} submitted a ${label} payment of $${order.totalPrice} for "${order.title}". Please verify.`,
      link:    `/dashboard/admin/payments`,
      metadata: { orderId: order.id, paymentId: payment.id, method },
    });

    // Notify client
    await notify(req.user.id, {
      type:    'payment_received',
      title:   'Payment Submitted',
      message: `Your ${label} payment for "${order.title}" is pending verification. We'll confirm within a few hours.`,
      link:    `/dashboard/client/orders`,
      metadata: { orderId: order.id },
    });

    res.json({ success: true, payment: fmt(payment) });
  } catch (err) { next(err); }
};

// ─── Admin: approve a manual payment ─────────────────────────────────────────

exports.approveManualPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true, client: true },
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'pending_verification') {
      return res.status(400).json({ success: false, message: 'Payment is not pending verification' });
    }

    let project = null;
    if (payment.orderId && payment.order && payment.order.status === 'pending') {
      project = await createProjectFromOrder(payment.order);

      await prisma.payment.update({
        where: { id },
        data:  { status: 'paid', paidAt: new Date(), projectId: project.id },
      });

      await logActivity(
        project.id,
        payment.clientId,
        'payment_received',
        `${METHOD_LABELS[payment.method] || 'Manual'} payment of $${payment.amount} verified. Project created.`,
        { orderId: payment.orderId, amount: payment.amount, method: payment.method }
      );

      await notify(payment.clientId, {
        type:    'project_created',
        title:   'Payment Verified — Project Active!',
        message: `Your payment for "${payment.order.title}" has been verified. Your project is now active!`,
        link:    `/dashboard/client/projects/${project.id}`,
        metadata: { projectId: project.id },
      });
    } else {
      await prisma.payment.update({
        where: { id },
        data:  { status: 'paid', paidAt: new Date() },
      });

      await notify(payment.clientId, {
        type:    'payment_received',
        title:   'Payment Verified',
        message: `Your payment has been verified by the admin.`,
        link:    `/dashboard/client/orders`,
      });
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
    const { projectId, orderId, milestoneTitle, amount, description } = req.body;

    // If orderId given, handle as order payment
    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      if (order.clientId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Order already paid or cancelled' });
      }

      const project = await createProjectFromOrder(order);

      const payment = await prisma.payment.create({
        data: {
          clientId:   req.user.id,
          orderId:    order.id,
          projectId:  project.id,
          amount:     order.totalPrice,
          description: `Mock payment for: ${order.title}`,
          status:     'paid',
          paidAt:     new Date(),
        },
      });

      await logActivity(
        project.id,
        req.user.id,
        'payment_received',
        `Mock payment of $${order.totalPrice} received. Project created.`,
        { orderId: order.id }
      );

      await notify(req.user.id, {
        type:    'project_created',
        title:   'Your project has been created! 🎉',
        message: `Payment confirmed. Project "${project.title}" is now active.`,
        link:    `/dashboard/client/projects/${project.id}`,
        metadata: { projectId: project.id },
      });

      await notifyAdmins({
        type:    'payment_received',
        title:   'New Mock Payment',
        message: `$${order.totalPrice} received for "${order.title}". Project created.`,
        link:    `/dashboard/admin/projects/${project.id}`,
        metadata: { projectId: project.id, amount: order.totalPrice },
      });

      return res.json({ success: true, payment: fmt(payment), project: fmt(project) });
    }

    // Legacy: milestone mock payment
    const payment = await prisma.payment.create({
      data: {
        projectId:     projectId || null,
        clientId:      req.user.id,
        amount:        Number(amount),
        milestoneTitle,
        description,
        status:        'paid',
        paidAt:        new Date(),
      },
    });

    res.json({ success: true, payment: fmt(payment) });
  } catch (err) {
    next(err);
  }
};
