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
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { updateLeadDiscussion } from "./leadService";

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
    
    // If the summary was updated, update the lead too
    if (updateData.summary) {
      const discussionSnap = await getDoc(discussionRef);
      const discussionData = discussionSnap.data();
      await updateLeadDiscussion(discussionData.leadId, updateData.summary);
    }
  } catch (error) {
    console.error(`Error updating discussion ${discussionId}:`, error);
    throw error;
  }
};

/**
 * Delete a discussion
 * @param {string} discussionId - ID of the discussion to delete
 * @returns {Promise<void>}
 */
export const deleteDiscussion = async (discussionId) => {
  try {
    const discussionRef = doc(db, COLLECTION_NAME, discussionId);
    await deleteDoc(discussionRef);
  } catch (error) {
    console.error(`Error deleting discussion ${discussionId}:`, error);
    throw error;
  }
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
 * Get recent discussions across all leads
 * @param {number} limit - Maximum number of discussions to return
 * @returns {Promise<Array>} - Array of recent discussions
 */
export const getRecentDiscussions = async (limit = 10) => {
  try {
    // First try with orderBy
    try {
      const discussionsQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy("date", "desc"),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(discussionsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (indexError) {
      // If index error occurs, get all and sort manually
      console.warn("Index error in getRecentDiscussions, fetching all and sorting manually:", indexError);
      
      const allDiscussionsQuery = query(collection(db, COLLECTION_NAME));
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