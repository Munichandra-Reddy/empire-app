const admin = require('firebase-admin');
const path = require('path');

// STEP 1: Download your Service Account JSON key file from Firebase Console
// Name it 'serviceAccountKey.json' and place it in d:\EMP\
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('[FIREBASE ADMIN] Connected to Firebase Admin SDK successfully!');
} catch (err) {
  console.log('[FIREBASE ADMIN] Note: Place serviceAccountKey.json in root folder to activate Firebase Admin SDK.');
}

module.exports = admin;
