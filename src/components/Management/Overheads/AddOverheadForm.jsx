import React, { useState, useEffect } from "react";

const AddOverheadForm = ({ onSubmit, selectedOverhead, onUpdate, isSubmitting, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    percentage: "",
  });
  const [error, setError] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (selectedOverhead) {
      setFormData(selectedOverhead);
    } else {
      setFormData({
        name: "",
        value: "",
        percentage: "",
      });
    }
    setError(""); // Clear any errors when form changes
  }, [selectedOverhead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if at least the name is filled
    if (!formData.name) {
      setError("Please enter at least the overhead name");
      return;
    }

    if (selectedOverhead) {
      onUpdate(selectedOverhead.id, formData);
    } else {
      onSubmit(formData);
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
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              placeholder="Enter overhead name"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Value (INR)
            </label>
            <input
              type="number"
              name="value"
              value={formData.value || ""}
              onChange={handleChange}
              placeholder="Enter value"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              onWheel={(e) => e.target.blur()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Percentage (%)
            </label>
            <input
              type="number"
              name="percentage"
              value={formData.percentage || ""}
              onChange={handleChange}
              placeholder="Enter percentage"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              onWheel={(e) => e.target.blur()}
            />
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Note: Enter either a value or a percentage
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
          className="px-4 py-2 bg-cyan-500 text-white rounded-md text-sm hover:bg-cyan-600"
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
            selectedOverhead ? 'Update Overhead' : 'Add Overhead'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddOverheadForm;