import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";

// Firebase Client SDK Configuration
// NOTE: These VITE_ values are public browser-safe identifiers (not private secrets).
// They can also be set in Vercel Environment Variables for production.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

export const isFirebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let app = null;
try {
  if (isFirebaseEnabled) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
} catch (err) {
  console.warn("Firebase Client App initialization warning:", err);
}

export const firebaseApp = app;

let auth = null;
try {
  if (firebaseApp) {
    auth = getAuth(firebaseApp);
    setPersistence(auth, browserLocalPersistence).catch(() => {});
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

let analytics = null;
if (typeof window !== "undefined" && firebaseApp) {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(firebaseApp);
      } catch (err) {
        console.warn("Firebase Analytics initialization warning:", err);
      }
    }
  }).catch(() => {});
}

export { analytics, signInWithPopup };
export default firebaseApp;

