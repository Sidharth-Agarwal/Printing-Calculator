import React, { useState, useEffect } from "react";
import FormField from '../../common/FormField';
import { STANDARD_RATE_FORM_FIELDS } from '../../../constants/formFields';

const AddStandardRateForm = ({ onSubmit, selectedRate, onUpdate, setSelectedRate }) => {
  const [formData, setFormData] = useState({
    group: "",
    type: "",
    concatenate: "",
    finalRate: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedRate) {
      setFormData(selectedRate);
    } else {
      resetForm();
    }
  }, [selectedRate]);

  const resetForm = () => {
    setFormData({
      group: "",
      type: "",
      concatenate: "",
      finalRate: "",
    });
    setErrors({});
  };

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

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    STANDARD_RATE_FORM_FIELDS.forEach(field => {
      if (!field.readOnly && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    // Additional validations
    if (formData.finalRate && parseFloat(formData.finalRate) <= 0) {
      newErrors.finalRate = "Final Rate must be greater than zero";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (selectedRate) {
      onUpdate(selectedRate.id, formData);
      setSelectedRate(null);
    } else {
      onSubmit(formData);
    }

    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-medium mb-6">
        {selectedRate ? "EDIT STANDARD RATE" : "ADD NEW STANDARD RATE"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        {STANDARD_RATE_FORM_FIELDS.map((field, idx) => (
          <FormField 
            key={idx}
            label={field.label}
            name={field.name}
            error={errors[field.name]}
            required={!field.readOnly}
          >
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={!field.readOnly ? handleChange : undefined}
              placeholder={field.placeholder}
              readOnly={field.readOnly}
              className={`text-md mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm ${
                field.readOnly ? "bg-gray-100" : ""
              }`}
              required={!field.readOnly}
            />
          </FormField>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded text-sm">
          {selectedRate ? "Save Changes" : "Add Rate"}
        </button>
      </div>
    </form>
  );
};

export default AddStandardRateForm;