const express = require('express');
const router = express.Router();
const {
  getPublicSections,
  getAdminSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  publishPage,
  revertSection,
  duplicateSection
} = require('../controllers/sectionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getFirebase } = require('../config/firebase');

// ==============================================
// PUBLIC ROUTES
// ==============================================
router.get('/:page', getPublicSections);

// ==============================================
// ADMIN ROUTES
// ==============================================
router.use(protect, adminOnly);

router.get('/admin/:page', getAdminSections);
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

// Bulk save sections endpoint (Firestore version)
router.put('/bulk/:page', async (req, res) => {
  const { page } = req.params;
  const { sections } = req.body;
  try {
    const { db } = getFirebase();
    const batch = db.batch();
    const SECTIONS_COLLECTION = 'pageSections';

    for (const section of sections) {
      if (section.id && section.id.length > 0) {
        const { id, _id, ...updateData } = section;
        const docRef = db.collection(SECTIONS_COLLECTION).doc(id);
        
        const payload = {
          ...updateData,
          page: page, // Ensure it belongs to the correct page
          lastEditedBy: req.user.id,
          status: 'draft',
          updatedAt: new Date().toISOString()
        };

        // Use set with merge: true to handle both create and update
        batch.set(docRef, payload, { merge: true });
      }
    }
    await batch.commit();
    res.json({ success: true, message: 'Sections saved successfully!' });
  } catch (error) {
    console.error('Bulk save error:', error);
    res.status(500).json({ success: false, message: 'Failed to save sections' });
  }
});

router.put('/:page/reorder', reorderSections);
router.post('/:page/publish', publishPage);
router.post('/:id/revert', revertSection);
router.post('/:id/duplicate', duplicateSection);

module.exports = router;