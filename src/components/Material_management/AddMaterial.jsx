import React, { useState, useEffect } from "react";

const AddMaterial = ({ onSubmit, selectedMaterial, onUpdate, setSelectedMaterial }) => {
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
    const area = (formData.sizeL * formData.sizeB).toFixed(2);
    const landedCost = (parseFloat(formData.rate || 0) + parseFloat(formData.courier || 0)).toFixed(2);
    const costPerUnit = (
      parseFloat(landedCost || 0) / parseFloat(formData.quantity || 1)
    ).toFixed(2);
    const finalCostPerUnit = (
      parseFloat(costPerUnit || 0) + parseFloat(formData.markUp || 0)
    ).toFixed(2);

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
    <form onSubmit={handleSubmit} className="p-4 border rounded-md shadow-md mb-4">
      <h2 className="text-lg font-bold mb-4">{selectedMaterial ? "Edit Material" : "Add Material"}</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Material Type */}
        <input
          type="text"
          name="materialType"
          placeholder="Material Type"
          value={formData.materialType}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        />

        {/* Material Name */}
        <input
          type="text"
          name="materialName"
          placeholder="Material Name"
          value={formData.materialName}
          onChange={handleChange}
          className="border rounded-md p-2"
          required
        />

        {/* Rate */}
        <input
          type="number"
          name="rate"
          placeholder="Rate (INR)"
          value={formData.rate}
          onChange={handleChange}
          className="border rounded-md p-2"
        />

        {/* Quantity */}
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="border rounded-md p-2"
        />

        {/* Size L */}
        <input
          type="number"
          name="sizeL"
          placeholder="Size (L in cm)"
          value={formData.sizeL}
          onChange={handleChange}
          className="border rounded-md p-2"
        />

        {/* Size B */}
        <input
          type="number"
          name="sizeB"
          placeholder="Size (B in cm)"
          value={formData.sizeB}
          onChange={handleChange}
          className="border rounded-md p-2"
        />

        {/* Courier */}
        <input
          type="number"
          name="courier"
          placeholder="Courier Cost (INR)"
          value={formData.courier}
          onChange={handleChange}
          className="border rounded-md p-2"
        />

        {/* Mark Up */}
        <input
          type="number"
          name="markUp"
          placeholder="Mark Up"
          value={formData.markUp}
          onChange={handleChange}
          className="border rounded-md p-2"
        />

        {/* Area (Calculated) */}
        <input
          type="text"
          name="area"
          placeholder="Area (calculated)"
          value={calculateFields().area}
          readOnly
          className="border rounded-md p-2 bg-gray-100"
        />

        {/* Landed Cost (Calculated) */}
        <input
          type="text"
          name="landedCost"
          placeholder="Landed Cost (calculated)"
          value={calculateFields().landedCost}
          readOnly
          className="border rounded-md p-2 bg-gray-100"
        />

        {/* Cost/Unit (Calculated) */}
        <input
          type="text"
          name="costPerUnit"
          placeholder="Cost/Unit (calculated)"
          value={calculateFields().costPerUnit}
          readOnly
          className="border rounded-md p-2 bg-gray-100"
        />

        {/* Final Cost/Unit (Calculated) */}
        <input
          type="text"
          name="finalCostPerUnit"
          placeholder="Final Cost/Unit (calculated)"
          value={calculateFields().finalCostPerUnit}
          readOnly
          className="border rounded-md p-2 bg-gray-100"
        />
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        {selectedMaterial ? "Update Material" : "Add Material"}
      </button>
    </form>
  );
};

export default AddMaterial;
