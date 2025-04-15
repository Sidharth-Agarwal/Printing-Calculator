import React, { createContext, useState, useContext, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDisplayName, setUserDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a new user
  const register = async (email, password, displayName, role = "staff") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create a user document in Firestore with the role and display name
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName: displayName || email.split('@')[0], // Use part of email as display name if none provided
        role,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      return userCredential;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Login a user
  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", email);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout a user
  const logout = async () => {
    try {
      console.log("Logging out...");
      return await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) {
      throw new Error("No user is logged in");
    }

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      
      // Change password
      await updatePassword(currentUser, newPassword);
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return userRole === role || userRole === "admin"; // Admin has access to everything
  };

  // Fetch user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      console.log("Fetching user data for:", uid);
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData);
        setUserRole(userData.role);
        setUserDisplayName(userData.displayName || null);
        return userData;
      } else {
        console.log("No user document found");
        setUserRole(null);
        setUserDisplayName(null);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserRole(null);
      setUserDisplayName(null);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserRole(null);
        setUserDisplayName(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Update user display name
  const updateUserDisplayName = async (uid, newDisplayName) => {
    try {
      await setDoc(doc(db, "users", uid), { displayName: newDisplayName }, { merge: true });
      setUserDisplayName(newDisplayName);
      return true;
    } catch (error) {
      console.error("Error updating display name:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    userDisplayName,
    loading,
    register,
    login,
    logout,
    changePassword,
    hasRole,
    updateUserDisplayName
  };

  // Return the provider with the value and children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;