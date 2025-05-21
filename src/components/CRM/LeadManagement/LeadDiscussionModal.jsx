import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LEAD_FIELDS } from "../../../constants/leadFields";
import LeadStatusBadge from "../../Shared/LeadStatusBadge";
import QualificationBadge from "../../Shared/QualificationBadge";
import CRMActionButton from "../../Shared/CRMActionButton";
import { LeadStatusSelector } from "../../Shared/LeadStatusBadge";
import { updateLeadStatus } from "../../../services";

/**
 * Modal for adding a discussion to a lead (Compact version)
 * @param {Object} props - Component props
 * @param {Object} props.lead - Lead object
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler
 */
const LeadDiscussionModal = ({ lead, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    discussionDate: new Date(),
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
  
  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      discussionDate: date
    }));
    
    // Clear date error if exists
    if (errors.discussionDate) {
      setErrors(prev => ({
        ...prev,
        discussionDate: null
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
    
    try {
      // If status has changed, update it first
      if (newStatus && newStatus !== lead.status) {
        setIsUpdatingStatus(true);
        await updateLeadStatus(lead.id, newStatus);
        setIsUpdatingStatus(false);
      }
      
      // Submit discussion
      await onSubmit(lead.id, formData);
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
  
  // Custom styles for the datepicker
  const customStyles = `
    /* DatePicker Styles */
    .react-datepicker {
      font-size: 0.8rem;
      width: 200px;
    }
    .react-datepicker__month-container {
      width: 200px;
    }
    .react-datepicker__day {
      width: 1.5rem;
      line-height: 1.5rem;
      margin: 0.1rem;
    }
    .react-datepicker__day-name {
      width: 1.5rem;
      line-height: 1.5rem;
      margin: 0.1rem;
    }
    .react-datepicker__header {
      padding-top: 0.5rem;
    }
    .react-datepicker__current-month {
      font-size: 0.9rem;
    }
  `;
  
  if (!lead) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{customStyles}</style>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-base font-semibold">Record Discussion</h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-xs text-gray-600">{lead.name}</span>
              <LeadStatusBadge status={lead.status} size="sm" />
              <QualificationBadge badgeId={lead.badgeId} size="sm" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Update Status */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
          
          {/* Discussion Date - Using DatePicker */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Discussion Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.discussionDate}
              onChange={handleDateChange}
              maxDate={new Date()} // Can't select future dates
              dateFormat="dd/MM/yyyy"
              className={`border rounded-md p-2 w-full text-sm ${
                errors.discussionDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.discussionDate && (
              <p className="mt-1 text-xs text-red-500">{errors.discussionDate}</p>
            )}
          </div>
          
          {/* Discussion Summary */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Discussion Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              name="discussionSummary"
              value={formData.discussionSummary}
              onChange={handleChange}
              rows="3"
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.discussionSummary ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Summarize what was discussed with the lead..."
            ></textarea>
            {errors.discussionSummary && (
              <p className="mt-1 text-xs text-red-500">{errors.discussionSummary}</p>
            )}
          </div>
          
          {/* Next Steps */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Next Steps
            </label>
            <textarea
              name="nextSteps"
              value={formData.nextSteps}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="What are the next actions to be taken?"
            ></textarea>
          </div>
          
          {/* Error message */}
          {errors.submit && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-xs">
              {errors.submit}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <CRMActionButton
              type="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </CRMActionButton>
            
            <CRMActionButton
              type="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              submit={true}
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