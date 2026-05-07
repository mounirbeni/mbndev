const router = require('express').Router();
const {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  calculateOrderPrice,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Price calculator (public-ish, but auth helps logging)
router.get('/price', calculateOrderPrice);

// Order CRUD
router.post('/',         protect, createOrder);
router.get('/',          protect, getOrders);
router.get('/:id',       protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
