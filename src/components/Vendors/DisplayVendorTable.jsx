import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import VendorDetailsModal from "./VendorDetailsModal";

const DisplayVendorTable = ({ vendors, onDelete, onEdit, onToggleStatus, isAdmin }) => {
  // State for search term, filter, sorting, and view type
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActiveStatus, setFilterActiveStatus] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewType, setViewType] = useState('compact');
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // State for vendor SKU data
  const [vendorSkuData, setVendorSkuData] = useState({});
  const [vendorTransactionData, setVendorTransactionData] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch SKU and transaction data for all vendors
  useEffect(() => {
    if (vendors.length === 0) {
      setIsLoadingData(false);
      return;
    }

    const fetchVendorData = async () => {
      setIsLoadingData(true);
      const skuData = {};
      const transactionData = {};
      const unsubscribeFunctions = [];

      try {
        // Get all vendor names
        const vendorNames = vendors.map(v => v.name);
        
        // Split vendor names into chunks of 10 (Firestore limit for 'in' queries)
        const vendorNameChunks = [];
        for (let i = 0; i < vendorNames.length; i += 10) {
          vendorNameChunks.push(vendorNames.slice(i, i + 10));
        }

        for (const chunk of vendorNameChunks) {
          // Fetch materials for this chunk
          const materialsQuery = query(
            collection(db, "materials"),
            where("company", "in", chunk)
          );

          const unsubscribeMaterials = onSnapshot(materialsQuery, (snapshot) => {
            snapshot.docs.forEach(doc => {
              const material = doc.data();
              const vendorName = material.company;
              
              if (!skuData[vendorName]) {
                skuData[vendorName] = {
                  totalSkus: 0,
                  materialSkus: 0,
                  paperSkus: 0,
                  totalStockValue: 0,
                  lowStockCount: 0,
                  outOfStockCount: 0,
                  lastActivity: null
                };
              }
              
              skuData[vendorName].totalSkus++;
              skuData[vendorName].materialSkus++;
              
              const stock = parseFloat(material.currentStock) || 0;
              const cost = parseFloat(material.finalCostPerUnit) || 0;
              skuData[vendorName].totalStockValue += (stock * cost);
              
              const minStock = parseFloat(material.minStockLevel) || 0;
              if (stock <= 0) skuData[vendorName].outOfStockCount++;
              else if (stock <= minStock) skuData[vendorName].lowStockCount++;
              
              // Update last activity if material has recent updates
              if (material.updatedAt) {
                const updateDate = material.updatedAt.toDate ? material.updatedAt.toDate() : new Date(material.updatedAt);
                if (!skuData[vendorName].lastActivity || updateDate > skuData[vendorName].lastActivity) {
                  skuData[vendorName].lastActivity = updateDate;
                }
              }
            });

            setVendorSkuData({...skuData});
          });

          unsubscribeFunctions.push(unsubscribeMaterials);

          // Fetch papers for this chunk
          const papersQuery = query(
            collection(db, "papers"),
            where("company", "in", chunk)
          );

          const unsubscribePapers = onSnapshot(papersQuery, (snapshot) => {
            snapshot.docs.forEach(doc => {
              const paper = doc.data();
              const vendorName = paper.company;
              
              if (!skuData[vendorName]) {
                skuData[vendorName] = {
                  totalSkus: 0,
                  materialSkus: 0,
                  paperSkus: 0,
                  totalStockValue: 0,
                  lowStockCount: 0,
                  outOfStockCount: 0,
                  lastActivity: null
                };
              }
              
              skuData[vendorName].totalSkus++;
              skuData[vendorName].paperSkus++;
              
              const stock = parseFloat(paper.currentStock) || 0;
              const cost = parseFloat(paper.finalRate) || 0;
              skuData[vendorName].totalStockValue += (stock * cost);
              
              const minStock = parseFloat(paper.minStockLevel) || 0;
              if (stock <= 0) skuData[vendorName].outOfStockCount++;
              else if (stock <= minStock) skuData[vendorName].lowStockCount++;
              
              // Update last activity if paper has recent updates
              if (paper.updatedAt) {
                const updateDate = paper.updatedAt.toDate ? paper.updatedAt.toDate() : new Date(paper.updatedAt);
                if (!skuData[vendorName].lastActivity || updateDate > skuData[vendorName].lastActivity) {
                  skuData[vendorName].lastActivity = updateDate;
                }
              }
            });

            setVendorSkuData({...skuData});
          });

          unsubscribeFunctions.push(unsubscribePapers);

          // Fetch stock transactions for this chunk
          const transactionsQuery = query(
            collection(db, "stockTransactions"),
            where("vendorName", "in", chunk)
          );

          const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            snapshot.docs.forEach(doc => {
              const transaction = doc.data();
              const vendorName = transaction.vendorName;
              
              if (!transactionData[vendorName]) {
                transactionData[vendorName] = {
                  totalTransactions: 0,
                  lastTransactionDate: null,
                  recentTransactions: []
                };
              }
              
              transactionData[vendorName].totalTransactions++;
              
              const transactionDate = transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date);
              if (!transactionData[vendorName].lastTransactionDate || 
                  transactionDate > transactionData[vendorName].lastTransactionDate) {
                transactionData[vendorName].lastTransactionDate = transactionDate;
                
                // Also update SKU data last activity
                if (skuData[vendorName] && (!skuData[vendorName].lastActivity || transactionDate > skuData[vendorName].lastActivity)) {
                  skuData[vendorName].lastActivity = transactionDate;
                }
              }
            });

            setVendorTransactionData({...transactionData});
            setVendorSkuData({...skuData});
            setIsLoadingData(false);
          });

          unsubscribeFunctions.push(unsubscribeTransactions);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setIsLoadingData(false);
      }

      // Cleanup function
      return () => {
        unsubscribeFunctions.forEach(unsub => unsub());
      };
    };

    const cleanup = fetchVendorData();
    
    // Return cleanup function
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn && typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, [vendors]);
  
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

  // Sort vendors
  const sortedVendors = [...vendors].sort((a, b) => {
    // Handle nested fields and SKU data
    const getNestedValue = (obj, path) => {
      const keys = path.split('.');
      let value = obj;
      for (const key of keys) {
        if (value === undefined || value === null) return '';
        value = value[key];
      }
      return value || '';
    };

    let aValue, bValue;

    // Handle SKU-related sorting
    if (sortField === 'totalSkus') {
      aValue = vendorSkuData[a.name]?.totalSkus || 0;
      bValue = vendorSkuData[b.name]?.totalSkus || 0;
    } else if (sortField === 'stockValue') {
      aValue = vendorSkuData[a.name]?.totalStockValue || 0;
      bValue = vendorSkuData[b.name]?.totalStockValue || 0;
    } else if (sortField === 'lastActivity') {
      aValue = vendorSkuData[a.name]?.lastActivity?.getTime() || 0;
      bValue = vendorSkuData[b.name]?.lastActivity?.getTime() || 0;
    } else if (typeof sortField === 'string' && sortField.includes('.')) {
      aValue = getNestedValue(a, sortField).toString().toLowerCase();
      bValue = getNestedValue(b, sortField).toString().toLowerCase();
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

  // Filter sorted vendors based on search term and active status
  const filteredVendors = sortedVendors.filter((vendor) => {
    // Handle search
    const matchesSearch =
      searchTerm === "" ||
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendorCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.gstin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle active status filter
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

  // Get vendor SKU summary
  const getVendorSkuSummary = (vendorName) => {
    const skuData = vendorSkuData[vendorName];
    const transactionData = vendorTransactionData[vendorName];
    
    return {
      totalSkus: skuData?.totalSkus || 0,
      materialSkus: skuData?.materialSkus || 0,
      paperSkus: skuData?.paperSkus || 0,
      stockValue: skuData?.totalStockValue || 0,
      lowStockCount: skuData?.lowStockCount || 0,
      outOfStockCount: skuData?.outOfStockCount || 0,
      totalTransactions: transactionData?.totalTransactions || 0,
      lastActivity: skuData?.lastActivity || transactionData?.lastTransactionDate || null
    };
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
    e.stopPropagation(); // Stop event from triggering row click
    onToggleStatus(vendor.id, !vendor.isActive);
  };

  // Render stock status indicators
  const renderStockIndicators = (vendorName) => {
    const summary = getVendorSkuSummary(vendorName);
    
    if (summary.totalSkus === 0) {
      return <span className="text-xs text-gray-500">No SKUs</span>;
    }

    return (
      <div className="flex space-x-1">
        {summary.outOfStockCount > 0 && (
          <span className="px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded font-medium">
            {summary.outOfStockCount} OUT
          </span>
        )}
        {summary.lowStockCount > 0 && (
          <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
            {summary.lowStockCount} LOW
          </span>
        )}
        {summary.totalSkus - summary.outOfStockCount - summary.lowStockCount > 0 && (
          <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
            {summary.totalSkus - summary.outOfStockCount - summary.lowStockCount} OK
          </span>
        )}
      </div>
    );
  };

  // Compact view - shows essential information with SKU data
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
              <SortableHeader field="totalSkus" label="SKUs" />
              <SortableHeader field="stockValue" label="Stock Value" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Stock Status</th>
              <SortableHeader field="lastActivity" label="Last Activity" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => {
              const summary = getVendorSkuSummary(vendor.name);
              
              return (
                <React.Fragment key={vendor.id}>
                  <tr 
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewVendor(vendor)}
                  >
                    <td className="px-3 py-3">{vendor.vendorCode}</td>
                    <td className="px-3 py-3 font-medium">{vendor.name}</td>
                    <td className="px-3 py-3">{vendor.email || "-"}</td>
                    <td className="px-3 py-3">{vendor.phone || "-"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{summary.totalSkus}</span>
                        {summary.totalSkus > 0 && (
                          <span className="text-xs text-gray-500">
                            {summary.materialSkus}M • {summary.paperSkus}P
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-green-600">
                      {formatCurrency(summary.stockValue)}
                    </td>
                    <td className="px-3 py-3">
                      {renderStockIndicators(vendor.name)}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {summary.lastActivity ? formatDate(summary.lastActivity) : "No activity"}
                    </td>
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
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onEdit(vendor)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={(e) => onDelete(vendor.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Delete
                        </button>
                        
                        {/* Toggle Status Button */}
                        <button
                          onClick={(e) => handleToggleStatus(e, vendor)}
                          className={`px-2 py-1 text-xs ${
                            vendor.isActive 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-green-100 text-green-800"
                          } rounded hover:bg-opacity-80 transition-colors flex items-center`}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          {vendor.isActive ? "Deactivate" : "Activate"}
                        </button>
                        
                        {/* Show More Button */}
                        <button
                          onClick={(e) => toggleRowExpand(e, vendor.id)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors flex items-center"
                        >
                          <svg className={`w-3 h-3 mr-1 transition-transform ${expandedRows[vendor.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                          {expandedRows[vendor.id] ? 'Less' : 'More'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows[vendor.id] && (
                    <tr className="bg-gray-50" onClick={() => handleViewVendor(vendor)}>
                      <td colSpan={10} className="px-4 py-3 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Bank Details:</p>
                            <p>{vendor.accountDetails?.bankName || "-"}</p>
                            <p>Account: {vendor.accountDetails?.accountNumber || "-"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Address:</p>
                            <p>{vendor.address?.city || "-"}, {vendor.address?.state || "-"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">SKU Breakdown:</p>
                            <p>Materials: {summary.materialSkus}</p>
                            <p>Papers: {summary.paperSkus}</p>
                            <p>Transactions: {summary.totalTransactions}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Stock Summary:</p>
                            <p>Value: {formatCurrency(summary.stockValue)}</p>
                            <p>Low Stock: {summary.lowStockCount} items</p>
                            <p>Out of Stock: {summary.outOfStockCount} items</p>
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
        {filteredVendors.length === 0 && (
          <div className="py-8 text-center text-gray-500 bg-white">
            <p>No vendors match your search criteria.</p>
          </div>
        )}
      </div>
    );
  };

  // Detailed view - shows all columns including enhanced SKU data
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
              <SortableHeader field="totalSkus" label="Total SKUs" />
              <SortableHeader field="stockValue" label="Stock Value" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Stock Status</th>
              <SortableHeader field="paymentTerms.creditDays" label="Credit Days" />
              <SortableHeader field="lastActivity" label="Last Activity" />
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Status</th>
              <th className="px-3 py-3 border-b-2 border-gray-200 font-semibold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => {
              const summary = getVendorSkuSummary(vendor.name);
              
              return (
                <tr 
                  key={vendor.id} 
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewVendor(vendor)}
                >
                  <td className="px-3 py-3">{vendor.vendorCode}</td>
                  <td className="px-3 py-3 font-medium">{vendor.name}</td>
                  <td className="px-3 py-3">{vendor.email || "-"}</td>
                  <td className="px-3 py-3">{vendor.phone || "-"}</td>
                  <td className="px-3 py-3">{vendor.gstin || "-"}</td>
                  <td className="px-3 py-3">
                    {vendor.address?.city ? `${vendor.address.city}, ${vendor.address.state || ""}` : "-"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{summary.totalSkus}</span>
                      <span className="text-xs text-gray-500">
                        {summary.materialSkus}M • {summary.paperSkus}P
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-green-600">
                    {formatCurrency(summary.stockValue)}
                  </td>
                  <td className="px-3 py-3">
                    {renderStockIndicators(vendor.name)}
                  </td>
                  <td className="px-3 py-3">{vendor.paymentTerms?.creditDays || 0} days</td>
                  <td className="px-3 py-3 text-xs">
                    {summary.lastActivity ? formatDate(summary.lastActivity) : "No activity"}
                  </td>
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
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEdit(vendor)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(vendor.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                      
                      {/* Toggle Status Button */}
                      <button
                        onClick={(e) => handleToggleStatus(e, vendor)}
                        className={`px-2 py-1 text-xs ${
                          vendor.isActive 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-green-100 text-green-800"
                        } rounded hover:bg-opacity-80 transition-colors`}>
                        {vendor.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

  // Mobile card view with enhanced SKU information
  const renderMobileCardView = () => {
    return (
      <div className="space-y-4">
        {filteredVendors.map((vendor) => {
          const summary = getVendorSkuSummary(vendor.name);
          
          return (
            <div 
              key={vendor.id} 
              className="border border-gray-200 shadow-sm overflow-hidden bg-white cursor-pointer"
              onClick={() => handleViewVendor(vendor)}
            >
              {/* Main vendor information always visible */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-800">{vendor.name}</h3>
                      {vendor.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 ml-2">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{vendor.vendorCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{formatCurrency(summary.stockValue)}</p>
                    <p className="text-xs text-gray-500">{summary.totalSkus} SKUs</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Email:</span> {vendor.email || "N/A"}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Phone:</span> {vendor.phone || "N/A"}
                    </div>
                  </div>
                </div>

                {/* SKU Summary */}
                {summary.totalSkus > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">SKU Breakdown:</span>
                        <p className="text-xs">{summary.materialSkus} Materials • {summary.paperSkus} Papers</p>
                      </div>
                      <div className="text-right">
                        {renderStockIndicators(vendor.name)}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 flex justify-between items-center">
                  <button
                    onClick={(e) => toggleRowExpand(e, vendor.id)}
                    className="text-xs text-gray-600 flex items-center"
                  >
                    {expandedRows[vendor.id] ? (
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
                      onClick={() => onEdit(vendor)}
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
              {expandedRows[vendor.id] && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">GSTIN:</p>
                      <p>{vendor.gstin || "N/A"}</p>
                    </div>
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
                      <p>Account: {vendor.accountDetails?.accountNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">SKU Details:</p>
                      <p>Materials: {summary.materialSkus}</p>
                      <p>Papers: {summary.paperSkus}</p>
                      <p>Transactions: {summary.totalTransactions}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Stock Issues:</p>
                      <p>Low Stock: {summary.lowStockCount} items</p>
                      <p>Out of Stock: {summary.outOfStockCount} items</p>
                      <p>Last Activity: {summary.lastActivity ? formatDate(summary.lastActivity) : "None"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleToggleStatus(e, vendor)}
                      className={`px-2 py-1 text-xs ${
                        vendor.isActive 
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                      } rounded transition-colors flex items-center`}
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      {vendor.isActive ? "Mark as Inactive" : "Mark as Active"}
                    </button>
                    
                    <button
                      onClick={() => onDelete(vendor.id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors flex items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Delete Vendor
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
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
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={filterActiveStatus}
            onChange={(e) => setFilterActiveStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
      
      {/* SKU Summary for All Vendors */}
      {!isLoadingData && Object.keys(vendorSkuData).length > 0 && (
        <div className="py-3 px-4 bg-blue-50 border-b border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <p className="text-blue-800 font-medium">{Object.values(vendorSkuData).reduce((sum, data) => sum + data.totalSkus, 0)}</p>
              <p className="text-blue-600 text-xs">Total SKUs</p>
            </div>
            <div className="text-center">
              <p className="text-blue-800 font-medium">{Object.values(vendorSkuData).reduce((sum, data) => sum + data.materialSkus, 0)}</p>
              <p className="text-blue-600 text-xs">Materials</p>
            </div>
            <div className="text-center">
              <p className="text-blue-800 font-medium">{Object.values(vendorSkuData).reduce((sum, data) => sum + data.paperSkus, 0)}</p>
              <p className="text-blue-600 text-xs">Papers</p>
            </div>
            <div className="text-center">
              <p className="text-blue-800 font-medium">{formatCurrency(Object.values(vendorSkuData).reduce((sum, data) => sum + data.totalStockValue, 0))}</p>
              <p className="text-blue-600 text-xs">Total Stock Value</p>
            </div>
            <div className="text-center">
              <p className="text-blue-800 font-medium">{Object.values(vendorSkuData).reduce((sum, data) => sum + data.lowStockCount + data.outOfStockCount, 0)}</p>
              <p className="text-blue-600 text-xs">Stock Issues</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Vendor Count */}
      <div className="px-4 py-2 text-sm text-gray-600">
        Showing {filteredVendors.length} of {vendors.length} vendors
        {isLoadingData && <span className="ml-2 text-blue-600">(Loading SKU data...)</span>}
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
                className="mt-4 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
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
          onEdit={() => {
            handleCloseModal();
            onEdit(selectedVendor);
          }}
          onToggleStatus={() => {
            handleToggleStatus(new Event('click'), selectedVendor);
            handleCloseModal();
          }}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default DisplayVendorTable;