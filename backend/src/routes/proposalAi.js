const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const { createRateLimitStore } = require('../lib/rateLimitStore');
const c = require('../controllers/proposalAiController');

// Public proposal page: views, accept and decline at a human pace.
const publicLimiter = rateLimit({
  store:           createRateLimitStore('proposal-public'),
  windowMs:        10 * 60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many requests — please try again in a few minutes.' },
});

router.get('/public/:token', c.publicProposal);
router.post('/public/:token/view', publicLimiter, c.publicView);
router.post('/public/:token/accept', publicLimiter, c.publicAccept);
router.post('/public/:token/decline', publicLimiter, c.publicDecline);

// Vercel Cron (CRON_SECRET bearer, checked in the handler).
router.get('/cron/follow-ups', c.cronFollowUps);

router.get('/admin/accounts', protect, authorize('admin'), c.adminListAccounts);
router.put('/admin/access', protect, authorize('admin'), c.adminSetAccess);

router.use(protect, c.requireAccess);
router.get('/me', c.me);
router.put('/settings', c.saveSettings);
router.get('/proposals', c.listProposals);
router.post('/proposals', c.createProposal);
router.get('/proposals/:id', c.getProposal);
router.put('/proposals/:id', c.updateProposal);
router.delete('/proposals/:id', c.deleteProposal);
router.post('/proposals/:id/duplicate', c.duplicateProposal);
router.post('/proposals/:id/sent', c.markSent);

module.exports = router;
