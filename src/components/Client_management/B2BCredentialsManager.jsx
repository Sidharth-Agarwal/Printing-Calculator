import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const B2BCredentialsManager = ({ client, onClose, onSuccess, adminCredentials }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");
  
  // Fetch existing credentials if they exist when component mounts
  useEffect(() => {
    const fetchExistingCredentials = async () => {
      if (client.temporaryPassword) {
        setGeneratedCredentials({
          email: client.email,
          password: client.temporaryPassword,
          timestamp: client.passwordCreatedAt || new Date().toISOString()
        });
      }
    };
    
    fetchExistingCredentials();
  }, [client]);

  // Handles creating a new user account for the B2B client
  const createUserAccount = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setCopySuccess("");
    
    try {
      // Check if this client already has a user account linked
      if (client.userId) {
        // Get the existing user record
        const userDoc = await getDoc(doc(db, "users", client.userId));
        
        if (userDoc.exists()) {
          // User already exists - show option to reset password instead
          setSuccess("This client already has an account. You can send a password reset email.");
          setLoading(false);
          return;
        }
      }
      
      // Remember the current auth state before creating a new user
      const adminAuth = getAuth();
      const adminUser = adminAuth.currentUser;
      
      // Generate a random password
      const generatedPassword = generateRandomPassword();
      
      // Create a secondary auth instance for the new user
      // This approach is necessary to create a new user without logging out the admin
      const secondaryAuth = getAuth();
      
      // Sign out from the secondary auth instance (if there's a user)
      if (secondaryAuth.currentUser) {
        await secondaryAuth.signOut();
      }
      
      // Create user in Firebase Auth using the secondary auth instance
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
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
        temporaryPassword: generatedPassword, // Store the password temporarily for reference
        passwordCreatedAt: new Date().toISOString()
      });
      
      // Store the generated credentials for display
      setGeneratedCredentials({
        email: client.email,
        password: generatedPassword,
        timestamp: new Date().toISOString()
      });
      
      setSuccess("Account created successfully! The credentials are shown below.");
      
      // Re-authenticate the admin if credentials were provided
      if (adminCredentials && adminCredentials.email && adminCredentials.password) {
        try {
          await signInWithEmailAndPassword(
            adminAuth,
            adminCredentials.email,
            adminCredentials.password
          );
          console.log("Admin re-authenticated successfully");
        } catch (authError) {
          console.error("Error re-authenticating admin:", authError);
          setError("Warning: Admin session may have been lost. Please refresh and log in again if needed.");
        }
      }
      
      // Notify parent component
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
    } finally {
      setLoading(false);
    }
  };
  
  // Handles resetting password for existing account
  const resetPassword = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setCopySuccess("");
    
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, client.email);
      setSuccess(`Password reset email sent to ${client.email}`);
      
      // Clear any stored credentials since they'll no longer be valid
      setGeneratedCredentials(null);
      
      // Update client record to remove stored password
      await updateDoc(doc(db, "clients", client.id), {
        temporaryPassword: null,
        passwordCreatedAt: null
      });
      
      // Notify parent component
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
  
  // Generates a random password
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
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {client.hasAccount || client.userId
              ? "This client already has an account. You can view their credentials or reset their password."
              : "Create an account for this B2B client to grant them system access."}
          </p>
        </div>
        
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
        
        <div className="flex flex-wrap gap-2 mb-4">
          {!client.hasAccount && !client.userId && (
            <button
              onClick={createUserAccount}
              className="bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          )}
          
          {(client.hasAccount || client.userId) && (
            <button
              onClick={resetPassword}
              className="bg-yellow-600 text-white py-2 px-4 rounded text-sm hover:bg-yellow-700"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Password Reset Email"}
            </button>
          )}
        </div>
        
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