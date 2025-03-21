import React, { useEffect, useState } from "react";
import FormField from '../../common/FormField';
import { PAPER_FORM_FIELDS } from '../../../constants/formFields';

const AddPaperForm = ({ onAddPaper, onUpdatePaper, editingPaper, setEditingPaper }) => {
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

  const [errors, setErrors] = useState({});

  // Populate form when editingPaper changes
  useEffect(() => {
    if (editingPaper) {
      setFormData(editingPaper);
    } else {
      resetForm();
    }
  }, [editingPaper]);

  const resetForm = () => {
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
    setErrors({});
  };

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
      const oneSqcmInGram = gsm / 1000;
      const gsmPerSheet = (area * oneSqcmInGram) / 1000;
      const freightPerSheet = ratePerGram * gsmPerSheet;
      const finalRate = pricePerSheet + freightPerSheet;

      return {
        ...updatedForm,
        ratePerGram: ratePerGram.toFixed(2),
        area: area.toFixed(2),
        oneSqcmInGram: oneSqcmInGram.toFixed(4),
        gsmPerSheet: gsmPerSheet.toFixed(2),
        freightPerSheet: freightPerSheet.toFixed(2),
        finalRate: finalRate.toFixed(2),
      };
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    PAPER_FORM_FIELDS.forEach(field => {
      if (!field.readOnly && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    // Additional validations
    if (formData.length && formData.breadth) {
      if (parseFloat(formData.length) <= 0) {
        newErrors.length = "Length must be greater than zero";
      }
      if (parseFloat(formData.breadth) <= 0) {
        newErrors.breadth = "Breadth must be greater than zero";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingPaper) {
      onUpdatePaper(editingPaper.id, formData); // Update paper
    } else {
      onAddPaper(formData); // Add new paper
    }

    resetForm();
    setEditingPaper(null); // Clear editing state
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-medium mb-4">{editingPaper ? "EDIT PAPER" : "ADD NEW PAPER"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
        {PAPER_FORM_FIELDS.map((field, idx) => (
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
              onChange={field.readOnly ? undefined : handleChange}
              placeholder={field.placeholder}
              className={`text-md mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm ${
                field.readOnly ? "bg-gray-100" : ""
              }`}
              readOnly={field.readOnly || false}
              required={!field.readOnly}
            />
          </FormField>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded text-sm">
          {editingPaper ? "Save Changes" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default AddPaperForm;