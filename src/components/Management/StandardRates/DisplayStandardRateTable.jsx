import React from "react";

const DisplayStandardRateTable = ({ rates, onDelete, onEdit }) => {
  // Sort rates alphabetically by group
  const sortedRates = [...rates].sort((a, b) => 
    a.group.localeCompare(b.group) || 
    a.type.localeCompare(b.type)
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Standard Rates</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Group", "Type", "Concatenate", "Final Rate (INR)", "Actions"].map((header, idx) => (
                <th key={idx} className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRates.map((rate) => (
              <tr key={rate.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{rate.group}</td>
                <td className="px-4 py-2">{rate.type}</td>
                <td className="px-4 py-2">{rate.concatenate}</td>
                <td className="px-4 py-2">{rate.finalRate}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onEdit(rate)}
                    className="text-yellow-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(rate.id)}
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

export default DisplayStandardRateTable;