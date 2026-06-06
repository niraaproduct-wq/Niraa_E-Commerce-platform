const express = require('express');
const router  = express.Router();
const {
  placeOrder, getAllOrders, getOrder, updateOrderStatus, getOrderStats, getMyOrders, cancelMyOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

router.post('/',              validate(schemas.orders.placeOrder),    placeOrder);
router.get('/',               protect, adminOnly,                      getAllOrders);
router.get('/my',             protect,                                  getMyOrders);
router.get('/stats',          protect, adminOnly,                      getOrderStats);
router.get('/:id',             protect,                                  getOrder);
router.put('/:id/status',     protect, adminOnly, validate(schemas.orders.updateStatus),   updateOrderStatus);
router.put('/:id/cancel',     protect,            validate(schemas.orders.cancelMyOrder),  cancelMyOrder);

module.exports = router;