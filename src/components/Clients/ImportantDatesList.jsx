import React, { useState, useEffect } from "react";
import { getClientDates } from "../../services/clientDatesService";
import CRMActionButton from "../Shared/CRMActionButton";

/**
 * Component to display list of important dates for a client
 * @param {Object} props - Component props
 * @param {Object} props.client - Client object
 * @param {function} props.onAddDate - Handler to add new date
 * @param {function} props.onEditDate - Handler to edit existing date
 * @param {function} props.onDeleteDate - Handler to delete date
 * @param {boolean} props.loading - Loading state from parent
 */
const ImportantDatesList = ({ client, onAddDate, onEditDate, onDeleteDate, loading = false }) => {
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, dateId: null, dateTitle: "" });

  // Fetch dates when client changes
  useEffect(() => {
    if (client && client.id) {
      fetchClientDates();
    }
  }, [client]);

  // Fetch client dates
  const fetchClientDates = async () => {
    try {
      setIsLoading(true);
      setError("");
      const clientDates = await getClientDates(client.id);
      setDates(clientDates);
    } catch (err) {
      console.error("Error fetching client dates:", err);
      setError("Failed to load important dates");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh dates (called from parent after add/edit/delete)
  const refreshDates = () => {
    fetchClientDates();
  };

  // Format date for display
  const formatDateForDisplay = (date, isRecurring = false) => {
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      const today = new Date();
      
      if (isRecurring) {
        // For recurring dates, show this year's occurrence
        const thisYearDate = new Date(today.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const nextYearDate = new Date(today.getFullYear() + 1, dateObj.getMonth(), dateObj.getDate());
        
        const targetDate = thisYearDate >= today ? thisYearDate : nextYearDate;
        
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return { text: "Today", class: "text-red-600 font-medium" };
        if (diffDays === 1) return { text: "Tomorrow", class: "text-orange-600 font-medium" };
        if (diffDays <= 7) return { text: `In ${diffDays} days`, class: "text-yellow-600 font-medium" };
        if (diffDays <= 30) return { text: `In ${diffDays} days`, class: "text-blue-600" };
        
        return { 
          text: targetDate.toLocaleDateString("en-IN", { 
            day: 'numeric', 
            month: 'short',
            year: targetDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
          }), 
          class: "text-gray-600" 
        };
      } else {
        const diffTime = dateObj - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return { text: "Today", class: "text-red-600 font-medium" };
        if (diffDays === 1) return { text: "Tomorrow", class: "text-orange-600 font-medium" };
        if (diffDays > 0 && diffDays <= 7) return { text: `In ${diffDays} days`, class: "text-yellow-600 font-medium" };
        if (diffDays > 7 && diffDays <= 30) return { text: `In ${diffDays} days`, class: "text-blue-600" };
        if (diffDays < 0) return { text: "Past", class: "text-gray-400" };
        
        return { 
          text: dateObj.toLocaleDateString("en-IN", { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }), 
          class: "text-gray-600" 
        };
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return { text: "Invalid Date", class: "text-red-500" };
    }
  };

  // Sort dates by next occurrence
  const sortDatesByNextOccurrence = (dates) => {
    const today = new Date();
    
    return [...dates].sort((a, b) => {
      const getNextOccurrence = (dateItem) => {
        const itemDate = dateItem.date.toDate ? dateItem.date.toDate() : new Date(dateItem.date);
        
        if (dateItem.isRecurring) {
          const thisYearDate = new Date(today.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          const nextYearDate = new Date(today.getFullYear() + 1, itemDate.getMonth(), itemDate.getDate());
          
          return thisYearDate >= today ? thisYearDate : nextYearDate;
        } else {
          return itemDate;
        }
      };

      return getNextOccurrence(a) - getNextOccurrence(b);
    });
  };

  // Handle delete confirmation
  const handleDeleteClick = (dateItem) => {
    setDeleteConfirm({
      show: true,
      dateId: dateItem.id,
      dateTitle: dateItem.title
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await onDeleteDate(deleteConfirm.dateId);
      setDeleteConfirm({ show: false, dateId: null, dateTitle: "" });
      // Refresh will be handled by parent component
    } catch (error) {
      console.error("Error deleting date:", error);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, dateId: null, dateTitle: "" });
  };

  // Get icon for date type
  const getDateIcon = (title, isRecurring) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('birthday') || titleLower.includes('birth')) {
      return "🎂";
    } else if (titleLower.includes('anniversary') || titleLower.includes('wedding')) {
      return "💍";
    } else if (titleLower.includes('founded') || titleLower.includes('established')) {
      return "🏢";
    } else if (titleLower.includes('contract') || titleLower.includes('renewal')) {
      return "📄";
    } else if (titleLower.includes('meeting') || titleLower.includes('appointment')) {
      return "📅";
    } else if (isRecurring) {
      return "🔄";
    } else {
      return "📌";
    }
  };

  if (!client) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-base font-medium text-gray-800">Important Dates</h4>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-base font-medium text-gray-800">Important Dates</h4>
          <CRMActionButton
            type="primary"
            size="sm"
            onClick={() => onAddDate(client)}
          >
            Add Date
          </CRMActionButton>
        </div>
        <div className="text-center py-6">
          <div className="text-red-500 text-sm mb-2">{error}</div>
          <button 
            onClick={fetchClientDates}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sortedDates = sortDatesByNextOccurrence(dates);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-base font-medium text-gray-800">
          Important Dates 
          {dates.length > 0 && (
            <span className="ml-2 text-sm text-gray-500">({dates.length})</span>
          )}
        </h4>
        <CRMActionButton
          type="primary"
          size="sm"
          onClick={() => onAddDate(client)}
          disabled={loading}
        >
          Add Date
        </CRMActionButton>
      </div>

      {/* Dates List */}
      {sortedDates.length > 0 ? (
        <div className="space-y-3">
          {sortedDates.map((dateItem) => {
            const displayDate = formatDateForDisplay(dateItem.date, dateItem.isRecurring);
            
            return (
              <div 
                key={dateItem.id} 
                className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-lg mr-2">
                        {getDateIcon(dateItem.title, dateItem.isRecurring)}
                      </span>
                      <h5 className="font-medium text-gray-800">{dateItem.title}</h5>
                      {dateItem.isRecurring && (
                        <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Annual
                        </span>
                      )}
                    </div>
                    
                    <div className="ml-7">
                      <p className={`text-sm ${displayDate.class}`}>
                        {displayDate.text}
                      </p>
                      
                      {dateItem.description && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          {dateItem.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-3">
                    <button
                      onClick={() => onEditDate(dateItem)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Edit Date"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(dateItem)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Delete Date"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-3">📅</div>
          <h5 className="text-gray-700 font-medium mb-1">No Important Dates</h5>
          <p className="text-sm text-gray-500 mb-4">
            Add birthdays, anniversaries, or other important dates for this client
          </p>
          {/* <CRMActionButton
            type="primary"
            size="sm"
            onClick={() => onAddDate(client)}
            disabled={loading}
          >
            Add First Date
          </CRMActionButton> */}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Delete Important Date</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{deleteConfirm.dateTitle}"? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <CRMActionButton
                  type="secondary"
                  size="sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </CRMActionButton>
                <CRMActionButton
                  type="danger"
                  size="sm"
                  onClick={confirmDelete}
                >
                  Delete Date
                </CRMActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportantDatesList;