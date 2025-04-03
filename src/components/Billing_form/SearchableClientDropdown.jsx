import React, { useState, useEffect, useRef } from "react";
import { searchClients } from "../../utils/clientUtils";

/**
 * Searchable client dropdown component
 * Similar to SearchablePaperDropdown but for clients
 */
const SearchableClientDropdown = ({ 
  selectedClient, 
  onChange, 
  placeholder = "Search for a client...", 
  className = "",
  required = false,
  error = null,
  onCreateNew = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch recent clients on initial load
  useEffect(() => {
    const fetchRecentClients = async () => {
      setIsLoading(true);
      try {
        const recentClients = await searchClients("", 5); // Empty search term returns recent clients
        setClients(recentClients);
        setFilteredClients(recentClients);
      } catch (error) {
        console.error("Error fetching recent clients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentClients();
  }, []);

  // Get the selected client object
  const selectedClientObj = typeof selectedClient === 'object' ? selectedClient :
    clients.find(client => client.id === selectedClient || client.clientCode === selectedClient);

  // Filter clients based on search term
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredClients(clients);
      return;
    }

    const lowercaseTerm = searchTerm.toLowerCase();
    const filtered = clients.filter(client => 
      (client.name && client.name.toLowerCase().includes(lowercaseTerm)) ||
      (client.clientCode && client.clientCode.toLowerCase().includes(lowercaseTerm)) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(lowercaseTerm))
    );

    // If no local results and search term is long enough, search remotely
    if (filtered.length === 0 && searchTerm.length >= 2) {
      const performSearch = async () => {
        setIsLoading(true);
        try {
          const results = await searchClients(searchTerm);
          
          // Update both the filtered list and the full client list with new results
          setFilteredClients(results);
          
          // Add any new clients to the full list without duplicates
          setClients(prevClients => {
            const existingIds = new Set(prevClients.map(c => c.id));
            const newClients = results.filter(c => !existingIds.has(c.id));
            return [...prevClients, ...newClients];
          });
        } catch (error) {
          console.error("Error searching clients:", error);
        } finally {
          setIsLoading(false);
        }
      };

      performSearch();
    } else {
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const handleSelect = (client) => {
    onChange(client);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected client display (closed state) */}
      {!isOpen && selectedClientObj ? (
        <div
          onClick={() => setIsOpen(true)}
          className={`border rounded-md p-2 w-full text-sm flex justify-between items-center cursor-pointer bg-white ${
            error ? "border-red-500" : ""
          }`}
        >
          <div className="flex flex-col">
            <span className="font-medium">{selectedClientObj.name}</span>
            <span className="text-xs text-gray-500">
              {selectedClientObj.clientCode} | {selectedClientObj.contactPerson || "No contact"}
            </span>
          </div>
          <span className="ml-2 text-gray-500">▼</span>
        </div>
      ) : (
        /* Search input (open state) */
        <div className={`border rounded-md p-1 w-full text-sm flex bg-white ${
          error ? "border-red-500" : ""
        }`}>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="flex-grow p-1 outline-none"
            onClick={() => setIsOpen(true)}
            required={required}
          />
          <button
            type="button"
            className="px-2 text-gray-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "▲" : "▼"}
          </button>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Dropdown (open state) */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Search header - always visible */}
          <div className="sticky top-0 bg-white p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search clients..."
              className="border rounded-md p-2 w-full text-sm"
            />
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
            </div>
          )}

          {/* Results */}
          <div>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedClientObj?.id === client.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleSelect(client)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    <span className="text-xs text-gray-500">
                      {client.clientCode} | {client.contactPerson || "No contact"}
                      {client.estimates?.count ? ` | ${client.estimates.count} estimates` : ""}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500">
                {searchTerm.length < 2 ? (
                  <div>Start typing to search clients</div>
                ) : (
                  <div>
                    <p>No clients found</p>
                    {onCreateNew && (
                      <button
                        type="button"
                        onClick={() => {
                          onCreateNew(searchTerm);
                          setIsOpen(false);
                        }}
                        className="mt-2 text-blue-600 hover:underline text-sm"
                      >
                        + Create new client "{searchTerm}"
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableClientDropdown;