import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION_NAME = "qualificationBadges";

/**
 * Create a new qualification badge
 * @param {Object} badgeData - Badge data
 * @returns {Promise<Object>} - Created badge with ID
 */
export const createBadge = async (badgeData) => {
  try {
    // Get the current count of badges for determining priority
    const badgesQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(badgesQuery);
    const badgeCount = querySnapshot.size;
    
    const badgeRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...badgeData,
      priority: badgeData.priority || badgeCount + 1, // Default priority to count + 1
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Get the created document to return with ID
    const badgeSnap = await getDoc(badgeRef);
    
    return {
      id: badgeRef.id,
      ...badgeSnap.data()
    };
  } catch (error) {
    console.error("Error creating qualification badge:", error);
    throw error;
  }
};

/**
 * Update an existing qualification badge
 * @param {string} badgeId - ID of the badge to update
 * @param {Object} badgeData - Updated badge data
 * @returns {Promise<void>}
 */
export const updateBadge = async (badgeId, badgeData) => {
  try {
    const badgeRef = doc(db, COLLECTION_NAME, badgeId);
    await updateDoc(badgeRef, {
      ...badgeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating qualification badge ${badgeId}:`, error);
    throw error;
  }
};

/**
 * Delete a qualification badge
 * @param {string} badgeId - ID of the badge to delete
 * @returns {Promise<void>}
 */
export const deleteBadge = async (badgeId) => {
  try {
    const badgeRef = doc(db, COLLECTION_NAME, badgeId);
    await deleteDoc(badgeRef);
  } catch (error) {
    console.error(`Error deleting qualification badge ${badgeId}:`, error);
    throw error;
  }
};

/**
 * Get a qualification badge by ID
 * @param {string} badgeId - ID of the badge to fetch
 * @returns {Promise<Object|null>} - Badge data or null if not found
 */
export const getBadgeById = async (badgeId) => {
  try {
    const badgeRef = doc(db, COLLECTION_NAME, badgeId);
    const badgeSnap = await getDoc(badgeRef);
    
    if (!badgeSnap.exists()) {
      return null;
    }
    
    return {
      id: badgeSnap.id,
      ...badgeSnap.data()
    };
  } catch (error) {
    console.error(`Error fetching qualification badge ${badgeId}:`, error);
    throw error;
  }
};

/**
 * Get all qualification badges
 * @returns {Promise<Array>} - Array of all badges
 */
export const getAllBadges = async () => {
  try {
    const badgesQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy("priority", "asc")
    );
    
    const querySnapshot = await getDocs(badgesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching qualification badges:", error);
    throw error;
  }
};

/**
 * Update badge priorities
 * @param {Array} badgeOrder - Array of badge IDs in the desired order
 * @returns {Promise<void>}
 */
export const updateBadgePriorities = async (badgeOrder) => {
  try {
    // Create batch updates for all badges
    const updatePromises = badgeOrder.map((badgeId, index) => {
      const badgeRef = doc(db, COLLECTION_NAME, badgeId);
      return updateDoc(badgeRef, {
        priority: index + 1, // 1-based indexing for priority
        updatedAt: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating badge priorities:", error);
    throw error;
  }
};