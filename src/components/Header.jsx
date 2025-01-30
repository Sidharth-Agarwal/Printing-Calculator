import React from "react";

const Header = () => {
  // Function to create a link that opens in a new tab
  const navigateToNewTab = (path) => {
    window.open(path, '_blank', 'noopener noreferrer');
  };

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Print Calculator</h1>
        <nav className="space-x-6 relative">
          {/* New Bill */}
          <button 
            onClick={() => navigateToNewTab('/new-bill')} 
            className="hover:underline hover:text-blue-300 transition"
          >
            New Bill
          </button>

          {/* Material and Stock Dropdown */}
          <div className="group inline-block relative">
            <button className="hover:underline hover:text-blue-300 transition">
              Material and Stock
            </button>
            <div className="absolute hidden group-hover:block bg-white text-black rounded shadow-md z-10">
              <button 
                onClick={() => navigateToNewTab('/material-stock/paper-db')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Paper DB
              </button>
              <button 
                onClick={() => navigateToNewTab('/material-stock/material-db')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Material DB
              </button>
              <button 
                onClick={() => navigateToNewTab('/material-stock/dies-db')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Dies DB
              </button>
              <button 
                onClick={() => navigateToNewTab('/material-stock/standard-rates-db')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Standard Rates DB
              </button>
            </div>
          </div>

          {/* Estimates */}
          <button 
            onClick={() => navigateToNewTab('/material-stock/estimates-db')} 
            className="hover:underline hover:text-blue-300 transition"
          >
            Estimates
          </button>

          {/* Orders */}
          <button 
            onClick={() => navigateToNewTab('/orders')} 
            className="hover:underline hover:text-blue-300 transition"
          >
            Orders
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;