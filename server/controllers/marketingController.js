// server/controllers/marketingController.js

const { getFirebase } = require('../config/firebase');
const { uploadBuffer, deleteImage } = require('../config/cloudinary');
const broadcastProvider = require('../services/broadcastProvider');
const logger = require('../utils/logger');

// Firestore collection names
const COLLECTIONS = {
  BANNERS: 'banners',
  BROADCAST_LOGS: 'broadcastLogs',
};

// Lazy-init Firestore so it doesn't crash on startup if Firebase isn't ready
const getDb = () => getFirebase().db;


// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Pull all unique 10-digit phone numbers from your existing MongoDB User collection.
 * The marketing module itself is Firebase-based, but customer data lives in MongoDB.
 */
const getCustomerPhones = async () => {
    const firebaseStorage = require('../utils/firebaseStorage');
    const users = await firebaseStorage.getAllUsers();

    return users
        .filter(u => u.role !== 'admin' && u.phone)
        .map((u) => String(u.phone).replace(/\D/g, '').slice(-10))
        .filter((p) => p.length === 10);
};

const nowISO = () => new Date().toISOString();

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * GET /api/marketing/stats
 */
exports.getMarketingStats = async (req, res) => {
    try {
        const firebaseStorage = require('../utils/firebaseStorage');
        const allUsers = await firebaseStorage.getAllUsers();
        const reachableCustomers = allUsers.filter(u => u.role !== 'admin' && u.phone).length;

        const [
            bannersSnap,
            recentLogsSnap,
        ] = await Promise.all([
            getDb().collection(COLLECTIONS.BANNERS).where('isActive', '==', true).count().get(),
            getDb().collection(COLLECTIONS.BROADCAST_LOGS)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get(),
        ]);

        const totalSentSnap = await getDb()
            .collection(COLLECTIONS.BROADCAST_LOGS)
            .where('status', '==', 'sent')
            .count()
            .get();

        const lastLogDoc = recentLogsSnap.docs.find(d => d.data().status === 'sent');
        const lastLog = lastLogDoc ? lastLogDoc.data() : null;

        return res.json({
            success: true,
            stats: {
                activeBanners: bannersSnap.data().count,
                totalBroadcasts: totalSentSnap.data().count,
                lastBroadcastAt: lastLog?.createdAt || null,
                lastRecipientCount: lastLog?.recipientCount || 0,
                reachableCustomers,
                activeProvider: broadcastProvider.activeProvider,
            },
        });
    } catch (err) {
        logger.error('[Marketing] getMarketingStats:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
    }
};

// ─── Broadcast ────────────────────────────────────────────────────────────────

/**
 * POST /api/marketing/broadcast
 * Body: { message: string, channel?: 'sms' | 'whatsapp' }
 */
exports.sendBroadcast = async (req, res) => {
    try {
        const { message, channel = 'sms' } = req.body;

        if (!message || message.trim().length < 5) {
            return res.status(400).json({ success: false, message: 'Message is too short (min 5 chars).' });
        }

        const phones = await getCustomerPhones();
        if (phones.length === 0) {
            return res.status(400).json({ success: false, message: 'No customers with valid phone numbers found.' });
        }

        // Create pending log in Firestore
        const logRef = getDb().collection(COLLECTIONS.BROADCAST_LOGS).doc();
        await logRef.set({
            id: logRef.id,
            message: message.trim(),
            channel,
            recipientCount: phones.length,
            status: 'pending',
            sentById: req.user?._id?.toString() || null,
            sentByName: req.user?.name || 'Admin',
            successCount: 0,
            failureCount: 0,
            providerRaw: null,
            createdAt: nowISO(),
            updatedAt: nowISO(),
        });

        // Respond immediately — broadcast fires in background
        res.json({
            success: true,
            message: `Broadcast queued for ${phones.length} customers via ${broadcastProvider.activeProvider}.`,
            logId: logRef.id,
            recipientCount: phones.length,
        });

        // Fire-and-forget
        broadcastProvider
            .send(phones, message.trim())
            .then(({ successCount, failureCount, raw }) =>
                logRef.update({
                    status: failureCount === phones.length ? 'failed' : failureCount > 0 ? 'partial' : 'sent',
                    successCount,
                    failureCount,
                    providerRaw: JSON.stringify(raw),
                    updatedAt: nowISO(),
                })
            )
            .catch((err) =>
                logRef.update({
                    status: 'failed',
                    providerRaw: JSON.stringify({ error: err.message }),
                    updatedAt: nowISO(),
                })
            );
    } catch (err) {
        logger.error('[Marketing] sendBroadcast:', err);
        return res.status(500).json({ success: false, message: 'Server error during broadcast.' });
    }
};

/**
 * GET /api/marketing/broadcast/logs
 */
exports.getBroadcastLogs = async (req, res) => {
    try {
        const snap = await getDb()
            .collection(COLLECTIONS.BROADCAST_LOGS)
            .orderBy('createdAt', 'desc')
            .limit(30)
            .get();

        const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json({ success: true, logs });
    } catch (err) {
        logger.error('[Marketing] getBroadcastLogs:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch logs.' });
    }
};

