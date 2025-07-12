import React, { useEffect, useState } from "react";
import { PAPER_FIELDS } from "../../../constants/paperContants";

const AddPaperForm = ({ onSubmit, initialData, isSubmitting, onCancel, vendors }) => {
  const [formData, setFormData] = useState({
    paperName: "",
    company: "",
    gsm: "",
    pricePerSheet: "",
    length: "",
    breadth: "",
    freightPerKg: "",
    ratePerGram: "",
    area: "",
    oneSqcmInGram: "",
    gsmPerSheet: "",
    freightPerSheet: "",
    finalRate: "",
  });

  // Populate form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form when not editing
      setFormData({
        paperName: "",
        company: "",
        gsm: "",
        pricePerSheet: "",
        length: "",
        breadth: "",
        freightPerKg: "",
        ratePerGram: "",
        area: "",
        oneSqcmInGram: "",
        gsmPerSheet: "",
        freightPerSheet: "",
        finalRate: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      // Update calculated fields
      const freightPerKg = parseFloat(updatedForm.freightPerKg || 0);
      const length = parseFloat(updatedForm.length || 0);
      const breadth = parseFloat(updatedForm.breadth || 0);
      const gsm = parseFloat(updatedForm.gsm || 0);
      const pricePerSheet = parseFloat(updatedForm.pricePerSheet || 0);

      const ratePerGram = freightPerKg / 1000;
      const area = length * breadth;
      const oneSqcmInGram = gsm / 10000;
      const gsmPerSheet = (area * oneSqcmInGram)/1000;
      const freightPerSheet = ratePerGram * gsmPerSheet;
      const finalRate = pricePerSheet + freightPerSheet;

      return {
        ...updatedForm,
        ratePerGram: ratePerGram.toFixed(4),
        area: area.toFixed(4),
        oneSqcmInGram: oneSqcmInGram.toFixed(6),
        gsmPerSheet: gsmPerSheet.toFixed(4),
        freightPerSheet: freightPerSheet.toFixed(4),
        finalRate: finalRate.toFixed(4),
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Prepare vendor options for the company dropdown
  const companyOptions = vendors.map(vendor => ({
    value: vendor.name,
    label: vendor.name
  }));

  // Create an updated copy of the field definitions with vendor options
  const updatedBasicInfoFields = PAPER_FIELDS.BASIC_INFO.map(field => {
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
              onWheel={(e) => e.target.blur()}
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        {/* User input fields */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {updatedBasicInfoFields.map(field => renderField(field))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {PAPER_FIELDS.DIMENSIONS_SHIPPING.map(field => renderField(field))}
        </div>
      </div>

      {/* Calculated Values section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-3">
          {PAPER_FIELDS.CALCULATED_VALUES.slice(0, 3).map(field => renderField(field))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {PAPER_FIELDS.CALCULATED_VALUES.slice(3).map(field => renderField(field))}
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
            initialData ? 'Update Paper' : 'Add Paper'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddPaperForm;