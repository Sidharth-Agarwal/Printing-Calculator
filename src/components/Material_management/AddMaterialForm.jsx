import React, { useState, useEffect } from "react";

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateFields = () => {
    const area = (formData.sizeL * formData.sizeB * formData.quantity).toFixed(2);
    const landedCost = (parseFloat(formData.rate || 0) + parseFloat(formData.courier || 0)).toFixed(2);
    const costPerUnit = area > 0 ? (parseFloat(landedCost || 0) / parseFloat(area)).toFixed(2) : "0.00";
    const finalCostPerUnit = (parseFloat(costPerUnit || 0) * parseFloat(formData.markUp || 0)).toFixed(2);

    return { area, landedCost, costPerUnit, finalCostPerUnit };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const calculatedFields = calculateFields();
    const completeData = { ...formData, ...calculatedFields };

    if (selectedMaterial) {
      onUpdate(selectedMaterial.id, completeData);
      setSelectedMaterial(null);
    } else {
      onSubmit(completeData);
    }

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
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-2xl font-bold mb-6">
        {selectedMaterial ? "Edit Material" : "Add Material"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Material Type", name: "materialType", placeholder: "Enter the type of the material", type: "text" },
          { label: "Material Name", name: "materialName", placeholder: "Enter the name of the material", type: "text" },
          { label: "Rate (INR)", name: "rate", placeholder: "Enter the rate of the material", type: "number" },
          { label: "Quantity", name: "quantity", placeholder: "Enter the quantity", type: "number" },
          { label: "Size (L in cm)", name: "sizeL", placeholder: "Enter the length", type: "number" },
          { label: "Size (B in cm)", name: "sizeB", placeholder: "Enter the breadth", type: "number" },
          { label: "Courier Cost (INR)", name: "courier", placeholder: "Enter the cost of the courier", type: "number" },
          { label: "Mark Up", name: "markUp", placeholder: "Enter mark up value", type: "number" },
          { label: "Area (calculated)", name: "area", placeholder: "", type: "text", readOnly: true, value: calculateFields().area },
          { label: "Landed Cost (calculated)", name: "landedCost", placeholder: "", type: "text", readOnly: true, value: calculateFields().landedCost },
          { label: "Cost/Unit (calculated)", name: "costPerUnit", placeholder: "", type: "text", readOnly: true, value: calculateFields().costPerUnit },
          { label: "Final Cost/Unit (calculated)", name: "finalCostPerUnit", placeholder: "", type: "text", readOnly: true, value: calculateFields().finalCostPerUnit },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-xl font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={field.value || formData[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              readOnly={field.readOnly}
              className={`text-md mt-3 block w-full border-gray-300 rounded-sm shadow-sm ${
                field.readOnly ? "bg-gray-100" : ""
              }`}
              required={!field.readOnly}
            />
          </div>
        ))}
      </div>
      <button type="submit" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
        {selectedMaterial ? "Save Changes" : "Add Material"}
      </button>
    </form>
  );
};

export default AddMaterialForm;
