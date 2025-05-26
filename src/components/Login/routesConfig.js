export const ROUTE_ACCESS = {
  '/transactions': ['admin'],
  '/user-management': ['admin'],
  '/new-bill': ['admin', 'staff', 'b2b'],
  '/orders': ['admin', 'staff', 'production', 'b2b'],
  '/invoices': ['admin', 'staff'],
  '/clients': ['admin', 'staff'],
  '/vendors': ['admin', 'staff'],
  '/estimates': ['admin', 'staff', 'b2b'],
  '/escrow': ['admin', 'staff'], 
  '/material-stock/stock-dashboard': ['admin', 'staff'], // NEW: Stock Dashboard
  '/material-stock/paper-db': ['admin', 'staff'],
  '/material-stock/material-db': ['admin', 'staff'],
  '/material-stock/dies-db': ['admin', 'staff'],
  '/material-stock/standard-rates-db': ['admin', 'staff'],
  '/material-stock/gst-hsn-db': ['admin', 'staff'],
  '/material-stock/overheads': ['admin', 'staff'],
  '/material-stock/sku-management': ['admin', 'staff'], // SKU Management
  '/material-stock/stock-alerts': ['admin', 'staff'], // Stock Alerts
  '/material-stock/loyalty-tiers': ['admin', 'staff'],
  '/loyalty-dashboard': ['admin', 'staff'],
  '/b2b-dashboard': ['b2b'],
  '/crm/lead-registration': ['admin', 'staff'],
  '/crm/lead-management': ['admin', 'staff'],
  '/crm/badges': ['admin', 'staff']
};

export const MENU_ACCESS = {
  newBill: ['admin', 'staff', 'b2b'],
  materials: ['admin', 'staff'],
  clients: ['admin', 'staff'],
  vendors: ['admin', 'staff'],
  estimates: ['admin', 'staff', 'b2b'],
  escrow: ['admin', 'staff'],
  orders: ['admin', 'staff', 'production', 'b2b'],
  invoices: ['admin', 'staff'],
  transactions: ['admin'],
  userManagement: ['admin'],
  loyaltyProgram: ['admin', 'staff'],
  crm: ['admin', 'staff'],
  skuManagement: ['admin', 'staff'], // SKU Management menu access
  stockDashboard: ['admin', 'staff'], // NEW: Stock Dashboard menu access
  stockAlerts: ['admin', 'staff'] // Stock Alerts menu access
};