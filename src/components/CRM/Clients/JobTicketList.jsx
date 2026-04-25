import React, { useState, useEffect, useCallback } from "react";
import {
  getTicketsForClient, deleteJobTicket, updateJobTicket,
  shouldPromoteToLegacy, ORDER_STATUSES, getPendingBalance
} from "../../../services/jobTicketService";
import OrderStatusPipeline from "./OrderStatusPipeline";
import PaymentTracker from "./PaymentTracker";
import JobTicketForm from "./JobTicketForm";
import Modal from "../../Shared/Modal";
import CRMActionButton from "../../Shared/CRMActionButton";
import { useAuth } from "../../Login/AuthContext";

const JobTicketList = ({ clientId, onLegacyPromotionNeeded }) => {
  const { can } = useAuth();
  const [tickets,      setTickets]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [editTicket,   setEditTicket]   = useState(null);
  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [expandedId,   setExpandedId]   = useState(null);

  const canManage = can("manageJobTickets");

  const showNote = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTicketsForClient(clientId);
      setTickets(data);
      // Check if any ticket should trigger legacy promotion
      const needsPromotion = data.some(shouldPromoteToLegacy);
      if (needsPromotion) onLegacyPromotionNeeded?.();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [clientId, onLegacyPromotionNeeded]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (ticketId, newStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, orderStatus: newStatus } : t));
    const updated = tickets.find(t => t.id === ticketId);
    if (updated && shouldPromoteToLegacy({ ...updated, orderStatus: newStatus })) {
      onLegacyPromotionNeeded?.();
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await updateJobTicket(editTicket.id, formData);
      showNote("Ticket updated successfully");
      setIsFormOpen(false);
      setEditTicket(null);
      load();
    } catch (err) { showNote(err.message, "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Delete this job ticket? This cannot be undone.")) return;
    try { await deleteJobTicket(ticketId); showNote("Ticket deleted"); load(); }
    catch (err) { showNote(err.message, "error"); }
  };

  const formatDate = (v) => {
    if (!v) return "—";
    const d = v?.toDate ? v.toDate() : v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const isOverdue = (ticket) => {
    if (!ticket.deadline || ticket.orderStatus === "completed") return false;
    const d = ticket.deadline?.toDate ? ticket.deadline.toDate() : ticket.deadline?.seconds ? new Date(ticket.deadline.seconds * 1000) : new Date(ticket.deadline);
    return d < new Date();
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 rounded-full border-b-2 border-cyan-500" /></div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">Job Tickets ({tickets.length})</h3>
        {canManage && (
          <CRMActionButton type="primary" size="sm"
            onClick={() => { setEditTicket(null); setIsFormOpen(true); }}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}>
            New Ticket
          </CRMActionButton>
        )}
      </div>

      {notification && (
        <div className={`mb-3 p-2 rounded text-sm ${notification.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {notification.msg}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No job tickets yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const overdue   = isOverdue(ticket);
            const expanded  = expandedId === ticket.id;
            const pending   = getPendingBalance(ticket);
            const statusDef = ORDER_STATUSES.find(s => s.id === ticket.orderStatus);

            return (
              <div key={ticket.id} className={`border rounded-lg overflow-hidden ${overdue ? "border-red-300" : "border-gray-200"}`}>
                {/* Ticket header */}
                <div className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : ticket.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusDef?.bgColor, color: statusDef?.textColor }}>
                      {statusDef?.label}
                    </span>
                    <span className="font-medium text-sm text-gray-900 truncate">{ticket.jobType}</span>
                    {overdue && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Overdue</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-500">{formatDate(ticket.deadline)}</span>
                    {pending > 0 && (
                      <span className="text-xs font-medium text-red-600">₹{pending.toLocaleString("en-IN")} due</span>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded content */}
                {expanded && (
                  <div className="p-4 space-y-4">
                    {/* Pipeline */}
                    <OrderStatusPipeline
                      ticketId={ticket.id}
                      currentStatus={ticket.orderStatus}
                      onStatusChange={(s) => handleStatusChange(ticket.id, s)}
                      readOnly={!canManage}
                    />

                    {/* Payment summary */}
                    <div className="bg-gray-50 rounded-md p-3">
                      <PaymentTracker formData={ticket} readOnly />
                    </div>

                    {/* Notes */}
                    {ticket.notes && (
                      <p className="text-sm text-gray-600 whitespace-pre-line">{ticket.notes}</p>
                    )}

                    {/* Actions */}
                    {canManage && (
                      <div className="flex gap-2 pt-2 border-t">
                        <CRMActionButton type="secondary" size="xs"
                          onClick={() => { setEditTicket(ticket); setIsFormOpen(true); }}
                          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}>
                          Edit
                        </CRMActionButton>
                        <CRMActionButton type="danger" size="xs"
                          onClick={() => handleDelete(ticket.id)}
                          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}>
                          Delete
                        </CRMActionButton>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditTicket(null); }}
        title={editTicket ? "Edit Job Ticket" : "New Job Ticket"} size="md">
        <JobTicketForm ticket={editTicket} onSubmit={handleSubmit}
          onCancel={() => { setIsFormOpen(false); setEditTicket(null); }}
          isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
};

export default JobTicketList;