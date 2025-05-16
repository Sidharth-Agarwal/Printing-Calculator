import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Get counts of estimates in escrow by status
 */
export const getEscrowStats = async () => {
  try {
    // Query for all estimates in escrow
    const escrowQuery = query(
      collection(db, "estimates"),
      where("inEscrow", "==", true)
    );
    
    const snapshot = await getDocs(escrowQuery);
    const estimates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Calculate counts
    const totalCount = estimates.length;
    const pendingCount = estimates.filter(est => !est.isApproved && !est.isRejected).length;
    const approvedCount = estimates.filter(est => est.isApproved).length;
    const rejectedCount = estimates.filter(est => est.isRejected).length;
    
    // Group by client
    const clientCounts = {};
    estimates.forEach(est => {
      const clientId = est.clientId || "unknown";
      if (!clientCounts[clientId]) {
        clientCounts[clientId] = 1;
      } else {
        clientCounts[clientId]++;
      }
    });
    
    const clientCount = Object.keys(clientCounts).length;
    
    return {
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      clientCount
    };
  } catch (error) {
    console.error("Error getting escrow stats:", error);
    return {
      totalCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      clientCount: 0
    };
  }
};

/**
 * Check if an estimate is in escrow
 */
export const isEstimateInEscrow = (estimate) => {
  return estimate && estimate.inEscrow === true;
};

/**
 * Format the escrow status of an estimate for display
 */
export const formatEscrowStatus = (estimate) => {
  if (!estimate || !estimate.inEscrow) {
    return { status: "Not in Escrow", className: "text-gray-500" };
  }
  
  if (estimate.isApproved) {
    return { 
      status: "Approved", 
      className: "text-green-600",
      date: estimate.approvedAt,
      notes: estimate.approvalNotes
    };
  }
  
  if (estimate.isRejected) {
    return { 
      status: "Rejected", 
      className: "text-red-600",
      date: estimate.rejectedAt,
      notes: estimate.rejectionNotes
    };
  }
  
  return { 
    status: "Pending Approval", 
    className: "text-amber-600",
    date: estimate.movedToEscrowAt
  };
};

/**
 * Get estimate details for escrow display
 */
export const getEscrowEstimateDetails = async (estimateId) => {
  if (!estimateId) return null;
  
  try {
    const estimateDoc = await getDoc(doc(db, "estimates", estimateId));
    
    if (!estimateDoc.exists()) {
      return null;
    }
    
    const estimateData = {
      id: estimateDoc.id,
      ...estimateDoc.data()
    };
    
    // Check if it's in escrow
    if (!estimateData.inEscrow) {
      return null;
    }
    
    // Get client details if available
    if (estimateData.clientId) {
      const clientDoc = await getDoc(doc(db, "clients", estimateData.clientId));
      if (clientDoc.exists()) {
        estimateData.clientDetails = {
          id: clientDoc.id,
          ...clientDoc.data()
        };
      }
    }
    
    // Get approver details if available
    if (estimateData.approvedBy) {
      const userDoc = await getDoc(doc(db, "users", estimateData.approvedBy));
      if (userDoc.exists()) {
        estimateData.approverDetails = {
          id: userDoc.id,
          name: userDoc.data().displayName || userDoc.data().email,
          email: userDoc.data().email
        };
      }
    }
    
    // Get rejecter details if available
    if (estimateData.rejectedBy) {
      const userDoc = await getDoc(doc(db, "users", estimateData.rejectedBy));
      if (userDoc.exists()) {
        estimateData.rejecterDetails = {
          id: userDoc.id,
          name: userDoc.data().displayName || userDoc.data().email,
          email: userDoc.data().email
        };
      }
    }
    
    return estimateData;
  } catch (error) {
    console.error("Error fetching escrow estimate details:", error);
    return null;
  }
};

/**
 * Move an estimate to escrow
 */
export const moveEstimateToEscrow = async (estimateId) => {
  if (!estimateId) {
    throw new Error("No estimate ID provided");
  }
  
  try {
    const estimateRef = doc(db, "estimates", estimateId);
    await updateDoc(estimateRef, {
      inEscrow: true,
      movedToEscrow: true,
      movedToEscrowAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error moving estimate to escrow:", error);
    throw error;
  }
};

/**
 * Get all escrow estimates for a specific client
 */
export const getClientEscrowEstimates = async (clientId) => {
  if (!clientId) return [];
  
  try {
    const escrowQuery = query(
      collection(db, "estimates"),
      where("clientId", "==", clientId),
      where("inEscrow", "==", true)
    );
    
    const snapshot = await getDocs(escrowQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching client escrow estimates:", error);
    return [];
  }
};

/**
 * Get escrow approval history for a client
 */
export const getClientEscrowHistory = async (clientId) => {
  if (!clientId) return [];
  
  try {
    // Query all escrow estimates for this client that have been processed
    const escrowQuery = query(
      collection(db, "estimates"),
      where("clientId", "==", clientId),
      where("inEscrow", "==", true)
    );
    
    const snapshot = await getDocs(escrowQuery);
    const allEstimates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter to only include processed ones (approved or rejected)
    const processedEstimates = allEstimates.filter(est => 
      est.isApproved || est.isRejected
    );
    
    // Sort by processed date (newest first)
    processedEstimates.sort((a, b) => {
      const dateA = a.approvedAt || a.rejectedAt || "";
      const dateB = b.approvedAt || b.rejectedAt || "";
      return dateB.localeCompare(dateA);
    });
    
    return processedEstimates;
  } catch (error) {
    console.error("Error fetching client escrow history:", error);
    return [];
  }
};

/**
 * Check if there are pending estimates in escrow for a specific client
 */
export const hasClientPendingEscrowEstimates = async (clientId) => {
  if (!clientId) return false;
  
  try {
    const escrowQuery = query(
      collection(db, "estimates"),
      where("clientId", "==", clientId),
      where("inEscrow", "==", true)
    );
    
    const snapshot = await getDocs(escrowQuery);
    const estimates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Check if any estimates are pending (neither approved nor rejected)
    return estimates.some(est => !est.isApproved && !est.isRejected);
  } catch (error) {
    console.error("Error checking client pending escrow estimates:", error);
    return false;
  }
};

/**
 * Get counts of pending escrow estimates by client
 */
export const getPendingEscrowCounts = async () => {
  try {
    // Query all pending escrow estimates
    const escrowQuery = query(
      collection(db, "estimates"),
      where("inEscrow", "==", true)
    );
    
    const snapshot = await getDocs(escrowQuery);
    const estimates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter to only include pending ones
    const pendingEstimates = estimates.filter(est => 
      !est.isApproved && !est.isRejected
    );
    
    // Group by client and count
    const clientCounts = {};
    pendingEstimates.forEach(est => {
      const clientId = est.clientId || "unknown";
      const clientName = est.clientInfo?.name || est.clientName || "Unknown Client";
      
      if (!clientCounts[clientId]) {
        clientCounts[clientId] = {
          clientId,
          clientName,
          count: 1
        };
      } else {
        clientCounts[clientId].count++;
      }
    });
    
    // Convert to array for easier use
    return Object.values(clientCounts);
  } catch (error) {
    console.error("Error getting pending escrow counts:", error);
    return [];
  }
};

/**
 * Format a human-readable time since date
 */
export const formatTimeSince = (dateString) => {
  if (!dateString) return "Unknown";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  }
  
  if (diffHour > 0) {
    return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
  }
  
  if (diffMin > 0) {
    return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
  }
  
  return "Just now";
};