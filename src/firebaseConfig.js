// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAuth } from "firebase/auth"; // Import Authentication
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtTTQE9MCLWWYrOMXRlzuI2xYrhmurUrM",
  authDomain: "printing-calculator-001.firebaseapp.com",
  projectId: "printing-calculator-001",
  storageBucket: "printing-calculator-001.firebasestorage.app",
  messagingSenderId: "152418448351",
  appId: "1:152418448351:web:8466e0395ae29e393f8a6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app)

export { db, storage };