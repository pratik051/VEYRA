import { initializeApp, getApps, getApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup
} from "firebase/auth";

// Firebase Client SDK Configuration
// NOTE: These VITE_ values are public browser-safe identifiers (not private secrets).
// They can also be set in Vercel Environment Variables for production.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBu4-U7nZ0GAMT_OQVSvs9xsU7gt9mN1Pk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "veyra-np.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "veyra-np",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "veyra-np.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "280582224883",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:280582224883:web:3db4d0ebcf1251f76d7086",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DQC76EG7D2"
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

export { signInWithPopup };
export default firebaseApp;
