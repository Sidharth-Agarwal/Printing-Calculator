import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import SearchableClientDropdown from "./SearchableClientDropdown";
import ClientSummaryCard from "./ClientSummaryCard";

const ClientSelection = ({ onClientSelect, selectedClient, setSelectedClient }) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch clients from Firestore
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const clientsCollection = collection(db, "clients");
        const querySnapshot = await getDocs(clientsCollection);
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    if (client) {
      onClientSelect({
        clientId: client.id,
        clientInfo: {
          name: client.name,
          clientCode: client.clientCode,
          clientType: client.clientType,
          contactPerson: client.contactPerson,
          email: client.email,
          phone: client.phone,
          address: client.address,
          billingAddress: client.billingAddress,
          gstin: client.gstin
        }
      });
    } else {
      onClientSelect(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Client <span className="text-red-500">*</span>
        </label>
        <SearchableClientDropdown 
          clients={clients}
          selectedClient={selectedClient}
          onClientSelect={handleClientSelect}
          isLoading={isLoading}
        />
      </div>
      
      {selectedClient && (
        <ClientSummaryCard client={selectedClient} />
      )}
      
      {!selectedClient && !isLoading && (
        <div className="bg-gray-50 rounded-md text-center">
          <p className="text-gray-600">Please select a client to continue</p>
        </div>
      )}
    </div>
  );
};

export default ClientSelection;