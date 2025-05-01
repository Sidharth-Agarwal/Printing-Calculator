import React, { useState } from "react";

const DisplayDieTable = ({ dies, onEditDie, onDeleteDie }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("jobType");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isDeleting, setIsDeleting] = useState(null);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter dies based on search term
  const filteredDies = dies.filter((die) => {
    const searchFields = [
      die.jobType || "",
      die.type || "",
      die.dieCode || "",
    ];
    
    return searchFields.some(field => 
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort dies based on sort field and direction
  const sortedDies = [...filteredDies].sort((a, b) => {
    const aValue = (a[sortField] || "").toString().toLowerCase();
    const bValue = (b[sortField] || "").toString().toLowerCase();
    
    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Create a sortable table header
  const SortableHeader = ({ field, label }) => (
    <th 
      className="px-4 py-2 border font-medium text-gray-700 text-left cursor-pointer hover:bg-gray-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortField === field && (
          <span className="ml-1">
            {sortDirection === "asc" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Available Dies</h2>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search by job type, type, or die code..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
      
      {sortedDies.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {searchTerm ? "No dies match your search criteria." : "No dies available."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-sm w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="jobType" label="Job Type" />
                <SortableHeader field="type" label="Type" />
                <SortableHeader field="dieCode" label="Die Code" />
                <SortableHeader field="frags" label="Frags" />
                <SortableHeader field="productSizeL" label="Product L" />
                <SortableHeader field="productSizeB" label="Product B" />
                <SortableHeader field="dieSizeL" label="Die L" />
                <SortableHeader field="dieSizeB" label="Die B" />
                <th className="px-4 py-2 border font-medium text-gray-700 text-left">Image</th>
                <th className="px-4 py-2 border font-medium text-gray-700 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedDies.map((die) => (
                <tr key={die.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{die.jobType || "-"}</td>
                  <td className="px-4 py-2">{die.type || "-"}</td>
                  <td className="px-4 py-2 font-medium">{die.dieCode || "-"}</td>
                  <td className="px-4 py-2">{die.frags || "-"}</td>
                  <td className="px-4 py-2">{die.productSizeL || "-"}</td>
                  <td className="px-4 py-2">{die.productSizeB || "-"}</td>
                  <td className="px-4 py-2">{die.dieSizeL || "-"}</td>
                  <td className="px-4 py-2">{die.dieSizeB || "-"}</td>
                  <td className="px-4 py-2">
                    {die.imageUrl ? (
                      <img 
                        src={die.imageUrl} 
                        alt="Die" 
                        className="w-12 h-12 object-cover rounded border hover:w-24 hover:h-24 transition-all cursor-pointer"
                        onClick={() => window.open(die.imageUrl, '_blank')}
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditDie(die)}
                        className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteDie(die.id)}
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
      )}
      
      <div className="mt-4 text-gray-500 text-sm">
        {sortedDies.length} dies found
      </div>
    </div>
  );
};

export default DisplayDieTable;