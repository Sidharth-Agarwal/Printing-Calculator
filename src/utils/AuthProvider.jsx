// src/utils/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig"; // Adjust path to Firebase config
import { onAuthStateChanged } from "firebase/auth";

// Create Auth Context
const AuthContext = createContext();

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Stores the logged-in user
  const [loading, setLoading] = useState(true); // Tracks loading state during auth check

  useEffect(() => {
    // Listen for auth state changes in Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Set loading to false after the auth state is resolved
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Render a loading screen while auth state is being resolved
  }

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to Access Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};
