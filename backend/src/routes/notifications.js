const router = require('express').Router();
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/',              protect, getNotifications);
router.get('/unread-count',  protect, getUnreadCount);
router.put('/read-all',      protect, markAllRead);
router.put('/:id/read',      protect, markRead);

module.exports = router;
