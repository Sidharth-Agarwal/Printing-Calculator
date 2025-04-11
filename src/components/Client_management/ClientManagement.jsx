import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AddClientForm from "./AddClientForm";
import DisplayClientTable from "./DisplayClientTable";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clientsCollection = collection(db, "clients");
    const unsubscribe = onSnapshot(clientsCollection, (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Ensure clientType exists for all clients and is uppercase
        clientType: (doc.data().clientType || "DIRECT").toUpperCase()
      }));
      setClients(clientsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkClientCodeExists = async (code) => {
    const clientsCollection = collection(db, "clients");
    const q = query(clientsCollection, where("clientCode", "==", code));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const generateClientCode = async (clientName) => {
    try {
      // Clean the name: remove spaces, special characters, and take first 4 letters
      const prefix = clientName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 4)
        .toUpperCase();
      
      // Get all clients with this prefix to find the highest number
      const clientsCollection = collection(db, "clients");
      const querySnapshot = await getDocs(clientsCollection);
      
      let highestNum = 0;
      const pattern = new RegExp(`^${prefix}(\\d+)$`);
      
      // Look for existing codes with the same prefix
      querySnapshot.forEach(doc => {
        const clientData = doc.data();
        if (clientData.clientCode) {
          const match = clientData.clientCode.match(pattern);
          if (match && match[1]) {
            const num = parseInt(match[1]);
            if (!isNaN(num) && num > highestNum) {
              highestNum = num;
            }
          }
        }
      });
      
      // Generate new code with incremented number
      const nextNum = highestNum + 1;
      // Pad to ensure at least 3 digits
      const paddedNum = nextNum.toString().padStart(3, '0');
      
      return `${prefix}${paddedNum}`;
    } catch (error) {
      console.error("Error generating client code:", error);
      // Fallback to a simple random code if there's an error
      const randomNum = Math.floor(Math.random() * 900) + 100;
      return `${clientName.substring(0, 4).toUpperCase()}${randomNum}`;
    }
  };

  const addClient = async (clientData) => {
    try {
      // If client code not provided or is empty, generate one based on client name
      if (!clientData.clientCode || clientData.clientCode.trim() === "") {
        clientData.clientCode = await generateClientCode(clientData.name);
      } else {
        // Validate manually entered code is unique
        const exists = await checkClientCodeExists(clientData.clientCode);
        if (exists) {
          alert("This client code already exists. Please use a different code.");
          return false;
        }
      }
      
      // Add the client
      const clientsCollection = collection(db, "clients");
      await addDoc(clientsCollection, {
        ...clientData,
        activeEstimates: 0,
        activeOrders: 0,
        totalOrders: 0,
        totalSpend: 0,
        averageOrderValue: 0,
        recentOrders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      alert("Client added successfully!");
      return true;
    } catch (error) {
      console.error("Error adding client:", error);
      alert("Failed to add client");
      return false;
    }
  };

  const updateClient = async (id, updatedData) => {
    try {
      // If client code changed, check if the new code is unique
      if (selectedClient.clientCode !== updatedData.clientCode) {
        const exists = await checkClientCodeExists(updatedData.clientCode);
        if (exists) {
          alert("This client code already exists. Please use a different code.");
          return false;
        }
      }
      
      const clientDoc = doc(db, "clients", id);
      await updateDoc(clientDoc, {
        ...updatedData,
        updatedAt: new Date(),
      });
      
      setSelectedClient(null);
      alert("Client updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Failed to update client");
      return false;
    }
  };

  const deleteClient = async (id) => {
    if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "clients", id));
        alert("Client deleted successfully!");
      } catch (error) {
        console.error("Error deleting client:", error);
        alert("Failed to delete client");
      }
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Client Management</h1>
      <AddClientForm
        onSubmit={addClient}
        selectedClient={selectedClient}
        onUpdate={updateClient}
        setSelectedClient={setSelectedClient}
        generateClientCode={generateClientCode}
      />
      
      {isLoading ? (
        <div className="bg-white p-6 rounded shadow flex justify-center">
          <p className="text-gray-500">Loading clients...</p>
        </div>
      ) : (
        <DisplayClientTable
          clients={clients}
          onDelete={deleteClient}
          onEdit={setSelectedClient}
        />
      )}
    </div>
  );
};

export default ClientManagement;