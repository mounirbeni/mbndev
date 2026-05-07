const router = require('express').Router();
const {
  createOrderCheckout,
  createCheckoutSession,
  stripeWebhook,
  getPayments,
  mockPayment,
  submitManualPayment,
  approveManualPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Stripe webhook (raw body needed)
router.post('/webhook', stripeWebhook);

// Order checkout via Stripe
router.post('/order-checkout', protect, createOrderCheckout);

// Milestone checkout (existing flow)
router.post('/checkout', protect, createCheckoutSession);

// Manual payment methods (CIH Bank / PayPal / TapTapSend)
router.post('/manual', protect, submitManualPayment);

// Admin: approve a manual payment
router.put('/:id/approve', protect, authorize('admin'), approveManualPayment);

// Mock payment for dev/demo
router.post('/mock', protect, mockPayment);

// Get all payments
router.get('/', protect, getPayments);

module.exports = router;
