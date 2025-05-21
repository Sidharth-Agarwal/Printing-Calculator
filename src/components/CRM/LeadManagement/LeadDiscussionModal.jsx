import React, { useState } from "react";
import { LEAD_FIELDS } from "../../../constants/leadFields";
import LeadStatusBadge from "../../Shared/LeadStatusBadge";
import QualificationBadge from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";
import { LeadStatusSelector } from "../../Shared/LeadStatusBadge";
import { updateLeadStatus } from "../../../services";

/**
 * Modal for adding a discussion to a lead
 * @param {Object} props - Component props
 * @param {Object} props.lead - Lead object
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler
 */
const LeadDiscussionModal = ({ lead, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    discussionDate: new Date().toISOString().split('T')[0],
    discussionSummary: "",
    nextSteps: ""
  });
  
  const [newStatus, setNewStatus] = useState(lead?.status || "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
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
    
    if (!formData.discussionDate) {
      newErrors.discussionDate = "Date is required";
    }
    
    if (!formData.discussionSummary.trim()) {
      newErrors.discussionSummary = "Discussion summary is required";
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
    console.log("Submitting discussion with data:", formData);
    
    try {
      // If status has changed, update it first
      if (newStatus && newStatus !== lead.status) {
        setIsUpdatingStatus(true);
        console.log("Updating lead status to:", newStatus);
        await updateLeadStatus(lead.id, newStatus);
        setIsUpdatingStatus(false);
      }
      
      // Submit discussion
      await onSubmit(lead.id, formData);
      console.log("Discussion submitted successfully");
    } catch (error) {
      console.error("Error submitting discussion:", error);
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!lead) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Record Discussion</h3>
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
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Update Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Lead Status
            </label>
            <LeadStatusSelector
              value={newStatus}
              onChange={setNewStatus}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              Current status: <span className="font-medium">{lead.status}</span>
            </p>
          </div>
          
          {/* Discussion Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discussion Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="discussionDate"
              value={formData.discussionDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.discussionDate ? "border-red-500" : "border-gray-300"
              }`}
              max={new Date().toISOString().split('T')[0]} // Can't select future dates
            />
            {errors.discussionDate && (
              <p className="mt-1 text-xs text-red-500">{errors.discussionDate}</p>
            )}
          </div>
          
          {/* Discussion Summary */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discussion Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              name="discussionSummary"
              value={formData.discussionSummary}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 ${
                errors.discussionSummary ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Summarize what was discussed with the lead..."
            ></textarea>
            {errors.discussionSummary && (
              <p className="mt-1 text-xs text-red-500">{errors.discussionSummary}</p>
            )}
          </div>
          
          {/* Next Steps */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Steps
            </label>
            <textarea
              name="nextSteps"
              value={formData.nextSteps}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="What are the next actions to be taken?"
            ></textarea>
          </div>
          
          {/* Error message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errors.submit}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <CRMActionButton
              type="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </CRMActionButton>
            
            <CRMActionButton
              type="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Save Discussion
            </CRMActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadDiscussionModal;