const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, refundPayment } = require('../controllers/paymentController');
const { handleWebhook } = require('../controllers/webhookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

// ──────────────────────────────────────────────────────────────────────────────
// WEBHOOK (must be BEFORE express.json() parses the body — raw body needed for
// signature verification). We register it here but the body parsing is
// handled in app.js with the rawBody middleware on this route.
// ──────────────────────────────────────────────────────────────────────────────
router.post('/webhook', express.json(), handleWebhook);

// ── Authenticated payment routes ──────────────────────────────────────────────
router.post('/create', protect, validate(schemas.payments.createOrder), createPaymentOrder);
router.post('/verify', protect, validate(schemas.payments.verify), verifyPayment);

// ── Admin-only refund ─────────────────────────────────────────────────────────
router.post('/refund', protect, adminOnly, validate(schemas.payments.refund), refundPayment);

module.exports = router;