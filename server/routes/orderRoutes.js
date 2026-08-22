const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorize('staff', 'admin'), updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
