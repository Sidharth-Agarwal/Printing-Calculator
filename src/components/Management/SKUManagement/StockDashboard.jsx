import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { STOCK_STATUS_CONFIG, ALERT_CONFIG, StockHelpers } from "../../../constants/stockConstants";
import { getStockStatus, getStockStatusInfo } from "../../../constants/materialConstants";
import { getPaperStockStatus, getPaperStockStatusInfo } from "../../../constants/paperContants";
import StockAnalytics from "./StockAnalytics";
import LowStockAlerts from "./LowStockAlerts";

const StockDashboard = ({ onSkuSelect, onAlertSelect }) => {
  const [dashboardData, setDashboardData] = useState({
    materials: [],
    papers: [],
    transactions: [],
    alerts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  // Fetch all dashboard data
  useEffect(() => {
    const unsubscribeFunctions = [];

    // Fetch materials
    const materialsQuery = query(collection(db, "materials"));
    const unsubscribeMaterials = onSnapshot(materialsQuery, (snapshot) => {
      const materialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'Material',
        itemName: doc.data().materialName,
        ...doc.data()
      }));
      
      setDashboardData(prev => ({ ...prev, materials: materialsData }));
    });
    unsubscribeFunctions.push(unsubscribeMaterials);

    // Fetch papers
    const papersQuery = query(collection(db, "papers"));
    const unsubscribePapers = onSnapshot(papersQuery, (snapshot) => {
      const papersData = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'Paper',
        itemName: doc.data().paperName,
        ...doc.data()
      }));
      
      setDashboardData(prev => ({ ...prev, papers: papersData }));
    });
    unsubscribeFunctions.push(unsubscribePapers);

    // Fetch recent transactions
    const transactionsQuery = query(
      collection(db, "stockTransactions"),
      orderBy("date", "desc"),
      limit(20)
    );
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDashboardData(prev => ({ ...prev, transactions: transactionsData }));
      setIsLoading(false);
    });
    unsubscribeFunctions.push(unsubscribeTransactions);

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, []);

  // Process dashboard analytics
  const analytics = React.useMemo(() => {
    const allSkus = [...dashboardData.materials, ...dashboardData.papers];
    
    // Stock status distribution
    const stockStatusCount = {
      IN_STOCK: 0,
      LOW_STOCK: 0,
      OUT_OF_STOCK: 0,
      OVERSTOCK: 0,
      CRITICAL: 0
    };

    // Generate alerts and calculate metrics
    const alerts = [];
    let totalStockValue = 0;
    let totalStockUnits = 0;
    
    allSkus.forEach(sku => {
      const currentStock = parseFloat(sku.currentStock) || 0;
      const minStock = parseFloat(sku.minStockLevel) || 0;
      const maxStock = parseFloat(sku.maxStockLevel) || 999999;
      const unitCost = parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0;
      
      // Calculate stock value
      const stockValue = currentStock * unitCost;
      totalStockValue += stockValue;
      totalStockUnits += currentStock;
      
      // Get stock status
      const status = sku.type === 'Material' 
        ? getStockStatus(currentStock, minStock, maxStock)
        : getPaperStockStatus(currentStock, minStock, maxStock);
      
      // Count status
      if (stockStatusCount[status] !== undefined) {
        stockStatusCount[status]++;
      }
      
      // Generate alerts
      if (status === 'OUT_OF_STOCK') {
        alerts.push({
          id: sku.id,
          skuCode: sku.skuCode,
          itemName: sku.itemName,
          type: sku.type,
          alertType: 'OUT_OF_STOCK',
          severity: 'high',
          currentStock,
          minStock,
          company: sku.company,
          stockValue
        });
      } else if (status === 'LOW_STOCK') {
        alerts.push({
          id: sku.id,
          skuCode: sku.skuCode,
          itemName: sku.itemName,
          type: sku.type,
          alertType: 'LOW_STOCK',
          severity: 'medium',
          currentStock,
          minStock,
          company: sku.company,
          stockValue
        });
      } else if (status === 'OVERSTOCK') {
        alerts.push({
          id: sku.id,
          skuCode: sku.skuCode,
          itemName: sku.itemName,
          type: sku.type,
          alertType: 'OVERSTOCK',
          severity: 'low',
          currentStock,
          maxStock,
          company: sku.company,
          stockValue
        });
      }
    });

    // Sort alerts by severity
    alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // Recent activity metrics
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentTransactions = dashboardData.transactions.filter(t => {
      const transactionDate = t.date?.toDate ? t.date.toDate() : new Date(t.date);
      return transactionDate >= last7Days;
    });

    const activityMetrics = {
      totalTransactions: recentTransactions.length,
      stockInTransactions: recentTransactions.filter(t => t.type === 'IN').length,
      stockOutTransactions: recentTransactions.filter(t => t.type === 'OUT').length,
      adjustmentTransactions: recentTransactions.filter(t => t.type === 'ADJUSTMENT').length,
      totalValue: recentTransactions.reduce((sum, t) => sum + (parseFloat(t.totalCost) || 0), 0)
    };

    // Top vendors by transaction count
    const vendorActivity = {};
    recentTransactions.forEach(t => {
      if (t.vendorName) {
        vendorActivity[t.vendorName] = (vendorActivity[t.vendorName] || 0) + 1;
      }
    });
    
    const topVendors = Object.entries(vendorActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Most active SKUs
    const skuActivity = {};
    recentTransactions.forEach(t => {
      if (t.skuCode) {
        skuActivity[t.skuCode] = (skuActivity[t.skuCode] || 0) + 1;
      }
    });
    
    const mostActiveSkus = Object.entries(skuActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skuCode, count]) => {
        const sku = allSkus.find(s => s.skuCode === skuCode);
        return {
          skuCode,
          itemName: sku?.itemName || 'Unknown',
          type: sku?.type || 'Unknown',
          transactionCount: count
        };
      });

    return {
      totalSkus: allSkus.length,
      stockStatusCount,
      alerts: alerts.slice(0, 10), // Top 10 alerts
      totalStockValue,
      totalStockUnits,
      activityMetrics,
      topVendors,
      mostActiveSkus
    };
  }, [dashboardData]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-IN").format(number || 0);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  // Handle SKU selection
  const handleSkuSelect = (sku) => {
    if (onSkuSelect) {
      onSkuSelect(sku);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Render overview content
  const renderOverviewContent = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total SKUs</h3>
          <p className="text-2xl font-bold text-gray-800">{analytics.totalSkus}</p>
          <p className="text-xs text-gray-500 mt-1">
            {dashboardData.materials.length} Materials • {dashboardData.papers.length} Papers
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 bg-green-50">
          <h3 className="text-sm font-medium text-green-700 mb-2">Stock Value</h3>
          <p className="text-xl font-bold text-green-800">{formatCurrency(analytics.totalStockValue)}</p>
          <p className="text-xs text-green-600 mt-1">Total inventory value</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Activity (7d)</h3>
          <p className="text-2xl font-bold text-blue-800">{analytics.activityMetrics.totalTransactions}</p>
          <p className="text-xs text-blue-600 mt-1">Transactions this week</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-700 mb-2">Low Stock</h3>
          <p className="text-2xl font-bold text-yellow-800">{analytics.stockStatusCount.LOW_STOCK + analytics.stockStatusCount.OUT_OF_STOCK}</p>
          <p className="text-xs text-yellow-600 mt-1">Items need attention</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200 bg-red-50">
          <h3 className="text-sm font-medium text-red-700 mb-2">Critical Alerts</h3>
          <p className="text-2xl font-bold text-red-800">{analytics.alerts.filter(a => a.severity === 'high').length}</p>
          <p className="text-xs text-red-600 mt-1">Immediate action needed</p>
        </div>
      </div>

      {/* Stock Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Stock Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.stockStatusCount).map(([status, count]) => {
              const statusInfo = STOCK_STATUS_CONFIG?.[status] || { 
                label: status, 
                color: 'bg-gray-100 text-gray-800',
                icon: '📦'
              };
              const percentage = analytics.totalSkus > 0 ? (count / analytics.totalSkus) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                    <span className="text-sm text-gray-600">{count} SKUs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          statusInfo.color.includes('green') ? 'bg-green-500' : 
                          statusInfo.color.includes('yellow') ? 'bg-yellow-500' : 
                          statusInfo.color.includes('red') ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity (7 Days)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{analytics.activityMetrics.stockInTransactions}</p>
              <p className="text-sm text-green-600">Stock In</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{analytics.activityMetrics.stockOutTransactions}</p>
              <p className="text-sm text-red-600">Stock Out</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{analytics.activityMetrics.adjustmentTransactions}</p>
              <p className="text-sm text-yellow-600">Adjustments</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-700">{formatCurrency(analytics.activityMetrics.totalValue)}</p>
              <p className="text-sm text-blue-600">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Stock Alerts</h3>
            <button 
              onClick={() => setActiveView('alerts')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {analytics.alerts.slice(0, 5).map((alert) => {
              const alertConfig = ALERT_CONFIG?.[alert.alertType] || {
                color: 'bg-gray-100 border-gray-200',
                icon: '⚠️'
              };
              
              return (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm ${alertConfig.color}`}
                  onClick={() => handleSkuSelect(alert)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{alert.itemName}</p>
                      <p className="text-xs opacity-75 font-mono">{alert.skuCode}</p>
                      <p className="text-xs opacity-75">{alert.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {alert.currentStock} {alert.type === 'Material' ? 'sqcm' : 'sheets'}
                      </p>
                      <p className="text-xs opacity-75">
                        {alert.alertType === 'OVERSTOCK' ? 'Max' : 'Min'}: {alert.minStock || alert.maxStock}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {analytics.alerts.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-sm">No active alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Active SKUs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Most Active SKUs (7d)</h3>
          <div className="space-y-3">
            {analytics.mostActiveSkus.map((sku, index) => (
              <div 
                key={sku.skuCode} 
                className="flex justify-between items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSkuSelect(sku)}
              >
                <div>
                  <p className="font-medium text-sm">{sku.itemName}</p>
                  <p className="text-xs text-gray-500 font-mono">{sku.skuCode}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    sku.type === 'Material' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {sku.transactionCount} txns
                  </span>
                </div>
              </div>
            ))}
            
            {analytics.mostActiveSkus.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Vendors (7d)</h3>
          <div className="space-y-3">
            {analytics.topVendors.map(([vendorName, count], index) => (
              <div key={vendorName} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                <div>
                  <p className="font-medium text-sm">{vendorName}</p>
                  <p className="text-xs text-gray-500">Vendor</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                    {count} txns
                  </span>
                </div>
              </div>
            ))}
            
            {analytics.topVendors.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No vendor activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View All Transactions
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-700">Date</th>
                <th className="text-left py-2 font-medium text-gray-700">SKU</th>
                <th className="text-left py-2 font-medium text-gray-700">Type</th>
                <th className="text-left py-2 font-medium text-gray-700">Quantity</th>
                <th className="text-left py-2 font-medium text-gray-700">Reference</th>
                <th className="text-left py-2 font-medium text-gray-700">Value</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.transactions.slice(0, 8).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2">{formatDate(transaction.date)}</td>
                  <td className="py-2">
                    <div className="font-mono text-xs">{transaction.skuCode}</div>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'IN' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'OUT' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={transaction.type === 'OUT' ? 'text-red-600' : 'text-green-600'}>
                      {transaction.type === 'OUT' ? '-' : '+'}{transaction.quantity}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="truncate max-w-32" title={transaction.reference}>
                      {transaction.reference || '-'}
                    </div>
                  </td>
                  <td className="py-2">{formatCurrency(transaction.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {dashboardData.transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No recent transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render alerts content
  const renderAlertsContent = () => (
    <div>
      <LowStockAlerts embedded={false} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Stock Dashboard</h2>
          <p className="text-gray-600 mt-1">Comprehensive overview of your inventory status and analytics</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            <button
              onClick={() => setActiveView('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeView === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeView === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => setActiveView('alerts')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeView === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚨 Alerts ({analytics.alerts.filter(a => a.severity === 'high').length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeView === 'overview' && renderOverviewContent()}
      {activeView === 'analytics' && <StockAnalytics />}
      {activeView === 'alerts' && renderAlertsContent()}
    </div>
  );
};

export default StockDashboard;