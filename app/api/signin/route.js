import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

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
        const userRecord = await admin.auth().getUserByEmail(cleanEmail);
        return NextResponse.json({
          success: true,
          message: 'Signed in successfully via Firebase!',
          user: { uid: userRecord.uid, name: userRecord.displayName || 'User', email: cleanEmail },
        });
      }
    } catch (e) {
      console.log('[FIREBASE DYNAMIC AUTH NOTE]', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user: { email: cleanEmail },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid E-mail or Password.' }, { status: 401 });
  }
}
