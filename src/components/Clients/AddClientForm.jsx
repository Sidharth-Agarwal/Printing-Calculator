import React, { useState, useEffect } from "react";
import { CLIENT_FIELDS } from "../../constants/entityFields";

const AddClientForm = ({ onSubmit, selectedClient, onUpdate, setSelectedClient, generateClientCode }) => {
  const [formData, setFormData] = useState({
    clientCode: "",
    name: "",
    clientType: "Direct", // Default to Direct
    contactPerson: "",
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
    billingAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    notes: "",
    isActive: true, // Default to active
  });

  const [sameAsAddress, setSameAsAddress] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (selectedClient) {
      setFormData({
        ...selectedClient,
        // Set default clientType if it doesn't exist in the selected client
        clientType: selectedClient.clientType || "Direct",
        // Ensure isActive exists
        isActive: selectedClient.isActive !== undefined ? selectedClient.isActive : true
      });
      // Check if billing address is the same as primary address
      const isSameAddress = 
        selectedClient.address.line1 === selectedClient.billingAddress.line1 &&
        selectedClient.address.line2 === selectedClient.billingAddress.line2 &&
        selectedClient.address.city === selectedClient.billingAddress.city &&
        selectedClient.address.state === selectedClient.billingAddress.state &&
        selectedClient.address.postalCode === selectedClient.billingAddress.postalCode &&
        selectedClient.address.country === selectedClient.billingAddress.country;
      
      setSameAsAddress(isSameAddress);
    } else {
      resetForm();
    }
  }, [selectedClient]);

  // Auto-generate client code when name changes (for new clients only)
  useEffect(() => {
    const updateClientCode = async () => {
      // Only generate code if this is a new client (not editing) and we have a name
      if (!selectedClient && formData.name && formData.name.trim() !== "") {
        const generatedCode = await generateClientCode(formData.name);
        setFormData(prev => ({
          ...prev,
          clientCode: generatedCode
        }));
      }
    };

    updateClientCode();
  }, [formData.name, selectedClient, generateClientCode]);

  const resetForm = () => {
    setFormData({
      clientCode: "",
      name: "",
      clientType: "Direct",
      contactPerson: "",
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
      billingAddress: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      notes: "",
      isActive: true,
    });
    setSameAsAddress(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Don't allow changing client code manually
    if (name === "clientCode") {
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
      
      // If same as address is checked, update billing address too
      if (sameAsAddress && parent === "address") {
        setFormData((prev) => ({
          ...prev,
          billingAddress: {
            ...prev.billingAddress,
            [child]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSameAddressChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsAddress(isChecked);
    
    if (isChecked) {
      // Copy primary address to billing address
      setFormData((prev) => ({
        ...prev,
        billingAddress: { ...prev.address },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    let success = false;
    if (selectedClient) {
      success = await onUpdate(selectedClient.id, formData);
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
            {name === "clientCode" && (
              <p className="mt-1 text-xs text-gray-500">
                Automatically generated based on client name
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
          {CLIENT_FIELDS.BASIC_INFO.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Primary Address */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b border-gray-200 pb-2">Primary Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {CLIENT_FIELDS.ADDRESS.map(field => renderField(field))}
        </div>
      </div>
      
      {/* Billing Address */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 flex-grow">Billing Address</h3>
          <div className="flex items-center ml-4">
            <input
              id="sameAsAddress"
              type="checkbox"
              checked={sameAsAddress}
              onChange={handleSameAddressChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sameAsAddress" className="ml-2 text-sm text-gray-700">
              Same as Primary Address
            </label>
          </div>
        </div>
        
        {!sameAsAddress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {CLIENT_FIELDS.BILLING_ADDRESS.map(field => renderField(field))}
          </div>
        )}
      </div>
      
      {/* Notes */}
      <div className="mb-6">
        {CLIENT_FIELDS.NOTES.map(field => renderField(field))}
      </div>
      
      <div className="flex justify-end pt-3 border-t border-gray-200">
        {selectedClient && (
          <button
            type="button"
            onClick={() => setSelectedClient(null)}
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
            selectedClient ? 'Update Client' : 'Add Client'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddClientForm;