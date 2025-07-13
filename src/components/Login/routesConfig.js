export const ROUTE_ACCESS = {
  '/transactions': ['admin'],
  '/user-management': ['admin'],
  '/new-bill': ['admin', 'staff', 'b2b'],
  '/orders': ['admin', 'staff', 'production', 'b2b'],
  '/invoices': ['admin', 'staff'],
  '/clients': ['admin', 'staff'],
  '/estimates': ['admin', 'staff', 'b2b'],
  '/escrow': ['admin', 'staff'], 
  '/material-stock/paper-db': ['admin', 'staff'],
  '/material-stock/material-db': ['admin', 'staff'],
  '/material-stock/dies-db': ['admin', 'staff'],
  '/material-stock/standard-rates-db': ['admin', 'staff'],
  '/material-stock/overheads': ['admin', 'staff'],
  '/material-stock/loyalty-tiers': ['admin', 'staff'],
  '/loyalty-dashboard': ['admin', 'staff'],
  '/b2b-dashboard': ['b2b'],
  '/crm/lead-registration': ['admin', 'staff'],
  '/crm/lead-management': ['admin', 'staff'],
  '/crm/badges': ['admin', 'staff'],
  '/vendors': ['admin', 'staff']
};

export const MENU_ACCESS = {
  newBill: ['admin', 'staff', 'b2b'],
  materials: ['admin', 'staff'],
  clients: ['admin', 'staff'],
  estimates: ['admin', 'staff', 'b2b'],
  escrow: ['admin', 'staff'],
  orders: ['admin', 'staff', 'production', 'b2b'],
  invoices: ['admin', 'staff'],
  transactions: ['admin'],
  userManagement: ['admin'],
  loyaltyProgram: ['admin', 'staff'],
  crm: ['admin', 'staff']
};