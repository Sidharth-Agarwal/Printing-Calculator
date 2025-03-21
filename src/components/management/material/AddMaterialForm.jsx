import React, { useState, useEffect } from "react";
import FormField from '../../common/FormField';
import { MATERIAL_FORM_FIELDS } from '../../../constants/formFields';

const AddMaterialForm = ({ onSubmit, selectedMaterial, onUpdate, setSelectedMaterial }) => {
  const [formData, setFormData] = useState({
    materialType: "",
    materialName: "",
    rate: "",
    quantity: "",
    sizeL: "",
    sizeB: "",
    courier: "",
    markUp: "",
    area: "",
    landedCost: "",
    costPerUnit: "",
    finalCostPerUnit: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedMaterial) {
      setFormData(selectedMaterial);
    } else {
      resetForm();
    }
  }, [selectedMaterial]);

  const resetForm = () => {
    setFormData({
      materialType: "",
      materialName: "",
      rate: "",
      quantity: "",
      sizeL: "",
      sizeB: "",
      courier: "",
      markUp: "",
      area: "",
      landedCost: "",
      costPerUnit: "",
      finalCostPerUnit: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const calculateFields = () => {
    const area = (parseFloat(formData.sizeL || 0) * parseFloat(formData.sizeB || 0) * parseFloat(formData.quantity || 0)).toFixed(2);
    const landedCost = (parseFloat(formData.rate || 0) + parseFloat(formData.courier || 0)).toFixed(2);
    const costPerUnit = area > 0 ? (parseFloat(landedCost || 0) / parseFloat(area)).toFixed(2) : "0.00";
    const finalCostPerUnit = (parseFloat(costPerUnit || 0) * parseFloat(formData.markUp || 0)).toFixed(2);

    return { area, landedCost, costPerUnit, finalCostPerUnit };
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    MATERIAL_FORM_FIELDS.forEach(field => {
      if (!field.readOnly && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    // Additional validations
    if (formData.sizeL && formData.sizeB) {
      if (parseFloat(formData.sizeL) <= 0) {
        newErrors.sizeL = "Length must be greater than zero";
      }
      if (parseFloat(formData.sizeB) <= 0) {
        newErrors.sizeB = "Breadth must be greater than zero";
      }
    }
    
    if (formData.quantity && parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than zero";
    }
    
    if (formData.markUp && parseFloat(formData.markUp) <= 0) {
      newErrors.markUp = "Mark Up must be greater than zero";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const calculatedFields = calculateFields();
    const completeData = { ...formData, ...calculatedFields };

    if (selectedMaterial) {
      onUpdate(selectedMaterial.id, completeData);
    } else {
      onSubmit(completeData);
    }

    resetForm();
    setSelectedMaterial(null);
  };

  // Calculate fields dynamically for display
  const calculatedFields = calculateFields();

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-bold mb-6">
        {selectedMaterial ? "EDIT MATERIAL" : "ADD NEW MATERIAL"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        {MATERIAL_FORM_FIELDS.map((field, idx) => (
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
              value={field.readOnly 
                ? calculatedFields[field.name] || formData[field.name] || ""
                : formData[field.name] || ""}
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
          {selectedMaterial ? "Save Changes" : "Add Material"}
        </button>
      </div>
    </form>
  );
};

export default AddMaterialForm;