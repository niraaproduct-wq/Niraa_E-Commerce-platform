const express = require('express');
const router = express.Router();
const {
    sendBroadcast,
    getBroadcastLogs,
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBanner,
    getMarketingStats,
} = require('../controllers/marketingController');

// Import your existing auth middleware (adjust path if needed)
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All marketing routes require a logged-in admin
router.use(protect, adminOnly);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', getMarketingStats);

// ── Broadcast ─────────────────────────────────────────────────────────────────
router.post('/broadcast', sendBroadcast);
router.get('/broadcast/logs', getBroadcastLogs);

// ── Banners ───────────────────────────────────────────────────────────────────
router.get('/banners', getBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);
router.patch('/banners/:id/toggle', toggleBanner);

module.exports = router;