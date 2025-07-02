import React, { useState } from "react";
import { useAuth } from "./AuthContext";

const UserCredentialsModal = ({ 
  user, 
  onClose, 
  onSuccess,
  adminCredentials 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");
  
  const { sendUserPasswordReset, generateNewTempPassword } = useAuth();
  
  // Generate new temporary password
  const handleGenerateNewPassword = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setCopySuccess("");
    
    try {
      const newPassword = await generateNewTempPassword(user.id, adminCredentials);
      
      setGeneratedCredentials({
        email: user.email,
        password: newPassword,
        timestamp: new Date().toISOString()
      });
      
      setSuccess("New temporary password generated successfully!");
      
      // Update parent component
      if (onSuccess) {
        onSuccess({
          ...user,
          temporaryPassword: newPassword,
          passwordCreatedAt: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error("Error generating new password:", error);
      setError(`Failed to generate new password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Send password reset email
  const handlePasswordReset = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setCopySuccess("");
    
    try {
      await sendUserPasswordReset(user.email);
      setSuccess(`Password reset email sent to ${user.email}`);
      
      // Clear any existing temporary password since user will reset via email
      setGeneratedCredentials(null);
      
      if (onSuccess) {
        const updatedUser = { ...user };
        delete updatedUser.temporaryPassword;
        delete updatedUser.passwordCreatedAt;
        onSuccess(updatedUser);
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
    const credsToCopy = generatedCredentials || {
      email: user.email,
      password: user.temporaryPassword
    };
    
    if (!credsToCopy.password) return;
    
    const textToCopy = `Email: ${credsToCopy.email}\nPassword: ${credsToCopy.password}`;
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
  
  if (!user) return null;
  
  // Determine which credentials to show
  const currentCredentials = generatedCredentials || (user.temporaryPassword ? {
    email: user.email,
    password: user.temporaryPassword,
    timestamp: user.passwordCreatedAt
  } : null);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-3 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <h3 className="text-base font-semibold mb-2">User Credentials - {user.displayName}</h3>
        
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <p><span className="font-medium">User:</span> {user.email}</p>
          <p><span className="font-medium">Role:</span> {user.role}</p>
          <p>
            <span className="font-medium">Status:</span> 
            <span className={`ml-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-1 text-gray-600 text-xs">Processing...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-xs">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-2 p-2 bg-green-100 text-green-700 rounded text-xs">
                {success}
              </div>
            )}
            
            {copySuccess && (
              <div className="mb-2 p-2 bg-blue-100 text-blue-700 rounded text-xs">
                {copySuccess}
              </div>
            )}
            
            {/* Display current credentials */}
            {currentCredentials && (
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium mb-1 text-xs text-yellow-800">Current Temporary Credentials</h4>
                <div className="mb-2 text-xs">
                  <p><span className="font-semibold">Email:</span> {currentCredentials.email}</p>
                  <p><span className="font-semibold">Password:</span> {currentCredentials.password}</p>
                  <p className="text-yellow-600 mt-1">
                    Generated: {formatDate(currentCredentials.timestamp)}
                  </p>
                </div>
                <button
                  onClick={copyCredentials}
                  className="bg-yellow-200 text-yellow-800 py-1 px-2 rounded text-xs hover:bg-yellow-300 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            )}
            
            {/* Action Buttons - Side by Side */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleGenerateNewPassword}
                className="bg-blue-600 text-white py-2 px-2 rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {currentCredentials ? "New Password" : "Generate Password"}
              </button>
              
              <button
                onClick={handlePasswordReset}
                className="bg-green-600 text-white py-2 px-2 rounded text-xs hover:bg-green-700 transition-colors flex items-center justify-center"
                disabled={loading}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Reset Email
              </button>
            </div>
            
            {/* Information */}
            <div className="p-2 bg-blue-50 rounded mb-2">
              <h5 className="text-xs font-medium text-blue-800 mb-1">Info</h5>
              <ul className="text-xs text-blue-700 space-y-0.5">
                <li>• Temp passwords: login once, then change</li>
                <li>• Reset emails: user sets own password</li>
                {!user.isActive && (
                  <li className="text-red-600">• Account inactive - cannot login</li>
                )}
              </ul>
            </div>
          </>
        )}
        
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 text-xs"
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCredentialsModal;