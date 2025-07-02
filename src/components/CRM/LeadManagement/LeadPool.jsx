import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LEAD_STATUSES, getKanbanStatusForLead } from "../../../constants/leadStatuses";
import QualificationBadge from "../../Shared/QualificationBadge";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";
import CRMActionButton from "../../Shared/CRMActionButton";
import { updateLeadStatus, updateLead } from "../../../services";
import { useCRM } from "../../../context/CRMContext";
import { doc, updateDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

/**
 * Inline badge editor for Kanban cards
 */
const InlineKanbanBadgeEditor = ({ leadId, currentBadgeId, onUpdate, disabled = false }) => {
  const { qualificationBadges } = useCRM();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBadgeChange = async (newBadgeId) => {
    if (newBadgeId === currentBadgeId) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateLead(leadId, { badgeId: newBadgeId });
      onUpdate?.();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating badge:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (disabled) {
    return <QualificationBadge badgeId={currentBadgeId} size="sm" />;
  }

  if (isEditing) {
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <select
          value={currentBadgeId || ""}
          onChange={(e) => handleBadgeChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          disabled={isUpdating}
          className="text-xs px-1 py-0.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white max-w-[100px]"
        >
          <option value="">No Badge</option>
          {qualificationBadges?.map((badge) => (
            <option key={badge.id} value={badge.id}>
              {badge.name}
            </option>
          ))}
        </select>
        {isUpdating && (
          <div className="absolute -right-1 -top-1">
            <div className="animate-spin h-2 w-2 border border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-pointer hover:bg-white hover:bg-opacity-50 rounded px-1 py-0.5 transition-colors"
      title="Click to edit qualification"
    >
      <QualificationBadge badgeId={currentBadgeId} size="sm" />
      {!currentBadgeId && (
        <span className="text-gray-400 text-xs italic">+ Badge</span>
      )}
    </div>
  );
};

/**
 * Lead Pool component for kanban-style lead management with 4 columns
 * @param {Object} props - Component props
 * @param {Array} props.leads - Array of lead objects (pre-filtered)
 * @param {function} props.onView - View handler
 * @param {function} props.onEdit - Edit handler
 * @param {function} props.onAddDiscussion - Add discussion handler
 * @param {function} props.onConvert - Convert handler
 * @param {function} props.onDelete - Delete handler
 * @param {boolean} props.loading - Loading state
 * @param {function} props.onLeadUpdate - Lead update callback for inline editing
 */
const LeadPool = ({ 
  leads = [], 
  onView,
  onEdit,
  onAddDiscussion,
  onConvert,
  onDelete,
  loading = false,
  onLeadUpdate
}) => {
  const [draggedLead, setDraggedLead] = useState(null);
  const [updatingLeadId, setUpdatingLeadId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragNode = useRef(null);
  const ghostRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  
  // Memoize grouped leads to prevent unnecessary recalculations
  // Group leads by their Kanban status (mapping intermediate statuses)
  const groupedLeads = useMemo(() => {
    const groups = {};
    
    // Initialize groups with empty arrays for the 4 Kanban columns
    LEAD_STATUSES.forEach(status => {
      groups[status.id] = [];
    });
    
    // Group leads by their Kanban status
    leads.forEach(lead => {
      const kanbanStatus = getKanbanStatusForLead(lead.status);
      if (groups[kanbanStatus]) {
        groups[kanbanStatus].push(lead);
      }
    });
    
    // Sort leads in each status by order
    Object.keys(groups).forEach(statusId => {
      groups[statusId].sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : (a.createdAt ? a.createdAt.seconds : 0);
        const orderB = b.order !== undefined ? b.order : (b.createdAt ? b.createdAt.seconds : 0); 
        return orderA - orderB;
      });
    });
    
    return groups;
  }, [leads]);
  
  // Helper function to check if lead is added to clients
  const isLeadAddedToClients = useCallback((lead) => {
    return lead.status === "converted" && lead.movedToClients;
  }, []);
  
  // Handle lead update with callback
  const handleLeadUpdate = useCallback(() => {
    if (onLeadUpdate) {
      onLeadUpdate();
    }
  }, [onLeadUpdate]);
  
  // Optimized mouse move handler with requestAnimationFrame
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !ghostRef.current) return;
    
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
    
    // Cancel previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth ghost movement
    animationFrameRef.current = requestAnimationFrame(() => {
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate(${lastMousePosition.current.x + 15}px, ${lastMousePosition.current.y + 15}px)`;
      }
    });
  }, [isDragging]);
  
  // Set up optimized mouse tracking
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, handleMouseMove]);
  
  // Create optimized drag ghost
  useEffect(() => {
    const ghost = document.createElement('div');
    ghost.className = 'fixed pointer-events-none z-50';
    ghost.style.cssText = `
      width: 280px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #e5e7eb;
      padding: 12px;
      opacity: 0.95;
      transform: translate(-1000px, -1000px) scale(1.02);
      transition: opacity 150ms ease-out;
      display: none;
    `;
    
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    
    return () => {
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
      }
    };
  }, []);
  
  // Optimized reorder function
  const handleReorderLeads = useCallback(async (statusId, reorderedLeadIds) => {
    try {
      const batch = writeBatch(db);
      
      reorderedLeadIds.forEach((leadId, index) => {
        const leadRef = doc(db, "leads", leadId);
        batch.update(leadRef, {
          order: (index + 1) * 1000,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log(`Successfully reordered ${reorderedLeadIds.length} leads in status ${statusId}`);
      handleLeadUpdate();
    } catch (error) {
      console.error(`Error reordering leads in status ${statusId}:`, error);
    }
  }, [handleLeadUpdate]);
  
  // Get the actual status to update when dropping (maps Kanban column back to lead status)
  const getTargetStatusForDrop = (kanbanStatusId, originalLeadStatus) => {
    // If dropping in the same Kanban column, keep original status
    if (getKanbanStatusForLead(originalLeadStatus) === kanbanStatusId) {
      return originalLeadStatus;
    }
    
    // Map Kanban columns to appropriate statuses
    switch (kanbanStatusId) {
      case "newLead":
        return "newLead";
      case "qualified":
        return "qualified";
      case "converted":
        return "converted";
      case "lost":
        return "lost";
      default:
        return originalLeadStatus;
    }
  };
  
  // Optimized drag start
  const handleDragStart = useCallback((e, lead, kanbanStatus, index) => {
    // Don't allow dragging if lead is moved to clients
    if (isLeadAddedToClients(lead)) {
      e.preventDefault();
      return;
    }
    
    setIsDragging(true);
    setDraggedLead({ ...lead, kanbanStatus, index });
    dragNode.current = e.target;
    
    // Create ghost content
    if (ghostRef.current) {
      ghostRef.current.innerHTML = `
        <div style="display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <h4 style="font-weight: 500; color: #111827; font-size: 14px; margin: 0;">${lead.name}</h4>
              ${lead.company ? `<div style="color: #6b7280; font-size: 12px; margin-top: 2px;">${lead.company}</div>` : ''}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6b7280;">
            <div>${lead.source || ''}</div>
            <div>Status: ${lead.status}</div>
          </div>
        </div>
      `;
      
      ghostRef.current.style.display = 'block';
      ghostRef.current.style.transform = `translate(${e.clientX + 15}px, ${e.clientY + 15}px) scale(1.02)`;
    }
    
    // Hide default drag image
    const emptyImg = new Image();
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(emptyImg, 0, 0);
    
    // Style original element
    requestAnimationFrame(() => {
      if (dragNode.current) {
        dragNode.current.style.cssText += `
          opacity: 0.3;
          border: 2px dashed #3b82f6;
          background-color: #eff6ff;
          transform: scale(0.98);
          transition: all 200ms ease-out;
        `;
      }
    });
    
    e.dataTransfer.setData("text/plain", lead.id);
    e.dataTransfer.effectAllowed = "move";
  }, [isLeadAddedToClients]);
  
  // Optimized drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    // Hide ghost
    if (ghostRef.current) {
      ghostRef.current.style.opacity = '0';
      setTimeout(() => {
        if (ghostRef.current) {
          ghostRef.current.style.display = 'none';
          ghostRef.current.style.opacity = '0.95';
        }
      }, 150);
    }
    
    // Reset original element
    if (dragNode.current) {
      dragNode.current.style.cssText = dragNode.current.style.cssText.replace(/opacity:[^;]*;?/g, '')
        .replace(/border:[^;]*;?/g, '')
        .replace(/background-color:[^;]*;?/g, '')
        .replace(/transform:[^;]*;?/g, '');
    }
    
    // Clean up column highlights
    document.querySelectorAll('.status-column').forEach(col => {
      col.classList.remove('bg-blue-50', 'border-blue-200');
    });
    
    setDragOverStatus(null);
    setDragOverIndex(null);
    dragNode.current = null;
  }, []);
  
  // Optimized drag over handlers
  const handleDragOver = useCallback((e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (dragOverStatus !== status) {
      document.querySelectorAll('.status-column').forEach(col => {
        col.classList.remove('bg-blue-50', 'border-blue-200');
      });
      
      e.currentTarget.classList.add('bg-blue-50', 'border-blue-200');
      setDragOverStatus(status);
    }
  }, [dragOverStatus]);
  
  const handleDragOverCard = useCallback((e, status, index, leadId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedLead && draggedLead.id === leadId) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const isTopHalf = e.clientY < rect.top + rect.height * 0.5;
    const targetIndex = isTopHalf ? index : index + 1;
    
    if (dragOverIndex !== targetIndex || dragOverStatus !== status) {
      setDragOverIndex(targetIndex);
      setDragOverStatus(status);
    }
  }, [draggedLead, dragOverIndex, dragOverStatus]);
  
  // Optimized drop handler
  const handleDrop = useCallback(async (e, kanbanStatusId, dropIndex = -1) => {
    e.preventDefault();
    
    if (!draggedLead) return;
    
    setUpdatingLeadId(draggedLead.id);
    
    // Clean up visual effects
    document.querySelectorAll('.status-column').forEach(col => {
      col.classList.remove('bg-blue-50', 'border-blue-200');
    });
    
    setDragOverStatus(null);
    setDragOverIndex(null);
    
    try {
      const originalKanbanStatus = getKanbanStatusForLead(draggedLead.status);
      
      if (originalKanbanStatus !== kanbanStatusId) {
        // Moving to different Kanban column - update status
        const newStatus = getTargetStatusForDrop(kanbanStatusId, draggedLead.status);
        
        let newOrder = 1000;
        
        if (dropIndex > 0) {
          const statusLeads = groupedLeads[kanbanStatusId] || [];
          if (dropIndex >= statusLeads.length) {
            const lastLead = statusLeads[statusLeads.length - 1];
            newOrder = (lastLead?.order || 0) + 1000;
          } else {
            const afterLead = statusLeads[dropIndex];
            const beforeLead = dropIndex > 0 ? statusLeads[dropIndex - 1] : null;
            
            if (beforeLead && afterLead) {
              newOrder = Math.floor((beforeLead.order || 0) + ((afterLead.order || 0) - (beforeLead.order || 0)) / 2);
            } else if (afterLead) {
              newOrder = Math.floor((afterLead.order || 1000) / 2);
            } else {
              newOrder = (dropIndex + 1) * 1000;
            }
          }
        }
        
        const leadRef = doc(db, "leads", draggedLead.id);
        await updateDoc(leadRef, {
          status: newStatus,
          order: newOrder,
          updatedAt: serverTimestamp()
        });
        
        handleLeadUpdate();
      } else if (dropIndex !== -1 && draggedLead.index !== dropIndex) {
        // Reordering within same Kanban column
        const leadsInStatus = groupedLeads[kanbanStatusId] || [];
        const reorderedLeads = [...leadsInStatus];
        const draggedLeadObject = reorderedLeads.find(lead => lead.id === draggedLead.id);
        const filteredLeads = reorderedLeads.filter(lead => lead.id !== draggedLead.id);
        
        filteredLeads.splice(dropIndex > draggedLead.index ? dropIndex - 1 : dropIndex, 0, draggedLeadObject);
        
        const reorderedLeadIds = filteredLeads.map(lead => lead.id);
        await handleReorderLeads(kanbanStatusId, reorderedLeadIds);
      }
    } catch (error) {
      console.error("Error updating lead:", error);
    } finally {
      setUpdatingLeadId(null);
    }
    
    setDraggedLead(null);
  }, [draggedLead, groupedLeads, handleReorderLeads, handleLeadUpdate, getTargetStatusForDrop]);
  
  // Memoized utility functions
  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : 
               (timestamp.seconds ? new Date(timestamp.seconds * 1000) : 
               new Date(timestamp));
    
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric"
    });
  }, []);
  
  const truncateText = useCallback((text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }, []);
  
  const formatRelativeTime = useCallback((timestamp) => {
    if (!timestamp) return "Never";
    
    const date = timestamp.toDate ? timestamp.toDate() : 
               (timestamp.seconds ? new Date(timestamp.seconds * 1000) : 
               new Date(timestamp));
               
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  }, []);
  
  // Optimized drop placeholder
  const DropPlaceholder = React.memo(({ statusId, index }) => {
    if (dragOverStatus !== statusId || dragOverIndex !== index) return null;
    
    return (
      <div 
        className="h-0.5 bg-blue-500 rounded-full mx-1 my-1"
        style={{
          boxShadow: '0 0 6px rgba(59, 130, 246, 0.6)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      />
    );
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="pb-6">
      {/* Lead Pool Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {LEAD_STATUSES.map((status) => (
          <div 
            key={status.id}
            className="status-column bg-white rounded-md border border-gray-200 flex flex-col transition-colors duration-150"
            onDragOver={(e) => handleDragOver(e, status.id)}
            onDrop={(e) => handleDrop(e, status.id)}
          >
            {/* Status Header */}
            <div 
              className="p-3 border-b rounded-t-md"
              style={{ 
                backgroundColor: status.bgColor,
                color: status.textColor
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span
                    className="h-2.5 w-2.5 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  />
                  <h3 className="font-medium">{status.label}</h3>
                </div>
                <span className="bg-white bg-opacity-30 text-xs font-medium py-1 px-2 rounded-full">
                  {groupedLeads[status.id].length}
                </span>
              </div>
            </div>
            
            {/* Lead Cards Container */}
            <div 
              className="p-2 flex-grow space-y-2"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragOverIndex !== groupedLeads[status.id].length || dragOverStatus !== status.id) {
                  setDragOverIndex(groupedLeads[status.id].length);
                  setDragOverStatus(status.id);
                }
              }}
              onDrop={(e) => handleDrop(e, status.id, groupedLeads[status.id].length)}
            >
              {/* Empty state placeholder */}
              {dragOverStatus === status.id && dragOverIndex === 0 && groupedLeads[status.id].length === 0 && (
                <div className="border-2 border-blue-300 border-dashed rounded-md h-24 flex items-center justify-center bg-blue-50 bg-opacity-50 transition-all duration-200">
                  <p className="text-blue-500 text-sm font-medium">Drop here</p>
                </div>
              )}
              
              {groupedLeads[status.id].length > 0 ? (
                <>
                  {/* Drop indicator at top */}
                  <DropPlaceholder statusId={status.id} index={0} />
                  
                  {groupedLeads[status.id].map((lead, index) => (
                    <React.Fragment key={lead.id}>
                      <div
                        className={`bg-white border rounded-md p-3 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          draggedLead?.id === lead.id ? "opacity-0" : ""
                        } ${
                          updatingLeadId === lead.id ? "animate-pulse" : ""
                        } ${
                          isLeadAddedToClients(lead) ? "cursor-default opacity-75" : ""
                        }`}
                        onClick={() => onView(lead)}
                        draggable={!isLeadAddedToClients(lead)}
                        onDragStart={(e) => handleDragStart(e, lead, status.id, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOverCard(e, status.id, index, lead.id)}
                        onDrop={(e) => handleDrop(e, status.id, index)}
                      >
                        <div className="flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm truncate">{lead.name}</h4>
                              {lead.company && (
                                <p className="text-gray-500 text-xs truncate">{lead.company}</p>
                              )}
                              {/* Show actual status if different from Kanban column */}
                              {lead.status !== status.id && (
                                <p className="text-xs text-blue-600 font-medium">
                                  {lead.status === "contacted" ? "Contacted" : 
                                   lead.status === "negotiation" ? "In Negotiation" : lead.status}
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <InlineKanbanBadgeEditor
                                leadId={lead.id}
                                currentBadgeId={lead.badgeId}
                                onUpdate={handleLeadUpdate}
                                disabled={isLeadAddedToClients(lead)}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <div className="flex-1 min-w-0">
                              <LeadSourceDisplay sourceId={lead.source} />
                            </div>
                            <div className="flex-shrink-0">{formatDate(lead.createdAt)}</div>
                          </div>
                          
                          {/* Last discussion summary */}
                          {lead.lastDiscussionSummary && (
                            <div className="mb-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
                              <div className="text-xs text-gray-500 mb-1">
                                <span>Last contact: {formatRelativeTime(lead.lastDiscussionDate)}</span>
                              </div>
                              <p className="break-words">{truncateText(lead.lastDiscussionSummary, 60)}</p>
                            </div>
                          )}
                          
                          {/* Action buttons - Updated logic */}
                          <div className="mt-2 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {isLeadAddedToClients(lead) ? (
                              // Only show "Added to Clients" status for leads that have been moved
                              <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Added to Clients
                              </div>
                            ) : (
                              // Show action buttons for all other leads
                              <>
                                {lead.status === "converted" ? (
                                  // For converted leads that haven't been moved to clients yet
                                  <CRMActionButton
                                    type="primary"
                                    size="xs"
                                    onClick={() => onConvert(lead)}
                                    aria-label="Move to Clients"
                                    icon={
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                      </svg>
                                    }
                                  >
                                    Move to Clients
                                  </CRMActionButton>
                                ) : (
                                  // For all non-converted leads
                                  <>
                                    <CRMActionButton
                                      type="info"
                                      size="xs"
                                      onClick={() => onAddDiscussion(lead)}
                                      aria-label="Add discussion"
                                      icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                      }
                                    >
                                      Talk
                                    </CRMActionButton>
                                    
                                    {/* Quick action buttons based on current status */}
                                    {status.id === "newLead" && (
                                      <CRMActionButton
                                        type="success"
                                        size="xs"
                                        onClick={async () => {
                                          try {
                                            await updateLeadStatus(lead.id, "qualified");
                                            handleLeadUpdate();
                                          } catch (error) {
                                            console.error("Error qualifying lead:", error);
                                          }
                                        }}
                                        aria-label="Qualify lead"
                                        icon={
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        }
                                      >
                                        Qualify
                                      </CRMActionButton>
                                    )}
                                    
                                    {status.id === "qualified" && (
                                      <CRMActionButton
                                        type="success"
                                        size="xs"
                                        onClick={async () => {
                                          try {
                                            await updateLeadStatus(lead.id, "converted");
                                            handleLeadUpdate();
                                          } catch (error) {
                                            console.error("Error converting lead:", error);
                                          }
                                        }}
                                        aria-label="Convert lead"
                                        icon={
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        }
                                      >
                                        Convert
                                      </CRMActionButton>
                                    )}
                                    
                                    {/* Mark as Lost button (available for non-lost leads) */}
                                    {status.id !== "lost" && (
                                      <CRMActionButton
                                        type="danger"
                                        size="xs"
                                        onClick={async () => {
                                          if (window.confirm(`Mark "${lead.name}" as lost?`)) {
                                            try {
                                              await updateLeadStatus(lead.id, "lost");
                                              handleLeadUpdate();
                                            } catch (error) {
                                              console.error("Error marking lead as lost:", error);
                                            }
                                          }
                                        }}
                                        aria-label="Mark as lost"
                                        icon={
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        }
                                      >
                                        Lost
                                      </CRMActionButton>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Drop indicator after each card */}
                      <DropPlaceholder statusId={status.id} index={index + 1} />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <div className="text-center p-4 text-gray-400 text-sm min-h-[100px] flex items-center justify-center">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>No leads in this status</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadPool;