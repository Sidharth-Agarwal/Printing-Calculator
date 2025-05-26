import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const VendorDetailsModal = ({ vendor, onClose, onEdit, onToggleStatus, isAdmin }) => {
  const [vendorSkus, setVendorSkus] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!vendor) return;

    const fetchVendorData = async () => {
      setIsLoading(true);
      
      // Fetch materials and papers associated with this vendor
      const materialsQuery = query(
        collection(db, "materials"), 
        where("company", "==", vendor.name)
      );
      
      const papersQuery = query(
        collection(db, "papers"), 
        where("company", "==", vendor.name)
      );
      
      const stockTransactionsQuery = query(
        collection(db, "stockTransactions"),
        where("vendorName", "==", vendor.name)
      );

      // Set up real-time listeners
      const unsubscribeMaterials = onSnapshot(materialsQuery, (snapshot) => {
        const materials = snapshot.docs.map(doc => ({
          id: doc.id,
          type: 'Material',
          ...doc.data()
        }));
        
        const unsubscribePapers = onSnapshot(papersQuery, (snapshot) => {
          const papers = snapshot.docs.map(doc => ({
            id: doc.id,
            type: 'Paper',
            ...doc.data()
          }));
          
          // Combine materials and papers
          const allSkus = [...materials, ...papers];
          setVendorSkus(allSkus);
        });

        const unsubscribeTransactions = onSnapshot(stockTransactionsQuery, (snapshot) => {
          const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => b.date?.seconds - a.date?.seconds);
          
          setStockTransactions(transactions);
          setIsLoading(false);
        });

        return () => {
          unsubscribePapers();
          unsubscribeTransactions();
        };
      });

      return () => {
        unsubscribeMaterials();
      };
    };

    fetchVendorData();
  }, [vendor]);

  if (!vendor) return null;

  // Calculate vendor statistics
  const vendorStats = {
    totalSkus: vendorSkus.length,
    materialSkus: vendorSkus.filter(sku => sku.type === 'Material').length,
    paperSkus: vendorSkus.filter(sku => sku.type === 'Paper').length,
    totalStockValue: vendorSkus.reduce((sum, sku) => {
      const stock = parseFloat(sku.currentStock) || 0;
      const cost = parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0;
      return sum + (stock * cost);
    }, 0),
    lowStockItems: vendorSkus.filter(sku => {
      const current = parseFloat(sku.currentStock) || 0;
      const min = parseFloat(sku.minStockLevel) || 0;
      return current <= min && current > 0;
    }).length,
    outOfStockItems: vendorSkus.filter(sku => {
      const current = parseFloat(sku.currentStock) || 0;
      return current <= 0;
    }).length,
    totalTransactions: stockTransactions.length,
    recentTransactions: stockTransactions.slice(0, 5)
  };

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

  // Format date with time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-IN");
  };

  // Get stock status for SKU
  const getStockStatus = (sku) => {
    const current = parseFloat(sku.currentStock) || 0;
    const min = parseFloat(sku.minStockLevel) || 0;
    
    if (current <= 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (current <= min) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  // Render overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Vendor Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-base font-semibold mb-3 text-gray-700">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Email:</span> 
                <span className="ml-2 font-medium">{vendor.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span> 
                <span className="ml-2 font-medium">{vendor.phone || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500">GSTIN:</span> 
                <span className="ml-2 font-medium">{vendor.gstin || "N/A"}</span>
              </div>
            </div>
          </div>
          
          {/* Address */}
          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-base font-semibold mb-3 text-gray-700">Address</h4>
            {vendor.address?.line1 ? (
              <div className="space-y-1 text-sm">
                <p>{vendor.address.line1}</p>
                {vendor.address.line2 && <p>{vendor.address.line2}</p>}
                <p>
                  {[
                    vendor.address.city, 
                    vendor.address.state, 
                    vendor.address.postalCode
                  ].filter(Boolean).join(", ")}
                </p>
                <p>{vendor.address.country || ""}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">N/A</p>
            )}
          </div>
          
          {/* Payment Terms */}
          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-base font-semibold mb-3 text-gray-700">Payment Terms</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Credit Period:</span>
                <span className="ml-2 font-medium">{vendor.paymentTerms?.creditDays || 0} days</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
          {/* Account Details */}
          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-base font-semibold mb-3 text-gray-700">Account Details</h4>
            {vendor.accountDetails?.bankName ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Bank Name:</span> 
                  <span className="ml-2 font-medium">{vendor.accountDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Account Number:</span> 
                  <span className="ml-2 font-medium">{vendor.accountDetails.accountNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">IFSC Code:</span> 
                  <span className="ml-2 font-medium">{vendor.accountDetails.ifscCode}</span>
                </div>
                <div>
                  <span className="text-gray-500">Account Type:</span> 
                  <span className="ml-2 font-medium">{vendor.accountDetails.accountType}</span>
                </div>
                {vendor.accountDetails.upiId && (
                  <div>
                    <span className="text-gray-500">UPI ID:</span> 
                    <span className="ml-2 font-medium">{vendor.accountDetails.upiId}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No account details available</p>
            )}
          </div>
          
          {/* Date Information */}
          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-base font-semibold mb-3 text-gray-700">Date Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Created On</p>
                <p className="font-medium">{formatDate(vendor.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(vendor.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SKU Statistics */}
      <div className="bg-blue-50 rounded p-4 border border-blue-200">
        <h4 className="text-base font-semibold mb-3 text-blue-800">SKU & Stock Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
          <div className="text-center">
            <p className="text-blue-800 font-bold text-lg">{vendorStats.totalSkus}</p>
            <p className="text-blue-600 text-xs">Total SKUs</p>
          </div>
          <div className="text-center">
            <p className="text-blue-800 font-bold text-lg">{vendorStats.materialSkus}</p>
            <p className="text-blue-600 text-xs">Materials</p>
          </div>
          <div className="text-center">
            <p className="text-blue-800 font-bold text-lg">{vendorStats.paperSkus}</p>
            <p className="text-blue-600 text-xs">Papers</p>
          </div>
          <div className="text-center">
            <p className="text-green-800 font-bold text-lg">{vendorStats.totalSkus - vendorStats.lowStockItems - vendorStats.outOfStockItems}</p>
            <p className="text-green-600 text-xs">In Stock</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-800 font-bold text-lg">{vendorStats.lowStockItems}</p>
            <p className="text-yellow-600 text-xs">Low Stock</p>
          </div>
          <div className="text-center">
            <p className="text-red-800 font-bold text-lg">{vendorStats.outOfStockItems}</p>
            <p className="text-red-600 text-xs">Out of Stock</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-blue-700 font-medium">Total Stock Value:</span>
            <span className="text-blue-800 font-bold text-lg">{formatCurrency(vendorStats.totalStockValue)}</span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {vendor.notes && (
        <div className="bg-gray-50 rounded p-4">
          <h4 className="text-base font-semibold mb-3 text-gray-700">Notes</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{vendor.notes}</p>
        </div>
      )}
    </div>
  );

  // Render SKUs tab
  const renderSkusTab = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : vendorSkus.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left font-semibold text-gray-700">SKU Code</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Current Stock</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Cost/Unit</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {vendorSkus.map((sku) => {
                const stockStatus = getStockStatus(sku);
                const currentStock = parseFloat(sku.currentStock) || 0;
                const unitCost = parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0;
                const stockValue = currentStock * unitCost;
                
                return (
                  <tr key={sku.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{sku.skuCode || "-"}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sku.type === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {sku.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {sku.materialName || sku.paperName || "-"}
                    </td>
                    <td className="px-3 py-2">
                      {currentStock} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">₹{unitCost.toFixed(2)}</td>
                    <td className="px-3 py-2 font-medium">₹{stockValue.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No SKUs found for this vendor</p>
        </div>
      )}
    </div>
  );

  // Render transactions tab
  const renderTransactionsTab = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : stockTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">SKU Code</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Quantity</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Reference</th>
              </tr>
            </thead>
            <tbody>
              {stockTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2">{formatDateTime(transaction.date)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{transaction.skuCode}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'IN' ? 'bg-green-100 text-green-800' : 
                      transaction.type === 'OUT' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {transaction.quantity} {transaction.itemType === 'Material' ? 'sqcm' : 'sheets'}
                  </td>
                  <td className="px-3 py-2">{transaction.reference || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found for this vendor</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-gray-900 text-white">
          <h3 className="text-lg font-semibold">
            Vendor Details - {vendor.name}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Vendor Name, Code, and Status */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{vendor.name}</h2>
              <div className="flex items-center mt-1">
                <p className="text-gray-500 text-sm">{vendor.vendorCode}</p>
              </div>
            </div>
            
            {/* Status Badge and Toggle Button */}
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                vendor.isActive
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {vendor.isActive ? "Active Vendor" : "Inactive Vendor"}
              </span>
              
              {onToggleStatus && (
                <button 
                  onClick={onToggleStatus}
                  className={`mt-2 px-3 py-1.5 text-xs rounded-md flex items-center ${
                    vendor.isActive
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                      : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  {vendor.isActive ? "Mark as Inactive" : "Mark as Active"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('skus')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'skus'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              SKUs ({vendorStats.totalSkus})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions ({vendorStats.totalTransactions})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'skus' && renderSkusTab()}
          {activeTab === 'transactions' && renderTransactionsTab()}
        </div>
        
        {/* Action buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 mr-2"
            >
              Edit Vendor
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsModal;