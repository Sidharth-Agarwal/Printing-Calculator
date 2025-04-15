import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!email.trim()) {
      return setError("Please enter your email address");
    }
    
    setLoading(true);
    
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
        
        {!success ? (
          <>
            <p className="mb-4 text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your email"
                  autoFocus
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
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
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div>
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">
              Password reset link sent! Check your email inbox.
            </div>
            <p className="mb-4 text-gray-600">
              If you don't see the email in your inbox, please check your spam folder.
            </p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;