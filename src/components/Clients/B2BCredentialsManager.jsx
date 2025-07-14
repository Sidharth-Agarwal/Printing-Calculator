import React, { useState, useEffect } from "react";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const B2BCredentialsManager = ({ client, onClose, onSuccess, adminCredentials }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");
  
  // Fetch existing credentials or create new ones
  useEffect(() => {
    const initializeCredentials = async () => {
      // Skip password verification if auto-approved
      const isAutoApproved = adminCredentials?.password === "auto-approved";
      
      if (!isAutoApproved && (!adminCredentials || !adminCredentials.email || !adminCredentials.password)) {
        setError("Admin credentials are required. Please try again.");
        return;
      }
      
      setLoading(true);
      
      try {
        // Check if client already has credentials
        if (client.temporaryPassword) {
          // Just show existing credentials
          setGeneratedCredentials({
            email: client.email,
            password: client.temporaryPassword,
            timestamp: client.passwordCreatedAt || new Date().toISOString()
          });
          
          setSuccess("Retrieved existing client credentials.");
          setLoading(false);
          return;
        }
        
        // Check if client has an account but no stored password
        if (client.hasAccount || client.userId) {
          // User account exists, but we don't have the password
          // Just show reset password option
          setSuccess("This client already has an account. You can send a password reset email.");
          setLoading(false);
          return;
        }
        
        // Check if this email is already used in Firebase Auth
        const auth = getAuth();
        try {
          // Try to fetch sign-in methods for the email
          const signInMethods = await fetchSignInMethodsForEmail(auth, client.email);
          
          if (signInMethods && signInMethods.length > 0) {
            // Email is already in use
            setError("This email is already registered in the authentication system. Please use a different email.");
            setLoading(false);
            return;
          }
        } catch (fetchError) {
          console.error("Error checking existing email:", fetchError);
          // Continue anyway - we'll do another check in createClientAccount
        }
        
        // If we get here, we need to create a new account
        await createClientAccount();
      } catch (error) {
        console.error("Error initializing credentials:", error);
        setError("An error occurred: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (client && adminCredentials) {
      initializeCredentials();
    }
  }, [client, adminCredentials]);

  // Create a new client account
  const createClientAccount = async () => {
    try {
      // Skip admin verification if auto-approved
      const isAutoApproved = adminCredentials?.password === "auto-approved";
      
      if (!isAutoApproved) {
        // Store current auth
        const adminAuth = getAuth();
        
        // First, check if user already exists in Firebase Auth
        try {
          // Try to sign in with a wrong password to check if user exists
          // This is a standard Firebase pattern to check existence
          await signInWithEmailAndPassword(adminAuth, client.email, "check-existence-only");
          // If we get here without error, the user already exists (which shouldn't happen)
          throw new Error("This email already exists in authentication system");
        } catch (checkError) {
          // If the error code is user-not-found, we can proceed with creating the user
          // Any other error means the user exists
          if (checkError.code !== "auth/user-not-found") {
            // User already exists - check if it's our error or a real existing account
            if (checkError.code === "auth/wrong-password") {
              setError("An account with this email already exists. Please use a different email or delete the existing account.");
              return;
            } else if (checkError.message && checkError.message.includes("already exists")) {
              setError(checkError.message);
              return;
            }
          }
          // If we get here, the user doesn't exist and we can create a new account
        }
      }
      
      // Generate random password
      const generatedPassword = generateRandomPassword();
      
      // Create a secondary auth for the new user
      const clientAuth = getAuth();
      
      // Sign out of secondary auth if needed
      if (clientAuth.currentUser) {
        await clientAuth.signOut();
      }
      
      // Create the client user account
      const userCredential = await createUserWithEmailAndPassword(
        clientAuth,
        client.email,
        generatedPassword
      );
      
      // Create user record in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: client.email,
        displayName: client.name,
        role: "b2b",
        createdAt: new Date().toISOString(),
        isActive: true,
        clientId: client.id // Reference to the client record
      });
      
      // Update client record with userId reference
      await updateDoc(doc(db, "clients", client.id), {
        userId: userCredential.user.uid,
        hasAccount: true,
        temporaryPassword: generatedPassword, // Store for reference
        passwordCreatedAt: new Date().toISOString()
      });
      
      // Store the credentials for display
      setGeneratedCredentials({
        email: client.email,
        password: generatedPassword,
        timestamp: new Date().toISOString()
      });
      
      setSuccess("B2B client account created successfully!");
      
      // Re-authenticate admin only if not auto-approved
      if (!isAutoApproved) {
        try {
          // Force URL to stay at /clients to prevent redirection
          window.history.pushState({}, "", "/clients");
          
          // This will ensure the admin stays logged in
          await signInWithEmailAndPassword(
            getAuth(),
            adminCredentials.email,
            adminCredentials.password
          );
          
          // Force URL again just to be sure
          window.history.pushState({}, "", "/clients");
        } catch (authError) {
          console.error("Error re-authenticating admin:", authError);
          setError("Warning: Admin session may have been lost. Please refresh if needed.");
        }
      }
      
      // Update parent with new client state
      if (onSuccess) {
        onSuccess({
          ...client,
          userId: userCredential.user.uid,
          hasAccount: true,
          temporaryPassword: generatedPassword,
          passwordCreatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error creating client account:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError(`Failed to create account: ${error.message}`);
      }
      
      // Make sure admin stays logged in even on error (only if not auto-approved)
      const isAutoApproved = adminCredentials?.password === "auto-approved";
      if (!isAutoApproved) {
        try {
          const adminAuth = getAuth();
          
          // Force URL to stay at /clients to prevent redirection
          window.history.pushState({}, "", "/clients");
          
          await signInWithEmailAndPassword(
            adminAuth,
            adminCredentials.email,
            adminCredentials.password
          );
          
          // Force URL again just to be sure
          window.history.pushState({}, "", "/clients");
        } catch (e) {
          console.error("Error re-authenticating admin after error:", e);
        }
      }
    }
  };
  
  // Handle password reset
  const resetPassword = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setCopySuccess("");
    
    try {
      // Force URL to stay at /clients to prevent redirection
      window.history.pushState({}, "", "/clients");
      
      const auth = getAuth();
      await sendPasswordResetEmail(auth, client.email);
      
      // Force URL again just to be sure
      window.history.pushState({}, "", "/clients");
      
      setSuccess(`Password reset email sent to ${client.email}`);
      
      // Clear stored credentials
      setGeneratedCredentials(null);
      
      // Update client record
      await updateDoc(doc(db, "clients", client.id), {
        temporaryPassword: null,
        passwordCreatedAt: null
      });
      
      // Update parent state
      if (onSuccess) {
        const updatedClient = { ...client };
        delete updatedClient.temporaryPassword;
        delete updatedClient.passwordCreatedAt;
        onSuccess(updatedClient);
      }
    } catch (error) {
      console.error("Error sending password reset:", error);
      setError(`Failed to send password reset: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Copy credentials to clipboard
  const copyCredentials = () => {
    if (!generatedCredentials) return;
    
    const textToCopy = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess("Credentials copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 3000);
      })
      .catch(err => {
        console.error("Error copying text: ", err);
        setError("Failed to copy credentials");
      });
  };
  
  // Generate a random password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    
    // Generate a password with 10 characters
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    
    return password;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">B2B Client Account - {client.name}</h3>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">
                {success}
              </div>
            )}
            
            {copySuccess && (
              <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded text-sm">
                {copySuccess}
              </div>
            )}
            
            {/* Display generated credentials */}
            {generatedCredentials && (
              <div className="mb-6 p-4 bg-gray-50 border rounded-md">
                <h4 className="font-medium mb-2 text-sm">Client Credentials</h4>
                <div className="mb-3">
                  <p className="text-sm"><span className="font-semibold">Email:</span> {generatedCredentials.email}</p>
                  <p className="text-sm"><span className="font-semibold">Password:</span> {generatedCredentials.password}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created on: {formatDate(generatedCredentials.timestamp)}
                  </p>
                </div>
                <button
                  onClick={copyCredentials}
                  className="bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Credentials
                </button>
              </div>
            )}
            
            {/* Password reset button - always show this option for accounts */}
            {(client.hasAccount || client.userId) && (
              <div className="mb-4">
                <button
                  onClick={resetPassword}
                  className="bg-yellow-600 text-white py-2 px-4 rounded text-sm hover:bg-yellow-700"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Password Reset Email"}
                </button>
              </div>
            )}
          </>
        )}
        
        <div className="border-t pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default B2BCredentialsManager;