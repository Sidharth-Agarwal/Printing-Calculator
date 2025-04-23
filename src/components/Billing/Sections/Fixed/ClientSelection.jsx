import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { useAuth } from "../../../Login/AuthContext";

const ClientSelection = ({ onClientSelect, selectedClient, setSelectedClient, generateClientCode }) => {
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
    onClientSelect({
      clientId: client.id,
      clientInfo: client
    });
    setSelectedClient(client);
    setSearchTerm(""); // Clear search after selection
  };

  // Get filtered clients based on search term
  const getFilteredClients = () => {
    if (!searchTerm.trim()) {
      return clients;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTermLower) || 
      (client.clientCode && client.clientCode.toLowerCase().includes(searchTermLower))
    );
  };

  // Function to determine client type badge
  const getClientTypeBadge = (client) => {
    if (!client) return null;
    
    const clientType = (client.clientType || "DIRECT").toUpperCase();
    
    if (clientType === "B2B") {
      return <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">B2B</span>;
    } else {
      return <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Direct</span>;
    }
  };

  // B2B client display
  if (isB2BClient && selectedClient) {
    return (
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <div className="flex items-center mb-2">
          <span className="font-bold">Client:</span>
          <span className="ml-2 text-lg">{selectedClient.name}</span>
          {getClientTypeBadge(selectedClient)}
        </div>
        <div className="text-sm text-gray-600">
          <p>Client Code: {selectedClient.clientCode}</p>
          {selectedClient.contactPerson && (
            <p>Contact: {selectedClient.contactPerson}</p>
          )}
          {selectedClient.email && (
            <p>Email: {selectedClient.email}</p>
          )}
        </div>
      </div>
    );
  }

  // Loading state for all clients
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Loading clients...</p>
      </div>
    );
  }

  // Render selected client information
  if (selectedClient) {
    return (
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="font-bold">Client:</span>
            <span className="ml-2 text-lg">{selectedClient.name}</span>
            {getClientTypeBadge(selectedClient)}
          </div>
          <button
            onClick={() => {
              onClientSelect(null);
              setSelectedClient(null);
            }}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Change Client
          </button>
        </div>
        <div className="text-sm text-gray-600">
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

  // Client selection interface
  const filteredClients = getFilteredClients();

  return (
    <div>
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search clients by name or code..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      {/* Client list or dropdown */}
      {searchTerm ? (
        <div className="border rounded max-h-60 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <p className="p-3 text-gray-500">No clients found</p>
          ) : (
            filteredClients.map(client => (
              <div
                key={client.id}
                className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => handleClientSelect(client)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{client.name}</span>
                  {getClientTypeBadge(client)}
                </div>
                <div className="text-sm text-gray-600">{client.clientCode}</div>
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
            className="w-full p-2 border rounded"
          >
            <option value="">Select a client</option>
            {clients.map(client => {
              const clientType = (client.clientType || "DIRECT").toUpperCase();
              return (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.clientCode}) - {clientType}
                </option>
              );
            })}
          </select>
        </div>
      )}
    </div>
  );
};

export default ClientSelection;