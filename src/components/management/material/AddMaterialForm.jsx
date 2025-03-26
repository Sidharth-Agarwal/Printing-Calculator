import React, { useState, useEffect } from "react";
import { TextInput, NumberInput, SelectInput } from "../../shared/FormFields";
import Button from "../../shared/Button";

const AddMaterialForm = ({ onSubmit, selectedMaterial, onUpdate, setSelectedMaterial }) => {
  const initialFormState = {
    materialType: "",
    materialName: "",
    rate: "",
    quantity: "",
    sizeL: "",
    sizeB: "",
    courier: "",
    markUp: "",
    supplier: "",
    inStock: true,
    stockQuantity: "",
    reorderLevel: "",
    area: "",
    landedCost: "",
    costPerUnit: "",
    finalCostPerUnit: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [calculating, setCalculating] = useState(false);

  // Material type options
  const materialTypeOptions = [
    { value: "foil", label: "Foil" },
    { value: "embossingPlate", label: "Embossing Plate" },
    { value: "dieBoard", label: "Die Board" },
    { value: "adhesive", label: "Adhesive" },
    { value: "ink", label: "Ink" },
    { value: "packaging", label: "Packaging Material" },
    { value: "other", label: "Other" }
  ];

  // Populate form when selected material changes
  useEffect(() => {
    if (selectedMaterial) {
      setFormData(selectedMaterial);
    } else {
      setFormData(initialFormState);
    }
  }, [selectedMaterial]);

  // Calculate derived fields when input values change
  useEffect(() => {
    if (formData.sizeL && formData.sizeB && formData.rate && formData.quantity && formData.courier && formData.markUp) {
      setCalculating(true);
      
      try {
        // Convert to numbers
        const sizeL = parseFloat(formData.sizeL || 0);
        const sizeB = parseFloat(formData.sizeB || 0);
        const rate = parseFloat(formData.rate || 0);
        const quantity = parseFloat(formData.quantity || 0);
        const courier = parseFloat(formData.courier || 0);
        const markUp = parseFloat(formData.markUp || 0);
        
        // Calculate derived values
        const area = (sizeL * sizeB * quantity).toFixed(2);
        const landedCost = (rate + courier).toFixed(2);
        const costPerUnit = area > 0 ? (parseFloat(landedCost) / parseFloat(area)).toFixed(4) : "0.0000";
        const finalCostPerUnit = (parseFloat(costPerUnit) * markUp).toFixed(2);
        
        setFormData(prev => ({
          ...prev,
          area,
          landedCost,
          costPerUnit,
          finalCostPerUnit
        }));
      } catch (err) {
        console.error("Calculation error:", err);
      } finally {
        setCalculating(false);
      }
    }
  }, [formData.sizeL, formData.sizeB, formData.rate, formData.quantity, formData.courier, formData.markUp]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.materialType.trim()) newErrors.materialType = "Material type is required";
    if (!formData.materialName.trim()) newErrors.materialName = "Material name is required";
    if (!formData.rate) newErrors.rate = "Rate is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (!formData.sizeL) newErrors.sizeL = "Length is required";
    if (!formData.sizeB) newErrors.sizeB = "Breadth is required";
    if (!formData.markUp) newErrors.markUp = "Mark up is required";
    
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

    if (selectedMaterial) {
      onUpdate(selectedMaterial.id, formData);
    } else {
      onSubmit(formData);
      setFormData(initialFormState);
    }
  };

  const handleCancel = () => {
    setSelectedMaterial(null);
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Material Details Section */}
        <div className="md:col-span-4">
          <h3 className="text-md font-medium mb-2 text-gray-700">Material Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectInput
              label="Material Type"
              name="materialType"
              value={formData.materialType}
              onChange={handleChange}
              options={materialTypeOptions}
              placeholder="Select material type"
              error={errors.materialType}
              required
            />
            
            <TextInput
              label="Material Name"
              name="materialName"
              value={formData.materialName}
              onChange={handleChange}
              placeholder="Enter material name"
              error={errors.materialName}
              required
            />
            
            <TextInput
              label="Supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Enter supplier name"
              error={errors.supplier}
            />
            
            <NumberInput
              label="Mark Up"
              name="markUp"
              value={formData.markUp}
              onChange={handleChange}
              placeholder="Enter mark up value"
              error={errors.markUp}
              min={0}
              step={0.1}
              required
            />
          </div>
        </div>
        
        {/* Specifications Section */}
        <div className="md:col-span-4">
          <h3 className="text-md font-medium mb-2 text-gray-700">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <NumberInput
              label="Rate (INR)"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              placeholder="Enter material rate"
              error={errors.rate}
              min={0}
              step={0.01}
              required
            />
            
            <NumberInput
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              error={errors.quantity}
              min={0}
              required
            />
            
            <NumberInput
              label="Size (L in cm)"
              name="sizeL"
              value={formData.sizeL}
              onChange={handleChange}
              placeholder="Enter length"
              error={errors.sizeL}
              min={0}
              step={0.1}
              required
            />
            
            <NumberInput
              label="Size (B in cm)"
              name="sizeB"
              value={formData.sizeB}
              onChange={handleChange}
              placeholder="Enter breadth"
              error={errors.sizeB}
              min={0}
              step={0.1}
              required
            />
          </div>
        </div>
        
        {/* Shipping & Inventory Section */}
        <div className="md:col-span-4">
          <h3 className="text-md font-medium mb-2 text-gray-700">Shipping & Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <NumberInput
              label="Courier Cost (INR)"
              name="courier"
              value={formData.courier}
              onChange={handleChange}
              placeholder="Enter courier cost"
              error={errors.courier}
              min={0}
              step={0.01}
            />
            
            <NumberInput
              label="Stock Quantity"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              min={0}
            />
            
            <NumberInput
              label="Reorder Level"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              placeholder="Enter reorder level"
              min={0}
            />
          </div>
        </div>
        
        {/* Calculated Values Section */}
        <div className="md:col-span-4">
          <h3 className="text-md font-medium mb-2 text-gray-700">Calculated Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextInput
              label="Area (sq cm)"
              name="area"
              value={formData.area}
              readOnly
              className="bg-gray-50"
            />
            
            <TextInput
              label="Landed Cost (INR)"
              name="landedCost"
              value={formData.landedCost}
              readOnly
              className="bg-gray-50"
            />
            
            <TextInput
              label="Cost/Unit"
              name="costPerUnit"
              value={formData.costPerUnit}
              readOnly
              className="bg-gray-50"
            />
            
            <TextInput
              label="Final Cost/Unit"
              name="finalCostPerUnit"
              value={formData.finalCostPerUnit}
              readOnly
              className="bg-gray-50 font-bold"
            />
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-2 mt-6">
        {selectedMaterial && (
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
          {calculating ? "Calculating..." : selectedMaterial ? "Save Changes" : "Add Material"}
        </Button>
      </div>
    </form>
  );
};

export default AddMaterialForm;