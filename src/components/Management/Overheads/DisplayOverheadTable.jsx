import React from "react";

const DisplayOverheadTable = ({ overheads, onDelete, onEdit }) => {
  // Sort overheads alphabetically by name
  const sortedOverheads = [...overheads].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Overhead Expenses</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Name", "Value (INR)", "Percentage (%)", "Actions"].map((header, idx) => (
                <th key={idx} className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedOverheads.map((overhead) => (
              <tr key={overhead.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{overhead.name || "-"}</td>
                <td className="px-4 py-2">{overhead.value || "-"}</td>
                <td className="px-4 py-2">{overhead.percentage || "-"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onEdit(overhead)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(overhead.id)}
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

export default DisplayOverheadTable;