import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./Login/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { MENU_ACCESS } from "../components/Login/routesConfig"; // Import menu access configuration

const Header = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [clientData, setClientData] = useState(null);

  // Modified function to navigate within the SPA instead of opening new tabs
  const navigateTo = (path) => {
    navigate(path);
    // Close profile menu if it's open
    if (showProfileMenu) {
      setShowProfileMenu(false);
    }
  };

  // Helper function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Helper function to get active class
  const getActiveClass = (path) => {
    return isActive(path) ? "underline text-blue-300" : "";
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
      <header className="bg-blue-600 text-white shadow">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold whitespace-nowrap">FAMOUS LETTER PRESS</h1>
        </div>
      </header>
    );
  }

  // Return early if user is not authenticated
  if (!currentUser) {
    return (
      <header className="bg-blue-600 text-white shadow">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold whitespace-nowrap">FAMOUS LETTER PRESS</h1>
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

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold whitespace-nowrap">
          {userRole === "b2b" ? (
            <button 
              onClick={() => navigateTo("/b2b-dashboard")} 
              className="hover:text-blue-300 transition"
            >
              FAMOUS LETTER PRESS
            </button>
          ) : (
            "FAMOUS LETTER PRESS"
          )}
        </h1>
        <nav className="flex items-center space-x-6">
          {/* New Bill */}
          {isMenuItemVisible('newBill') && (
            <button
              onClick={() => navigateTo('/new-bill')}
              className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                getActiveClass('/new-bill')
              }`}
            >
              New Bill
            </button>
          )}

          {/* Material and Stock Dropdown */}
          {isMenuItemVisible('materials') && (
            <div className="group inline-block relative">
              <button 
                className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                  location.pathname.includes('/material-stock') ? "underline text-blue-300" : ""
                }`}
              >
                Material & Stock
              </button>
              <div className="absolute hidden group-hover:block bg-white text-black rounded shadow-md z-10 left-0 min-w-max">
                <button
                  onClick={() => navigateTo('/material-stock/paper-db')}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap ${
                    isActive('/material-stock/paper-db') ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  Paper Management
                </button>
                <button
                  onClick={() => navigateTo('/material-stock/material-db')}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap ${
                    isActive('/material-stock/material-db') ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  Material Management
                </button>
                <button
                  onClick={() => navigateTo('/material-stock/dies-db')}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap ${
                    isActive('/material-stock/dies-db') ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  Die Management
                </button>
                <button
                  onClick={() => navigateTo('/material-stock/standard-rates-db')}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap ${
                    isActive('/material-stock/standard-rates-db') ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  Labour Management
                </button>
                <button
                  onClick={() => navigateTo('/material-stock/overheads')}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap ${
                    isActive('/material-stock/overheads') ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  Overheads Management
                </button>
                
                {/* Add Loyalty Program Management menu item */}
                {isMenuItemVisible('loyaltyProgram') && (
                  <button
                    onClick={() => navigateTo('/material-stock/loyalty-tiers')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap ${
                      isActive('/material-stock/loyalty-tiers') ? "bg-gray-200 font-semibold" : ""
                    }`}
                  >
                    Loyalty Program Management
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Clients */}
          {isMenuItemVisible('clients') && (
            <button
              onClick={() => navigateTo('/clients')}
              className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                getActiveClass('/clients')
              }`}
            >
              Clients
            </button>
          )}

          {/* Estimates */}
          {isMenuItemVisible('estimates') && (
            <button
              onClick={() => navigateTo('/material-stock/estimates-db')}
              className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                getActiveClass('/material-stock/estimates-db')
              }`}
            >
              Estimates
            </button>
          )}

          {/* Orders */}
          {isMenuItemVisible('orders') && (
            <button
              onClick={() => navigateTo('/orders')}
              className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                getActiveClass('/orders')
              }`}
            >
              Orders
            </button>
          )}

          {/* Invoices */}
          {isMenuItemVisible('invoices') && (
            <button
              onClick={() => navigateTo('/invoices')}
              className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                getActiveClass('/invoices')
              }`}
            >
              Invoices
            </button>
          )}

          {/* NEW: Loyalty Dashboard - Moved to main navigation */}
          {isMenuItemVisible('loyaltyProgram') && (
            <button
              onClick={() => navigateTo('/loyalty-dashboard')}
              className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                getActiveClass('/loyalty-dashboard')
              }`}
            >
              Loyalty Dashboard
            </button>
          )}

          {/* Transactions */}
          {isMenuItemVisible('transactions') && (
            <button
              onClick={() => navigateTo('/transactions')}
              className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                getActiveClass('/transactions')
              }`}
            >
              Transactions
            </button>
          )}

          {/* B2B Dashboard */}
          {userRole === "b2b" && (
            <button
              onClick={() => navigateTo("/b2b-dashboard")}
              className={`hover:underline hover:text-blue-300 transition whitespace-nowrap ${
                getActiveClass('/b2b-dashboard')
              }`}
            >
              Dashboard
            </button>
          )}
         
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center hover:text-blue-300 transition ${
                location.pathname === '/change-password' || location.pathname === '/user-management' 
                  ? "text-blue-300" : ""
              }`}
            >
              <span className="mr-2">{userDisplayText}</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={showProfileMenu ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-md z-10">
                <div className="p-2 border-b text-sm text-gray-500">
                  Logged in as <span className="font-semibold">{userRole}</span>
                </div>

                {/* User Management - Only for Admin */}
                {isMenuItemVisible('userManagement') && (
                  <button
                    onClick={() => navigateTo('/user-management')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-200 ${
                      isActive('/user-management') ? "bg-gray-200 font-semibold" : ""
                    }`}
                  >
                    User Management
                  </button>
                )}
               
                {/* Change Password - Always Visible */}
                <button
                  onClick={() => navigateTo('/change-password')}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-200 ${
                    isActive('/change-password') ? "bg-gray-200 font-semibold" : ""
                  }`}
                >
                  Change Password
                </button>
               
                {/* Logout - Always Visible */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;