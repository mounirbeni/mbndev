const router    = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const { createRateLimitStore } = require('../lib/rateLimitStore');
const c = require('../controllers/demoController');

// A PIN is 4–8 digits, so guessing has to be throttled hard: 10 wrong tries per 15 min per IP.
const unlockLimiter = rateLimit({
  store:                createRateLimitStore('demo-unlock'),
  windowMs:             15 * 60 * 1000,
  max:                  10,
  skipSuccessfulRequests: true,
  standardHeaders:      true,
  legacyHeaders:        false,
  message:              { success: false, message: 'Too many attempts — try again in a few minutes.' },
});

// Public (the static demo pages call these)
router.get('/:slug/config',  c.config);
router.post('/:slug/unlock', unlockLimiter, c.unlock);

// Owner dashboard
router.get('/',        protect, authorize('admin'), c.list);
router.patch('/:slug', protect, authorize('admin'), c.update);

module.exports = router;
