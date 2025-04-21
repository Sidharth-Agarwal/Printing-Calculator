import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { useAuth } from "../../../Login/AuthContext";

const ClientSelection = ({ onClientSelect, selectedClient, setSelectedClient, generateClientCode }) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add auth context for user role detection
  const { userRole, currentUser } = useAuth();
  const isB2BClient = userRole === "b2b";

  // Fetch all clients for dropdown (for admin users)
  useEffect(() => {
    // Skip fetching all clients if user is B2B - they'll only use their own client
    if (isB2BClient) {
      setIsLoading(false);
      return;
    }
    
    const fetchClients = async () => {
      try {
        const clientsCollection = collection(db, "clients");
        const querySnapshot = await getDocs(clientsCollection);
        
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          clientId: doc.id, // Add clientId field for consistency
          ...doc.data()
        }));
        
        // Sort by name
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

  // Handle selection change
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    
    if (clientId === "") {
      // Clear selection
      onClientSelect(null);
      setSelectedClient(null);
    } else {
      // Find client in list
      const selectedClient = clients.find(client => client.id === clientId);
      if (selectedClient) {
        // Call the callback with client data including formatted clientId property
        onClientSelect({
          clientId: selectedClient.id,
          clientInfo: selectedClient
        });
        // Update local state
        setSelectedClient(selectedClient);
      }
    }
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.clientCode && client.clientCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // For B2B clients, we don't show selection controls, so just return null if no selected client
  if (isB2BClient && !selectedClient) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Loading your client data...</p>
      </div>
    );
  }

  // For B2B clients with a selected client, we show a read-only view
  if (isB2BClient && selectedClient) {
    return (
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <div className="flex items-center mb-2">
          <span className="font-bold">Client:</span>
          <span className="ml-2 text-lg">{selectedClient.name}</span>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            B2B Client
          </span>
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

  // For admin users, show the normal selection interface
  return (
    <div>
      {isLoading ? (
        <div className="text-center p-4">
          <p className="text-gray-500">Loading clients...</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search clients by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <select
              value={selectedClient?.id || ""}
              onChange={handleClientChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a client</option>
              {filteredClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.clientCode})
                </option>
              ))}
            </select>
          </div>
          
          {selectedClient && (
            <div className="p-4 bg-gray-50 rounded border">
              <h3 className="font-medium mb-2">Selected Client:</h3>
              <p><strong>Name:</strong> {selectedClient.name}</p>
              <p><strong>Code:</strong> {selectedClient.clientCode}</p>
              {selectedClient.contactPerson && (
                <p><strong>Contact:</strong> {selectedClient.contactPerson}</p>
              )}
              {selectedClient.email && (
                <p><strong>Email:</strong> {selectedClient.email}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClientSelection;