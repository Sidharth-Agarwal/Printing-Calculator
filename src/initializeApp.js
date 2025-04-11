// This script initializes your application with necessary collections and settings
// You can run this once when setting up your application for the first time

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Define roles and their permissions
const ROLES = {
  admin: {
    description: "Full access to all system features",
    permissions: ["manage_users", "manage_rates", "manage_inventory", "billing", "reporting"]
  },
  staff: {
    description: "Can create bills, estimates, and handle transactions",
    permissions: ["billing", "estimates", "transactions"]
  },
  production: {
    description: "Can manage materials, papers, and dies",
    permissions: ["manage_inventory", "view_orders"]
  },
  b2b: {
    description: "Business clients can place and track their orders",
    permissions: ["place_orders", "view_own_orders", "view_estimates"]
  }
};

// Create initial admin user
const createAdminUser = async (email, password, displayName) => {
  try {
    // Check if user already exists
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      displayName: displayName || "System Administrator",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    console.log("Admin user created successfully!");
    return userCredential.user;
  } catch (error) {
    console.error("Error creating admin user:", error);
    return null;
  }
};

// Create roles collection
const initializeRoles = async () => {
  try {
    // Check if roles collection exists
    const rolesDoc = doc(db, "system", "roles");
    const rolesSnapshot = await getDoc(rolesDoc);
    
    if (!rolesSnapshot.exists()) {
      await setDoc(rolesDoc, { roles: ROLES });
      console.log("Roles initialized successfully!");
    } else {
      console.log("Roles collection already exists, skipping...");
    }
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
};

// Create system settings
const initializeSettings = async () => {
  try {
    const settingsDoc = doc(db, "system", "settings");
    const settingsSnapshot = await getDoc(settingsDoc);
    
    if (!settingsSnapshot.exists()) {
      await setDoc(settingsDoc, {
        companyName: "Famous Letterpress",
        taxRate: 18,
        currency: "INR",
        systemInitialized: true,
        initializedAt: new Date().toISOString()
      });
      console.log("System settings initialized successfully!");
    } else {
      console.log("System settings already exist, skipping...");
    }
  } catch (error) {
    console.error("Error initializing system settings:", error);
  }
};

// Main initialization function
const initializeApplication = async () => {
  console.log("Starting application initialization...");
  
  // 1. Initialize roles
  await initializeRoles();
  
  // 2. Initialize system settings
  await initializeSettings();
  
  // 3. Create admin user (uncomment and set values to create)
  // const adminEmail = "admin@famousletterpress.com";
  // const adminPassword = "change-this-password";
  // const adminName = "System Administrator";
  // await createAdminUser(adminEmail, adminPassword, adminName);
  
  console.log("Application initialization complete!");
};

// Run the initialization
// Comment this out after running once
// initializeApplication();

export { initializeApplication, createAdminUser };