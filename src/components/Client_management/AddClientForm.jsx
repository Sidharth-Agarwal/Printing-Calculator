import React, { useState, useEffect } from "react";

const AddClientForm = ({ onSubmit, selectedClient, onUpdate, setSelectedClient, generateClientCode }) => {
  const [formData, setFormData] = useState({
    clientCode: "",
    name: "",
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
    category: "",
    tags: [],
    defaultMarkup: "",
    paymentTerms: "",
    creditLimit: "",
    notes: "",
  });

  const [sameAsAddress, setSameAsAddress] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (selectedClient) {
      setFormData(selectedClient);
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
      category: "",
      tags: [],
      defaultMarkup: "",
      paymentTerms: "",
      creditLimit: "",
      notes: "",
    });
    setSameAsAddress(true);
    setTagInput("");
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

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Ensure numeric fields are stored as numbers
    const processedData = {
      ...formData,
      defaultMarkup: parseFloat(formData.defaultMarkup) || 0,
      creditLimit: parseFloat(formData.creditLimit) || 0,
    };

    let success = false;
    if (selectedClient) {
      success = await onUpdate(selectedClient.id, processedData);
    } else {
      success = await onSubmit(processedData);
    }

    if (success) {
      resetForm();
    }
    
    setSubmitLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-lg font-medium mb-4">
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
              className="mt-1 text-md block w-full border-gray-300 bg-gray-100 rounded-sm shadow-sm cursor-not-allowed"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Enter contact person name"
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
            />
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
              className="h-4 w-4"
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
                className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
                className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
                className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
                className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
                className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
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
                className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Client Classification */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-4 text-gray-700">Client Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
            >
              <option value="">Select Category</option>
              <option value="Regular">Regular</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Markup (%)</label>
            <input
              type="number"
              name="defaultMarkup"
              value={formData.defaultMarkup}
              onChange={handleChange}
              placeholder="Enter default markup percentage"
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Credit Limit (INR)</label>
            <input
              type="number"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleChange}
              placeholder="Enter credit limit"
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
            >
              <option value="">Select Payment Terms</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
              <option value="Due on Receipt">Due on Receipt</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                placeholder="Add a tag"
                className="text-md block w-full border-gray-300 rounded-sm shadow-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-blue-500 text-white rounded text-sm"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded">
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional notes"
          className="mt-1 text-md block w-full border-gray-300 rounded-sm shadow-sm"
          rows="4"
        ></textarea>
      </div>
      
      <button 
        type="submit" 
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        disabled={submitLoading}
      >
        {submitLoading ? "Processing..." : (selectedClient ? "Save Changes" : "Add Client")}
      </button>
      
      {selectedClient && (
        <button
          type="button"
          onClick={() => setSelectedClient(null)}
          className="ml-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default AddClientForm;