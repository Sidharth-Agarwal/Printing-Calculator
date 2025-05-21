import React, { useState, useEffect } from "react";
import LeadStatusBadge from "../../Shared/LeadStatusBadge";
import QualificationBadge from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";
import { 
  convertLeadToClient, 
  checkLeadConversionReadiness,
  getDiscussionsForLead
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
  const [isChecking, setIsChecking] = useState(true);
  const [readinessStatus, setReadinessStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [discussions, setDiscussions] = useState([]);
  
  // Check lead conversion readiness
  useEffect(() => {
    const checkReadiness = async () => {
      if (!lead) return;
      
      setIsChecking(true);
      
      try {
        // Check readiness
        const readiness = await checkLeadConversionReadiness(lead.id);
        setReadinessStatus(readiness);
        
        // Get discussions for reference
        const discussionsData = await getDiscussionsForLead(lead.id);
        setDiscussions(discussionsData);
        
        // Suggest client code based on lead name or company
        let suggestedCode = "";
        if (lead.company) {
          // Use first 4 letters of company name + 3 digit random number
          suggestedCode = lead.company
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 4)
            .toUpperCase();
        } else {
          // Use first 4 letters of name + 3 digit random number
          suggestedCode = lead.name
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 4)
            .toUpperCase();
        }
        
        // Add random 3-digit number
        const randomNum = Math.floor(Math.random() * 900) + 100;
        suggestedCode += randomNum;
        
        // Update form with suggested code
        setFormData(prev => ({
          ...prev,
          clientCode: suggestedCode
        }));
      } catch (error) {
        console.error("Error checking lead conversion readiness:", error);
        setErrors(prev => ({
          ...prev,
          check: error.message
        }));
      } finally {
        setIsChecking(false);
      }
    };
    
    checkReadiness();
  }, [lead]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clientCode.trim()) {
      newErrors.clientCode = "Client code is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  if (!lead) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Convert Lead to Client</h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-sm text-gray-600">{lead.name}</span>
              <LeadStatusBadge status={lead.status} size="sm" />
              <QualificationBadge badgeId={lead.badgeId} size="sm" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Readiness Check */}
        {isChecking ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-red-600"></div>
            <span className="ml-2 text-gray-600">Checking conversion readiness...</span>
          </div>
        ) : (
          <>
            {readinessStatus && (
              <div className={`mb-6 p-4 rounded-md ${
                readinessStatus.overall ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
              }`}>
                <h4 className={`font-medium ${
                  readinessStatus.overall ? "text-green-700" : "text-yellow-700"
                }`}>
                  {readinessStatus.overall 
                    ? "This lead is ready to be converted to a client" 
                    : "This lead may not be fully ready for conversion"}
                </h4>
                
                {!readinessStatus.overall && readinessStatus.reasons.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-yellow-700 font-medium">Considerations:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm text-yellow-700">
                      {readinessStatus.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-yellow-700">
                      You can still proceed with conversion if you're confident this lead is ready.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Lead Summary */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Contact Information</h4>
                <p className="text-sm mt-1"><span className="font-medium">Name:</span> {lead.name}</p>
                {lead.company && <p className="text-sm"><span className="font-medium">Company:</span> {lead.company}</p>}
                <p className="text-sm"><span className="font-medium">Email:</span> {lead.email || "N/A"}</p>
                <p className="text-sm"><span className="font-medium">Phone:</span> {lead.phone || "N/A"}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Lead Details</h4>
                <p className="text-sm mt-1"><span className="font-medium">Source:</span> {lead.source}</p>
                <p className="text-sm"><span className="font-medium">Created:</span> {formatDate(lead.createdAt)}</p>
                <p className="text-sm"><span className="font-medium">Last Contact:</span> {lead.lastDiscussionDate ? formatDate(lead.lastDiscussionDate) : "N/A"}</p>
                <p className="text-sm"><span className="font-medium">Discussions:</span> {discussions.length}</p>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 border-b border-gray-200 pb-1">Client Information</h4>
                
                {/* Client Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Type
                  </label>
                  <select
                    name="clientType"
                    value={formData.clientType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="Direct">Direct</option>
                    <option value="B2B">B2B</option>
                  </select>
                </div>
                
                {/* Client Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientCode"
                    value={formData.clientCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                      errors.clientCode ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter client code"
                  />
                  {errors.clientCode ? (
                    <p className="mt-1 text-xs text-red-500">{errors.clientCode}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      A unique code to identify this client. Auto-generated but can be edited.
                    </p>
                  )}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Any additional notes for the new client record"
                  ></textarea>
                </div>
              </div>
              
              {/* Error message */}
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {errors.submit}
                </div>
              )}
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4">
                <CRMActionButton
                  type="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </CRMActionButton>
                
                <CRMActionButton
                  type="success"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  }
                >
                  Convert to Client
                </CRMActionButton>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadConversionModal;