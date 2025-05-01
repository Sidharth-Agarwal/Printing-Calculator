export const ROUTE_ACCESS = {
  // Route paths mapped to allowed roles
  '/transactions': ['admin'],
  '/user-management': ['admin'],
  '/new-bill': ['admin', 'staff', 'b2b'],
  '/orders': ['admin', 'staff', 'production', 'b2b'],
  '/invoices': ['admin', 'staff'],
  '/clients': ['admin', 'staff'],
  '/material-stock/estimates-db': ['admin', 'staff', 'b2b'],
  '/material-stock/paper-db': ['admin', 'staff'],
  '/material-stock/material-db': ['admin', 'staff'],
  '/material-stock/dies-db': ['admin', 'staff'],
  '/material-stock/standard-rates-db': ['admin', 'staff'],
  '/material-stock/overheads': ['admin', 'staff'],
  '/material-stock/loyalty-tiers': ['admin', 'staff'], // New route for loyalty tiers management
  '/b2b-dashboard': ['b2b']
};

export const MENU_ACCESS = {
  // Configurable menu visibility
  newBill: ['admin', 'staff', 'b2b'],
  materials: ['admin', 'staff'],
  clients: ['admin', 'staff'],
  estimates: ['admin', 'staff', 'b2b'],
  orders: ['admin', 'staff', 'production', 'b2b'],
  invoices: ['admin', 'staff'],
  transactions: ['admin'],
  userManagement: ['admin'],
  loyaltyProgram: ['admin', 'staff'] // New menu access for loyalty program
};