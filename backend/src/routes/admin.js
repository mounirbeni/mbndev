const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { invalidateAdminCache } = require('../lib/notifications');
const cache = require('../lib/cache');
const { sendBroadcast, templates } = require('../lib/email');

// ─── Clients ──────────────────────────────────────────────────────────────────

router.get('/clients', protect, authorize('admin'), async (req, res, next) => {
  try {
    const clients = await prisma.user.findMany({
      where:   { role: 'client' },
      select:  { id: true, name: true, email: true, company: true, phone: true, isActive: true, deletionRequestedAt: true, createdAt: true, role: true, plan: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, clients: fmt(clients) });
  } catch (err) { next(err); }
});

router.put('/clients/:id/toggle', protect, authorize('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });
    const user = await prisma.user.update({
      where:  { id: req.params.id },
      data:   { isActive: !existing.isActive },
      select: { id: true, name: true, email: true, isActive: true, role: true },
    });
    // If toggling an admin, invalidate the cached admin ID list
    if (existing.role === 'admin') invalidateAdminCache();
    res.json({ success: true, user: fmt(user) });
  } catch (err) { next(err); }
});

// Delete a user and all their related data (no cascade in schema)
async function deleteUserCascade(userId) {
  // 1. Delete payments (clientId is required — must go before orders/projects)
  await prisma.payment.deleteMany({ where: { clientId: userId } });
  // 2. Delete orders
  await prisma.order.deleteMany({ where: { clientId: userId } });
  // 3. Delete projects (cascades: messages, files, projectFiles, notifications via projectId)
  const projects = await prisma.project.findMany({ where: { clientId: userId }, select: { id: true } });
  for (const p of projects) {
    await prisma.project.delete({ where: { id: p.id } });
  }
  // 4. Delete remaining user-level records without cascade
  await prisma.messageReadReceipt.deleteMany({ where: { userId } });
  await prisma.projectFile.deleteMany({ where: { userId } });
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.loginAttempt.deleteMany({ where: { userId } });
  // 5. Delete the user
  await prisma.user.delete({ where: { id: userId } });
}

router.delete('/clients/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found.' });
    if (existing.role === 'admin') return res.status(403).json({ success: false, message: 'Admin accounts cannot be deleted.' });
    if (existing.id === req.user.id) return res.status(403).json({ success: false, message: 'You cannot delete your own account from here.' });
    await deleteUserCascade(req.params.id);
    res.json({ success: true, message: 'Client account deleted.' });
  } catch (err) { next(err); }
});

// Approve a client's pending deletion request — actually deletes the account
router.post('/clients/:id/approve-deletion', protect, authorize('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found.' });
    if (!existing.deletionRequestedAt) return res.status(400).json({ success: false, message: 'No pending deletion request for this user.' });
    await deleteUserCascade(req.params.id);
    res.json({ success: true, message: 'Account deleted.' });
  } catch (err) { next(err); }
});

// Reject a client's pending deletion request — clears the flag
router.post('/clients/:id/reject-deletion', protect, authorize('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found.' });
    await prisma.user.update({ where: { id: req.params.id }, data: { deletionRequestedAt: null } });
    res.json({ success: true, message: 'Deletion request rejected.' });
  } catch (err) { next(err); }
});

// ─── Real Analytics ───────────────────────────────────────────────────────────

