const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');

// ─── Global Search (admin only) ───────────────────────────────────────────────
// GET /api/search?q=<query>
// Returns grouped results: projects, clients, orders — 5 each max.

router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, results: { projects: [], clients: [], orders: [] } });
    }

    const contains = { contains: q, mode: 'insensitive' };

    const [projects, clients, orders] = await Promise.all([
      prisma.project.findMany({
        where: { OR: [{ title: contains }, { description: contains }] },
        select: {
          id: true, title: true, description: true, status: true, progress: true,
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),

      prisma.user.findMany({
        where: {
          role: 'client',
          OR: [{ name: contains }, { email: contains }, { company: contains }],
        },
        select: {
          id: true, name: true, email: true, company: true,
          plan: true, isActive: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      prisma.order.findMany({
        where: { OR: [{ title: contains }, { description: contains }, { serviceType: contains }] },
        select: {
          id: true, title: true, serviceType: true, status: true, totalPrice: true,
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      results: { projects: fmt(projects), clients: fmt(clients), orders: fmt(orders) },
    });
  } catch (err) { next(err); }
});

// ─── Activity Log (admin only) ────────────────────────────────────────────────
// GET /api/search/activity?page=1&limit=50&projectId=&userId=

router.get('/activity', protect, authorize('admin'), async (req, res, next) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page      || '1',  10));
    const limit     = Math.min(100, parseInt(req.query.limit   || '50', 10));
    const projectId = (req.query.projectId || '').toString().trim() || undefined;
    const userId    = (req.query.userId    || '').toString().trim() || undefined;
    const skip      = (page - 1) * limit;

    const where = {
      ...(projectId && { projectId }),
      ...(userId    && { userId }),
    };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        select: {
          id: true, action: true, description: true, metadata: true, createdAt: true,
          project: { select: { id: true, title: true } },
          user:    { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      logs:  fmt(logs),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) { next(err); }
});

module.exports = router;
