import React, { useState, useEffect } from "react";

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
    const { name, value } = e.target;
    
    // Don't allow changing client code manually
    if (name === "clientCode") {
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
    } else if (name === "isActive") {
      // Handle checkbox for isActive status
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
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

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-lg font-bold mb-4">
        {selectedClient ? "Edit Client" : "Add New Client"}
      </h2>
      
      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Code</label>
            <input
              type="text"
              name="clientCode"
              value={formData.clientCode}
              className="mt-1 text-md block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm cursor-not-allowed"
              readOnly
              placeholder="Auto-generated from client name"
            />
            <p className="mt-1 text-xs text-gray-500">
              Automatically generated based on client name
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter client name"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Type</label>
            <select
              name="clientType"
              value={formData.clientType}
              onChange={handleChange}
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="Direct">Direct Client</option>
              <option value="B2B">B2B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Enter contact person name"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter client email"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">GSTIN</label>
            <input
              type="text"
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              placeholder="Enter GST identification number"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="flex items-center mt-6">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Client is Active
            </label>
          </div>
        </div>
      </div>
      
      {/* Primary Address */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700">Primary Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
            <input
              type="text"
              name="address.line1"
              value={formData.address.line1}
              onChange={handleChange}
              placeholder="Enter address line 1"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
            <input
              type="text"
              name="address.line2"
              value={formData.address.line2}
              onChange={handleChange}
              placeholder="Enter address line 2"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="Enter city"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="Enter state"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
            <input
              type="text"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
              placeholder="Enter postal code"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              placeholder="Enter country"
              className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Billing Address */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <h3 className="text-md font-medium text-gray-700 mr-4">Billing Address</h3>
          <div className="flex items-center">
            <input
              id="sameAsAddress"
              type="checkbox"
              checked={sameAsAddress}
              onChange={handleSameAddressChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="sameAsAddress" className="ml-2 text-sm text-gray-700">
              Same as Primary Address
            </label>
          </div>
        </div>
        
        {!sameAsAddress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                name="billingAddress.line1"
                value={formData.billingAddress.line1}
                onChange={handleChange}
                placeholder="Enter address line 1"
                className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                name="billingAddress.line2"
                value={formData.billingAddress.line2}
                onChange={handleChange}
                placeholder="Enter address line 2"
                className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="billingAddress.city"
                value={formData.billingAddress.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="billingAddress.state"
                value={formData.billingAddress.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                name="billingAddress.postalCode"
                value={formData.billingAddress.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
                className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="billingAddress.country"
                value={formData.billingAddress.country}
                onChange={handleChange}
                placeholder="Enter country"
                className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional notes"
          className="mt-1 text-md block w-full border-gray-300 rounded-md shadow-sm"
          rows="4"
        ></textarea>
      </div>
      
      <div className="flex justify-end">
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