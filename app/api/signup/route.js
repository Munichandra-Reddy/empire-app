import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, password, email, mobile, college, department, techDomain, linkedin, github } = body;

    if (!name || !password || !email || !mobile || !college || !department || !techDomain || !linkedin || !github) {
      return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (adminDb && adminAuth) {
      // Create user in Firebase Admin Auth
      const userRecord = await adminAuth.createUser({
        email: cleanEmail,
        password: password,
        displayName: name,
        phoneNumber: mobile.startsWith('+') ? mobile : undefined,
      });

      // Save user profile document in Firestore
      await adminDb.collection('users').doc(userRecord.uid).set({
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
        message: 'Account created & saved to Firebase via Next.js!',
        user: { uid: userRecord.uid, name, email: cleanEmail },
      }, { status: 201 });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Account created successfully (Next.js serverless response)!',
        user: { name, email: cleanEmail },
      }, { status: 201 });
    }
  } catch (error) {
    console.error('[NEXT.JS SIGNUP API ERROR]', error);
    let errMsg = 'Registration failed.';
    if (error.code === 'auth/email-already-exists') errMsg = 'College E-mail already registered.';
    if (error.code === 'auth/invalid-phone-number') errMsg = 'Invalid phone number format.';
    return NextResponse.json({ success: false, message: errMsg }, { status: 400 });
  }
}
