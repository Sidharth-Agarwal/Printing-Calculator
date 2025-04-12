import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AddClientForm from "./AddClientForm";
import DisplayClientTable from "./DisplayClientTable";
import { useAuth } from "../Login/AuthContext";
import B2BCredentialsManager from "./B2BCredentialsManager";
import AdminPasswordModal from "./AdminPasswordModal";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientForAuth, setSelectedClientForAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole, currentUser } = useAuth();
  const [adminCredentials, setAdminCredentials] = useState(null);
  
  // Modal state for admin password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingClient, setPendingClient] = useState(null);

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

  // Store admin credentials for re-authentication
  const handleAdminPasswordConfirm = (password) => {
    if (currentUser && currentUser.email && password) {
      setAdminCredentials({
        email: currentUser.email,
        password: password
      });
      setShowPasswordModal(false);
      
      // Now that we have the credentials, open the B2B credentials modal
      setSelectedClientForAuth(pendingClient);
    }
  };

  const handleAdminPasswordCancel = () => {
    setShowPasswordModal(false);
    setPendingClient(null);
  };

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
        hasAccount: false, // Flag for B2B client login account
        userId: null, // Reference to Firebase Auth user ID if B2B client
        temporaryPassword: null, // To store the temporary password
        passwordCreatedAt: null // When the password was created
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

  const handleClientUpdateAfterAuth = async (updatedClient) => {
    try {
      // The onSnapshot listener will pick up the changes automatically
    } catch (error) {
      console.error("Error updating client after auth changes:", error);
    }
  };

  const handleManageCredentials = (client) => {
    // Store the client and show the password modal
    setPendingClient(client);
    setShowPasswordModal(true);
  };

  const handleCredentialManagerClose = () => {
    setSelectedClientForAuth(null);
    // Clear admin credentials for security
    setAdminCredentials(null);
  };

  const deleteClient = async (id) => {
    if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      try {
        // Find the client to check if it has a user account
        const clientToDelete = clients.find(client => client.id === id);
        
        // If the client has a user account, warn about it
        if (clientToDelete && clientToDelete.hasAccount) {
          const confirmDelete = window.confirm(
            "This client has a user account. Deleting this client will NOT delete their authentication account. " +
            "You should manually disable their account in User Management. Continue with deletion?"
          );
          
          if (!confirmDelete) {
            return;
          }
        }
        
        await deleteDoc(doc(db, "clients", id));
        alert("Client deleted successfully!");
      } catch (error) {
        console.error("Error deleting client:", error);
        alert("Failed to delete client");
      }
    }
  };

  // Check if user is admin - only admins should be able to manage B2B credentials
  const isAdmin = userRole === "admin";

  // Redirect non-admin users who somehow access this page
  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
        <p className="text-red-600">You don't have permission to access client management.</p>
      </div>
    );
  }

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
          onManageCredentials={handleManageCredentials}
          isAdmin={isAdmin}
        />
      )}

      {/* B2B Client Credentials Manager Modal */}
      {selectedClientForAuth && (
        <B2BCredentialsManager
          client={selectedClientForAuth}
          onClose={handleCredentialManagerClose}
          onSuccess={handleClientUpdateAfterAuth}
          adminCredentials={adminCredentials}
        />
      )}

      {/* Admin Password Modal */}
      <AdminPasswordModal
        isOpen={showPasswordModal}
        onConfirm={handleAdminPasswordConfirm}
        onCancel={handleAdminPasswordCancel}
      />
    </div>
  );
};

export default ClientManagement;