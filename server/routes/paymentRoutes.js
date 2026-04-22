const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment,
  getAllPayments
} = require('../controllers/paymentController');

// Public routes
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

// Protected routes
router.get('/history', protect, getPaymentHistory);
router.get('/:id', protect, getPaymentDetails);
router.post('/:id/refund', protect, refundPayment);

// Admin routes
router.get('/', protect, adminOnly, getAllPayments);

module.exports = router;