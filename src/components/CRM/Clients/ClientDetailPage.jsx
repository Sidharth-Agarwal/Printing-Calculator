import React, { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { updateClient } from "../../../services/clientService";
import { createClientDiscussion } from "../../../services/discussionService";
import { LeadSourceDisplay } from "../../Shared/LeadSourceSelector";
import DiscussionHistory from "../../Shared/DiscussionHistory";
import JobTicketList from "./JobTicketList";
import CRMActionButton from "../../Shared/CRMActionButton";
import Modal from "../../Shared/Modal";
import { useAuth } from "../../Login/AuthContext";

const ClientDetailPage = ({ client, onClose, onPromoteToLegacy, onClientUpdate }) => {
  const { can } = useAuth();
  const [discussions,        setDiscussions]        = useState([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [isDiscussionOpen,   setIsDiscussionOpen]   = useState(false);
  const [discussionForm,     setDiscussionForm]     = useState({ discussionSummary: "", nextSteps: "" });
  const [isSubmitting,       setIsSubmitting]       = useState(false);
  const [notification,       setNotification]       = useState(null);
  const [activeTab,          setActiveTab]          = useState("tickets"); // tickets | discussions

  const { currentUser } = useAuth();

  const showNote = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Real-time discussions
  useEffect(() => {
    if (!client?.id) return;
    const q = query(
      collection(db, "discussions"),
      where("clientId", "==", client.id),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setDiscussions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingDiscussions(false);
    }, () => setLoadingDiscussions(false));
    return unsub;
  }, [client?.id]);

  const handleAddDiscussion = async () => {
    if (!discussionForm.discussionSummary.trim()) return;
    setIsSubmitting(true);
    try {
      await createClientDiscussion(client.id, { ...discussionForm, discussionDate: new Date() }, currentUser.uid);
      showNote("Discussion added");
      setIsDiscussionOpen(false);
      setDiscussionForm({ discussionSummary: "", nextSteps: "" });
      onClientUpdate?.();
    } catch (err) { showNote(err.message, "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleLegacyPromotion = useCallback(() => {
    onPromoteToLegacy?.(client.id);
  }, [client.id, onPromoteToLegacy]);

  const formatDate = (v) => {
    if (!v) return "—";
    const d = v?.toDate ? v.toDate() : v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!client) return null;

  const infoRows = [
    { label: "Client Code",  value: client.clientCode },
    { label: "Type",         value: client.clientType || "Direct" },
    { label: "Phone",        value: client.phone },
    { label: "Email",        value: client.email },
    { label: "Source",       value: client.leadSource ? <LeadSourceDisplay sourceId={client.leadSource} /> : "—" },
    { label: "Wedding Date", value: formatDate(client.weddingDate) },
    { label: "Birthday",     value: formatDate(client.birthdayDate) },
    { label: "Total Orders", value: client.totalOrders || 0 },
    { label: "Total Spend",  value: client.totalSpend ? `₹${client.totalSpend.toLocaleString("en-IN")}` : "—" },
    { label: "Converted",    value: formatDate(client.convertedAt) }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-semibold text-sm">
              {(client.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">{client.name}</h2>
                {client.isRepeat && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Repeat</span>}
                {client.isLegacy && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">Legacy</span>}
              </div>
              <p className="text-xs text-gray-500">{client.clientCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {notification && (
          <div className={`mx-5 mt-3 p-2 rounded text-sm ${notification.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {notification.msg}
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left — client info */}
          <div className="w-72 flex-shrink-0 border-r overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Client Info</h3>
              <div className="space-y-1.5">
                {infoRows.map(r => (
                  <div key={r.label} className="flex justify-between text-sm gap-2">
                    <span className="text-gray-500 flex-shrink-0">{r.label}</span>
                    <span className="text-gray-800 text-right">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {client.notes && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{client.notes}</p>
              </div>
            )}

            {/* Promote to Legacy */}
            {!client.isLegacy && can("manageJobTickets") && (
              <CRMActionButton type="secondary" size="sm" onClick={() => {
                if (window.confirm(`Promote "${client.name}" to Legacy Client?`)) handleLegacyPromotion();
              }}>
                Promote to Legacy
              </CRMActionButton>
            )}
          </div>

          {/* Right — tabs */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b px-5 pt-3 gap-4">
              {["tickets", "discussions"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab ? "border-cyan-500 text-cyan-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {tab === "tickets" ? "Job Tickets" : "Discussions"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === "tickets" && (
                <JobTicketList clientId={client.id} onLegacyPromotionNeeded={handleLegacyPromotion} />
              )}

              {activeTab === "discussions" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Discussion History</h3>
                    <CRMActionButton type="primary" size="sm" onClick={() => setIsDiscussionOpen(true)}
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}>
                      Add Discussion
                    </CRMActionButton>
                  </div>
                  <DiscussionHistory discussions={discussions} loading={loadingDiscussions} formatDate={formatDate} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add discussion modal */}
      <Modal isOpen={isDiscussionOpen} onClose={() => setIsDiscussionOpen(false)} title="Add Discussion" size="sm">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary <span className="text-red-500">*</span></label>
            <textarea rows={3} value={discussionForm.discussionSummary}
              onChange={e => setDiscussionForm(p => ({ ...p, discussionSummary: e.target.value }))}
              placeholder="What was discussed..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
            <textarea rows={2} value={discussionForm.nextSteps}
              onChange={e => setDiscussionForm(p => ({ ...p, nextSteps: e.target.value }))}
              placeholder="Actions to take..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <CRMActionButton type="secondary" onClick={() => setIsDiscussionOpen(false)}>Cancel</CRMActionButton>
            <CRMActionButton type="primary" onClick={handleAddDiscussion} isLoading={isSubmitting} disabled={isSubmitting}>Save</CRMActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientDetailPage;