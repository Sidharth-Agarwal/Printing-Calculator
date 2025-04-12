import React, { useState } from "react";

const AdminPasswordModal = ({ onConfirm, onCancel, isOpen }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    
    onConfirm(password);
    setPassword(""); // Clear the password field
  };
  
  const handleCancel = () => {
    setPassword(""); // Clear the password field
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
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPasswordModal;