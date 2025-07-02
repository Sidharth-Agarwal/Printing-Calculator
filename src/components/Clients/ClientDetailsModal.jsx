import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { CLIENT_FIELDS } from "../../constants/entityFields";
import DiscussionHistory from "../Shared/DiscussionHistory";
import CRMActionButton from "../Shared/CRMActionButton";
import ImportantDatesList from "./ImportantDatesList";
import ClientImportantDatesModal from "./ClientImportantDatesModal";
import { 
  createClientDate, 
  updateClientDate, 
  deleteClientDate 
} from "../../services/clientDatesService";

const ClientDetailsModal = ({ 
  client, 
  onClose, 
  onEdit, 
  onToggleStatus, 
  onAddDiscussion,
  isAdmin 
}) => {
  const [discussions, setDiscussions] = useState([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);
  const [importantDatesModal, setImportantDatesModal] = useState({
    isOpen: false,
    editingDate: null
  });
  const [datesLoading, setDatesLoading] = useState(false);
  const [importantDatesKey, setImportantDatesKey] = useState(0); // NEW: Force refresh key
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Fetch discussions when client changes - using real-time updates
  useEffect(() => {
    if (!client || !client.id) {
      console.log("No client provided or client missing ID");
      return;
    }
    
    console.log("Fetching discussions for client:", client.id);
    setIsLoadingDiscussions(true);
    
    // Create query with real-time updates
    const discussionsQuery = query(
      collection(db, "discussions"),
      where("clientId", "==", client.id),
      orderBy("date", "desc")
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(discussionsQuery, (snapshot) => {
      const discussionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Fetched client discussions:", discussionsData);
      setDiscussions(discussionsData);
      setIsLoadingDiscussions(false);
    }, (error) => {
      console.error("Error fetching client discussions:", error);
      setIsLoadingDiscussions(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [client]);

  // Handle discussion updates (refresh when edited/deleted)
  const refreshDiscussions = async () => {
    if (!client || !client.id) return;
    
    setIsLoadingDiscussions(true);
    try {
      // Fetch discussions again
      const discussionsQuery = query(
        collection(db, "discussions"),
        where("clientId", "==", client.id),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await getDocs(discussionsQuery);
      const discussionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDiscussions(discussionsData);
    } catch (error) {
      console.error("Error refreshing client discussions:", error);
      showNotification("Error updating discussions", "error");
    } finally {
      setIsLoadingDiscussions(false);
    }
  };

  // Handle important dates operations
  const handleAddImportantDate = (client) => {
    setImportantDatesModal({
      isOpen: true,
      editingDate: null
    });
  };

  const handleEditImportantDate = (dateItem) => {
    setImportantDatesModal({
      isOpen: true,
      editingDate: dateItem
    });
  };

  const handleSubmitImportantDate = async (clientId, dateData, editingDateId = null) => {
    try {
      setDatesLoading(true);
      
      if (editingDateId) {
        // Update existing date
        await updateClientDate(editingDateId, dateData);
        showNotification("Important date updated successfully!", "success");
      } else {
        // Create new date
        await createClientDate(clientId, dateData, "current-user-id"); // Replace with actual user ID
        showNotification("Important date added successfully!", "success");
      }
      
      // Close modal
      setImportantDatesModal({ isOpen: false, editingDate: null });
      
      // Force refresh of ImportantDatesList
      setImportantDatesKey(prev => prev + 1);
      
      // The ImportantDatesList component will auto-refresh
    } catch (error) {
      console.error("Error submitting important date:", error);
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setDatesLoading(false);
    }
  };

  const handleDeleteImportantDate = async (dateId) => {
    try {
      setDatesLoading(true);
      await deleteClientDate(dateId);
      showNotification("Important date deleted successfully!", "success");
      
      // Force refresh of ImportantDatesList
      setImportantDatesKey(prev => prev + 1);
      
      // The ImportantDatesList component will auto-refresh
    } catch (error) {
      console.error("Error deleting important date:", error);
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setDatesLoading(false);
    }
  };

  const handleCloseImportantDatesModal = () => {
    setImportantDatesModal({ isOpen: false, editingDate: null });
  };

  if (!client) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  // Get header style based on loyalty tier for B2B clients
  const getHeaderStyle = () => {
    // Check if client is B2B and has loyalty tier
    const isB2B = client.clientType?.toUpperCase() === "B2B";
    const hasLoyaltyTier = isB2B && client.loyaltyTierId && client.loyaltyTierColor;
    
    if (hasLoyaltyTier) {
      const tierColor = client.loyaltyTierColor;
      return {
        backgroundImage: `linear-gradient(to right, ${tierColor}, ${tierColor}cc)`,
        color: 'white'
      };
    }
    
    return {
      backgroundColor: '#1f2937', // Default gray-900 from Tailwind
      color: 'white'
    };
  };

  // Determine if client has B2B loyalty tier
  const hasLoyaltyTier = client.clientType?.toUpperCase() === "B2B" && 
                          client.loyaltyTierId && 
                          client.loyaltyTierName;

  // Get field value from client object using field name
  const getFieldValue = (fieldName) => {
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      return client[parent] && client[parent][child] ? client[parent][child] : 'N/A';
    }
    return client[fieldName] !== undefined ? client[fieldName] : 'N/A';
  };

  // Render address section from fields array
  const renderAddressSection = (title, fields, addressObject) => {
    if (!addressObject || !addressObject.line1) {
      return (
        <div className="bg-gray-50 rounded p-3">
          <h4 className="text-base font-semibold mb-2 text-gray-700">{title}</h4>
          <p className="text-sm text-gray-500">N/A</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded p-3">
        <h4 className="text-base font-semibold mb-2 text-gray-700">{title}</h4>
        <div className="space-y-0.5 text-sm">
          <p>{addressObject.line1}</p>
          {addressObject.line2 && <p>{addressObject.line2}</p>}
          <p>
            {[
              addressObject.city, 
              addressObject.state, 
              addressObject.postalCode
            ].filter(Boolean).join(", ")}
          </p>
          <p>{addressObject.country || ""}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 overflow-auto max-h-[90vh]">
        {/* Header with loyalty tier styling if applicable */}
        <div className="p-4 flex justify-between items-center" style={getHeaderStyle()}>
          <h3 className="text-lg font-semibold">
            Client Details
            {hasLoyaltyTier && (
              <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                {client.loyaltyTierName} Tier
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Notification */}
        {notification.show && (
          <div className={`mx-4 mt-4 p-3 rounded ${
            notification.type === "success" 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-red-100 text-red-700 border border-red-200"
          }`}>
            {notification.message}
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row h-[calc(90vh-4rem)] overflow-hidden">
          {/* Client Information */}
          <div className="w-full lg:w-1/3 p-4 overflow-y-auto border-r border-gray-200">
            {/* Basic Info */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{client.name}</h2>
                  <div className="flex items-center mt-1 flex-wrap gap-2">
                    <p className="text-gray-500 text-sm">{client.clientCode}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.clientType?.toUpperCase() === "B2B"
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {(client.clientType || "Direct").toUpperCase()}
                    </span>
                    {client.hasAccount && (
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Account Active
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Status Badge and Toggle Button */}
                <div className="flex flex-col items-end mt-2 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    client.isActive
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {client.isActive ? "Active Client" : "Inactive Client"}
                  </span>
                  
                  {onToggleStatus && (
                    <button 
                      onClick={onToggleStatus}
                      className={`mt-2 px-3 py-1.5 text-xs rounded-md flex items-center ${
                        client.isActive
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                          : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      {client.isActive ? "Mark as Inactive" : "Mark as Active"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  {CLIENT_FIELDS.BASIC_INFO.filter(field => 
                    !['clientCode', 'name', 'clientType', 'isActive'].includes(field.name)
                  ).map(field => (
                    <div key={field.name}>
                      <span className="text-gray-500">{field.label}:</span> 
                      <span className="ml-1 font-medium">{getFieldValue(field.name) || "N/A"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Primary Address */}
            <div className="mb-6">
              {renderAddressSection("Primary Address", CLIENT_FIELDS.ADDRESS, client.address)}
            </div>
            
            {/* Billing Address */}
            <div className="mb-6">
              {renderAddressSection("Billing Address", CLIENT_FIELDS.BILLING_ADDRESS, client.billingAddress)}
            </div>
            
            {/* Account Statistics */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Account Statistics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Active Orders</p>
                    <p className="text-lg font-medium">{client.activeOrders || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Orders</p>
                    <p className="text-lg font-medium">{client.totalOrders || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Spend</p>
                    <p className="text-lg font-medium">{formatCurrency(client.totalSpend)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg. Order Value</p>
                    <p className="text-lg font-medium">{formatCurrency(client.averageOrderValue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Discussions</p>
                    <p className="text-lg font-medium">{client.totalDiscussions || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Contact</p>
                    <p className="text-lg font-medium">{client.lastDiscussionDate ? formatDate(client.lastDiscussionDate) : "Never"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* B2B Account & Loyalty Info (if applicable) */}
            {client.clientType?.toUpperCase() === "B2B" && (
              <div className="mb-6">
                <div className={`rounded p-3 ${hasLoyaltyTier ? 'bg-opacity-10' : 'bg-gray-50'}`} 
                     style={hasLoyaltyTier ? { backgroundColor: `${client.loyaltyTierColor}20` } : {}}>
                  <h4 className="text-base font-semibold mb-2 text-gray-700">
                    B2B Account Info
                    {hasLoyaltyTier && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: client.loyaltyTierColor }}>
                        {client.loyaltyTierName}
                      </span>
                    )}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Account Status:</span> 
                      <span className={`ml-1 font-medium ${client.hasAccount ? "text-green-600" : "text-yellow-600"}`}>
                        {client.hasAccount ? "Active" : "Not Setup"}
                      </span>
                    </div>
                    {client.hasAccount && (
                      <>
                        <div>
                          <span className="text-gray-500">User ID:</span> 
                          <span className="ml-1 font-medium">{client.userId ? client.userId.substring(0, 8) + "..." : "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Account Created:</span> 
                          <span className="ml-1 font-medium">{client.passwordCreatedAt ? formatDate(client.passwordCreatedAt) : "N/A"}</span>
                        </div>
                      </>
                    )}
                    {hasLoyaltyTier && (
                      <>
                        <div>
                          <span className="text-gray-500">Loyalty Tier:</span> 
                          <span className="ml-1 font-medium">{client.loyaltyTierName}</span>
                        </div>
                        {client.loyaltyTierDiscount && (
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <span className="ml-1 text-green-600 font-medium">
                              {client.loyaltyTierDiscount}% off
                            </span>
                          </div>
                        )}
                        {client.loyaltyPoints && (
                          <div>
                            <span className="text-gray-500">Points:</span>
                            <span className="ml-1 font-medium">
                              {client.loyaltyPoints} pts
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Added or Updated Date Information */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Date Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Created On</p>
                    <p className="font-medium">{formatDate(client.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(client.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes Section */}
            {client.notes && (
              <div className="mb-6">
                <div className="bg-gray-50 rounded p-3">
                  <h4 className="text-base font-semibold mb-2 text-gray-700">Notes</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{client.notes}</p>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="mt-6 flex justify-end space-x-2">
              {onEdit && (
                <CRMActionButton
                  type="secondary"
                  size="sm"
                  onClick={onEdit}
                >
                  Edit Client
                </CRMActionButton>
              )}
              <CRMActionButton
                type="secondary"
                size="sm"
                onClick={onClose}
              >
                Close
              </CRMActionButton>
            </div>
          </div>
          
          {/* Important Dates Section */}
          <div className="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto bg-gray-50">
            <ImportantDatesList
              key={importantDatesKey}
              client={client}
              onAddDate={handleAddImportantDate}
              onEditDate={handleEditImportantDate}
              onDeleteDate={handleDeleteImportantDate}
              loading={datesLoading}
            />
          </div>
          
          {/* Discussion History */}
          <div className="w-full lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Discussions</h3>
              {onAddDiscussion && (
                <CRMActionButton
                  type="primary"
                  size="sm"
                  onClick={() => onAddDiscussion(client)}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Add Discussion
                </CRMActionButton>
              )}
            </div>
            
            <DiscussionHistory
              discussions={discussions}
              loading={isLoadingDiscussions}
              formatDate={formatDate}
              entity={client}
              onUpdate={refreshDiscussions}
              readOnly={false}
              entityType="client"
            />
          </div>
        </div>
      </div>
      
      {/* Important Dates Modal */}
      {importantDatesModal.isOpen && (
        <ClientImportantDatesModal
          client={client}
          editingDate={importantDatesModal.editingDate}
          onClose={handleCloseImportantDatesModal}
          onSubmit={handleSubmitImportantDate}
        />
      )}
    </div>
  );
};

export default ClientDetailsModal;