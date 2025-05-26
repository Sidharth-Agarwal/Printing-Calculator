import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getStockStatus, getStockStatusInfo } from "../../../constants/materialConstants";
import { getPaperStockStatus, getPaperStockStatusInfo, calculatePaperAreaCoverage } from "../../../constants/paperContants";

const SKUDetailsModal = ({ sku, vendors, transactions, onClose, isAdmin }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [skuTransactions, setSkuTransactions] = useState([]);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'IN',
    quantity: '',
    reference: '',
    notes: ''
  });
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Real-time transaction updates
  useEffect(() => {
    if (!sku?.skuCode) return;

    setIsLoadingTransactions(true);
    
    const transactionsQuery = query(
      collection(db, "stockTransactions"),
      where("skuCode", "==", sku.skuCode),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSkuTransactions(transactionsData);
      setIsLoadingTransactions(false);
    });

    return () => unsubscribe();
  }, [sku?.skuCode]);

  if (!sku) return null;

  // Get vendor information
  const vendor = vendors.find(v => v.name === sku.company) || null;

  // Get stock status
  const getSkuStockStatus = () => {
    const currentStock = parseFloat(sku.currentStock) || 0;
    const minStock = parseFloat(sku.minStockLevel) || 0;
    const maxStock = parseFloat(sku.maxStockLevel) || 999999;
    
    if (sku.type === 'Material') {
      return getStockStatus(currentStock, minStock, maxStock);
    } else {
      return getPaperStockStatus(currentStock, minStock, maxStock);
    }
  };

  const getSkuStockStatusInfo = () => {
    const status = getSkuStockStatus();
    
    if (sku.type === 'Material') {
      return getStockStatusInfo(status);
    } else {
      return getPaperStockStatusInfo(status);
    }
  };

  // Calculate stock metrics
  const stockMetrics = {
    currentStock: parseFloat(sku.currentStock) || 0,
    minStock: parseFloat(sku.minStockLevel) || 0,
    maxStock: parseFloat(sku.maxStockLevel) || 999999,
    totalPurchased: parseFloat(sku.totalPurchased) || 0,
    totalUsed: parseFloat(sku.totalUsed) || 0,
    unitCost: parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0,
    stockValue: (parseFloat(sku.currentStock) || 0) * (parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0),
    utilizationRate: ((parseFloat(sku.totalUsed) || 0) / (parseFloat(sku.totalPurchased) || 1)) * 100
  };

  // Calculate area coverage for papers
  const areaCoverage = sku.type === 'Paper' && sku.currentStock && sku.length && sku.breadth 
    ? calculatePaperAreaCoverage(sku.currentStock, sku.length, sku.breadth) 
    : null;

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

  // Format date with time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-IN");
  };

  // Handle stock adjustment
  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsSubmittingAdjustment(true);
    try {
      const adjustmentData = {
        skuCode: sku.skuCode,
        type: stockAdjustment.type,
        quantity: parseFloat(stockAdjustment.quantity),
        date: new Date(),
        reference: stockAdjustment.reference || 'Manual Adjustment',
        notes: stockAdjustment.notes,
        vendorName: sku.company,
        itemType: sku.type,
        createdAt: new Date(),
        createdBy: 'Admin' // You might want to get this from auth context
      };

      await addDoc(collection(db, "stockTransactions"), adjustmentData);
      
      setStockAdjustment({
        type: 'IN',
        quantity: '',
        reference: '',
        notes: ''
      });
      
      setNotification({
        type: 'success',
        message: 'Stock adjustment recorded successfully!'
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error recording stock adjustment:", error);
      setNotification({
        type: 'error',
        message: 'Failed to record stock adjustment'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  // Render overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* SKU Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-base font-semibold mb-3 text-gray-700">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">SKU Code:</span> 
                <span className="ml-2 font-mono font-medium">{sku.skuCode}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  sku.type === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {sku.type}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Name:</span> 
                <span className="ml-2 font-medium">{sku.itemName}</span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span> 
                <span className="ml-2">{formatDate(sku.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span> 
                <span className="ml-2">{formatDate(sku.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Specifications */}
          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-base font-semibold mb-3 text-gray-700">Specifications</h4>
            {sku.type === 'Material' ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Material Type:</span> 
                  <span className="ml-2 font-medium">{sku.materialType || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Dimensions:</span> 
                  <span className="ml-2">{sku.sizeL || "-"} × {sku.sizeB || "-"} cm</span>
                </div>
                <div>
                  <span className="text-gray-500">Area per Unit:</span> 
                  <span className="ml-2">{sku.area || "-"} sqcm</span>
                </div>
                <div>
                  <span className="text-gray-500">Quantity:</span> 
                  <span className="ml-2">{sku.quantity || "-"} units</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">GSM:</span> 
                  <span className="ml-2 font-medium">{sku.gsm || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Dimensions:</span> 
                  <span className="ml-2">{sku.length || "-"} × {sku.breadth || "-"} cm</span>
                </div>
                <div>
                  <span className="text-gray-500">Area per Sheet:</span> 
                  <span className="ml-2">{sku.area || "-"} sqcm</span>
                </div>
                {areaCoverage && (
                  <div>
                    <span className="text-gray-500">Total Coverage:</span> 
                    <span className="ml-2 text-green-600 font-medium">{areaCoverage.totalArea} sqcm</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
          {/* Stock Information */}
          <div className="bg-blue-50 rounded p-4 border border-blue-200">
            <h4 className="text-base font-semibold mb-3 text-blue-800">Stock Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Current Stock:</span>
                <div className="text-right">
                  <span className="font-bold text-blue-800">
                    {stockMetrics.currentStock} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                  </span>
                  <div className="mt-1">
                    {(() => {
                      const statusInfo = getSkuStockStatusInfo();
                      return (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-600">Min Stock</p>
                  <p className="font-medium text-blue-800">{stockMetrics.minStock} {sku.type === 'Material' ? 'sqcm' : 'sheets'}</p>
                </div>
                <div>
                  <p className="text-blue-600">Max Stock</p>
                  <p className="font-medium text-blue-800">{stockMetrics.maxStock === 999999 ? 'No limit' : `${stockMetrics.maxStock} ${sku.type === 'Material' ? 'sqcm' : 'sheets'}`}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-blue-200">
                <div className="flex justify-between">
                  <span className="text-blue-700">Stock Value:</span>
                  <span className="font-bold text-blue-800">{formatCurrency(stockMetrics.stockValue)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Usage Statistics */}
          <div className="bg-green-50 rounded p-4 border border-green-200">
            <h4 className="text-base font-semibold mb-3 text-green-800">Usage Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Total Purchased:</span>
                <span className="font-medium text-green-800">{stockMetrics.totalPurchased} {sku.type === 'Material' ? 'sqcm' : 'sheets'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Total Used:</span>
                <span className="font-medium text-green-800">{stockMetrics.totalUsed} {sku.type === 'Material' ? 'sqcm' : 'sheets'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Utilization Rate:</span>
                <span className="font-medium text-green-800">{stockMetrics.utilizationRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Remaining:</span>
                <span className="font-medium text-green-800">{stockMetrics.totalPurchased - stockMetrics.totalUsed} {sku.type === 'Material' ? 'sqcm' : 'sheets'}</span>
              </div>
            </div>
          </div>
          
          {/* Location & Storage */}
          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-base font-semibold mb-3 text-gray-700">Storage Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Location:</span> 
                <span className="ml-2 font-medium">{sku.stockLocation || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Unit of Measure:</span> 
                <span className="ml-2">{sku.unitOfMeasure || (sku.type === 'Material' ? 'sqcm' : 'sheets')}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Stock Update:</span> 
                <span className="ml-2">{formatDate(sku.lastStockUpdate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Information */}
      {vendor && (
        <div className="bg-purple-50 rounded p-4 border border-purple-200">
          <h4 className="text-base font-semibold mb-3 text-purple-800">Vendor Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-purple-700 font-medium">{vendor.name}</p>
              <p className="text-purple-600">{vendor.vendorCode}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {vendor.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-purple-600">Contact Info</p>
              <p>{vendor.email || "No email"}</p>
              <p>{vendor.phone || "No phone"}</p>
            </div>
            <div>
              <p className="text-purple-600">Payment Terms</p>
              <p>Credit Days: {vendor.paymentTerms?.creditDays || 0} days</p>
              <p>Bank: {vendor.accountDetails?.bankName || "Not provided"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Information */}
      <div className="bg-yellow-50 rounded p-4 border border-yellow-200">
        <h4 className="text-base font-semibold mb-3 text-yellow-800">Pricing Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {sku.type === 'Material' ? (
            <>
              <div>
                <p className="text-yellow-700">Rate</p>
                <p className="font-medium text-yellow-800">{formatCurrency(sku.rate || 0)}</p>
              </div>
              <div>
                <p className="text-yellow-700">Courier Cost</p>
                <p className="font-medium text-yellow-800">{formatCurrency(sku.courier || 0)}</p>
              </div>
              <div>
                <p className="text-yellow-700">Mark Up</p>
                <p className="font-medium text-yellow-800">{sku.markUp || 0}</p>
              </div>
              <div>
                <p className="text-yellow-700">Final Cost/Unit</p>
                <p className="font-medium text-yellow-800">{formatCurrency(sku.finalCostPerUnit || 0)}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-yellow-700">Price/Sheet</p>
                <p className="font-medium text-yellow-800">{formatCurrency(sku.pricePerSheet || 0)}</p>
              </div>
              <div>
                <p className="text-yellow-700">Freight/Sheet</p>
                <p className="font-medium text-yellow-800">{formatCurrency(sku.freightPerSheet || 0)}</p>
              </div>
              <div>
                <p className="text-yellow-700">Rate/Gram</p>
                <p className="font-medium text-yellow-800">{formatCurrency(sku.ratePerGram || 0)}</p>
              </div>
              <div>
                <p className="text-yellow-700">Final Rate</p>
                <p className="font-medium text-yellow-800">{formatCurrency(sku.finalRate || 0)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render transactions tab
  const renderTransactionsTab = () => (
    <div className="space-y-4">
      {/* Stock Adjustment Form (Admin only) */}
      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-base font-semibold mb-3 text-blue-800">Record Stock Adjustment</h4>
          <form onSubmit={handleStockAdjustment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Type</label>
                <select
                  value={stockAdjustment.type}
                  onChange={(e) => setStockAdjustment(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="IN">Stock In (+)</option>
                  <option value="OUT">Stock Out (-)</option>
                  <option value="ADJUSTMENT">Adjustment (±)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Quantity ({sku.type === 'Material' ? 'sqcm' : 'sheets'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={stockAdjustment.reference}
                  onChange={(e) => setStockAdjustment(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PO Number, Job ID, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={stockAdjustment.notes}
                  onChange={(e) => setStockAdjustment(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingAdjustment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingAdjustment ? 'Recording...' : 'Record Adjustment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`p-3 rounded-md ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h4 className="text-base font-semibold mb-3 text-gray-700">Transaction History</h4>
        {isLoadingTransactions ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : skuTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Date & Time</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Quantity</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Reference</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Notes</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Created By</th>
                </tr>
              </thead>
              <tbody>
                {skuTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-2">{formatDateTime(transaction.date)}</td>
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
                      <span className={transaction.type === 'OUT' ? 'text-red-600' : 'text-green-600'}>
                        {transaction.type === 'OUT' ? '-' : '+'}{transaction.quantity} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{transaction.reference || "-"}</td>
                    <td className="px-3 py-2">{transaction.notes || "-"}</td>
                    <td className="px-3 py-2">{transaction.createdBy || "System"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p>No transactions found for this SKU</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render analytics tab
  const renderAnalyticsTab = () => {
    // Calculate monthly usage trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentTransactions = skuTransactions.filter(t => {
      const transactionDate = t.date?.toDate ? t.date.toDate() : new Date(t.date);
      return transactionDate >= sixMonthsAgo;
    });

    const monthlyData = {};
    recentTransactions.forEach(transaction => {
      const date = transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { in: 0, out: 0, net: 0 };
      }
      
      if (transaction.type === 'IN') {
        monthlyData[monthKey].in += transaction.quantity;
        monthlyData[monthKey].net += transaction.quantity;
      } else if (transaction.type === 'OUT') {
        monthlyData[monthKey].out += transaction.quantity;
        monthlyData[monthKey].net -= transaction.quantity;
      }
    });

    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded p-4 border border-blue-200">
            <h5 className="text-blue-700 font-medium">Average Monthly Usage</h5>
            <p className="text-2xl font-bold text-blue-800">
              {chartData.length > 0 
                ? (chartData.reduce((sum, [, data]) => sum + data.out, 0) / chartData.length).toFixed(0)
                : 0
              } {sku.type === 'Material' ? 'sqcm' : 'sheets'}
            </p>
          </div>
          
          <div className="bg-green-50 rounded p-4 border border-green-200">
            <h5 className="text-green-700 font-medium">Stock Turnover</h5>
            <p className="text-2xl font-bold text-green-800">
              {stockMetrics.currentStock > 0 
                ? (stockMetrics.totalUsed / stockMetrics.currentStock).toFixed(1)
                : 0
              }x
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded p-4 border border-yellow-200">
            <h5 className="text-yellow-700 font-medium">Days of Stock</h5>
            <p className="text-2xl font-bold text-yellow-800">
              {(() => {
                const avgDaily = chartData.length > 0 
                  ? chartData.reduce((sum, [, data]) => sum + data.out, 0) / (chartData.length * 30)
                  : 0;
                return avgDaily > 0 ? Math.round(stockMetrics.currentStock / avgDaily) : '∞';
              })()}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded p-4 border border-purple-200">
            <h5 className="text-purple-700 font-medium">Total Transactions</h5>
            <p className="text-2xl font-bold text-purple-800">{skuTransactions.length}</p>
          </div>
        </div>

        {/* Usage Trend Chart */}
        <div className="bg-white border rounded-lg p-4">
          <h5 className="font-medium mb-4 text-gray-700">Usage Trend (Last 6 Months)</h5>
          {chartData.length > 0 ? (
            <div className="space-y-4">
              {chartData.map(([month, data]) => {
                const maxValue = Math.max(...chartData.map(([, d]) => Math.max(d.in, d.out)));
                const inPercent = maxValue > 0 ? (data.in / maxValue) * 100 : 0;
                const outPercent = maxValue > 0 ? (data.out / maxValue) * 100 : 0;
                
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{month}</span>
                      <span className="text-gray-500">
                        In: {data.in} | Out: {data.out} | Net: {data.net > 0 ? '+' : ''}{data.net}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-600 w-8">In:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${inPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-green-600 w-12">{data.in}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-red-600 w-8">Out:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${outPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-red-600 w-12">{data.out}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No usage data available for the last 6 months</p>
            </div>
          )}
        </div>

        {/* Stock Level History */}
        <div className="bg-white border rounded-lg p-4">
          <h5 className="font-medium mb-4 text-gray-700">Stock Efficiency Insights</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-2">Stock Status Distribution</h6>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilization Rate:</span>
                  <span className="font-medium">{stockMetrics.utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Waste/Loss:</span>
                  <span className="font-medium">
                    {(stockMetrics.totalPurchased - stockMetrics.totalUsed - stockMetrics.currentStock).toFixed(2)} {sku.type === 'Material' ? 'sqcm' : 'sheets'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Stock Efficiency:</span>
                  <span className={`font-medium ${
                    stockMetrics.utilizationRate > 80 ? 'text-green-600' : 
                    stockMetrics.utilizationRate > 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stockMetrics.utilizationRate > 80 ? 'Excellent' : 
                     stockMetrics.utilizationRate > 60 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-2">Recommendations</h6>
              <div className="text-sm space-y-1">
                {stockMetrics.currentStock < stockMetrics.minStock && (
                  <p className="text-red-600">• Reorder immediately - below minimum stock</p>
                )}
                {stockMetrics.utilizationRate < 60 && (
                  <p className="text-yellow-600">• Consider reducing order quantities</p>
                )}
                {stockMetrics.utilizationRate > 90 && (
                  <p className="text-green-600">• Efficient usage - consider bulk purchasing</p>
                )}
                {skuTransactions.length === 0 && (
                  <p className="text-blue-600">• No usage recorded - monitor demand</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-gray-900 text-white">
          <h3 className="text-lg font-semibold">
            SKU Details - {sku.skuCode}
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

        {/* SKU Header Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{sku.itemName}</h2>
              <div className="flex items-center mt-1 space-x-3">
                <p className="text-gray-500 text-sm font-mono">{sku.skuCode}</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  sku.type === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {sku.type}
                </span>
                <span className="text-gray-500 text-sm">{sku.company}</span>
              </div>
            </div>
            
            {/* Stock Status and Value */}
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stockMetrics.stockValue)}</div>
              <div className="text-sm text-gray-500">
                {stockMetrics.currentStock} {sku.type === 'Material' ? 'sqcm' : 'sheets'} in stock
              </div>
              <div className="mt-2">
                {(() => {
                  const statusInfo = getSkuStockStatusInfo();
                  return (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  );
                })()}
              </div>
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
              onClick={() => setActiveTab('transactions')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions ({skuTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'transactions' && renderTransactionsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
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

export default SKUDetailsModal;