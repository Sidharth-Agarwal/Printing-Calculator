import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./Login/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Header = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const navigateToNewTab = (path) => {
    window.open(path, '_blank', 'noopener noreferrer');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");

    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fetch the user's display name when component mounts
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
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  // Special case for setup-admin page - show minimal header
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

  // Helper function to check if user can access a feature
  const canAccess = (requiredRole) => {
    if (!requiredRole) return true; // No role required
    if (userRole === "admin") return true; // Admin can access everything
    return userRole === requiredRole;
  };

  // Get display text - either display name or email
  const userDisplayText = displayName || currentUser.email;

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold whitespace-nowrap">FAMOUS LETTER PRESS</h1>
        <nav className="flex items-center space-x-6">
          {/* New Bill */}
          {canAccess("staff") && (
            <button
              onClick={() => navigateToNewTab('/new-bill')}
              className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
            >
              New Bill
            </button>
          )}

          {/* Material and Stock Dropdown - Production staff and admin can access */}
          {canAccess("production") && (
            <div className="group inline-block relative">
              <button className="hover:underline hover:text-blue-300 transition whitespace-nowrap">
                Material & Stock
              </button>
              <div className="absolute hidden group-hover:block bg-white text-black rounded shadow-md z-10 left-0 min-w-max">
                <button
                  onClick={() => navigateToNewTab('/material-stock/paper-db')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
                >
                  Paper Management
                </button>
                <button
                  onClick={() => navigateToNewTab('/material-stock/material-db')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
                >
                  Material Management
                </button>
                <button
                  onClick={() => navigateToNewTab('/material-stock/dies-db')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
                >
                  Die Management
                </button>
               
                {/* Only admin can access these */}
                {userRole === "admin" && (
                  <>
                    <button
                      onClick={() => navigateToNewTab('/material-stock/standard-rates-db')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
                    >
                      Standard Rate Management
                    </button>
                    <button
                      onClick={() => navigateToNewTab('/material-stock/overheads')}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
                    >
                      Overheads Management
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Clients */}
          <button
            onClick={() => navigateToNewTab('/clients')}
            className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
          >
            Clients
          </button>

          {/* Estimates */}
          <button
            onClick={() => navigateToNewTab('/material-stock/estimates-db')}
            className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
          >
            Estimates
          </button>

          {/* Orders */}
          <button
            onClick={() => navigateToNewTab('/orders')}
            className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
          >
            Orders
          </button>

          {/* Orders */}
          <button
            onClick={() => navigateToNewTab('/invoices')}
            className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
          >
            Invoices
          </button>

          {/* Transactions - Staff and admin can access */}
          {canAccess("staff") && (
            <button
              onClick={() => navigateToNewTab('/transactions')}
              className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
            >
              Transactions
            </button>
          )}
         
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center hover:text-blue-300 transition"
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

                {userRole === 'admin' && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigateToNewTab('/user-management');
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                  >
                    User Management
                  </button>
                )}
               
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigateToNewTab('/change-password');
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Change Password
                </button>
               
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