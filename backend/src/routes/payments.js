const router = require('express').Router();
const {
  getPayments,
  getPaymentById,
  getPaymentEvents,
  mockPayment,
  submitManualPayment,
  approveManualPayment,
  rejectManualPayment,
  triggerReconciliation,
  getPaymentAnalytics,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { submitManualRules } = require('../middleware/validate');

// ─── Client + shared ──────────────────────────────────────────────────────────

// Submit a manual payment (client only — validate cleans up inputs)
router.post('/manual', protect, submitManualRules, submitManualPayment);

// List payments (client: own; admin: all, filterable by ?status=&flagged=true)
router.get('/', protect, getPayments);

// Single payment — invoice view; client can only see own
router.get('/:id', protect, getPaymentById);

// ─── Admin only ───────────────────────────────────────────────────────────────

// Approve or reject a manual payment
router.put('/:id/approve', protect, authorize('admin'), approveManualPayment);
router.put('/:id/reject',  protect, authorize('admin'), rejectManualPayment);

// Immutable audit trail for a single payment
router.get('/:id/events', protect, authorize('admin'), getPaymentEvents);

// On-demand reconciliation — responds 202 immediately, runs async
router.post('/reconcile', protect, authorize('admin'), triggerReconciliation);

// Payment analytics dashboard data
router.get('/meta/analytics', protect, authorize('admin'), getPaymentAnalytics);

// Mock payment (dev + demo only — hard-blocked in production by controller)
router.post('/mock', protect, mockPayment);

module.exports = router;
