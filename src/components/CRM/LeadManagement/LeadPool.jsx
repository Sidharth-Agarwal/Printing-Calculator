import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LEAD_STATUSES, getKanbanStatusForLead } from "../../../constants/leadStatuses";
import QualificationBadge from "../../Shared/QualificationBadge";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";
import CRMActionButton from "../../Shared/CRMActionButton";
import { updateLeadStatus, updateLead } from "../../../services";
import { useCRM } from "../../../context/CRMContext";
import { doc, updateDoc, serverTimestamp, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import TempClientModal from "./TempClientModal";
import DormantModal from "./DormantModal";

/**
 * Temp client status indicator on kanban cards
 */
const KanbanTempClientIndicator = ({ leadId }) => {
  const [tempClientInfo, setTempClientInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!leadId) { setIsLoading(false); return; }
      try {
        const q = query(
          collection(db, "clients"),
          where("sourceLeadId", "==", leadId),
          where("isTemporary", "==", true)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          let status = "active";
          if (data.expiryDate) {
            const exp = data.expiryDate.toDate ? data.expiryDate.toDate() : new Date(data.expiryDate);
            const diff = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
            if (diff < 0) status = "expired";
            else if (diff <= 7) status = "expiring";
          }
          setTempClientInfo({ id: snap.docs[0].id, name: data.name, clientCode: data.clientCode, status });
        } else {
          setTempClientInfo(null);
        }
      } catch { setTempClientInfo(null); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [leadId]);

  if (isLoading || !tempClientInfo) return null;
  return (
    <div className="mb-2">
      <div className="text-xs text-gray-600 mt-1">Client: {tempClientInfo.clientCode}</div>
    </div>
  );
};

/**
 * Inline badge editor on kanban cards
 */
const InlineKanbanBadgeEditor = ({ leadId, currentBadgeId, onUpdate, disabled = false }) => {
  const { qualificationBadges } = useCRM();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (newBadgeId) => {
    if (newBadgeId === currentBadgeId) { setIsEditing(false); return; }
    setIsUpdating(true);
    try {
      await updateLead(leadId, { badgeId: newBadgeId });
      onUpdate?.();
      setIsEditing(false);
    } catch (e) { console.error(e); }
    finally { setIsUpdating(false); }
  };

  if (disabled) return <QualificationBadge badgeId={currentBadgeId} size="sm" />;

  if (isEditing) return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <select value={currentBadgeId || ""} onChange={e => handleChange(e.target.value)}
        onBlur={() => setIsEditing(false)} autoFocus disabled={isUpdating}
        className="text-xs px-1 py-0.5 border border-blue-300 rounded focus:outline-none bg-white max-w-[100px]">
        <option value="">No Badge</option>
        {qualificationBadges?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      {isUpdating && <div className="absolute -right-1 -top-1"><div className="animate-spin h-2 w-2 border border-gray-300 border-t-blue-600 rounded-full" /></div>}
    </div>
  );

  return (
    <div onClick={e => { e.stopPropagation(); setIsEditing(true); }}
      className="cursor-pointer hover:bg-white hover:bg-opacity-50 rounded px-1 py-0.5 transition-colors"
      title="Click to edit qualification">
      <QualificationBadge badgeId={currentBadgeId} size="sm" />
      {!currentBadgeId && <span className="text-gray-400 text-xs italic">+ Badge</span>}
    </div>
  );
};

/**
 * Lead Pool — Kanban board with drag-and-drop, dormant support
 */
const LeadPool = ({
  leads = [],
  onView, onEdit, onAddDiscussion, onConvert, onDelete,
  loading = false, onLeadUpdate, onMakeTempClient
}) => {
  const [draggedLead,    setDraggedLead]    = useState(null);
  const [updatingLeadId, setUpdatingLeadId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [dragOverIndex,  setDragOverIndex]  = useState(null);
  const [isDragging,     setIsDragging]     = useState(false);
  const [tempClientLead, setTempClientLead] = useState(null);
  const [dormantLead,    setDormantLead]    = useState(null);  // NEW

  const dragNode         = useRef(null);
  const ghostRef         = useRef(null);
  const animFrameRef     = useRef(null);
  const lastMousePos     = useRef({ x: 0, y: 0 });

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isLeadAddedToClients = useCallback((lead) =>
    lead.status === "converted" && lead.movedToClients, []);

  const handleLeadUpdate = useCallback(() => {
    onLeadUpdate?.();
  }, [onLeadUpdate]);

  const formatDate = useCallback((ts) => {
    if (!ts) return "N/A";
    const d = ts.toDate ? ts.toDate() : ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }, []);

  const truncate = useCallback((text, max = 60) => {
    if (!text) return "";
    return text.length <= max ? text : text.substring(0, max) + "...";
  }, []);

  const formatRelative = useCallback((ts) => {
    if (!ts) return "Never";
    const d = ts.toDate ? ts.toDate() : ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    const diff = Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days ago`;
  }, []);

  // ── Grouped leads ─────────────────────────────────────────────────────────
  const groupedLeads = useMemo(() => {
    const groups = {};
    LEAD_STATUSES.forEach(s => { groups[s.id] = []; });
    leads.forEach(lead => {
      const col = getKanbanStatusForLead(lead.status);
      if (groups[col]) groups[col].push(lead);
    });
    Object.keys(groups).forEach(id => {
      groups[id].sort((a, b) => {
        const oA = a.order ?? (a.createdAt?.seconds || 0);
        const oB = b.order ?? (b.createdAt?.seconds || 0);
        return oA - oB;
      });
    });
    return groups;
  }, [leads]);

  // ── Dormant handlers ──────────────────────────────────────────────────────
  const handleMarkDormant = useCallback((lead) => setDormantLead(lead), []);

  const handleDormantConfirm = useCallback(async (leadId, { reason, comment }) => {
    await updateLead(leadId, {
      status:         "dormant",
      dormantReason:  reason,
      dormantComment: comment,
      dormantAt:      new Date()
    });
    setDormantLead(null);
    handleLeadUpdate();
  }, [handleLeadUpdate]);

  // ── Temp client handlers ──────────────────────────────────────────────────
  const handleMakeTempClient = useCallback((lead) => setTempClientLead(lead), []);

  const handleTempClientSubmit = useCallback(async (leadId, success, newTempClient = null) => {
    if (success) {
      try {
        await updateDoc(doc(db, "leads", leadId), {
          tempClientId:      newTempClient.id,
          tempClientCreatedAt: new Date(),
          updatedAt:         serverTimestamp()
        });
        handleLeadUpdate();
      } catch (e) { console.error(e); }
    }
    setTempClientLead(null);
    onMakeTempClient?.(leadId, success, newTempClient);
  }, [handleLeadUpdate, onMakeTempClient]);

  // ── Ghost element ─────────────────────────────────────────────────────────
  useEffect(() => {
    const ghost = document.createElement("div");
    ghost.className = "fixed pointer-events-none z-50";
    ghost.style.cssText = `width:280px;background:white;border-radius:8px;box-shadow:0 20px 25px -5px rgba(0,0,0,.1);border:1px solid #e5e7eb;padding:12px;opacity:.95;transform:translate(-1000px,-1000px) scale(1.02);display:none;`;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    return () => { if (ghostRef.current) document.body.removeChild(ghostRef.current); };
  }, []);

  // ── Mouse move ────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !ghostRef.current) return;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      if (ghostRef.current)
        ghostRef.current.style.transform = `translate(${lastMousePos.current.x + 15}px,${lastMousePos.current.y + 15}px)`;
    });
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) document.addEventListener("mousemove", handleMouseMove, { passive: true });
    else { document.removeEventListener("mousemove", handleMouseMove); if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); }
    return () => { document.removeEventListener("mousemove", handleMouseMove); if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isDragging, handleMouseMove]);

  // ── Reorder ───────────────────────────────────────────────────────────────
  const handleReorderLeads = useCallback(async (statusId, ids) => {
    try {
      const batch = writeBatch(db);
      ids.forEach((id, i) => batch.update(doc(db, "leads", id), { order: (i + 1) * 1000, updatedAt: serverTimestamp() }));
      await batch.commit();
      handleLeadUpdate();
    } catch (e) { console.error(e); }
  }, [handleLeadUpdate]);

  const getTargetStatus = (kanbanId, original) => {
    if (getKanbanStatusForLead(original) === kanbanId) return original;
    return { newLead: "newLead", qualified: "qualified", converted: "converted", lost: "lost" }[kanbanId] || original;
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e, lead, kanbanStatus, index) => {
    if (isLeadAddedToClients(lead) || lead.tempClientId || lead.status === "dormant") { e.preventDefault(); return; }
    setIsDragging(true);
    setDraggedLead({ ...lead, kanbanStatus, index });
    dragNode.current = e.target;
    if (ghostRef.current) {
      ghostRef.current.innerHTML = `<div><h4 style="font-weight:500;color:#111827;font-size:14px">${lead.name}</h4>${lead.company ? `<div style="color:#6b7280;font-size:12px">${lead.company}</div>` : ""}</div>`;
      ghostRef.current.style.display = "block";
      ghostRef.current.style.transform = `translate(${e.clientX + 15}px,${e.clientY + 15}px) scale(1.02)`;
    }
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    e.dataTransfer.setDragImage(img, 0, 0);
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.cssText += "opacity:.3;border:2px dashed #3b82f6;background-color:#eff6ff;transform:scale(.98);";
    });
    e.dataTransfer.setData("text/plain", lead.id);
    e.dataTransfer.effectAllowed = "move";
  }, [isLeadAddedToClients]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (ghostRef.current) { ghostRef.current.style.opacity = "0"; setTimeout(() => { if (ghostRef.current) { ghostRef.current.style.display = "none"; ghostRef.current.style.opacity = ".95"; } }, 150); }
    if (dragNode.current) dragNode.current.style.cssText = dragNode.current.style.cssText.replace(/opacity:[^;]*;?|border:[^;]*;?|background-color:[^;]*;?|transform:[^;]*;?/g, "");
    document.querySelectorAll(".status-column").forEach(c => c.classList.remove("bg-blue-50", "border-blue-200"));
    setDragOverStatus(null); setDragOverIndex(null); dragNode.current = null;
  }, []);

  const handleDragOver = useCallback((e, status) => {
    e.preventDefault(); e.dataTransfer.dropEffect = "move";
    if (dragOverStatus !== status) {
      document.querySelectorAll(".status-column").forEach(c => c.classList.remove("bg-blue-50", "border-blue-200"));
      e.currentTarget.classList.add("bg-blue-50", "border-blue-200");
      setDragOverStatus(status);
    }
  }, [dragOverStatus]);

  const handleDragOverCard = useCallback((e, status, index, leadId) => {
    e.preventDefault(); e.stopPropagation();
    if (draggedLead?.id === leadId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const targetIndex = e.clientY < rect.top + rect.height * 0.5 ? index : index + 1;
    if (dragOverIndex !== targetIndex || dragOverStatus !== status) { setDragOverIndex(targetIndex); setDragOverStatus(status); }
  }, [draggedLead, dragOverIndex, dragOverStatus]);

  const handleDrop = useCallback(async (e, kanbanStatusId, dropIndex = -1) => {
    e.preventDefault();
    if (!draggedLead) return;
    setUpdatingLeadId(draggedLead.id);
    document.querySelectorAll(".status-column").forEach(c => c.classList.remove("bg-blue-50", "border-blue-200"));
    setDragOverStatus(null); setDragOverIndex(null);
    try {
      const origKanban = getKanbanStatusForLead(draggedLead.status);
      if (origKanban !== kanbanStatusId) {
        const newStatus = getTargetStatus(kanbanStatusId, draggedLead.status);
        let newOrder = 1000;
        if (dropIndex > 0) {
          const sl = groupedLeads[kanbanStatusId] || [];
          if (dropIndex >= sl.length) newOrder = (sl[sl.length - 1]?.order || 0) + 1000;
          else {
            const after = sl[dropIndex]; const before = dropIndex > 0 ? sl[dropIndex - 1] : null;
            newOrder = before && after ? Math.floor((before.order || 0) + ((after.order || 0) - (before.order || 0)) / 2) : Math.floor((after?.order || 1000) / 2);
          }
        }
        await updateDoc(doc(db, "leads", draggedLead.id), { status: newStatus, order: newOrder, updatedAt: serverTimestamp() });
        handleLeadUpdate();
      } else if (dropIndex !== -1 && draggedLead.index !== dropIndex) {
        const arr = [...(groupedLeads[kanbanStatusId] || [])];
        const obj = arr.find(l => l.id === draggedLead.id);
        const filtered = arr.filter(l => l.id !== draggedLead.id);
        filtered.splice(dropIndex > draggedLead.index ? dropIndex - 1 : dropIndex, 0, obj);
        await handleReorderLeads(kanbanStatusId, filtered.map(l => l.id));
      }
    } catch (e) { console.error(e); }
    finally { setUpdatingLeadId(null); }
    setDraggedLead(null);
  }, [draggedLead, groupedLeads, handleReorderLeads, handleLeadUpdate]);

  // ── Drop placeholder ──────────────────────────────────────────────────────
  const DropPlaceholder = React.memo(({ statusId, index }) => {
    if (dragOverStatus !== statusId || dragOverIndex !== index) return null;
    return <div className="h-0.5 bg-blue-500 rounded-full mx-1 my-1" style={{ boxShadow: "0 0 6px rgba(59,130,246,.6)" }} />;
  });

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {LEAD_STATUSES.map(status => (
          <div key={status.id}
            className="status-column bg-white rounded-md border border-gray-200 flex flex-col transition-colors duration-150"
            onDragOver={e => handleDragOver(e, status.id)}
            onDrop={e => handleDrop(e, status.id)}>

            {/* Column header */}
            <div className="p-3 border-b rounded-t-md" style={{ backgroundColor: status.bgColor, color: status.textColor }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="h-2.5 w-2.5 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                  <h3 className="font-medium">{status.label}</h3>
                </div>
                <span className="bg-white bg-opacity-30 text-xs font-medium py-1 px-2 rounded-full">
                  {groupedLeads[status.id].length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 flex-grow space-y-2"
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); if (dragOverIndex !== groupedLeads[status.id].length || dragOverStatus !== status.id) { setDragOverIndex(groupedLeads[status.id].length); setDragOverStatus(status.id); } }}
              onDrop={e => handleDrop(e, status.id, groupedLeads[status.id].length)}>

              {dragOverStatus === status.id && dragOverIndex === 0 && groupedLeads[status.id].length === 0 && (
                <div className="border-2 border-blue-300 border-dashed rounded-md h-24 flex items-center justify-center bg-blue-50">
                  <p className="text-blue-500 text-sm font-medium">Drop here</p>
                </div>
              )}

              {groupedLeads[status.id].length > 0 ? (
                <>
                  <DropPlaceholder statusId={status.id} index={0} />
                  {groupedLeads[status.id].map((lead, index) => {
                    const addedToClients = isLeadAddedToClients(lead);
                    const isDormant      = lead.status === "dormant";
                    const hasTempClient  = !!lead.tempClientId;

                    return (
                      <React.Fragment key={lead.id}>
                        <div
                          className={`bg-white border rounded-md p-3 cursor-pointer transition-all duration-200 hover:shadow-sm
                            ${draggedLead?.id === lead.id ? "opacity-0" : ""}
                            ${updatingLeadId === lead.id ? "animate-pulse" : ""}
                            ${addedToClients || hasTempClient ? "cursor-default opacity-75" : ""}
                            ${isDormant ? "opacity-60 bg-gray-50 border-gray-300" : ""}
                          `}
                          onClick={() => onView(lead)}
                          draggable={!addedToClients && !hasTempClient && !isDormant}
                          onDragStart={e => handleDragStart(e, lead, status.id, index)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => handleDragOverCard(e, status.id, index, lead.id)}
                          onDrop={e => handleDrop(e, status.id, index)}>

                          <div className="flex flex-col">
                            {/* Card header */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm truncate">{lead.name}</h4>
                                {lead.company && <p className="text-gray-500 text-xs truncate">{lead.company}</p>}
                                {lead.status !== status.id && !isDormant && (
                                  <p className="text-xs text-blue-600 font-medium">
                                    {lead.status === "contacted" ? "Contacted" : lead.status === "negotiation" ? "In Negotiation" : lead.status}
                                  </p>
                                )}
                                {/* Dormant badge */}
                                {isDormant && (
                                  <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    {lead.dormantReason === "ghosted" ? "Ghosted" : "Dropped Us"}
                                  </span>
                                )}
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <InlineKanbanBadgeEditor
                                  leadId={lead.id}
                                  currentBadgeId={lead.badgeId}
                                  onUpdate={handleLeadUpdate}
                                  disabled={addedToClients || hasTempClient || isDormant}
                                />
                              </div>
                            </div>

                            {/* Source / date */}
                            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                              <div className="flex-1 min-w-0"><LeadSourceDisplay sourceId={lead.source} /></div>
                              <div className="flex-shrink-0">{formatDate(lead.createdAt)}</div>
                            </div>

                            <KanbanTempClientIndicator leadId={lead.id} />

                            {/* Last discussion */}
                            {lead.lastDiscussionSummary && (
                              <div className="mb-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
                                <div className="text-xs text-gray-500 mb-1">Last contact: {formatRelative(lead.lastDiscussionDate)}</div>
                                <p className="break-words">{truncate(lead.lastDiscussionSummary, 60)}</p>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="mt-2 flex justify-center gap-1 flex-wrap" onClick={e => e.stopPropagation()}>

                              {addedToClients ? (
                                <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md font-medium flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  Added to Clients
                                </div>

                              ) : hasTempClient ? (
                                <div className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-md font-medium flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Temporary Client
                                </div>

                              ) : isDormant ? (
                                /* Dormant lead — only allow reactivating */
                                <CRMActionButton type="secondary" size="xs"
                                  onClick={async () => {
                                    try { await updateLeadStatus(lead.id, "newLead"); handleLeadUpdate(); }
                                    catch (e) { console.error(e); }
                                  }}
                                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}>
                                  Reactivate
                                </CRMActionButton>

                              ) : lead.status === "converted" ? (
                                <CRMActionButton type="primary" size="xs" onClick={() => onConvert(lead)}
                                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}>
                                  Move to Clients
                                </CRMActionButton>

                              ) : (
                                <>
                                  {/* Talk */}
                                  <CRMActionButton type="info" size="xs" onClick={() => onAddDiscussion(lead)}
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}>
                                    Talk
                                  </CRMActionButton>

                                  {/* Qualify (newLead column) */}
                                  {status.id === "newLead" && (
                                    <>
                                      <CRMActionButton type="success" size="xs"
                                        onClick={async () => { try { await updateLeadStatus(lead.id, "qualified"); handleLeadUpdate(); } catch (e) { console.error(e); } }}
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                                        Qualify
                                      </CRMActionButton>
                                      <CRMActionButton type="warning" size="xs" onClick={() => handleMakeTempClient(lead)}
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                                        Temp Client
                                      </CRMActionButton>
                                    </>
                                  )}

                                  {/* Convert (qualified column) */}
                                  {status.id === "qualified" && (
                                    <>
                                      <CRMActionButton type="success" size="xs"
                                        onClick={async () => { try { await updateLeadStatus(lead.id, "converted"); handleLeadUpdate(); } catch (e) { console.error(e); } }}
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}>
                                        Convert
                                      </CRMActionButton>
                                      <CRMActionButton type="warning" size="xs" onClick={() => handleMakeTempClient(lead)}
                                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                                        Temp Client
                                      </CRMActionButton>
                                    </>
                                  )}

                                  {/* Mark Dormant (not on lost/converted columns) */}
                                  {status.id !== "lost" && status.id !== "converted" && (
                                    <CRMActionButton type="secondary" size="xs" onClick={() => handleMarkDormant(lead)}
                                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}>
                                      Dormant
                                    </CRMActionButton>
                                  )}

                                  {/* Mark Lost */}
                                  {status.id !== "lost" && (
                                    <CRMActionButton type="danger" size="xs"
                                      onClick={async () => {
                                        if (window.confirm(`Mark "${lead.name}" as lost?`)) {
                                          try { await updateLeadStatus(lead.id, "lost"); handleLeadUpdate(); }
                                          catch (e) { console.error(e); }
                                        }
                                      }}
                                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}>
                                      Lost
                                    </CRMActionButton>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropPlaceholder statusId={status.id} index={index + 1} />
                      </React.Fragment>
                    );
                  })}
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

      {/* Modals */}
      {tempClientLead && (
        <TempClientModal lead={tempClientLead} onClose={() => setTempClientLead(null)} onSubmit={handleTempClientSubmit} />
      )}
      {dormantLead && (
        <DormantModal lead={dormantLead} onConfirm={handleDormantConfirm} onCancel={() => setDormantLead(null)} />
      )}
    </div>
  );
};

export default LeadPool;