// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAuth } from "firebase/auth"; // Import Authentication
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZ-ejPIrPBS23wJVFupsqFPxSHKci5CnE",
  authDomain: "famous-letterpress.firebaseapp.com",
  projectId: "famous-letterpress",
  storageBucket: "famous-letterpress.firebasestorage.app",
  messagingSenderId: "737262161611",
  appId: "1:737262161611:web:9c8aba77848fc0b338954e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app)

export { db, storage };