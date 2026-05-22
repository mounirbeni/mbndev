const router = require('express').Router();
const {
  getPayments,
  getPaymentById,
  mockPayment,
  submitManualPayment,
  approveManualPayment,
  rejectManualPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { submitManualRules } = require('../middleware/validate');

// Manual payment methods (CIH Bank / PayPal / TapTapSend)
router.post('/manual', protect, submitManualRules, submitManualPayment);

// Admin: approve or reject a manual payment
router.put('/:id/approve', protect, authorize('admin'), approveManualPayment);
router.put('/:id/reject',  protect, authorize('admin'), rejectManualPayment);

// Mock payment for dev / demo
router.post('/mock', protect, mockPayment);

// Get all payments (own for client, all for admin)
router.get('/', protect, getPayments);

// Get single payment (invoice view — client can only see own)
router.get('/:id', protect, getPaymentById);

module.exports = router;
