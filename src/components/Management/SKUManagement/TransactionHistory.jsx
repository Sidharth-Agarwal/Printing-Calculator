import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, startAfter, onSnapshot, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { TRANSACTION_TYPE_CONFIG, TRANSACTION_SOURCES, TRANSACTION_SOURCE_CONFIG } from "../../../constants/stockConstants";

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
      <div className={standalone ? "p-4 max-w-screen-xl mx-auto" : ""}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Summary Stats */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Stock Transaction History</h3>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export CSV
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{summaryStats.totalTransactions}</p>
            <p className="text-gray-600 text-sm mt-1">Total Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{summaryStats.stockIn}</p>
            <p className="text-green-600 text-sm mt-1">Stock In</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{summaryStats.stockOut}</p>
            <p className="text-red-600 text-sm mt-1">Stock Out</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{summaryStats.adjustments}</p>
            <p className="text-yellow-600 text-sm mt-1">Adjustments</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">{formatCurrency(summaryStats.totalValue)}</p>
            <p className="text-blue-600 text-sm mt-1">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{summaryStats.uniqueSkus}</p>
            <p className="text-purple-600 text-sm mt-1">Unique SKUs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{summaryStats.uniqueVendors}</p>
            <p className="text-indigo-600 text-sm mt-1">Vendors</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {Object.entries(TRANSACTION_TYPE_CONFIG).map(([type, config]) => (
                <option key={type} value={type}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              {Object.entries(TRANSACTION_SOURCE_CONFIG || {}).map(([source, config]) => (
                <option key={source} value={source}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {filters.dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transaction Table - Modern Design */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="grid grid-cols-9 gap-4 text-sm font-semibold text-gray-700">
              <div>Date & Time</div>
              <div>SKU Code</div>
              <div>Type</div>
              <div>Quantity</div>
              <div>Reference</div>
              <div>Vendor</div>
              <div>Value</div>
              <div>Source</div>
              <div>Notes</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {paginatedTransactions.map((transaction, index) => {
              const typeConfig = TRANSACTION_TYPE_CONFIG[transaction.type] || {};
              const sourceConfig = TRANSACTION_SOURCE_CONFIG?.[transaction.source] || {};
              
              return (
                <div 
                  key={transaction.id} 
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <div className="grid grid-cols-9 gap-4 text-sm items-center">
                    {/* Date & Time */}
                    <div>
                      <div className="font-medium text-gray-900">{formatDate(transaction.date)}</div>
                      <div className="text-xs text-gray-500">{formatDateTime(transaction.date).split(', ')[1]}</div>
                    </div>

                    {/* SKU Code */}
                    <div>
                      <div className="font-mono text-xs font-medium text-gray-900">{transaction.skuCode}</div>
                      <div className="text-xs text-gray-500">{transaction.itemType}</div>
                    </div>

                    {/* Type */}
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeConfig.color || 'bg-gray-100 text-gray-800'}`}>
                        {typeConfig.icon} {typeConfig.label || transaction.type}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div>
                      <span className={`font-semibold ${
                        transaction.type === 'OUT' ? 'text-red-600' : 
                        transaction.type === 'IN' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {transaction.type === 'OUT' ? '-' : transaction.type === 'IN' ? '+' : '±'}{transaction.quantity}
                      </span>
                      <div className="text-xs text-gray-500">
                        {transaction.itemType === 'Material' ? 'sqcm' : 'sheets'}
                      </div>
                    </div>

                    {/* Reference */}
                    <div>
                      <div className="truncate font-medium text-gray-900" title={transaction.reference}>
                        {transaction.reference || '-'}
                      </div>
                      {transaction.jobId && (
                        <div className="text-xs text-blue-600">Job: {transaction.jobId}</div>
                      )}
                    </div>

                    {/* Vendor */}
                    <div>
                      <div className="truncate font-medium text-gray-900" title={transaction.vendorName}>
                        {transaction.vendorName || '-'}
                      </div>
                    </div>

                    {/* Value */}
                    <div>
                      <div className="font-semibold text-gray-900">{formatCurrency(transaction.totalCost)}</div>
                      {transaction.unitCost > 0 && (
                        <div className="text-xs text-gray-500">
                          @ {formatCurrency(transaction.unitCost)}
                        </div>
                      )}
                    </div>

                    {/* Source */}
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceConfig.color || 'bg-gray-100 text-gray-800'}`}>
                        {sourceConfig.icon} {sourceConfig.label || transaction.source}
                      </span>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="truncate text-gray-900" title={transaction.notes}>
                        {transaction.notes || '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.createdBy || 'System'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {paginatedTransactions.length === 0 && (
          <div className="text-center py-12 px-6">
            <div className="max-w-sm mx-auto">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later for new transactions.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of{' '}
            <span className="font-medium">{pagination.totalItems}</span> transactions
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // If standalone, wrap with page layout
  if (standalone) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of all stock movements and inventory transactions
          </p>
        </div>
        {content}
      </div>
    );
  }

  // If not standalone, return just the content
  return content;
};

export default TransactionHistory;