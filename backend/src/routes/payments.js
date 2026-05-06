const router = require('express').Router();
const {
  createCheckoutSession,
  stripeWebhook,
  getPayments,
  mockPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Stripe webhook (raw body needed — handled in server.js if required)
router.post('/webhook', stripeWebhook);

// Checkout session
router.post('/checkout', protect, createCheckoutSession);

// Mock payment for dev
router.post('/mock', protect, mockPayment);

// Get payments
router.get('/', protect, getPayments);

module.exports = router;
