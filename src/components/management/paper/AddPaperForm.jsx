import React, { useEffect, useState } from "react";
import { TextInput, SelectInput, NumberInput } from "../../shared/FormFields";
import Button from "../../shared/Button";

const AddPaperForm = ({ onAddPaper, onUpdatePaper, editingPaper, setEditingPaper }) => {
  const initialFormState = {
    paperName: "",
    company: "",
    gsm: "",
    pricePerSheet: "",
    length: "",
    breadth: "",
    freightPerKg: "",
    paperType: "",
    ratePerGram: "",
    area: "",
    oneSqcmInGram: "",
    gsmPerSheet: "",
    freightPerSheet: "",
    finalRate: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [calculating, setCalculating] = useState(false);

  // Paper type options
  const paperTypeOptions = [
    { value: "art", label: "Art Paper" },
    { value: "maplitho", label: "Maplitho" },
    { value: "kraft", label: "Kraft" },
    { value: "gloss", label: "Gloss" },
    { value: "textured", label: "Textured" },
    { value: "metallic", label: "Metallic" },
    { value: "other", label: "Other" }
  ];

  // Populate form when editingPaper changes
  useEffect(() => {
    if (editingPaper) {
      setFormData(editingPaper);
    } else {
      setFormData(initialFormState);
    }
  }, [editingPaper]);

  // Calculate derived fields when input values change
  useEffect(() => {
    if (formData.length && formData.breadth && formData.gsm && formData.freightPerKg) {
      setCalculating(true);
      
      try {
        // Calculate derived values
        const freightPerKg = parseFloat(formData.freightPerKg || 0);
        const length = parseFloat(formData.length || 0);
        const breadth = parseFloat(formData.breadth || 0);
        const gsm = parseFloat(formData.gsm || 0);
        const pricePerSheet = parseFloat(formData.pricePerSheet || 0);

        const ratePerGram = freightPerKg / 1000;
        const area = length * breadth;
        const oneSqcmInGram = gsm / 10000; // GSM is g/m², convert to g/cm²
        const gsmPerSheet = (area * oneSqcmInGram);
        const freightPerSheet = ratePerGram * gsmPerSheet;
        const finalRate = pricePerSheet + freightPerSheet;

        setFormData(prev => ({
          ...prev,
          ratePerGram: ratePerGram.toFixed(4),
          area: area.toFixed(2),
          oneSqcmInGram: oneSqcmInGram.toFixed(6),
          gsmPerSheet: gsmPerSheet.toFixed(2),
          freightPerSheet: freightPerSheet.toFixed(2),
          finalRate: finalRate.toFixed(2),
        }));
      } catch (err) {
        console.error("Calculation error:", err);
      } finally {
        setCalculating(false);
      }
    }
  }, [formData.length, formData.breadth, formData.gsm, formData.freightPerKg, formData.pricePerSheet]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.paperName.trim()) newErrors.paperName = "Paper name is required";
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.gsm) newErrors.gsm = "GSM is required";
    if (!formData.pricePerSheet) newErrors.pricePerSheet = "Price per sheet is required";
    if (!formData.length) newErrors.length = "Length is required";
    if (!formData.breadth) newErrors.breadth = "Breadth is required";
    if (!formData.freightPerKg) newErrors.freightPerKg = "Freight per kg is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingPaper) {
      onUpdatePaper(editingPaper.id, formData);
    } else {
      onAddPaper(formData);
      setFormData(initialFormState);
    }
  };

  const handleCancel = () => {
    setEditingPaper(null);
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Paper Details Section */}
        <div className="md:col-span-3">
          <h3 className="text-md font-medium mb-2 text-gray-700">Paper Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput
              label="Paper Name"
              name="paperName"
              value={formData.paperName}
              onChange={handleChange}
              placeholder="Enter paper name"
              error={errors.paperName}
              required
            />
            
            <TextInput
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name"
              error={errors.company}
              required
            />
            
            <SelectInput
              label="Paper Type"
              name="paperType"
              value={formData.paperType}
              onChange={handleChange}
              options={paperTypeOptions}
              placeholder="Select paper type"
              error={errors.paperType}
            />
          </div>
        </div>
        
        {/* Specifications Section */}
        <div className="md:col-span-3">
          <h3 className="text-md font-medium mb-2 text-gray-700">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <NumberInput
              label="GSM"
              name="gsm"
              value={formData.gsm}
              onChange={handleChange}
              placeholder="Enter GSM"
              error={errors.gsm}
              required
              min={0}
            />
            
            <NumberInput
              label="Price/Sheet (INR)"
              name="pricePerSheet"
              value={formData.pricePerSheet}
              onChange={handleChange}
              placeholder="Enter price per sheet"
              error={errors.pricePerSheet}
              required
              min={0}
              step={0.01}
            />
            
            <NumberInput
              label="Length (CM)"
              name="length"
              value={formData.length}
              onChange={handleChange}
              placeholder="Enter length"
              error={errors.length}
              required
              min={0}
              step={0.1}
            />
            
            <NumberInput
              label="Breadth (CM)"
              name="breadth"
              value={formData.breadth}
              onChange={handleChange}
              placeholder="Enter breadth"
              error={errors.breadth}
              required
              min={0}
              step={0.1}
            />
          </div>
        </div>
        
        {/* Freight Section */}
        <div className="md:col-span-3">
          <h3 className="text-md font-medium mb-2 text-gray-700">Freight Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <NumberInput
              label="Freight/KG (INR)"
              name="freightPerKg"
              value={formData.freightPerKg}
              onChange={handleChange}
              placeholder="Enter freight per kg"
              error={errors.freightPerKg}
              required
              min={0}
              step={0.01}
            />
          </div>
        </div>
        
        {/* Calculated Values Section */}
        <div className="md:col-span-3">
          <h3 className="text-md font-medium mb-2 text-gray-700">Calculated Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextInput
              label="Rate/Gram (INR)"
              name="ratePerGram"
              value={formData.ratePerGram}
              readOnly
              className="bg-gray-50"
            />
            
            <TextInput
              label="Area (sqcm)"
              name="area"
              value={formData.area}
              readOnly
              className="bg-gray-50"
            />
            
            <TextInput
              label="1 Sqcm in Gram"
              name="oneSqcmInGram"
              value={formData.oneSqcmInGram}
              readOnly
              className="bg-gray-50"
            />
            
            <TextInput
              label="GSM/Sheet"
              name="gsmPerSheet"
              value={formData.gsmPerSheet}
              readOnly
              className="bg-gray-50"
            />
            
            <TextInput
              label="Freight/Sheet (INR)"
              name="freightPerSheet"
              value={formData.freightPerSheet}
              readOnly
              className="bg-gray-50"
            />
            
            <TextInput
              label="Final Rate (INR)"
              name="finalRate"
              value={formData.finalRate}
              readOnly
              className="bg-gray-50 font-bold"
            />
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-2 mt-6">
        {editingPaper && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          variant="primary"
          disabled={calculating}
        >
          {calculating ? "Calculating..." : editingPaper ? "Save Changes" : "Add Paper"}
        </Button>
      </div>
    </form>
  );
};

export default AddPaperForm;