const router = require('express').Router();
const { getMessages, sendMessage, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/unread', protect, getUnreadCount);
router.get('/:projectId', protect, getMessages);
router.post('/:projectId', protect, sendMessage);

module.exports = router;
