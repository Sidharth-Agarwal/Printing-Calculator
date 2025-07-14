import React, { createContext, useState, useContext, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  getAuth
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

  // Register a new user (keeping for compatibility, but not used in new flow)
  const register = async (email, password, displayName, role = "staff") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create a user document in Firestore with the role and display name
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName: displayName || email.split('@')[0], // Use part of email as display name if none provided
        role,
        createdAt: new Date().toISOString(),
        isActive: true,
        hasAccount: true
      });
      return userCredential;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Send password reset email for users
  const sendUserPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Error sending password reset:", error);
      throw error;
    }
  };

  // Update user status (activate/deactivate)
  const updateUserStatus = async (userId, isActive, reason = null) => {
    try {
      const updateData = {
        isActive,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.uid
      };
      
      if (!isActive && reason) {
        updateData.deactivatedAt = new Date().toISOString();
        updateData.deactivationReason = reason;
      }
      
      await updateDoc(doc(db, "users", userId), updateData);
      return true;
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (userId, profileData) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...profileData,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.uid
      });
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  // Record user login (call this from login success)
  const recordUserLogin = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      const currentLoginCount = userDoc.exists() ? (userDoc.data()?.loginCount || 0) : 0;
      
      await updateDoc(doc(db, "users", userId), {
        lastLoginAt: new Date().toISOString(),
        loginCount: currentLoginCount + 1
      });
    } catch (error) {
      console.error("Error recording user login:", error);
      // Don't throw error as this is not critical
    }
  };

  // Login a user (updated to record login, clear temp passwords, and check active status)
  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        // Check if user is active before allowing login
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if user account is active
          if (userData.isActive === false) {
            // Sign out the user immediately
            await signOut(auth);
            throw new Error("Your account has been deactivated. Please contact an administrator.");
          }
          
          // Record the login
          await recordUserLogin(result.user.uid);
          
          // Clear temp password if it exists (after email reset)
          if (userData.temporaryPassword) {
            await updateDoc(doc(db, "users", result.user.uid), {
              temporaryPassword: null,
              passwordCreatedAt: null,
              updatedAt: new Date().toISOString()
            });
            console.log("Cleared temporary password after email reset login");
          }
        } else {
          // User document doesn't exist in Firestore
          await signOut(auth);
          throw new Error("User account not found. Please contact an administrator.");
        }
      }
      
      return result;
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
      
      // Clear temporary password if it exists
      await updateDoc(doc(db, "users", currentUser.uid), {
        temporaryPassword: null,
        passwordCreatedAt: null,
        updatedAt: new Date().toISOString()
      });
      
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
    updateUserDisplayName,
    
    // User management methods
    sendUserPasswordReset,
    updateUserStatus,
    updateUserProfile,
    recordUserLogin
  };

  // Return the provider with the value and children
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;