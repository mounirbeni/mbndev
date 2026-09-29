const router = require('express').Router();
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { isConfigured } = require('../lib/push');

router.get('/push/config', protect, (_req, res) => res.json({ success: true, configured: isConfigured(), publicKey: process.env.VAPID_PUBLIC_KEY || null }));
router.post('/push/subscribe', protect, async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) return res.status(400).json({ success: false, message: 'Invalid push subscription' });
    await prisma.pushSubscription.upsert({ where: { endpoint }, create: { userId: req.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth }, update: { userId: req.user.id, p256dh: keys.p256dh, auth: keys.auth } });
    res.status(201).json({ success: true });
  } catch (error) { next(error); }
});
router.delete('/push/subscribe', protect, async (req, res, next) => {
  try { if (req.body?.endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint: req.body.endpoint, userId: req.user.id } }); res.json({ success: true }); } catch (error) { next(error); }
});

router.get('/',              protect, getNotifications);
router.get('/unread-count',  protect, getUnreadCount);
router.put('/read-all',      protect, markAllRead);
router.put('/:id/read',      protect, markRead);

module.exports = router;
