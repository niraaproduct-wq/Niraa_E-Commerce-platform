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

const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const upload = require('../middleware/upload');

// All marketing routes require a logged-in admin
router.use(protect, adminOnly);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', getMarketingStats);

// ── Broadcast ─────────────────────────────────────────────────────────────────
router.post('/broadcast', validate(schemas.marketing.sendBroadcast), sendBroadcast);
router.get('/broadcast/logs', getBroadcastLogs);

// ── Banners ───────────────────────────────────────────────────────────────────
router.get('/banners', getBanners);
router.post('/banners', upload.single('image'), validate(schemas.marketing.createBanner), createBanner);
router.put('/banners/:id', upload.single('image'), validate(schemas.marketing.updateBanner), updateBanner);
router.delete('/banners/:id', deleteBanner);
router.patch('/banners/:id/toggle', toggleBanner);

module.exports = router;