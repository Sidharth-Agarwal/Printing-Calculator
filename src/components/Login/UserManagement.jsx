import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, query, where, addDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "./AuthContext";
import UserDetailsModal from "./UserDetailsModal";
import UserCredentialsModal from "./UserCredentialsModal";
import UserFormModal from "./UserFormModal";
import SetupUserAccountModal from "./SetupUserAccountModal"; // New component
import Modal from "../Shared/Modal";
import ConfirmationModal from "../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../Shared/DeleteConfirmationModal";
import { 
  getUserStatistics, 
  filterUsers, 
  sortUsers, 
  getRoleDisplayName, 
  getRoleColor,
  USER_TABLE_FIELDS 
} from "../../services/userManagementService";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userRole, currentUser, updateUserStatus, updateUserProfile } = useAuth();

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForCredentials, setUserForCredentials] = useState(null);
  const [userForEdit, setUserForEdit] = useState(null);
  const [userForSetup, setUserForSetup] = useState(null); // New state for account setup
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("displayName");
  const [sortDirection, setSortDirection] = useState("asc");

  // Notification states
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    title: "",
    status: "success"
  });

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null,
    itemName: ""
  });

  // User statistics
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admin: 0,
    staff: 0,
    production: 0,
    accountant: 0,
    recentLogins: 0,
    withAccounts: 0,
    withoutAccounts: 0
  });

  // Fetch users with real-time updates
  useEffect(() => {
    if (userRole !== "admin") return;

    const usersCollection = collection(db, "users");
    // Exclude B2B users from user management - they are managed in client management
    const usersQuery = query(usersCollection, where("role", "!=", "b2b"));
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersData);
      
      // Calculate enhanced statistics
      const stats = getUserStatistics(usersData);
      const withAccounts = usersData.filter(user => user.hasAccount === true).length;
      const withoutAccounts = usersData.filter(user => user.hasAccount !== true).length;
      
      setUserStats({
        ...stats,
        withAccounts,
        withoutAccounts
      });
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userRole]);

  // Handle add new user (create user record only)
  const handleAddUser = () => {
    setUserForEdit(null);
    setIsFormModalOpen(true);
  };

  // Handle form submission (create or update user record)
  const handleFormSubmit = async (userData) => {
    if (userForEdit) {
      // Update existing user
      await handleUpdateUser(userData);
    } else {
      // Create new user record (without authentication)
      await handleCreateUserRecord(userData);
    }
  };

  // Create new user record (similar to adding a client)
  const handleCreateUserRecord = async (userData) => {
    setIsSubmitting(true);
    
    try {
      // Add the user record to Firestore (without Firebase Auth)
      const usersCollection = collection(db, "users");
      await addDoc(usersCollection, {
        ...userData,
        hasAccount: false, // Flag indicating no auth account yet
        userId: null, // Will be set when account is created
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        // Initialize stats
        loginCount: 0,
        lastLoginAt: null
      });
      
      setNotification({
        isOpen: true,
        message: `User record for ${userData.displayName} created successfully! You can now set up their account.`,
        title: "Success",
        status: "success"
      });
      
      setIsFormModalOpen(false);
      
    } catch (error) {
      console.error("Error creating user record:", error);
      setNotification({
        isOpen: true,
        message: `Failed to create user record: ${error.message}`,
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing user record
  const handleUpdateUser = async (userData) => {
    setIsSubmitting(true);
    
    try {
      // Update user profile using the firestore document
      await updateDoc(doc(db, "users", userForEdit.id), {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      
      setNotification({
        isOpen: true,
        message: `User ${userData.displayName} updated successfully!`,
        title: "Success",
        status: "success"
      });
      
      setIsFormModalOpen(false);
      setUserForEdit(null);
      
    } catch (error) {
      console.error("Error updating user:", error);
      setNotification({
        isOpen: true,
        message: `Failed to update user: ${error.message}`,
        title: "Error",
        status: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setUserForEdit(user);
    setIsFormModalOpen(true);
  };

  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  // Handle setup account (similar to client B2B activation)
  const handleSetupAccount = (user) => {
    setUserForSetup(user);
  };

  // Handle account setup success
  const handleAccountSetupSuccess = (updatedUser) => {
    setUserForSetup(null);
    // The onSnapshot listener will automatically update the user list
  };

  // Handle manage credentials (only for users with accounts)
  const handleManageCredentials = (user) => {
    setUserForCredentials(user);
  };

  // Handle toggle user status
  const handleToggleStatus = async (userId, newStatus, reason = null) => {
    try {
      await updateUserStatus(userId, newStatus, reason);
      
      setNotification({
        isOpen: true,
        message: `User ${newStatus ? 'activated' : 'deactivated'} successfully!`,
        title: "Success",
        status: "success"
      });
      
    } catch (error) {
      console.error("Error updating user status:", error);
      setNotification({
        isOpen: true,
        message: `Failed to update user status: ${error.message}`,
        title: "Error",
        status: "error"
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = (userId, userName) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: userId,
      itemName: userName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, "users", deleteConfirmation.itemId));
      
      setNotification({
        isOpen: true,
        message: "User deleted successfully!",
        title: "Success",
        status: "success"
      });
      
      setDeleteConfirmation({ isOpen: false, itemId: null, itemName: "" });
      
    } catch (error) {
      console.error("Error deleting user:", error);
      setNotification({
        isOpen: true,
        message: `Failed to delete user: ${error.message}`,
        title: "Error",
        status: "error"
      });
      setDeleteConfirmation({ isOpen: false, itemId: null, itemName: "" });
    }
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Never";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  // Get filtered and sorted users
  const filteredUsers = filterUsers(users, searchTerm, roleFilter, statusFilter);
  const sortedUsers = sortUsers(filteredUsers, sortField, sortDirection);

  // Sortable header component
  const SortableHeader = ({ field, label, className = "" }) => (
    <th 
      className={`px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortField === field && (
          <span className="ml-1">
            {sortDirection === "asc" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </th>
  );

  // Check if user is admin
  if (userRole !== "admin") {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">
          Manage application users, their roles, and access credentials
        </p>
      </div>

      {/* Enhanced User Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Users</h2>
          <p className="text-2xl font-bold text-gray-800">{userStats.total}</p>
          <p className="text-xs text-gray-500 mt-1">
            {userStats.active} active users
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Account Status</h2>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>With Accounts:</span> <span className="font-medium text-green-600">{userStats.withAccounts}</span>
            </div>
            <div className="flex justify-between">
              <span>Setup Pending:</span> <span className="font-medium text-yellow-600">{userStats.withoutAccounts}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">By Role</h2>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Admin:</span> <span className="font-medium">{userStats.admin}</span>
            </div>
            <div className="flex justify-between">
              <span>Staff:</span> <span className="font-medium">{userStats.staff}</span>
            </div>
            <div className="flex justify-between">
              <span>Production:</span> <span className="font-medium">{userStats.production}</span>
            </div>
            <div className="flex justify-between">
              <span>Accountant:</span> <span className="font-medium">{userStats.accountant}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Recent Activity</h2>
          <p className="text-2xl font-bold text-blue-600">{userStats.recentLogins}</p>
          <p className="text-xs text-gray-500 mt-1">
            logins in last 24h
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 border-b">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="production">Production</option>
              <option value="accountant">Accountant</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>
        </div>
        
        {/* User Count */}
        <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50">
          Showing {sortedUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100">
                  <SortableHeader field="displayName" label="Name" />
                  <SortableHeader field="email" label="Email" />
                  <SortableHeader field="role" label="Role" />
                  <SortableHeader field="phoneNumber" label="Phone" />
                  <SortableHeader field="lastLoginAt" label="Last Login" />
                  <SortableHeader field="createdAt" label="Created" />
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Account Status</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.displayName}</div>
                      {user.temporaryPassword && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          Temp Password
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user.phoneNumber || "-"}</td>
                    <td className="px-4 py-3">{formatDate(user.lastLoginAt)}</td>
                    <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.hasAccount
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {user.hasAccount ? "Account Setup" : "Setup Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-1">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Edit User"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                        </button>
                        
                        {/* Setup Account or Manage Credentials Button */}
                        {user.hasAccount ? (
                          <button
                            onClick={() => handleManageCredentials(user)}
                            className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                            title="Manage Credentials"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"></path>
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSetupAccount(user)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Setup Account"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                            </svg>
                          </button>
                        )}
                        
                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(user.id, !user.isActive)}
                          className={`p-1.5 rounded transition-colors ${
                            user.isActive 
                              ? "text-yellow-600 hover:bg-yellow-100" 
                              : "text-green-600 hover:bg-green-100"
                          }`}
                          title={user.isActive ? "Deactivate User" : "Activate User"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                        </button>
                        
                        {/* Delete Button */}
                        {user.id !== currentUser?.uid && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.displayName)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Delete User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            {searchTerm || roleFilter || statusFilter ? (
              <>
                <p className="text-lg font-medium">No users match your search</p>
                <p className="mt-1">Try using different filters or clear your search</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('');
                    setStatusFilter('');
                  }}
                  className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No users found</p>
                <p className="mt-1">Add your first user to get started</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            setSelectedUser(null);
            handleEditUser(selectedUser);
          }}
          onToggleStatus={() => {
            handleToggleStatus(selectedUser.id, !selectedUser.isActive);
            setSelectedUser(null);
          }}
          onManageCredentials={selectedUser.hasAccount ? () => {
            setSelectedUser(null);
            handleManageCredentials(selectedUser);
          } : undefined}
          onSetupAccount={!selectedUser.hasAccount ? () => {
            setSelectedUser(null);
            handleSetupAccount(selectedUser);
          } : undefined}
          isAdmin={true}
        />
      )}

      {/* User Credentials Modal */}
      {userForCredentials && (
        <UserCredentialsModal
          user={userForCredentials}
          onClose={() => setUserForCredentials(null)}
          onSuccess={(updatedUser) => {
            setUserForCredentials(null);
          }}
          adminCredentials={{ email: currentUser?.email, password: "" }}
        />
      )}

      {/* Setup User Account Modal */}
      {userForSetup && (
        <SetupUserAccountModal
          user={userForSetup}
          onClose={() => setUserForSetup(null)}
          onSuccess={handleAccountSetupSuccess}
          adminEmail={currentUser?.email || ""}
        />
      )}

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setUserForEdit(null);
        }}
        onSubmit={handleFormSubmit}
        selectedUser={userForEdit}
        isSubmitting={isSubmitting}
        showPasswordFields={false} // Don't show password fields in user creation
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ isOpen: false, message: "", title: "", status: "success" })}
        message={notification.message}
        title={notification.title}
        status={notification.status}
      />
      
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, itemId: null, itemName: "" })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteConfirmation.itemName}
      />
    </div>
  );
};

export default UserManagement;