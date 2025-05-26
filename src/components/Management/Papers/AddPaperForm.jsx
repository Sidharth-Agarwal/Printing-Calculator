import React, { useState, useEffect } from "react";
import { PAPER_FIELDS, generatePaperSKU, getPaperStockStatus, getPaperStockStatusInfo, calculatePaperAreaCoverage } from "../../../constants/paperContants";

const AddPaperForm = ({ onSubmit, selectedPaper, onUpdate, isSubmitting, onCancel, vendors, generateSKUCode }) => {
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
    // New stock tracking fields (sheet-based)
    skuCode: "",
    initialStock: "", // Initial sheets
    currentStock: "", // Current sheets
    minStockLevel: "", // Min sheets alert threshold
    maxStockLevel: "", // Max sheets capacity
    stockLocation: "Paper Storage A",
    unitOfMeasure: "sheets", // Fixed for papers
    totalPurchased: 0,
    totalUsed: 0,
  });

  const [stockStatus, setStockStatus] = useState(null);
  const [areaCoverage, setAreaCoverage] = useState(null);

  useEffect(() => {
    if (selectedPaper) {
      setFormData({
        ...selectedPaper,
        // Ensure stock fields exist with defaults
        initialStock: selectedPaper.initialStock || selectedPaper.currentStock || "",
        currentStock: selectedPaper.currentStock || selectedPaper.initialStock || "",
        minStockLevel: selectedPaper.minStockLevel || "",
        maxStockLevel: selectedPaper.maxStockLevel || "",
        stockLocation: selectedPaper.stockLocation || "Paper Storage A",
        unitOfMeasure: selectedPaper.unitOfMeasure || "sheets",
        totalPurchased: selectedPaper.totalPurchased || 0,
        totalUsed: selectedPaper.totalUsed || 0,
      });
    } else {
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
        skuCode: "",
        initialStock: "",
        currentStock: "",
        minStockLevel: "",
        maxStockLevel: "",
        stockLocation: "Paper Storage A",
        unitOfMeasure: "sheets",
        totalPurchased: 0,
        totalUsed: 0,
      });
    }
  }, [selectedPaper]);

  // Auto-generate SKU code when paper details change (for new papers only)
  useEffect(() => {
    const generateSKU = async () => {
      if (!selectedPaper && formData.paperName && formData.company && formData.gsm && generateSKUCode) {
        try {
          const generatedSKU = await generateSKUCode("Paper", formData.paperName, formData.company, formData.gsm);
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
  }, [formData.paperName, formData.company, formData.gsm, selectedPaper, generateSKUCode]);

  // Set currentStock to initialStock when initialStock changes (for new papers)
  useEffect(() => {
    if (!selectedPaper && formData.initialStock) {
      setFormData(prev => ({
        ...prev,
        currentStock: formData.initialStock
      }));
    }
  }, [formData.initialStock, selectedPaper]);

  // Update stock status when stock levels change
  useEffect(() => {
    if (formData.currentStock && formData.minStockLevel) {
      const status = getPaperStockStatus(formData.currentStock, formData.minStockLevel, formData.maxStockLevel);
      setStockStatus(status);
    }
  }, [formData.currentStock, formData.minStockLevel, formData.maxStockLevel]);

  // Calculate area coverage when stock or dimensions change
  useEffect(() => {
    if (formData.currentStock && formData.length && formData.breadth) {
      const coverage = calculatePaperAreaCoverage(formData.currentStock, formData.length, formData.breadth);
      setAreaCoverage(coverage);
    }
  }, [formData.currentStock, formData.length, formData.breadth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      
      // Calculate derived values for papers
      const length = parseFloat(updatedData.length || 0);
      const breadth = parseFloat(updatedData.breadth || 0);
      const gsm = parseFloat(updatedData.gsm || 0);
      const pricePerSheet = parseFloat(updatedData.pricePerSheet || 0);
      const freightPerKg = parseFloat(updatedData.freightPerKg || 0);
      
      // Paper calculations
      const area = (length * breadth).toFixed(4);
      const oneSqcmInGram = area > 0 ? (gsm / area).toFixed(6) : "0.000000";
      const gsmPerSheet = (gsm * area / 10000).toFixed(4); // Convert sqcm to sqm for GSM calculation
      const freightPerSheet = area > 0 ? (parseFloat(oneSqcmInGram) * area * freightPerKg / 1000).toFixed(4) : "0.00";
      const ratePerGram = gsm > 0 ? (pricePerSheet / gsmPerSheet * 1000).toFixed(4) : "0.00";
      const finalRate = (pricePerSheet + parseFloat(freightPerSheet)).toFixed(4);
      
      return {
        ...updatedData,
        area,
        oneSqcmInGram,
        gsmPerSheet,
        freightPerSheet,
        ratePerGram,
        finalRate,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data with proper stock initialization
    const submitData = {
      ...formData,
      // For new papers, set up initial stock tracking
      currentStock: selectedPaper ? formData.currentStock : formData.initialStock,
      lastStockUpdate: new Date(),
      stockHistory: selectedPaper ? formData.stockHistory || [] : [{
        date: new Date(),
        type: "INITIAL_STOCK",
        quantity: formData.initialStock,
        notes: "Initial stock entry"
      }]
    };

    if (selectedPaper) {
      onUpdate(selectedPaper.id, submitData);
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
  const updatedBasicInfoFields = PAPER_FIELDS.BASIC_INFO.map(field => {
    if (field.name === "company") {
      return { ...field, options: companyOptions };
    }
    return field;
  });

  // Render a field based on its type and configuration
  const renderField = (field) => {
    const { name, label, type, required, readOnly, options, placeholder, value } = field;
    
    switch (type) {
      case "select":
        return (
          <div key={name}>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <select
              name={name}
              value={formData[name] || value || ""}
              onChange={handleChange}
              className={`w-full p-2 border border-gray-300 rounded text-sm ${
                readOnly ? "bg-gray-100" : ""
              }`}
              required={required}
              disabled={readOnly || isSubmitting}
            >
              <option value="">Select {label}</option>
              {options && options.map((option) => (
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
              value={formData[name] || value || ""}
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
                Automatically generated based on paper name, company, and GSM
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          {updatedBasicInfoFields.map((field) => renderField(field))}
        </div>
      </div>

      {/* Dimensions & Shipping */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-gray-700 border-b border-gray-200 pb-2">Dimensions & Shipping</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {PAPER_FIELDS.DIMENSIONS_SHIPPING.map((field) => renderField(field))}
        </div>
      </div>

      {/* Calculated Values */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Values</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {PAPER_FIELDS.CALCULATED_VALUES.map((field) => renderField(field))}
        </div>
      </div>

      {/* Stock Management */}
      <div className="mb-6 bg-green-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-green-800 mb-3">Stock Management (Sheet-based)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {PAPER_FIELDS.STOCK_MANAGEMENT.map((field) => renderField(field))}
        </div>
        
        {/* Stock Status Indicator */}
        {stockStatus && (
          <div className="mt-3 p-2 rounded border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Current Stock Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPaperStockStatusInfo(stockStatus).color}`}>
                {getPaperStockStatusInfo(stockStatus).icon} {getPaperStockStatusInfo(stockStatus).label}
              </span>
            </div>
            {areaCoverage && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Current: {formData.currentStock} sheets | Area per sheet: {areaCoverage.areaPerSheet} sqcm</p>
                <p>Total area coverage: {areaCoverage.totalArea} sqcm available</p>
                <p>Sheets available: {areaCoverage.sheetsCount}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Area Coverage Summary */}
      {areaCoverage && formData.currentStock && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Area Coverage Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium">Per Sheet</p>
              <p className="text-blue-600">{areaCoverage.areaPerSheet} sqcm</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Total Coverage</p>
              <p className="text-blue-600">{areaCoverage.totalArea} sqcm</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Sheet Count</p>
              <p className="text-blue-600">{areaCoverage.sheetsCount} sheets</p>
            </div>
          </div>
        </div>
      )}

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
            selectedPaper ? 'Update Paper' : 'Add Paper'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddPaperForm;