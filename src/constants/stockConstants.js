// Transaction Types
export const TRANSACTION_TYPES = {
  IN: 'IN',                    // Stock incoming (purchases, returns)
  OUT: 'OUT',                  // Stock outgoing (usage, sales)
  ADJUSTMENT: 'ADJUSTMENT',    // Manual stock adjustments
  TRANSFER: 'TRANSFER',        // Transfer between locations
  RETURN: 'RETURN',           // Returns to vendor
  DAMAGED: 'DAMAGED',         // Damaged stock write-off
  EXPIRED: 'EXPIRED'          // Expired stock write-off
};

export const TRANSACTION_TYPE_CONFIG = {
  [TRANSACTION_TYPES.IN]: {
    label: 'Stock In',
    description: 'Add stock',
    icon: '📥',
    color: 'bg-green-100 text-green-800',
    impact: 'positive',
    requiresReference: false
  },
  [TRANSACTION_TYPES.OUT]: {
    label: 'Stock Out',
    description: 'Remove stock',
    icon: '📤',
    color: 'bg-red-100 text-red-800',
    impact: 'negative',
    requiresReference: true
  },
  [TRANSACTION_TYPES.ADJUSTMENT]: {
    label: 'Adjustment',
    description: 'Adjust stock level',
    icon: '⚖️',
    color: 'bg-yellow-100 text-yellow-800',
    impact: 'neutral',
    requiresReference: false
  },
  [TRANSACTION_TYPES.TRANSFER]: {
    label: 'Transfer',
    description: 'Move between locations',
    icon: '🔄',
    color: 'bg-blue-100 text-blue-800',
    impact: 'neutral',
    requiresReference: true
  },
  [TRANSACTION_TYPES.RETURN]: {
    label: 'Return',
    description: 'Return to vendor',
    icon: '↩️',
    color: 'bg-purple-100 text-purple-800',
    impact: 'negative',
    requiresReference: true
  },
  [TRANSACTION_TYPES.DAMAGED]: {
    label: 'Damaged',
    description: 'Damaged stock write-off',
    icon: '⚠️',
    color: 'bg-orange-100 text-orange-800',
    impact: 'negative',
    requiresReference: false
  },
  [TRANSACTION_TYPES.EXPIRED]: {
    label: 'Expired',
    description: 'Expired stock write-off',
    icon: '⏰',
    color: 'bg-gray-100 text-gray-800',
    impact: 'negative',
    requiresReference: false
  }
};

// Transaction Sources
export const TRANSACTION_SOURCES = {
  MATERIAL_MANAGEMENT: 'MATERIAL_MANAGEMENT',
  PAPER_MANAGEMENT: 'PAPER_MANAGEMENT',
  SKU_MANAGEMENT: 'SKU_MANAGEMENT',
  PURCHASE_ORDER: 'PURCHASE_ORDER',
  JOB_USAGE: 'JOB_USAGE',
  SYSTEM_AUTO: 'SYSTEM_AUTO',
  VENDOR_RETURN: 'VENDOR_RETURN',
  QUALITY_CONTROL: 'QUALITY_CONTROL'
};

export const TRANSACTION_SOURCE_CONFIG = {
  [TRANSACTION_SOURCES.MATERIAL_MANAGEMENT]: {
    label: 'Material Management',
    description: 'Transaction from material add/edit/delete',
    color: 'bg-blue-100 text-blue-800',
    icon: '🔧'
  },
  [TRANSACTION_SOURCES.PAPER_MANAGEMENT]: {
    label: 'Paper Management',
    description: 'Transaction from paper add/edit/delete',
    color: 'bg-green-100 text-green-800',
    icon: '📄'
  },
  [TRANSACTION_SOURCES.SKU_MANAGEMENT]: {
    label: 'SKU Management',
    description: 'Manual stock adjustment',
    color: 'bg-purple-100 text-purple-800',
    icon: '⚖️'
  },
  [TRANSACTION_SOURCES.PURCHASE_ORDER]: {
    label: 'Purchase Order',
    description: 'Stock received from PO',
    color: 'bg-indigo-100 text-indigo-800',
    icon: '📋'
  },
  [TRANSACTION_SOURCES.JOB_USAGE]: {
    label: 'Job Usage',
    description: 'Stock used in production',
    color: 'bg-orange-100 text-orange-800',
    icon: '⚙️'
  },
  [TRANSACTION_SOURCES.SYSTEM_AUTO]: {
    label: 'System Auto',
    description: 'Automatic system transaction',
    color: 'bg-gray-100 text-gray-800',
    icon: '🤖'
  },
  [TRANSACTION_SOURCES.VENDOR_RETURN]: {
    label: 'Vendor Return',
    description: 'Return to vendor',
    color: 'bg-red-100 text-red-800',
    icon: '↩️'
  },
  [TRANSACTION_SOURCES.QUALITY_CONTROL]: {
    label: 'Quality Control',
    description: 'QC rejection/approval',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🔍'
  }
};

// Alert Types
export const ALERT_TYPES = {
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  OVERSTOCK: 'OVERSTOCK',
  HIGH_VALUE_LOW_STOCK: 'HIGH_VALUE_LOW_STOCK',
  NO_RECENT_ACTIVITY: 'NO_RECENT_ACTIVITY',
  EXPIRING_STOCK: 'EXPIRING_STOCK'
};

export const ALERT_CONFIG = {
  [ALERT_TYPES.LOW_STOCK]: {
    label: 'Low Stock',
    icon: '⚠️',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    severity: 'medium',
    priority: 2,
    action: 'Reorder stock soon',
    suggestedAction: 'REORDER'
  },
  [ALERT_TYPES.OUT_OF_STOCK]: {
    label: 'Out of Stock',
    icon: '🚨',
    color: 'bg-red-100 text-red-800 border-red-200',
    severity: 'high',
    priority: 3,
    action: 'Immediate reorder required',
    suggestedAction: 'URGENT_REORDER'
  },
  [ALERT_TYPES.OVERSTOCK]: {
    label: 'Overstock',
    icon: '📦',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    severity: 'low',
    priority: 1,
    action: 'Consider reducing orders',
    suggestedAction: 'REDUCE_ORDERS'
  },
  [ALERT_TYPES.HIGH_VALUE_LOW_STOCK]: {
    label: 'High Value Low Stock',
    icon: '💰',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    severity: 'high',
    priority: 3,
    action: 'Priority reorder - high value item',
    suggestedAction: 'PRIORITY_REORDER'
  },
  [ALERT_TYPES.NO_RECENT_ACTIVITY]: {
    label: 'No Recent Activity',
    icon: '😴',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    severity: 'low',
    priority: 1,
    action: 'Review demand patterns',
    suggestedAction: 'REVIEW_DEMAND'
  },
  [ALERT_TYPES.EXPIRING_STOCK]: {
    label: 'Expiring Stock',
    icon: '⏰',
    color: 'bg-red-100 text-red-800 border-red-200',
    severity: 'medium',
    priority: 2,
    action: 'Use before expiry',
    suggestedAction: 'USE_URGENT'
  }
};

// Stock Status Configuration
export const STOCK_STATUS_CONFIG = {
  IN_STOCK: {
    label: 'In Stock',
    icon: '✅',
    color: 'bg-green-100 text-green-800',
    description: 'Stock levels are healthy'
  },
  LOW_STOCK: {
    label: 'Low Stock',
    icon: '⚠️',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Stock is running low'
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    icon: '🚨',
    color: 'bg-red-100 text-red-800',
    description: 'No stock available'
  },
  OVERSTOCK: {
    label: 'Overstock',
    icon: '📦',
    color: 'bg-purple-100 text-purple-800',
    description: 'Stock exceeds maximum levels'
  },
  CRITICAL: {
    label: 'Critical',
    icon: '🔴',
    color: 'bg-red-100 text-red-800',
    description: 'Immediate attention required'
  }
};

// Purchase Order Status
export const PO_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ORDERED: 'ORDERED',
  PARTIAL: 'PARTIAL',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED'
};

export const PO_STATUS_CONFIG = {
  [PO_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: '📝'
  },
  [PO_STATUS.PENDING]: {
    label: 'Pending Approval',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳'
  },
  [PO_STATUS.APPROVED]: {
    label: 'Approved',
    color: 'bg-blue-100 text-blue-800',
    icon: '✓'
  },
  [PO_STATUS.ORDERED]: {
    label: 'Ordered',
    color: 'bg-purple-100 text-purple-800',
    icon: '📋'
  },
  [PO_STATUS.PARTIAL]: {
    label: 'Partially Received',
    color: 'bg-orange-100 text-orange-800',
    icon: '📦'
  },
  [PO_STATUS.RECEIVED]: {
    label: 'Received',
    color: 'bg-green-100 text-green-800',
    icon: '✅'
  },
  [PO_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '❌'
  }
};

// Report Types
export const REPORT_TYPES = {
  STOCK_SUMMARY: 'STOCK_SUMMARY',
  TRANSACTION_HISTORY: 'TRANSACTION_HISTORY',
  VENDOR_ANALYSIS: 'VENDOR_ANALYSIS',
  USAGE_PATTERNS: 'USAGE_PATTERNS',
  LOW_STOCK_REPORT: 'LOW_STOCK_REPORT',
  VALUATION_REPORT: 'VALUATION_REPORT'
};

// Location Management
export const STORAGE_LOCATIONS = {
  WAREHOUSE_A: 'Warehouse A',
  WAREHOUSE_B: 'Warehouse B',
  PRODUCTION_FLOOR: 'Production Floor',
  QUALITY_CONTROL: 'Quality Control',
  DAMAGED_GOODS: 'Damaged Goods',
  RETURNS: 'Returns Area'
};

export const LOCATION_TYPES = {
  STORAGE: 'Storage',
  PRODUCTION: 'Production',
  QUALITY: 'Quality Control',
  TEMPORARY: 'Temporary'
};

