import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig"; // Firebase auth instance
import { signOut } from "firebase/auth";
import { useAuth } from "../utils/AuthProvider"; // Use the Auth Context for user state

const Header = () => {
  const { currentUser } = useAuth(); // Access the current user from context
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out.");
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Print Calculator</h1>
        <nav className="space-x-6 relative">
          {currentUser ? (
            <>
              {/* New Bill */}
              <Link
                to="/new-bill"
                className="hover:underline hover:text-blue-300 transition"
              >
                New Bill
              </Link>

              {/* Material and Stock Dropdown */}
              <div className="group inline-block relative">
                <button className="hover:underline hover:text-blue-300 transition">
                  Material and Stock
                </button>
                <div className="absolute hidden group-hover:block bg-white text-black rounded shadow-md mt-1 z-10">
                  <Link
                    to="/material-stock/paper-db"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Paper DB
                  </Link>
                  <Link
                    to="/material-stock/material-db"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Material DB
                  </Link>
                  <Link
                    to="/material-stock/dies-db"
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Dies DB
                  </Link>
                </div>
              </div>

              {/* Estimates */}
              <Link
                to="/material-stock/estimates-db"
                className="hover:underline hover:text-blue-300 transition"
              >
                Estimates
              </Link>

              {/* Orders */}
              <Link
                to="/orders"
                className="hover:underline hover:text-blue-300 transition"
              >
                Orders
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hover:underline hover:text-blue-300 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/"
              className="hover:underline hover:text-blue-300 transition"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
