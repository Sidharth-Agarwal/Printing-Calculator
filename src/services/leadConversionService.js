import {
  doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, Timestamp
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getLeadById, updateLeadStatus } from "./leadService";
import { getDiscussionsForLead } from "./discussionService";

/**
 * Convert a lead to a permanent client.
 * Carries over weddingDate and birthdayDate added in Phase 1.
 */
export const convertLeadToClient = async (leadId, clientData = {}) => {
  try {
    const lead = await getLeadById(leadId);
    if (!lead) throw new Error(`Lead with ID ${leadId} not found`);

    let discussions = [];
    try { discussions = await getDiscussionsForLead(leadId); } catch {}

    const discussionNotes = discussions.length > 0
      ? `\n\nDiscussions:\n${discussions.map(d => `- ${formatDate(d.date)}: ${d.summary}`).join("\n")}`
      : "";

    // Helper to carry over a date field safely
    const toTimestamp = (v) => {
      if (!v) return null;
      if (v instanceof Timestamp) return v;
      if (v?.toDate) return Timestamp.fromDate(v.toDate());
      if (v?.seconds) return Timestamp.fromMillis(v.seconds * 1000);
      const d = new Date(v);
      return isNaN(d) ? null : Timestamp.fromDate(d);
    };

    const newClient = {
      name:          lead.name,
      contactPerson: lead.name,
      company:       lead.company || "",
      phone:         lead.phone,
      email:         lead.email,

      address: lead.address || { line1: "", line2: "", city: "", state: "", postalCode: "", country: "India" },
      billingAddress: lead.address || { line1: "", line2: "", city: "", state: "", postalCode: "", country: "India" },

      clientType: clientData.clientType || "Direct",
      clientCode: clientData.clientCode || "",

      // ── Phase 1 date fields ────────────────────────────────────────────────
      weddingDate:  toTimestamp(lead.weddingDate),
      birthdayDate: toTimestamp(lead.birthdayDate),

      notes: `Converted from lead. Source: ${lead.source || "Unknown"}\n\nLead Notes: ${lead.notes || ""}` + discussionNotes,

      createdAt:   serverTimestamp(),
      updatedAt:   serverTimestamp(),
      isActive:    true,
      isLegacy:    false,

      // Stats
      activeEstimates:   0,
      activeOrders:      0,
      totalOrders:       0,
      totalSpend:        0,
      averageOrderValue: 0,

      // Discussion fields
      lastDiscussionDate:    null,
      lastDiscussionSummary: null,
      totalDiscussions:      0,

      // Source tracking
      leadSource:        lead.source,
      convertedFromLead: leadId,
      convertedAt:       serverTimestamp(),

      ...clientData
    };

    const clientRef = await addDoc(collection(db, "clients"), newClient);
    const clientSnap = await getDoc(clientRef);
    const createdClient = { id: clientRef.id, ...clientSnap.data() };

    await updateLeadStatus(leadId, "converted");
    await updateDoc(doc(db, "leads", leadId), {
      convertedToClientId: clientRef.id,
      convertedAt: serverTimestamp()
    });

    return createdClient;
  } catch (err) {
    console.error(`Error converting lead ${leadId} to client:`, err);
    throw err;
  }
};

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const date = timestamp instanceof Timestamp
    ? timestamp.toDate()
    : timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export const checkLeadConversionReadiness = async (leadId) => {
  try {
    const lead = await getLeadById(leadId);
    if (!lead) throw new Error(`Lead with ID ${leadId} not found`);

    let discussions = [];
    try { discussions = await getDiscussionsForLead(leadId); } catch {}

    const isReady = {
      status:       lead.status === "qualified" || lead.status === "negotiation" || lead.status === "converted",
      contactInfo:  !!lead.phone && !!lead.email,
      hasDiscussions: discussions.length > 0,
      overall:      false,
      reasons:      []
    };

    if (!isReady.status)       isReady.reasons.push("Lead status should ideally be 'Qualified' or 'Negotiation'");
    if (!isReady.contactInfo)  isReady.reasons.push("Lead is missing phone or email information");
    if (!isReady.hasDiscussions) isReady.reasons.push("No discussions recorded with this lead");

    isReady.overall = isReady.contactInfo;
    return isReady;
  } catch {
    return { overall: true, reasons: ["Could not fully check conversion readiness, but you can still proceed."] };
  }
};