import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { TRANSACTION_TYPE_CONFIG, TRANSACTION_SOURCE_CONFIG } from "../../../constants/stockConstants";

const TransactionHistory = ({ 
  skuCode = null, 
  vendorName = null, 
  itemType = null, 
  maxResults = 500,
  standalone = true
}) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    source: 'all',
    dateRange: 'all',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0
  });

  // Real-time transaction updates
  useEffect(() => {
    setIsLoading(true);
    
    let transactionsQuery = query(
      collection(db, "stockTransactions"),
      orderBy("date", "desc"),
      limit(maxResults)
    );

    // Add filters if provided
    if (skuCode) {
      transactionsQuery = query(
        collection(db, "stockTransactions"),
        where("skuCode", "==", skuCode),
        orderBy("date", "desc"),
        limit(maxResults)
      );
    } else if (vendorName) {
      transactionsQuery = query(
        collection(db, "stockTransactions"),
        where("vendorName", "==", vendorName),
        orderBy("date", "desc"),
        limit(maxResults)
      );
    } else if (itemType) {
      transactionsQuery = query(
        collection(db, "stockTransactions"),
        where("itemType", "==", itemType),
        orderBy("date", "desc"),
        limit(maxResults)
      );
    }

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transactionsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [skuCode, vendorName, itemType, maxResults]);

  // Apply filters to transactions
  useEffect(() => {
    let filtered = [...transactions];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.skuCode?.toLowerCase().includes(searchTerm) ||
        transaction.reference?.toLowerCase().includes(searchTerm) ||
        transaction.notes?.toLowerCase().includes(searchTerm) ||
        transaction.vendorName?.toLowerCase().includes(searchTerm) ||
        transaction.jobId?.toLowerCase().includes(searchTerm)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Source filter
    if (filters.source !== 'all') {
      filtered = filtered.filter(transaction => transaction.source === filters.source);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
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
        case 'custom':
          if (filters.startDate && filters.endDate) {
            const customStart = new Date(filters.startDate);
            const customEnd = new Date(filters.endDate);
            filtered = filtered.filter(transaction => {
              const transactionDate = transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date);
              return transactionDate >= customStart && transactionDate <= customEnd;
            });
          }
          break;
      }

      if (filters.dateRange !== 'custom') {
        filtered = filtered.filter(transaction => {
          const transactionDate = transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date);
          return transactionDate >= startDate;
        });
      }
    }

    setFilteredTransactions(filtered);
    setPagination(prev => ({
      ...prev,
      totalItems: filtered.length,
      currentPage: 1
    }));
  }, [transactions, filters]);

  // Get paginated transactions
  const paginatedTransactions = filteredTransactions.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format date with time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-IN");
  };

  // Format date only
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      source: 'all',
      dateRange: 'all',
      startDate: '',
      endDate: ''
    });
  };

  // Calculate summary stats
  const summaryStats = {
    totalTransactions: filteredTransactions.length,
    totalValue: filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.totalCost) || 0), 0),
    stockIn: filteredTransactions.filter(t => t.type === 'IN').length,
    stockOut: filteredTransactions.filter(t => t.type === 'OUT').length,
    adjustments: filteredTransactions.filter(t => t.type === 'ADJUSTMENT').length,
    uniqueSkus: new Set(filteredTransactions.map(t => t.skuCode)).size,
    uniqueVendors: new Set(filteredTransactions.filter(t => t.vendorName).map(t => t.vendorName)).size
  };

  // Export filtered data to CSV
  const exportToCSV = () => {
    const headers = [
      'Date',
      'SKU Code',
      'Type',
      'Quantity',
      'Reference',
      'Vendor',
      'Job ID',
      'Unit Cost',
      'Total Cost',
      'Source',
      'Notes',
      'Created By'
    ];

    const csvData = filteredTransactions.map(transaction => [
      formatDateTime(transaction.date),
      transaction.skuCode || '',
      transaction.type || '',
      transaction.quantity || 0,
      transaction.reference || '',
      transaction.vendorName || '',
      transaction.jobId || '',
      transaction.unitCost || 0,
      transaction.totalCost || 0,
      transaction.source || '',
      transaction.notes || '',
      transaction.createdBy || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const content = (
    <>
      {/* Page Header - Only show if standalone */}
      {standalone && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of all stock movements and inventory transactions
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Transactions</h3>
          <p className="text-2xl font-bold text-gray-800">{summaryStats.totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-1">All stock movements</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-green-200 bg-green-50 p-4">
          <h3 className="text-sm font-medium text-green-700 mb-2">Stock In</h3>
          <p className="text-2xl font-bold text-green-800">{summaryStats.stockIn}</p>
          <p className="text-xs text-green-600 mt-1">Incoming stock</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-700 mb-2">Stock Out</h3>
          <p className="text-2xl font-bold text-red-800">{summaryStats.stockOut}</p>
          <p className="text-xs text-red-600 mt-1">Outgoing stock</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="text-sm font-medium text-yellow-700 mb-2">Adjustments</h3>
          <p className="text-2xl font-bold text-yellow-800">{summaryStats.adjustments}</p>
          <p className="text-xs text-yellow-600 mt-1">Stock corrections</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Total Value</h3>
          <p className="text-lg font-bold text-blue-800">{formatCurrency(summaryStats.totalValue)}</p>
          <p className="text-xs text-blue-600 mt-1">Transaction value</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-purple-200 bg-purple-50 p-4">
          <h3 className="text-sm font-medium text-purple-700 mb-2">Unique SKUs</h3>
          <p className="text-2xl font-bold text-purple-800">{summaryStats.uniqueSkus}</p>
          <p className="text-xs text-purple-600 mt-1">Items involved</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-indigo-200 bg-indigo-50 p-4">
          <h3 className="text-sm font-medium text-indigo-700 mb-2">Vendors</h3>
          <p className="text-2xl font-bold text-indigo-800">{summaryStats.uniqueVendors}</p>
          <p className="text-xs text-indigo-600 mt-1">Unique suppliers</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {Object.entries(TRANSACTION_TYPE_CONFIG || {}).map(([type, config]) => (
                <option key={type} value={type}>{config.label || type}</option>
              ))}
            </select>
            
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              {Object.entries(TRANSACTION_SOURCE_CONFIG || {}).map(([source, config]) => (
                <option key={source} value={source}>{config.label || source}</option>
              ))}
            </select>
            
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {filters.dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-2 py-2 text-left font-medium text-gray-500">Date & Time</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">SKU Code</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">Type</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">Quantity</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">Reference</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">Vendor</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">Value</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">Source</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-500">Notes</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => {
                  const typeConfig = TRANSACTION_TYPE_CONFIG?.[transaction.type] || {};
                  const sourceConfig = TRANSACTION_SOURCE_CONFIG?.[transaction.source] || {};
                  
                  return (
                    <tr key={transaction.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-2 py-1.5">
                        <div>
                          <div className="font-medium text-gray-900">{formatDate(transaction.date)}</div>
                          <div className="text-xs text-gray-500">{formatDateTime(transaction.date).split(', ')[1]}</div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="font-mono text-xs font-medium text-gray-900">{transaction.skuCode}</div>
                        <div className="text-xs text-gray-500">{transaction.itemType}</div>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.color || 'bg-gray-100 text-gray-800'}`}>
                          {typeConfig.icon} {typeConfig.label || transaction.type}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`font-semibold ${
                          transaction.type === 'OUT' ? 'text-red-600' : 
                          transaction.type === 'IN' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {transaction.type === 'OUT' ? '-' : transaction.type === 'IN' ? '+' : '±'}{transaction.quantity}
                        </span>
                        <div className="text-xs text-gray-500">
                          {transaction.itemType === 'Material' ? 'sqcm' : 'sheets'}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="truncate max-w-32" title={transaction.reference}>
                          {transaction.reference || '-'}
                        </div>
                        {transaction.jobId && (
                          <div className="text-xs text-blue-600">Job: {transaction.jobId}</div>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="truncate max-w-24" title={transaction.vendorName}>
                          {transaction.vendorName || '-'}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="font-medium">{formatCurrency(transaction.totalCost)}</div>
                        {transaction.unitCost > 0 && (
                          <div className="text-xs text-gray-500">
                            @ {formatCurrency(transaction.unitCost)}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`px-2 py-1 rounded text-xs ${sourceConfig.color || 'bg-gray-100 text-gray-800'}`}>
                          {sourceConfig.icon} {sourceConfig.label || transaction.source}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="truncate max-w-32" title={transaction.notes}>
                          {transaction.notes || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.createdBy || 'System'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-lg font-medium text-gray-700 mt-4 mb-2">No Transactions Found</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              No transactions match your current search criteria. Try adjusting your filters or check back later.
            </p>
            {(filters.search || filters.type !== 'all' || filters.source !== 'all' || filters.dateRange !== 'all') && (
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} transactions
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, pagination.currentPage - 2) + i;
                if (page > totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      page === pagination.currentPage
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // If standalone, wrap with page layout matching OrdersPage
  if (standalone) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        {content}
      </div>
    );
  }

  // If not standalone, return just the content
  return content;
};

export default TransactionHistory;