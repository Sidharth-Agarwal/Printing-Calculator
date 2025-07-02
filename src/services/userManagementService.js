// services/userManagementService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy 
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// User roles configuration
export const USER_ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "staff", label: "Staff" },
  { value: "production", label: "Production" },
  { value: "accountant", label: "Accountant" }
];

// User field definitions (similar to client fields)
export const USER_FIELDS = {
  BASIC_INFO: [
    {
      name: "displayName",
      label: "Full Name",
      type: "text",
      required: true
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: USER_ROLES
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      required: false
    },
    {
      name: "isActive",
      label: "Active Status",
      type: "checkbox",
      defaultValue: true
    }
  ]
};

// Table display fields
export const USER_TABLE_FIELDS = [
  { field: "displayName", label: "Name" },
  { field: "email", label: "Email" },
  { field: "role", label: "Role" },
  { field: "phoneNumber", label: "Phone" },
  { field: "lastLoginAt", label: "Last Login" },
  { field: "createdAt", label: "Created" }
];

// Get user statistics
export const getUserStatistics = (users) => {
  const stats = {
    total: users.length,
    active: users.filter(user => user.isActive).length,
    inactive: users.filter(user => !user.isActive).length,
    admin: users.filter(user => user.role === "admin").length,
    staff: users.filter(user => user.role === "staff").length,
    production: users.filter(user => user.role === "production").length,
    accountant: users.filter(user => user.role === "accountant").length,
    recentLogins: users.filter(user => {
      if (!user.lastLoginAt) return false;
      const lastLogin = new Date(user.lastLoginAt);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastLogin > dayAgo;
    }).length
  };
  
  return stats;
};

// Validate user data
export const validateUserData = (userData) => {
  const errors = {};
  
  if (!userData.displayName?.trim()) {
    errors.displayName = "Full name is required";
  }
  
  if (!userData.email?.trim()) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  if (!userData.role) {
    errors.role = "Role is required";
  } else if (!USER_ROLES.some(role => role.value === userData.role)) {
    errors.role = "Please select a valid role";
  }
  
  if (userData.phoneNumber && !/^[\+]?[0-9\-\s\(\)]{10,}$/.test(userData.phoneNumber)) {
    errors.phoneNumber = "Please enter a valid phone number";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format user data for display
export const formatUserForDisplay = (user) => {
  return {
    ...user,
    roleName: USER_ROLES.find(role => role.value === user.role)?.label || user.role,
    statusText: user.isActive ? "Active" : "Inactive",
    formattedCreatedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
    formattedLastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"
  };
};

// Filter users based on search criteria
export const filterUsers = (users, searchTerm, roleFilter, statusFilter) => {
  return users.filter(user => {
    // Search filter
    const matchesSearch = !searchTerm || 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm);
    
    // Role filter
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    // Status filter
    const matchesStatus = !statusFilter || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });
};

// Sort users
export const sortUsers = (users, sortField, sortDirection) => {
  return [...users].sort((a, b) => {
    let aValue = a[sortField] || "";
    let bValue = b[sortField] || "";
    
    // Handle date fields
    if (sortField === "createdAt" || sortField === "lastLoginAt") {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    } else {
      // Handle string fields
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Check if email exists (for validation)
export const checkEmailExists = async (email, excludeUserId = null) => {
  try {
    const usersRef = collection(db, "users");
    const emailQuery = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(emailQuery);
    
    // If excluding a user (for edit), filter them out
    if (excludeUserId) {
      return querySnapshot.docs.some(doc => doc.id !== excludeUserId);
    }
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking email exists:", error);
    throw error;
  }
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  return USER_ROLES.find(r => r.value === role)?.label || role;
};

// Get user role color for UI
export const getRoleColor = (role) => {
  const colorMap = {
    admin: "bg-purple-100 text-purple-800",
    staff: "bg-blue-100 text-blue-800", 
    production: "bg-green-100 text-green-800",
    accountant: "bg-yellow-100 text-yellow-800"
  };
  
  return colorMap[role] || "bg-gray-100 text-gray-800";
};

// Generate default user data
export const getDefaultUserData = () => {
  return {
    displayName: "",
    email: "",
    role: "staff",
    phoneNumber: "",
    isActive: true
  };
};

// Create user activity log entry
export const createUserActivityLog = async (userId, action, details = {}) => {
  try {
    const activityRef = collection(db, "userActivity");
    await addDoc(activityRef, {
      userId,
      action, // "created", "updated", "activated", "deactivated", "role_changed", etc.
      details,
      timestamp: new Date().toISOString(),
      performedBy: details.performedBy || null
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
    // Don't throw error as this is not critical
  }
};

export default {
  USER_ROLES,
  USER_FIELDS,
  USER_TABLE_FIELDS,
  getUserStatistics,
  validateUserData,
  formatUserForDisplay,
  filterUsers,
  sortUsers,
  checkEmailExists,
  getRoleDisplayName,
  getRoleColor,
  getDefaultUserData,
  createUserActivityLog
};