import {
  collection, addDoc, doc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION = "orders";

export const ORDER_STATUSES = [
  { id: "design",     label: "Design",     color: "#3B82F6", bgColor: "#EFF6FF", textColor: "#1E40AF" },
  { id: "production", label: "Production", color: "#F59E0B", bgColor: "#FFFBEB", textColor: "#B45309" },
  { id: "dispatched", label: "Dispatched", color: "#8B5CF6", bgColor: "#F3E8FF", textColor: "#6B21A8" },
  { id: "completed",  label: "Completed",  color: "#10B981", bgColor: "#ECFDF5", textColor: "#047857" }
];

export const PAYMENT_STATUSES = [
  { value: "pending",  label: "Pending" },
  { value: "partial",  label: "Partial" },
  { value: "paid",     label: "Paid" }
];

export const JOB_TYPES = [
  "Wedding Invitations", "Business Cards", "Stationery", "Packaging",
  "Booklet / Book", "Marketing Materials", "Notebook", "Other"
];

/**
 * Create a job ticket for a client
 */
export const createJobTicket = async (clientId, ticketData) => {
  try {
    const ref = await addDoc(collection(db, COLLECTION), {
      clientId,
      jobType:        ticketData.jobType        || "",
      orderStatus:    ticketData.orderStatus    || "design",
      deadline:       ticketData.deadline       || null,
      finalBilled:    ticketData.finalBilled    || 0,
      advancePaid:    ticketData.advancePaid    || 0,
      courierCharges: ticketData.courierCharges || 0,
      paymentStatus:  ticketData.paymentStatus  || "pending",
      notes:          ticketData.notes          || "",
      attachments:    ticketData.attachments    || [],
      createdAt:      serverTimestamp(),
      updatedAt:      serverTimestamp()
    });
    const snap = await getDoc(ref);
    return { id: ref.id, ...snap.data() };
  } catch (err) {
    console.error("Error creating job ticket:", err);
    throw err;
  }
};

/**
 * Update a job ticket
 */
export const updateJobTicket = async (ticketId, updates) => {
  try {
    await updateDoc(doc(db, COLLECTION, ticketId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error(`Error updating job ticket ${ticketId}:`, err);
    throw err;
  }
};

/**
 * Update only the order status
 */
export const updateOrderStatus = async (ticketId, orderStatus) => {
  return updateJobTicket(ticketId, { orderStatus });
};

/**
 * Delete a job ticket
 */
export const deleteJobTicket = async (ticketId) => {
  try {
    await deleteDoc(doc(db, COLLECTION, ticketId));
  } catch (err) {
    console.error(`Error deleting job ticket ${ticketId}:`, err);
    throw err;
  }
};

/**
 * Get all job tickets for a client
 */
export const getTicketsForClient = async (clientId) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error fetching job tickets:", err);
    return [];
  }
};

/**
 * Get a single ticket by ID
 */
export const getTicketById = async (ticketId) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, ticketId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error(`Error fetching ticket ${ticketId}:`, err);
    throw err;
  }
};

/**
 * Calculate pending balance from a ticket
 */
export const getPendingBalance = (ticket) => {
  const billed  = parseFloat(ticket.finalBilled    || 0);
  const advance = parseFloat(ticket.advancePaid    || 0);
  const courier = parseFloat(ticket.courierCharges || 0);
  return Math.max(0, billed + courier - advance);
};

/**
 * Check if a client should be auto-promoted to Legacy.
 * Condition: deadline has passed AND orderStatus === "completed"
 */
export const shouldPromoteToLegacy = (ticket) => {
  if (ticket.orderStatus !== "completed") return false;
  if (!ticket.deadline) return false;
  const deadline = ticket.deadline?.toDate
    ? ticket.deadline.toDate()
    : ticket.deadline?.seconds
    ? new Date(ticket.deadline.seconds * 1000)
    : new Date(ticket.deadline);
  return deadline < new Date();
};

/**
 * Get active tickets across all clients (for dashboard)
 */
export const getActiveTickets = async () => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("orderStatus", "in", ["design", "production", "dispatched"])
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error fetching active tickets:", err);
    return [];
  }
};