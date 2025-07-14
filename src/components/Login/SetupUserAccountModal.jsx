import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const SetupUserAccountModal = ({ user, onClose, onSuccess, adminEmail }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!password.trim()) {
      setError("Admin password is required");
      setLoading(false);
      return;
    }
    
    try {
      // Verify admin password
      const adminAuth = getAuth();
      
      // Check if admin credentials are valid
      await signInWithEmailAndPassword(adminAuth, adminEmail, password);
      
      // Credentials are valid, proceed with account creation
      await createUserAccount();
      
    } catch (error) {
      console.error("Admin password verification failed:", error);
      setError("Invalid admin password. Please try again.");
      setLoading(false);
    }
  };
  
  const createUserAccount = async () => {
    try {
      const auth = getAuth();
      
      // First check if the email is already in use
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, user.email);
        if (signInMethods && signInMethods.length > 0) {
          setError("This email is already registered in the authentication system.");
          setLoading(false);
          return;
        }
      } catch (fetchError) {
        console.error("Error checking existing email:", fetchError);
        // Continue anyway - we'll check more explicitly below
      }
      
      // Generate a random password
      const generatedPassword = generateRandomPassword();
      
      // Create a secondary auth instance for the new user to avoid affecting the admin session
      const userAuth = getAuth();
      
      // Sign out of secondary auth if needed
      if (userAuth.currentUser) {
        await userAuth.signOut();
      }
      
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        userAuth,
        user.email,
        generatedPassword
      );
      
      // Update the existing user document in Firestore with auth information
      await updateDoc(doc(db, "users", user.id), {
        userId: userCredential.user.uid, // Link to Firebase Auth user
        hasAccount: true,
        temporaryPassword: generatedPassword,
        passwordCreatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Store the credentials for display
      setGeneratedCredentials({
        email: user.email,
        password: generatedPassword,
        timestamp: new Date().toISOString()
      });
      
      // Re-authenticate admin to make sure we don't lose admin session
      try {
        const adminAuth = getAuth();
        
        // Force URL to stay at user management to prevent redirection
        window.history.pushState({}, "", "/user-management");
        
        await signInWithEmailAndPassword(adminAuth, adminEmail, password);
        
        // Force URL again just to be sure
        window.history.pushState({}, "", "/user-management");
        
      } catch (authError) {
        console.error("Error re-authenticating admin:", authError);
        setError("Warning: Admin session may have been lost. Please refresh if needed.");
      }
      
      // Update parent with new user state
      if (onSuccess) {
        onSuccess({
          ...user,
          userId: userCredential.user.uid,
          hasAccount: true,
          temporaryPassword: generatedPassword,
          passwordCreatedAt: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error("Error creating user account:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError(`Failed to create account: ${error.message}`);
      }
      
      setLoading(false);
      
      // Make sure admin stays logged in even on error
      try {
        const adminAuth = getAuth();
        
        // Force URL to stay at user management to prevent redirection
        window.history.pushState({}, "", "/user-management");
        
        await signInWithEmailAndPassword(adminAuth, adminEmail, password);
        
        // Force URL again just to be sure
        window.history.pushState({}, "", "/user-management");
        
      } catch (e) {
        console.error("Error re-authenticating admin after error:", e);
      }
    }
  };
  
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN");
  };
  
  const handleCancel = () => {
    setPassword("");
    setError("");
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Setup User Account</h3>
        
        {!generatedCredentials ? (
          <>
            <p className="mb-4 text-gray-600">
              This will create a login account for <span className="font-medium">{user.displayName}</span> using their email address (<span className="font-medium">{user.email}</span>).
            </p>
            
            <p className="mb-4 text-gray-600">
              Please enter your admin password to proceed.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 ${loading ? 'opacity-70' : ''}`}
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Setup Account"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Account Created Successfully */}
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Account Created Successfully!</h4>
              <p className="text-sm text-gray-600">
                User account for {user.displayName} has been created with the following credentials:
              </p>
            </div>
            
            {copySuccess && (
              <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded text-sm">
                {copySuccess}
              </div>
            )}
            
            {/* Display generated credentials */}
            <div className="mb-6 p-4 bg-gray-50 border rounded-md">
              <h4 className="font-medium mb-2 text-sm">Login Credentials</h4>
              <div className="mb-3">
                <p className="text-sm"><span className="font-semibold">Email:</span> {generatedCredentials.email}</p>
                <p className="text-sm"><span className="font-semibold">Temporary Password:</span> {generatedCredentials.password}</p>
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
            
            {/* Important Instructions */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h5 className="text-sm font-medium text-blue-800 mb-2">📌 Important Instructions</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Share these credentials securely with the user</li>
                <li>• User must change the password on first login</li>
                <li>• The temporary password will be cleared after first use</li>
                <li>• User can also reset password via email if needed</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SetupUserAccountModal;