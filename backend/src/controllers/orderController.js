const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { notify, notifyAdmins } = require('../lib/notifications');

// ─── Pricing engine ───────────────────────────────────────────────────────────

const BASE_PRICES = {
  website:   499,
  ecommerce: 999,
  dashboard: 1299,
  mobile:    1799,
  custom:    699,
};

const FEATURE_PRICES = {
  auth:        150,
  payment:     200,
  dashboard:   300,
  multilang:   120,
  seo:          80,
  api:         200,
  hosting:      50,
};

const ADDON_PRICES = {
  fastDelivery: 200,
};

const DELIVERY_DAYS = {
  website:   14,
  ecommerce: 21,
  dashboard: 28,
  mobile:    35,
  custom:    21,
};

function calculatePrice({ serviceType, pages = 5, features = [], addons = [] }) {
  const base      = BASE_PRICES[serviceType] || BASE_PRICES.custom;
  const pageExtra = Math.max(0, pages - 5) * 30;
  const featureTotal = features.reduce((sum, f) => sum + (FEATURE_PRICES[f] || 0), 0);
  const addonTotal   = addons.reduce((sum, a) => sum + (ADDON_PRICES[a] || 0), 0);

  let deliveryDays = DELIVERY_DAYS[serviceType] || 21;
  if (addons.includes('fastDelivery')) deliveryDays = Math.ceil(deliveryDays * 0.6);

  return {
    totalPrice: base + pageExtra + featureTotal + addonTotal,
    deliveryDays,
    breakdown: { base, pageExtra, featureTotal, addonTotal },
  };
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// POST /api/orders — Create a new order (client)
exports.createOrder = async (req, res, next) => {
  try {
    const {
      serviceType, title, description, pages, features, addons, notes,
      designStyle, designColors, designRefs,
    } = req.body;

    if (!serviceType || !title) {
      return res.status(400).json({ success: false, message: 'serviceType and title are required' });
    }

    const { totalPrice, deliveryDays } = calculatePrice({
      serviceType,
      pages: Number(pages) || 5,
      features: features || [],
      addons: addons || [],
    });

    const order = await prisma.order.create({
      data: {
        clientId:    req.user.id,
        serviceType,
        title,
        description: description || null,
        pages:       Number(pages) || 5,
        features:    features || [],
        addons:      addons || [],
        totalPrice,
        deliveryDays,
        notes:       notes || null,
        designStyle: designStyle || null,
        designColors: designColors || [],
        designRefs:  designRefs || [],
      },
    });

    // Notify admins of new order
    await notifyAdmins({
      type:    'order_placed',
      title:   'New Order Received',
      message: `${req.user.name} placed a new order: "${title}" ($${totalPrice})`,
      link:    `/dashboard/admin/orders/${order.id}`,
      metadata: { orderId: order.id, clientId: req.user.id },
    });

    res.status(201).json({ success: true, order: fmt(order) });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — List orders (admin: all, client: own)
exports.getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {
      ...(req.user.role !== 'admin' ? { clientId: req.user.id } : {}),
      ...(status ? { status } : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        client:  { select: { id: true, name: true, email: true, company: true } },
        project: { select: { id: true, title: true, status: true, progress: true } },
        payments: { select: { id: true, status: true, amount: true, paidAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: orders.length, orders: fmt(orders) });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id — Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        client:  { select: { id: true, name: true, email: true, company: true, avatar: true } },
        project: { select: { id: true, title: true, status: true, progress: true, createdAt: true } },
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order: fmt(order) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/cancel — Cancel pending order (client own, or admin)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role !== 'admin' && order.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data:  { status: 'cancelled' },
    });

    res.json({ success: true, order: fmt(updated) });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/price — Calculate price without creating order
exports.calculateOrderPrice = async (req, res, next) => {
  try {
    const { serviceType, pages, features, addons } = req.query;
    const result = calculatePrice({
      serviceType: serviceType || 'website',
      pages:    Number(pages) || 5,
      features: features ? (Array.isArray(features) ? features : features.split(',')) : [],
      addons:   addons   ? (Array.isArray(addons)   ? addons   : addons.split(','))   : [],
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports.calculatePrice = calculatePrice;
