const router    = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const { createRateLimitStore } = require('../lib/rateLimitStore');
const c = require('../controllers/careersController');

// Public form: a handful of applications per hour per IP is plenty.
const applyLimiter = rateLimit({
  store:           createRateLimitStore('careers'),
  windowMs:        60 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many applications from this connection — please try again later.' },
});

router.post('/apply', applyLimiter, c.cvUpload, c.apply);

router.get('/applications',            protect, authorize('admin'), c.list);
router.patch('/applications/:id',      protect, authorize('admin'), c.update);
router.delete('/applications/:id',     protect, authorize('admin'), c.remove);
router.get('/applications/:id/cv',     protect, authorize('admin'), c.downloadCv);

module.exports = router;
