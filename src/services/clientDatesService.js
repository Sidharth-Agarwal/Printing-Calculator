import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Service for managing client important dates
 */

// Collection name
const COLLECTION_NAME = "clientImportantDates";

/**
 * Create a new important date for a client
 * @param {string} clientId - The client ID
 * @param {Object} dateData - The date data
 * @param {string} userId - The user creating the date
 * @returns {Promise<string>} - The created document ID
 */
export const createClientDate = async (clientId, dateData, userId) => {
  try {
    if (!clientId || !dateData.title || !dateData.date) {
      throw new Error("Client ID, title, and date are required");
    }

    const docData = {
      clientId: clientId,
      title: dateData.title.trim(),
      description: dateData.description?.trim() || "",
      date: dateData.date instanceof Date ? Timestamp.fromDate(dateData.date) : Timestamp.fromDate(new Date(dateData.date)),
      isRecurring: dateData.isRecurring !== undefined ? dateData.isRecurring : true, // Default to recurring
      createdBy: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating client date:", error);
    throw new Error(`Failed to create important date: ${error.message}`);
  }
};

/**
 * Get all important dates for a specific client
 * @param {string} clientId - The client ID
 * @returns {Promise<Array>} - Array of important dates
 */
export const getClientDates = async (clientId) => {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where("clientId", "==", clientId),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching client dates:", error);
    throw new Error(`Failed to fetch important dates: ${error.message}`);
  }
};

/**
 * Update an important date
 * @param {string} dateId - The date document ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateClientDate = async (dateId, updateData) => {
  try {
    if (!dateId) {
      throw new Error("Date ID is required");
    }

    const updateFields = {
      ...updateData,
      updatedAt: Timestamp.now()
    };

    // Convert date to Timestamp if it's a Date object
    if (updateFields.date instanceof Date) {
      updateFields.date = Timestamp.fromDate(updateFields.date);
    } else if (updateFields.date && typeof updateFields.date === 'string') {
      updateFields.date = Timestamp.fromDate(new Date(updateFields.date));
    }

    const dateRef = doc(db, COLLECTION_NAME, dateId);
    await updateDoc(dateRef, updateFields);
  } catch (error) {
    console.error("Error updating client date:", error);
    throw new Error(`Failed to update important date: ${error.message}`);
  }
};

/**
 * Delete an important date
 * @param {string} dateId - The date document ID
 * @returns {Promise<void>}
 */
export const deleteClientDate = async (dateId) => {
  try {
    if (!dateId) {
      throw new Error("Date ID is required");
    }

    const dateRef = doc(db, COLLECTION_NAME, dateId);
    await deleteDoc(dateRef);
  } catch (error) {
    console.error("Error deleting client date:", error);
    throw new Error(`Failed to delete important date: ${error.message}`);
  }
};

/**
 * Get upcoming important dates across all clients
 * @param {number} daysAhead - Number of days to look ahead (default: 30)
 * @returns {Promise<Array>} - Array of upcoming dates with client info
 */
export const getUpcomingDates = async (daysAhead = 30) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    // Get all dates
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(q);
    const allDates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter for upcoming dates (including recurring dates)
    const upcomingDates = allDates.filter(dateItem => {
      const itemDate = dateItem.date.toDate();
      
      if (dateItem.isRecurring) {
        // For recurring dates, check if the date occurs within the next period
        const thisYearDate = new Date(today.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        const nextYearDate = new Date(today.getFullYear() + 1, itemDate.getMonth(), itemDate.getDate());
        
        return (thisYearDate >= today && thisYearDate <= futureDate) ||
               (nextYearDate >= today && nextYearDate <= futureDate);
      } else {
        // For non-recurring dates, just check if it's in the future within range
        return itemDate >= today && itemDate <= futureDate;
      }
    });

    // Sort by nearest date (considering recurring dates)
    upcomingDates.sort((a, b) => {
      const getNextOccurrence = (dateItem) => {
        const itemDate = dateItem.date.toDate();
        
        if (dateItem.isRecurring) {
          const thisYearDate = new Date(today.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          const nextYearDate = new Date(today.getFullYear() + 1, itemDate.getMonth(), itemDate.getDate());
          
          if (thisYearDate >= today) {
            return thisYearDate;
          } else {
            return nextYearDate;
          }
        } else {
          return itemDate;
        }
      };

      return getNextOccurrence(a) - getNextOccurrence(b);
    });

    return upcomingDates;
  } catch (error) {
    console.error("Error fetching upcoming dates:", error);
    throw new Error(`Failed to fetch upcoming dates: ${error.message}`);
  }
};

/**
 * Get upcoming dates for today only
 * @returns {Promise<Array>} - Array of today's important dates
 */
export const getTodaysDates = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(q);
    const allDates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter for today's dates (including recurring)
    const todaysDates = allDates.filter(dateItem => {
      const itemDate = dateItem.date.toDate();
      
      if (dateItem.isRecurring) {
        const thisYearDate = new Date(today.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        return (
          thisYearDate.getDate() === today.getDate() &&
          thisYearDate.getMonth() === today.getMonth()
        );
      } else {
        return (
          itemDate.getDate() === today.getDate() &&
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      }
    });

    return todaysDates;
  } catch (error) {
    console.error("Error fetching today's dates:", error);
    throw new Error(`Failed to fetch today's dates: ${error.message}`);
  }
};

/**
 * Helper function to format date for display
 * @param {Timestamp|Date} date - The date to format
 * @param {boolean} isRecurring - Whether the date is recurring
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (date, isRecurring = false) => {
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    const today = new Date();
    
    if (isRecurring) {
      const thisYearDate = new Date(today.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const nextYearDate = new Date(today.getFullYear() + 1, dateObj.getMonth(), dateObj.getDate());
      
      const targetDate = thisYearDate >= today ? thisYearDate : nextYearDate;
      
      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays <= 7) return `In ${diffDays} days`;
      
      return targetDate.toLocaleDateString("en-IN");
    } else {
      const diffTime = dateObj - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
      
      return dateObj.toLocaleDateString("en-IN");
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};