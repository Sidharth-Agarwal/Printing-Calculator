export const ROUTE_ACCESS = {
  '/transactions':                      ['admin', 'accountant', 'staff'],
  '/user-management':                   ['admin'],
  '/new-bill':                          ['admin', 'staff', 'b2b', 'accountant'],
  '/orders':                            ['admin', 'staff', 'production', 'b2b', 'accountant'],
  '/invoices':                          ['admin', 'staff', 'accountant'],
  '/clients':                           ['admin', 'staff', 'accountant'],
  '/vendors':                           ['admin', 'staff', 'accountant'],
  '/estimates':                         ['admin', 'staff', 'b2b', 'accountant'],
  '/escrow':                            ['admin', 'staff', 'accountant'],
  '/material-stock/paper-db':           ['admin', 'staff', 'accountant'],
  '/material-stock/material-db':        ['admin', 'staff', 'accountant'],
  '/material-stock/dies-db':            ['admin', 'staff', 'accountant'],
  '/material-stock/standard-rates-db':  ['admin', 'staff', 'accountant'],
  '/material-stock/overheads':          ['admin', 'staff', 'accountant'],
  '/material-stock/loyalty-tiers':      ['admin', 'staff', 'accountant'],
  '/material-stock/gst-hsn-db':         ['admin', 'staff', 'accountant'],
  '/loyalty-dashboard':                 ['admin', 'staff'],
  '/b2b-dashboard':                     ['b2b'],

  // CRM — Phase 1
  '/crm/lead-registration':  ['admin', 'staff', 'sales'],
  '/crm/lead-management':    ['admin', 'staff', 'sales'],
  '/crm/badges':             ['admin'],
  '/request-kit':            ['admin', 'staff', 'sales'],

  // CRM — Phase 2
  '/crm/clients':            ['admin', 'staff', 'sales'],

  // CRM — Phase 3
  '/crm/tasks':              ['admin', 'staff', 'sales'],

  // CRM — Phase 4
  '/crm/dashboard':          ['admin', 'staff', 'sales']
};

export const MENU_ACCESS = {
  // Top-level
  dashboard:  ['b2b'],
  newBill:    ['admin', 'staff', 'b2b', 'accountant'],

  // Business
  business:          ['admin', 'staff', 'accountant'],
  business_clients:  ['admin', 'staff', 'accountant'],
  business_vendors:  ['admin', 'staff', 'accountant'],
  business_estimates:['admin', 'staff', 'b2b', 'accountant'],
  business_escrow:   ['admin', 'staff', 'accountant'],

  // Operations
  operations:         ['admin', 'staff', 'production', 'b2b', 'accountant'],
  operations_orders:  ['admin', 'staff', 'production', 'b2b', 'accountant'],
  operations_invoices:['admin', 'staff', 'accountant'],

  // Inventory
  inventory:                    ['admin', 'staff', 'accountant'],
  inventory_paperDb:            ['admin', 'staff', 'accountant'],
  inventory_materialDb:         ['admin', 'staff', 'accountant'],
  inventory_diesDb:             ['admin', 'staff', 'accountant'],
  inventory_labourDb:           ['admin', 'staff', 'accountant'],
  inventory_gstHsnDb:           ['admin', 'staff', 'accountant'],
  inventory_standardParameters: ['admin', 'staff', 'accountant'],
  inventory_loyaltyProgram:     ['admin', 'staff', 'accountant'],

  // CRM — all items visible to admin, staff, sales
  crm:                       ['admin', 'staff', 'sales'],
  crm_dashboard:             ['admin', 'staff', 'sales'],
  crm_publicLeadForm:        ['admin', 'staff', 'sales'],
  crm_leadPool:              ['admin', 'staff', 'sales'],
  crm_qualifiedLeads:        ['admin', 'staff', 'sales'],
  crm_clients:               ['admin', 'staff', 'sales'],
  crm_tasks:                 ['admin', 'staff', 'sales'],
  crm_qualificationBadges:   ['admin'],          // admin only

  // Analytics
  analytics:                  ['admin', 'staff', 'accountant'],
  analytics_loyaltyDashboard: ['admin', 'staff'],
  analytics_transactions:     ['admin', 'accountant', 'staff'],

  // Profile
  profile_userManagement: ['admin'],
  profile_changePassword: ['admin', 'staff', 'b2b', 'production', 'accountant', 'sales'],
  profile_logout:         ['admin', 'staff', 'b2b', 'production', 'accountant', 'sales']
};

export const isMenuItemVisible = (menuKey, userRole) =>
  !!(userRole && MENU_ACCESS[menuKey]?.includes(userRole));

