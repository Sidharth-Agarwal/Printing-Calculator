import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { useAuth } from "../../../Login/AuthContext";

const ClientSelection = ({ onClientSelect, selectedClient, setSelectedClient, generateClientCode, isEditMode = false }) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add auth context for user role detection
  const { userRole } = useAuth();
  const isB2BClient = userRole === "b2b";

  // Fetch all clients
  useEffect(() => {
    if (isB2BClient) {
      setIsLoading(false);
      return;
    }
    
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const clientsCollection = collection(db, "clients");
        const querySnapshot = await getDocs(clientsCollection);
        
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          clientId: doc.id,
          ...doc.data()
        }));
        
        clientsData.sort((a, b) => a.name.localeCompare(b.name));
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, [isB2BClient]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle client selection
  const handleClientSelect = (client) => {
    // Don't allow client selection in edit mode
    if (isEditMode) return;
    
    onClientSelect({
      clientId: client.id,
      clientInfo: client
    });
    setSelectedClient(client);
    setSearchTerm(""); // Clear search after selection
  };

  // Get filtered clients based on search term - UPDATED to include contact person
  const getFilteredClients = () => {
    if (!searchTerm.trim()) {
      return clients;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTermLower) || 
      (client.clientCode && client.clientCode.toLowerCase().includes(searchTermLower)) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(searchTermLower)) ||
      (client.email && client.email.toLowerCase().includes(searchTermLower))
    );
  };

  // Function to determine client type badge
  const getClientTypeBadge = (client) => {
    if (!client) return null;
    
    const clientType = (client.clientType || "DIRECT").toUpperCase();
    
    if (clientType === "B2B") {
      return <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">B2B</span>;
    } else {
      return <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Direct</span>;
    }
  };

  // B2B client display
  if (isB2BClient && selectedClient) {
    return (
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex items-center mb-2">
          <span className="font-bold text-gray-800">Client:</span>
          <span className="ml-2 text-lg">{selectedClient.name}</span>
          {getClientTypeBadge(selectedClient)}
        </div>
        <div className="text-sm text-gray-700">
          <p><strong>Code:</strong> {selectedClient.clientCode}</p>
          {selectedClient.contactPerson && (
            <p><strong>Contact:</strong> {selectedClient.contactPerson}</p>
          )}
          {selectedClient.email && (
            <p><strong>Email:</strong> {selectedClient.email}</p>
          )}
        </div>
      </div>
    );
  }

  // Loading state for all clients
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="inline-block animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent"></div>
        <p className="text-gray-500 mt-2">Loading clients...</p>
      </div>
    );
  }

  // Render selected client information
  if (selectedClient) {
    return (
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <span className="font-bold text-gray-800">Client:</span>
            <span className="ml-2 text-lg">{selectedClient.name}</span>
            {getClientTypeBadge(selectedClient)}
          </div>
          {/* Only show change client button if not in edit mode */}
          {!isEditMode && (
            <button
              onClick={() => {
                onClientSelect(null);
                setSelectedClient(null);
              }}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Change Client
            </button>
          )}
        </div>
        <div className="text-sm text-gray-700">
          <p><strong>Code:</strong> {selectedClient.clientCode}</p>
          {selectedClient.contactPerson && (
            <p><strong>Contact:</strong> {selectedClient.contactPerson}</p>
          )}
          {selectedClient.email && (
            <p><strong>Email:</strong> {selectedClient.email}</p>
          )}
        </div>
      </div>
    );
  }

  // Client selection interface - only shown if not in edit mode
  if (isEditMode) {
    return (
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-sm text-gray-600 italic">Client selection is not available in edit mode</p>
      </div>
    );
  }

  const filteredClients = getFilteredClients();

  return (
    <div>
      {/* Search input with improved placeholder text */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by client name, code, contact person or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Client list or dropdown */}
      {searchTerm ? (
        <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500">No clients found</p>
              {/* <button
                onClick={() => {
                  if (onCreateNewClient) onCreateNewClient();
                }}
                className="mt-2 text-red-600 hover:underline text-sm"
              >
                + Create new client
              </button> */}
            </div>
          ) : (
            filteredClients.map(client => (
              <div
                key={client.id}
                className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleClientSelect(client)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800">{client.name}</span>
                      {getClientTypeBadge(client)}
                    </div>
                    <div className="text-sm text-gray-500">{client.clientCode}</div>
                    {client.contactPerson && (
                      <div className="text-xs text-gray-500">Contact: {client.contactPerson}</div>
                    )}
                  </div>
                  <div className="text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="mb-4">
          <select
            value=""
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId) {
                const selected = clients.find(c => c.id === selectedId);
                if (selected) handleClientSelect(selected);
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Select a client</option>
            {clients.map(client => {
              const clientType = (client.clientType || "DIRECT").toUpperCase();
              const contactDisplay = client.contactPerson ? ` - Contact: ${client.contactPerson}` : '';
              return (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.clientCode}) - {clientType}{contactDisplay}
                </option>
              );
            })}
          </select>
          <div className="mt-2 text-right">
            {/* <button
              onClick={() => {
                if (onCreateNewClient) onCreateNewClient();
              }}
              className="text-red-600 hover:underline text-sm"
            >
              + Create new client
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSelection;