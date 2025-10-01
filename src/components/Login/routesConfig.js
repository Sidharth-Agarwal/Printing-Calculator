export const ROUTE_ACCESS = {
  '/transactions': ['admin', 'accountant'],
  '/user-management': ['admin'],
  '/new-bill': ['admin', 'staff', 'b2b', 'accountant'],
  '/orders': ['admin', 'staff', 'production', 'b2b', 'accountant'],
  '/invoices': ['admin', 'staff', 'accountant'],
  '/clients': ['admin', 'staff', 'accountant'],
  '/vendors': ['admin', 'staff', 'accountant'],
  '/estimates': ['admin', 'staff', 'b2b', 'accountant'],
  '/escrow': ['admin', 'staff', 'accountant'], 
  '/material-stock/paper-db': ['admin', 'staff', 'accountant'],
  '/material-stock/material-db': ['admin', 'staff','accountant'],
  '/material-stock/dies-db': ['admin', 'staff', 'accountant'],
  '/material-stock/standard-rates-db': ['admin', 'staff', 'accountant'],
  '/material-stock/overheads': ['admin', 'staff', 'accountant'],
  '/material-stock/loyalty-tiers': ['admin', 'staff', 'accountant'],
  '/material-stock/gst-hsn-db': ['admin', 'staff', 'accountant'],
  '/loyalty-dashboard': ['admin', 'staff'],
  '/b2b-dashboard': ['b2b'],
  '/crm/lead-registration': ['admin', 'staff'],
  '/crm/lead-management': ['admin', 'staff'],
  '/crm/badges': ['admin', 'staff'],
  '/request-kit': ['admin', 'staff'] // Public lead form
};

// Atomic MENU_ACCESS - Every menu item and submenu item is individually configurable
export const MENU_ACCESS = {
  // Top-level menu items
  dashboard: ['b2b'],
  newBill: ['admin', 'staff', 'b2b', 'accountant'],
  
  // Business dropdown and its items
  business: ['admin', 'staff', 'accountant'], // Controls if the Business dropdown appears
  business_clients: ['admin', 'staff', 'accountant'],
  business_vendors: ['admin', 'staff', 'accountant'],
  business_estimates: ['admin', 'staff', 'b2b', 'accountant'],
  business_escrow: ['admin', 'staff', 'accountant'],
  
  // Operations dropdown and its items
  operations: ['admin', 'staff', 'production', 'b2b', 'accountant'], // Controls if the Operations dropdown appears
  operations_orders: ['admin', 'staff', 'production', 'b2b', 'accountant'],
  operations_invoices: ['admin', 'staff', 'accountant'],
  
  // Inventory dropdown and its items
  inventory: ['admin', 'staff', 'accountant'], // Controls if the Inventory dropdown appears
  inventory_paperDb: ['admin', 'staff', 'accountant'],
  inventory_materialDb: ['admin', 'staff', 'accountant'],
  inventory_diesDb: ['admin', 'staff', 'accountant'],
  inventory_labourDb: ['admin', 'staff', 'accountant'],
  inventory_gstHsnDb: ['admin', 'staff', 'accountant'],
  inventory_standardParameters: ['admin', 'staff', 'accountant'],
  inventory_loyaltyProgram: ['admin', 'staff', 'accountant'],
  
  // CRM dropdown and its items
  crm: ['admin', 'staff'], // Controls if the CRM dropdown appears
  crm_publicLeadForm: ['admin', 'staff'],
  crm_leadPool: ['admin', 'staff'],
  crm_qualifiedLeads: ['admin', 'staff'],
  crm_qualificationBadges: ['admin', 'staff'],
  
  // Analytics dropdown and its items
  analytics: ['admin', 'staff', 'accountant'], // Controls if the Analytics dropdown appears
  analytics_loyaltyDashboard: ['admin', 'staff'],
  analytics_transactions: ['admin', 'accountant'],
  
  // Profile menu items
  profile_userManagement: ['admin'],
  profile_changePassword: ['admin', 'staff', 'b2b', 'production', 'accountant'], // Always visible for all roles
  profile_logout: ['admin', 'staff', 'b2b', 'production', 'accountant'] // Always visible for all roles
};

// Helper function to check if a menu item should be visible
export const isMenuItemVisible = (menuKey, userRole) => {
  return userRole && MENU_ACCESS[menuKey] && MENU_ACCESS[menuKey].includes(userRole);
};

// Helper function to check if a dropdown should be visible (if any of its items are visible)
export const isDropdownVisible = (dropdownKey, userRole) => {
  // Check if the dropdown itself is accessible
  if (!isMenuItemVisible(dropdownKey, userRole)) {
    return false;
  }
  
  // Check if any of its items are visible
  const dropdownItems = Object.keys(MENU_ACCESS).filter(key => key.startsWith(`${dropdownKey}_`));
  return dropdownItems.some(item => isMenuItemVisible(item, userRole));
};

// Menu structure configuration for easier management
export const MENU_STRUCTURE = {
  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/b2b-dashboard',
    accessKey: 'dashboard',
    priority: 0
  },
  newBill: {
    key: 'newBill',
    label: 'New Bill',
    icon: '📄',
    path: '/new-bill',
    accessKey: 'newBill',
    priority: 1
  },
  business: {
    key: 'business',
    label: 'Business',
    icon: '🏢',
    path: '/business',
    accessKey: 'business',
    isDropdown: true,
    priority: 2,
    dropdownItems: [
      {
        label: 'Clients',
        path: '/clients',
        icon: '🏢',
        accessKey: 'business_clients'
      },
      {
        label: 'Vendors',
        path: '/vendors',
        icon: '🤝',
        accessKey: 'business_vendors'
      },
      {
        label: 'Estimates',
        path: '/estimates',
        icon: '💰',
        accessKey: 'business_estimates'
      },
      {
        label: 'B2B Escrow',
        path: '/escrow',
        icon: '🔒',
        accessKey: 'business_escrow'
      }
    ]
  },
  operations: {
    key: 'operations',
    label: 'Operations',
    icon: '⚙️',
    path: '/operations',
    accessKey: 'operations',
    isDropdown: true,
    priority: 3,
    dropdownItems: [
      {
        label: 'Job Dashboard',
        path: '/orders',
        icon: '📋',
        accessKey: 'operations_orders'
      },
      {
        label: 'Invoices',
        path: '/invoices',
        icon: '🧾',
        accessKey: 'operations_invoices'
      }
    ]
  },
  inventory: {
    key: 'inventory',
    label: 'Inventory',
    icon: '📦',
    path: '/material-stock',
    accessKey: 'inventory',
    isDropdown: true,
    priority: 4,
    dropdownItems: [
      {
        label: 'Papers DB',
        path: '/material-stock/paper-db',
        icon: '📄',
        accessKey: 'inventory_paperDb'
      },
      {
        label: 'Materials DB',
        path: '/material-stock/material-db',
        icon: '🔧',
        accessKey: 'inventory_materialDb'
      },
      {
        label: 'Dies DB',
        path: '/material-stock/dies-db',
        icon: '⚙️',
        accessKey: 'inventory_diesDb'
      },
      {
        label: 'Labours DB',
        path: '/material-stock/standard-rates-db',
        icon: '💰',
        accessKey: 'inventory_labourDb'
      },
      {
        label: 'GST & HSN DB',
        path: '/material-stock/gst-hsn-db',
        icon: '📋',
        accessKey: 'inventory_gstHsnDb'
      },
      {
        label: 'Standard Parameters',
        path: '/material-stock/overheads',
        icon: '⚖️',
        accessKey: 'inventory_standardParameters'
      },
      // {
      //   label: 'Loyalty Program',
      //   path: '/material-stock/loyalty-tiers',
      //   icon: '⭐',
      //   accessKey: 'inventory_loyaltyProgram'
      // }
    ]
  },
  // crm: {
  //   key: 'crm',
  //   label: 'CRM',
  //   icon: '👥',
  //   path: '/crm',
  //   accessKey: 'crm',
  //   isDropdown: true,
  //   priority: 5,
  //   dropdownItems: [
  //     {
  //       label: 'Public Lead Form',
  //       path: '/request-kit',
  //       icon: '🌐',
  //       accessKey: 'crm_publicLeadForm'
  //     },
  //     {
  //       label: 'Lead Pool',
  //       path: '/crm/lead-registration',
  //       icon: '✏️',
  //       accessKey: 'crm_leadPool'
  //     },
  //     {
  //       label: 'Qualified Leads',
  //       path: '/crm/lead-management',
  //       icon: '🔄',
  //       accessKey: 'crm_qualifiedLeads'
  //     },
  //     {
  //       label: 'Qualification Badges',
  //       path: '/crm/badges',
  //       icon: '🏆',
  //       accessKey: 'crm_qualificationBadges'
  //     }
  //   ]
  // },
  analytics: {
    key: 'analytics',
    label: 'Analytics',
    icon: '📈',
    path: '/analytics',
    accessKey: 'analytics',
    isDropdown: true,
    priority: 6,
    dropdownItems: [
      // {
      //   label: 'Loyalty Dashboard',
      //   path: '/loyalty-dashboard',
      //   icon: '⭐',
      //   accessKey: 'analytics_loyaltyDashboard'
      // },
      {
        label: 'Transactions',
        path: '/transactions',
        icon: '💳',
        accessKey: 'analytics_transactions'
      }
    ]
  }
};

// Profile menu structure
export const PROFILE_MENU_STRUCTURE = [
  {
    label: 'User Management',
    path: '/user-management',
    icon: '👥',
    accessKey: 'profile_userManagement'
  },
  {
    label: 'Change Password',
    path: '/change-password',
    icon: '🔑',
    accessKey: 'profile_changePassword'
  }
];