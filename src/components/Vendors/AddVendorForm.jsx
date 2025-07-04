import React, { useState, useEffect } from "react";
import { VENDOR_FIELDS } from "../../constants/entityFields";
import { 
  validateVendorData, 
  checkVendorEmailExists, 
  checkVendorPhoneExists,
  checkVendorGstinExists,
  checkVendorAccountExists,
  normalizeEmail,
  normalizePhone,
  normalizeGstin,
  normalizeAccountNumber,
  normalizeIfscCode
} from "../../services/vendorValidationService";

const AddVendorForm = ({ onSubmit, selectedVendor, onUpdate, setSelectedVendor, generateVendorCode }) => {
  const [formData, setFormData] = useState({
    vendorCode: "",
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    gstin: "",
    accountDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountType: "Current",
      upiId: ""
    },
    paymentTerms: {
      creditDays: 30
    },
    notes: "",
    isActive: true,
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationLoading, setValidationLoading] = useState({
    email: false,
    phone: false,
    gstin: false,
    account: false
  });

  useEffect(() => {
    if (selectedVendor) {
      setFormData({
        ...selectedVendor,
        // Ensure isActive exists
        isActive: selectedVendor.isActive !== undefined ? selectedVendor.isActive : true,
        // Ensure accountDetails exists
        accountDetails: selectedVendor.accountDetails || {
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          accountType: "Current", 
          upiId: ""
        },
        // Ensure paymentTerms exists
        paymentTerms: selectedVendor.paymentTerms || {
          creditDays: 30
        }
      });
      setErrors({}); // Clear errors when switching to edit mode
    } else {
      resetForm();
    }
  }, [selectedVendor]);

  // Auto-generate vendor code when name changes (for new vendors only)
  useEffect(() => {
    const updateVendorCode = async () => {
      // Only generate code if this is a new vendor (not editing) and we have a name
      if (!selectedVendor && formData.name && formData.name.trim() !== "") {
        const generatedCode = await generateVendorCode(formData.name);
        setFormData(prev => ({
          ...prev,
          vendorCode: generatedCode
        }));
      }
    };

    updateVendorCode();
  }, [formData.name, selectedVendor, generateVendorCode]);

  const resetForm = () => {
    setFormData({
      vendorCode: "",
      name: "",
      email: "",
      phone: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      gstin: "",
      accountDetails: {
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "Current",
        upiId: ""
      },
      paymentTerms: {
        creditDays: 30
      },
      notes: "",
      isActive: true,
    });
    setErrors({});
  };

  // Debounced validation functions
  const validateEmailUniqueness = async (email) => {
    if (!email || email === selectedVendor?.email) return;
    
    setValidationLoading(prev => ({ ...prev, email: true }));
    try {
      const emailExists = await checkVendorEmailExists(email, selectedVendor?.id);
      if (emailExists) {
        setErrors(prev => ({
          ...prev,
          email: "This email address is already used by another vendor"
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        email: error.message
      }));
    } finally {
      setValidationLoading(prev => ({ ...prev, email: false }));
    }
  };

  const validatePhoneUniqueness = async (phone) => {
    if (!phone || phone === selectedVendor?.phone) return;
    
    setValidationLoading(prev => ({ ...prev, phone: true }));
    try {
      const phoneExists = await checkVendorPhoneExists(phone, selectedVendor?.id);
      if (phoneExists) {
        setErrors(prev => ({
          ...prev,
          phone: "This phone number is already used by another vendor"
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        phone: error.message
      }));
    } finally {
      setValidationLoading(prev => ({ ...prev, phone: false }));
    }
  };

  const validateGstinUniqueness = async (gstin) => {
    if (!gstin || gstin === selectedVendor?.gstin) return;
    
    setValidationLoading(prev => ({ ...prev, gstin: true }));
    try {
      const gstinExists = await checkVendorGstinExists(gstin, selectedVendor?.id);
      if (gstinExists) {
        setErrors(prev => ({
          ...prev,
          gstin: "This GSTIN is already used by another vendor"
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.gstin;
          return newErrors;
        });
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        gstin: error.message
      }));
    } finally {
      setValidationLoading(prev => ({ ...prev, gstin: false }));
    }
  };

  const validateAccountUniqueness = async (accountNumber) => {
    if (!accountNumber || accountNumber === selectedVendor?.accountDetails?.accountNumber) return;
    
    setValidationLoading(prev => ({ ...prev, account: true }));
    try {
      const accountExists = await checkVendorAccountExists(accountNumber, selectedVendor?.id);
      if (accountExists) {
        setErrors(prev => ({
          ...prev,
          'accountDetails.accountNumber': "This account number is already used by another vendor"
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors['accountDetails.accountNumber'];
          return newErrors;
        });
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        'accountDetails.accountNumber': error.message
      }));
    } finally {
      setValidationLoading(prev => ({ ...prev, account: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Don't allow changing vendor code manually
    if (name === "vendorCode") {
      return;
    }
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle blur events for validation
  const handleEmailBlur = (e) => {
    const email = e.target.value.trim();
    if (email && email !== selectedVendor?.email) {
      setTimeout(() => validateEmailUniqueness(email), 500);
    }
  };

  const handlePhoneBlur = (e) => {
    const phone = e.target.value.trim();
    if (phone && phone !== selectedVendor?.phone) {
      setTimeout(() => validatePhoneUniqueness(phone), 500);
    }
  };

  const handleGstinBlur = (e) => {
    const gstin = e.target.value.trim();
    if (gstin && gstin !== selectedVendor?.gstin) {
      setTimeout(() => validateGstinUniqueness(gstin), 500);
    }
  };

  const handleAccountBlur = (e) => {
    const accountNumber = e.target.value.trim();
    if (accountNumber && accountNumber !== selectedVendor?.accountDetails?.accountNumber) {
      setTimeout(() => validateAccountUniqueness(accountNumber), 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrors({});

    try {
      // Validate form data including uniqueness checks
      const validation = await validateVendorData(formData, selectedVendor?.id);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        setSubmitLoading(false);
        return;
      }

      // Normalize data before saving
      const normalizedData = {
        ...formData,
        email: normalizeEmail(formData.email),
        phone: normalizePhone(formData.phone),
        gstin: normalizeGstin(formData.gstin),
        accountDetails: {
          ...formData.accountDetails,
          accountNumber: normalizeAccountNumber(formData.accountDetails.accountNumber),
          ifscCode: normalizeIfscCode(formData.accountDetails.ifscCode)
        }
      };

      let success = false;
      if (selectedVendor) {
        success = await onUpdate(selectedVendor.id, normalizedData);
      } else {
        success = await onSubmit(normalizedData);
      }

      if (success) {
        resetForm();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: error.message || "An error occurred while saving the vendor" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Render a field based on its type and configuration
  const renderField = (field) => {
    const { name, label, type, required, readOnly, options } = field;
    const hasError = errors[name];
    
    switch (type) {
      case "select":
        return (
          <div key={name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
              name={name}
              value={name.includes(".") 
                ? formData[name.split(".")[0]][name.split(".")[1]] 
                : formData[name]}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
              }`}
              required={required}
              disabled={readOnly}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="mt-1 text-xs text-red-500">{hasError}</p>
            )}
          </div>
        );
        
      case "textarea":
        return (
          <div key={name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
              }`}
              rows="4"
              required={required}
            ></textarea>
            {hasError && (
              <p className="mt-1 text-xs text-red-500">{hasError}</p>
            )}
          </div>
        );
        
      case "checkbox":
        return (
          <div key={name} className="mb-3 flex items-center">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={formData[name]}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-2">
              <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
              </label>
            </div>
          </div>
        );
        
      default: // text, email, tel, number, etc.
        const getBlurHandler = () => {
          if (name === "email") return handleEmailBlur;
          if (name === "phone") return handlePhoneBlur;
          if (name === "gstin") return handleGstinBlur;
          if (name === "accountDetails.accountNumber") return handleAccountBlur;
          return undefined;
        };

        const getLoadingIndicator = () => {
          if (name === "email" && validationLoading.email) return true;
          if (name === "phone" && validationLoading.phone) return true;
          if (name === "gstin" && validationLoading.gstin) return true;
          if (name === "accountDetails.accountNumber" && validationLoading.account) return true;
          return false;
        };

        return (
          <div key={name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
              <input
                type={type}
                name={name}
                value={name.includes(".") 
                  ? formData[name.split(".")[0]][name.split(".")[1]] 
                  : formData[name]}
                onChange={handleChange}
                onBlur={getBlurHandler()}
                className={`w-full px-3 py-2 border rounded-md ${
                  readOnly ? "bg-gray-100 cursor-not-allowed" : `focus:outline-none focus:ring-1 ${
                    hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"
                  }`
                }`}
                placeholder={`Enter ${label.toLowerCase()}`}
                required={required}
                readOnly={readOnly}
              />
              {/* Loading indicator for validation */}
              {getLoadingIndicator() && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {hasError && (
              <p className="mt-1 text-xs text-red-500">{hasError}</p>
            )}
            {name === "vendorCode" && (
              <p className="mt-1 text-xs text-gray-500">
                Automatically generated based on vendor name
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded">
      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {errors.submit}
        </div>
      )}

      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {VENDOR_FIELDS.BASIC_INFO.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Address */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {VENDOR_FIELDS.ADDRESS.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Account Details */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {VENDOR_FIELDS.ACCOUNT_DETAILS.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Payment Terms */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">Payment Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {VENDOR_FIELDS.PAYMENT_TERMS.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Notes */}
      <div className="mb-6">
        {VENDOR_FIELDS.NOTES.map(field => renderField(field))}
      </div>
      
      <div className="flex justify-end pt-3 border-t border-gray-200">
        {selectedVendor && (
          <button
            type="button"
            onClick={() => setSelectedVendor(null)}
            className="mr-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm"
            disabled={submitLoading}
          >
            Cancel
          </button>
        )}
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm disabled:bg-red-300"
          disabled={submitLoading || Object.values(validationLoading).some(loading => loading)}
        >
          {submitLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            selectedVendor ? 'Update Vendor' : 'Add Vendor'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddVendorForm;