import React, { useState, useEffect } from "react";

const AddStandardRateForm = ({ onSubmit, selectedRate, onUpdate, setSelectedRate }) => {
  const [formData, setFormData] = useState({
    group: "",
    type: "",
    concatenate: "",
    finalRate: "",
  });

  useEffect(() => {
    if (selectedRate) {
      setFormData(selectedRate);
    } else {
      setFormData({
        group: "",
        type: "",
        concatenate: "",
        finalRate: "",
      });
    }
  }, [selectedRate]);

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

    if (selectedRate) {
      onUpdate(selectedRate.id, formData);
      setSelectedRate(null);
    } else {
      onSubmit(formData);
    }

    setFormData({
      group: "",
      type: "",
      concatenate: "",
      finalRate: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-6">
        {selectedRate ? "Edit Standard Rate" : "Add Standard Rate"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Group", name: "group", placeholder: "Enter group name", type: "text" },
          { label: "Type", name: "type", placeholder: "Enter type name", type: "text" },
          { label: "Concatenate", name: "concatenate", type: "text", readOnly: true },
          { label: "Final Rate (INR)", name: "finalRate", placeholder: "Enter rate", type: "number" },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-xl font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={!field.readOnly ? handleChange : undefined}
              placeholder={field.placeholder}
              readOnly={field.readOnly}
              className={`text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm ${
                field.readOnly ? "bg-gray-100" : ""
              }`}
              required={!field.readOnly}
            />
          </div>
        ))}
      </div>
      <button type="submit" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
        {selectedRate ? "Save Changes" : "Add Rate"}
      </button>
    </form>
  );
};

export default AddStandardRateForm;
