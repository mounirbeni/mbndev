const router = require('express').Router();
const {
  getPayments,
  mockPayment,
  submitManualPayment,
  approveManualPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { submitManualRules } = require('../middleware/validate');

// Manual payment methods (CIH Bank / PayPal / TapTapSend)
router.post('/manual', protect, submitManualRules, submitManualPayment);

// Admin: approve a manual payment
router.put('/:id/approve', protect, authorize('admin'), approveManualPayment);

// Mock payment for dev / demo
router.post('/mock', protect, mockPayment);

// Get all payments (own for client, all for admin)
router.get('/', protect, getPayments);

module.exports = router;
