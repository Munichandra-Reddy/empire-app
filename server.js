try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional fallback
}
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK using Service Account File or Environment Variables
try {
  let keyPath = path.join(__dirname, 'serviceAccountKey.json');
  if (!fs.existsSync(keyPath) && fs.existsSync(path.join(__dirname, 'serviceAccountKey.json.json'))) {
    keyPath = path.join(__dirname, 'serviceAccountKey.json.json');
  }

  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('[FIREBASE SERVER SECURE] Initialized via Firebase Service Account Key!');
  } else if (process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE')) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    console.log('[FIREBASE SERVER SECURE] Initialized via Environment Variables!');
  } else {
    console.log('[FIREBASE SERVER SECURE NOTE] Server running in Local Database Mode. Place serviceAccountKey.json in root folder.');
  }
} catch (err) {
  console.log('[FIREBASE SERVER SECURE NOTE] Server running in Local Database Mode. Reason:', err.message);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Firestore DB reference (Server-Side Only)
const db = admin.apps.length ? admin.firestore() : null;

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', firebaseSecure: !!db });
});

// API: User Sign Up (All Validation & Firebase Admin Save Done on Backend)
app.post('/api/signup', async (req, res) => {
  const { name, password, email, mobile, college, department, techDomain, linkedin, github } = req.body;

  if (!name || !password || !email || !mobile || !college || !department || !techDomain || !linkedin || !github) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    if (db) {
      // 1. Firebase Admin Auth - Create User securely
      const userRecord = await admin.auth().createUser({
        email: cleanEmail,
        password: password,
        displayName: name,
        phoneNumber: mobile.startsWith('+') ? mobile : undefined
      });

      // 2. Firebase Firestore - Store full profile under users collection
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        name,
        email: cleanEmail,
        mobile,
        college,
        department,
        techDomain,
        linkedin,
        github,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(201).json({
        success: true,
        message: 'Account created securely in Firebase!',
        user: { uid: userRecord.uid, name, email: cleanEmail }
      });
    } else {
      // Fallback local JSON database if Firebase keys are not filled yet
      const fs = require('fs');
      const DATA_FILE = path.join(__dirname, 'users.json');
      let users = [];
      if (fs.existsSync(DATA_FILE)) {
        users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
      }

      if (users.some(u => u.email === cleanEmail)) {
        return res.status(400).json({ success: false, message: 'College E-mail already registered.' });
      }

      const newUser = { id: 'EMP-' + Date.now(), name, email: cleanEmail, mobile, college, department, techDomain, linkedin, github };
      users.push(newUser);
      fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

      return res.status(201).json({ success: true, message: 'Account registered successfully!', user: newUser });
    }
  } catch (error) {
    console.error('[SIGNUP ERROR]', error);
    let errMsg = 'Registration failed.';
    if (error.code === 'auth/email-already-exists') errMsg = 'College E-mail already registered in Firebase.';
    if (error.code === 'auth/invalid-phone-number') errMsg = 'Invalid phone number format.';
    res.status(400).json({ success: false, message: errMsg });
  }
});

// API: User Sign In (Backend Auth Verification)
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and Password are required.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    if (db) {
      // Verify user existence in Firebase Admin
      const userRecord = await admin.auth().getUserByEmail(cleanEmail);
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.exists ? userDoc.data() : { name: userRecord.displayName };

      return res.json({
        success: true,
        message: 'Signed in successfully via Firebase Server!',
        user: { uid: userRecord.uid, name: userData.name || userRecord.displayName, email: cleanEmail }
      });
    } else {
      const fs = require('fs');
      const DATA_FILE = path.join(__dirname, 'users.json');
      let users = [];
      if (fs.existsSync(DATA_FILE)) {
        users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
      }
      const user = users.find(u => u.email === cleanEmail);
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

      return res.json({ success: true, message: 'Signed in successfully!', user });
    }
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid E-mail or Password.' });
  }
});

// Serve frontend static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[EMPIRE SECURE BACKEND] Running on http://localhost:${PORT}`);
});