router.get('/analytics', protect, authorize('admin'), async (req, res, next) => {
  try {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const cacheKey = `${cache.KEYS.ANALYTICS}:${year}:${month}`;

    // ── Serve from cache if fresh ────────────────────────────────────────────
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');
      return res.json({
        success: true,
        analytics: {
          totalProjects:  cached.totalProjects,
          totalClients:   cached.totalClients,
          activeClients:  cached.activeClients,
          totalRevenue:   cached.paidPayments._sum.amount    || 0,
          pendingRevenue: cached.pendingPayments._sum.amount || 0,
          paidCount:      cached.paidPayments._count.id,
          pendingCount:   cached.pendingPayments._count.id,
          totalPayments:  cached.totalPayments,
          byStatus: {
            pending:    cached.statusMap['pending']     || 0,
            paid:       cached.statusMap['paid']        || 0,
            inProgress: cached.statusMap['in-progress'] || 0,
            review:     cached.statusMap['review']      || 0,
            revision:   cached.statusMap['revision']    || 0,
            completed:  cached.statusMap['completed']   || 0,
            cancelled:  cached.statusMap['cancelled']   || 0,
          },
          byType:          cached.typeMap,
          monthlyRevenue:  cached.monthlyRevenue,
          monthlyClients:  cached.monthlyClients,
          monthlyProjects: cached.monthlyProjects,
          recentProjects:  fmt(cached.recentProjects),
          recentPayments:  fmt(cached.recentPayments),
          recentClients:   fmt(cached.recentClients),
          year,
          currentMonth: month,
        },
      });
    }

    // ── Core counts (all single-query) ──────────────────────────────────────
    const [
      totalProjects,
      projectsByStatus,
      totalClients,
      activeClients,
      totalPayments,
      paidPayments,
      pendingPayments,
      recentProjects,
      recentPayments,
      recentClients,
      projectsByType,
    ] = await Promise.all([
      prisma.project.count(),

      // Group projects by status
      prisma.project.groupBy({ by: ['status'], _count: { id: true } }),

      prisma.user.count({ where: { role: 'client' } }),
      prisma.user.count({ where: { role: 'client', isActive: true } }),

      prisma.payment.count(),
      prisma.payment.aggregate({ where: { status: 'paid'    }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: { in: ['pending', 'pending_verification'] } }, _sum: { amount: true }, _count: { id: true } }),

      // 5 most recent projects
      prisma.project.findMany({
        take:    5,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { id: true, name: true, email: true } } },
      }),

      // 5 most recent paid payments
      prisma.payment.findMany({
        take:    5,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, title: true } },
          client:  { select: { id: true, name: true } },
          order:   { select: { id: true, title: true } },
        },
      }),

      // 5 most recent clients
      prisma.user.findMany({
        where:   { role: 'client' },
        take:    5,
        orderBy: { createdAt: 'desc' },
        select:  { id: true, name: true, email: true, company: true, createdAt: true, isActive: true },
      }),

      // Group projects by type
      prisma.project.groupBy({ by: ['type'], _count: { id: true } }),
    ]);

    // ── Monthly revenue — real aggregation via raw SQL ──────────────────────
    // Returns one row per (year, month) with sum of paid amounts
    const monthlyRows = await prisma.$queryRaw`
      SELECT
        EXTRACT(YEAR  FROM "paidAt")::int  AS year,
        EXTRACT(MONTH FROM "paidAt")::int  AS month,
        COALESCE(SUM(amount), 0)::float    AS revenue,
        COUNT(*)::int                      AS count
      FROM "Payment"
      WHERE status = 'paid'
        AND "paidAt" IS NOT NULL
        AND EXTRACT(YEAR FROM "paidAt") = ${year}
      GROUP BY year, month
      ORDER BY month ASC
    `;

    // ── Monthly new clients ──────────────────────────────────────────────────
    const clientGrowthRows = await prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM "createdAt")::int AS month,
        COUNT(*)::int                        AS count
      FROM "User"
      WHERE role = 'client'
        AND EXTRACT(YEAR FROM "createdAt") = ${year}
      GROUP BY month
      ORDER BY month ASC
    `;

    // ── Monthly projects ─────────────────────────────────────────────────────
    const projectGrowthRows = await prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM "createdAt")::int AS month,
        COUNT(*)::int                        AS count
      FROM "Project"
      WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
      GROUP BY month
      ORDER BY month ASC
    `;

    // ── Build 12-month arrays (Jan–Dec, 0-indexed to current month) ─────────
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const monthlyRevenue = MONTHS.map((label, idx) => {
      const row = monthlyRows.find((r) => Number(r.month) === idx + 1);
      return {
        month:   label,
        revenue: row ? Number(row.revenue) : 0,
        count:   row ? Number(row.count)   : 0,
        future:  idx > month,
      };
    });

    const monthlyClients = MONTHS.map((label, idx) => {
      const row = clientGrowthRows.find((r) => Number(r.month) === idx + 1);
      return { month: label, count: row ? Number(row.count) : 0, future: idx > month };
    });

    const monthlyProjects = MONTHS.map((label, idx) => {
      const row = projectGrowthRows.find((r) => Number(r.month) === idx + 1);
      return { month: label, count: row ? Number(row.count) : 0, future: idx > month };
    });

    // ── Status map ───────────────────────────────────────────────────────────
    const statusMap = Object.fromEntries(
      projectsByStatus.map((r) => [r.status, r._count.id])
    );

    // ── Type map ─────────────────────────────────────────────────────────────
    const typeMap = Object.fromEntries(
      projectsByType.map((r) => [r.type, r._count.id])
    );

    // Cache the analytics payload in process memory for 60 s.
    // The HTTP response also carries Cache-Control so browser caches help.
    cache.set(cacheKey, {
      totalProjects,
      totalClients,
      activeClients,
      paidPayments,
      pendingPayments,
      totalPayments,
      statusMap: Object.fromEntries(projectsByStatus.map((r) => [r.status, r._count.id])),
      typeMap:   Object.fromEntries(projectsByType.map((r)   => [r.type,   r._count.id])),
      monthlyRevenue,
      monthlyClients,
      monthlyProjects,
      recentProjects,
      recentPayments,
      recentClients,
    }, 60_000);

    res.setHeader('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');

    res.json({
      success: true,
      analytics: {
        // Totals
        totalProjects,
        totalClients,
        activeClients,
        totalRevenue:   paidPayments._sum.amount   || 0,
        pendingRevenue: pendingPayments._sum.amount || 0,
        paidCount:      paidPayments._count.id,
        pendingCount:   pendingPayments._count.id,
        totalPayments,
        // Status breakdown
        byStatus: {
          pending:    statusMap['pending']     || 0,
          paid:       statusMap['paid']        || 0,
          inProgress: statusMap['in-progress'] || 0,
          review:     statusMap['review']      || 0,
          revision:   statusMap['revision']    || 0,
          completed:  statusMap['completed']   || 0,
          cancelled:  statusMap['cancelled']   || 0,
        },
        // Type breakdown
        byType: typeMap,
        // Monthly series
        monthlyRevenue,
        monthlyClients,
        monthlyProjects,
        // Recent items (already fmt-able)
        recentProjects: fmt(recentProjects),
        recentPayments: fmt(recentPayments),
        recentClients:  fmt(recentClients),
        // Meta
        year,
        currentMonth: month,
      },
    });
  } catch (err) { next(err); }
});

