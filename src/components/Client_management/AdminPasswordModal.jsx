import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const AdminPasswordModal = ({ onConfirm, onCancel, isOpen, adminEmail }) => {
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
      // Verify the admin password is correct by trying to sign in
      const auth = getAuth();
      
      // Remember current user
      const currentUser = auth.currentUser;
      
      // Create a secondary auth instance for verification
      const tempAuth = getAuth();
      
      // Attempt to sign in with provided credentials
      await signInWithEmailAndPassword(tempAuth, adminEmail, password);
      
      // If successful, call onConfirm with the password
      onConfirm(password);
      setPassword(""); // Clear the password field
    } catch (error) {
      console.error("Password verification failed:", error);
      setError("Invalid admin password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setPassword(""); // Clear the password field
    setError("");
    onCancel();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Admin Authentication Required</h3>
        
        <p className="mb-4 text-gray-600">
          Please enter your admin password to create B2B credentials. This is necessary to maintain your admin session.
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
              className={`bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${loading ? 'opacity-70' : ''}`}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPasswordModal;