import React, { useState } from "react";
import { doc, updateDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Modal for promoting a temporary client to permanent client
 * @param {Object} props - Component props
 * @param {Object} props.client - Temporary client object
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler
 */
const TempClientPromotionModal = ({ client, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    contactPerson: client?.contactPerson || "",
    address: {
      line1: client?.address?.line1 || "",
      line2: client?.address?.line2 || "",
      city: client?.address?.city || "",
      state: client?.address?.state || "",
      postalCode: client?.address?.postalCode || "",
      country: client?.address?.country || ""
    },
    gstin: client?.gstin || "",
    notes: client?.notes || ""
  });
  
  const [sameAsAddress, setSameAsAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Check if we can do instant promotion (all required fields present)
  const canInstantPromote = () => {
    return (
      client?.contactPerson?.trim() && 
      client?.address?.line1?.trim() && 
      client?.address?.city?.trim() &&
      client?.address?.state?.trim()
    );
  };

  // NEW: Function to update related lead references
  const updateRelatedLead = async (clientId) => {
    try {
      // Find the lead that created this temp client
      const leadsQuery = query(
        collection(db, "leads"),
        where("tempClientId", "==", clientId)
      );
      
      const leadsSnapshot = await getDocs(leadsQuery);
      
      // Update each lead that references this temp client
      const updatePromises = leadsSnapshot.docs.map(async (leadDoc) => {
        const leadRef = doc(db, "leads", leadDoc.id);
        await updateDoc(leadRef, {
          // Clear temp client reference since it's now permanent
          tempClientId: null,
          tempClientCreatedAt: null,
          // Mark as moved to clients (permanent conversion)
          movedToClients: true,
          movedToClientsAt: new Date(),
          // Update lead status to converted if not already
          status: "converted",
          updatedAt: new Date()
        });
      });
      
      await Promise.all(updatePromises);
      console.log(`Updated ${leadsSnapshot.docs.length} lead(s) after temp client promotion`);
    } catch (error) {
      console.error("Error updating related leads:", error);
      // Don't throw - this is a secondary operation
    }
  };
  
  // Handle instant promotion without additional data
  const handleInstantPromotion = async () => {
    setIsSubmitting(true);
    
    try {
      const clientRef = doc(db, "clients", client.id);
      await updateDoc(clientRef, {
        isTemporary: false,
        expiryDate: null,
        promotedAt: new Date(),
        updatedAt: new Date(),
        notes: (client.notes || "") + `\n\nPromoted to permanent client on ${new Date().toLocaleDateString()}`
      });

      // NEW: Update related leads
      await updateRelatedLead(client.id);
      
      onSubmit(client.id, true);
    } catch (error) {
      console.error("Error promoting client:", error);
      setErrors({ submit: error.message });
      onSubmit(client.id, false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      
      // If same as address is checked, update billing address too
      if (sameAsAddress && parent === "address") {
        // Will be copied when saving
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Validate form for detailed promotion
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }
    
    if (!formData.address.line1.trim()) {
      newErrors["address.line1"] = "Address line 1 is required";
    }
    
    if (!formData.address.city.trim()) {
      newErrors["address.city"] = "City is required";
    }
    
    if (!formData.address.state.trim()) {
      newErrors["address.state"] = "State is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle detailed form submission
  const handleDetailedSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const clientRef = doc(db, "clients", client.id);
      
      // Prepare update data
      const updateData = {
        contactPerson: formData.contactPerson,
        address: formData.address,
        billingAddress: sameAsAddress ? formData.address : client.billingAddress,
        gstin: formData.gstin,
        notes: formData.notes + `\n\nPromoted to permanent client on ${new Date().toLocaleDateString()}`,
        isTemporary: false,
        expiryDate: null,
        promotedAt: new Date(),
        updatedAt: new Date()
      };
      
      await updateDoc(clientRef, updateData);

      // NEW: Update related leads
      await updateRelatedLead(client.id);
      
      onSubmit(client.id, true);
    } catch (error) {
      console.error("Error promoting client:", error);
      setErrors({ submit: error.message });
      onSubmit(client.id, false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!client) return null;
  
  // Format expiry date
  const formatExpiryDate = (date) => {
    if (!date) return "N/A";
    const expiryDate = date.toDate ? date.toDate() : new Date(date);
    return expiryDate.toLocaleDateString("en-IN");
  };
  
  // Check days until expiry
  const getDaysUntilExpiry = () => {
    if (!client.expiryDate) return null;
    const expiryDate = client.expiryDate.toDate ? client.expiryDate.toDate() : new Date(client.expiryDate);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysLeft = getDaysUntilExpiry();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Promote to Permanent Client</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Client Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-800">{client.name}</h4>
          <p className="text-sm text-gray-600">{client.clientCode} | {client.clientType}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              Temporary Client
            </span>
            <span className={`text-xs ${daysLeft <= 7 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {daysLeft > 0 ? `Expires in ${daysLeft} days` : 'Expired'}
            </span>
          </div>
        </div>
        
        {/* Instant Promotion Option */}
        {canInstantPromote() ? (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800">Ready for Instant Promotion</h4>
                <p className="text-sm text-green-700 mt-1">
                  This client has all required information. You can promote immediately.
                </p>
                <button
                  onClick={handleInstantPromotion}
                  disabled={isSubmitting}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Promoting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Promote Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Additional Information Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Please provide the missing information below to complete the promotion.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Detailed Form (only show if instant promotion not available) */}
        {!canInstantPromote() && (
          <form onSubmit={handleDetailedSubmit}>
            {/* Contact Person */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm ${
                  errors.contactPerson ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter contact person name"
              />
              {errors.contactPerson && (
                <p className="mt-1 text-xs text-red-500">{errors.contactPerson}</p>
              )}
            </div>
            
            {/* Address Section */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">
                Address Information
              </h4>
              
              {/* Address Line 1 */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm ${
                    errors["address.line1"] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter address line 1"
                />
                {errors["address.line1"] && (
                  <p className="mt-1 text-xs text-red-500">{errors["address.line1"]}</p>
                )}
              </div>
              
              {/* Address Line 2 */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address.line2"
                  value={formData.address.line2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                  placeholder="Enter address line 2 (optional)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm ${
                      errors["address.city"] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="City"
                  />
                  {errors["address.city"] && (
                    <p className="mt-1 text-xs text-red-500">{errors["address.city"]}</p>
                  )}
                </div>
                
                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm ${
                      errors["address.state"] ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="State"
                  />
                  {errors["address.state"] && (
                    <p className="mt-1 text-xs text-red-500">{errors["address.state"]}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                    placeholder="Postal code"
                  />
                </div>
                
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                    placeholder="Country"
                  />
                </div>
              </div>
              
              {/* Same as billing address checkbox */}
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameAsAddress}
                    onChange={(e) => setSameAsAddress(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Use same address for billing
                  </span>
                </label>
              </div>
            </div>
            
            {/* GSTIN (for B2B clients) */}
            {client.clientType === "B2B" && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                  placeholder="Enter GSTIN (optional)"
                />
              </div>
            )}
            
            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                placeholder="Add any additional notes..."
              ></textarea>
            </div>
            
            {/* Error message */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {errors.submit}
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Promoting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Promote to Permanent
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        
        {/* Benefits of Promotion */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Promotion Benefits</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• No expiry date - permanent client status</li>
            <li>• Full access to all CRM features</li>
            <li>• Complete order and invoice history</li>
            <li>• Loyalty program eligibility (B2B clients)</li>
            <li>• Original lead marked as fully converted</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TempClientPromotionModal;