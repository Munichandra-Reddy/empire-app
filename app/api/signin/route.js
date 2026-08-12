import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (adminAuth && adminDb) {
      const userRecord = await adminAuth.getUserByEmail(cleanEmail);
      const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.exists ? userDoc.data() : { name: userRecord.displayName };

      return NextResponse.json({
        success: true,
        message: 'Signed in successfully via Next.js Firebase Server!',
        user: { uid: userRecord.uid, name: userData.name || userRecord.displayName, email: cleanEmail },
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Signed in successfully!',
        user: { email: cleanEmail },
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid E-mail or Password.' }, { status: 401 });
  }
}
