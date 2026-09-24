const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let db;

try {
  if (getApps().length === 0) {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Cloud environment variable (Render, Railway, Heroku)
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } catch (err) {
        throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON environment variable: ' + err.message);
      }
    } else {
      // File-based credential (Local or Render Secret File)
      const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : path.join(__dirname, 'serviceAccountKey.json');

      if (!fs.existsSync(keyPath)) {
        throw new Error(
          `Firebase credentials not found. Provide FIREBASE_SERVICE_ACCOUNT_JSON env variable or place service account file at: ${keyPath}`
        );
      }

      serviceAccount = require(keyPath);
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  db = getFirestore();
  console.log(' Connected to Firebase Firestore successfully');
} catch (error) {
  console.error('❌ Firebase connection error:', error.message);
  throw error;
}

module.exports = {
  db,
  FieldValue,
};
