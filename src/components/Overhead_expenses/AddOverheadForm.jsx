import React, { useState, useEffect } from "react";

const AddOverheadForm = ({ onSubmit, selectedOverhead, onUpdate, setSelectedOverhead }) => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    percentage: "",
  });

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
  }, [selectedOverhead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedOverhead) {
      onUpdate(selectedOverhead.id, formData);
      setSelectedOverhead(null);
    } else {
      onSubmit(formData);
    }

    // Reset form
    setFormData({
      name: "",
      value: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-medium mb-6">
        {selectedOverhead ? "EDIT OVERHEAD" : "ADD NEW OVERHEAD"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {[
          { 
            label: "Name", 
            name: "name", 
            placeholder: "Enter overhead name", 
            type: "text" 
          },
          { 
            label: "Value (INR)", 
            name: "value", 
            placeholder: "Enter value", 
            type: "number" 
          },
          { 
            label: "Percentage (%)", 
            name: "percentage", 
            placeholder: "Enter percentage", 
            type: "number" 
          },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm"
              required
            />
          </div>
        ))}
      </div>
      <button type="submit" className="mt-6 px-3 py-2 bg-blue-500 text-white rounded text-sm">
        {selectedOverhead ? "Save Changes" : "Add Overhead"}
      </button>
    </form>
  );
};

export default AddOverheadForm;