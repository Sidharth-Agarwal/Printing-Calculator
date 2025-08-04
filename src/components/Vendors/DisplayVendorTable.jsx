import React, { useState } from "react";
import VendorDetailsModal from "./VendorDetailsModal";
import VendorDuplicateIndicator from "./VendorDuplicateIndicator";

const DisplayVendorTable = ({ vendors, onDelete, onEdit, onToggleStatus, hasFullAccess }) => {
  // State for search term, filter, sorting, and view type
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActiveStatus, setFilterActiveStatus] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewType, setViewType] = useState('compact');
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  
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
    e.stopPropagation();
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Sort vendors
  const sortedVendors = [...vendors].sort((a, b) => {
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

  // Filter sorted vendors based on search term and active status
  const filteredVendors = sortedVendors.filter((vendor) => {
    const matchesSearch =
      searchTerm === "" ||
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendorCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.gstin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesActiveStatus = true;
    if (filterActiveStatus !== "") {
      const isActive = vendor.isActive === true;
      matchesActiveStatus = 
        (filterActiveStatus === "active" && isActive) || 
        (filterActiveStatus === "inactive" && !isActive);
    }

    return matchesSearch && matchesActiveStatus;
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

  // Open vendor details modal
  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
  };

  // Close vendor details modal
  const handleCloseModal = () => {
    setSelectedVendor(null);
  };

  // Toggle vendor active status
  const handleToggleStatus = (e, vendor) => {
    e.stopPropagation();
    if (onToggleStatus) {
      onToggleStatus(vendor.id, !vendor.isActive);
    }
  };

  // Get field value from vendor object with duplicate indicators
  const getFieldValue = (vendor, fieldName) => {
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      return vendor[parent] && vendor[parent][child] ? vendor[parent][child] : '-';
    }
    
    const value = vendor[fieldName] || '-';
    
    // Add duplicate indicators for email, phone, gstin, and account fields
    if (fieldName === 'email' && vendor.email) {
      return (
        <div className="flex items-center">
          <span>{value}</span>
          <VendorDuplicateIndicator 
            type="email" 
            value={vendor.email} 
            currentVendorId={vendor.id}
          />
        </div>
      );
    }
    
    if (fieldName === 'phone' && vendor.phone) {
      return (
        <div className="flex items-center">
          <span>{value}</span>
          <VendorDuplicateIndicator 
            type="phone" 
            value={vendor.phone} 
            currentVendorId={vendor.id}
          />
        </div>
      );
    }
    
    if (fieldName === 'gstin' && vendor.gstin) {
      return (
        <div className="flex items-center">
          <span>{value}</span>
          <VendorDuplicateIndicator 
            type="gstin" 
            value={vendor.gstin} 
            currentVendorId={vendor.id}
          />
        </div>
      );
    }
    
    return value;
  };

  // Renders the action buttons with permissions
  const renderActionButtons = (vendor) => (
    <div className="flex items-center space-x-1">
      {/* Edit Button - only for users with full access */}
      {hasFullAccess && onEdit && (
        <button
          onClick={() => onEdit(vendor)}
          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
          title="Edit Vendor"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
        </button>
      )}
      
      {/* Delete Button - only for users with full access */}
      {hasFullAccess && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(vendor.id);
          }}
          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
          title="Delete Vendor"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      )}
      
      {/* Toggle Status Button - only for users with full access */}
      {hasFullAccess && onToggleStatus && (
        <button
          onClick={(e) => handleToggleStatus(e, vendor)}
          className={`p-1.5 rounded transition-colors ${
            vendor.isActive 
              ? "text-yellow-600 hover:bg-yellow-100" 
              : "text-green-600 hover:bg-green-100"
          }`}
          title={vendor.isActive ? "Deactivate Vendor" : "Activate Vendor"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      )}
      
      {/* More/Expand Button - always available */}
      <button
        onClick={(e) => toggleRowExpand(e, vendor.id)}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title={expandedRows[vendor.id] ? "Show Less" : "Show More"}
      >
        <svg className={`w-4 h-4 transition-transform ${expandedRows[vendor.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>
  );

  // Compact view - shows essential information
  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="vendorCode" label="Vendor Code" />
              <SortableHeader field="name" label="Name" />
              <SortableHeader field="email" label="Email" />
              <SortableHeader field="phone" label="Phone" />
              <SortableHeader field="gstin" label="GSTIN" />
              <SortableHeader field="paymentTerms.creditDays" label="Credit Days" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
              {/* Only show actions column if user has permissions or if expand is needed */}
              {(hasFullAccess || true) && (
                <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 w-32">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <React.Fragment key={vendor.id}>
                <tr 
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewVendor(vendor)}
                >
                  <td className="px-3 py-3">{vendor.vendorCode}</td>
                  <td className="px-3 py-3 font-medium">{vendor.name}</td>
                  <td className="px-3 py-3">{getFieldValue(vendor, 'email')}</td>
                  <td className="px-3 py-3">{getFieldValue(vendor, 'phone')}</td>
                  <td className="px-3 py-3">{getFieldValue(vendor, 'gstin')}</td>
                  <td className="px-3 py-3">{vendor.paymentTerms?.creditDays || 0} days</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vendor.isActive
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {vendor.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    {renderActionButtons(vendor)}
                  </td>
                </tr>
                {expandedRows[vendor.id] && (
                  <tr className="bg-gray-50" onClick={() => handleViewVendor(vendor)}>
                    <td colSpan={8} className="px-4 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Bank:</p>
                          <p>{vendor.accountDetails?.bankName || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Address:</p>
                          <p>{vendor.address?.city || "-"}, {vendor.address?.state || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Account Details:</p>
                          <p>Account: {vendor.accountDetails?.accountNumber || "-"}</p>
                          <p>IFSC: {vendor.accountDetails?.ifscCode || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Added On:</p>
                          <p>{formatDate(vendor.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filteredVendors.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No vendors match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Detailed view - shows all columns with duplicate indicators
  const renderDetailedView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="vendorCode" label="Vendor Code" />
              <SortableHeader field="name" label="Name" />
              <SortableHeader field="email" label="Email" />
              <SortableHeader field="phone" label="Phone" />
              <SortableHeader field="gstin" label="GSTIN" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Address</th>
              <SortableHeader field="accountDetails.bankName" label="Bank" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Account</th>
              <SortableHeader field="paymentTerms.creditDays" label="Credit Days" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
              {/* Only show actions column if user has permissions or if expand is needed */}
              {(hasFullAccess || true) && (
                <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 w-32">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr 
                key={vendor.id} 
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewVendor(vendor)}
              >
                <td className="px-3 py-3">{vendor.vendorCode}</td>
                <td className="px-3 py-3 font-medium">{vendor.name}</td>
                <td className="px-3 py-3">{getFieldValue(vendor, 'email')}</td>
                <td className="px-3 py-3">{getFieldValue(vendor, 'phone')}</td>
                <td className="px-3 py-3">{getFieldValue(vendor, 'gstin')}</td>
                <td className="px-3 py-3">
                  {vendor.address?.city ? `${vendor.address.city}, ${vendor.address.state || ""}` : "-"}
                </td>
                <td className="px-3 py-3">{vendor.accountDetails?.bankName || "-"}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center">
                    <span>{vendor.accountDetails?.accountNumber || "-"}</span>
                    {vendor.accountDetails?.accountNumber && (
                      <VendorDuplicateIndicator 
                        type="account" 
                        value={vendor.accountDetails.accountNumber} 
                        currentVendorId={vendor.id}
                      />
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">{vendor.paymentTerms?.creditDays || 0} days</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vendor.isActive
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {vendor.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  {renderActionButtons(vendor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredVendors.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No vendors match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Mobile card view with duplicate indicators
  const renderMobileCardView = () => {
    return (
      <div className="space-y-4">
        {filteredVendors.map((vendor) => (
          <div 
            key={vendor.id} 
            className="border border-gray-200 shadow-sm overflow-hidden bg-white cursor-pointer"
            onClick={() => handleViewVendor(vendor)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">{vendor.vendorCode}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    vendor.isActive
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {vendor.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">Email:</span>
                    <div className="flex items-center">
                      <span className="ml-1">{vendor.email || "N/A"}</span>
                      {vendor.email && (
                        <VendorDuplicateIndicator 
                          type="email" 
                          value={vendor.email} 
                          currentVendorId={vendor.id}
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Phone:</span>
                    <div className="flex items-center">
                      <span className="ml-1">{vendor.phone || "N/A"}</span>
                      {vendor.phone && (
                        <VendorDuplicateIndicator 
                          type="phone" 
                          value={vendor.phone} 
                          currentVendorId={vendor.id}
                        />
                      )}
                    </div>
                  </div>
                  {vendor.gstin && (
                    <div className="text-sm">
                      <span className="text-gray-500">GSTIN:</span>
                      <div className="flex items-center">
                        <span className="ml-1">{vendor.gstin}</span>
                        <VendorDuplicateIndicator 
                          type="gstin" 
                          value={vendor.gstin} 
                          currentVendorId={vendor.id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <button
                  onClick={(e) => toggleRowExpand(e, vendor.id)}
                  className="text-xs text-gray-600 flex items-center"
                >
                  {expandedRows[vendor.id] ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      Show Details
                    </>
                  )}
                </button>
                
                {/* Only show edit button for users with full access */}
                {hasFullAccess && (
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit && onEdit(vendor)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {expandedRows[vendor.id] && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Credit Period:</p>
                    <p>{vendor.paymentTerms?.creditDays || 0} days</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Address:</p>
                    <p>{vendor.address?.line1 ? `${vendor.address.line1}, ${vendor.address.city || ""}, ${vendor.address.state || ""}` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Bank:</p>
                    <p>{vendor.accountDetails?.bankName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Account:</p>
                    <div className="flex items-center">
                      <span>{vendor.accountDetails?.accountNumber || "N/A"}</span>
                      {vendor.accountDetails?.accountNumber && (
                        <VendorDuplicateIndicator 
                          type="account" 
                          value={vendor.accountDetails.accountNumber} 
                          currentVendorId={vendor.id}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Only show action buttons for users with full access */}
                {hasFullAccess && (
                  <div className="mt-3 flex justify-between" onClick={(e) => e.stopPropagation()}>
                    {onToggleStatus && (
                      <button
                        onClick={(e) => handleToggleStatus(e, vendor)}
                        className={`px-2 py-1 text-xs ${
                          vendor.isActive 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-green-100 text-green-800"
                        } rounded hover:bg-opacity-80 transition-colors flex items-center`}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        {vendor.isActive ? "Deactivate Vendor" : "Activate Vendor"}
                      </button>
                    )}
                    
                    {onDelete && (
                      <button
                        onClick={() => onDelete(vendor.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete Vendor
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {filteredVendors.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-gray-50 rounded">
            <p>No vendors match your search criteria.</p>
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
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2"
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={filterActiveStatus}
            onChange={(e) => setFilterActiveStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Vendors</option>
            <option value="inactive">Inactive Vendors</option>
          </select>

          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button 
              onClick={() => setViewType('compact')}
              className={`px-3 py-2 text-sm flex items-center ${
                viewType === 'compact' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              Compact
            </button>
            <button 
              onClick={() => setViewType('detailed')}
              className={`px-3 py-2 text-sm flex items-center ${
                viewType === 'detailed' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Detailed
            </button>
          </div>
        </div>
      </div>
      
      {/* Vendor Count */}
      <div className="px-4 py-2 text-sm text-gray-600">
        Showing {filteredVendors.length} of {vendors.length} vendors
      </div>

      {/* Table Content */}
      {filteredVendors.length > 0 ? (
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          {searchTerm || filterActiveStatus ? (
            <>
              <p className="text-lg font-medium">No vendors match your search</p>
              <p className="mt-1">Try using different filters or clear your search</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterActiveStatus('');
                }}
                className="mt-4 px-4 py-2 text-sm bg-cyan-500 text-white rounded-md hover:bg-cyan-600"
              >
                Clear All Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No vendors found</p>
              <p className="mt-1">Add your first vendor to get started</p>
            </>
          )}
        </div>
      )}
      
      {/* Vendor Details Modal */}
      {selectedVendor && (
        <VendorDetailsModal 
          vendor={selectedVendor} 
          onClose={handleCloseModal}
          onEdit={hasFullAccess && onEdit ? () => {
            handleCloseModal();
            onEdit(selectedVendor);
          } : null}
          onToggleStatus={hasFullAccess && onToggleStatus ? () => {
            handleToggleStatus(new Event('click'), selectedVendor);
            handleCloseModal();
          } : null}
          hasFullAccess={hasFullAccess}
        />
      )}
    </div>
  );
};

export default DisplayVendorTable;