export const isDropdownVisible = (dropdownKey, userRole) => {
  if (!isMenuItemVisible(dropdownKey, userRole)) return false;
  const items = Object.keys(MENU_ACCESS).filter(k => k.startsWith(`${dropdownKey}_`));
  return items.some(item => isMenuItemVisible(item, userRole));
};

export const MENU_STRUCTURE = {
  dashboard: {
    key: 'dashboard', label: 'Dashboard', icon: '📊',
    path: '/b2b-dashboard', accessKey: 'dashboard', priority: 0
  },
  newBill: {
    key: 'newBill', label: 'New Bill', icon: '📄',
    path: '/new-bill', accessKey: 'newBill', priority: 1
  },
  business: {
    key: 'business', label: 'Business', icon: '🏢',
    path: '/business', accessKey: 'business', isDropdown: true, priority: 2,
    dropdownItems: [
      { label: 'Clients',   path: '/clients',   icon: '🏢', accessKey: 'business_clients' },
      { label: 'Vendors',   path: '/vendors',   icon: '🤝', accessKey: 'business_vendors' },
      { label: 'Estimates', path: '/estimates', icon: '💰', accessKey: 'business_estimates' },
      { label: 'B2B Escrow',path: '/escrow',    icon: '🔒', accessKey: 'business_escrow' }
    ]
  },
  operations: {
    key: 'operations', label: 'Operations', icon: '⚙️',
    path: '/operations', accessKey: 'operations', isDropdown: true, priority: 3,
    dropdownItems: [
      { label: 'Job Dashboard', path: '/orders',   icon: '📋', accessKey: 'operations_orders' },
      { label: 'Invoices',      path: '/invoices', icon: '🧾', accessKey: 'operations_invoices' }
    ]
  },
  inventory: {
    key: 'inventory', label: 'Database', icon: '📦',
    path: '/material-stock', accessKey: 'inventory', isDropdown: true, priority: 4,
    dropdownItems: [
      { label: 'Papers DB',            path: '/material-stock/paper-db',          icon: '📄', accessKey: 'inventory_paperDb' },
      { label: 'Materials DB',         path: '/material-stock/material-db',        icon: '🔧', accessKey: 'inventory_materialDb' },
      { label: 'Dies DB',              path: '/material-stock/dies-db',            icon: '⚙️', accessKey: 'inventory_diesDb' },
      { label: 'Labours DB',           path: '/material-stock/standard-rates-db',  icon: '💰', accessKey: 'inventory_labourDb' },
      { label: 'GST & HSN DB',         path: '/material-stock/gst-hsn-db',         icon: '📋', accessKey: 'inventory_gstHsnDb' },
      { label: 'Standard Parameters',  path: '/material-stock/overheads',          icon: '⚖️', accessKey: 'inventory_standardParameters' }
    ]
  },
  crm: {
    key: 'crm', label: 'CRM', icon: '👥',
    path: '/crm', accessKey: 'crm', isDropdown: true, priority: 5,
    dropdownItems: [
      { label: 'Dashboard',             path: '/crm/dashboard',          icon: '📊', accessKey: 'crm_dashboard' },
      { label: 'Lead Pool',             path: '/crm/lead-registration',  icon: '✏️', accessKey: 'crm_leadPool' },
      { label: 'Qualified Leads',       path: '/crm/lead-management',    icon: '🔄', accessKey: 'crm_qualifiedLeads' },
      { label: 'Clients',               path: '/crm/clients',            icon: '🤝', accessKey: 'crm_clients' },
      { label: 'Tasks',                 path: '/crm/tasks',              icon: '✅', accessKey: 'crm_tasks' },
      { label: 'Qualification Badges',  path: '/crm/badges',             icon: '🏆', accessKey: 'crm_qualificationBadges' },
      { label: 'Public Lead Form',      path: '/request-kit',            icon: '🌐', accessKey: 'crm_publicLeadForm' }
    ]
  },
  analytics: {
    key: 'analytics', label: 'Analytics', icon: '📈',
    path: '/analytics', accessKey: 'analytics', isDropdown: true, priority: 6,
    dropdownItems: [
      { label: 'Transactions', path: '/transactions', icon: '💳', accessKey: 'analytics_transactions' }
    ]
  }
};

export const PROFILE_MENU_STRUCTURE = [
  { label: 'User Management', path: '/user-management', icon: '👥', accessKey: 'profile_userManagement' },
  { label: 'Change Password',  path: '/change-password',  icon: '🔑', accessKey: 'profile_changePassword' }
];