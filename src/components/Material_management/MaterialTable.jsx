import React from "react";

const MaterialsTable = ({ materials, onDelete, onEdit }) => {
  return (
    <div className="border rounded-md shadow-md">
      <h2 className="text-lg font-bold p-4">Available Materials</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Material Type</th>
            <th className="border p-2">Material Name</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Area</th>
            <th className="border p-2">Landed Cost</th>
            <th className="border p-2">Final Cost/Unit</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material.id}>
              <td className="border p-2">{material.materialType}</td>
              <td className="border p-2">{material.materialName}</td>
              <td className="border p-2">{material.rate}</td>
              <td className="border p-2">{material.quantity}</td>
              <td className="border p-2">{material.area}</td>
              <td className="border p-2">{material.landedCost}</td>
              <td className="border p-2">{material.finalCostPerUnit}</td>
              <td className="border p-2">
                <button
                  onClick={() => onEdit(material)}
                  className="mr-2 bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(material.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialsTable;
