const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const getFirebaseAdmin = () => {
  const existingApp = getApps()[0];
  if (existingApp) return getAuth(existingApp);

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    const error = new Error('Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON in backend/.env.');
    error.status = 503;
    throw error;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    const error = new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid service-account JSON.');
    error.status = 503;
    throw error;
  }

  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    const error = new Error('Firebase service-account JSON is missing project_id, client_email, or private_key.');
    error.status = 503;
    throw error;
  }

  const app = initializeApp({ credential: cert(serviceAccount) });
  return getAuth(app);
};

module.exports = getFirebaseAdmin;
