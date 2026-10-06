import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBDNeSC26NH00lIuxZQA_GaBDXcicywdM4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "yatraki.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "yatraki",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "yatraki.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "315534724848",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:315534724848:web:yatrakiwebdefault"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
