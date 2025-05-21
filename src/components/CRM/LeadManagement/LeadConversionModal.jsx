import React, { useState, useEffect } from "react";
import LeadStatusBadge from "../../Shared/LeadStatusBadge";
import QualificationBadge from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";
import { 
  convertLeadToClient,
  checkClientCodeExists
} from "../../../services";

/**
 * Modal for converting a lead to a client
 * @param {Object} props - Component props
 * @param {Object} props.lead - Lead object
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler
 */
const LeadConversionModal = ({ lead, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientType: "Direct",
    clientCode: "",
    notes: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Generate a client code - identical to client components
  const generateClientCode = async (clientName) => {
    try {
      // Clean the name: remove spaces, special characters, and take first 4 letters
      const prefix = clientName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 4)
        .toUpperCase();
      
      // Add random 3-digit number
      const randomNum = Math.floor(Math.random() * 900) + 100;
      const paddedNum = randomNum.toString().padStart(3, '0');
      
      // Create the full code
      const generatedCode = `${prefix}${paddedNum}`;
      
      // Check if code exists - if it does, try again
      const exists = await checkClientCodeExists(generatedCode);
      if (exists) {
        console.log(`Generated code ${generatedCode} already exists, generating another...`);
        return generateClientCode(clientName); // Recursive call to try again
      }
      
      return generatedCode;
    } catch (error) {
      console.error("Error generating client code:", error);
      // Fallback to a simple random code if there's an error
      const randomNum = Math.floor(Math.random() * 900) + 100;
      return `${clientName.substring(0, 4).toUpperCase()}${randomNum}`;
    }
  };
  
  // Set initial form data and generate client code
  useEffect(() => {
    const initializeData = async () => {
      if (!lead) return;
    
      try {
        // Generate code based on company name or lead name, prioritizing company
        const nameToUse = lead.company || lead.name;
        const generatedCode = await generateClientCode(nameToUse);
        
        // Set form data with generated code
        setFormData(prev => ({
          ...prev,
          clientCode: generatedCode
        }));
      } catch (error) {
        console.error("Error initializing client data:", error);
        // Generate a fallback code if there's an error
        const fallbackCode = `${(lead.name || "LEAD").substring(0, 4).toUpperCase()}${
          Math.floor(Math.random() * 900) + 100
        }`;
        setFormData(prev => ({
          ...prev,
          clientCode: fallbackCode
        }));
      }
    };
    
    initializeData();
  }, [lead]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Allow everything except client code changes
    if (name === "clientCode") return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that client code exists
    if (!formData.clientCode) {
      setErrors({ clientCode: "Client code is required" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert lead to client
      const newClient = await convertLeadToClient(lead.id, formData);
      
      // Call onSubmit with success
      onSubmit(lead.id, true, newClient);
    } catch (error) {
      console.error("Error converting lead:", error);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
      
      // Call onSubmit with failure
      onSubmit(lead.id, false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!lead) return null;
  
  // Format date function for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp?.toDate 
      ? timestamp.toDate() 
      : timestamp?.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Convert Lead to Client</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Lead details at the top */}
        <div className="flex space-x-2 mb-1">
          <QualificationBadge badgeId={lead.badgeId} size="sm" />
          <LeadStatusBadge status={lead.status} size="sm" />
        </div>
        <p className="text-sm mb-4">{lead.name} {lead.company ? `(${lead.company})` : ""}</p>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700 border-b border-gray-200 pb-1">Contact Information</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Email:</span> {lead.email || "N/A"}
              </p>
              <p>
                <span className="text-gray-500">Phone:</span> {lead.phone || "N/A"}
              </p>
            </div>
          </div>
          
          {/* Lead Details */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700 border-b border-gray-200 pb-1">Lead Details</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Source:</span> {lead.source}
              </p>
              <p>
                <span className="text-gray-500">Created:</span> {formatDate(lead.createdAt)}
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <h4 className="text-sm font-medium mb-4 mt-6 text-gray-700 border-b border-gray-200 pb-1">Client Information</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Client Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Type
              </label>
              <select
                name="clientType"
                value={formData.clientType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              >
                <option value="Direct">Direct</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
            
            {/* Client Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientCode"
                value={formData.clientCode}
                readOnly
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm bg-gray-50 ${
                  errors.clientCode ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.clientCode ? (
                <p className="mt-1 text-xs text-red-500">{errors.clientCode}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  A unique code to identify this client. Auto-generated based on client name.
                </p>
              )}
            </div>
          </div>
          
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
              placeholder="Any additional notes for the new client record"
            ></textarea>
          </div>
          
          {/* Error message */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errors.submit}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2 mt-5 pt-4 border-t border-gray-200">
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
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3..42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Convert to Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadConversionModal;