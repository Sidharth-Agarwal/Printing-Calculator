// ClientManagement.jsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AddClientForm from "./AddClientForm";
import DisplayClientTable from "./DisplayClientTable";
import { useAuth } from "../Login/AuthContext";
import B2BCredentialsManager from "./B2BCredentialsManager";
import AdminPasswordModal from "./AdminPasswordModal";
import ActivateClientModal from "./ActivateClientModal";
import Modal from "../Shared/Modal";
import ConfirmationModal from "../Shared/ConfirmationModal";
import DeleteConfirmationModal from "../Shared/DeleteConfirmationModal";
import { CLIENT_FIELDS } from "../../constants/entityFields";
import { generateClientCode, checkClientCodeExists } from "../../services/clientCodeService";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClientForAuth, setSelectedClientForAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userRole, currentUser } = useAuth();
  const [adminCredentials, setAdminCredentials] = useState(null);
  
  // Modal state for admin password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingClient, setPendingClient] = useState(null);
  const [clientToActivate, setClientToActivate] = useState(null);

  // State for notifications/confirmation modals
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    title: "",
    status: "success"
  });
  
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    itemId: null,
    itemName: ""
  });

  // Client statistics
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    activeClients: 0,
    b2bClients: 0,
    directClients: 0
  });

  // Get default form data structure based on CLIENT_FIELDS
  const getDefaultClientData = () => {
    // Start with an empty object
    const clientData = {};
    
    // Add basic info fields with defaults
    CLIENT_FIELDS.BASIC_INFO.forEach(field => {
      if (field.name.includes('.')) {
        // Handle nested fields
        const [parent, child] = field.name.split('.');
        if (!clientData[parent]) clientData[parent] = {};
        clientData[parent][child] = field.defaultValue || "";
      } else {
        clientData[field.name] = field.defaultValue || "";
      }
    });
    
    // Add address fields
    clientData.address = {};
    CLIENT_FIELDS.ADDRESS.forEach(field => {
      const child = field.name.split('.')[1];
      clientData.address[child] = "";
    });
    
    // Add billing address fields
    clientData.billingAddress = {};
    CLIENT_FIELDS.BILLING_ADDRESS.forEach(field => {
      const child = field.name.split('.')[1];
      clientData.billingAddress[child] = "";
    });
    
    // Add notes
    clientData.notes = "";
    
    // Add other required properties
    clientData.isActive = true;
    
    return clientData;
  };

  useEffect(() => {
    const clientsCollection = collection(db, "clients");
    const unsubscribe = onSnapshot(clientsCollection, (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Ensure all fields exist with defaults based on CLIENT_FIELDS
        const clientData = {
          id: doc.id,
          ...getDefaultClientData(),
          ...data,
          // Ensure clientType exists for all clients and is uppercase for consistency
          clientType: (data.clientType || "DIRECT").toUpperCase(),
          // Ensure isActive exists for all clients
          isActive: data.isActive !== undefined ? data.isActive : true
        };
        
        return clientData;
      });
      
      setClients(clientsData);
      
      // Calculate client statistics
      const stats = {
        totalClients: clientsData.length,
        activeClients: clientsData.filter(client => client.isActive).length,
        b2bClients: clientsData.filter(client => client.clientType === "B2B").length,
        directClients: clientsData.filter(client => client.clientType === "DIRECT").length
      };
      setClientStats(stats);
      
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

  const handleAddClick = () => {
    setSelectedClient(null); // Ensure we're not in edit mode
    setIsFormModalOpen(true);
  };

  const addClient = async (clientData) => {
    setIsSubmitting(true);
    try {
      // If client code not provided or is empty, generate one based on client name
      if (!clientData.clientCode || clientData.clientCode.trim() === "") {
        clientData.clientCode = await generateClientCode(clientData.name);
      } else {
        // Validate manually entered code is unique
        const exists = await checkClientCodeExists(clientData.clientCode);
        if (exists) {
          setNotification({
            isOpen: true,
            message: "This client code already exists. Please use a different code.",
            title: "Error",
            status: "error"
          });
          setIsSubmitting(false);
          return false;
        }
      }
      
      // Add the client with additional metadata fields
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
      
      setNotification({
        isOpen: true,
        message: "Client added successfully!",
        title: "Success",
        status: "success"
      });
      setIsFormModalOpen(false);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Error adding client:", error);
      setNotification({
        isOpen: true,
        message: "Failed to add client: " + error.message,
        title: "Error",
        status: "error"
      });
      setIsSubmitting(false);
      return false;
    }
  };

  const handleEditClick = (client) => {
    setSelectedClient({...client}); // Make a copy to ensure we don't modify the original
    setIsFormModalOpen(true);
  };

  const updateClient = async (id, updatedData) => {
    setIsSubmitting(true);
    try {
      // If client code changed, check if the new code is unique
      if (selectedClient.clientCode !== updatedData.clientCode) {
        const exists = await checkClientCodeExists(updatedData.clientCode);
        if (exists) {
          setNotification({
            isOpen: true,
            message: "This client code already exists. Please use a different code.",
            title: "Error",
            status: "error"
          });
          setIsSubmitting(false);
          return false;
        }
      }
      
      const clientDoc = doc(db, "clients", id);
      await updateDoc(clientDoc, {
        ...updatedData,
        updatedAt: new Date(),
      });
      
      setIsFormModalOpen(false);
      setSelectedClient(null);
      setNotification({
        isOpen: true,
        message: "Client updated successfully!",
        title: "Success",
        status: "success"
      });
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Error updating client:", error);
      setNotification({
        isOpen: true,
        message: "Failed to update client: " + error.message,
        title: "Error",
        status: "error"
      });
      setIsSubmitting(false);
      return false;
    }
  };

  const toggleClientStatus = async (clientId, newStatus) => {
    try {
      const clientDoc = doc(db, "clients", clientId);
      await updateDoc(clientDoc, {
        isActive: newStatus,
        updatedAt: new Date()
      });
      
      setNotification({
        isOpen: true,
        message: `Client ${newStatus ? 'activated' : 'deactivated'} successfully!`,
        title: "Success",
        status: "success"
      });
      
      return true;
    } catch (error) {
      console.error("Error toggling client status:", error);
      setNotification({
        isOpen: true,
        message: "Failed to update client status: " + error.message,
        title: "Error",
        status: "error"
      });
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

  const handleActivateClient = (client) => {
    setClientToActivate(client);
  };

  const handleActivationClose = () => {
    setClientToActivate(null);
  };

  const handleActivationSuccess = (updatedClient) => {
    // This will trigger the onSnapshot listener to refresh the client list
    // The page will be reloaded by the ActivateClientModal
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
    
    // Make sure we stay on the clients page
    window.history.pushState({}, "", "/clients");
  };

  const confirmDelete = (id, name) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: id,
      itemName: name
    });
  };

  const closeDeleteModal = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null,
      itemName: ""
    });
  };

  const closeNotification = () => {
    setNotification({
      isOpen: false,
      message: "",
      title: "",
      status: "success"
    });
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedClient(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Find the client to check if it has a user account
      const clientToDelete = clients.find(client => client.id === deleteConfirmation.itemId);
      
      // If the client has a user account, warn about it
      if (clientToDelete && clientToDelete.hasAccount) {
        setDeleteConfirmation({
          isOpen: false,
          itemId: null,
          itemName: ""
        });
        
        setNotification({
          isOpen: true,
          message: "This client has a user account. Deleting this client will NOT delete their authentication account. " +
                  "You should manually disable their account in User Management before deleting the client.",
          title: "Warning",
          status: "warning"
        });
        return;
      }
      
      // First, get all estimates associated with this client
      const estimatesQuery = query(
        collection(db, "estimates"), 
        where("clientId", "==", deleteConfirmation.itemId)
      );
      
      const estimatesSnapshot = await getDocs(estimatesQuery);
      
      // Delete each estimate
      const estimateDeletePromises = estimatesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      // Wait for all estimate deletions to complete
      await Promise.all(estimateDeletePromises);
      
      // Now delete the client
      await deleteDoc(doc(db, "clients", deleteConfirmation.itemId));
      
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: `Client and ${estimatesSnapshot.size} associated estimate(s) deleted successfully!`,
        title: "Success",
        status: "success"
      });
    } catch (error) {
      console.error("Error deleting client:", error);
      closeDeleteModal();
      
      setNotification({
        isOpen: true,
        message: "Failed to delete client: " + error.message,
        title: "Error",
        status: "error"
      });
    }
  };

  // Check if user is admin or staff - only they should access this page
  const isAdmin = userRole === "admin";

  // Redirect non-authorized users
  if (!isAdmin && userRole !== "staff") {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to access client management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
        <p className="text-gray-600 mt-1">
          Add, edit, and manage your clients and their access credentials
        </p>
      </div>

      {/* Client Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Clients</h2>
          <p className="text-2xl font-bold text-gray-800">{clientStats.totalClients}</p>
          <p className="text-xs text-gray-500 mt-1">
            {clientStats.activeClients} active clients
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">B2B Clients</h2>
          <p className="text-2xl font-bold text-red-600">{clientStats.b2bClients}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((clientStats.b2bClients / clientStats.totalClients) * 100 || 0).toFixed(1)}% of total clients
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Direct Clients</h2>
          <p className="text-2xl font-bold text-blue-600">{clientStats.directClients}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((clientStats.directClients / clientStats.totalClients) * 100 || 0).toFixed(1)}% of total clients
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Inactive Clients</h2>
          <p className="text-2xl font-bold text-gray-400">{clientStats.totalClients - clientStats.activeClients}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((clientStats.totalClients - clientStats.activeClients) / clientStats.totalClients * 100 || 0).toFixed(1)}% of total clients
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAddClick}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Client
        </button>
      </div>
      
      {/* Table component */}
      <div className="bg-white overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <DisplayClientTable
            clients={clients}
            onDelete={(id) => {
              const client = clients.find(c => c.id === id);
              confirmDelete(id, client?.name || "this client");
            }}
            onEdit={handleEditClick}
            onManageCredentials={handleManageCredentials}
            onActivateClient={handleActivateClient}
            onToggleStatus={toggleClientStatus}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={selectedClient ? "Edit Client" : "Add New Client"}
        size="lg"
      >
        <AddClientForm
          onSubmit={addClient}
          selectedClient={selectedClient}
          onUpdate={updateClient}
          setSelectedClient={setSelectedClient}
          generateClientCode={generateClientCode}
        />
      </Modal>

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
        adminEmail={currentUser?.email || ""}
      />

      {/* Activate Client Modal */}
      {clientToActivate && (
        <ActivateClientModal
          client={clientToActivate}
          onClose={handleActivationClose}
          onSuccess={handleActivationSuccess}
          adminEmail={currentUser?.email || ""}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        message={notification.message}
        title={notification.title}
        status={notification.status}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={deleteConfirmation.itemName}
      />
    </div>
  );
};

export default ClientManagement;