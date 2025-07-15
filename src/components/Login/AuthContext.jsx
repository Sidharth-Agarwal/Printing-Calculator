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
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
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

  // Record user login (updated to work with Firestore document IDs)
  const recordUserLogin = async (firestoreDocId) => {
    try {
      console.log("Recording login for Firestore document ID:", firestoreDocId);
      
      const userDoc = await getDoc(doc(db, "users", firestoreDocId));
      if (!userDoc.exists()) {
        console.error("Cannot record login: User document not found:", firestoreDocId);
        return;
      }
      
      const currentLoginCount = userDoc.data()?.loginCount || 0;
      
      await updateDoc(doc(db, "users", firestoreDocId), {
        lastLoginAt: new Date().toISOString(),
        loginCount: currentLoginCount + 1
      });
      
      console.log("Login recorded successfully for document:", firestoreDocId);
    } catch (error) {
      console.error("Error recording user login:", error);
      // Don't throw error as this is not critical
    }
  };

  // Login a user (UPDATED to handle userId field structure)
  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        console.log("Firebase Auth successful, finding user document...");
        
        // Find user document by userId field (not document ID)
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("userId", "==", result.user.uid));
        const querySnapshot = await getDocs(userQuery);
        
        if (!querySnapshot.empty) {
          // Found user document
          const userDocRef = querySnapshot.docs[0];
          const userData = userDocRef.data();
          const firestoreDocId = userDocRef.id;
          
          console.log("Found user document:", { 
            firestoreId: firestoreDocId, 
            firebaseUID: result.user.uid,
            userData: userData 
          });
          
          // Check if user account is active
          if (userData.isActive === false) {
            await signOut(auth);
            throw new Error("Your account has been deactivated. Please contact an administrator.");
          }
          
          // Record the login using the Firestore document ID
          await recordUserLogin(firestoreDocId);
          
          // Clear temp password if it exists
          if (userData.temporaryPassword) {
            await updateDoc(doc(db, "users", firestoreDocId), {
              temporaryPassword: null,
              passwordCreatedAt: null,
              updatedAt: new Date().toISOString()
            });
            console.log("Cleared temporary password after login");
          }
          
        } else {
          // No user document found with matching userId
          console.error("No Firestore document found with userId:", result.user.uid);
          
          // Fallback: Check if document exists with document ID = Firebase UID (legacy)
          const legacyUserDoc = await getDoc(doc(db, "users", result.user.uid));
          
          if (legacyUserDoc.exists()) {
            console.log("Found legacy user document (document ID = Firebase UID)");
            const userData = legacyUserDoc.data();
            
            if (userData.isActive === false) {
              await signOut(auth);
              throw new Error("Your account has been deactivated. Please contact an administrator.");
            }
            
            await recordUserLogin(result.user.uid);
            
            if (userData.temporaryPassword) {
              await updateDoc(doc(db, "users", result.user.uid), {
                temporaryPassword: null,
                passwordCreatedAt: null,
                updatedAt: new Date().toISOString()
              });
            }
          } else {
            // No user document found at all
            console.error("User authenticated in Firebase but no Firestore document found");
            await signOut(auth);
            throw new Error("User account not found. Please contact an administrator.");
          }
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
      
      // Find and clear temporary password from Firestore document
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("userId", "==", currentUser.uid));
      const querySnapshot = await getDocs(userQuery);
      
      if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0];
        await updateDoc(doc(db, "users", userDocRef.id), {
          temporaryPassword: null,
          passwordCreatedAt: null,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Fallback for legacy users
        await updateDoc(doc(db, "users", currentUser.uid), {
          temporaryPassword: null,
          passwordCreatedAt: null,
          updatedAt: new Date().toISOString()
        });
      }
      
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

  // Fetch user data from Firestore (UPDATED to handle userId field structure)
  const fetchUserData = async (uid) => {
    try {
      console.log("Fetching user data for Firebase UID:", uid);
      
      // First try to find by userId field
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(userQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        console.log("Found user data by userId field:", userData);
        setUserRole(userData.role);
        setUserDisplayName(userData.displayName || null);
        return userData;
      }
      
      // Fallback: Try to find by document ID (legacy)
      const legacyUserDoc = await getDoc(doc(db, "users", uid));
      if (legacyUserDoc.exists()) {
        const userData = legacyUserDoc.data();
        console.log("Found user data by document ID (legacy):", userData);
        setUserRole(userData.role);
        setUserDisplayName(userData.displayName || null);
        return userData;
      }
      
      // No user found
      console.log("No user document found for UID:", uid);
      setUserRole(null);
      setUserDisplayName(null);
      return null;
      
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
      // Find user document by userId field
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(userQuery);
      
      if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0];
        await updateDoc(doc(db, "users", userDocRef.id), { 
          displayName: newDisplayName,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Fallback for legacy users
        await setDoc(doc(db, "users", uid), { displayName: newDisplayName }, { merge: true });
      }
      
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