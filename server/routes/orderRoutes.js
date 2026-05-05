const express = require('express');
const router  = express.Router();
const {
  placeOrder, getAllOrders, getOrder, updateOrderStatus, getOrderStats, getMyOrders, cancelMyOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',              placeOrder);
router.get('/',               protect, adminOnly, getAllOrders);
router.get('/my',             protect, getMyOrders);
router.get('/stats',          protect, adminOnly, getOrderStats);
router.get('/:id',            getOrder);
router.put('/:id/status',     protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel',     protect, cancelMyOrder);

module.exports = router;