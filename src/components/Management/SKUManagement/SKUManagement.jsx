import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import DisplaySKUTable from "./DisplaySKUTable";
import SKUDetailsModal from "./SKUDetailsModal";
import { useAuth } from "../../Login/AuthContext";
import { getStockStatus, getStockStatusInfo } from "../../../constants/materialConstants";
import { getPaperStockStatus, getPaperStockStatusInfo } from "../../../constants/paperContants";

const SKUManagement = () => {
  const { userRole } = useAuth();
  const [allSkus, setAllSkus] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced SKU statistics
  const [skuStats, setSkuStats] = useState({
    totalSkus: 0,
    materialSkus: 0,
    paperSkus: 0,
    inStockItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    overstockItems: 0,
    totalStockValue: 0,
    totalStockUnits: 0,
    totalTransactions: 0,
    uniqueVendors: 0,
    averageStockValue: 0,
    criticalAlerts: 0
  });

  // Low stock alerts
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    const fetchAllData = () => {
      setIsLoading(true);
      const allSkusData = [];
      let materialsLoaded = false;
      let papersLoaded = false;
      let vendorsLoaded = false;
      let transactionsLoaded = false;

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
        
        // Update allSkus array
        const filteredSkus = allSkusData.filter(sku => sku.type !== 'Material');
        allSkusData.splice(0, allSkusData.length, ...filteredSkus, ...materials);
        
        materialsLoaded = true;
        if (materialsLoaded && papersLoaded) {
          setAllSkus([...allSkusData]);
          calculateStatistics([...allSkusData]);
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
        
        // Update allSkus array
        const filteredSkus = allSkusData.filter(sku => sku.type !== 'Paper');
        allSkusData.splice(0, allSkusData.length, ...filteredSkus, ...papers);
        
        papersLoaded = true;
        if (materialsLoaded && papersLoaded) {
          setAllSkus([...allSkusData]);
          calculateStatistics([...allSkusData]);
        }
      });

      // Fetch vendors
      const vendorsQuery = query(collection(db, "vendors"));
      const unsubscribeVendors = onSnapshot(vendorsQuery, (snapshot) => {
        const vendorsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVendors(vendorsData);
        vendorsLoaded = true;
      });

      // Fetch stock transactions
      const transactionsQuery = query(
        collection(db, "stockTransactions"), 
        orderBy("date", "desc")
      );
      const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStockTransactions(transactionsData);
        transactionsLoaded = true;
        
        if (materialsLoaded && papersLoaded && vendorsLoaded && transactionsLoaded) {
          setIsLoading(false);
        }
      });

      return () => {
        unsubscribeMaterials();
        unsubscribePapers();
        unsubscribeVendors();
        unsubscribeTransactions();
      };
    };

    fetchAllData();
  }, []);

  // Calculate comprehensive statistics
  const calculateStatistics = (skusData) => {
    if (!skusData.length) return;

    let totalStockValue = 0;
    let totalStockUnits = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let overstockCount = 0;
    let criticalAlerts = 0;
    const alerts = [];
    const uniqueVendorsSet = new Set();

    skusData.forEach(sku => {
      const currentStock = parseFloat(sku.currentStock) || 0;
      const minStock = parseFloat(sku.minStockLevel) || 0;
      const maxStock = parseFloat(sku.maxStockLevel) || 999999;
      const unitCost = parseFloat(sku.finalCostPerUnit || sku.finalRate) || 0;
      
      // Calculate stock value
      totalStockValue += (currentStock * unitCost);
      totalStockUnits += currentStock;
      
      // Add vendor to unique set
      if (sku.company) {
        uniqueVendorsSet.add(sku.company);
      }
      
      // Determine stock status
      let stockStatus;
      if (sku.type === 'Material') {
        stockStatus = getStockStatus(currentStock, minStock, maxStock);
      } else {
        stockStatus = getPaperStockStatus(currentStock, minStock, maxStock);
      }
      
      // Count by status
      switch (stockStatus) {
        case 'IN_STOCK':
          inStockCount++;
          break;
        case 'LOW_STOCK':
          lowStockCount++;
          alerts.push({
            id: sku.id,
            skuCode: sku.skuCode,
            itemName: sku.itemName,
            type: sku.type,
            currentStock,
            minStock,
            alertType: 'LOW_STOCK',
            severity: 'medium'
          });
          break;
        case 'OUT_OF_STOCK':
          outOfStockCount++;
          criticalAlerts++;
          alerts.push({
            id: sku.id,
            skuCode: sku.skuCode,
            itemName: sku.itemName,
            type: sku.type,
            currentStock,
            minStock,
            alertType: 'OUT_OF_STOCK',
            severity: 'high'
          });
          break;
        case 'OVERSTOCK':
          overstockCount++;
          alerts.push({
            id: sku.id,
            skuCode: sku.skuCode,
            itemName: sku.itemName,
            type: sku.type,
            currentStock,
            maxStock,
            alertType: 'OVERSTOCK',
            severity: 'low'
          });
          break;
      }
    });

    const materialCount = skusData.filter(sku => sku.type === 'Material').length;
    const paperCount = skusData.filter(sku => sku.type === 'Paper').length;
    const averageStockValue = skusData.length > 0 ? totalStockValue / skusData.length : 0;

    setSkuStats({
      totalSkus: skusData.length,
      materialSkus: materialCount,
      paperSkus: paperCount,
      inStockItems: inStockCount,
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount,
      overstockItems: overstockCount,
      totalStockValue,
      totalStockUnits,
      totalTransactions: stockTransactions.length,
      uniqueVendors: uniqueVendorsSet.size,
      averageStockValue,
      criticalAlerts
    });

    setLowStockAlerts(alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }));
  };

  // Update statistics when transactions change
  useEffect(() => {
    if (allSkus.length > 0) {
      calculateStatistics(allSkus);
    }
  }, [stockTransactions]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format large numbers
  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-IN").format(number || 0);
  };

  // Get stock status info for any SKU
  const getSkuStockStatusInfo = (sku) => {
    const currentStock = parseFloat(sku.currentStock) || 0;
    const minStock = parseFloat(sku.minStockLevel) || 0;
    const maxStock = parseFloat(sku.maxStockLevel) || 999999;
    
    if (sku.type === 'Material') {
      const status = getStockStatus(currentStock, minStock, maxStock);
      return getStockStatusInfo(status);
    } else {
      const status = getPaperStockStatus(currentStock, minStock, maxStock);
      return getPaperStockStatusInfo(status);
    }
  };

  // Handle SKU selection
  const handleSkuSelect = (sku) => {
    setSelectedSku(sku);
  };

  // Close SKU details modal
  const handleCloseSkuModal = () => {
    setSelectedSku(null);
  };

  // Check if user has access
  const isAdmin = userRole === "admin";
  const hasAccess = isAdmin || userRole === "staff";

  // Redirect non-authorized users
  if (!hasAccess) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access SKU management.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">SKU Management</h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Render overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total SKUs</h2>
          <p className="text-2xl font-bold text-gray-800">{skuStats.totalSkus}</p>
          <p className="text-xs text-gray-500 mt-1">All items tracked</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-blue-50">
          <h2 className="text-sm font-medium text-blue-700 mb-2">Materials</h2>
          <p className="text-2xl font-bold text-blue-800">{skuStats.materialSkus}</p>
          <p className="text-xs text-blue-600 mt-1">
            {((skuStats.materialSkus / skuStats.totalSkus) * 100 || 0).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 bg-green-50">
          <h2 className="text-sm font-medium text-green-700 mb-2">Papers</h2>
          <p className="text-2xl font-bold text-green-800">{skuStats.paperSkus}</p>
          <p className="text-xs text-green-600 mt-1">
            {((skuStats.paperSkus / skuStats.totalSkus) * 100 || 0).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200 bg-purple-50">
          <h2 className="text-sm font-medium text-purple-700 mb-2">Stock Value</h2>
          <p className="text-lg font-bold text-purple-800">{formatCurrency(skuStats.totalStockValue)}</p>
          <p className="text-xs text-purple-600 mt-1">Total inventory value</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-200 bg-indigo-50">
          <h2 className="text-sm font-medium text-indigo-700 mb-2">Vendors</h2>
          <p className="text-2xl font-bold text-indigo-800">{skuStats.uniqueVendors}</p>
          <p className="text-xs text-indigo-600 mt-1">Active suppliers</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200 bg-orange-50">
          <h2 className="text-sm font-medium text-orange-700 mb-2">Avg Value</h2>
          <p className="text-lg font-bold text-orange-800">{formatCurrency(skuStats.averageStockValue)}</p>
          <p className="text-xs text-orange-600 mt-1">Per SKU</p>
        </div>
      </div>

      {/* Stock Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">In Stock</p>
              <p className="text-2xl font-bold text-green-800">{skuStats.inStockItems}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            {((skuStats.inStockItems / skuStats.totalSkus) * 100 || 0).toFixed(1)}% of inventory
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-800">{skuStats.lowStockItems}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">Need restocking soon</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Out of Stock</p>
              <p className="text-2xl font-bold text-red-800">{skuStats.outOfStockItems}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">Immediate attention required</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Overstock</p>
              <p className="text-2xl font-bold text-purple-800">{skuStats.overstockItems}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">Above maximum levels</p>
        </div>
      </div>

      {/* Critical Alerts */}
      {skuStats.criticalAlerts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Critical Stock Alert</p>
              <p className="text-red-700 text-sm">
                {skuStats.criticalAlerts} SKUs are completely out of stock and need immediate restocking
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render alerts tab
  const renderAlertsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Stock Alerts</h3>
        <span className="text-sm text-gray-500">{lowStockAlerts.length} alerts</span>
      </div>
      
      {lowStockAlerts.length > 0 ? (
        <div className="space-y-3">
          {lowStockAlerts.map((alert) => {
            const statusInfo = alert.alertType === 'OUT_OF_STOCK' 
              ? { color: 'bg-red-100 text-red-800', icon: '🚨' }
              : alert.alertType === 'LOW_STOCK'
              ? { color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' }
              : { color: 'bg-purple-100 text-purple-800', icon: '📦' };
            
            return (
              <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon} {alert.alertType.replace('_', ' ')}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{alert.itemName}</p>
                      <p className="text-sm text-gray-500">SKU: {alert.skuCode} • {alert.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Current: {alert.currentStock} {alert.type === 'Material' ? 'sqcm' : 'sheets'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alert.alertType === 'OVERSTOCK' ? 'Max' : 'Min'}: {alert.minStock || alert.maxStock} {alert.type === 'Material' ? 'sqcm' : 'sheets'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-lg font-medium">No Stock Alerts</p>
          <p className="mt-1">All SKUs are within normal stock levels</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SKU Management</h1>
        <p className="text-gray-600 mt-1">
          Central dashboard for all materials and papers with comprehensive stock tracking
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
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
            onClick={() => setActiveTab('all-skus')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all-skus'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All SKUs ({skuStats.totalSkus})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alerts
            {lowStockAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {lowStockAlerts.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'all-skus' && (
          <DisplaySKUTable
            skus={allSkus}
            vendors={vendors}
            transactions={stockTransactions}
            onSkuSelect={handleSkuSelect}
            isAdmin={isAdmin}
          />
        )}
        {activeTab === 'alerts' && renderAlertsTab()}
      </div>

      {/* SKU Details Modal */}
      {selectedSku && (
        <SKUDetailsModal
          sku={selectedSku}
          vendors={vendors}
          transactions={stockTransactions.filter(t => t.skuCode === selectedSku.skuCode)}
          onClose={handleCloseSkuModal}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default SKUManagement;