// ─── Broadcast email to all active users ─────────────────────────────────────
// POST /api/admin/broadcast
// Body: { template: 'platformUpdate' }   (extend as needed)
// Returns: { sent, failed, skipped, total }

const BROADCAST_TEMPLATES = {
  platformUpdate: (user) => templates.platformUpdate({ user }),
  getStarted:     (user) => templates.getStarted({ user }),
  checkIn:        (user) => templates.checkIn({ user }),
  comingSoon:     (user) => templates.comingSoon({ user }),
  specialOffer:   (user) => templates.specialOffer({ user }),
};

router.post('/broadcast', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { template: tplKey = 'platformUpdate' } = req.body;

    const templateFn = BROADCAST_TEMPLATES[tplKey];
    if (!templateFn) {
      return res.status(400).json({ success: false, message: `Unknown template "${tplKey}". Available: ${Object.keys(BROADCAST_TEMPLATES).join(', ')}` });
    }

    // Fetch all active users (clients + admins)
    const users = await prisma.user.findMany({
      where:  { isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { createdAt: 'asc' },
    });

    if (users.length === 0) {
      return res.json({ success: true, message: 'No active users found.', sent: 0, failed: 0, skipped: 0, total: 0 });
    }

    // Run async — respond immediately with accepted, let it send in background
    res.json({
      success: true,
      message: `Broadcast started for ${users.length} user(s). Sending in the background.`,
      total:   users.length,
    });

    // Fire-and-forget — don't block the HTTP response
    sendBroadcast(users, templateFn).then(({ sent, failed, skipped }) => {
      console.log(`[broadcast] template="${tplKey}" total=${users.length} sent=${sent} failed=${failed} skipped=${skipped}`);
    }).catch((err) => {
      console.error('[broadcast] unexpected error:', err.message);
    });

  } catch (err) { next(err); }
});

module.exports = router;
