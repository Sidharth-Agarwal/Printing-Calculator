import React, { useState, useEffect } from "react";

const AddGstHsnForm = ({ onSubmit, selectedGstHsn, onUpdate, isSubmitting, onCancel }) => {
  const [formData, setFormData] = useState({
    group: "",
    type: "",
    concatenate: "",
    value: "",
  });

  useEffect(() => {
    if (selectedGstHsn) {
      setFormData(selectedGstHsn);
    } else {
      setFormData({
        group: "",
        type: "",
        concatenate: "",
        value: "",
      });
    }
  }, [selectedGstHsn]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update fields and dynamically generate the Concatenate value
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Dynamically update the concatenate field
      if (name === "group" || name === "type") {
        updatedData.concatenate = `${updatedData.group || ""} ${updatedData.type || ""}`.trim();
      }

      return updatedData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedGstHsn) {
      onUpdate(selectedGstHsn.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Group</label>
            <input
              type="text"
              name="group"
              value={formData.group || ""}
              onChange={handleChange}
              placeholder="Enter group name"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <input
              type="text"
              name="type"
              value={formData.type || ""}
              onChange={handleChange}
              placeholder="Enter type name"
              className="w-full p-2 border border-gray-300 rounded text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Concatenate</label>
            <input
              type="text"
              name="concatenate"
              value={formData.concatenate || ""}
              readOnly
              placeholder="Auto-generated"
              className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
            <input
              type="text"
              name="value"
              value={formData.value || ""}
              onChange={handleChange}
              placeholder="Enter value"
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
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
            selectedGstHsn ? 'Update GST/HSN Code' : 'Add GST/HSN Code'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddGstHsnForm;