const { getFirebase } = require('../config/firebase');

const USERS_COLLECTION = 'users';
const ADMINS_COLLECTION = 'admins';

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '').slice(-10);

const toPlainUser = (doc) => {
  if (!doc?.exists) return null;
  const data = doc.data() || {};
  return {
    id: doc.id,
    ...data,
  };
};

const getUsers = async ({ role, isActive, search, limit = 20, skip = 0 }) => {
  const { db } = getFirebase();
  let query = db.collection(USERS_COLLECTION);

  if (role) {
    query = query.where('role', '==', role);
  }
  
  if (isActive !== undefined) {
    query = query.where('isActive', '==', isActive);
  }

  // Fetch without orderBy to avoid needing composite indexes.
  // We sort in memory after filtering, which is fine for admin use.
  const snapshot = await query.get();
  let users = snapshot.docs.map(toPlainUser).filter(Boolean);


  // Sort by creation date descending (in memory)
  users.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter(u =>
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.phone || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q)
    );
  }

  const total = users.length;
  const paginated = users.slice(skip, skip + limit);

  return { users: paginated, total };
};

const getAllUsers = async () => {
  // Keeping this for legacy but with a warning. Should be replaced by getUsers.
  console.warn('getAllUsers called. This is a performance risk for large datasets.');
  const { db } = getFirebase();
  const snap = await db.collection(USERS_COLLECTION).limit(1000).get();
  return snap.docs.map((doc) => toPlainUser(doc)).filter(Boolean);
};

const findUserByPhone = async (phone) => {
  const { db } = getFirebase();
  const cleanPhone = normalizePhone(phone);
  const snap = await db
    .collection(USERS_COLLECTION)
    .where('phone', '==', cleanPhone)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return toPlainUser(snap.docs[0]);
};

const findUserByEmail = async (email) => {
  if (!email) return null;
  const { db } = getFirebase();
  const snap = await db
    .collection(USERS_COLLECTION)
    .where('email', '==', String(email).toLowerCase().trim())
    .limit(1)
    .get();

  if (snap.empty) return null;
  return toPlainUser(snap.docs[0]);
};

const findUserByFirebaseUid = async (uid) => {
  if (!uid) return null;
  const { db } = getFirebase();
  const snap = await db
    .collection(USERS_COLLECTION)
    .where('firebaseUid', '==', uid)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return toPlainUser(snap.docs[0]);
};

const findUserById = async (id) => {
  const { db } = getFirebase();
  const doc = await db.collection(USERS_COLLECTION).doc(String(id)).get();
  return toPlainUser(doc);
};

const createUser = async (userData) => {
  const { db } = getFirebase();
  const now = new Date().toISOString();
  const docRef = db.collection(USERS_COLLECTION).doc();

  const payload = {
    phone: normalizePhone(userData.phone),
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
    email: userData.email || '',
    password: userData.password || '',
    role: userData.role || 'customer',
    isActive: userData.isActive !== undefined ? userData.isActive : true,
    isVerified: userData.isVerified || false,
    hasPassword: userData.hasPassword || false,
    address: userData.address || {},
    profileComplete: userData.profileComplete || false,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(payload);
  return { id: docRef.id, ...payload };
};

const updateUser = async (userId, updateData) => {
  const { db } = getFirebase();
  const docRef = db.collection(USERS_COLLECTION).doc(String(userId));
  const existing = await docRef.get();
  if (!existing.exists) return null;

  const current = existing.data() || {};
  const payload = { ...updateData, updatedAt: new Date().toISOString() };

  if (updateData.address) {
    payload.address = { ...(current.address || {}), ...updateData.address };
  }

  if (updateData.phone) {
    payload.phone = normalizePhone(updateData.phone);
  }

  await docRef.set(payload, { merge: true });
  const updated = await docRef.get();
  return toPlainUser(updated);
};

// ─── Admin Helpers ────────────────────────────────────────────────────────────
const findAdminByEmail = async (email) => {
  if (!email) return null;
  const { db } = getFirebase();
  const snap = await db
    .collection(ADMINS_COLLECTION)
    .where('email', '==', String(email).toLowerCase().trim())
    .limit(1)
    .get();

  if (snap.empty) return null;
  return toPlainUser(snap.docs[0]);
};

const findAdminById = async (id) => {
  const { db } = getFirebase();
  const doc = await db.collection(ADMINS_COLLECTION).doc(String(id)).get();
  return toPlainUser(doc);
};

const createAdmin = async (adminData) => {
  const { db } = getFirebase();
  const now = new Date().toISOString();
  const docRef = db.collection(ADMINS_COLLECTION).doc();

  const payload = {
    firstName: adminData.firstName || 'Admin',
    lastName: adminData.lastName || '',
    name: adminData.name || `${adminData.firstName || 'Admin'} ${adminData.lastName || ''}`.trim(),
    email: adminData.email.toLowerCase().trim(),
    phone: adminData.phone || '',
    password: adminData.password,
    role: 'admin',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(payload);
  return { id: docRef.id, ...payload };
};

module.exports = {
  getAllUsers,
  getUsers,
  findUserByPhone,
  findUserByEmail,
  findUserByFirebaseUid,
  findUserById,
  createUser,
  updateUser,
  // Admin exports
  findAdminByEmail,
  findAdminById,
  createAdmin,
};
