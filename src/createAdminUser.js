// This script creates an initial admin user for the Famous Letterpress application
// It can be run once to set up the first administrator account
// You can run this in a Node.js environment or adapt it into a component

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Replace with your desired admin email and password
const ADMIN_EMAIL = "admin@famousletterpress.com";
const ADMIN_PASSWORD = "adminpassword123"; // Use a strong password in production

/**
 * Checks if an admin user already exists in the system
 * @returns {Promise<boolean>} True if admin exists, false otherwise
 */
const checkAdminExists = async () => {
  try {
    const usersRef = collection(db, "users");
    const adminQuery = query(usersRef, where("role", "==", "admin"));
    const querySnapshot = await getDocs(adminQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking for existing admin:", error);
    return false;
  }
};

/**
 * Creates an admin user in Firebase Authentication and Firestore
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Created user object
 */
const createAdminUser = async (email = ADMIN_EMAIL, password = ADMIN_PASSWORD) => {
  try {
    // First check if admin already exists
    const adminExists = await checkAdminExists();
    if (adminExists) {
      console.log("Admin user already exists. Skipping creation.");
      return null;
    }
    
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // Store the user's role and metadata in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      role: "admin",
      createdAt: new Date().toISOString(),
      displayName: "System Administrator",
      isActive: true
    });
    
    console.log("Admin user created successfully!");
    return userCredential.user;
  } catch (error) {
    console.error("Error creating admin user:", error);
    if (error.code === "auth/email-already-in-use") {
      console.log("Email already in use. Please choose another email or reset the password for this account.");
    }
    throw error;
  }
};

// Optional: Call the function to create the admin user if this script is run directly
// Uncomment the next line to run it automatically
// createAdminUser();

export { createAdminUser, checkAdminExists };