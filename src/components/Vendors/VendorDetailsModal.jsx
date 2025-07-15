import React from "react";
import VendorDuplicateIndicator from "./VendorDuplicateIndicator";

const VendorDetailsModal = ({ vendor, onClose, onEdit, onToggleStatus, hasFullAccess }) => {
  if (!vendor) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-gray-900 text-white">
          <h3 className="text-lg font-semibold">
            Vendor Details
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
          {/* Vendor Name, Code, and Status */}
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{vendor.name}</h2>
                <div className="flex items-center mt-1">
                  <p className="text-gray-500 text-sm">{vendor.vendorCode}</p>
                </div>
              </div>
              
              {/* Status Badge and Toggle Button */}
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  vendor.isActive
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {vendor.isActive ? "Active Vendor" : "Inactive Vendor"}
                </span>
                
                {/* Only show toggle button for users with full access */}
                {hasFullAccess && onToggleStatus && (
                  <button 
                    onClick={onToggleStatus}
                    className={`mt-2 px-3 py-1.5 text-xs rounded-md flex items-center ${
                      vendor.isActive
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                        : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {vendor.isActive ? "Mark as Inactive" : "Mark as Active"}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Two column layout for details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              {/* Contact Information with Duplicate Indicators */}
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span> 
                    <div className="inline-flex items-center ml-1">
                      <span className="font-medium">{vendor.email || "N/A"}</span>
                      {vendor.email && (
                        <VendorDuplicateIndicator 
                          type="email" 
                          value={vendor.email} 
                          currentVendorId={vendor.id}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span> 
                    <div className="inline-flex items-center ml-1">
                      <span className="font-medium">{vendor.phone || "N/A"}</span>
                      {vendor.phone && (
                        <VendorDuplicateIndicator 
                          type="phone" 
                          value={vendor.phone} 
                          currentVendorId={vendor.id}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">GSTIN:</span> 
                    <div className="inline-flex items-center ml-1">
                      <span className="font-medium">{vendor.gstin || "N/A"}</span>
                      {vendor.gstin && (
                        <VendorDuplicateIndicator 
                          type="gstin" 
                          value={vendor.gstin} 
                          currentVendorId={vendor.id}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Address</h4>
                {vendor.address?.line1 ? (
                  <div className="space-y-0.5 text-sm">
                    <p>{vendor.address.line1}</p>
                    {vendor.address.line2 && <p>{vendor.address.line2}</p>}
                    <p>
                      {[
                        vendor.address.city, 
                        vendor.address.state, 
                        vendor.address.postalCode
                      ].filter(Boolean).join(", ")}
                    </p>
                    <p>{vendor.address.country || ""}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">N/A</p>
                )}
              </div>
              
              {/* Payment Terms */}
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Payment Terms</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Credit Period:</span>
                    <span className="ml-1 font-medium">{vendor.paymentTerms?.creditDays || 0} days</span>
                  </div>
                </div>
              </div>
              
              {/* Added or Updated Date Information */}
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Date Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Created On</p>
                    <p className="font-medium">{formatDate(vendor.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(vendor.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-4">
              {/* Account Details with Duplicate Indicators */}
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Account Details</h4>
                {vendor.accountDetails?.bankName ? (
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Bank Name:</span> 
                      <span className="ml-1 font-medium">{vendor.accountDetails.bankName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Account Number:</span> 
                      <div className="inline-flex items-center ml-1">
                        <span className="font-medium">{vendor.accountDetails.accountNumber}</span>
                        {vendor.accountDetails.accountNumber && (
                          <VendorDuplicateIndicator 
                            type="account" 
                            value={vendor.accountDetails.accountNumber} 
                            currentVendorId={vendor.id}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">IFSC Code:</span> 
                      <span className="ml-1 font-medium">{vendor.accountDetails.ifscCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Account Type:</span> 
                      <span className="ml-1 font-medium">{vendor.accountDetails.accountType}</span>
                    </div>
                    {vendor.accountDetails.upiId && (
                      <div>
                        <span className="text-gray-500">UPI ID:</span> 
                        <span className="ml-1 font-medium">{vendor.accountDetails.upiId}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No account details available</p>
                )}
              </div>
              
              {/* Transaction History Summary */}
              <div className="bg-gray-50 rounded p-3">
                <h4 className="text-base font-semibold mb-2 text-gray-700">Transaction Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Total Orders</p>
                    <p className="text-lg font-medium">{vendor.totalOrders || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Active Orders</p>
                    <p className="text-lg font-medium">{vendor.activeOrders || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Purchases</p>
                    <p className="text-lg font-medium">{formatCurrency(vendor.totalSpend || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg. Order Value</p>
                    <p className="text-lg font-medium">{formatCurrency(vendor.averageOrderValue || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes Section (Full width) */}
          {vendor.notes && (
            <div className="mt-4 bg-gray-50 rounded p-3">
              <h4 className="text-base font-semibold mb-2 text-gray-700">Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">{vendor.notes}</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-6 flex justify-end">
            {/* Only show edit button for users with full access */}
            {hasFullAccess && onEdit && (
              <button 
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 mr-2"
              >
                Edit Vendor
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

export default VendorDetailsModal;