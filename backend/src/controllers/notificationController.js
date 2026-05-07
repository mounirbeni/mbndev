const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');

// GET /api/notifications — Get user notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take:    50,
    });
    res.json({ success: true, notifications: fmt(notifications) });
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    res.json({ success: true, count });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read — Mark one as read
exports.markRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data:  { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/read-all — Mark all as read
exports.markAllRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data:  { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
