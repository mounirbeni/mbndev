const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { notifyAdmins } = require('../lib/notifications');
const { calculatePrice, VALID_PLANS } = require('../lib/pricing');
const { sendEmail, templates } = require('../lib/email');
const { wa } = require('../lib/whatsapp');

// POST /api/orders — Create a new order (client)
exports.createOrder = async (req, res, next) => {
  try {
    const {
      serviceType, title, description, pages, features, addons, notes,
      designStyle, designColors, designRefs, plan,
    } = req.body;

    if (!serviceType || !title) {
      return res.status(400).json({ success: false, message: 'serviceType and title are required' });
    }

    // Backend is authoritative — never trust client-supplied price
    const safePlan = plan && VALID_PLANS.includes(plan) ? plan : null;
    const { totalPrice, deliveryDays } = calculatePrice({
      serviceType,
      pages:    Number(pages) || 5,
      features: features || [],
      addons:   addons   || [],
      plan:     safePlan,
    });

    // Atomic: create order + update user.plan in one transaction
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          clientId:     req.user.id,
          serviceType,
          title,
          description:  description || null,
          pages:        Number(pages) || 5,
          features:     features || [],
          addons:       addons || [],
          totalPrice,
          deliveryDays,
          notes:        notes || null,
          designStyle:  designStyle || null,
          designColors: designColors || [],
          designRefs:   designRefs || [],
        },
      });

      if (safePlan) {
        await tx.user.update({
          where: { id: req.user.id },
          data:  { plan: safePlan },
        });
      }

      return created;
    });

    // Notify admins (fire-and-forget — outside transaction)
    notifyAdmins({
      type:    'order_placed',
      title:   'New Order Received',
      message: `${req.user.name} placed a new order: "${title}" ($${totalPrice})`,
      link:    `/dashboard/admin/orders/${order.id}`,
      metadata: { orderId: order.id, clientId: req.user.id },
    }).catch((err) => console.error('[notifyAdmins] failed:', err));

    // Email + WhatsApp — await so Vercel serverless doesn't kill before sending
    await sendEmail({
      to: req.user.email,
      ...templates.orderPlaced({ user: req.user, order }),
    }).catch(() => {});
    wa.newOrder({ client: req.user, order }).catch(() => {});

    res.status(201).json({ success: true, order: fmt(order) });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — List orders (admin: all, client: own)
exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const take = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = Math.max((parseInt(page, 10) || 1) - 1, 0) * take;

    const where = {
      ...(req.user.role !== 'admin' ? { clientId: req.user.id } : {}),
      ...(status ? { status } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client:   { select: { id: true, name: true, email: true, company: true } },
          project:  { select: { id: true, title: true, status: true, progress: true } },
          payments: { select: { id: true, status: true, amount: true, paidAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      count:   orders.length,
      total,
      page:    parseInt(page, 10) || 1,
      limit:   take,
      orders:  fmt(orders),
    });
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
        client:   { select: { id: true, name: true, email: true, company: true, avatar: true } },
        project:  { select: { id: true, title: true, status: true, progress: true, createdAt: true } },
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

// PUT /api/orders/:id — Update a pending order (client own only)
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.clientId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (order.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending orders can be modified' });

    const { description, notes, pages, features, addons } = req.body;

    const newPages    = pages    !== undefined ? Number(pages)    : order.pages;
    const newFeatures = features !== undefined ? features          : order.features;
    const newAddons   = addons   !== undefined ? addons            : order.addons;

    const { totalPrice, deliveryDays } = calculatePrice({
      serviceType: order.serviceType,
      pages:       newPages,
      features:    newFeatures,
      addons:      newAddons,
      plan:        null,
    });

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        description:  description  !== undefined ? String(description).trim()  : order.description,
        notes:        notes        !== undefined ? String(notes).trim()        : order.notes,
        pages:        newPages,
        features:     newFeatures,
        addons:       newAddons,
        totalPrice,
        deliveryDays,
      },
    });

    res.json({ success: true, order: fmt(updated) });
  } catch (err) { next(err); }
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

// DELETE /api/orders/:id — Admin delete any order
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/price — Calculate price without creating order
exports.calculateOrderPrice = async (req, res, next) => {
  try {
    const { serviceType, pages, features, addons, plan } = req.query;
    const result = calculatePrice({
      serviceType: serviceType || 'website',
      pages:    Number(pages) || 5,
      features: features ? (Array.isArray(features) ? features : features.split(',')) : [],
      addons:   addons   ? (Array.isArray(addons)   ? addons   : addons.split(','))   : [],
      plan:     plan && VALID_PLANS.includes(plan) ? plan : null,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports.calculatePrice = calculatePrice;
