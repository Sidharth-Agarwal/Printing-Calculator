import React, { useState, useEffect } from "react";
import { LEAD_FIELDS } from "../../../constants/leadFields";
import LeadSourceSelector from "../../Shared/LeadSourceSelector";
import { LeadStatusSelector } from "../../Shared/LeadStatusBadge";
import { QualificationBadgeSelector } from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";
import { useCRM } from "../../../context/CRMContext";

/**
 * Form for creating and editing leads
 * @param {Object} props - Component props
 * @param {Object} props.lead - Lead to edit (null for new lead)
 * @param {function} props.onSubmit - Submit handler
 * @param {function} props.onCancel - Cancel handler
 * @param {boolean} props.isSubmitting - Form submission state
 */
const LeadRegistrationForm = ({ 
  lead = null, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const { qualificationBadges } = useCRM();
  
  // Default form data structure
  const getDefaultFormData = () => ({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "",
    status: "newLead", // Default to 'New Lead' status
    badgeId: "",
    jobType: "",
    budget: "",
    urgency: "",
    notes: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India" // Default country
    }
  });
  
  // Form state
  const [formData, setFormData] = useState(getDefaultFormData());
  const [errors, setErrors] = useState({});
  
  // Set form data when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || "",
        company: lead.company || "",
        email: lead.email || "",
        phone: lead.phone || "",
        source: lead.source || "",
        status: lead.status || "newLead",
        badgeId: lead.badgeId || "",
        jobType: lead.jobType || "",
        budget: lead.budget || "",
        urgency: lead.urgency || "",
        notes: lead.notes || "",
        address: lead.address || {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India"
        }
      });
    } else {
      setFormData(getDefaultFormData());
    }
  }, [lead]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (e.g., address.city)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    // Required fields from LEAD_FIELDS
    LEAD_FIELDS.BASIC_INFO.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    // Validate email format if provided
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate phone format
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Phone validation helper
  const isValidPhone = (phone) => {
    // Simple validation for Indian phone numbers
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phone);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white">
      {/* Basic Information */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3 text-gray-700 border-b border-gray-200 pb-2">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Name */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Enter lead name"
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          
          {/* Company */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="company"
              value={formData.company || ""}
              onChange={handleChange}
              placeholder="Enter company name (if applicable)"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.company ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            />
            {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company}</p>}
          </div>
          
          {/* Email */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="Enter email address"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          
          {/* Phone */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          
          {/* Source */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Source <span className="text-red-500">*</span>
            </label>
            <LeadSourceSelector
              value={formData.source || ""}
              onChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  source: value
                }));
              }}
              required
              disabled={isSubmitting}
            />
            {errors.source && <p className="mt-1 text-xs text-red-500">{errors.source}</p>}
          </div>
          
          {/* Status */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Status <span className="text-red-500">*</span>
            </label>
            <LeadStatusSelector
              value={formData.status || ""}
              onChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  status: value
                }));
              }}
              required
              disabled={isSubmitting}
            />
            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
          </div>
          
          {/* Qualification Badge */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification Badge
            </label>
            <QualificationBadgeSelector
              value={formData.badgeId}
              onChange={(value) => setFormData(prev => ({ ...prev, badgeId: value }))}
              disabled={isSubmitting}
            />
          </div>
          
          {/* Job Type */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              name="jobType"
              value={formData.jobType || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.jobType ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            >
              <option value="">Select Job Type</option>
              {LEAD_FIELDS.LEAD_DETAILS.find(f => f.name === "jobType")?.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Budget */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range
            </label>
            <select
              name="budget"
              value={formData.budget || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.budget ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            >
              <option value="">Select Budget Range</option>
              {LEAD_FIELDS.LEAD_DETAILS.find(f => f.name === "budget")?.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Urgency */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency
            </label>
            <select
              name="urgency"
              value={formData.urgency || ""}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.urgency ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            >
              <option value="">Select Urgency</option>
              {LEAD_FIELDS.LEAD_DETAILS.find(f => f.name === "urgency")?.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3 text-gray-700 border-b border-gray-200 pb-2">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Address Line 1 */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              name="address.line1"
              value={formData.address?.line1 || ""}
              onChange={handleChange}
              placeholder="Enter street address"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          {/* Address Line 2 */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              name="address.line2"
              value={formData.address?.line2 || ""}
              onChange={handleChange}
              placeholder="Enter apartment, suite, etc."
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          {/* City */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="address.city"
              value={formData.address?.city || ""}
              onChange={handleChange}
              placeholder="Enter city"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          {/* State */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="address.state"
              value={formData.address?.state || ""}
              onChange={handleChange}
              placeholder="Enter state or province"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          {/* Postal Code */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="address.postalCode"
              value={formData.address?.postalCode || ""}
              onChange={handleChange}
              placeholder="Enter postal code"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          
          {/* Country */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="address.country"
              value={formData.address?.country || "India"}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3 text-gray-700 border-b border-gray-200 pb-2">
          Additional Notes
        </h3>
        <div>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows="3"
            placeholder="Enter any additional notes about this lead"
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
          ></textarea>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end pt-3 border-t border-gray-200">
        <CRMActionButton
          type="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="mr-2"
        >
          Cancel
        </CRMActionButton>
        
        <CRMActionButton
          type="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          submit={true}
        >
          {lead ? "Update Lead" : "Create Lead"}
        </CRMActionButton>
      </div>
    </form>
  );
};

export default LeadRegistrationForm;