// ─── Banners ──────────────────────────────────────────────────────────────────

/**
 * GET /api/marketing/banners
 */
exports.getBanners = async (req, res) => {
    try {
        const snap = await getDb()
            .collection(COLLECTIONS.BANNERS)
            .orderBy('order', 'asc')
            .get();

        const banners = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json({ success: true, banners });
    } catch (err) {
        logger.error('[Marketing] getBanners:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
    }
};

/**
 * POST /api/marketing/banners
 * multipart/form-data: title, subtitle?, link?, order?, image? (file)
 */
exports.createBanner = async (req, res) => {
    try {
        const { title, subtitle = '', link = '', order = 0 } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Banner title is required.' });
        }

        let imageUrl = null;
        let imagePublicId = null;

        if (req.file) {
            const result = await uploadBuffer(req.file.buffer, { folder: 'niraa/banners' });
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }

        const docRef = getDb().collection(COLLECTIONS.BANNERS).doc();
        const banner = {
            id: docRef.id,
            title,
            subtitle,
            link,
            order: Number(order),
            imageUrl,
            imagePublicId,
            isActive: true,
            createdById: req.user?._id?.toString() || null,
            createdByName: req.user?.name || 'Admin',
            createdAt: nowISO(),
            updatedAt: nowISO(),
        };

        await docRef.set(banner);
        return res.status(201).json({ success: true, banner });
    } catch (err) {
        logger.error('[Marketing] createBanner:', err);
        return res.status(500).json({ success: false, message: 'Failed to create banner.' });
    }
};

/**
 * PUT /api/marketing/banners/:id
 * multipart/form-data: same fields as create; if image is sent, old one is replaced
 */
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = getDb().collection(COLLECTIONS.BANNERS).doc(id);
        const snap = await docRef.get();

        if (!snap.exists) {
            return res.status(404).json({ success: false, message: 'Banner not found.' });
        }

        const existing = snap.data();
        const { title, subtitle, link, order } = req.body;

        const updates = {
            ...(title !== undefined && { title }),
            ...(subtitle !== undefined && { subtitle }),
            ...(link !== undefined && { link }),
            ...(order !== undefined && { order: Number(order) }),
            updatedAt: nowISO(),
        };

        // Replace image if a new file is uploaded
        if (req.file) {
            // Delete old Cloudinary image (non-blocking)
            deleteImage(existing.imagePublicId);

            const result = await uploadBuffer(req.file.buffer, { folder: 'niraa/banners' });
            updates.imageUrl = result.secure_url;
            updates.imagePublicId = result.public_id;
        }

        await docRef.update(updates);
        const updated = { id, ...existing, ...updates };
        return res.json({ success: true, banner: updated });
    } catch (err) {
        logger.error('[Marketing] updateBanner:', err);
        return res.status(500).json({ success: false, message: 'Failed to update banner.' });
    }
};

/**
 * DELETE /api/marketing/banners/:id
 */
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = getDb().collection(COLLECTIONS.BANNERS).doc(id);
        const snap = await docRef.get();

        if (!snap.exists) {
            return res.status(404).json({ success: false, message: 'Banner not found.' });
        }

        // Delete Cloudinary image first (non-blocking)
        deleteImage(snap.data().imagePublicId);

        await docRef.delete();
        return res.json({ success: true, message: 'Banner deleted.' });
    } catch (err) {
        logger.error('[Marketing] deleteBanner:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete banner.' });
    }
};

/**
 * PATCH /api/marketing/banners/:id/toggle
 */
exports.toggleBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = getDb().collection(COLLECTIONS.BANNERS).doc(id);
        const snap = await docRef.get();

        if (!snap.exists) {
            return res.status(404).json({ success: false, message: 'Banner not found.' });
        }

        const newActive = !snap.data().isActive;
        await docRef.update({ isActive: newActive, updatedAt: nowISO() });

        return res.json({ success: true, banner: { id, ...snap.data(), isActive: newActive } });
    } catch (err) {
        logger.error('[Marketing] toggleBanner:', err);
        return res.status(500).json({ success: false, message: 'Failed to toggle banner.' });
    }
};