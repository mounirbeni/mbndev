const router = require('express').Router();
const { getMessages, sendMessage, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { sendMessageRules } = require('../middleware/validate');

router.get ('/unread',     protect, getUnreadCount);
router.get ('/:projectId', protect, getMessages);
router.post('/:projectId', protect, sendMessageRules, sendMessage);

module.exports = router;
