import React from "react";
import { getRoleDisplayName, getRoleColor } from "../../services/userManagementService";

const UserDetailsModal = ({ 
  user, 
  onClose, 
  onEdit, 
  onToggleStatus,
  onManageCredentials,
  onSetupAccount, // New prop for setting up account
  isAdmin 
}) => {
  if (!user) return null;

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date short
  const formatDateShort = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">User Details</h3>
            <p className="text-gray-300 mt-1">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{user.displayName}</h2>
                <div className="flex items-center mt-2 flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.hasAccount
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {user.hasAccount ? "Account Setup" : "Setup Pending"}
                  </span>
                  {user.temporaryPassword && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      Temp Password Set
                    </span>
                  )}
                </div>
              </div>
              
              {/* Status Toggle Button */}
              {onToggleStatus && (
                <div className="mt-4 sm:mt-0">
                  <button 
                    onClick={onToggleStatus}
                    className={`px-4 py-2 text-sm rounded-md flex items-center ${
                      user.isActive
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                        : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {user.isActive ? "Deactivate User" : "Activate User"}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Email Address</p>
                  <p className="mt-1">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Phone Number</p>
                  <p className="mt-1">{user.phoneNumber || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Status Information */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">Account Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Login Account</p>
                  <p className={`mt-1 font-medium ${user.hasAccount ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user.hasAccount ? "Setup Complete" : "Setup Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Account Status</p>
                  <p className={`mt-1 font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                {user.hasAccount && user.userId && (
                  <div>
                    <p className="text-gray-500 font-medium">User ID</p>
                    <p className="mt-1 font-mono text-xs">{user.userId.substring(0, 12)}...</p>
                  </div>
                )}
                {user.hasAccount && (
                  <div>
                    <p className="text-gray-500 font-medium">Account Created</p>
                    <p className="mt-1">{formatDateShort(user.passwordCreatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Account Statistics */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">Account Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Total Logins</p>
                  <p className="text-lg font-semibold text-gray-800">{user.loginCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Last Login</p>
                  <p className="text-lg font-semibold text-gray-800">{formatDateShort(user.lastLoginAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Record Created</p>
                  <p className="text-lg font-semibold text-gray-800">{formatDateShort(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-800">{formatDateShort(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Credential Information */}
          {user.temporaryPassword && (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-yellow-800">Temporary Credentials</h4>
                <div className="text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-yellow-700 font-medium">Password Created</p>
                      <p className="mt-1 text-yellow-800">{formatDate(user.passwordCreatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-yellow-700 font-medium">Status</p>
                      <p className="mt-1 text-yellow-800">Temporary password active</p>
                    </div>
                  </div>
                  {isAdmin && onManageCredentials && (
                    <div className="mt-3">
                      <button
                        onClick={onManageCredentials}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                      >
                        Manage Credentials
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Account Setup Notice */}
          {!user.hasAccount && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-blue-800">Account Setup Required</h4>
                <div className="text-sm">
                  <p className="text-blue-700 mb-3">
                    This user record exists but no login account has been created yet. 
                    The user cannot log in until an account is set up.
                  </p>
                  {isAdmin && onSetupAccount && (
                    <button
                      onClick={onSetupAccount}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                      Setup Account Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* System Information */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">System Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Record ID</p>
                  <p className="mt-1 font-mono text-xs">{user.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Created By</p>
                  <p className="mt-1">{user.createdBy ? `Admin (${user.createdBy.substring(0, 8)}...)` : "System"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Login Status</p>
                  <p className="mt-1">
                    {user.hasAccount 
                      ? (user.isActive ? "Can login" : "Login disabled") 
                      : "Cannot login - no account"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Role Permissions</p>
                  <p className="mt-1">{getRoleDisplayName(user.role)} access level</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Deactivation Information */}
          {!user.isActive && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-3 text-red-800">Deactivation Information</h4>
                <div className="text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-red-700 font-medium">Deactivated On</p>
                      <p className="mt-1 text-red-800">{formatDate(user.deactivatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-red-700 font-medium">Reason</p>
                      <p className="mt-1 text-red-800">{user.deactivationReason || "No reason provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Edit User
              </button>
            )}
            
            {isAdmin && onSetupAccount && !user.hasAccount && (
              <button
                onClick={onSetupAccount}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Setup Account
              </button>
            )}
            
            {isAdmin && onManageCredentials && user.hasAccount && (
              <button
                onClick={onManageCredentials}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"></path>
                </svg>
                Manage Credentials
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;