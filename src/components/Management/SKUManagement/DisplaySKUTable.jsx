import React, { useState } from "react";
import { getStockStatus, getStockStatusInfo } from "../../../constants/materialConstants";
import { getPaperStockStatus, getPaperStockStatusInfo } from "../../../constants/paperContants";

const DisplaySKUTable = ({ skus, vendors, transactions, onSkuSelect, isAdmin }) => {
  // State for search, filter, and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [sortField, setSortField] = useState('itemName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewType, setViewType] = useState('compact');
  const [expandedRows, setExpandedRows] = useState({});

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
  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get stock status for any SKU type
  const getSkuStockStatus = (sku) => {
    const currentStock = parseFloat(sku.currentStock) || 0;
    const minStock = parseFloat(sku.minStockLevel) || 0;
    const maxStock = parseFloat(sku.maxStockLevel) || 999999;
    
    if (sku.type === 'Material') {
      return getStockStatus(currentStock, minStock, maxStock);
    } else {
      return getPaperStockStatus(currentStock, minStock, maxStock);
    }
  };

  // Get stock status info for any SKU type
  const getSkuStockStatusInfo = (sku) => {
    const status = getSkuStockStatus(sku);
    
    if (sku.type === 'Material') {
      return getStockStatusInfo(status);
    } else {
      return getPaperStockStatusInfo(status);
    }
  };

  // Get last transaction for SKU
  const getLastTransaction = (skuCode) => {
    const skuTransactions = transactions.filter(t => t.skuCode === skuCode);
    return skuTransactions.length > 0 ? skuTransactions[0] : null;
  };

  // Get vendor info for SKU
  const getVendorInfo = (companyName) => {
    return vendors.find(vendor => vendor.name === companyName) || null;
  };

  // Filter SKUs based on all criteria
  const filteredSkus = skus.filter(sku => {
    // Search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      const searchFields = [
        sku.skuCode || "",
        sku.itemName || "",
        sku.company || "",
        sku.materialType || "",
        sku.paperName || "",
        sku.materialName || ""
      ];
      
      const matchesSearch = searchFields.some(field => 
        field.toLowerCase().includes(lowerSearchTerm)
      );
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (typeFilter !== 'all' && sku.type !== typeFilter) {
      return false;
    }

    // Vendor filter
    if (vendorFilter !== 'all' && sku.company !== vendorFilter) {
      return false;
    }

    // Stock filter
    if (stockFilter !== 'all') {
      const status = getSkuStockStatus(sku);
      if (stockFilter !== status) return false;
    }

    return true;
  });

  // Sort filtered SKUs
  const sortedSkus = [...filteredSkus].sort((a, b) => {
    let aValue, bValue;

    // Handle special sorting cases
    if (sortField === 'currentStock' || sortField === 'minStockLevel' || sortField === 'stockValue') {
      if (sortField === 'stockValue') {
        const aStock = parseFloat(a.currentStock) || 0;
        const aCost = parseFloat(a.finalCostPerUnit || a.finalRate) || 0;
        const bStock = parseFloat(b.currentStock) || 0;
        const bCost = parseFloat(b.finalCostPerUnit || b.finalRate) || 0;
        aValue = aStock * aCost;
        bValue = bStock * bCost;
      } else {
        aValue = parseFloat(a[sortField]) || 0;
        bValue = parseFloat(b[sortField]) || 0;
      }
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

  // Get unique vendors for filter
  const uniqueVendors = [...new Set(skus.map(sku => sku.company).filter(Boolean))].sort();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
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

  // Render stock badge
  const renderStockBadge = (sku) => {
    const statusInfo = getSkuStockStatusInfo(sku);
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.icon} {statusInfo.label}
      </span>
    );
  };

  // Calculate stock value
  const calculateStockValue = (sku) => {
    const stock = parseFloat(sku.currentStock) || 0;
    const cost = parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0;
    return stock * cost;
  };

  // Compact view
  const renderCompactView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="skuCode" label="SKU Code" />
              <SortableHeader field="type" label="Type" />
              <SortableHeader field="itemName" label="Item Name" />
              <SortableHeader field="company" label="Vendor" />
              <SortableHeader field="currentStock" label="Current Stock" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Stock Status</th>
              <SortableHeader field="stockValue" label="Stock Value" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Last Activity</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSkus.map((sku) => {
              const lastTransaction = getLastTransaction(sku.skuCode);
              const stockValue = calculateStockValue(sku);
              const vendorInfo = getVendorInfo(sku.company);
              
              return (
                <React.Fragment key={sku.id}>
                  <tr 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onSkuSelect(sku)}
                  >
                    <td className="px-3 py-3 font-mono text-xs">{sku.skuCode || "-"}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sku.type === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {sku.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">{sku.itemName || "-"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center">
                        <span>{sku.company || "-"}</span>
                        {vendorInfo && (
                          <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                            vendorInfo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {vendorInfo.isActive ? '●' : '○'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {sku.currentStock || 0} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                        </span>
                        {sku.minStockLevel && (
                          <span className="text-xs text-gray-500">
                            Min: {sku.minStockLevel} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">{renderStockBadge(sku)}</td>
                    <td className="px-3 py-3 font-medium text-green-600">
                      {formatCurrency(stockValue)}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {lastTransaction ? (
                        <div>
                          <div>{formatDate(lastTransaction.date)}</div>
                          <div className={`text-xs ${
                            lastTransaction.type === 'IN' ? 'text-green-600' : 
                            lastTransaction.type === 'OUT' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {lastTransaction.type} {lastTransaction.quantity}
                          </div>
                        </div>
                      ) : "No activity"}
                    </td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onSkuSelect(sku)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => toggleRowExpand(sku.id)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          {expandedRows[sku.id] ? '▲' : '▼'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows[sku.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan={9} className="px-4 py-3 border-b border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Specifications:</p>
                            {sku.type === 'Material' ? (
                              <>
                                <p>Type: {sku.materialType || "-"}</p>
                                <p>Size: {sku.sizeL || "-"}×{sku.sizeB || "-"} cm</p>
                                <p>Area: {sku.area || "-"} sqcm</p>
                              </>
                            ) : (
                              <>
                                <p>GSM: {sku.gsm || "-"}</p>
                                <p>Size: {sku.length || "-"}×{sku.breadth || "-"} cm</p>
                                <p>Area: {sku.area || "-"} sqcm per sheet</p>
                              </>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Stock Details:</p>
                            <p>Location: {sku.stockLocation || "-"}</p>
                            <p>Max Stock: {sku.maxStockLevel || "-"}</p>
                            <p>Unit: {sku.unitOfMeasure || (sku.type === 'Material' ? 'sqcm' : 'sheets')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Pricing:</p>
                            <p>Unit Cost: {formatCurrency(sku.finalCostPerUnit || sku.finalRate || 0)}</p>
                            <p>Total Value: {formatCurrency(stockValue)}</p>
                            {vendorInfo && (
                              <p>Credit: {vendorInfo.paymentTerms?.creditDays || 0} days</p>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Activity:</p>
                            <p>Total Purchased: {sku.totalPurchased || 0}</p>
                            <p>Total Used: {sku.totalUsed || 0}</p>
                            <p>Created: {formatDate(sku.createdAt)}</p>
                            {lastTransaction && (
                              <p>Last: {lastTransaction.reference || "Manual update"}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {sortedSkus.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No SKUs match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Detailed view
  const renderDetailedView = () => {
    return (
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100">
              <SortableHeader field="skuCode" label="SKU Code" />
              <SortableHeader field="type" label="Type" />
              <SortableHeader field="itemName" label="Item Name" />
              <SortableHeader field="company" label="Vendor" />
              <SortableHeader field="currentStock" label="Current Stock" />
              <SortableHeader field="minStockLevel" label="Min Stock" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
              <SortableHeader field="stockLocation" label="Location" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Unit Cost</th>
              <SortableHeader field="stockValue" label="Stock Value" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Last Activity</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSkus.map((sku, index) => {
              const lastTransaction = getLastTransaction(sku.skuCode);
              const stockValue = calculateStockValue(sku);
              const vendorInfo = getVendorInfo(sku.company);
              
              return (
                <tr 
                  key={sku.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                  onClick={() => onSkuSelect(sku)}
                >
                  <td className="px-3 py-3 font-mono text-xs">{sku.skuCode || "-"}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sku.type === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {sku.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium">{sku.itemName || "-"}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center">
                      <span>{sku.company || "-"}</span>
                      {vendorInfo && (
                        <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                          vendorInfo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {vendorInfo.isActive ? '●' : '○'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium">
                    {sku.currentStock || 0} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                  </td>
                  <td className="px-3 py-3">
                    {sku.minStockLevel || "-"} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                  </td>
                  <td className="px-3 py-3">{renderStockBadge(sku)}</td>
                  <td className="px-3 py-3">{sku.stockLocation || "-"}</td>
                  <td className="px-3 py-3">
                    {formatCurrency(sku.finalCostPerUnit || sku.finalRate || 0)}
                  </td>
                  <td className="px-3 py-3 font-medium text-green-600">
                    {formatCurrency(stockValue)}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {lastTransaction ? (
                      <div>
                        <div>{formatDate(lastTransaction.date)}</div>
                        <div className={`text-xs ${
                          lastTransaction.type === 'IN' ? 'text-green-600' : 
                          lastTransaction.type === 'OUT' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {lastTransaction.type} {lastTransaction.quantity}
                        </div>
                      </div>
                    ) : "No activity"}
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSkuSelect(sku)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedSkus.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No SKUs match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Mobile card view
  const renderMobileCardView = () => {
    return (
      <div className="space-y-4">
        {sortedSkus.map((sku) => {
          const lastTransaction = getLastTransaction(sku.skuCode);
          const stockValue = calculateStockValue(sku);
          const vendorInfo = getVendorInfo(sku.company);
          
          return (
            <div 
              key={sku.id} 
              className="border border-gray-200 shadow-sm overflow-hidden bg-white cursor-pointer"
              onClick={() => onSkuSelect(sku)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-800">{sku.itemName || "Unknown Item"}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sku.type === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {sku.type}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-600">{sku.company || "No vendor"}</p>
                      {vendorInfo && (
                        <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                          vendorInfo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {vendorInfo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-gray-500">{sku.skuCode || "No SKU"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{formatCurrency(stockValue)}</p>
                    {renderStockBadge(sku)}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Stock:</span> 
                      {sku.currentStock || 0} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Min:</span> 
                      {sku.minStockLevel || "-"} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Last Activity: {lastTransaction ? (
                      <span className={`${
                        lastTransaction.type === 'IN' ? 'text-green-600' : 
                        lastTransaction.type === 'OUT' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {formatDate(lastTransaction.date)} ({lastTransaction.type})
                      </span>
                    ) : "None"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpand(sku.id);
                    }}
                    className="text-xs text-gray-600 flex items-center"
                  >
                    {expandedRows[sku.id] ? (
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
                </div>
              </div>
              
              {expandedRows[sku.id] && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Stock Details:</p>
                      <p>Location: {sku.stockLocation || "-"}</p>
                      <p>Max: {sku.maxStockLevel || "-"}</p>
                      <p>Unit Cost: {formatCurrency(sku.finalCostPerUnit || sku.finalRate || 0)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Usage:</p>
                      <p>Purchased: {sku.totalPurchased || 0}</p>
                      <p>Used: {sku.totalUsed || 0}</p>
                      <p>Available: {(sku.totalPurchased || 0) - (sku.totalUsed || 0)}</p>
                    </div>
                  </div>
                  {vendorInfo && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="font-medium text-blue-800 text-sm">Vendor Info</p>
                      <p className="text-blue-700 text-xs">
                        {vendorInfo.email && `Email: ${vendorInfo.email} • `}
                        Credit Terms: {vendorInfo.paymentTerms?.creditDays || 0} days
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {sortedSkus.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-gray-50 rounded">
            <p>No SKUs match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Search, Filter and View Options */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 pb-4 border-b">
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Material">Materials</option>
            <option value="Paper">Papers</option>
          </select>

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Vendors</option>
            {uniqueVendors.map(vendor => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="OVERSTOCK">Overstock</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{sortedSkus.length} SKUs found</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button 
              onClick={() => setViewType('compact')}
              className={`px-3 py-2 text-sm flex items-center ${
                viewType === 'compact' 
                  ? 'bg-blue-600 text-white' 
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
                  ? 'bg-blue-600 text-white' 
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

      {/* SKU Summary */}
      {skus.length > 0 && (
        <div className="py-3 px-4 bg-blue-50 border-b border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <p className="text-blue-800 font-medium">{skus.filter(s => getSkuStockStatus(s) === 'IN_STOCK').length}</p>
              <p className="text-blue-600 text-xs">In Stock</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-800 font-medium">{skus.filter(s => getSkuStockStatus(s) === 'LOW_STOCK').length}</p>
              <p className="text-yellow-600 text-xs">Low Stock</p>
            </div>
            <div className="text-center">
              <p className="text-red-800 font-medium">{skus.filter(s => getSkuStockStatus(s) === 'OUT_OF_STOCK').length}</p>
              <p className="text-red-600 text-xs">Out of Stock</p>
            </div>
            <div className="text-center">
              <p className="text-purple-800 font-medium">{skus.filter(s => getSkuStockStatus(s) === 'OVERSTOCK').length}</p>
              <p className="text-purple-600 text-xs">Overstock</p>
            </div>
            <div className="text-center">
              <p className="text-green-800 font-medium">{formatCurrency(skus.reduce((sum, sku) => sum + calculateStockValue(sku), 0))}</p>
              <p className="text-green-600 text-xs">Total Value</p>
            </div>
          </div>
        </div>
      )}
      
      {/* SKU Count */}
      <div className="px-4 py-2 text-sm text-gray-600">
        Showing {sortedSkus.length} of {skus.length} SKUs
      </div>

      {/* Table Content */}
      {sortedSkus.length > 0 ? (
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          {searchTerm || typeFilter !== 'all' || vendorFilter !== 'all' || stockFilter !== 'all' ? (
            <>
              <p className="text-lg font-medium">No SKUs match your search</p>
              <p className="mt-1">Try using different filters or clear your search</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setVendorFilter('all');
                  setStockFilter('all');
                }}
                className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No SKUs found</p>
              <p className="mt-1">Start by adding materials or papers to see them here</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplaySKUTable;