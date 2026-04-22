const admin = require('firebase-admin');

// Initialize Firebase Admin
const initFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Use service account file directly
      const serviceAccount = require('../../niraa-4144f-firebase-adminsdk-fbsvc-5bf04678ac.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    console.log('✅ Firebase Admin initialized');
    return {
      db: admin.firestore(),
      auth: admin.auth(),
      storage: admin.storage(),
      admin
    };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
};

// Get initialized Firebase instances
let firebaseInstances = null;

const getFirebase = () => {
  if (!firebaseInstances) {
    firebaseInstances = initFirebase();
  }
  return firebaseInstances;
};

module.exports = {
  initFirebase,
  getFirebase
};