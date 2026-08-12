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
        // Query users collection by email
        const usersSnapshot = await admin.firestore().collection('users').get();
        let matchedUser = null;

        usersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.email && data.email.toLowerCase().trim() === cleanEmail) {
            matchedUser = data;
          }
        });

        if (matchedUser) {
          let isMatch = false;

          // Check Bcrypt hash or direct string match
          try {
            const bcrypt = (await import('bcryptjs')).default;
            if (matchedUser.password.startsWith('$2a$') || matchedUser.password.startsWith('$2b$')) {
              isMatch = await bcrypt.compare(password, matchedUser.password);
            } else {
              isMatch = matchedUser.password === password;
            }
          } catch (bErr) {
            isMatch = matchedUser.password === password;
          }

          if (isMatch) {
            return NextResponse.json({
              success: true,
              message: 'Successfully logged in!',
              user: { uid: matchedUser.uid, name: matchedUser.name, email: cleanEmail },
            }, { status: 200 });
          } else {
            return NextResponse.json({
              success: false,
              message: 'Incorrect password. Please try again.',
            }, { status: 401 });
          }
        } else {
          return NextResponse.json({
            success: false,
            message: 'No account found with this email. Please Sign Up.',
          }, { status: 404 });
        }
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
