import React from "react";

const ClientDetailsModal = ({ client, onClose }) => {
  if (!client) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4">
        <div className="p-4">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Client Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="border-b mb-3"></div>
          
          {/* Client Name and Code */}
          <div className="mb-4">
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
              
              {/* Loyalty status displayed next to tags */}
              {client.clientType?.toUpperCase() === "B2B" && client.loyaltyTierName && (
                <div className="flex items-center ml-2">
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ 
                      backgroundColor: client.loyaltyTierColor || "#9f7aea"
                    }}
                  >
                    {client.loyaltyTierName}
                  </span>
                  {client.loyaltyTierDiscount && (
                    <span className="ml-1 text-xs text-green-600 font-medium">
                      {client.loyaltyTierDiscount}% off
                    </span>
                  )}
                </div>
              )}
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
                  <div>
                    <span className="text-gray-500">Contact Person:</span> 
                    <span className="ml-1 font-medium">{client.contactPerson || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span> 
                    <span className="ml-1 font-medium">{client.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span> 
                    <span className="ml-1 font-medium">{client.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">GSTIN:</span> 
                    <span className="ml-1 font-medium">{client.gstin || "N/A"}</span>
                  </div>
                </div>
              </div>
              
              {/* Billing Address */}
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Billing Address</h4>
                {client.billingAddress?.line1 ? (
                  <div className="space-y-0.5 text-sm">
                    <p>{client.billingAddress.line1}</p>
                    {client.billingAddress.line2 && <p>{client.billingAddress.line2}</p>}
                    <p>
                      {[
                        client.billingAddress.city, 
                        client.billingAddress.state, 
                        client.billingAddress.postalCode
                      ].filter(Boolean).join(", ")}
                    </p>
                    <p>{client.billingAddress.country || ""}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">N/A</p>
                )}
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-4">
              {/* Primary Address */}
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Primary Address</h4>
                {client.address?.line1 ? (
                  <div className="space-y-0.5 text-sm">
                    <p>{client.address.line1}</p>
                    {client.address.line2 && <p>{client.address.line2}</p>}
                    <p>
                      {[
                        client.address.city, 
                        client.address.state, 
                        client.address.postalCode
                      ].filter(Boolean).join(", ")}
                    </p>
                    <p>{client.address.country || ""}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">N/A</p>
                )}
              </div>
              
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
            </div>
          </div>
          
          {/* Notes Section (Full width) */}
          {client.notes && (
            <div className="mt-4 bg-gray-50 rounded p-3">
              <h4 className="text-base font-semibold mb-2 text-gray-700">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">{client.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;