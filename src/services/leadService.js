import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp,
  limit 
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION_NAME = "leads";

/**
 * Create a new lead
 * @param {Object} leadData - Lead data
 * @returns {Promise<Object>} - Created lead with ID
 */
export const createLead = async (leadData) => {
  try {
    const leadRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...leadData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      // Initialize discussion fields
      lastDiscussionDate: null,
      lastDiscussionSummary: null
    });
    
    // Get the created document to return with ID
    const leadSnap = await getDoc(leadRef);
    
    return {
      id: leadRef.id,
      ...leadSnap.data()
    };
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
};

/**
 * Update an existing lead
 * @param {string} leadId - ID of the lead to update
 * @param {Object} leadData - Updated lead data
 * @returns {Promise<void>}
 */
export const updateLead = async (leadId, leadData) => {
  try {
    const leadRef = doc(db, COLLECTION_NAME, leadId);
    
    // Remove any undefined values
    Object.keys(leadData).forEach(key => 
      leadData[key] === undefined && delete leadData[key]
    );
    
    await updateDoc(leadRef, {
      ...leadData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating lead ${leadId}:`, error);
    throw error;
  }
};

/**
 * Delete a lead
 * @param {string} leadId - ID of the lead to delete
 * @returns {Promise<void>}
 */
export const deleteLead = async (leadId) => {
  try {
    const leadRef = doc(db, COLLECTION_NAME, leadId);
    await deleteDoc(leadRef);
  } catch (error) {
    console.error(`Error deleting lead ${leadId}:`, error);
    throw error;
  }
};

/**
 * Get a lead by ID
 * @param {string} leadId - ID of the lead to fetch
 * @returns {Promise<Object|null>} - Lead data or null if not found
 */
export const getLeadById = async (leadId) => {
  try {
    const leadRef = doc(db, COLLECTION_NAME, leadId);
    const leadSnap = await getDoc(leadRef);
    
    if (!leadSnap.exists()) {
      return null;
    }
    
    return {
      id: leadSnap.id,
      ...leadSnap.data()
    };
  } catch (error) {
    console.error(`Error fetching lead ${leadId}:`, error);
    throw error;
  }
};

/**
 * Update lead status
 * @param {string} leadId - ID of the lead
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
export const updateLeadStatus = async (leadId, status) => {
  try {
    const leadRef = doc(db, COLLECTION_NAME, leadId);
    await updateDoc(leadRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating lead status ${leadId}:`, error);
    throw error;
  }
};

/**
 * Update lead qualification badge
 * @param {string} leadId - ID of the lead
 * @param {string} badgeId - ID of the qualification badge
 * @returns {Promise<void>}
 */
export const updateLeadBadge = async (leadId, badgeId) => {
  try {
    const leadRef = doc(db, COLLECTION_NAME, leadId);
    await updateDoc(leadRef, {
      badgeId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating lead badge ${leadId}:`, error);
    throw error;
  }
};

/**
 * Get leads by status
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} - Array of leads with the specified status
 */
export const getLeadsByStatus = async (status) => {
  try {
    const leadsQuery = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", status),
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(leadsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching leads with status ${status}:`, error);
    throw error;
  }
};

/**
 * Get leads by source
 * @param {string} source - Source to filter by
 * @returns {Promise<Array>} - Array of leads from the specified source
 */
export const getLeadsBySource = async (source) => {
  try {
    const leadsQuery = query(
      collection(db, COLLECTION_NAME),
      where("source", "==", source),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(leadsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching leads from source ${source}:`, error);
    throw error;
  }
};

/**
 * Mark a lead as inactive (soft delete)
 * @param {string} leadId - ID of the lead
 * @returns {Promise<void>}
 */
export const markLeadInactive = async (leadId) => {
  try {
    const leadRef = doc(db, COLLECTION_NAME, leadId);
    await updateDoc(leadRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error marking lead inactive ${leadId}:`, error);
    throw error;
  }
};

/**
 * Update lead after discussion
 * @param {string} leadId - ID of the lead
 * @param {string} discussionSummary - Summary of the discussion
 * @returns {Promise<void>}
 */
export const updateLeadDiscussion = async (leadId, discussionSummary) => {
  try {
    const leadRef = doc(db, COLLECTION_NAME, leadId);
    await updateDoc(leadRef, {
      lastDiscussionDate: serverTimestamp(),
      lastDiscussionSummary: discussionSummary,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating lead discussion ${leadId}:`, error);
    throw error;
  }
};

/**
 * Recalculate and update lead's last contact information
 * This function finds the most recent discussion and updates the lead accordingly
 * @param {string} leadId - ID of the lead
 * @returns {Promise<void>}
 */
export const recalculateLeadLastContact = async (leadId) => {
  try {
    // Find the most recent discussion for this lead
    const discussionsQuery = query(
      collection(db, "discussions"),
      where("leadId", "==", leadId),
      orderBy("date", "desc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(discussionsQuery);
    const leadRef = doc(db, COLLECTION_NAME, leadId);
    
    if (querySnapshot.empty) {
      // No discussions left - clear the last contact fields
      await updateDoc(leadRef, {
        lastDiscussionDate: null,
        lastDiscussionSummary: null,
        updatedAt: serverTimestamp()
      });
      console.log(`Lead ${leadId} last contact cleared - no discussions remaining`);
    } else {
      // Update with the new most recent discussion
      const mostRecentDiscussion = querySnapshot.docs[0].data();
      await updateDoc(leadRef, {
        lastDiscussionDate: mostRecentDiscussion.date,
        lastDiscussionSummary: mostRecentDiscussion.summary,
        updatedAt: serverTimestamp()
      });
      console.log(`Lead ${leadId} last contact updated to most recent discussion`);
    }
  } catch (error) {
    console.error(`Error recalculating lead last contact ${leadId}:`, error);
    throw error;
  }
};

/**
 * Get leads with recent activity (discussions, updates, etc.)
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} - Array of leads with recent activity
 */
export const getLeadsWithRecentActivity = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const leadsQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(leadsQuery);
    
    const leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter leads with recent activity
    return leads.filter(lead => {
      if (!lead.lastDiscussionDate && !lead.updatedAt) {
        return false;
      }
      
      const lastActivity = lead.lastDiscussionDate || lead.updatedAt;
      const activityDate = lastActivity?.toDate ? lastActivity.toDate() : (lastActivity?.seconds ? new Date(lastActivity.seconds * 1000) : new Date(lastActivity));
      
      return activityDate >= cutoffDate;
    });
  } catch (error) {
    console.error(`Error fetching leads with recent activity:`, error);
    return [];
  }
};

/**
 * Get lead statistics
 * @returns {Promise<Object>} - Lead statistics
 */
export const getLeadStats = async () => {
  try {
    const leadsQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(leadsQuery);
    
    const leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const stats = {
      total: leads.length,
      active: leads.filter(l => l.isActive !== false).length,
      newLead: leads.filter(l => l.status === "newLead").length,
      contacted: leads.filter(l => l.status === "contacted").length,
      qualified: leads.filter(l => l.status === "qualified").length,
      negotiation: leads.filter(l => l.status === "negotiation").length,
      converted: leads.filter(l => l.status === "converted").length,
      lost: leads.filter(l => l.status === "lost").length,
      movedToClients: leads.filter(l => l.status === "converted" && l.movedToClients).length
    };
    
    // Calculate conversion rate
    if (stats.total > 0) {
      stats.conversionRate = Math.round((stats.converted / stats.total) * 100);
    } else {
      stats.conversionRate = 0;
    }
    
    return stats;
  } catch (error) {
    console.error("Error fetching lead statistics:", error);
    return {
      total: 0,
      active: 0,
      newLead: 0,
      contacted: 0,
      qualified: 0,
      negotiation: 0,
      converted: 0,
      lost: 0,
      movedToClients: 0,
      conversionRate: 0
    };
  }
};

/**
 * Search leads by name, email, phone, or company
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Array of matching leads
 */
export const searchLeads = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Get all leads and filter manually (Firestore doesn't support case-insensitive search)
    const leadsQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(leadsQuery);
    
    const allLeads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter leads based on search term
    return allLeads.filter(lead => 
      lead.name?.toLowerCase().includes(searchTermLower) ||
      lead.email?.toLowerCase().includes(searchTermLower) ||
      lead.company?.toLowerCase().includes(searchTermLower) ||
      lead.phone?.includes(searchTerm) ||
      lead.lastDiscussionSummary?.toLowerCase().includes(searchTermLower)
    );
  } catch (error) {
    console.error(`Error searching leads with term ${searchTerm}:`, error);
    return [];
  }
};

/**
 * Get leads by qualification badge
 * @param {string} badgeId - Badge ID to filter by
 * @returns {Promise<Array>} - Array of leads with the specified badge
 */
export const getLeadsByBadge = async (badgeId) => {
  try {
    const leadsQuery = query(
      collection(db, COLLECTION_NAME),
      where("badgeId", "==", badgeId),
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(leadsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching leads with badge ${badgeId}:`, error);
    throw error;
  }
};

/**
 * Update multiple leads (batch update)
 * @param {Array} updates - Array of {leadId, data} objects
 * @returns {Promise<void>}
 */
export const updateMultipleLeads = async (updates) => {
  try {
    const updatePromises = updates.map(({ leadId, data }) => {
      const leadRef = doc(db, COLLECTION_NAME, leadId);
      return updateDoc(leadRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
    console.log(`Successfully updated ${updates.length} leads`);
  } catch (error) {
    console.error("Error updating multiple leads:", error);
    throw error;
  }
};

/**
 * Get leads that need follow-up (haven't been contacted in X days)
 * @param {number} days - Number of days since last contact
 * @returns {Promise<Array>} - Array of leads needing follow-up
 */
export const getLeadsNeedingFollowUp = async (days = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const leadsQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(leadsQuery);
    
    const leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter leads that need follow-up
    return leads.filter(lead => {
      // Skip converted or lost leads
      if (lead.status === "converted" || lead.status === "lost") {
        return false;
      }
      
      // If no last discussion date, check creation date
      const lastContactDate = lead.lastDiscussionDate || lead.createdAt;
      
      if (!lastContactDate) {
        return true; // No contact info available, needs follow-up
      }
      
      const contactDate = lastContactDate?.toDate ? lastContactDate.toDate() : 
                         (lastContactDate?.seconds ? new Date(lastContactDate.seconds * 1000) : 
                         new Date(lastContactDate));
      
      return contactDate < cutoffDate;
    });
  } catch (error) {
    console.error(`Error fetching leads needing follow-up:`, error);
    return [];
  }
};