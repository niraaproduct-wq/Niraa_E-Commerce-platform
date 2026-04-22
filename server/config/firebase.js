const admin = require('firebase-admin');

// Initialize Firebase Admin
const initFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Load service account from environment variable (production safe)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // Fix newline characters in private key
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

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