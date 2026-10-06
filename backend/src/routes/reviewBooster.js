const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const { createRateLimitStore } = require('../lib/rateLimitStore');
const c = require('../controllers/reviewBoosterController');

// Public review page: keep counters and private feedback to a human pace.
const publicLimiter = rateLimit({
  store:           createRateLimitStore('review-public'),
  windowMs:        10 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many requests — please try again in a few minutes.' },
});

router.get('/public/:id', c.publicPage);
router.post('/public/:id/event', publicLimiter, c.publicEvent);
router.post('/public/:id/feedback', publicLimiter, c.publicFeedback);

// Vercel Cron (CRON_SECRET bearer, checked in the handler).
router.get('/cron/monitor', c.cronMonitor);

router.get('/admin/accounts', protect, authorize('admin'), c.adminListAccounts);
router.put('/admin/access', protect, authorize('admin'), c.adminSetAccess);

router.use(protect, c.requireAccess);
router.get('/me', c.me);
router.put('/settings', c.saveSettings);
router.get('/businesses', c.listBusinesses);
router.post('/businesses', c.createBusiness);
router.get('/businesses/:id', c.getBusiness);
router.put('/businesses/:id', c.updateBusiness);
router.delete('/businesses/:id', c.deleteBusiness);
router.post('/businesses/:id/sent', c.markSent);
router.get('/businesses/:id/feedback', c.listFeedback);
router.post('/businesses/:id/place-search', c.placeSearch);
router.post('/businesses/:id/check', c.checkNow);
router.get('/businesses/:id/reviews', c.listReviews);
router.post('/businesses/:id/reviews/:reviewId/reply', c.replyDraft);

module.exports = router;
