// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZ-ejPIrPBS23wJVFupsqFPxSHKci5CnE",
  authDomain: "famous-letterpress.firebaseapp.com",
  projectId: "famous-letterpress",
  storageBucket: "famous-letterpress.appspot.com", // Updated to standard format
  messagingSenderId: "737262161611",
  appId: "1:737262161611:web:9c8aba77848fc0b338954e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Enable persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firebase persistence not available');
    }
  });

// Initialize Authentication and Storage
const auth = getAuth(app);
const storage = getStorage(app);

// Export Firebase services
export { db, auth, storage };