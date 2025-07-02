import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CRMActionButton from "../Shared/CRMActionButton";

/**
 * Modal for adding/editing important dates for a client
 * @param {Object} props - Component props
 * @param {Object} props.client - Client object
 * @param {Object} props.editingDate - Date object to edit (null for new date)
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler
 */
const ClientImportantDatesModal = ({ client, editingDate, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    isRecurring: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form data when editing
  useEffect(() => {
    if (editingDate) {
      setFormData({
        title: editingDate.title || "",
        description: editingDate.description || "",
        date: editingDate.date.toDate ? editingDate.date.toDate() : new Date(editingDate.date),
        isRecurring: editingDate.isRecurring !== undefined ? editingDate.isRecurring : true
      });
    } else {
      // Reset form for new date
      setFormData({
        title: "",
        description: "",
        date: new Date(),
        isRecurring: true
      });
    }
  }, [editingDate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
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
      date: date
    }));
    
    // Clear date error if exists
    if (errors.date) {
      setErrors(prev => ({
        ...prev,
        date: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    
    // Optional: Validate date is not too far in the past for non-recurring dates
    if (formData.date && !formData.isRecurring) {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (formData.date < oneYearAgo) {
        newErrors.date = "Date cannot be more than 1 year in the past for non-recurring dates";
      }
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
      // Submit the important date
      await onSubmit(client.id, formData, editingDate?.id);
    } catch (error) {
      console.error("Error submitting important date:", error);
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
      font-size: 0.9rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
    }
    .react-datepicker__header {
      background-color: #f9fafb;
      border-bottom: 1px solid #d1d5db;
    }
    .react-datepicker__current-month {
      font-weight: 600;
    }
    .react-datepicker__day--selected {
      background-color: #dc2626;
      color: white;
    }
    .react-datepicker__day--selected:hover {
      background-color: #b91c1c;
    }
    .react-datepicker__day:hover {
      background-color: #fee2e2;
    }
  `;

  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{customStyles}</style>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">
              {editingDate ? "Edit Important Date" : "Add Important Date"}
            </h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-sm text-gray-600">{client.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                client.clientType?.toUpperCase() === "B2B"
                  ? "bg-purple-100 text-purple-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {(client.clientType || "Direct").toUpperCase()}
              </span>
              {client.isActive && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Title Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.title ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500`}
              placeholder="e.g., Birthday, Anniversary, Company Founded"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Give this important date a short, memorable name
            </p>
          </div>

          {/* Date Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.date ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500`}
              disabled={isSubmitting}
              showYearDropdown
              yearDropdownItemNumber={10}
              scrollableYearDropdown
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Recurring Checkbox */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="isRecurring"
                name="isRecurring"
                type="checkbox"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                This date repeats every year
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.isRecurring 
                ? "This date will appear every year (e.g., birthdays, anniversaries)" 
                : "This is a one-time date (e.g., specific project deadlines)"}
            </p>
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Add any notes, reminders, or details about this date..."
              disabled={isSubmitting}
            ></textarea>
            <p className="mt-1 text-xs text-gray-500">
              Optional: Add details like "Send birthday card" or "Contract renewal reminder"
            </p>
          </div>

          {/* Examples/Help Section */}
          {/* <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Examples</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>Birthday:</strong> "CEO's birthday - send personal card"</div>
              <div><strong>Anniversary:</strong> "25th company anniversary - plan celebration"</div>
              <div><strong>Contract Renewal:</strong> "Annual contract expires - schedule review meeting"</div>
            </div>
          </div> */}

          {/* Error message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              {editingDate ? "Update Date" : "Add Date"}
            </CRMActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientImportantDatesModal;