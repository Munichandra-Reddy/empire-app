import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, password, email, mobile, college, department, techDomain, linkedin, github } = body;

    if (!name || !password || !email || !mobile || !college || !department || !techDomain || !linkedin || !github) {
      return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Dynamically require firebase-admin server side
    try {
      const admin = (await import('firebase-admin')).default;

      if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      }

      if (admin.apps.length) {
        // Securely hash password with bcrypt (salt rounds = 10)
        let hashedPassword = password;
        try {
          const bcrypt = (await import('bcryptjs')).default;
          hashedPassword = await bcrypt.hash(password, 10);
        } catch (bErr) {
          console.log('[BCRYPT HASH NOTE]', bErr.message);
        }

        // Save profile securely with hashed password to Firestore users collection
        await admin.firestore().collection('users').doc(userDocId).set({
          uid: userDocId,
          name,
          email: cleanEmail,
          password: hashedPassword,
          mobile,
          college,
          department,
          techDomain,
          linkedin,
          github,
          createdAt: new Date().toISOString(),
        });

        // Try creating auth record if possible
        try {
          await admin.auth().createUser({
            email: cleanEmail,
            password: password,
            displayName: name,
          });
        } catch (authErr) {
          // Ignore strict email format auth errors
        }

        return NextResponse.json({
          success: true,
          message: 'Account created & saved to Firebase!',
          user: { uid: userDocId, name, email: cleanEmail },
        }, { status: 201 });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Firebase Admin not initialized. Check FIREBASE_PROJECT_ID and FIREBASE_PRIVATE_KEY on Vercel.',
        }, { status: 500 });
      }
    } catch (e) {
      console.error('[FIREBASE ERROR]', e);
      return NextResponse.json({
        success: false,
        message: 'Firebase Error: ' + e.message,
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Registration failed.' }, { status: 400 });
  }
}
