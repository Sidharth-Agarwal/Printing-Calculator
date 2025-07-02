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
  Timestamp,
  limit 
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { updateLeadDiscussion } from "./leadService";
import { updateClientDiscussion } from "./clientService";

const COLLECTION_NAME = "discussions";

/**
 * Create a new discussion for a lead
 * @param {string} leadId - ID of the lead
 * @param {Object} discussionData - Discussion data
 * @param {string} userId - ID of the user creating the discussion
 * @returns {Promise<Object>} - Created discussion with ID
 */
export const createDiscussion = async (leadId, discussionData, userId) => {
  try {
    console.log("Creating discussion for lead:", leadId, "with data:", discussionData);
    
    // Convert string date to Timestamp if provided
    let discussionDate = serverTimestamp();
    if (discussionData.discussionDate) {
      if (typeof discussionData.discussionDate === 'string') {
        // Convert string date to timestamp
        discussionDate = Timestamp.fromDate(new Date(discussionData.discussionDate));
      } else if (discussionData.discussionDate instanceof Date) {
        discussionDate = Timestamp.fromDate(discussionData.discussionDate);
      }
    }
    
    // Prepare the discussion data
    const discussionDoc = {
      leadId,
      type: "lead", // Add type field to distinguish
      summary: discussionData.discussionSummary,
      nextSteps: discussionData.nextSteps || "",
      date: discussionDate,
      createdBy: userId,
      createdAt: serverTimestamp()
    };
    
    console.log("Prepared discussion document:", discussionDoc);
    
    // Add to Firestore
    const discussionRef = await addDoc(collection(db, COLLECTION_NAME), discussionDoc);
    console.log("Discussion created with ID:", discussionRef.id);
    
    // Get the created document to return with ID
    const discussionSnap = await getDoc(discussionRef);
    
    // Update the lead with the latest discussion info
    await updateLeadDiscussion(leadId, discussionData.discussionSummary);
    console.log("Lead updated with discussion info");
    
    return {
      id: discussionRef.id,
      ...discussionSnap.data()
    };
  } catch (error) {
    console.error("Error creating discussion:", error);
    throw error;
  }
};

/**
 * Create a new discussion for a client
 * @param {string} clientId - ID of the client
 * @param {Object} discussionData - Discussion data
 * @param {string} userId - ID of the user creating the discussion
 * @returns {Promise<Object>} - Created discussion with ID
 */
export const createClientDiscussion = async (clientId, discussionData, userId) => {
  try {
    console.log("Creating discussion for client:", clientId, "with data:", discussionData);
    
    // Convert string date to Timestamp if provided
    let discussionDate = serverTimestamp();
    if (discussionData.discussionDate) {
      if (typeof discussionData.discussionDate === 'string') {
        // Convert string date to timestamp
        discussionDate = Timestamp.fromDate(new Date(discussionData.discussionDate));
      } else if (discussionData.discussionDate instanceof Date) {
        discussionDate = Timestamp.fromDate(discussionData.discussionDate);
      }
    }
    
    // Prepare the discussion data
    const discussionDoc = {
      clientId,
      type: "client", // Add type field to distinguish
      summary: discussionData.discussionSummary,
      nextSteps: discussionData.nextSteps || "",
      date: discussionDate,
      createdBy: userId,
      createdAt: serverTimestamp()
    };
    
    console.log("Prepared client discussion document:", discussionDoc);
    
    // Add to Firestore
    const discussionRef = await addDoc(collection(db, COLLECTION_NAME), discussionDoc);
    console.log("Client discussion created with ID:", discussionRef.id);
    
    // Get the created document to return with ID
    const discussionSnap = await getDoc(discussionRef);
    
    // Update the client with the latest discussion info
    await updateClientDiscussion(clientId, discussionData.discussionSummary);
    console.log("Client updated with discussion info");
    
    return {
      id: discussionRef.id,
      ...discussionSnap.data()
    };
  } catch (error) {
    console.error("Error creating client discussion:", error);
    throw error;
  }
};

