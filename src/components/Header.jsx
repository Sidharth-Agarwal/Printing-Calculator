import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./Login/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { MENU_ACCESS } from "../components/Login/routesConfig"; 
import logo from "../assets/logo.png"; // Import the logo

const Header = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [clientData, setClientData] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(-1);

  // Modified function to navigate within the SPA
  const navigateTo = (path) => {
    navigate(path);
    if (showProfileMenu) {
      setShowProfileMenu(false);
    }
  };

  // Helper function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.displayName) {
              setDisplayName(userData.displayName);
            }
            
            // Fetch client data for B2B users
            if (userData.role === "b2b" && userData.clientId) {
              const clientDoc = await getDoc(doc(db, "clients", userData.clientId));
              if (clientDoc.exists()) {
                setClientData({
                  id: clientDoc.id,
                  ...clientDoc.data()
                });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  // Special case for setup-admin page - minimal header
  if (location.pathname === "/setup-admin") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md">
        <div className="w-full px-6 py-2 flex items-center justify-center">
          <img src={logo} alt="Famous Logo" className="h-10 w-10 transition-transform hover:rotate-12 duration-300" />
        </div>
      </header>
    );
  }

  // Return early if user is not authenticated
  if (!currentUser) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md">
        <div className="w-full px-6 py-2 flex items-center justify-center">
          <img src={logo} alt="Famous Logo" className="h-10 w-10 transition-transform hover:rotate-12 duration-300" />
        </div>
      </header>
    );
  }

  // Determine display text for user
  let userDisplayText = displayName || currentUser.email;
  if (userRole === "b2b" && clientData) {
    userDisplayText = `${clientData.name} (${displayName || currentUser.email})`;
  }

  // Helper function to check menu item visibility
  const isMenuItemVisible = (menuKey) => 
    MENU_ACCESS[menuKey].includes(userRole);

  // Navigation items array for animated hover effects
  const navItems = [
    { key: 'newBill', label: 'New Bill', path: '/new-bill', visible: isMenuItemVisible('newBill') },
    { key: 'materials', label: 'Material & Stock', path: '/material-stock', visible: isMenuItemVisible('materials'), isDropdown: true,
      dropdownItems: [
        { label: 'Paper Management', path: '/material-stock/paper-db' },
        { label: 'Material Management', path: '/material-stock/material-db' },
        { label: 'Die Management', path: '/material-stock/dies-db' },
        { label: 'Labour Management', path: '/material-stock/standard-rates-db' },
        { label: 'Overheads Management', path: '/material-stock/overheads' },
        { label: 'Loyalty Program Management', path: '/material-stock/loyalty-tiers', visible: isMenuItemVisible('loyaltyProgram') }
      ]
    },
    { key: 'clients', label: 'Clients', path: '/clients', visible: isMenuItemVisible('clients') },
    { key: 'estimates', label: 'Estimates', path: '/estimates', visible: isMenuItemVisible('estimates') },
    { key: 'orders', label: 'Orders', path: '/orders', visible: isMenuItemVisible('orders') },
    { key: 'invoices', label: 'Invoices', path: '/invoices', visible: isMenuItemVisible('invoices') },
    { key: 'loyalty', label: 'Loyalty Dashboard', path: '/loyalty-dashboard', visible: isMenuItemVisible('loyaltyProgram') },
    { key: 'transactions', label: 'Transactions', path: '/transactions', visible: isMenuItemVisible('transactions') },
    { key: 'dashboard', label: 'Dashboard', path: '/b2b-dashboard', visible: userRole === "b2b" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md">
      <div className="w-full px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <img 
          src={logo} 
          alt="Famous Logo" 
          className="h-10 w-10 transition-transform hover:rotate-12 duration-300 cursor-pointer" 
          onClick={() => userRole === "b2b" ? navigateTo("/b2b-dashboard") : navigateTo("/")}
        />
        
        {/* Centered Navigation */}
        <nav className="flex items-center justify-center flex-1 space-x-8">
          {navItems.filter(item => item.visible).map((item, index) => (
            item.isDropdown ? (
              <div key={item.key} className="group relative inline-block" 
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(-1)}>
                <button 
                  className={`text-sm transition-all duration-200 border-b-2 ${
                    location.pathname.includes(item.path) && !location.pathname.includes('/estimates')
                      ? "border-white font-medium" 
                      : "border-transparent hover:border-gray-400"
                  }`}
                >
                  {item.label}
                </button>
                <div className="absolute hidden group-hover:block bg-white text-black rounded shadow-lg z-10 left-1/2 transform -translate-x-1/2 min-w-max overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ top: '100%', marginTop: '0' }}>
                  {item.dropdownItems.filter(subItem => subItem.visible !== false).map(subItem => (
                    <button
                      key={subItem.path}
                      onClick={() => navigateTo(subItem.path)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-100 ${
                        isActive(subItem.path) ? "bg-gray-100 font-medium" : ""
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                key={item.key}
                onClick={() => navigateTo(item.path)}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(-1)}
                className={`text-sm transition-all duration-200 border-b-2 ${
                  isActive(item.path)
                    ? "border-white font-medium" 
                    : "border-transparent hover:border-gray-400"
                } ${hoverIndex === index ? "transform -translate-y-0.5" : ""}`}
              >
                {item.label}
              </button>
            )
          ))}
        </nav>
        
        {/* Profile Dropdown - Right aligned */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center transition-colors duration-200 hover:text-gray-300 text-sm"
          >
            <span className="max-w-[150px] truncate">{userDisplayText}</span>
            <svg
              className={`h-4 w-4 ml-1 transition-transform duration-300 ${showProfileMenu ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10 overflow-hidden animate-fadeIn">
              <div className="p-2 border-b text-xs text-gray-500">
                Logged in as <span className="font-semibold">{userRole}</span>
              </div>

              {/* User Management - Only for Admin */}
              {isMenuItemVisible('userManagement') && (
                <button
                  onClick={() => navigateTo('/user-management')}
                  className="block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-100"
                >
                  User Management
                </button>
              )}
             
              {/* Change Password - Always Visible */}
              <button
                onClick={() => navigateTo('/change-password')}
                className="block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-100"
              >
                Change Password
              </button>
             
              {/* Logout - Always Visible */}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Add a simple fade-in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default Header;