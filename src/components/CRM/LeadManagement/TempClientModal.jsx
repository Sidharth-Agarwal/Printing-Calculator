import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { generateClientCode } from "../../../services/clientCodeService";

/**
 * Modal for converting a lead to a temporary client
 * @param {Object} props - Component props
 * @param {Object} props.lead - Lead object
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler
 */
const TempClientModal = ({ lead, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    clientType: "Direct",
    expiryDays: 30
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate client code
      const clientCode = await generateClientCode(formData.name);
      
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(formData.expiryDays));
      
      // Create temporary client
      const tempClientData = {
        clientCode,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        contactPerson: formData.name, // Default contact person to name
        clientType: formData.clientType,
        // Temporary client specific fields
        isTemporary: true,
        expiryDate,
        sourceLeadId: lead.id,
        // Initialize required nested objects
        address: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: ""
        },
        billingAddress: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: ""
        },
        gstin: "",
        notes: `Temporary client created from lead: ${lead.name}`,
        // Default values
        isActive: true,
        hasAccount: false,
        userId: null,
        // Stats
        activeEstimates: 0,
        activeOrders: 0,
        totalOrders: 0,
        totalSpend: 0,
        averageOrderValue: 0,
        // Discussion fields
        lastDiscussionDate: null,
        lastDiscussionSummary: null,
        totalDiscussions: 0,
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "clients"), tempClientData);
      
      // Update lead to reference temp client
      // This would be handled by the parent component
      
      // Call onSubmit with success
      onSubmit(lead.id, true, { id: docRef.id, ...tempClientData });
    } catch (error) {
      console.error("Error creating temporary client:", error);
      setErrors({ submit: error.message });
      onSubmit(lead.id, false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!lead) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Create Temporary Client</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            This will create a temporary client that can receive estimates. 
            The client will expire automatically after the selected period.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Client Name */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter client name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          
          {/* Email */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          
          {/* Phone */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Client Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Type
              </label>
              <select
                name="clientType"
                value={formData.clientType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              >
                <option value="Direct">Direct</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
            
            {/* Expiry Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires In
              </label>
              <select
                name="expiryDays"
                value={formData.expiryDays}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
          </div>
          
          {/* Error message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errors.submit}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Temp Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TempClientModal;