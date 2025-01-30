import React from "react";

const DisplayMaterialTable = ({ materials, onDelete, onEdit }) => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-bold mb-6">AVAILABLE MATERIALS</h2>
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
            {materials.map((material) => (
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
                  <button
                    onClick={() => onEdit(material)}
                    className="text-yellow-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(material.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
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
