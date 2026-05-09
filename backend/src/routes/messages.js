const router = require('express').Router();
const { getThreads, getMessages, sendMessage, getUnreadCount } = require('../controllers/messageController');
const { protect }          = require('../middleware/auth');
const { sendMessageRules } = require('../middleware/validate');

// Static routes must precede /:projectId to avoid param capture
router.get('/threads', protect, getThreads);
router.get('/unread',  protect, getUnreadCount);
router.get ('/:projectId', protect, getMessages);
router.post('/:projectId', protect, sendMessageRules, sendMessage);

module.exports = router;