/**
 * Update an existing discussion
 * @param {string} discussionId - ID of the discussion to update
 * @param {Object} discussionData - Updated discussion data
 * @returns {Promise<void>}
 */
export const updateDiscussion = async (discussionId, discussionData) => {
  try {
    const discussionRef = doc(db, COLLECTION_NAME, discussionId);
    
    // Convert string date to Timestamp if provided
    let updateData = { ...discussionData };
    if (updateData.discussionDate) {
      if (typeof updateData.discussionDate === 'string') {
        updateData.date = Timestamp.fromDate(new Date(updateData.discussionDate));
      } else if (updateData.discussionDate instanceof Date) {
        updateData.date = Timestamp.fromDate(updateData.discussionDate);
      }
      delete updateData.discussionDate;
    }
    
    if (updateData.discussionSummary) {
      updateData.summary = updateData.discussionSummary;
      delete updateData.discussionSummary;
    }
    
    await updateDoc(discussionRef, updateData);
    
    // If the summary was updated, update the related lead or client too
    if (updateData.summary) {
      const discussionSnap = await getDoc(discussionRef);
      const discussionData = discussionSnap.data();
      
      if (discussionData.leadId) {
        await updateLeadDiscussion(discussionData.leadId, updateData.summary);
      } else if (discussionData.clientId) {
        await updateClientDiscussion(discussionData.clientId, updateData.summary);
      }
    }
  } catch (error) {
    console.error(`Error updating discussion ${discussionId}:`, error);
    throw error;
  }
};

/**
 * Delete a discussion and update the related lead/client's last contact info
 * @param {string} discussionId - ID of the discussion to delete
 * @returns {Promise<void>}
 */
export const deleteDiscussion = async (discussionId) => {
  try {
    // First, get the discussion to know which lead/client it belongs to
    const discussionRef = doc(db, COLLECTION_NAME, discussionId);
    const discussionSnap = await getDoc(discussionRef);
    
    if (!discussionSnap.exists()) {
      throw new Error(`Discussion with ID ${discussionId} not found`);
    }
    
    const discussionData = discussionSnap.data();
    const leadId = discussionData.leadId;
    const clientId = discussionData.clientId;
    
    console.log(`Deleting discussion ${discussionId} for ${leadId ? 'lead' : 'client'}: ${leadId || clientId}`);
    
    // Delete the discussion document
    await deleteDoc(discussionRef);
    console.log(`Discussion ${discussionId} deleted successfully`);
    
    // Update the related lead or client's last contact information
    if (leadId) {
      await updateLeadLastContact(leadId);
    } else if (clientId) {
      await updateClientLastContact(clientId);
    }
    
  } catch (error) {
    console.error(`Error deleting discussion ${discussionId}:`, error);
    throw error;
  }
};

/**
 * Update lead's last contact information after discussion deletion
 * @param {string} leadId - ID of the lead
 * @returns {Promise<void>}
 */
