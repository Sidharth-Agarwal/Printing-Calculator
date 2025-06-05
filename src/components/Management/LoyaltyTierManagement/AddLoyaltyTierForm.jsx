import React, { useState, useEffect } from "react";

const AddLoyaltyTierForm = ({ onSubmit, selectedTier, onUpdate, isSubmitting, onCancel }) => {
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
    } else {
      onSubmit(dataToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tier ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="id"
              value={formData.id || ""}
              onChange={handleChange}
              placeholder="E.g., welcome_circle, trusted_circle"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Unique identifier for this tier
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tier Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="E.g., Welcome Circle, Trusted Circle"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Display name shown to clients
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Order Threshold <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="orderThreshold"
              value={formData.orderThreshold || ""}
              onChange={handleChange}
              placeholder="E.g., 1, 2, 3, 4"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum number of orders to reach this tier
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Discount Percentage <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount || ""}
              onChange={handleChange}
              placeholder="E.g., 5, 10, 15, 20"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
              min="0"
              max="100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Percentage discount applied to orders
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center mt-1">
              <input
                type="color"
                name="color"
                value={formData.color || "#CCCCCC"}
                onChange={handleChange}
                className="h-8 w-8 p-0 border-0 rounded"
              />
              <input
                type="text"
                name="color"
                value={formData.color || "#CCCCCC"}
                onChange={handleChange}
                placeholder="#CCCCCC"
                className="ml-2 flex-1 p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Color for badges and visual elements
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Brief description of this tier"
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Benefits
          </label>
          
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => handleBenefitChange(index, e.target.value)}
                placeholder={`Benefit ${index + 1}`}
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
              />
              <button
                type="button"
                onClick={() => removeBenefitField(index)}
                className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                disabled={formData.benefits.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addBenefitField}
            className="mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm"
          >
            + Add Benefit
          </button>
        </div>
      </div>

      {/* Form buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            selectedTier ? 'Update Tier' : 'Add Tier'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddLoyaltyTierForm;