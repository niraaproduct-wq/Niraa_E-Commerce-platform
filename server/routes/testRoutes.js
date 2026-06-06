const express = require('express');
const router = express.Router();

// IMPORTANT: Test routes are only active in development/staging environments.
// In production, all requests to /api/test will return 404.
if (process.env.NODE_ENV !== 'production') {
  router.get('/test', (req, res) => {
    res.json({ message: 'Test route working!', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // Health check with more detail (dev only)
  router.get('/env', (req, res) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      firebase: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      cloudinary: !!process.env.CLOUDINARY_API_KEY,
      razorpay: !!process.env.RAZORPAY_KEY_ID,
      resend: !!process.env.RESEND_API_KEY,
    });
  });
}

module.exports = router;