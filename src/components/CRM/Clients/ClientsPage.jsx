import React, { useState, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { createJobTicket } from "../../../services/jobTicketService";
import ClientCard from "./ClientCard";
import ClientDetailPage from "./ClientDetailPage";
import JobTicketForm from "./JobTicketForm";
import Modal from "../../Shared/Modal";
import CRMActionButton from "../../Shared/CRMActionButton";
import { useAuth } from "../../Login/AuthContext";

const TABS = ["active", "legacy"];

const ClientsPage = () => {
  const { can } = useAuth();

  const [clients,         setClients]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState("active");
  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterType,      setFilterType]      = useState("");
  const [selectedClient,  setSelectedClient]  = useState(null);
  const [ticketClient,    setTicketClient]    = useState(null); // client to create a ticket for
  const [isTicketOpen,    setIsTicketOpen]    = useState(false);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [notification,    setNotification]    = useState(null);

  const showNote = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Real-time listener for all clients
  useEffect(() => {
    const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Flag repeat clients (totalOrders > 1)
      setClients(data.map(c => ({ ...c, isRepeat: (c.totalOrders || 0) > 1 })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  // Refresh selected client when clients list updates
  useEffect(() => {
    if (selectedClient) {
      const updated = clients.find(c => c.id === selectedClient.id);
      if (updated) setSelectedClient(updated);
    }
  }, [clients]);

  // Filtered list per tab
  const filtered = clients.filter(c => {
    const isLegacy = !!c.isLegacy;
    const tabMatch = activeTab === "legacy" ? isLegacy : !isLegacy;

    const searchMatch = !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm);

    const typeMatch = !filterType || c.clientType === filterType;

    return tabMatch && searchMatch && typeMatch;
  });

  // Counts
  const activeCount = clients.filter(c => !c.isLegacy).length;
  const legacyCount = clients.filter(c => c.isLegacy).length;
  const repeatCount = clients.filter(c => c.isRepeat && !c.isLegacy).length;

  // Promote client to legacy
  const handlePromoteToLegacy = useCallback(async (clientId) => {
    try {
      await updateDoc(doc(db, "clients", clientId), {
        isLegacy: true, promotedToLegacyAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      showNote("Client promoted to Legacy");
      if (selectedClient?.id === clientId) setSelectedClient(null);
    } catch (err) { showNote(err.message, "error"); }
  }, [selectedClient]);

  // Create a job ticket from the clients page
  const handleCreateTicket = async (formData) => {
    if (!ticketClient) return;
    setIsSubmitting(true);
    try {
      await createJobTicket(ticketClient.id, formData);
      showNote(`Ticket created for ${ticketClient.name}`);
      setIsTicketOpen(false);
      setTicketClient(null);
    } catch (err) { showNote(err.message, "error"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-1">Manage active and legacy clients</p>
      </div>

      {notification && (
        <div className={`mb-4 p-3 rounded text-sm ${notification.type === "error" ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"}`}>
          {notification.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Clients",  value: activeCount,  color: "text-cyan-600" },
          { label: "Legacy Clients",  value: legacyCount,  color: "text-gray-500" },
          { label: "Repeat Clients",  value: repeatCount,  color: "text-amber-600" },
          { label: "Total",           value: clients.length, color: "text-gray-800" }
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        {/* Tab toggle */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? "bg-cyan-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}>
              {tab} {tab === "active" ? `(${activeCount})` : `(${legacyCount})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input type="text" placeholder="Search clients..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm" />
        </div>

        {/* Type filter */}
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">All Types</option>
          <option value="Direct">Direct</option>
          <option value="B2B">B2B</option>
        </select>
      </div>

      {/* Client count */}
      <p className="text-sm text-gray-500 mb-3">Showing {filtered.length} of {activeTab === "active" ? activeCount : legacyCount} {activeTab} clients</p>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-cyan-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-medium">No {activeTab} clients found</p>
          <p className="text-sm mt-1">{activeTab === "active" ? "Convert leads to see them here." : "Legacy clients appear here after promotion."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(client => (
            <ClientCard key={client.id} client={client} onClick={setSelectedClient} />
          ))}
        </div>
      )}

      {/* Client detail modal */}
      {selectedClient && (
        <ClientDetailPage
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onPromoteToLegacy={handlePromoteToLegacy}
          onClientUpdate={() => {}} // real-time listener handles updates
        />
      )}

      {/* Quick ticket creation modal */}
      <Modal isOpen={isTicketOpen} onClose={() => { setIsTicketOpen(false); setTicketClient(null); }}
        title={`New Ticket — ${ticketClient?.name || ""}`} size="md">
        <JobTicketForm onSubmit={handleCreateTicket}
          onCancel={() => { setIsTicketOpen(false); setTicketClient(null); }}
          isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
};

export default ClientsPage;