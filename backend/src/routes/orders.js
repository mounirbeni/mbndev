const router = require('express').Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  cancelOrder,
  deleteOrder,
  calculateOrderPrice,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { createOrderRules, calculatePriceRules } = require('../middleware/validate');

// Price calculator (public-ish, but auth helps logging)
router.get('/price', calculatePriceRules, calculateOrderPrice);

// Order CRUD
router.post('/',          protect, createOrderRules, createOrder);
router.get ('/',          protect, getOrders);
router.get ('/:id',        protect, getOrder);
router.put ('/:id',        protect, updateOrder);
router.put ('/:id/cancel', protect, cancelOrder);
router.delete('/:id',       protect, authorize('admin'), deleteOrder);

module.exports = router;
