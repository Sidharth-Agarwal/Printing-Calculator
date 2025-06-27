import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import LeadStatusBadge from "../../Shared/LeadStatusBadge";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";
import QualificationBadge from "../../Shared/QualificationBadge";
import DiscussionHistory from "../../Shared/DiscussionHistory";
import CRMActionButton from "../../Shared/CRMActionButton";
import { updateLeadStatus } from "../../../services";
import { getNextStatus } from "../../../constants/leadStatuses";

/**
 * Modal component to display lead details
 * @param {Object} props - Component props
 * @param {Object} props.lead - Lead object to display
 * @param {function} props.onClose - Close handler
 * @param {function} props.onEdit - Edit handler
 * @param {function} props.onAddDiscussion - Add discussion handler
 * @param {function} props.onConvert - Convert to client handler
 * @param {function} props.onLeadUpdate - Lead update callback to refresh lead data
 */
const LeadDetailsModal = ({ 
  lead, 
  onClose, 
  onEdit, 
  onAddDiscussion,
  onConvert,
  onLeadUpdate
}) => {
  const [discussions, setDiscussions] = useState([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentLead, setCurrentLead] = useState(lead); // Track current lead data
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success"
  });
  
  // Helper function to check if lead is added to clients
  const isLeadAddedToClients = (leadData) => {
    return leadData.status === "converted" && leadData.movedToClients;
  };
  
  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Update current lead when prop changes
  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);
  
  // Fetch discussions when lead changes - using real-time updates
  useEffect(() => {
    if (!currentLead || !currentLead.id) {
      console.log("No lead provided or lead missing ID");
      return;
    }
    
    console.log("Fetching discussions for lead:", currentLead.id);
    setIsLoadingDiscussions(true);
    
    // Create query with real-time updates
    const discussionsQuery = query(
      collection(db, "discussions"),
      where("leadId", "==", currentLead.id),
      orderBy("date", "desc")
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(discussionsQuery, (snapshot) => {
      const discussionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Fetched discussions:", discussionsData);
      setDiscussions(discussionsData);
      setIsLoadingDiscussions(false);
    }, (error) => {
      console.error("Error fetching discussions:", error);
      setIsLoadingDiscussions(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentLead]);

  // Handle discussion updates (refresh when edited/deleted) - ENHANCED VERSION
  const refreshDiscussions = async () => {
    if (!currentLead || !currentLead.id) return;
    
    setIsLoadingDiscussions(true);
    try {
      // Fetch discussions again
      const discussionsQuery = query(
        collection(db, "discussions"),
        where("leadId", "==", currentLead.id),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await getDocs(discussionsQuery);
      const discussionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDiscussions(discussionsData);
      
      // IMPORTANT: Also refresh the lead data to get updated lastDiscussionDate
      try {
        const leadRef = doc(db, "leads", currentLead.id);
        const leadSnap = await getDoc(leadRef);
        
        if (leadSnap.exists()) {
          const updatedLead = {
            id: leadSnap.id,
            ...leadSnap.data()
          };
          
          // Update the current lead state
          setCurrentLead(updatedLead);
          
          // Call the parent update callback if provided
          if (onLeadUpdate) {
            onLeadUpdate();
          }
          
          console.log("Lead data refreshed after discussion update");
        }
      } catch (leadError) {
        console.error("Error refreshing lead data:", leadError);
      }
      
    } catch (error) {
      console.error("Error refreshing discussions:", error);
      showNotification("Error updating discussions", "error");
    } finally {
      setIsLoadingDiscussions(false);
    }
  };
  
  // Handle status advancement
  const handleAdvanceStatus = async () => {
    if (!currentLead) return;
    
    const nextStatus = getNextStatus(currentLead.status);
    
    // If we're already at the last status, do nothing
    if (nextStatus.id === currentLead.status) return;
    
    setIsUpdatingStatus(true);
    
    try {
      await updateLeadStatus(currentLead.id, nextStatus.id);
      showNotification(`Lead status updated to ${nextStatus.label}`, "success");
      
      // Refresh lead data
      if (onLeadUpdate) {
        onLeadUpdate();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification("Error updating lead status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  if (!currentLead) return null;
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : 
               (timestamp.seconds ? new Date(timestamp.seconds * 1000) : 
               new Date(timestamp));
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  // Check if lead can be converted (is in qualified or negotiation status)
  const canConvert = currentLead.status === "qualified" || currentLead.status === "negotiation";
  
  // Check if lead is already converted
  const isConverted = currentLead.status === "converted";
  
  // Check if converted lead has been moved to clients
  const isAddedToClients = isLeadAddedToClients(currentLead);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold mr-2">Lead Details</h3>
            <LeadStatusBadge status={currentLead.status} />
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
        
        {/* Notification */}
        {notification.show && (
          <div className={`mx-4 mt-4 p-3 rounded ${
            notification.type === "success" 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-red-100 text-red-700 border border-red-200"
          }`}>
            {notification.message}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row h-[calc(90vh-4rem)] overflow-hidden">
          {/* Lead Information */}
          <div className="w-full md:w-1/2 p-4 overflow-y-auto">
            {/* Basic Info */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h2 className="text-xl font-bold">{currentLead.name}</h2>
                  {currentLead.company && (
                    <p className="text-gray-600">{currentLead.company}</p>
                  )}
                </div>
                <div className="mt-2 sm:mt-0 flex space-x-2">
                  <QualificationBadge badgeId={currentLead.badgeId} />
                  <LeadSourceDisplay sourceId={currentLead.source} />
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p>{currentLead.phone || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p>{currentLead.email || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created</h4>
                  <p>{formatDate(currentLead.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Contact</h4>
                  <p>{currentLead.lastDiscussionDate ? formatDate(currentLead.lastDiscussionDate) : "No contact yet"}</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons Section - Updated Logic */}
            {isAddedToClients ? (
              // Only show "Added to Clients" status for leads that have been moved
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-center">
                  <div className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Lead Successfully Added to Clients
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2 text-center">
                  This lead has been moved to the clients section and is no longer editable from here.
                </p>
              </div>
            ) : (
              // Show action buttons for all other leads
              <>
                {/* Conversion Action for converted leads that haven't been moved yet */}
                {isConverted && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Lead Converted</h4>
                        <p className="text-xs text-green-600 mt-1">
                          This lead has been successfully converted to client status.
                        </p>
                      </div>
                      
                      <CRMActionButton
                        type="primary"
                        size="sm"
                        onClick={() => onConvert(currentLead)}
                        icon={
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        }
                      >
                        Move to Clients
                      </CRMActionButton>
                    </div>
                  </div>
                )}

                {/* Convert Button for non-converted leads */}
                {!isConverted && canConvert && (
                  <div className="mb-4">
                    <CRMActionButton
                      type="success"
                      size="sm"
                      onClick={() => onConvert(currentLead)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      }
                    >
                      Convert to Client
                    </CRMActionButton>
                  </div>
                )}
              </>
            )}
            
            {/* Job Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium mb-3 border-b border-gray-200 pb-1">Job Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Job Type</h4>
                  <p>{currentLead.jobType ? currentLead.jobType.charAt(0).toUpperCase() + currentLead.jobType.slice(1) : "Not specified"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Budget Range</h4>
                  <p>{currentLead.budget ? currentLead.budget.charAt(0).toUpperCase() + currentLead.budget.slice(1) : "Not specified"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Urgency</h4>
                  <p>{currentLead.urgency ? currentLead.urgency.charAt(0).toUpperCase() + currentLead.urgency.slice(1) : "Not specified"}</p>
                </div>
              </div>
            </div>
            
            {/* Address */}
            {currentLead.address && (currentLead.address.city || currentLead.address.line1) && (
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Address</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  {currentLead.address.line1 && <p>{currentLead.address.line1}</p>}
                  {currentLead.address.line2 && <p>{currentLead.address.line2}</p>}
                  <p>
                    {[
                      currentLead.address.city,
                      currentLead.address.state,
                      currentLead.address.postalCode
                    ].filter(Boolean).join(", ")}
                  </p>
                  <p>{currentLead.address.country}</p>
                </div>
              </div>
            )}
            
            {/* Notes */}
            {currentLead.notes && (
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Notes</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="whitespace-pre-line">{currentLead.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Discussion History */}
          <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 p-4 overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Discussions</h3>
              {!isAddedToClients && (
                <CRMActionButton
                  type="primary"
                  size="sm"
                  onClick={() => onAddDiscussion(currentLead)}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Add Discussion
                </CRMActionButton>
              )}
            </div>
            
            <DiscussionHistory
              discussions={discussions}
              loading={isLoadingDiscussions}
              formatDate={formatDate}
              lead={currentLead}
              onUpdate={refreshDiscussions}
              readOnly={isAddedToClients} // Pass read-only state to discussion history
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;