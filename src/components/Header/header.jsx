import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Print Calculator</h1>
        <nav className="space-x-6 relative">
          <Link to="/new-bill" className="hover:underline hover:text-blue-300 transition">
            New Bill
          </Link>

          {/* Material and Stock Dropdown */}
          <div className="group inline-block relative">
            <button className="hover:underline hover:text-blue-300 transition">
              Material and Stock
            </button>
            <div className="absolute hidden group-hover:block bg-white text-black rounded shadow-md mt-1 z-10">
              <Link to="/material-stock/paper-db" className="block px-4 py-2 hover:bg-gray-200">
                Paper DB
              </Link>
              <Link to="/material-stock/material-db" className="block px-4 py-2 hover:bg-gray-200">
                Material DB
              </Link>
              <Link to="/material-stock/dies-db" className="block px-4 py-2 hover:bg-gray-200">
                Dies DB
              </Link>
              <Link to="/material-stock/estimates-db" className="block px-4 py-2 hover:bg-gray-200">
                Estimates DB
              </Link>
              <Link to="/material-stock/standard-rates-db" className="block px-4 py-2 hover:bg-gray-200">
                Standard Rates DB
              </Link>
            </div>
          </div>

          <Link to="/transactions" className="hover:underline hover:text-blue-300 transition">
            Transactions
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