const updateLeadLastContact = async (leadId) => {
  try {
    // Find the most recent remaining discussion for this lead
    const discussionsQuery = query(
      collection(db, COLLECTION_NAME),
      where("leadId", "==", leadId),
      orderBy("date", "desc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(discussionsQuery);
    const leadRef = doc(db, "leads", leadId);
    
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
    console.error(`Error updating lead last contact ${leadId}:`, error);
    // Don't throw here - the discussion deletion was successful
  }
};

/**
 * Update client's last contact information after discussion deletion
 * @param {string} clientId - ID of the client
 * @returns {Promise<void>}
 */
const updateClientLastContact = async (clientId) => {
  try {
    // Find the most recent remaining discussion for this client
    const discussionsQuery = query(
      collection(db, COLLECTION_NAME),
      where("clientId", "==", clientId),
      orderBy("date", "desc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(discussionsQuery);
    const clientRef = doc(db, "clients", clientId);
    
    if (querySnapshot.empty) {
      // No discussions left - clear the last contact fields
      await updateDoc(clientRef, {
        lastDiscussionDate: null,
        lastDiscussionSummary: null,
        updatedAt: serverTimestamp()
      });
      console.log(`Client ${clientId} last contact cleared - no discussions remaining`);
    } else {
      // Update with the new most recent discussion
      const mostRecentDiscussion = querySnapshot.docs[0].data();
      await updateDoc(clientRef, {
        lastDiscussionDate: mostRecentDiscussion.date,
        lastDiscussionSummary: mostRecentDiscussion.summary,
        updatedAt: serverTimestamp()
      });
      console.log(`Client ${clientId} last contact updated to most recent discussion`);
    }
  } catch (error) {
    console.error(`Error updating client last contact ${clientId}:`, error);
    // Don't throw here - the discussion deletion was successful
  }
};

/**
 * Helper function to recalculate last contact for a lead
 * This can be called manually if needed to fix inconsistencies
 * @param {string} leadId - ID of the lead
 * @returns {Promise<void>}
 */
export const recalculateLeadLastContact = async (leadId) => {
  await updateLeadLastContact(leadId);
};

/**
 * Helper function to recalculate last contact for a client
 * This can be called manually if needed to fix inconsistencies
 * @param {string} clientId - ID of the client
 * @returns {Promise<void>}
 */
export const recalculateClientLastContact = async (clientId) => {
  await updateClientLastContact(clientId);
};

/**
 * Get discussions for a lead
 * @param {string} leadId - ID of the lead
 * @returns {Promise<Array>} - Array of discussions
 */
export const getDiscussionsForLead = async (leadId) => {
  try {
    console.log("Fetching discussions for lead:", leadId);
    
    if (!leadId) {
      console.error("Invalid leadId provided to getDiscussionsForLead:", leadId);
      return [];
    }
    
    let discussions = [];
    
    // First try with orderBy (which requires an index)
    try {
      const discussionsQuery = query(
        collection(db, COLLECTION_NAME),
        where("leadId", "==", leadId),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await getDocs(discussionsQuery);
      
      discussions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (indexError) {
      // If we get an index error, fall back to simpler query without orderBy
      console.warn("Index error in getDiscussionsForLead, falling back to unordered query:", indexError);
      
      const simpleQuery = query(
        collection(db, COLLECTION_NAME),
        where("leadId", "==", leadId)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      
      discussions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort manually client-side
      discussions.sort((a, b) => {
        const dateA = a.date ? (a.date.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime()) : 0;
        const dateB = b.date ? (b.date.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime()) : 0;
        return dateB - dateA; // descending order
      });
    }
    
    console.log(`Found ${discussions.length} discussions for lead ${leadId}`);
    return discussions;
  } catch (error) {
    console.error(`Error fetching discussions for lead ${leadId}:`, error);
    // Return empty array rather than throwing to prevent application from crashing
    return [];
  }
};

/**
 * Get discussions for a client
 * @param {string} clientId - ID of the client
 * @returns {Promise<Array>} - Array of discussions
 */
export const getDiscussionsForClient = async (clientId) => {
  try {
    console.log("Fetching discussions for client:", clientId);
    
    if (!clientId) {
      console.error("Invalid clientId provided to getDiscussionsForClient:", clientId);
      return [];
    }
    
    let discussions = [];
    
    // First try with orderBy (which requires an index)
    try {
      const discussionsQuery = query(
        collection(db, COLLECTION_NAME),
        where("clientId", "==", clientId),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await getDocs(discussionsQuery);
      
      discussions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (indexError) {
      // If we get an index error, fall back to simpler query without orderBy
      console.warn("Index error in getDiscussionsForClient, falling back to unordered query:", indexError);
      
      const simpleQuery = query(
        collection(db, COLLECTION_NAME),
        where("clientId", "==", clientId)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      
      discussions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort manually client-side
      discussions.sort((a, b) => {
        const dateA = a.date ? (a.date.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime()) : 0;
        const dateB = b.date ? (b.date.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime()) : 0;
        return dateB - dateA; // descending order
      });
    }
    
    console.log(`Found ${discussions.length} discussions for client ${clientId}`);
    return discussions;
  } catch (error) {
    console.error(`Error fetching discussions for client ${clientId}:`, error);
    // Return empty array rather than throwing to prevent application from crashing
    return [];
  }
};

/**
 * Get a single discussion by ID
 * @param {string} discussionId - ID of the discussion
 * @returns {Promise<Object|null>} - Discussion data or null if not found
 */
export const getDiscussionById = async (discussionId) => {
  try {
    const discussionRef = doc(db, COLLECTION_NAME, discussionId);
    const discussionSnap = await getDoc(discussionRef);
    
    if (!discussionSnap.exists()) {
      return null;
    }
    
    return {
      id: discussionSnap.id,
      ...discussionSnap.data()
    };
  } catch (error) {
    console.error(`Error fetching discussion ${discussionId}:`, error);
    throw error;
  }
};

/**
 * Get recent discussions across all leads and clients
 * @param {number} limit - Maximum number of discussions to return
 * @param {string} type - Filter by type: "lead", "client", or null for all
 * @returns {Promise<Array>} - Array of recent discussions
 */
export const getRecentDiscussions = async (limit = 10, type = null) => {
  try {
    // First try with orderBy
    try {
      let discussionsQuery;
      
      if (type) {
        discussionsQuery = query(
          collection(db, COLLECTION_NAME),
          where("type", "==", type),
          orderBy("date", "desc"),
          limit(limit)
        );
      } else {
        discussionsQuery = query(
          collection(db, COLLECTION_NAME),
          orderBy("date", "desc"),
          limit(limit)
        );
      }
      
      const querySnapshot = await getDocs(discussionsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (indexError) {
      // If index error occurs, get all and sort manually
      console.warn("Index error in getRecentDiscussions, fetching all and sorting manually:", indexError);
      
      let allDiscussionsQuery;
      
      if (type) {
        allDiscussionsQuery = query(
          collection(db, COLLECTION_NAME),
          where("type", "==", type)
        );
      } else {
        allDiscussionsQuery = query(collection(db, COLLECTION_NAME));
      }
      
      const querySnapshot = await getDocs(allDiscussionsQuery);
      
      const allDiscussions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by date manually
      allDiscussions.sort((a, b) => {
        const dateA = a.date ? (a.date.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime()) : 0;
        const dateB = b.date ? (b.date.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime()) : 0;
        return dateB - dateA; // descending order
      });
      
      // Return only the requested limit
      return allDiscussions.slice(0, limit);
    }
  } catch (error) {
    console.error(`Error fetching recent discussions:`, error);
    return []; // Return empty array rather than throwing
  }
};

/**
 * Get discussion statistics
 * @returns {Promise<Object>} - Discussion statistics
 */
export const getDiscussionStats = async () => {
  try {
    const allDiscussionsQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(allDiscussionsQuery);
    
    const discussions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const stats = {
      total: discussions.length,
      leadDiscussions: discussions.filter(d => d.type === "lead" || d.leadId).length,
      clientDiscussions: discussions.filter(d => d.type === "client" || d.clientId).length,
      thisWeek: 0,
      thisMonth: 0
    };
    
    // Calculate discussions this week and month
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    discussions.forEach(discussion => {
      const discussionDate = discussion.date?.toDate ? discussion.date.toDate() : 
                           (discussion.date?.seconds ? new Date(discussion.date.seconds * 1000) : 
                           new Date(discussion.date));
      
      if (discussionDate >= oneWeekAgo) {
        stats.thisWeek++;
      }
      if (discussionDate >= oneMonthAgo) {
        stats.thisMonth++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error("Error fetching discussion statistics:", error);
    return {
      total: 0,
      leadDiscussions: 0,
      clientDiscussions: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  }
};