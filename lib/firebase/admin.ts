import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp: ReturnType<typeof initializeApp> | null = null;
const ADMIN_APP_NAME = "sajilomarts-auth";

function buildServiceAccountFromEnv() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return {
        ...parsed,
        private_key: typeof parsed.private_key === "string"
          ? parsed.private_key.replace(/\\n/g, "\n")
          : parsed.private_key
      };
    } catch (error) {
      console.error("Invalid FIREBASE_SERVICE_ACCOUNT JSON", error);
      return null;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const encodedPrivateKey = process.env.FIREBASE_PRIVATE_KEY_BASE64;

  if (projectId && clientEmail && (privateKey || encodedPrivateKey)) {
    const resolvedPrivateKey = privateKey
      ? privateKey.replace(/\\n/g, "\n")
      : Buffer.from(encodedPrivateKey!, "base64").toString("utf8");

    return {
      type: "service_account",
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
      private_key: resolvedPrivateKey,
      client_email: clientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
    };
  }

  return null;
}

export function getFirebaseAdminApp() {
  if (adminApp) return adminApp;

  try {
    const serviceAccount = buildServiceAccountFromEnv();
    if (serviceAccount) {
      adminApp = getApps().some((app) => app.name === ADMIN_APP_NAME)
        ? getApp(ADMIN_APP_NAME)
        : initializeApp({ credential: cert(serviceAccount as any) }, ADMIN_APP_NAME);
      return adminApp;
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      adminApp = getApps().some((app) => app.name === ADMIN_APP_NAME)
        ? getApp(ADMIN_APP_NAME)
        : initializeApp(undefined, ADMIN_APP_NAME);
      return adminApp;
    }
  } catch (err) {
    console.warn("Firebase Admin initialization warning:", err);
    adminApp = null;
  }

  return null;
}

export function getFirebaseAdminAuth() {
  try {
    const app = getFirebaseAdminApp();
    if (!app) return null;
    return getAuth(app);
  } catch (err) {
    console.warn("Failed to get Firebase Admin Auth:", err);
    return null;
  }
}
