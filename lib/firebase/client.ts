import { initializeApp, getApps, getApp } from "firebase/app";
import {
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBu4-U7nZ0GAMT_OQVSvs9xsU7gt9mN1Pk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "veyra-np.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "veyra-np",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "veyra-np.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "280582224883",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:280582224883:web:3db4d0ebcf1251f76d7086",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DQC76EG7D2"
};

export const isFirebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let app: any = null;
try {
  if (isFirebaseEnabled) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
} catch (err) {
  console.warn("Firebase Client App initialization warning:", err);
}

export const firebaseApp = app;

let auth: any = null;
try {
  if (firebaseApp) {
    auth = getAuth(firebaseApp);
  }
} catch (err) {
  console.warn("Firebase Client Auth initialization warning:", err);
}

export const firebaseAuth = auth;

export const googleProvider = firebaseAuth ? new GoogleAuthProvider() : null;

if (googleProvider) {
  try {
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch {}
}

export const appleProvider = firebaseAuth ? new OAuthProvider("apple.com") : null;

if (appleProvider) {
  try {
    appleProvider.addScope("email");
    appleProvider.addScope("name");
  } catch {}
}

export const firebaseAnalytics = firebaseApp && typeof window !== "undefined"
  ? isSupported().then((supported) => (supported ? getAnalytics(firebaseApp) : null)).catch(() => null)
  : null;

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
