import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC50U7Cm7A2exI-pE3VAik8GBWZoVVwZks",
  authDomain: "couple-app-9a656.firebaseapp.com",
  projectId: "couple-app-9a656",
  storageBucket: "couple-app-9a656.firebasestorage.app",
  messagingSenderId: "241617866257",
  appId: "1:241617866257:web:fb0da0adf2bbc63631ebb0",
  measurementId: "G-8CGKDYSWW5"
};

// Initialize Firebase (prevent re-initialization in development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore for storing game scores
export const db = getFirestore(app);

// Analytics (only on client side)
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