// Units of Measure
export const UNITS_OF_MEASURE = {
  // Area units
  SQCM: 'sqcm',
  SQFT: 'sqft',
  SQM: 'sqm',
  
  // Count units
  PIECES: 'pieces',
  SHEETS: 'sheets',
  ROLLS: 'rolls',
  
  // Weight units
  GRAMS: 'grams',
  KG: 'kg',
  
  // Length units
  CM: 'cm',
  METERS: 'meters',
  INCHES: 'inches'
};

// Helper Functions
export const StockHelpers = {
  // Calculate stock value
  calculateStockValue: (quantity, unitCost) => {
    return (parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0);
  },

  // Calculate stock utilization rate
  calculateUtilizationRate: (totalUsed, totalPurchased) => {
    const used = parseFloat(totalUsed) || 0;
    const purchased = parseFloat(totalPurchased) || 1; // Avoid division by zero
    return (used / purchased) * 100;
  },

  // Calculate days of stock remaining
  calculateDaysOfStock: (currentStock, averageDailyUsage) => {
    const stock = parseFloat(currentStock) || 0;
    const dailyUsage = parseFloat(averageDailyUsage) || 1;
    return Math.floor(stock / dailyUsage);
  },

  // Calculate reorder point
  calculateReorderPoint: (leadTimeDays, averageDailyUsage, safetyStock = 0) => {
    const leadTime = parseFloat(leadTimeDays) || 0;
    const dailyUsage = parseFloat(averageDailyUsage) || 0;
    const safety = parseFloat(safetyStock) || 0;
    return (leadTime * dailyUsage) + safety;
  },

  // Format quantity with unit
  formatQuantityWithUnit: (quantity, itemType) => {
    const qty = parseFloat(quantity) || 0;
    const unit = itemType === 'Material' ? 'sqcm' : 'sheets';
    return `${qty.toLocaleString()} ${unit}`;
  },

  // Generate transaction reference
  generateTransactionReference: (type, prefix = '') => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${type}-${timestamp}-${random}`;
  },

  // Validate stock transaction
  validateStockTransaction: (transaction) => {
    const errors = [];
    
    if (!transaction.skuCode) {
      errors.push('SKU Code is required');
    }
    
    if (!transaction.type || !Object.values(TRANSACTION_TYPES).includes(transaction.type)) {
      errors.push('Valid transaction type is required');
    }
    
    if (!transaction.quantity || parseFloat(transaction.quantity) <= 0) {
      errors.push('Quantity must be greater than 0');
    }
    
    if (transaction.type === TRANSACTION_TYPES.OUT && !transaction.reference) {
      errors.push('Reference is required for stock out transactions');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Calculate stock efficiency metrics
  calculateEfficiencyMetrics: (skus) => {
    let totalValue = 0;
    let deadStock = 0;
    let fastMoving = 0;
    let slowMoving = 0;
    
    skus.forEach(sku => {
      const stockValue = StockHelpers.calculateStockValue(sku.currentStock, sku.finalCostPerUnit || sku.finalRate);
      totalValue += stockValue;
      
      const utilizationRate = StockHelpers.calculateUtilizationRate(sku.totalUsed, sku.totalPurchased);
      
      if (utilizationRate === 0) {
        deadStock += stockValue;
      } else if (utilizationRate > 80) {
        fastMoving += stockValue;
      } else if (utilizationRate < 20) {
        slowMoving += stockValue;
      }
    });
    
    return {
      totalValue,
      deadStockValue: deadStock,
      fastMovingValue: fastMoving,
      slowMovingValue: slowMoving,
      deadStockPercentage: totalValue > 0 ? (deadStock / totalValue) * 100 : 0,
      efficiencyScore: totalValue > 0 ? ((fastMoving / totalValue) * 100) : 0
    };
  },

  // Get stock status
  getStockStatus: (currentStock, minStock, maxStock) => {
    const current = parseFloat(currentStock) || 0;
    const min = parseFloat(minStock) || 0;
    const max = parseFloat(maxStock) || 999999;
    
    if (current === 0) return 'OUT_OF_STOCK';
    if (current <= min) return 'LOW_STOCK';
    if (current > max) return 'OVERSTOCK';
    return 'IN_STOCK';
  },

  // Format currency
  formatCurrency: (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(amount || 0);
  },

  // Format date
  formatDate: (date, options = {}) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    });
  },

  // Generate SKU code
  generateSkuCode: (type, company, itemName) => {
    const typePrefix = type === 'Material' ? 'MAT' : 'PAP';
    const companyCode = company.substring(0, 3).toUpperCase();
    const itemCode = itemName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-3);
    
    return `${typePrefix}-${companyCode}-${itemCode}-${timestamp}`;
  }
};

// Export all constants as default
export default {
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_CONFIG,
  TRANSACTION_SOURCES,
  TRANSACTION_SOURCE_CONFIG,
  ALERT_TYPES,
  ALERT_CONFIG,
  STOCK_STATUS_CONFIG,
  PO_STATUS,
  PO_STATUS_CONFIG,
  REPORT_TYPES,
  STORAGE_LOCATIONS,
  LOCATION_TYPES,
  UNITS_OF_MEASURE,
  StockHelpers
};