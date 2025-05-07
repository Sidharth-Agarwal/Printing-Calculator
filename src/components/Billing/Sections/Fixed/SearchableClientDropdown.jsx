import React, { useState, useEffect, useRef } from "react";

const SearchableClientDropdown = ({ 
  clients,
  selectedClient,
  onClientSelect,
  onCreateNewClient,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const dropdownRef = useRef(null);

  // Filter clients when search term changes
  useEffect(() => {
    if (!searchTerm.trim() || !clients) {
      setFilteredClients([]);
      return;
    }

    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(lowercaseSearchTerm) ||
      client.clientCode.toLowerCase().includes(lowercaseSearchTerm) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(lowercaseSearchTerm)) ||
      (client.email && client.email.toLowerCase().includes(lowercaseSearchTerm))
    );
    
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search when selected client changes
  useEffect(() => {
    if (selectedClient) {
      setSearchTerm(selectedClient.name);
      setIsDropdownOpen(false);
    } else {
      setSearchTerm("");
    }
  }, [selectedClient]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleClientClick = (client) => {
    onClientSelect(client);
    setIsDropdownOpen(false);
  };

  const handleCreateNew = () => {
    onCreateNewClient();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search clients by name, code, or email..."
            className="border border-gray-300 rounded-md p-2 pl-10 w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            disabled={isLoading}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {selectedClient && (
          <button
            type="button"
            onClick={() => onClientSelect(null)}
            className="ml-2 px-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            title="Clear selection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {isDropdownOpen && (searchTerm.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto">
          {filteredClients.length > 0 ? (
            <ul>
              {filteredClients.map((client) => (
                <li
                  key={client.id}
                  onClick={() => handleClientClick(client)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{client.name}</div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>Code: {client.clientCode}</span>
                        {client.clientType && (
                          <span className={`px-1.5 py-0.5 ml-2 rounded-full text-xs ${
                            client.clientType.toUpperCase() === 'B2B' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.clientType}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {client.contactPerson && (
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Contact: {client.contactPerson}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center">
              <p className="text-gray-500">No clients found</p>
              {/* <button
                type="button"
                onClick={handleCreateNew}
                className="mt-2 text-red-600 hover:underline text-sm"
              >
                + Create new client
              </button> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableClientDropdown;