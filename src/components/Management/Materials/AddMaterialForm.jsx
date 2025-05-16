import React, { useState, useEffect } from "react";

const AddMaterialForm = ({ onSubmit, selectedMaterial, onUpdate, isSubmitting, onCancel }) => {
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

  useEffect(() => {
    if (selectedMaterial) {
      setFormData(selectedMaterial);
    } else {
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

  // Group fields for better organization
  const inputFields = [
    { 
      section: "Basic Information",
      fields: [
        { label: "Material Type", name: "materialType", placeholder: "Enter the type of the material", type: "text" },
        { label: "Material Name", name: "materialName", placeholder: "Enter the name of the material", type: "text" },
        { label: "Rate (INR)", name: "rate", placeholder: "Enter the rate of the material", type: "number" },
        { label: "Quantity", name: "quantity", placeholder: "Enter the quantity", type: "number" },
      ]
    },
    {
      section: "Dimensions & Costs",
      fields: [
        { label: "Size (L in cm)", name: "sizeL", placeholder: "Enter the length", type: "number" },
        { label: "Size (B in cm)", name: "sizeB", placeholder: "Enter the breadth", type: "number" },
        { label: "Courier Cost (INR)", name: "courier", placeholder: "Enter the cost of the courier", type: "number" },
        { label: "Mark Up", name: "markUp", placeholder: "Enter mark up value", type: "number" },
      ]
    },
    {
      section: "Calculated Values",
      fields: [
        { label: "Area (calculated)", name: "area", placeholder: "", type: "text", readOnly: true },
        { label: "Landed Cost (calculated)", name: "landedCost", placeholder: "", type: "text", readOnly: true },
        { label: "Cost/Unit (calculated)", name: "costPerUnit", placeholder: "", type: "text", readOnly: true },
        { label: "Final Cost/Unit (calculated)", name: "finalCostPerUnit", placeholder: "", type: "text", readOnly: true },
      ]
    }
  ];

  return (
    <form onSubmit={handleSubmit}>
      {inputFields.map((section, sectionIdx) => (
        <div key={sectionIdx} className="mb-6">
          {section.section !== "Calculated Values" ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              {section.fields.map((field, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                    className={`w-full p-2 border border-gray-300 rounded text-sm ${
                      field.readOnly ? "bg-gray-100" : ""
                    }`}
                    required={!field.readOnly}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{section.section}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {section.fields.map((field, idx) => (
                  <div key={idx}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ""}
                      readOnly={true}
                      className="w-full p-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

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