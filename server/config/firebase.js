import admin from "firebase-admin";
import crypto from "node:crypto";

let firebaseAdminApp = null;
let googleCertsCache = { certs: null, expiresAt: 0 };
let fetchCertsPromise = null;

// Pre-fetch Google public certificates in the background
async function getGooglePublicCerts(forceRefresh = false) {
  if (!forceRefresh && googleCertsCache.certs && Date.now() < googleCertsCache.expiresAt) {
    return googleCertsCache.certs;
  }
  if (fetchCertsPromise) {
    return fetchCertsPromise;
  }

  fetchCertsPromise = (async () => {
    try {
      const res = await fetch(
        "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
        { signal: AbortSignal.timeout(3000) }
      );
      if (res.ok) {
        const certs = await res.json();
        // Parse cache-control max-age if available, default to 6 hours
        let maxAgeMs = 6 * 60 * 60 * 1000;
        const cacheControl = res.headers.get("cache-control");
        if (cacheControl) {
          const match = cacheControl.match(/max-age=(\d+)/i);
          if (match) {
            maxAgeMs = parseInt(match[1], 10) * 1000;
          }
        }
        googleCertsCache = {
          certs,
          expiresAt: Date.now() + Math.max(maxAgeMs, 60 * 1000)
        };
        return certs;
      }
    } catch (err) {
      console.warn("[Firebase Token Cert Fetch Warning]:", err.message);
    } finally {
      fetchCertsPromise = null;
    }
    return googleCertsCache.certs || {};
  })();

  return fetchCertsPromise;
}

// Prefetch certs asynchronously on module load
getGooglePublicCerts().catch(() => {});

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
    return firebaseAdminApp;
  } catch (err) {
    console.warn("[Firebase Admin Warning]: Could not initialize Firebase Admin SDK:", err.message);
    return null;
  }
}

/**
 * High-speed cryptographic Firebase ID Token verification using cached Google public certificates.
 * Runs in <1ms without network roundtrips once certs are cached.
 */
async function verifyWithGooglePublicCerts(idToken, projectId = "sajilomarts-cf2fb") {
  if (!idToken || typeof idToken !== "string") return null;
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));

    const now = Math.floor(Date.now() / 1000);
    // Expiration check (allow 5 min clock skew)
    if (payload.exp && payload.exp < now - 300) return null;
    if (payload.iat && payload.iat > now + 300) return null;
    if (payload.aud && payload.aud !== projectId) return null;
    if (payload.iss && payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (!payload.sub && !payload.user_id) return null;

    let certs = await getGooglePublicCerts();
    let cert = certs[header.kid];

    // If key not in cache, refresh once
    if (!cert) {
      certs = await getGooglePublicCerts(true);
      cert = certs[header.kid];
    }

    if (!cert) return null;

    const data = Buffer.from(parts[0] + "." + parts[1]);
    const signature = Buffer.from(parts[2], "base64url");

    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(data);
    const isValid = verifier.verify(cert, signature);

    if (isValid) {
      return {
        uid: payload.user_id || payload.sub,
        sub: payload.sub,
        email: payload.email,
        phone_number: payload.phone_number,
        name: payload.name,
        picture: payload.picture,
        firebase: payload.firebase
      };
    }
  } catch (e) {
    // Non-fatal parse or verification exception
  }
  return null;
}

export async function verifyFirebaseIdToken(idToken) {
  if (!idToken) return null;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    "sajilomarts-cf2fb";

  // 1. Fast cryptographic RS256 verification with in-memory Google public certs (<1ms)
  try {
    const verified = await verifyWithGooglePublicCerts(idToken, projectId);
    if (verified) {
      return verified;
    }
  } catch {}

  // 2. Official Admin SDK fallback (tight 500ms timeout)
  const app = initFirebaseAdmin();
  if (app) {
    try {
      const verifyPromise = admin.auth(app).verifyIdToken(idToken);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firebase token verification timeout")), 500)
      );
      const decoded = await Promise.race([verifyPromise, timeoutPromise]);
      if (decoded) return decoded;
    } catch (err) {
      // Ignore fallback timeout
    }
  }

  return null;
}

export default admin;
