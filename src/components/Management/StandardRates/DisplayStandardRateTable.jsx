import React from "react";

const DisplayStandardRateTable = ({ rates, onDelete, onEdit }) => {
  // Sort rates alphabetically by group
  const sortedRates = [...rates].sort((a, b) => 
    a.group.localeCompare(b.group) || 
    a.type.localeCompare(b.type)
  );

  // Check if edit functionality is enabled
  const hasEditAccess = typeof onEdit === "function" && typeof onDelete === "function";

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Standard Rates</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Group", "Type", "Concatenate", "Final Rate (INR)", "Percentage (%)"]
                // Only include Actions column if user has edit access
                .concat(hasEditAccess ? ["Actions"] : [])
                .map((header, idx) => (
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
                <td className="px-4 py-2">{rate.finalRate || "-"}</td>
                <td className="px-4 py-2">{rate.percentage || "-"}</td>
                
                {/* Only render Actions cell if user has edit access */}
                {hasEditAccess && (
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(rate)}
                        className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(rate.id)}
                        className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplayStandardRateTable;