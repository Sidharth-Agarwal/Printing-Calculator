import React, { useState, useEffect } from "react";
import { MATERIAL_FIELDS, generateMaterialSKU, getStockStatus, getStockStatusInfo } from "../../../constants/materialConstants";

const AddMaterialForm = ({ onSubmit, selectedMaterial, onUpdate, isSubmitting, onCancel, vendors, generateSKUCode }) => {
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
    // New stock tracking fields
    skuCode: "",
    initialStock: "", // Initial area in sqcm
    currentStock: "", // Current area in sqcm  
    minStockLevel: "", // Min area alert threshold
    maxStockLevel: "", // Max area capacity
    stockLocation: "Warehouse A",
    unitOfMeasure: "sqcm", // Fixed for materials
    totalPurchased: 0,
    totalUsed: 0,
  });

  const [stockStatus, setStockStatus] = useState(null);

  useEffect(() => {
    if (selectedMaterial) {
      setFormData({
        ...selectedMaterial,
        // Ensure stock fields exist with defaults
        initialStock: selectedMaterial.initialStock || selectedMaterial.currentStock || "",
        currentStock: selectedMaterial.currentStock || selectedMaterial.initialStock || "",
        minStockLevel: selectedMaterial.minStockLevel || "",
        maxStockLevel: selectedMaterial.maxStockLevel || "",
        stockLocation: selectedMaterial.stockLocation || "Warehouse A",
        unitOfMeasure: selectedMaterial.unitOfMeasure || "sqcm",
        totalPurchased: selectedMaterial.totalPurchased || 0,
        totalUsed: selectedMaterial.totalUsed || 0,
      });
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
        skuCode: "",
        initialStock: "",
        currentStock: "",
        minStockLevel: "",
        maxStockLevel: "",
        stockLocation: "Warehouse A",
        unitOfMeasure: "sqcm",
        totalPurchased: 0,
        totalUsed: 0,
      });
    }
  }, [selectedMaterial]);

  // Auto-generate SKU code when material details change (for new materials only)
  useEffect(() => {
    const generateSKU = async () => {
      if (!selectedMaterial && formData.materialType && formData.company && generateSKUCode) {
        try {
          const generatedSKU = await generateSKUCode("Material", formData.materialType, formData.company);
          setFormData(prev => ({
            ...prev,
            skuCode: generatedSKU
          }));
        } catch (error) {
          console.error("Error generating SKU:", error);
        }
      }
    };

    generateSKU();
  }, [formData.materialType, formData.company, selectedMaterial, generateSKUCode]);

  // Set currentStock to initialStock when initialStock changes (for new materials)
  useEffect(() => {
    if (!selectedMaterial && formData.initialStock) {
      setFormData(prev => ({
        ...prev,
        currentStock: formData.initialStock
      }));
    }
  }, [formData.initialStock, selectedMaterial]);

  // Update stock status when stock levels change
  useEffect(() => {
    if (formData.currentStock && formData.minStockLevel) {
      const status = getStockStatus(formData.currentStock, formData.minStockLevel, formData.maxStockLevel);
      setStockStatus(status);
    }
  }, [formData.currentStock, formData.minStockLevel, formData.maxStockLevel]);

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

    // Prepare data with proper stock initialization
    const submitData = {
      ...formData,
      // For new materials, set up initial stock tracking
      currentStock: selectedMaterial ? formData.currentStock : formData.initialStock,
      lastStockUpdate: new Date(),
      stockHistory: selectedMaterial ? formData.stockHistory || [] : [{
        date: new Date(),
        type: "INITIAL_STOCK",
        quantity: formData.initialStock,
        notes: "Initial stock entry"
      }]
    };

    if (selectedMaterial) {
      onUpdate(selectedMaterial.id, submitData);
    } else {
      onSubmit(submitData);
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
    const { name, label, type, required, readOnly, options, placeholder } = field;
    
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
              disabled={readOnly || isSubmitting}
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
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              readOnly={readOnly}
              className={`w-full p-2 border border-gray-300 rounded text-sm ${
                readOnly ? "bg-gray-100" : ""
              }`}
              required={required}
              disabled={isSubmitting}
            />
            {name === "skuCode" && (
              <p className="mt-1 text-xs text-gray-500">
                Automatically generated based on material type and company
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Information */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-gray-700 border-b border-gray-200 pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          {updatedBasicInfoFields.map((field) => renderField(field))}
        </div>
      </div>

      {/* Dimensions & Costs */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-gray-700 border-b border-gray-200 pb-2">Dimensions & Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          {MATERIAL_FIELDS.DIMENSIONS_COSTS.map((field) => renderField(field))}
        </div>
      </div>

      {/* Calculated Values */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {MATERIAL_FIELDS.CALCULATED_VALUES.map((field) => renderField(field))}
        </div>
      </div>

      {/* Stock Management */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Stock Management (Area-based)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {MATERIAL_FIELDS.STOCK_MANAGEMENT.map((field) => renderField(field))}
        </div>
        
        {/* Stock Status Indicator */}
        {stockStatus && (
          <div className="mt-3 p-2 rounded border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Current Stock Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStockStatusInfo(stockStatus).color}`}>
                {getStockStatusInfo(stockStatus).icon} {getStockStatusInfo(stockStatus).label}
              </span>
            </div>
            {formData.currentStock && formData.area && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Current: {formData.currentStock} sqcm | Calculated Area: {formData.area} sqcm</p>
                <p>Coverage: {formData.currentStock && formData.area ? (parseFloat(formData.currentStock) / parseFloat(formData.area)).toFixed(2) : 0} units worth of material</p>
              </div>
            )}
          </div>
        )}
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