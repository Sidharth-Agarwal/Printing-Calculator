import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { useAuth } from "../Login/AuthContext";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { currentUser, userRole } = useAuth();

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState("staff");
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // Store admin credentials temporarily during user creation
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Fetch all users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only admin should access this page, but we check anyway
    if (userRole === "admin") {
      fetchUsers();
    }
  }, [userRole]);

  // Start the add user process by requesting admin password confirmation
  const initiateAddUser = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate form inputs
    if (newPassword.length < 6) {
      return setError("Password should be at least 6 characters");
    }
    
    // Store admin email and show password confirmation
    setAdminEmail(currentUser.email);
    setShowPasswordConfirm(true);
  };
  
  // Cancel password confirmation
  const cancelPasswordConfirm = () => {
    setShowPasswordConfirm(false);
    setAdminPassword("");
  };

  // Add a new user after admin password confirmation
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    setIsAddingUser(true);

    try {
      // Signal that we're in the middle of a user creation flow
      // We'll use localStorage to persist through page navigation
      localStorage.setItem('userCreationInProgress', 'true');
      
      // Create a new auth instance to prevent affecting the current session
      const auth = getAuth();
      
      // First, create the new user account
      const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      
      // Prepare display name - use provided one or extract from email
      const displayName = newDisplayName || newEmail.split('@')[0];
      
      // Add user to Firestore with role and display name
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: newEmail,
        displayName: displayName,
        role: newRole,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid,
        isActive: true
      });
      
      // Store admin credentials in sessionStorage (more secure than localStorage)
      // These will be used by UserCreatedSuccess component to re-authenticate
      sessionStorage.setItem('adminEmail', adminEmail);
      sessionStorage.setItem('adminPassword', adminPassword);
      
      // Redirect to success page with user info as URL parameters
      window.location.href = `/user-created-success?email=${encodeURIComponent(newEmail)}&name=${encodeURIComponent(displayName)}`;
      
    } catch (err) {
      console.error("Error adding user:", err);
      // Clear the flag if we hit an error
      localStorage.removeItem('userCreationInProgress');
      
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else if (err.code === "auth/wrong-password") {
        setError("Admin password is incorrect.");
      } else {
        setError("Failed to create user: " + err.message);
      }
    } finally {
      setIsAddingUser(false);
    }
  };

  // Update user display name
  const handleDisplayNameChange = async (userId, newDisplayName) => {
    if (!newDisplayName || newDisplayName.trim() === "") {
      return;
    }
    
    try {
      await setDoc(doc(db, "users", userId), { displayName: newDisplayName }, { merge: true });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, displayName: newDisplayName } : user
      ));
      
      setSuccess("Display name updated successfully!");
    } catch (err) {
      console.error("Error updating display name:", err);
      setError("Failed to update display name. Please try again.");
    }
  };

  // Change user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await setDoc(doc(db, "users", userId), { role: newRole }, { merge: true });
      setSuccess("User role updated successfully!");
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update user role. Please try again.");
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await setDoc(doc(db, "users", userId), { isActive: newStatus }, { merge: true });
      setSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: newStatus } : user
      ));
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status. Please try again.");
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) {
      return;
    }

    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", userId));
      setSuccess(`User ${email} deleted successfully!`);
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      // Note: In a real app, you would also need to delete the user from Firebase Auth
      // This requires a Firebase Cloud Function or Admin SDK
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user. Please try again.");
    }
  };

  // Don't render if not admin
  if (userRole !== "admin") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {/* Admin Password Confirmation Modal */}
      {showPasswordConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Admin Password</h3>
            <p className="mb-4 text-gray-600">
              Please enter your admin password to create this new user while staying logged in as admin.
            </p>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Admin Email (Current User)
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
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelPasswordConfirm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingUser || !adminPassword}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isAddingUser ? "Creating User..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add New User Form */}
      <div className="bg-white p-4 rounded shadow-md mb-4">
        <h3 className="text-lg font-semibold mb-4">Add New User</h3>
        <form onSubmit={initiateAddUser}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="production">Production</option>
                <option value="b2b">B2B Client</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isAddingUser}
            className="mt-4 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isAddingUser ? "Adding User..." : "Add User"}
          </button>
        </form>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded shadow-md overflow-x-auto">
        <h3 className="text-lg font-semibold p-4 border-b">User Accounts</h3>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No users found. Add your first user above.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={!user.isActive ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center">
                          <input 
                            type="text"
                            className="text-sm font-medium text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                            defaultValue={user.displayName || ""}
                            placeholder={user.email.split('@')[0]}
                            onBlur={(e) => {
                              const newName = e.target.value.trim();
                              if (newName && newName !== user.displayName) {
                                handleDisplayNameChange(user.id, newName);
                              }
                            }}
                          />
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                      disabled={user.email === currentUser.email} // Can't change own role
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="production">Production</option>
                      <option value="b2b">B2B Client</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`text-blue-600 hover:text-blue-900 mr-4 ${
                        user.email === currentUser.email ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={user.email === currentUser.email} // Can't deactivate yourself
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className={`text-red-600 hover:text-red-900 ${
                        user.email === currentUser.email ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={user.email === currentUser.email} // Can't delete yourself
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;