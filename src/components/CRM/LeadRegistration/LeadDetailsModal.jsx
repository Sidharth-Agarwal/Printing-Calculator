import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
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
 */
const LeadDetailsModal = ({ 
  lead, 
  onClose, 
  onEdit, 
  onAddDiscussion,
  onConvert
}) => {
  const [discussions, setDiscussions] = useState([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Fetch discussions when lead changes - using real-time updates
  useEffect(() => {
    if (!lead || !lead.id) {
      console.log("No lead provided or lead missing ID");
      return;
    }
    
    console.log("Fetching discussions for lead:", lead.id);
    setIsLoadingDiscussions(true);
    
    // Create query with real-time updates
    const discussionsQuery = query(
      collection(db, "discussions"),
      where("leadId", "==", lead.id),
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
  }, [lead]);
  
  // Handle status advancement
  const handleAdvanceStatus = async () => {
    if (!lead) return;
    
    const nextStatus = getNextStatus(lead.status);
    
    // If we're already at the last status, do nothing
    if (nextStatus.id === lead.status) return;
    
    setIsUpdatingStatus(true);
    
    try {
      await updateLeadStatus(lead.id, nextStatus.id);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  if (!lead) return null;
  
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
  const canConvert = lead.status === "qualified" || lead.status === "negotiation";
  
  // Check if lead is already converted
  const isConverted = lead.status === "converted";
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold mr-2">Lead Details</h3>
            <LeadStatusBadge status={lead.status} />
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
        
        <div className="flex flex-col md:flex-row h-[calc(90vh-4rem)] overflow-hidden">
          {/* Lead Information */}
          <div className="w-full md:w-1/2 p-4 overflow-y-auto">
            {/* Basic Info */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h2 className="text-xl font-bold">{lead.name}</h2>
                  {lead.company && (
                    <p className="text-gray-600">{lead.company}</p>
                  )}
                </div>
                <div className="mt-2 sm:mt-0 flex space-x-2">
                  <QualificationBadge badgeId={lead.badgeId} />
                  <LeadSourceDisplay sourceId={lead.source} />
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p>{lead.phone || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p>{lead.email || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created</h4>
                  <p>{formatDate(lead.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Contact</h4>
                  <p>{lead.lastDiscussionDate ? formatDate(lead.lastDiscussionDate) : "No contact yet"}</p>
                </div>
              </div>
            </div>
            
            {/* Job Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium mb-3 border-b border-gray-200 pb-1">Job Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Job Type</h4>
                  <p>{lead.jobType ? lead.jobType.charAt(0).toUpperCase() + lead.jobType.slice(1) : "Not specified"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Budget Range</h4>
                  <p>{lead.budget ? lead.budget.charAt(0).toUpperCase() + lead.budget.slice(1) : "Not specified"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Urgency</h4>
                  <p>{lead.urgency ? lead.urgency.charAt(0).toUpperCase() + lead.urgency.slice(1) : "Not specified"}</p>
                </div>
              </div>
            </div>
            
            {/* Address */}
            {lead.address && (lead.address.city || lead.address.line1) && (
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Address</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  {lead.address.line1 && <p>{lead.address.line1}</p>}
                  {lead.address.line2 && <p>{lead.address.line2}</p>}
                  <p>
                    {[
                      lead.address.city,
                      lead.address.state,
                      lead.address.postalCode
                    ].filter(Boolean).join(", ")}
                  </p>
                  <p>{lead.address.country}</p>
                </div>
              </div>
            )}
            
            {/* Notes */}
            {lead.notes && (
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Notes</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="whitespace-pre-line">{lead.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Discussion History */}
          <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 p-4 overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Discussions</h3>
              <CRMActionButton
                type="primary"
                size="sm"
                onClick={() => onAddDiscussion(lead)}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add Discussion
              </CRMActionButton>
            </div>
            
            <DiscussionHistory
              discussions={discussions}
              loading={isLoadingDiscussions}
              formatDate={formatDate}
              lead={lead}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;