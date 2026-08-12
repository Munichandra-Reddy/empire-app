import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('[NEXT.JS FIREBASE ADMIN] Initialized via Environment Variables');
    } else {
      // Local fallback key if present (ignored during production build if absent)
      try {
        const serviceAccount = require('../serviceAccountKey.json.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('[NEXT.JS FIREBASE ADMIN] Initialized via local Service Account Key');
      } catch (e) {
        console.log('[NEXT.JS FIREBASE ADMIN NOTE] No local key file found. Using environment variables mode.');
      }
    }
  } catch (err) {
    console.log('[NEXT.JS FIREBASE ADMIN NOTE] Running in fallback mode:', err.message);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export default admin;
