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
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search clients by name, code, or email..."
          className="border rounded-md p-2 w-full text-sm"
          disabled={isLoading}
        />
        {selectedClient && (
          <button
            type="button"
            onClick={() => onClientSelect(null)}
            className="ml-2 px-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            title="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {isLoading && (
        <div className="absolute right-3 top-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {isDropdownOpen && (searchTerm.length > 0) && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredClients.length > 0 ? (
            <ul>
              {filteredClients.map((client) => (
                <li
                  key={client.id}
                  onClick={() => handleClientClick(client)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b"
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Code: {client.clientCode}</span>
                    {client.contactPerson && <span>{client.contactPerson}</span>}
                  </div>
                  {client.phone && (
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Phone: {client.phone}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3">
              <p className="text-gray-500">No clients found</p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="mt-2 text-blue-500 hover:underline text-sm"
              >
                + Create new client
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableClientDropdown;