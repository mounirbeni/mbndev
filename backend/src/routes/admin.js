const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');

// Get all clients
router.get('/clients', protect, authorize('admin'), async (req, res, next) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      select: {
        id: true, name: true, email: true, company: true,
        phone: true, isActive: true, createdAt: true, role: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, clients: fmt(clients) });
  } catch (err) {
    next(err);
  }
});

// Toggle client active status
router.put('/clients/:id/toggle', protect, authorize('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !existing.isActive },
      select: {
        id: true, name: true, email: true, isActive: true, role: true,
      },
    });
    res.json({ success: true, user: fmt(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
