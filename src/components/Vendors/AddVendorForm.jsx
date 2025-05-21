import React, { useState, useEffect } from "react";
import { VENDOR_FIELDS } from "../../constants/entityFields";

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
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Don't allow changing vendor code manually
    if (name === "vendorCode") {
      return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    let success = false;
    if (selectedVendor) {
      success = await onUpdate(selectedVendor.id, formData);
    } else {
      success = await onSubmit(formData);
    }

    if (success) {
      resetForm();
    }
    
    setSubmitLoading(false);
  };

  // Render a field based on its type and configuration
  const renderField = (field) => {
    const { name, label, type, required, readOnly, options } = field;
    
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              required={required}
              disabled={readOnly}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              rows="4"
              required={required}
            ></textarea>
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
        return (
          <div key={name} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={name.includes(".") 
                ? formData[name.split(".")[0]][name.split(".")[1]] 
                : formData[name]}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                readOnly ? "bg-gray-100 cursor-not-allowed" : "focus:outline-none focus:ring-1 focus:ring-red-500"
              }`}
              placeholder={`Enter ${label.toLowerCase()}`}
              required={required}
              readOnly={readOnly}
            />
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
          >
            Cancel
          </button>
        )}
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          disabled={submitLoading}
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