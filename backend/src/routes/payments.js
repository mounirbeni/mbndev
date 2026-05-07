const router = require('express').Router();
const {
  createOrderCheckout,
  createCheckoutSession,
  stripeWebhook,
  getPayments,
  mockPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Stripe webhook (raw body needed)
router.post('/webhook', stripeWebhook);

// Order checkout (new flow)
router.post('/order-checkout', protect, createOrderCheckout);

// Milestone checkout (existing flow)
router.post('/checkout', protect, createCheckoutSession);

// Mock payment for dev/demo
router.post('/mock', protect, mockPayment);

// Get payments
router.get('/', protect, getPayments);

module.exports = router;
