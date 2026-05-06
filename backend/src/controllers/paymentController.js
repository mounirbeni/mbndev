const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');

// Create a Stripe checkout session for a milestone
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { projectId, milestoneTitle, amount, description } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: milestoneTitle || `Payment for ${project.title}`,
            description: description || '',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/dashboard/client/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/client/payments?cancelled=true`,
      metadata: { projectId, milestoneTitle, userId: req.user.id },
    });

    await prisma.payment.create({
      data: {
        projectId,
        clientId: req.user.id,
        amount: Number(amount),
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

// Stripe webhook: mark payment as paid
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await prisma.payment.updateMany({
      where: { stripeSessionId: session.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent,
      },
    });
  }

  res.json({ received: true });
};

// Get payments (all for admin, own for client)
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: req.user.role === 'admin' ? {} : { clientId: req.user.id },
      include: {
        project: { select: { id: true, title: true } },
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, payments: fmt(payments) });
  } catch (err) {
    next(err);
  }
};

// Mock payment (dev, no real Stripe key needed)
exports.mockPayment = async (req, res, next) => {
  try {
    const { projectId, milestoneTitle, amount, description } = req.body;

    const payment = await prisma.payment.create({
      data: {
        projectId,
        clientId: req.user.id,
        amount: Number(amount),
        milestoneTitle,
        description,
        status: 'paid',
        paidAt: new Date(),
      },
    });

    res.json({ success: true, payment: fmt(payment) });
  } catch (err) {
    next(err);
  }
};
