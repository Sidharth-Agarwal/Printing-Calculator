import React from "react";

const Header = () => {
  const navigateToNewTab = (path) => {
    window.open(path, '_blank', 'noopener noreferrer');
  };

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold whitespace-nowrap">FAMOUS LETTER PRESS</h1>
        <nav className="flex items-center space-x-8">
          {/* New Bill */}
          <button 
            onClick={() => navigateToNewTab('/new-bill')} 
            className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
          >
            NEW BILL
          </button>

          {/* Material and Stock Dropdown */}
          <div className="group inline-block relative">
            <button className="hover:underline hover:text-blue-300 transition whitespace-nowrap">
              MATERIAL & STOCK
            </button>
            <div className="absolute hidden group-hover:block bg-white text-black rounded shadow-md z-10 left-0 min-w-max">
              <button 
                onClick={() => navigateToNewTab('/material-stock/paper-db')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
              >
                PAPER MANAGEMENT
              </button>
              <button 
                onClick={() => navigateToNewTab('/material-stock/material-db')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
              >
                MATERIAL MANAGEMENT
              </button>
              <button 
                onClick={() => navigateToNewTab('/material-stock/dies-db')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
              >
                DIE MANAGEMENT
              </button>
              <button 
                onClick={() => navigateToNewTab('/material-stock/standard-rates-db')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-200 whitespace-nowrap"
              >
                STANDARD RATES MANAGEMENT
              </button>
            </div>
          </div>

          {/* Estimates */}
          <button 
            onClick={() => navigateToNewTab('/material-stock/estimates-db')} 
            className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
          >
            ESTIMATES
          </button>

          {/* Orders */}
          <button 
            onClick={() => navigateToNewTab('/orders')} 
            className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
          >
            ORDERS
          </button>

          {/* Transactions */}
          <button 
            onClick={() => navigateToNewTab('/transactions')} 
            className="hover:underline hover:text-blue-300 transition whitespace-nowrap"
          >
            TRANSACTIONS
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;