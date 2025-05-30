import React, { useState, useEffect } from "react";
import { MATERIAL_FIELDS } from "../../../constants/materialConstants";

const AddMaterialForm = ({ onSubmit, selectedMaterial, onUpdate, isSubmitting, onCancel, vendors }) => {
  const [formData, setFormData] = useState({
    materialType: "",
    materialName: "",
    company: "",
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

  useEffect(() => {
    if (selectedMaterial) {
      setFormData(selectedMaterial);
    } else {
      setFormData({
        materialType: "",
        materialName: "",
        company: "",
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
    }
  }, [selectedMaterial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      
      // Calculate derived values
      const sizeL = parseFloat(updatedData.sizeL || 0);
      const sizeB = parseFloat(updatedData.sizeB || 0);
      const quantity = parseFloat(updatedData.quantity || 0);
      const rate = parseFloat(updatedData.rate || 0);
      const courier = parseFloat(updatedData.courier || 0);
      const markUp = parseFloat(updatedData.markUp || 0);
      
      const area = (sizeL * sizeB * quantity).toFixed(4);
      const landedCost = (rate + courier).toFixed(4);
      const costPerUnit = area > 0 ? (parseFloat(landedCost) / parseFloat(area)).toFixed(4) : "0.00";
      const finalCostPerUnit = (parseFloat(costPerUnit) * parseFloat(markUp || 0)).toFixed(4);
      
      return {
        ...updatedData,
        area,
        landedCost,
        costPerUnit,
        finalCostPerUnit,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedMaterial) {
      onUpdate(selectedMaterial.id, formData);
    } else {
      onSubmit(formData);
    }
  };

  // Prepare vendor options for the company dropdown
  const companyOptions = vendors.map(vendor => ({
    value: vendor.name,
    label: vendor.name
  }));

  // Create an updated copy of the field definitions with vendor options
  const updatedBasicInfoFields = MATERIAL_FIELDS.BASIC_INFO.map(field => {
    if (field.name === "company") {
      return { ...field, options: companyOptions };
    }
    return field;
  });

  // Render a field based on its type and configuration
  const renderField = (field) => {
    const { name, label, type, required, readOnly, options } = field;
    
    switch (type) {
      case "select":
        return (
          <div key={name}>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <select
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              className={`w-full p-2 border border-gray-300 rounded text-sm ${
                readOnly ? "bg-gray-100" : ""
              }`}
              required={required}
              disabled={readOnly}
            >
              <option value="">Select {label}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      default: // text, number, etc.
        return (
          <div key={name}>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder || `Enter ${label.toLowerCase()}`}
              readOnly={readOnly}
              className={`w-full p-2 border border-gray-300 rounded text-sm ${
                readOnly ? "bg-gray-100" : ""
              }`}
              required={required}
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* First row - 5 fields */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          {updatedBasicInfoFields.map((field) => renderField(field))}
        </div>
      </div>

      {/* Second row - 4 fields */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          {MATERIAL_FIELDS.DIMENSIONS_COSTS.map((field) => renderField(field))}
        </div>
      </div>

      {/* Calculated Values section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {MATERIAL_FIELDS.CALCULATED_VALUES.map((field) => renderField(field))}
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
            selectedMaterial ? 'Update Material' : 'Add Material'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddMaterialForm;