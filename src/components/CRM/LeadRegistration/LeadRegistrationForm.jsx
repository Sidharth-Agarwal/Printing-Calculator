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
  
  // Render a field based on its type and configuration
  const renderField = (field) => {
    const { name, label, type, required, placeholder, options } = field;
    
    switch (type) {
      case "select":
        // Special handling for source field
        if (name === 'source') {
          return (
            <div key={name} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <LeadSourceSelector
                value={formData[name] || ""}
                onChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    [name]: value
                  }));
                }}
                required={required}
                disabled={isSubmitting}
              />
              {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
            </div>
          );
        }
        
        // Special handling for status field
        if (name === 'status') {
          return (
            <div key={name} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <LeadStatusSelector
                value={formData[name] || ""}
                onChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    [name]: value
                  }));
                }}
                required={required}
                disabled={isSubmitting}
              />
              {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
            </div>
          );
        }
        
        // Default handling for other select fields
        return (
          <div key={name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              required={required}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            >
              <option value="">Select {label}</option>
              {options && options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
          </div>
        );
        
      case "textarea":
        return (
          <div key={name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              disabled={isSubmitting}
              rows="3"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            ></textarea>
            {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
          </div>
        );
        
      default: // text, email, tel, etc.
        return (
          <div key={name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              name={name.includes('.') ? name : name}
              value={
                name.includes('.')
                  ? formData[name.split('.')[0]][name.split('.')[1]] || ""
                  : formData[name] || ""
              }
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors[name] ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100" : ""}`}
            />
            {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
          </div>
        );
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white">
      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEAD_FIELDS.BASIC_INFO.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Qualification */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">
          Lead Qualification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification Badge
            </label>
            <QualificationBadgeSelector
              value={formData.badgeId}
              onChange={(value) => setFormData(prev => ({ ...prev, badgeId: value }))}
              disabled={isSubmitting}
            />
          </div>
          {LEAD_FIELDS.LEAD_DETAILS.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LEAD_FIELDS.CONTACT_INFO.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Notes */}
      <div className="mb-6">
        {LEAD_FIELDS.NOTES.map(field => renderField(field))}
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
        >
          {lead ? "Update Lead" : "Create Lead"}
        </CRMActionButton>
      </div>
    </form>
  );
};

export default LeadRegistrationForm;