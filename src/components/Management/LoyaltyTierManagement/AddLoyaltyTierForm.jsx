import React, { useState, useEffect } from "react";

const AddLoyaltyTierForm = ({ onSubmit, selectedTier, onUpdate, setSelectedTier }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    orderThreshold: "",
    discount: "",
    color: "#CCCCCC",
    description: "",
    benefits: [""],
  });
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (selectedTier) {
      // Ensure benefits is an array
      const benefits = Array.isArray(selectedTier.benefits)
        ? selectedTier.benefits
        : [""];
      
      setFormData({
        ...selectedTier,
        benefits: benefits,
      });
    } else {
      setFormData({
        id: "",
        name: "",
        orderThreshold: "",
        discount: "",
        color: "#CCCCCC",
        description: "",
        benefits: [""],
      });
    }
    setError(""); // Clear any errors when form changes
  }, [selectedTier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "orderThreshold" || name === "discount" 
        ? parseInt(value, 10) || "" 
        : value,
    }));
    
    // Clear error when user types
    if (error) setError("");
  };

  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits[index] = value;
    
    setFormData((prev) => ({
      ...prev,
      benefits: updatedBenefits,
    }));
    
    // Clear error when user types
    if (error) setError("");
  };

  const addBenefitField = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }));
  };

  const removeBenefitField = (index) => {
    if (formData.benefits.length <= 1) return;
    
    const updatedBenefits = [...formData.benefits];
    updatedBenefits.splice(index, 1);
    
    setFormData((prev) => ({
      ...prev,
      benefits: updatedBenefits,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.id || !formData.name || !formData.orderThreshold || !formData.discount) {
      setError("Please fill in all required fields");
      return;
    }

    // Filter out empty benefits
    const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== "");
    const dataToSubmit = {
      ...formData,
      benefits: filteredBenefits.length > 0 ? filteredBenefits : ["No additional benefits"],
    };

    if (selectedTier) {
      onUpdate(selectedTier.id, dataToSubmit);
      setSelectedTier(null);
    } else {
      onSubmit(dataToSubmit);
    }

    // Reset form
    setFormData({
      id: "",
      name: "",
      orderThreshold: "",
      discount: "",
      color: "#CCCCCC",
      description: "",
      benefits: [""],
    });
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h2 className="text-lg font-medium mb-4">
        {selectedTier ? "Edit Loyalty Tier" : "Add New Loyalty Tier"}
      </h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tier ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="id"
            value={formData.id || ""}
            onChange={handleChange}
            placeholder="E.g., welcome_circle, trusted_circle"
            className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Unique identifier for this tier (snake_case)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tier Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="E.g., Welcome Circle, Trusted Circle"
            className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Display name shown to clients
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Order Threshold <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="orderThreshold"
            value={formData.orderThreshold || ""}
            onChange={handleChange}
            placeholder="E.g., 1, 2, 3, 4"
            className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
            required
            min="1"
          />
          <p className="mt-1 text-xs text-gray-500">
            Minimum number of orders to reach this tier
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Discount Percentage <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="discount"
            value={formData.discount || ""}
            onChange={handleChange}
            placeholder="E.g., 5, 10, 15, 20"
            className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
            required
            min="0"
            max="100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Percentage discount applied to orders
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <div className="flex items-center mt-3">
            <input
              type="color"
              name="color"
              value={formData.color || "#CCCCCC"}
              onChange={handleChange}
              className="h-10 w-10 p-0 border-0"
            />
            <input
              type="text"
              name="color"
              value={formData.color || "#CCCCCC"}
              onChange={handleChange}
              placeholder="#CCCCCC"
              className="text-md ml-2 flex-1 border-gray-300 rounded-sm shadow-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Color for badges and visual elements
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Brief description of this tier"
            className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Benefits
        </label>
        
        {formData.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={benefit}
              onChange={(e) => handleBenefitChange(index, e.target.value)}
              placeholder={`Benefit ${index + 1}`}
              className="text-md block flex-1 border-gray-300 rounded-sm shadow-sm"
            />
            <button
              type="button"
              onClick={() => removeBenefitField(index)}
              className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
              disabled={formData.benefits.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addBenefitField}
          className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
        >
          + Add Benefit
        </button>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedTier(null)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {selectedTier ? "Update Tier" : "Add Tier"}
        </button>
      </div>
    </form>
  );
};

export default AddLoyaltyTierForm;