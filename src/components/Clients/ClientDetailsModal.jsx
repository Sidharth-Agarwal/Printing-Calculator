import React from "react";
import { CLIENT_FIELDS } from "../../constants/entityFields";

const ClientDetailsModal = ({ client, onClose, onEdit, onToggleStatus, isAdmin }) => {
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 overflow-auto max-h-[90vh]">
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
        
        <div className="p-4">
          {/* Client Name, Code, and Status */}
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{client.name}</h2>
                <div className="flex items-center mt-1">
                  <p className="text-gray-500 text-sm">{client.clientCode}</p>
                  <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.clientType?.toUpperCase() === "B2B"
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {(client.clientType || "Direct").toUpperCase()}
                  </span>
                  {client.hasAccount && (
                    <span className="ml-2 px-2.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      Account Active
                    </span>
                  )}
                </div>
              </div>
              
              {/* Status Badge and Toggle Button */}
              <div className="flex flex-col items-end">
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
          
          {/* Two column layout for details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              {/* Contact Information */}
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
              
              {/* Primary Address */}
              {renderAddressSection("Primary Address", CLIENT_FIELDS.ADDRESS, client.address)}
              
              {/* Added or Updated Date Information */}
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
            
            {/* Right column */}
            <div className="space-y-4">
              {/* Billing Address */}
              {renderAddressSection("Billing Address", CLIENT_FIELDS.BILLING_ADDRESS, client.billingAddress)}
              
              {/* Account Statistics */}
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
                </div>
              </div>
              
              {/* B2B Account & Loyalty Info (if applicable) */}
              {client.clientType?.toUpperCase() === "B2B" && (
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
              )}
            </div>
          </div>
          
          {/* Notes Section (Full width) */}
          {client.notes && (
            <div className="mt-4 bg-gray-50 rounded p-3">
              <h4 className="text-base font-semibold mb-2 text-gray-700">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">{client.notes}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-6 flex justify-end">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 mr-2"
              >
                Edit Client
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;