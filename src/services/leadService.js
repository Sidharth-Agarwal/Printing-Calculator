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
  serverTimestamp 
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
      isActive: true
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