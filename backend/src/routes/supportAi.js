const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const { createRateLimitStore } = require('../lib/rateLimitStore');
const c = require('../controllers/supportAiController');

// Public widget endpoints run on customers' websites: keep each visitor (IP)
// to a human pace so nobody can burn the owner's OpenAI key.
const widgetLimiter = rateLimit({
  store:           createRateLimitStore('support-widget'),
  windowMs:        10 * 60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many messages — please wait a few minutes.' },
});

router.get('/widget/:botId/config', c.widgetConfig);
router.post('/widget/:botId/chat', widgetLimiter, c.widgetChat);
router.post('/widget/:botId/lead', widgetLimiter, c.widgetLead);

router.get('/admin/accounts', protect, authorize('admin'), c.adminListAccounts);
router.put('/admin/access', protect, authorize('admin'), c.adminSetAccess);

router.use(protect, c.requireAccess);
router.get('/me', c.me);
router.put('/settings', c.saveSettings);
router.get('/bots', c.listBots);
router.post('/bots', c.createBot);
router.get('/bots/:id', c.getBot);
router.put('/bots/:id', c.updateBot);
router.post('/bots/:id/train', c.retrainBot);
router.delete('/bots/:id', c.deleteBot);
router.get('/bots/:id/conversations', c.listConversations);
router.get('/bots/:id/leads', c.listLeads);

module.exports = router;
