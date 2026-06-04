const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { getFirebase } = require('../config/firebase');

// Initialize Razorpay instance — only if keys exist
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay API keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay payment order
// @route   POST /api/payments/create
// @access  Private
const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId, description } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ message: 'Amount and orderId are required' });
    }

    // Validate that the Niraa order actually exists in DB before charging
    const { db } = getFirebase();
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const razorpay = getRazorpay();

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${orderId}`,
      notes: {
        orderId,
        customerId: req.user?.id || 'guest',
        description: description || 'Niraa Order Payment',
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    logger.info(`Razorpay order created: ${razorpayOrder.id} for order ${orderId}`);

    res.status(201).json({
      message: 'Payment order created',
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Safe to expose — this is the public key
    });

  } catch (error) {
    logger.error('Create Payment Order Error:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

// @desc    Verify Razorpay payment signature & mark order as paid
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification details are required' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway not configured' });
    }

    // Verify the signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      logger.warn(`Invalid Razorpay signature for orderId: ${orderId}, razorpayOrderId: ${razorpayOrderId}`);
      return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
    }

    // Signature is valid — update the Niraa order as paid
    if (orderId) {
      const { db } = getFirebase();
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        await orderRef.update({
          paymentStatus: 'paid',
          razorpayOrderId,
          razorpayPaymentId,
          paidAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        logger.info(`Order ${orderId} marked as paid via Razorpay payment ${razorpayPaymentId}`);
        
        // Telemetry: Log business event
        const businessLogger = require('../utils/businessLogger');
        businessLogger.logPaymentSucceeded(orderId, razorpayPaymentId, orderDoc.data()?.total || 0);
      }
    }

    res.status(200).json({
      message: 'Payment verified successfully',
      razorpayPaymentId,
    });

  } catch (error) {
    logger.error('Verify Payment Error:', error);
    
    // Telemetry: Log business failure event
    const businessLogger = require('../utils/businessLogger');
    businessLogger.logPaymentFailed(req.body.orderId || 'unknown', error.message);
    
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

// @desc    Initiate refund via Razorpay
// @route   POST /api/payments/refund
// @access  Private/Admin
const refundPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, amount, reason } = req.body;

    if (!razorpayPaymentId || !reason) {
      return res.status(400).json({ message: 'Razorpay Payment ID and reason are required' });
    }

    const razorpay = getRazorpay();

    const refundOptions = {
      speed: 'normal',
      notes: { reason },
    };

    // If partial refund amount is provided, include it (in paise)
    if (amount) {
      refundOptions.amount = Math.round(Number(amount) * 100);
    }

    const refund = await razorpay.payments.refund(razorpayPaymentId, refundOptions);

    logger.info(`Refund initiated: ${refund.id} for payment ${razorpayPaymentId}`);

    res.status(201).json({
      message: 'Refund initiated successfully',
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100, // Convert back to INR
    });

  } catch (error) {
    logger.error('Refund Payment Error:', error);
    res.status(500).json({ message: 'Failed to process refund', error: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  refundPayment,
};