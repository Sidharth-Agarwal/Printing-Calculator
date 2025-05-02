import React, { useState } from "react";

const DisplayClientTable = ({ clients, onDelete, onEdit, onManageCredentials, onActivateClient, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClientType, setFilterClientType] = useState("");

  // Sort clients alphabetically by name
  const sortedClients = [...clients].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );

  // Filter sorted clients based on search term and client type filter
  const filteredClients = sortedClients.filter((client) => {
    const matchesSearch =
      searchTerm === "" ||
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    // Handle the filtering for client type
    let matchesClientType = false;
    if (filterClientType === "") {
      // If no filter is selected, show all clients
      matchesClientType = true;
    } else {
      // Normalize the client type and filter value for case-insensitive comparison
      const normalizedClientType = (client.clientType || "DIRECT").toUpperCase();
      const normalizedFilterType = filterClientType.toUpperCase();
      matchesClientType = normalizedClientType === normalizedFilterType;
    }

    return matchesSearch && matchesClientType;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  // Enhanced helper function for tier color styling with better hover handling
  const getTierStyles = (client) => {
    const isB2B = client.clientType && (client.clientType.toUpperCase() === "B2B");
    const isEnrolled = isB2B && client.loyaltyTierId;
    const tierColor = isEnrolled ? client.loyaltyTierColor || "#9f7aea" : "";
    
    if (!isEnrolled) return {}; // No styling for non-enrolled clients
    
    return {
      backgroundColor: `${tierColor}15`, // 15% opacity for background
      borderLeft: `4px solid ${tierColor}`, // Solid left border with tier color
    };
  };

  // Get appropriate row class based on enrollment status
  const getRowClassName = (client) => {
    const isB2B = client.clientType && (client.clientType.toUpperCase() === "B2B");
    const isEnrolled = isB2B && client.loyaltyTierId;
    
    return `border-t ${isEnrolled ? "hover:bg-opacity-70" : "hover:bg-gray-50"}`;
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Clients</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, code, or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-sm"
          />
        </div>
        <div>
          <select
            value={filterClientType}
            onChange={(e) => setFilterClientType(e.target.value)}
            className="w-full px-4 py-2 border rounded-sm"
          >
            <option value="">All Client Types</option>
            <option value="DIRECT">Direct Client</option>
            <option value="B2B">B2B</option>
          </select>
        </div>
      </div>

      {/* Client Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredClients.length} of {clients.length} clients
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Client Code</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Name</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Client Type</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Contact Person</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Phone</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Loyalty Status</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                // Determine if client is enrolled in loyalty program
                const isB2B = client.clientType && (client.clientType.toUpperCase() === "B2B");
                const isEnrolled = isB2B && client.loyaltyTierId;
                const tierColor = isEnrolled ? client.loyaltyTierColor || "#9f7aea" : "";
                
                return (
                  <tr 
                    key={client.id} 
                    className={getRowClassName(client)}
                    style={getTierStyles(client)}
                  >
                    <td className="px-4 py-2">{client.clientCode}</td>
                    <td className="px-4 py-2 font-medium">
                      {client.name}
                      {client.hasAccount && (
                        <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Account
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        client.clientType?.toUpperCase() === "B2B"
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {(client.clientType || "Direct").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2">{client.contactPerson}</td>
                    <td className="px-4 py-2">{client.phone}</td>
                    {/* Enhanced Loyalty Status Display with client's tier color */}
                    <td className="px-4 py-2">
                      {isB2B ? (
                        client.loyaltyTierName ? (
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: tierColor }}
                            ></div>
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ 
                                backgroundColor: tierColor,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)" 
                              }}
                            >
                              {client.loyaltyTierName}
                            </span>
                            {client.loyaltyTierDiscount && (
                              <span className="ml-2 text-xs text-green-600 font-medium">
                                {client.loyaltyTierDiscount}% off
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Not enrolled</span>
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(client)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => onDelete(client.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>

                        {/* Only show the Credentials and Activate buttons for B2B clients */}
                        {isAdmin && (client.clientType === "B2B" || client.clientType === "b2b") && (
                          <>
                            <span className="text-gray-300">|</span>
                            {client.hasAccount ? (
                              <button
                                onClick={() => onManageCredentials(client)}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                Credentials
                              </button>
                            ) : (
                              <button
                                onClick={() => onActivateClient(client)}
                                className="text-green-600 hover:text-green-800"
                              >
                                Activate
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No clients found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplayClientTable;