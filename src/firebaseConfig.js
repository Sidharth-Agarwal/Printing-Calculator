// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZ-ejPIrPBS23wJVFupsqFPxSHKci5CnE",
  authDomain: "famous-letterpress.firebaseapp.com",
  projectId: "famous-letterpress",
  storageBucket: "famous-letterpress.firebasestorage.app",
  messagingSenderId: "737262161611",
  appId: "1:737262161611:web:9c8aba77848fc0b338954e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence settings using the new cache API
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  cache: {
    kind: 'persistent',
    synchronizeTabs: true // This replaces enableMultiTabIndexedDbPersistence
  }
});

// Initialize Authentication and Storage
const auth = getAuth(app);
const storage = getStorage(app);

// Export Firebase services
export { db, auth, storage };