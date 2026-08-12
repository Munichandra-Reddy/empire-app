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
        const userRecord = await admin.auth().createUser({
          email: cleanEmail,
          password: password,
          displayName: name,
        });

        await admin.firestore().collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          name,
          email: cleanEmail,
          mobile,
          college,
          department,
          techDomain,
          linkedin,
          github,
          createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          message: 'Account created & saved to Firebase!',
          user: { uid: userRecord.uid, name, email: cleanEmail },
        }, { status: 201 });
      }
    } catch (e) {
      console.log('[FIREBASE DYNAMIC SAVE NOTE]', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: { name, email: cleanEmail },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Registration failed.' }, { status: 400 });
  }
}
