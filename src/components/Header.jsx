import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./Login/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { 
  MENU_STRUCTURE, 
  PROFILE_MENU_STRUCTURE, 
  isMenuItemVisible, 
  isDropdownVisible 
} from "../components/Login/routesConfig"; 
import logo from "../assets/logo.png";

const Header = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [clientData, setClientData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);

  // Modified function to navigate within the SPA
  const navigateTo = (path) => {
    navigate(path);
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    setActiveDropdown(null);
  };

  // Helper function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
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

  // Enhanced dropdown handlers with proper timing
  const handleDropdownEnter = (key) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(key);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu, showProfileMenu]);

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 to-black text-white shadow-lg">
        <div className="w-full px-6 py-2 flex items-center justify-center">
          <img src={logo} alt="Famous Logo" className="h-8 w-8 transition-all duration-300 hover:scale-110 hover:rotate-12" />
        </div>
      </header>
    );
  }

  // Return early if user is not authenticated
  if (!currentUser) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 to-black text-white shadow-lg">
        <div className="w-full px-6 py-2 flex items-center justify-center">
          <img src={logo} alt="Famous Logo" className="h-8 w-8 transition-all duration-300 hover:scale-110 hover:rotate-12" />
        </div>
      </header>
    );
  }

  // Determine display text for user
  let userDisplayText = displayName || currentUser.email;
  if (userRole === "b2b" && clientData) {
    userDisplayText = `${clientData.name}`;
  }

  // Generate navigation items from MENU_STRUCTURE
  const navItems = Object.values(MENU_STRUCTURE).map(item => ({
    ...item,
    visible: item.isDropdown 
      ? isDropdownVisible(item.key, userRole)
      : isMenuItemVisible(item.accessKey, userRole),
    dropdownItems: item.dropdownItems?.map(subItem => ({
      ...subItem,
      visible: isMenuItemVisible(subItem.accessKey, userRole)
    })).filter(subItem => subItem.visible) || []
  })).filter(item => item.visible).sort((a, b) => a.priority - b.priority);

  // Generate profile menu items
  const profileMenuItems = PROFILE_MENU_STRUCTURE.map(item => ({
    ...item,
    visible: isMenuItemVisible(item.accessKey, userRole)
  })).filter(item => item.visible);

  // Mobile Menu Component
  const MobileMenu = () => (
    <div className={`lg:hidden mobile-menu-container ${showMobileMenu ? 'block' : 'hidden'}`}>
      <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 max-h-screen overflow-y-auto">
        <div className="py-1">
          {navItems.map((item) => (
            <div key={item.key}>
              {item.isDropdown ? (
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-b border-gray-100 flex items-center">
                    <span className="mr-2 text-xs">{item.icon}</span>
                    {item.label}
                  </div>
                  {item.dropdownItems.map(subItem => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      onClick={() => navigateTo(subItem.path)}
                      className={`block px-6 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center ${
                        isActive(subItem.path) ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-gray-600"
                      }`}
                    >
                      <span className="mr-2 text-xs">{subItem.icon}</span>
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => navigateTo(item.path)}
                  className={`block px-4 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center ${
                    isActive(item.path) ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-gray-700"
                  }`}
                >
                  <span className="mr-2 text-xs">{item.icon}</span>
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 to-black text-white shadow-lg border-b border-gray-800">
      <div className="w-full px-4 lg:px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link 
            to={userRole === "b2b" ? "/b2b-dashboard" : "/"} 
            className="flex items-center space-x-2 group"
          >
            <img 
              src={logo} 
              alt="Famous Logo" 
              className="h-8 w-8 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => (
              item.isDropdown ? (
                <div 
                  key={item.key} 
                  className="relative group"
                  onMouseEnter={() => handleDropdownEnter(item.key)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      location.pathname.includes(item.path) && !location.pathname.includes('/estimates')
                        ? "bg-white bg-opacity-20 text-white" 
                        : "text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <span className="mr-1.5 text-xs">{item.icon}</span>
                    {item.label}
                    <svg
                      className={`ml-1 h-3 w-3 transition-transform duration-200 ${
                        activeDropdown === item.key ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Desktop Dropdown */}
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white text-gray-800 rounded-md shadow-xl border border-gray-200 min-w-48 transition-all duration-200 ${
                    activeDropdown === item.key ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                  }`}>
                    <div className="py-1">
                      {item.dropdownItems.map(subItem => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                            isActive(subItem.path) ? "bg-blue-50 text-blue-600" : "text-gray-700"
                          }`}
                        >
                          <span className="mr-2 text-xs">{subItem.icon}</span>
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-white bg-opacity-20 text-white" 
                      : "text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10"
                  }`}
                >
                  <span className="mr-1.5 text-xs">{item.icon}</span>
                  {item.label}
                </Link>
              )
            ))}
          </nav>
          
          {/* Right Side - Profile and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Profile Dropdown */}
            <div className="relative profile-menu-container">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-md transition-all duration-200 hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {(displayName || currentUser.email).charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium truncate max-w-28">{userDisplayText}</div>
                </div>
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-md shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
                        {(displayName || currentUser.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{userDisplayText}</div>
                        <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
                        {userRole && (
                          <div className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                            userRole === 'admin' ? 'bg-red-100 text-red-700' :
                            userRole === 'staff' ? 'bg-blue-100 text-blue-700' :
                            userRole === 'b2b' ? 'bg-green-100 text-green-700' :
                            userRole === 'production' ? 'bg-purple-100 text-purple-700' :
                            userRole === 'accountant' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {userRole.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    {/* Dynamic Profile Menu Items */}
                    {profileMenuItems.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <span className="mr-2 text-xs">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                   
                    {/* Logout - Always Visible */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm transition-colors hover:bg-red-50 text-red-600"
                    >
                      <span className="mr-2 text-xs">🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-1.5 rounded-md transition-colors hover:bg-white hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <svg
                className={`h-5 w-5 transition-transform duration-200 ${showMobileMenu ? "rotate-90" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu />
    </header>
  );
};

export default Header;