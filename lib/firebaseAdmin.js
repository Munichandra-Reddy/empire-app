import admin from 'firebase-admin';

let adminAuth = null;
let adminDb = null;

try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
  }

  if (admin.apps.length) {
    adminAuth = admin.auth();
    adminDb = admin.firestore();
  }
} catch (e) {
  console.log('[FIREBASE ADMIN INIT NOTE]', e.message);
}

export { adminAuth, adminDb };
export default admin;
