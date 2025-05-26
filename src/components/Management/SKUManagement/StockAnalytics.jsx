import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getStockStatus } from "../../../constants/materialConstants";
import { getPaperStockStatus } from "../../../constants/paperContants";
import { StockHelpers } from "../../../constants/stockConstants";

const StockAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    materials: [],
    papers: [],
    transactions: [],
    vendors: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Fetch all data for analytics
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
      setAnalyticsData(prev => ({ ...prev, materials: materialsData }));
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
      setAnalyticsData(prev => ({ ...prev, papers: papersData }));
    });
    unsubscribeFunctions.push(unsubscribePapers);

    // Fetch transactions
    const transactionsQuery = query(
      collection(db, "stockTransactions"),
      orderBy("date", "desc")
    );
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnalyticsData(prev => ({ ...prev, transactions: transactionsData }));
      setIsLoading(false);
    });
    unsubscribeFunctions.push(unsubscribeTransactions);

    // Fetch vendors
    const vendorsQuery = query(collection(db, "vendors"));
    const unsubscribeVendors = onSnapshot(vendorsQuery, (snapshot) => {
      const vendorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnalyticsData(prev => ({ ...prev, vendors: vendorsData }));
    });
    unsubscribeFunctions.push(unsubscribeVendors);

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }, []);

  // Calculate comprehensive analytics
  const analytics = React.useMemo(() => {
    const allSkus = [...analyticsData.materials, ...analyticsData.papers];
    
    // Time range filtering
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredTransactions = analyticsData.transactions.filter(t => {
      const transactionDate = t.date?.toDate ? t.date.toDate() : new Date(t.date);
      return transactionDate >= startDate;
    });

    // Stock Value Analysis
    const stockAnalysis = {
      totalValue: 0,
      materialValue: 0,
      paperValue: 0,
      averageUnitValue: 0,
      highValueItems: [],
      lowValueItems: []
    };

    // Stock Status Distribution
    const statusDistribution = {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      overstock: 0
    };

    // Vendor Analysis
    const vendorAnalysis = {};
    
    // Process each SKU
    allSkus.forEach(sku => {
      const currentStock = parseFloat(sku.currentStock) || 0;
      const minStock = parseFloat(sku.minStockLevel) || 0;
      const maxStock = parseFloat(sku.maxStockLevel) || 999999;
      const unitCost = parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0;
      const stockValue = currentStock * unitCost;
      
      // Stock value tracking
      stockAnalysis.totalValue += stockValue;
      if (sku.type === 'Material') {
        stockAnalysis.materialValue += stockValue;
      } else {
        stockAnalysis.paperValue += stockValue;
      }
      
      // High/Low value items
      if (stockValue > 100000) {
        stockAnalysis.highValueItems.push({
          ...sku,
          stockValue,
          currentStock
        });
      } else if (stockValue < 5000 && currentStock > 0) {
        stockAnalysis.lowValueItems.push({
          ...sku,
          stockValue,
          currentStock
        });
      }
      
      // Stock status
      const status = sku.type === 'Material' 
        ? getStockStatus(currentStock, minStock, maxStock)
        : getPaperStockStatus(currentStock, minStock, maxStock);
        
      switch (status) {
        case 'IN_STOCK':
          statusDistribution.inStock++;
          break;
        case 'LOW_STOCK':
          statusDistribution.lowStock++;
          break;
        case 'OUT_OF_STOCK':
          statusDistribution.outOfStock++;
          break;
        case 'OVERSTOCK':
          statusDistribution.overstock++;
          break;
      }
      
      // Vendor analysis
      if (sku.company) {
        if (!vendorAnalysis[sku.company]) {
          vendorAnalysis[sku.company] = {
            name: sku.company,
            skuCount: 0,
            totalValue: 0,
            avgValue: 0,
            materials: 0,
            papers: 0
          };
        }
        vendorAnalysis[sku.company].skuCount++;
        vendorAnalysis[sku.company].totalValue += stockValue;
        if (sku.type === 'Material') {
          vendorAnalysis[sku.company].materials++;
        } else {
          vendorAnalysis[sku.company].papers++;
        }
      }
    });

    // Calculate averages
    stockAnalysis.averageUnitValue = allSkus.length > 0 ? stockAnalysis.totalValue / allSkus.length : 0;
    
    // Finish vendor analysis calculations
    Object.values(vendorAnalysis).forEach(vendor => {
      vendor.avgValue = vendor.skuCount > 0 ? vendor.totalValue / vendor.skuCount : 0;
    });

    // Transaction Analysis
    const transactionAnalysis = {
      totalTransactions: filteredTransactions.length,
      stockIn: filteredTransactions.filter(t => t.type === 'IN').length,
      stockOut: filteredTransactions.filter(t => t.type === 'OUT').length,
      adjustments: filteredTransactions.filter(t => t.type === 'ADJUSTMENT').length,
      totalValue: filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.totalCost) || 0), 0),
      avgTransactionValue: 0,
      dailyAverage: 0
    };

    transactionAnalysis.avgTransactionValue = transactionAnalysis.totalTransactions > 0 
      ? transactionAnalysis.totalValue / transactionAnalysis.totalTransactions : 0;
    
    const daysInRange = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
    transactionAnalysis.dailyAverage = daysInRange > 0 ? transactionAnalysis.totalTransactions / daysInRange : 0;

    // Usage Patterns
    const usagePatterns = {
      topUsedSkus: [],
      leastUsedSkus: [],
      fastMovingItems: [],
      slowMovingItems: []
    };

    // Calculate usage for each SKU
    const skuUsage = {};
    filteredTransactions.forEach(transaction => {
      if (transaction.skuCode) {
        if (!skuUsage[transaction.skuCode]) {
          skuUsage[transaction.skuCode] = {
            skuCode: transaction.skuCode,
            itemName: transaction.itemName || 'Unknown',
            type: transaction.itemType || 'Unknown',
            totalIn: 0,
            totalOut: 0,
            netMovement: 0,
            transactionCount: 0,
            totalValue: 0
          };
        }
        
        skuUsage[transaction.skuCode].transactionCount++;
        skuUsage[transaction.skuCode].totalValue += parseFloat(transaction.totalCost) || 0;
        
        if (transaction.type === 'IN') {
          skuUsage[transaction.skuCode].totalIn += transaction.quantity;
          skuUsage[transaction.skuCode].netMovement += transaction.quantity;
        } else if (transaction.type === 'OUT') {
          skuUsage[transaction.skuCode].totalOut += transaction.quantity;
          skuUsage[transaction.skuCode].netMovement -= transaction.quantity;
        }
      }
    });

    // Sort usage patterns
    const sortedByUsage = Object.values(skuUsage).sort((a, b) => b.totalOut - a.totalOut);
    const sortedByActivity = Object.values(skuUsage).sort((a, b) => b.transactionCount - a.transactionCount);
    
    usagePatterns.topUsedSkus = sortedByUsage.slice(0, 10);
    usagePatterns.leastUsedSkus = sortedByUsage.slice(-10).reverse();
    usagePatterns.fastMovingItems = sortedByActivity.slice(0, 10);
    usagePatterns.slowMovingItems = sortedByActivity.slice(-10).reverse();

    // Monthly trends
    const monthlyTrends = {};
    filteredTransactions.forEach(transaction => {
      const date = transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {
          month: monthKey,
          transactions: 0,
          stockIn: 0,
          stockOut: 0,
          value: 0
        };
      }
      
      monthlyTrends[monthKey].transactions++;
      monthlyTrends[monthKey].value += parseFloat(transaction.totalCost) || 0;
      
      if (transaction.type === 'IN') {
        monthlyTrends[monthKey].stockIn++;
      } else if (transaction.type === 'OUT') {
        monthlyTrends[monthKey].stockOut++;
      }
    });

    const sortedTrends = Object.values(monthlyTrends).sort((a, b) => a.month.localeCompare(b.month));

    return {
      stockAnalysis,
      statusDistribution,
      vendorAnalysis: Object.values(vendorAnalysis).sort((a, b) => b.totalValue - a.totalValue),
      transactionAnalysis,
      usagePatterns,
      monthlyTrends: sortedTrends,
      summary: {
        totalSkus: allSkus.length,
        totalVendors: Object.keys(vendorAnalysis).length,
        alertableItems: statusDistribution.lowStock + statusDistribution.outOfStock,
        efficiencyScore: Math.round((statusDistribution.inStock / allSkus.length) * 100) || 0
      }
    };
  }, [analyticsData, timeRange]);

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

  // Format percentage
  const formatPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Render overview metrics
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Stock Value</h3>
          <p className="text-3xl font-bold">{formatCurrency(analytics.stockAnalysis.totalValue)}</p>
          <p className="text-blue-100 text-sm mt-2">Across {analytics.summary.totalSkus} SKUs</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Efficiency Score</h3>
          <p className="text-3xl font-bold">{analytics.summary.efficiencyScore}%</p>
          <p className="text-green-100 text-sm mt-2">Stock management efficiency</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Active Vendors</h3>
          <p className="text-3xl font-bold">{analytics.summary.totalVendors}</p>
          <p className="text-purple-100 text-sm mt-2">Supplier relationships</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Items Need Attention</h3>
          <p className="text-3xl font-bold">{analytics.summary.alertableItems}</p>
          <p className="text-orange-100 text-sm mt-2">Low/out of stock items</p>
        </div>
      </div>

      {/* Stock Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Stock Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const percentage = (count / analytics.summary.totalSkus) * 100;
              const colors = {
                inStock: 'bg-green-500',
                lowStock: 'bg-yellow-500',
                outOfStock: 'bg-red-500',
                overstock: 'bg-purple-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${colors[status]}`}></div>
                    <span className="capitalize font-medium">{status.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[status]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{count}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Value Distribution</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">Materials</span>
              <div className="text-right">
                <p className="font-bold text-blue-600">{formatCurrency(analytics.stockAnalysis.materialValue)}</p>
                <p className="text-xs text-blue-500">
                  {formatPercentage(analytics.stockAnalysis.materialValue, analytics.stockAnalysis.totalValue)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Papers</span>
              <div className="text-right">
                <p className="font-bold text-green-600">{formatCurrency(analytics.stockAnalysis.paperValue)}</p>
                <p className="text-xs text-green-500">
                  {formatPercentage(analytics.stockAnalysis.paperValue, analytics.stockAnalysis.totalValue)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Average per SKU</span>
              <div className="text-right">
                <p className="font-bold text-gray-600">{formatCurrency(analytics.stockAnalysis.averageUnitValue)}</p>
                <p className="text-xs text-gray-500">Per item value</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render transaction analytics
  const renderTransactionAnalytics = () => (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <h4 className="text-gray-600 text-sm">Total Transactions</h4>
          <p className="text-2xl font-bold text-gray-800">{analytics.transactionAnalysis.totalTransactions}</p>
          <p className="text-xs text-gray-500">{analytics.transactionAnalysis.dailyAverage.toFixed(1)}/day avg</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <h4 className="text-gray-600 text-sm">Stock In</h4>
          <p className="text-2xl font-bold text-green-600">{analytics.transactionAnalysis.stockIn}</p>
          <p className="text-xs text-green-500">
            {formatPercentage(analytics.transactionAnalysis.stockIn, analytics.transactionAnalysis.totalTransactions)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <h4 className="text-gray-600 text-sm">Stock Out</h4>
          <p className="text-2xl font-bold text-red-600">{analytics.transactionAnalysis.stockOut}</p>
          <p className="text-xs text-red-500">
            {formatPercentage(analytics.transactionAnalysis.stockOut, analytics.transactionAnalysis.totalTransactions)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <h4 className="text-gray-600 text-sm">Transaction Value</h4>
          <p className="text-xl font-bold text-purple-600">{formatCurrency(analytics.transactionAnalysis.totalValue)}</p>
          <p className="text-xs text-purple-500">
            {formatCurrency(analytics.transactionAnalysis.avgTransactionValue)} avg
          </p>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Monthly Transaction Trends</h3>
        <div className="space-y-4">
          {analytics.monthlyTrends.slice(-6).map((month) => {
            const maxTransactions = Math.max(...analytics.monthlyTrends.map(m => m.transactions));
            const transactionPercentage = maxTransactions > 0 ? (month.transactions / maxTransactions) * 100 : 0;
            
            return (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{month.month}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{month.transactions} transactions</span>
                    <span className="text-xs text-gray-500 ml-2">{formatCurrency(month.value)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${transactionPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 w-16 text-right">
                    In: {month.stockIn} | Out: {month.stockOut}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render usage patterns
  const renderUsagePatterns = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Used SKUs */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Most Used SKUs ({timeRange})</h3>
        <div className="space-y-3">
          {analytics.usagePatterns.topUsedSkus.slice(0, 8).map((sku, index) => (
            <div key={sku.skuCode} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{sku.itemName}</p>
                  <p className="text-xs text-gray-500 font-mono">{sku.skuCode}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{sku.totalOut} used</p>
                <p className="text-xs text-gray-500">{sku.transactionCount} txns</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fast Moving Items */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Fast Moving Items ({timeRange})</h3>
        <div className="space-y-3">
          {analytics.usagePatterns.fastMovingItems.slice(0, 8).map((sku, index) => (
            <div key={sku.skuCode} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{sku.itemName}</p>
                  <p className="text-xs text-gray-500 font-mono">{sku.skuCode}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{sku.transactionCount} txns</p>
                <p className="text-xs text-gray-500">{formatCurrency(sku.totalValue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render vendor analytics
  const renderVendorAnalytics = () => (
    <div className="space-y-6">
      {/* Top Vendors by Value */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Top Vendors by Stock Value</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium">Vendor</th>
                <th className="text-left py-2 font-medium">SKUs</th>
                <th className="text-left py-2 font-medium">Materials</th>
                <th className="text-left py-2 font-medium">Papers</th>
                <th className="text-left py-2 font-medium">Total Value</th>
                <th className="text-left py-2 font-medium">Avg Value</th>
              </tr>
            </thead>
            <tbody>
              {analytics.vendorAnalysis.slice(0, 10).map((vendor, index) => (
                <tr key={vendor.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium">{vendor.name}</span>
                    </div>
                  </td>
                  <td className="py-2 font-medium">{vendor.skuCount}</td>
                  <td className="py-2">{vendor.materials}</td>
                  <td className="py-2">{vendor.papers}</td>
                  <td className="py-2 font-medium text-green-600">{formatCurrency(vendor.totalValue)}</td>
                  <td className="py-2">{formatCurrency(vendor.avgValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Stock Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into your inventory performance</p>
          </div>
          
          <div className="flex space-x-4">
            {/* Time Range Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            
            {/* Metric Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="transactions">Transactions</option>
                <option value="usage">Usage Patterns</option>
                <option value="vendors">Vendor Analysis</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      {selectedMetric === 'overview' && renderOverview()}
      {selectedMetric === 'transactions' && renderTransactionAnalytics()}
      {selectedMetric === 'usage' && renderUsagePatterns()}
      {selectedMetric === 'vendors' && renderVendorAnalytics()}
    </div>
  );
};

export default StockAnalytics;