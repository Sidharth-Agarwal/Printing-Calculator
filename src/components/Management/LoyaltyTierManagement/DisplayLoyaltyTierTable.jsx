import React, { useState } from "react";

const DisplayLoyaltyTierTable = ({ tiers, onDelete, onEdit }) => {
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for sort field and direction
  const [sortField, setSortField] = useState('amountThreshold');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Check which actions are available
  const canEdit = typeof onEdit === "function";
  const canDelete = typeof onDelete === "function";
  const hasActions = canEdit || canDelete;

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

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "₹0";
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter tiers based on search term
  const filteredTiers = tiers.filter(tier => {
    if (!searchTerm.trim()) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    const searchFields = [
      tier.name || "",
      tier.id || "",
      tier.amountThreshold?.toString() || "",
      tier.discount?.toString() || "",
      tier.color || "",
      tier.description || "",
      formatCurrency(tier.amountThreshold || 0),
      ...(tier.benefits || [])
    ];
    
    return searchFields.some(field => 
      field.toLowerCase().includes(lowerSearchTerm)
    );
  });

  // Sort tiers based on sort field and direction
  const sortedTiers = [...filteredTiers].sort((a, b) => {
    let aValue, bValue;
    
    if (sortField === "amountThreshold" || sortField === "discount") {
      aValue = parseFloat(a[sortField]) || 0;
      bValue = parseFloat(b[sortField]) || 0;
    } else {
      aValue = (a[sortField] || "").toString().toLowerCase();
      bValue = (b[sortField] || "").toString().toLowerCase();
    }
    
    if (sortDirection === "asc") {
      return typeof aValue === 'number' ? aValue - bValue : aValue.localeCompare(bValue, undefined, { numeric: true });
    } else {
      return typeof aValue === 'number' ? bValue - aValue : bValue.localeCompare(aValue, undefined, { numeric: true });
    }
  });

  // Create a sortable table header
  const SortableHeader = ({ field, label, className = "" }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-50 ${className}`}
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

  // Function to render color cell
  const renderColorCell = (color) => (
    <div className="flex items-center">
      <div
        className="w-5 h-5 mr-2 rounded"
        style={{ backgroundColor: color || "#CCCCCC" }}
      ></div>
      <span className="text-xs">{color || "-"}</span>
    </div>
  );

  // Function to render tier info
  const renderTierInfo = (tier) => (
    <div className="flex items-center">
      <div
        className="w-6 h-6 mr-2 rounded-full"
        style={{ backgroundColor: tier.color || "#CCCCCC" }}
      ></div>
      <div>
        <div className="font-medium">{tier.name}</div>
        <div className="text-xs text-gray-500">{tier.id}</div>
      </div>
    </div>
  );

  // Function to render amount threshold with currency formatting
  const renderAmountThreshold = (threshold) => {
    const formattedAmount = formatCurrency(threshold);
    return (
      <div>
        <div className="font-medium text-blue-600">{formattedAmount}</div>
        <div className="text-xs text-gray-500">Total orders</div>
      </div>
    );
  };

  // Function to render discount as percentage
  const renderDiscount = (discount) => (
    <span className="font-medium text-green-600">{discount}% Off</span>
  );

  // Function to render benefits list
  const renderBenefits = (benefits) => (
    <ul className="list-disc pl-4">
      {benefits && benefits.length > 0 ? (
        benefits.map((benefit, index) => (
          <li key={index}>{benefit}</li>
        ))
      ) : (
        <li>No additional benefits</li>
      )}
    </ul>
  );

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Search and count indicator */}
      <div className="pb-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search loyalty tiers..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {sortedTiers.length} {sortedTiers.length === 1 ? 'tier' : 'tiers'} found
        </div>
      </div>

      {sortedTiers.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          {searchTerm ? (
            <>
              <p className="text-lg font-medium">No loyalty tiers match your search</p>
              <p className="mt-1">Try using different keywords or clear your search</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 text-sm bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No loyalty tiers defined</p>
              <p className="mt-1">Add your first tier to get started</p>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="name" label="Tier" />
                <SortableHeader field="amountThreshold" label="Amount Threshold" />
                <SortableHeader field="discount" label="Discount" />
                <SortableHeader field="color" label="Color" />
                <SortableHeader field="description" label="Description" />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Benefits
                </th>
                {hasActions && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTiers.map((tier, index) => (
                <tr key={tier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderTierInfo(tier)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderAmountThreshold(tier.amountThreshold)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderDiscount(tier.discount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {renderColorCell(tier.color)}
                  </td>
                  <td className="px-4 py-3">
                    {tier.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {renderBenefits(tier.benefits)}
                  </td>
                  {hasActions && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => onEdit(tier)}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(tier.id)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisplayLoyaltyTierTable;