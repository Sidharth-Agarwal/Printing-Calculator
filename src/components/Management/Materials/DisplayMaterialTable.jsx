import React from "react";

const DisplayMaterialTable = ({ materials, onDelete, onEdit }) => {
  // Sort materials alphabetically by material type
  const sortedMaterials = [...materials].sort((a, b) => 
    (a.materialType || '').localeCompare(b.materialType || '')
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Available Materials</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Material Type",
                "Material Name",
                "Rate",
                "Quantity",
                "Size (L)",
                "Size (B)",
                "Courier Cost",
                "Mark Up",
                "Area",
                "Landed Cost",
                "Cost/Unit",
                "Final Cost/Unit",
                "Actions",
              ].map((header, idx) => (
                <th key={idx} className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.map((material) => (
              <tr key={material.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{material.materialType}</td>
                <td className="px-4 py-2">{material.materialName}</td>
                <td className="px-4 py-2">{material.rate}</td>
                <td className="px-4 py-2">{material.quantity}</td>
                <td className="px-4 py-2">{material.sizeL}</td>
                <td className="px-4 py-2">{material.sizeB}</td>
                <td className="px-4 py-2">{material.courier}</td>
                <td className="px-4 py-2">{material.markUp}</td>
                <td className="px-4 py-2">{material.area}</td>
                <td className="px-4 py-2">{material.landedCost}</td>
                <td className="px-4 py-2">{material.costPerUnit}</td>
                <td className="px-4 py-2">{material.finalCostPerUnit}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(material)}
                      className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(material.id)}
                      className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplayMaterialTable;