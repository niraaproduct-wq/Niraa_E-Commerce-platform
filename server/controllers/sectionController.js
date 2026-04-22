const { getFirebase } = require('../config/firebase');

const SECTIONS_COLLECTION = 'pageSections';

const toPlainSection = (doc) => {
  if (!doc.exists) return null;
  return { id: doc.id, _id: doc.id, ...doc.data() };
};

// ==============================================
// PUBLIC API (For customer view)
// ==============================================

// @desc    Get published sections for a page (public)
// @route   GET /api/sections/:page
// @access  Public
const getPublicSections = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { page } = req.params;

    const snapshot = await db.collection(SECTIONS_COLLECTION)
      .where('page', '==', page)
      .where('status', '==', 'published')
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get();

    const sections = snapshot.docs.map(toPlainSection);

    res.json({ success: true, sections, page });
  } catch (error) {
    console.error('Error fetching public sections:', error);
    res.status(500).json({ success: false, message: 'Failed to load page content' });
  }
};

// ==============================================
// ADMIN API (For editing)
// ==============================================

// @desc    Get all sections for a page including drafts
// @route   GET /api/sections/admin/:page
// @access  Private/Admin
const getAdminSections = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { page } = req.params;

    const snapshot = await db.collection(SECTIONS_COLLECTION)
      .where('page', '==', page)
      .orderBy('order', 'asc')
      .get();

    const sections = snapshot.docs.map(toPlainSection);

    res.json({ success: true, sections, page });
  } catch (error) {
    console.error('Error fetching admin sections:', error);
    res.status(500).json({ success: false, message: 'Failed to load sections' });
  }
};

// @desc    Create new section
// @route   POST /api/sections
// @access  Private/Admin
const createSection = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { page, type, data = {} } = req.body;

    // Get highest order number for this page
    const lastSnap = await db.collection(SECTIONS_COLLECTION)
      .where('page', '==', page)
      .orderBy('order', 'desc')
      .limit(1)
      .get();

    const nextOrder = lastSnap.empty ? 0 : (lastSnap.docs[0].data().order || 0) + 1;

    const sectionData = {
      page,
      type,
      order: nextOrder,
      status: 'draft',
      isActive: true,
      lastEditedBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    const docRef = await db.collection(SECTIONS_COLLECTION).add(sectionData);

    res.status(201).json({
      success: true,
      message: 'Section created',
      section: { id: docRef.id, _id: docRef.id, ...sectionData }
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ success: false, message: 'Failed to create section' });
  }
};

// @desc    Update section (saves to draft)
// @route   PUT /api/sections/:id
// @access  Private/Admin
const updateSection = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { id } = req.params;
    const updateData = { ...req.body };

    // Don't allow changing status via update — use publish endpoint
    delete updateData.status;

    const docRef = db.collection(SECTIONS_COLLECTION).doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const payload = {
      ...updateData,
      lastEditedBy: req.user.id,
      status: 'draft',
      updatedAt: new Date().toISOString()
    };

    await docRef.update(payload);
    const updated = await docRef.get();

    res.json({ success: true, message: 'Section saved as draft', section: toPlainSection(updated) });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ success: false, message: 'Failed to update section' });
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private/Admin
const deleteSection = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { id } = req.params;

    const docRef = db.collection(SECTIONS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const sectionData = doc.data();
    if (sectionData.isRequired) {
      return res.status(400).json({
        success: false,
        message: 'This is a required section and cannot be deleted'
      });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ success: false, message: 'Failed to delete section' });
  }
};

// @desc    Reorder sections
// @route   PUT /api/sections/:page/reorder
// @access  Private/Admin
const reorderSections = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { page } = req.params;
    const { sectionIds } = req.body;

    const batch = db.batch();
    for (let i = 0; i < sectionIds.length; i++) {
      const docRef = db.collection(SECTIONS_COLLECTION).doc(sectionIds[i]);
      batch.update(docRef, { order: i, lastEditedBy: req.user.id, updatedAt: new Date().toISOString() });
    }
    await batch.commit();

    const snapshot = await db.collection(SECTIONS_COLLECTION)
      .where('page', '==', page)
      .orderBy('order', 'asc')
      .get();

    const sections = snapshot.docs.map(toPlainSection);

    res.json({ success: true, message: 'Sections reordered', sections });
  } catch (error) {
    console.error('Error reordering sections:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder sections' });
  }
};

// @desc    Publish all draft sections for a page
// @route   POST /api/sections/:page/publish
// @access  Private/Admin
const publishPage = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { page } = req.params;

    const draftsSnap = await db.collection(SECTIONS_COLLECTION)
      .where('page', '==', page)
      .where('status', '==', 'draft')
      .get();

    const publishedCount = draftsSnap.size;
    const batch = db.batch();
    const publishedAt = new Date().toISOString();

    draftsSnap.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'published',
        publishedAt,
        lastEditedBy: req.user.id,
        updatedAt: publishedAt
      });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `Published ${publishedCount} section${publishedCount !== 1 ? 's' : ''} successfully`,
      publishedCount,
      publishedAt
    });
  } catch (error) {
    console.error('Error publishing page:', error);
    res.status(500).json({ success: false, message: 'Failed to publish changes' });
  }
};

// @desc    Revert section to published
// @route   POST /api/sections/:id/revert
// @access  Private/Admin
const revertSection = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { id } = req.params;

    const docRef = db.collection(SECTIONS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    if (doc.data().status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Section is not in draft status' });
    }

    await docRef.update({ status: 'published', updatedAt: new Date().toISOString() });
    const updated = await docRef.get();

    res.json({ success: true, message: 'Reverted to published version', section: toPlainSection(updated) });
  } catch (error) {
    console.error('Error reverting section:', error);
    res.status(500).json({ success: false, message: 'Failed to revert section' });
  }
};

// @desc    Duplicate section
// @route   POST /api/sections/:id/duplicate
// @access  Private/Admin
const duplicateSection = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { id } = req.params;

    const doc = await db.collection(SECTIONS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const original = doc.data();

    const lastSnap = await db.collection(SECTIONS_COLLECTION)
      .where('page', '==', original.page)
      .orderBy('order', 'desc')
      .limit(1)
      .get();

    const nextOrder = lastSnap.empty ? 0 : (lastSnap.docs[0].data().order || 0) + 1;

    const duplicateData = {
      ...original,
      order: nextOrder,
      status: 'draft',
      title: (original.title || '') + ' (Copy)',
      lastEditedBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newDocRef = await db.collection(SECTIONS_COLLECTION).add(duplicateData);

    res.status(201).json({
      success: true,
      message: 'Section duplicated',
      section: { id: newDocRef.id, _id: newDocRef.id, ...duplicateData }
    });
  } catch (error) {
    console.error('Error duplicating section:', error);
    res.status(500).json({ success: false, message: 'Failed to duplicate section' });
  }
};

module.exports = {
  getPublicSections,
  getAdminSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  publishPage,
  revertSection,
  duplicateSection
};