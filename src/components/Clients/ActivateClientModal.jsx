import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const ActivateClientModal = ({ client, onClose, onSuccess, adminEmail }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    
    try {
      // Verify admin password
      const adminAuth = getAuth();
      
      // Check if admin credentials are valid
      await signInWithEmailAndPassword(adminAuth, adminEmail, password);
      
      // Credentials are valid, proceed with account creation
      await createB2BAccount();
      
    } catch (error) {
      console.error("Admin password verification failed:", error);
      setError("Invalid admin password. Please try again.");
      setLoading(false);
    }
  };
  
  const createB2BAccount = async () => {
    try {
      const auth = getAuth();
      
      // First check if the email is already in use
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, client.email);
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
      const clientAuth = getAuth();
      
      // Sign out of secondary auth if needed
      if (clientAuth.currentUser) {
        await clientAuth.signOut();
      }
      
      // Create the user account
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
        clientId: client.id
      });
      
      // Update client record with userId reference
      await updateDoc(doc(db, "clients", client.id), {
        userId: userCredential.user.uid,
        hasAccount: true,
        temporaryPassword: generatedPassword,
        passwordCreatedAt: new Date().toISOString()
      });
      
      // Re-authenticate admin
      const adminAuth = getAuth();
      await signInWithEmailAndPassword(adminAuth, adminEmail, password);
      
      // Force redirect back to clients page and refresh
      onSuccess({
        ...client,
        userId: userCredential.user.uid,
        hasAccount: true,
        temporaryPassword: generatedPassword,
        passwordCreatedAt: new Date().toISOString()
      });
      
      // Force reload the page to ensure clean state
      window.location.href = "/clients";
      
    } catch (error) {
      console.error("Error creating B2B account:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError(`Failed to create account: ${error.message}`);
      }
      
      setLoading(false);
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
  
  const handleCancel = () => {
    setPassword("");
    setError("");
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Activate B2B Client Account</h3>
        
        <p className="mb-4 text-gray-600">
          This will create a login account for <span className="font-medium">{client.name}</span> using their email address (<span className="font-medium">{client.email}</span>).
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
              {loading ? "Processing..." : "Activate Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivateClientModal;