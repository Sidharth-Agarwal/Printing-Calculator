import React, { useState } from "react";
import { TABLE_DISPLAY_FIELDS, DETAILED_DISPLAY_FIELDS } from "../../constants/entityFields";
import ClientDetailsModal from "./ClientDetailsModal";

const DisplayClientTable = ({ clients, onDelete, onEdit, onManageCredentials, onActivateClient, onToggleStatus, isAdmin }) => {
  // State for search term, filter, sorting, and view type
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClientType, setFilterClientType] = useState("");
  const [filterActiveStatus, setFilterActiveStatus] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewType, setViewType] = useState('compact');
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Toggle expanded state for a row
  const toggleRowExpand = (e, id) => {
    e.stopPropagation(); // Stop event from triggering row click
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Sort clients
  const sortedClients = [...clients].sort((a, b) => {
    // Handle nested fields (e.g., address.city)
    const getNestedValue = (obj, path) => {
      const keys = path.split('.');
      let value = obj;
      for (const key of keys) {
        if (value === undefined || value === null) return '';
        value = value[key];
      }
      return value || '';
    };

    const aValue = typeof sortField === 'string' && sortField.includes('.') 
      ? getNestedValue(a, sortField).toString().toLowerCase() 
      : (a[sortField] || "").toString().toLowerCase();
      
    const bValue = typeof sortField === 'string' && sortField.includes('.')
      ? getNestedValue(b, sortField).toString().toLowerCase()
      : (b[sortField] || "").toString().toLowerCase();
    
    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue, undefined, { numeric: true });
    } else {
      return bValue.localeCompare(aValue, undefined, { numeric: true });
    }
  });

  // Filter sorted clients based on search term, client type, and active status
  const filteredClients = sortedClients.filter((client) => {
    // Handle search
    const matchesSearch =
      searchTerm === "" ||
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Handle client type filter
    let matchesClientType = true;
    if (filterClientType !== "") {
      const normalizedClientType = (client.clientType || "DIRECT").toUpperCase();
      matchesClientType = normalizedClientType === filterClientType.toUpperCase();
    }
    
    // Handle active status filter
    let matchesActiveStatus = true;
    if (filterActiveStatus !== "") {
      const isActive = client.isActive === true;
      matchesActiveStatus = 
        (filterActiveStatus === "active" && isActive) || 
        (filterActiveStatus === "inactive" && !isActive);
    }

    return matchesSearch && matchesClientType && matchesActiveStatus;
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

  // Create a sortable table header
  const SortableHeader = ({ field, label, className = "" }) => (
    <th 
      className={`px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
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

  // Open client details modal
  const handleViewClient = (client) => {
    setSelectedClient(client);
  };

  // Close client details modal
  const handleCloseModal = () => {
    setSelectedClient(null);
  };

  // Toggle client active status
  const handleToggleStatus = (e, client) => {
    e.stopPropagation(); // Stop event from triggering row click
    onToggleStatus(client.id, !client.isActive);
  };

  // Get row style based on loyalty tier for B2B clients
  const getRowStyle = (client) => {
    // Check if client is B2B and has loyalty tier
    const isB2B = client.clientType?.toUpperCase() === "B2B";
    const hasLoyaltyTier = isB2B && client.loyaltyTierId && client.loyaltyTierColor;
    
    if (hasLoyaltyTier) {
      const tierColor = client.loyaltyTierColor;
      return {
        backgroundColor: `${tierColor}15`, // 15% opacity for background
        borderLeft: `4px solid ${tierColor}` // Solid left border with tier color
      };
    }
    
    return {}; // Default empty style
  };

  // Classes for loyalty tier rows
  const getRowClassName = (client) => {
    const isB2B = client.clientType?.toUpperCase() === "B2B";
    const hasLoyaltyTier = isB2B && client.loyaltyTierId;
    
    return `border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer 
            ${hasLoyaltyTier ? 'hover:bg-opacity-70' : ''}`;
  };

  // Render loyalty status for a client
  const renderLoyaltyStatus = (client) => {
    const isB2B = client.clientType?.toUpperCase() === "B2B";
    
    if (!isB2B) {
      return <span className="text-gray-400">Not Applicable</span>;
    }
    
    if (client.loyaltyTierId && client.loyaltyTierName) {
      return (
        <div className="flex items-center">
          <span 
            className="px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ backgroundColor: client.loyaltyTierColor || "#9f7aea" }}
          >
            {client.loyaltyTierName}
          </span>
        </div>
      );
    }
    
    return <span className="text-gray-500">Not enrolled</span>;
  };

  // Get field value from client object
  const getFieldValue = (client, fieldName) => {
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      return client[parent] && client[parent][child] ? client[parent][child] : '-';
    }
    return client[fieldName] || '-';
  };

  // Compact view - shows essential information
  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              {TABLE_DISPLAY_FIELDS.map(field => (
                <SortableHeader key={field.field} field={field.field} label={field.label} />
              ))}
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Loyalty Status</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <React.Fragment key={client.id}>
                <tr 
                  className={getRowClassName(client)}
                  style={getRowStyle(client)}
                  onClick={() => handleViewClient(client)}
                >
                  {TABLE_DISPLAY_FIELDS.map(field => (
                    <td key={field.field} className="px-3 py-3">
                      {field.field === 'name' ? (
                        <span className="font-medium">
                          {client.name}
                          {client.hasAccount && (
                            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              Account
                            </span>
                          )}
                        </span>
                      ) : field.field === 'clientType' ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          client.clientType?.toUpperCase() === "B2B"
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {(client.clientType || "Direct").toUpperCase()}
                        </span>
                      ) : (
                        getFieldValue(client, field.field)
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    {renderLoyaltyStatus(client)}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.isActive
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {client.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEdit(client)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={(e) => onDelete(client.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </button>
                      
                      {/* Toggle Status Button */}
                      <button
                        onClick={(e) => handleToggleStatus(e, client)}
                        className={`px-2 py-1 text-xs ${
                          client.isActive 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-green-100 text-green-800"
                        } rounded hover:bg-opacity-80 transition-colors flex items-center`}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        {client.isActive ? "Deactivate" : "Activate"}
                      </button>
                      
                      {/* Only show B2B account buttons for B2B clients and admins */}
                      {isAdmin && (client.clientType === "B2B" || client.clientType === "b2b" || client.clientType?.toUpperCase() === "B2B") && (
                        <>
                          {client.hasAccount ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onManageCredentials(client);
                              }}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors flex items-center"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                              </svg>
                              Credentials
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onActivateClient(client);
                              }}
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors flex items-center"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                              </svg>
                              Setup Account
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={(e) => toggleRowExpand(e, client.id)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors flex items-center"
                      >
                        <svg className={`w-3 h-3 mr-1 transition-transform ${expandedRows[client.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                        {expandedRows[client.id] ? 'Less' : 'More'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRows[client.id] && (
                  <tr className="bg-gray-50" onClick={() => handleViewClient(client)}>
                    <td colSpan={8} className="px-4 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Email:</p>
                          <p>{client.email || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Address:</p>
                          <p>{client.address?.city || "-"}, {client.address?.state || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Account Stats:</p>
                          <p>Orders: {client.totalOrders || 0}</p>
                          <p>Spend: {formatCurrency(client.totalSpend || 0)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Added On:</p>
                          <p>{formatDate(client.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No clients match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Detailed view - shows all columns
  const renderDetailedView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              {DETAILED_DISPLAY_FIELDS.map(field => (
                <SortableHeader key={field.field} field={field.field} label={field.label} />
              ))}
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Address</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Loyalty Status</th>
              <SortableHeader field="totalOrders" label="Orders" />
              <SortableHeader field="totalSpend" label="Total Spend" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr 
                key={client.id} 
                className={getRowClassName(client)}
                style={getRowStyle(client)}
                onClick={() => handleViewClient(client)}
              >
                {DETAILED_DISPLAY_FIELDS.map(field => (
                  <td key={field.field} className="px-3 py-3">
                    {field.field === 'name' ? (
                      <span className="font-medium">
                        {client.name}
                        {client.hasAccount && (
                          <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Account
                          </span>
                        )}
                      </span>
                    ) : field.field === 'clientType' ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.clientType?.toUpperCase() === "B2B"
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {(client.clientType || "Direct").toUpperCase()}
                      </span>
                    ) : (
                      getFieldValue(client, field.field)
                    )}
                  </td>
                ))}
                <td className="px-3 py-3">
                  {client.address?.city ? `${client.address.city}, ${client.address.state || ""}` : "-"}
                </td>
                <td className="px-3 py-3">
                  {renderLoyaltyStatus(client)}
                </td>
                <td className="px-3 py-3">{client.totalOrders || 0}</td>
                <td className="px-3 py-3 font-medium">{formatCurrency(client.totalSpend || 0)}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.isActive
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {client.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEdit(client)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(client.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
                    >
                      Delete
                    </button>
                    
                    {/* Toggle Status Button */}
                    <button
                      onClick={(e) => handleToggleStatus(e, client)}
                      className={`px-2 py-1 text-xs ${
                        client.isActive 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-green-100 text-green-800"
                      } rounded hover:bg-opacity-80 transition-colors flex items-center`}
                    >
                      {client.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No clients match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Mobile card view
  const renderMobileCardView = () => {
    return (
      <div className="space-y-4">
        {filteredClients.map((client) => (
          <div 
            key={client.id} 
            className="border border-gray-200 shadow-sm overflow-hidden bg-white cursor-pointer"
            onClick={() => handleViewClient(client)}
            style={getRowStyle(client)}
          >
            {/* Main client information always visible */}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{client.name}</h3>
                  <p className="text-sm text-gray-600">{client.clientCode} | {(client.clientType || "Direct").toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    client.isActive
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {client.isActive ? "Active" : "Inactive"}
                  </span>
                  {client.hasAccount && (
                    <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      Account
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Contact:</span> {client.contactPerson || "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Phone:</span> {client.phone || "N/A"}
                  </div>
                </div>
                
                {/* Show loyalty status in mobile view too */}
                {client.clientType?.toUpperCase() === "B2B" && (
                  <div className="mt-2">
                    <span className="text-gray-500 text-sm">Loyalty:</span>
                    <div className="mt-1">{renderLoyaltyStatus(client)}</div>
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={(e) => toggleRowExpand(e, client.id)}
                  className="text-xs text-gray-600 flex items-center"
                >
                  {expandedRows[client.id] ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      Show Details
                    </>
                  )}
                </button>
                
                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(client)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            </div>
            
            {/* Expandable detailed information */}
            {expandedRows[client.id] && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Email:</p>
                    <p>{client.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">GSTIN:</p>
                    <p>{client.gstin || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Address:</p>
                    <p>{client.address?.line1 ? `${client.address.line1}, ${client.address.city || ""}, ${client.address.state || ""}` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Activity:</p>
                    <p>Orders: {client.totalOrders || 0}</p>
                    <p>Spend: {formatCurrency(client.totalSpend || 0)}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleToggleStatus(e, client)}
                    className={`px-2 py-1 text-xs ${
                      client.isActive 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                    } rounded hover:bg-opacity-80 transition-colors flex items-center`}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {client.isActive ? "Deactivate Client" : "Activate Client"}
                  </button>
                  
                  <button
                    onClick={() => onDelete(client.id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete Client
                  </button>
                </div>
                
                {/* Account management buttons for B2B clients */}
                {isAdmin && (client.clientType === "B2B" || client.clientType === "b2b" || client.clientType?.toUpperCase() === "B2B") && (
                  <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center">
                      {client.hasAccount ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onManageCredentials(client);
                          }}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                          </svg>
                          Manage Account Credentials
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onActivateClient(client);
                          }}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                          </svg>
                          Setup B2B Account
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {filteredClients.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-gray-50 rounded">
            <p>No clients match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 py-4 border-b">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={filterClientType}
            onChange={(e) => setFilterClientType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Client Types</option>
            <option value="DIRECT">Direct Clients</option>
            <option value="B2B">B2B Clients</option>
          </select>
          
          <select
            value={filterActiveStatus}
            onChange={(e) => setFilterActiveStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Clients</option>
            <option value="inactive">Inactive Clients</option>
          </select>

          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button 
              onClick={() => setViewType('compact')}
              className={`px-3 py-2 text-sm flex items-center ${
                viewType === 'compact' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              Compact
            </button>
            <button 
              onClick={() => setViewType('detailed')}
              className={`px-3 py-2 text-sm flex items-center ${
                viewType === 'detailed' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Detailed
            </button>
          </div>
        </div>
      </div>
      
      {/* Client Count */}
      <div className="px-4 py-2 text-sm text-gray-600">
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Table Content */}
      {filteredClients.length > 0 ? (
        <div>
          {/* Responsive views based on screen size and selected view type */}
          <div className="hidden md:block">
            {viewType === 'detailed' ? renderDetailedView() : renderCompactView()}
          </div>
          
          {/* Mobile view */}
          <div className="md:hidden">
            {renderMobileCardView()}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          {searchTerm || filterClientType || filterActiveStatus ? (
            <>
              <p className="text-lg font-medium">No clients match your search</p>
              <p className="mt-1">Try using different filters or clear your search</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterClientType('');
                  setFilterActiveStatus('');
                }}
                className="mt-4 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear All Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No clients found</p>
              <p className="mt-1">Add your first client to get started</p>
            </>
          )}
        </div>
      )}
      
      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetailsModal 
          client={selectedClient} 
          onClose={handleCloseModal}
          onEdit={() => {
            handleCloseModal();
            onEdit(selectedClient);
          }}
          onToggleStatus={() => {
            handleToggleStatus(new Event('click'), selectedClient);
            handleCloseModal();
          }}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default DisplayClientTable;