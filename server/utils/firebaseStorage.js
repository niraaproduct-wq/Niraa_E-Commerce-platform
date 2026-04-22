const { getFirebase } = require('../config/firebase');

const USERS_COLLECTION = 'users';

const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '').slice(-10);

const toPlainUser = (doc) => {
  if (!doc?.exists) return null;
  const data = doc.data() || {};
  return {
    id: doc.id,
    ...data,
  };
};

const getAllUsers = async () => {
  const { db } = getFirebase();
  const snap = await db.collection(USERS_COLLECTION).get();
  return snap.docs.map((doc) => toPlainUser(doc));
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

module.exports = {
  getAllUsers,
  findUserByPhone,
  findUserById,
  createUser,
  updateUser,
};
