import admin from "firebase-admin";

let firebaseAdminApp = null;

export function initFirebaseAdmin() {
  if (firebaseAdminApp) return firebaseAdminApp;
  if (admin.apps && admin.apps.length > 0) {
    firebaseAdminApp = admin.apps[0];
    return firebaseAdminApp;
  }

  try {
    // 1. Try FIREBASE_SERVICE_ACCOUNT JSON object/string
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const rawSa =
          typeof process.env.FIREBASE_SERVICE_ACCOUNT === "string"
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : process.env.FIREBASE_SERVICE_ACCOUNT;

        const serviceAccount = { ...rawSa };
        if (serviceAccount.private_key && typeof serviceAccount.private_key === "string") {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
        }

        firebaseAdminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log("[Firebase Admin] Initialized with FIREBASE_SERVICE_ACCOUNT JSON.");
        return firebaseAdminApp;
      } catch (jsonErr) {
        console.warn("[Firebase Admin] Failed parsing FIREBASE_SERVICE_ACCOUNT:", jsonErr.message);
      }
    }

    // 2. Try individual cert env variables
    const projectId = process.env.FIREBASE_PROJECT_ID || "sajilomarts-cf2fb";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (privateKey && clientEmail) {
      if (typeof privateKey === "string") {
        privateKey = privateKey.replace(/\\n/g, "\n");
      }
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log("[Firebase Admin] Initialized with individual cert credentials.");
      return firebaseAdminApp;
    }

    // 3. Fallback to basic project config
    firebaseAdminApp = admin.initializeApp({
      projectId
    });
    console.log("[Firebase Admin] Initialized with Project ID fallback:", projectId);
    return firebaseAdminApp;
  } catch (err) {
    console.warn("[Firebase Admin Warning]: Could not initialize Firebase Admin SDK:", err.message);
    return null;
  }
}

export async function verifyFirebaseIdToken(idToken) {
  if (!idToken) return null;
  const app = initFirebaseAdmin();
  if (!app) return null;

  try {
    // Fast timeout race (2500ms max) to prevent blocking authentication
    const verifyPromise = admin.auth(app).verifyIdToken(idToken);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firebase token verification timeout")), 2500)
    );
    const decoded = await Promise.race([verifyPromise, timeoutPromise]);
    return decoded;
  } catch (err) {
    console.warn("[Firebase Admin Token Verify]:", err.message);
    return null;
  }
}

export default admin;
