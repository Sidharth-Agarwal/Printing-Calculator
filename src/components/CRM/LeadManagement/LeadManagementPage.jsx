import React, { useState } from "react";
import LeadPool from "./LeadPool";
import LeadDetailsModal from "../LeadRegistration/LeadDetailsModal";
import LeadRegistrationForm from "../LeadRegistration/LeadRegistrationForm";
import LeadDiscussionModal from "./LeadDiscussionModal";
import LeadConversionModal from "./LeadConversionModal";
import TempClientModal from "./TempClientModal";
import Modal from "../../Shared/Modal";
import { useCRM } from "../../../context/CRMContext";
import DisplayLeadsTable from "../LeadRegistration/DisplayLeadsTable";
import { LEAD_PIPELINE_FIELDS } from "../../../constants/leadFields";
import { getKanbanStatusForLead } from "../../../constants/leadStatuses";
import {
  createLead, updateLead, deleteLead, getLeadById, createDiscussion
} from "../../../services";
import { useAuth } from "../../Login/AuthContext";
import DBExportImport from "../../Shared/DBExportImport";
import { db } from "../../../firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

const LeadManagementPage = () => {
  const { currentUser, userRole } = useAuth();
  const { leads, isLoadingLeads, qualificationBadges, refreshLeads } = useCRM();

  // ── Modal state ───────────────────────────────────────────────────────────
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedLead,    setSelectedLead]    = useState(null);
  const [viewingLead,     setViewingLead]     = useState(null);
  const [discussionLead,  setDiscussionLead]  = useState(null);
  const [convertingLead,  setConvertingLead]  = useState(null);
  const [tempClientLead,  setTempClientLead]  = useState(null);
  const [isSubmitting,    setIsSubmitting]    = useState(false);

  // ── View ──────────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState("kanban");

  // ── Filters ───────────────────────────────────────────────────────────────
  const [searchTerm,        setSearchTerm]        = useState("");
  const [filterSource,      setFilterSource]      = useState("");
  const [filterBadge,       setFilterBadge]       = useState("");
  const [filterStatus,      setFilterStatus]      = useState("");
  const [showMovedToClients,setShowMovedToClients] = useState(false);
  const [showDormant,       setShowDormant]       = useState(false);  // NEW
  const [showDeadPool,      setShowDeadPool]      = useState(false);  // NEW

  // ── Notification ──────────────────────────────────────────────────────────
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const isAdmin = userRole === "admin";
  const hasPermission = userRole === "admin" || userRole === "staff";

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(p => ({ ...p, show: false })), 3000);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isLeadAddedToClients = (lead) => lead.status === "converted" && lead.movedToClients;

  const isDeadPool = (lead) => {
    if (lead.lastDiscussionDate) return false;
    if (!lead.createdAt) return false;
    const created = lead.createdAt?.toDate
      ? lead.createdAt.toDate()
      : lead.createdAt?.seconds
      ? new Date(lead.createdAt.seconds * 1000)
      : new Date(lead.createdAt);
    return (Date.now() - created.getTime()) > 90 * 24 * 60 * 60 * 1000;
  };

  // ── Counts for filter badges ──────────────────────────────────────────────
  const dormantCount  = leads.filter(l => l.status === "dormant").length;
  const deadPoolCount = leads.filter(isDeadPool).length;
  const movedToClientsCount = leads.filter(isLeadAddedToClients).length;

  // ── Filtered leads ────────────────────────────────────────────────────────
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      searchTerm === "" ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastDiscussionSummary?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource  = filterSource === "" || lead.source   === filterSource;
    const matchesBadge   = filterBadge  === "" || lead.badgeId  === filterBadge;
    const matchesStatus  = filterStatus === "" || lead.status   === filterStatus;
    const matchesMoved   = showMovedToClients || !isLeadAddedToClients(lead);

    // Dormant: hide unless showDormant toggled or explicitly filtered
    const matchesDormant = showDormant || filterStatus === "dormant" || lead.status !== "dormant";

    // Dead pool: when toggled, show ONLY dead pool leads
    const matchesDeadPool = showDeadPool ? isDeadPool(lead) : true;

    return matchesSearch && matchesSource && matchesBadge && matchesStatus
      && matchesMoved && matchesDormant && matchesDeadPool;
  });

  const clearFilters = () => {
    setSearchTerm(""); setFilterSource(""); setFilterBadge("");
    setFilterStatus(""); setShowMovedToClients(false);
    setShowDormant(false); setShowDeadPool(false);
  };

  const hasActiveFilters = searchTerm || filterSource || filterBadge || filterStatus
    || showMovedToClients || showDormant || showDeadPool;

  // ── Lead actions ──────────────────────────────────────────────────────────
  const handleLeadUpdate = async () => {
    refreshLeads?.();
    if (viewingLead) {
      try { setViewingLead(await getLeadById(viewingLead.id)); } catch {}
    }
    showNotification("Lead updated successfully");
  };

  const handleView     = (lead) => setViewingLead(lead);
  const handleEdit     = (lead) => { setSelectedLead(lead); setIsFormModalOpen(true); if (viewingLead?.id === lead.id) setViewingLead(null); };
  const handleAddDiscussion = (lead) => setDiscussionLead(lead);
  const handleConvert  = (lead) => setConvertingLead(lead);
  const handleMakeTempClient = (lead) => setTempClientLead(lead);

  const handleDelete = async (leadId) => {
    try {
      await deleteLead(leadId);
      showNotification("Lead deleted successfully");
      if (viewingLead?.id   === leadId) setViewingLead(null);
      if (discussionLead?.id=== leadId) setDiscussionLead(null);
      if (convertingLead?.id=== leadId) setConvertingLead(null);
      if (tempClientLead?.id=== leadId) setTempClientLead(null);
      refreshLeads?.();
    } catch (e) { showNotification(`Error: ${e.message}`, "error"); }
  };

  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedLead) {
        await updateLead(selectedLead.id, formData);
        showNotification(`Lead "${formData.name}" updated successfully`);
        if (viewingLead?.id === selectedLead.id) setViewingLead(await getLeadById(selectedLead.id));
      } else {
        await createLead(formData);
        showNotification(`Lead "${formData.name}" created successfully`);
      }
      refreshLeads?.();
      setIsFormModalOpen(false);
      setSelectedLead(null);
    } catch (e) { showNotification(`Error: ${e.message}`, "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmitDiscussion = async (leadId, discussionData) => {
    try {
      await createDiscussion(leadId, discussionData, currentUser.uid);
      showNotification("Discussion added successfully");
      if (viewingLead?.id === leadId) setViewingLead(await getLeadById(leadId));
      refreshLeads?.();
      setDiscussionLead(null);
    } catch (e) { showNotification(`Error: ${e.message}`, "error"); }
  };

  const handleSubmitConversion = async (leadId, success, newClient = null) => {
    if (success) {
      showNotification("Lead converted to client successfully");
      if (viewingLead?.id === leadId) setViewingLead(await getLeadById(leadId));
      refreshLeads?.();
    }
    setConvertingLead(null);
  };

  const handleTempClientSubmit = async (leadId, success, newTempClient = null) => {
    if (success) {
      try {
        await updateDoc(doc(db, "leads", leadId), {
          tempClientId: newTempClient.id, tempClientCreatedAt: new Date(), updatedAt: serverTimestamp()
        });
        showNotification(`Temporary client "${newTempClient?.name}" created successfully`);
        if (viewingLead?.id === leadId) setViewingLead(await getLeadById(leadId));
        refreshLeads?.();
      } catch (e) { showNotification("Failed to update lead with temp client reference", "error"); }
    } else {
      showNotification("Failed to create temporary client", "error");
    }
    setTempClientLead(null);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const displayedLeads = leads.filter(l => showMovedToClients || !isLeadAddedToClients(l));

  const kanbanStats = {
    newLead:   displayedLeads.filter(l => getKanbanStatusForLead(l.status) === "newLead"   && l.status !== "dormant").length,
    qualified: displayedLeads.filter(l => getKanbanStatusForLead(l.status) === "qualified").length,
    converted: displayedLeads.filter(l => getKanbanStatusForLead(l.status) === "converted").length,
    lost:      displayedLeads.filter(l => getKanbanStatusForLead(l.status) === "lost").length,
  };
  const detailedStats = {
    total:       displayedLeads.length,
    contacted:   displayedLeads.filter(l => l.status === "contacted").length,
    negotiation: displayedLeads.filter(l => l.status === "negotiation").length,
    tempClients: displayedLeads.filter(l => l.tempClientId).length,
    dormant:     dormantCount
  };
  const conversionRate = displayedLeads.length > 0
    ? Math.round((kanbanStats.converted / displayedLeads.length) * 100) : 0;

  if (!hasPermission) return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
        <p className="mt-2 text-red-600">You don't have permission to manage leads.</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Qualified Leads</h1>
        <p className="text-gray-600 mt-1">Manage your leads through the sales pipeline</p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-3 rounded ${notification.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
          {notification.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-6">
        {[
          { label: "Total Leads",      value: detailedStats.total,       color: "text-gray-800" },
          { label: "New Leads",        value: kanbanStats.newLead,       color: "text-blue-600",   sub: detailedStats.contacted > 0 ? `${detailedStats.contacted} contacted` : null },
          { label: "Qualified",        value: kanbanStats.qualified,     color: "text-green-600",  sub: detailedStats.negotiation > 0 ? `${detailedStats.negotiation} negotiating` : null },
          { label: "Converted",        value: kanbanStats.converted,     color: "text-purple-600" },
          { label: "Lost",             value: kanbanStats.lost,          color: "text-red-600" },
          { label: "Dormant",          value: detailedStats.dormant,     color: "text-gray-500" },
          { label: "Temp Clients",     value: detailedStats.tempClients, color: "text-orange-600", sub: "from leads" },
          { label: "Conversion Rate",  value: `${conversionRate}%`,      color: "text-purple-600" },
          { label: "Added to Clients", value: movedToClientsCount,       color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col">
            <span className="text-xs font-medium text-gray-500">{s.label}</span>
            <span className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</span>
            {s.sub && <span className="text-xs text-gray-400 mt-1">{s.sub}</span>}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="mb-2 md:mb-0">
          {isAdmin && (
            <DBExportImport db={db} collectionName="leads"
              onSuccess={m => { showNotification(m); refreshLeads?.(); }}
              onError={m => showNotification(m, "error")}
              dateFields={["createdAt","updatedAt","lastDiscussionDate","tempClientCreatedAt"]}
              qualificationBadges={qualificationBadges} />
          )}
        </div>
        <div className="flex space-x-2">
          {[
            { mode: "kanban", icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2", label: "Kanban View" },
            { mode: "list",   icon: "M4 6h16M4 10h16M4 14h16M4 18h16",                                                                                                                                                                                    label: "List View" }
          ].map(v => (
            <button key={v.mode} onClick={() => setViewMode(v.mode)}
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${viewMode === v.mode ? "bg-cyan-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={v.icon} />
              </svg>
              {v.label}
            </button>
          ))}
          <button onClick={() => { setSelectedLead(null); setIsFormModalOpen(true); }}
            className="px-4 py-2 text-sm font-medium rounded-md bg-cyan-500 text-white hover:bg-cyan-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-wrap">

          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input type="text" placeholder="Search leads..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Statuses</option>
              <option value="newLead">New Leads</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
              <option value="dormant">Dormant</option>
            </select>

            {/* Source filter */}
            <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Sources</option>
              {["facebook","instagram","whatsapp","website","email","phone","walkIn","referral","exhibition","other"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            {/* Badge filter */}
            <select value={filterBadge} onChange={e => setFilterBadge(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Badges</option>
              {qualificationBadges?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            {/* Show Added to Clients */}
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={showMovedToClients} onChange={e => setShowMovedToClients(e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm font-medium text-gray-700">Added to Clients</span>
              {movedToClientsCount > 0 && <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">{movedToClientsCount}</span>}
            </label>

            {/* Show Dormant — NEW */}
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={showDormant} onChange={e => setShowDormant(e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm font-medium text-gray-700">Dormant</span>
              {dormantCount > 0 && <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">{dormantCount}</span>}
            </label>

            {/* Dead Pool — NEW */}
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={showDeadPool} onChange={e => setShowDeadPool(e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm font-medium text-gray-700">Dead Pool</span>
              {deadPoolCount > 0 && <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">{deadPoolCount}</span>}
            </label>

            {/* Clear */}
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md border border-gray-300">
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lead count */}
      <div className="px-4 py-2 text-sm text-gray-600 mb-4 flex justify-between items-center">
        <span>Showing {filteredLeads.length} of {leads.length} leads</span>
        <div className="flex gap-4">
          {showDormant  && dormantCount  > 0 && <span className="text-gray-500 font-medium">Includes {dormantCount} dormant</span>}
          {showDeadPool && deadPoolCount > 0 && <span className="text-red-500 font-medium">Showing {deadPoolCount} dead pool leads</span>}
          {showMovedToClients && movedToClientsCount > 0 && <span className="text-blue-600 font-medium">Including {movedToClientsCount} moved to clients</span>}
        </div>
      </div>

      {/* Main content */}
      {viewMode === "kanban" ? (
        <LeadPool leads={filteredLeads} onView={handleView} onEdit={handleEdit}
          onAddDiscussion={handleAddDiscussion} onConvert={handleConvert} onDelete={handleDelete}
          loading={isLoadingLeads} onLeadUpdate={handleLeadUpdate} onMakeTempClient={handleMakeTempClient} />
      ) : (
        <DisplayLeadsTable leads={filteredLeads} onView={handleView} onEdit={handleEdit}
          onDelete={handleDelete} onAddDiscussion={handleAddDiscussion} onConvert={handleConvert}
          loading={isLoadingLeads} fields={LEAD_PIPELINE_FIELDS} showMovedToClients={showMovedToClients}
          onLeadUpdate={handleLeadUpdate} onMakeTempClient={handleMakeTempClient} />
      )}

      {/* Modals */}
      {viewingLead && (
        <LeadDetailsModal lead={viewingLead} onClose={() => setViewingLead(null)} onEdit={handleEdit}
          onAddDiscussion={handleAddDiscussion} onConvert={handleConvert}
          onLeadUpdate={handleLeadUpdate} onMakeTempClient={handleMakeTempClient} />
      )}

      {isFormModalOpen && (
        <Modal isOpen onClose={() => { setIsFormModalOpen(false); setSelectedLead(null); }}
          title={selectedLead ? "Edit Lead" : "Add New Lead"} size="xl">
          <LeadRegistrationForm lead={selectedLead} onSubmit={handleSubmitForm}
            onCancel={() => { setIsFormModalOpen(false); setSelectedLead(null); }}
            isSubmitting={isSubmitting} />
        </Modal>
      )}

      {discussionLead && (
        <LeadDiscussionModal lead={discussionLead} onClose={() => setDiscussionLead(null)}
          onSubmit={handleSubmitDiscussion} />
      )}

      {convertingLead && (
        <LeadConversionModal lead={convertingLead} onClose={() => setConvertingLead(null)}
          onSubmit={handleSubmitConversion} />
      )}

      {tempClientLead && (
        <TempClientModal lead={tempClientLead} onClose={() => setTempClientLead(null)}
          onSubmit={handleTempClientSubmit} />
      )}
    </div>
  );
};

export default LeadManagementPage;