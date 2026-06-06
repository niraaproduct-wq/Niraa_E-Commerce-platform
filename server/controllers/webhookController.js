const crypto = require('crypto');
const logger = require('../utils/logger');
const { getFirebase } = require('../config/firebase');
const { publishEvent } = require('../utils/realtimeHub');

/**
 * @desc    Razorpay Webhook - handles payment events directly from Razorpay
 * @route   POST /api/payments/webhook
 * @access  Public (verified via Razorpay signature)
 *
 * WHY THIS EXISTS:
 * The /verify endpoint requires the user's browser to be open after payment.
 * If the user closes the tab, the payment gets stuck as "pending".
 * Razorpay calls this webhook DIRECTLY, ensuring orders are always marked paid.
 *
 * SETUP IN RAZORPAY DASHBOARD:
 * Settings → Webhooks → Add New Webhook
 * URL: https://your-api-domain.com/api/payments/webhook
 * Events to subscribe: payment.captured, payment.failed, refund.processed
 */
const handleWebhook = async (req, res) => {
  // 1. Immediately acknowledge receipt to Razorpay (within 5s to avoid retries)
  res.status(200).json({ received: true });

  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    logger.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured! Ignoring webhook.');
    return;
  }

  // 2. Verify the webhook signature to ensure it is genuinely from Razorpay
  let isValid = false;
  try {
    const payloadBuffer = req.rawBody ? req.rawBody : Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBuffer)
      .digest('hex');
    isValid = expectedSignature === signature;
  } catch (err) {
    logger.error('[Webhook] Signature verification error:', err.message);
    return;
  }

  if (!isValid) {
    logger.error('[Webhook] SECURITY: Invalid Razorpay webhook signature received. Rejecting.');
    return;
  }

  const event = req.body.event;
  const payload = req.body.payload;

  logger.info(`[Webhook] Received verified event: ${event}`);

  try {
    const { db } = getFirebase();

    // 3. Handle payment.captured — The most important event
    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity;
      if (!payment) return;

      const razorpayPaymentId = payment.id;
      const razorpayOrderId = payment.order_id;
      const niraaOrderId = payment.notes?.orderId;

      if (!niraaOrderId) {
        logger.warn(`[Webhook] payment.captured received but no orderId in notes for payment: ${razorpayPaymentId}`);
        return;
      }

      const orderRef = db.collection('orders').doc(niraaOrderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        logger.warn(`[Webhook] Order ${niraaOrderId} not found for payment ${razorpayPaymentId}`);
        return;
      }

      const order = orderDoc.data();

      // Idempotency check: Don't double-process already-paid orders
      if (order.paymentStatus === 'paid') {
        logger.info(`[Webhook] Order ${niraaOrderId} already marked as paid. Skipping.`);
        return;
      }

      await orderRef.update({
        paymentStatus: 'paid',
        status: order.status === 'placed' ? 'confirmed' : order.status,
        razorpayOrderId,
        razorpayPaymentId,
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        webhookProcessed: true,
      });

      publishEvent('orders.changed', {
        type: 'payment_captured',
        orderId: niraaOrderId,
        razorpayPaymentId,
      });

      logger.info(`[Webhook] ✅ Order ${niraaOrderId} marked as PAID via webhook (payment: ${razorpayPaymentId})`);
    }

    // 4. Handle payment.failed
    else if (event === 'payment.failed') {
      const payment = payload?.payment?.entity;
      if (!payment) return;

      const niraaOrderId = payment.notes?.orderId;
      if (!niraaOrderId) return;

      const orderRef = db.collection('orders').doc(niraaOrderId);
      const orderDoc = await orderRef.get();
      if (!orderDoc.exists) return;

      await orderRef.update({
        paymentStatus: 'failed',
        paymentFailedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentFailureReason: payment.error_description || 'Unknown',
        webhookProcessed: true,
      });

      publishEvent('orders.changed', {
        type: 'payment_failed',
        orderId: niraaOrderId,
      });

      logger.warn(`[Webhook] ⚠️ Payment FAILED for order ${niraaOrderId}: ${payment.error_description}`);
    }

    // 5. Handle refund.processed
    else if (event === 'refund.processed') {
      const refund = payload?.refund?.entity;
      if (!refund) return;

      const razorpayPaymentId = refund.payment_id;

      // Find the order by razorpayPaymentId
      const snapshot = await db.collection('orders')
        .where('razorpayPaymentId', '==', razorpayPaymentId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        logger.warn(`[Webhook] No order found for refund on payment: ${razorpayPaymentId}`);
        return;
      }

      const orderRef = snapshot.docs[0].ref;
      await orderRef.update({
        paymentStatus: 'refunded',
        refundId: refund.id,
        refundAmount: refund.amount / 100,
        refundProcessedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      logger.info(`[Webhook] ✅ Refund ${refund.id} processed for payment ${razorpayPaymentId}`);
    }

    else {
      logger.debug(`[Webhook] Unhandled event type: ${event}`);
    }

  } catch (err) {
    // We already sent 200 to Razorpay; log the error for our own monitoring
    logger.error(`[Webhook] Error processing event "${event}":`, err.message);
  }
};

module.exports = { handleWebhook };
