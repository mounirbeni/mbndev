const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const { createRateLimitStore } = require('../lib/rateLimitStore');
const c = require('../controllers/menuController');

// Guests at a table: a handful of orders / calls / bookings per 10 minutes.
const publicLimiter = rateLimit({
  store:           createRateLimitStore('menu-public'),
  windowMs:        10 * 60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, message: 'Too many requests — please ask the staff or try again in a few minutes.' },
});

router.get('/photo/:photoId', c.photo);
router.get('/public/:id', c.publicMenu);
router.post('/public/:id/view', publicLimiter, c.publicView);
router.post('/public/:id/requests', publicLimiter, c.publicRequest);
router.get('/public/:id/requests/:requestId', c.publicRequestStatus);

router.get('/admin/accounts', protect, authorize('admin'), c.adminListAccounts);
router.put('/admin/access', protect, authorize('admin'), c.adminSetAccess);

router.use(protect, c.requireAccess);
router.get('/me', c.me);
router.put('/settings', c.saveSettings);
router.get('/restaurants', c.listRestaurants);
router.post('/restaurants', c.createRestaurant);
router.get('/restaurants/:id', c.getRestaurant);
router.put('/restaurants/:id', c.updateRestaurant);
router.delete('/restaurants/:id', c.deleteRestaurant);
router.post('/restaurants/:id/photos', c.uploadPhoto);
router.post('/restaurants/:id/translate', c.translate);
router.get('/restaurants/:id/requests', c.listRequests);
router.put('/restaurants/:id/requests/:requestId', c.updateRequest);

module.exports = router;
