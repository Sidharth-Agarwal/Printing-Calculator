import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getStockStatus, getStockStatusInfo } from "../../../constants/materialConstants";
import { getPaperStockStatus, getPaperStockStatusInfo } from "../../../constants/paperContants";
import { ALERT_CONFIG, ALERT_TYPES, StockHelpers } from "../../../constants/stockConstants";

const LowStockAlerts = ({ embedded = false, maxAlerts = null }) => {
  const [alerts, setAlerts] = useState([]);
  const [allSkus, setAllSkus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    status: 'active'
  });
  const [sortBy, setSortBy] = useState('severity');
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Fetch all SKUs to generate alerts
  useEffect(() => {
    const fetchAllSkus = () => {
      setIsLoading(true);
      const allSkusData = [];
      let materialsLoaded = false;
      let papersLoaded = false;

      // Fetch materials
      const materialsQuery = query(collection(db, "materials"), orderBy("materialName"));
      const unsubscribeMaterials = onSnapshot(materialsQuery, (snapshot) => {
        const materials = snapshot.docs.map(doc => ({
          id: doc.id,
          type: 'Material',
          itemName: doc.data().materialName,
          company: doc.data().company,
          ...doc.data()
        }));
        
        const filteredSkus = allSkusData.filter(sku => sku.type !== 'Material');
        allSkusData.splice(0, allSkusData.length, ...filteredSkus, ...materials);
        
        materialsLoaded = true;
        if (materialsLoaded && papersLoaded) {
          setAllSkus([...allSkusData]);
          generateAlerts([...allSkusData]);
        }
      });

      // Fetch papers
      const papersQuery = query(collection(db, "papers"), orderBy("paperName"));
      const unsubscribePapers = onSnapshot(papersQuery, (snapshot) => {
        const papers = snapshot.docs.map(doc => ({
          id: doc.id,
          type: 'Paper',
          itemName: doc.data().paperName,
          company: doc.data().company,
          ...doc.data()
        }));
        
        const filteredSkus = allSkusData.filter(sku => sku.type !== 'Paper');
        allSkusData.splice(0, allSkusData.length, ...filteredSkus, ...papers);
        
        papersLoaded = true;
        if (materialsLoaded && papersLoaded) {
          setAllSkus([...allSkusData]);
          generateAlerts([...allSkusData]);
        }
      });

      return () => {
        unsubscribeMaterials();
        unsubscribePapers();
      };
    };

    fetchAllSkus();
  }, []);

  // Generate alerts from SKU data
  const generateAlerts = (skusData) => {
    const generatedAlerts = [];
    
    skusData.forEach(sku => {
      const currentStock = parseFloat(sku.currentStock) || 0;
      const minStock = parseFloat(sku.minStockLevel) || 0;
      const maxStock = parseFloat(sku.maxStockLevel) || 999999;
      const unitCost = parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0;
      
      // Get stock status
      const status = sku.type === 'Material' 
        ? getStockStatus(currentStock, minStock, maxStock)
        : getPaperStockStatus(currentStock, minStock, maxStock);
      
      // Generate alert based on status
      let alertType = null;
      let severity = 'low';
      let message = '';
      
      switch (status) {
        case 'OUT_OF_STOCK':
          alertType = ALERT_TYPES.OUT_OF_STOCK;
          severity = 'high';
          message = `Completely out of stock. Immediate restocking required.`;
          break;
        case 'LOW_STOCK':
          alertType = ALERT_TYPES.LOW_STOCK;
          severity = 'medium';
          const daysRemaining = StockHelpers.calculateDaysOfStock(currentStock, sku.averageDailyUsage || 1);
          message = `Stock running low. Approximately ${daysRemaining} days remaining.`;
          break;
        case 'OVERSTOCK':
          alertType = ALERT_TYPES.OVERSTOCK;
          severity = 'low';
          const excessStock = currentStock - maxStock;
          message = `${excessStock} ${sku.type === 'Material' ? 'sqcm' : 'sheets'} above maximum level.`;
          break;
      }
      
      // Check for other alert conditions
      const stockValue = currentStock * unitCost;
      
      // High value low stock
      if (status === 'LOW_STOCK' && stockValue > 50000) {
        alertType = ALERT_TYPES.HIGH_VALUE_LOW_STOCK;
        severity = 'high';
        message = `High-value item (₹${stockValue.toLocaleString()}) running low.`;
      }
      
      // No activity alerts (if no recent transactions)
      const lastStockUpdate = sku.lastStockUpdate?.toDate ? sku.lastStockUpdate.toDate() : new Date(sku.lastStockUpdate || 0);
      const daysSinceUpdate = Math.floor((new Date() - lastStockUpdate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate > 90 && currentStock > 0) {
        generatedAlerts.push({
          id: `${sku.id}_no_activity`,
          skuCode: sku.skuCode,
          itemName: sku.itemName,
          type: sku.type,
          alertType: ALERT_TYPES.NO_RECENT_ACTIVITY,
          severity: 'low',
          currentStock,
          minStock,
          maxStock,
          stockValue,
          company: sku.company,
          message: `No stock activity for ${daysSinceUpdate} days. Consider reviewing demand.`,
          createdAt: new Date(),
          lastUpdated: lastStockUpdate,
          actionRequired: 'Review demand patterns and consider liquidation',
          suggestedAction: 'REVIEW_DEMAND'
        });
      }
      
      // Create main alert if conditions are met
      if (alertType && !dismissedAlerts.has(`${sku.id}_${alertType}`)) {
        const alertConfig = ALERT_CONFIG[alertType] || {};
        
        generatedAlerts.push({
          id: `${sku.id}_${alertType}`,
          skuCode: sku.skuCode,
          itemName: sku.itemName,
          type: sku.type,
          alertType,
          severity,
          currentStock,
          minStock,
          maxStock,
          stockValue,
          company: sku.company,
          message,
          createdAt: new Date(),
          actionRequired: alertConfig.action || 'Review stock levels',
          suggestedAction: alertConfig.suggestedAction || 'REORDER',
          priority: alertConfig.priority || 1
        });
      }
    });
    
    // Sort alerts by severity and priority
    generatedAlerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      return (b.priority || 1) - (a.priority || 1);
    });
    
    setAlerts(generatedAlerts);
    setIsLoading(false);
  };

  // Filter and sort alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
    if (filters.type !== 'all' && alert.type !== filters.type) return false;
    return true;
  });

  // Apply maxAlerts limit for embedded view
  const displayAlerts = maxAlerts ? filteredAlerts.slice(0, maxAlerts) : filteredAlerts;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Handle alert dismissal
  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Handle bulk actions
  const handleBulkDismiss = (severity) => {
    const alertIds = filteredAlerts
      .filter(alert => severity === 'all' || alert.severity === severity)
      .map(alert => alert.id);
    
    setDismissedAlerts(prev => new Set([...prev, ...alertIds]));
    setAlerts(prev => prev.filter(alert => !alertIds.includes(alert.id)));
  };

  // Get alert icon and color
  const getAlertDisplay = (alert) => {
    const config = ALERT_CONFIG[alert.alertType] || {};
    const severityColors = {
      high: 'bg-red-50 border-red-200 text-red-800',
      medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      low: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    
    return {
      icon: config.icon || '⚠️',
      color: severityColors[alert.severity] || severityColors.low,
      bgColor: config.color || 'bg-gray-100 text-gray-800'
    };
  };

  if (isLoading) {
    return (
      <div className={`${embedded ? '' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'}`}>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Embedded view for dashboard
  if (embedded) {
    return (
      <div className="space-y-3">
        {displayAlerts.length > 0 ? (
          displayAlerts.map((alert) => {
            const display = getAlertDisplay(alert);
            
            return (
              <div key={alert.id} className={`p-3 rounded-lg border ${display.color}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{display.icon}</span>
                      <span className="font-medium text-sm">{alert.itemName}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${display.bgColor}`}>
                        {alert.alertType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs opacity-75 font-mono">{alert.skuCode} • {alert.company}</p>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs opacity-75">
                        Stock: {alert.currentStock} {alert.type === 'Material' ? 'sqcm' : 'sheets'}
                      </span>
                      <span className="text-xs font-medium">
                        {formatCurrency(alert.stockValue)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="ml-2 text-xs opacity-50 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm">No active alerts</p>
          </div>
        )}
      </div>
    );
  }

  // Full page view
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Stock Alerts</h2>
            <p className="text-gray-600 mt-1">Monitor and manage stock level alerts across all SKUs</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkDismiss('low')}
              className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
            >
              Dismiss Low Priority
            </button>
            <button
              onClick={() => handleBulkDismiss('all')}
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
            >
              Dismiss All
            </button>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {filteredAlerts.filter(a => a.severity === 'high').length}
            </p>
            <p className="text-red-600 text-sm">Critical Alerts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {filteredAlerts.filter(a => a.severity === 'medium').length}
            </p>
            <p className="text-yellow-600 text-sm">Medium Priority</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {filteredAlerts.filter(a => a.severity === 'low').length}
            </p>
            <p className="text-blue-600 text-sm">Low Priority</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(filteredAlerts.reduce((sum, alert) => sum + alert.stockValue, 0))}
            </p>
            <p className="text-green-600 text-sm">Total Alert Value</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Material">Materials</option>
              <option value="Paper">Papers</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="severity">Severity</option>
              <option value="value">Stock Value</option>
              <option value="created">Date Created</option>
              <option value="name">Item Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4">
        {displayAlerts.length > 0 ? (
          <div className="space-y-4">
            {displayAlerts.map((alert) => {
              const display = getAlertDisplay(alert);
              
              return (
                <div key={alert.id} className={`p-4 rounded-lg border ${display.color}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{display.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{alert.itemName}</h3>
                          <p className="text-sm opacity-75 font-mono">{alert.skuCode}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${display.bgColor}`}>
                          {alert.alertType.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${{
                          high: 'bg-red-100 text-red-800',
                          medium: 'bg-yellow-100 text-yellow-800',
                          low: 'bg-blue-100 text-blue-800'
                        }[alert.severity]}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{alert.message}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Stock</p>
                          <p className="font-medium">
                            {alert.currentStock} {alert.type === 'Material' ? 'sqcm' : 'sheets'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Min Stock</p>
                          <p className="font-medium">
                            {alert.minStock} {alert.type === 'Material' ? 'sqcm' : 'sheets'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Stock Value</p>
                          <p className="font-medium text-green-600">{formatCurrency(alert.stockValue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Vendor</p>
                          <p className="font-medium">{alert.company}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                        <p className="text-sm font-medium text-gray-700 mb-1">Recommended Action:</p>
                        <p className="text-sm text-gray-600">{alert.actionRequired}</p>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                      >
                        Dismiss
                      </button>
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Take Action
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
            <p>All your stock levels are within normal ranges.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlerts;