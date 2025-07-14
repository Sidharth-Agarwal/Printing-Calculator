import React, { useState, useEffect } from "react";
import { 
  USER_ROLES, 
  validateUserData, 
  checkEmailExists,
  getDefaultUserData 
} from "../../services/userManagementService";

const UserFormModal = ({ 
  isOpen,
  onClose, 
  onSubmit, 
  selectedUser = null,
  isSubmitting = false,
  showPasswordFields = false // New prop to control password fields
}) => {
  const [formData, setFormData] = useState(getDefaultUserData());
  const [errors, setErrors] = useState({});
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Initialize form data when modal opens or selectedUser changes
  useEffect(() => {
    if (isOpen) {
      if (selectedUser) {
        // Editing existing user
        setFormData({
          displayName: selectedUser.displayName || "",
          email: selectedUser.email || "",
          role: selectedUser.role || "staff",
          phoneNumber: selectedUser.phoneNumber || "",
          isActive: selectedUser.isActive !== undefined ? selectedUser.isActive : true
        });
      } else {
        // Adding new user
        setFormData(getDefaultUserData());
      }
      setErrors({});
    }
  }, [isOpen, selectedUser]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Check if email exists (debounced)
  const checkEmailAvailability = async (email) => {
    if (!email || email === selectedUser?.email) return;
    
    setCheckingEmail(true);
    try {
      const exists = await checkEmailExists(email, selectedUser?.id);
      if (exists) {
        setErrors(prev => ({
          ...prev,
          email: "This email address is already in use"
        }));
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Handle email blur to check availability
  const handleEmailBlur = (e) => {
    const email = e.target.value.trim();
    if (email && email !== selectedUser?.email) {
      // Debounce the email check
      setTimeout(() => checkEmailAvailability(email), 500);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create validation data object (exclude password validation if not needed)
    const validationData = { ...formData };
    
    // Validate form data (simplified validation without password requirements)
    const validation = validateUserData(validationData, !showPasswordFields);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Check for email conflicts one more time
    if (!selectedUser || formData.email !== selectedUser.email) {
      try {
        const emailExists = await checkEmailExists(formData.email, selectedUser?.id);
        if (emailExists) {
          setErrors({ email: "This email address is already in use" });
          return;
        }
      } catch (error) {
        setErrors({ submit: "Error validating email. Please try again." });
        return;
      }
    }
    
    // Submit the form
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {selectedUser ? "Edit User" : "Add New User"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Information notice for new users */}
          {!selectedUser && !showPasswordFields && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Creating User Record</p>
                  <p className="text-xs text-blue-700">You can set up the login account later using the "Setup Account" button.</p>
                </div>
              </div>
            </div>
          )}

          {/* Full Name and Email - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.displayName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter full name"
                disabled={isSubmitting}
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                  disabled={isSubmitting || (selectedUser && selectedUser.email)}
                />
                {checkingEmail && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
              {selectedUser && selectedUser.email && (
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              )}
            </div>
          </div>
          
          {/* Role and Phone Number - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              >
                {USER_ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-red-500">{errors.role}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter phone number (optional)"
                disabled={isSubmitting}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
              )}
            </div>
          </div>
          
          {/* Active Status */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                User is active and can login (when account is set up)
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Inactive users cannot login to the system even if they have an account
            </p>
          </div>
          
          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {errors.submit}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center text-sm"
              disabled={isSubmitting || checkingEmail}
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {selectedUser ? "Update User" : "Create User Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;