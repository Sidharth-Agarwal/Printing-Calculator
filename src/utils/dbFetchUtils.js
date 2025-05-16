import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Fetches a standard rate from the database
 * @param {string} group - The group (e.g. "GIL CUT", "LP MR")
 * @param {string} type - The type (e.g. "PER SHEET", "SIMPLE")
 * @returns {Promise<Object|null>} - The standard rate object or null if not found
 */
export const fetchStandardRate = async (group, type) => {
  try {
    const ratesCollection = collection(db, "standard_rates");
    const concatenatedValue = `${group} ${type}`.trim();
    
    // Try to fetch by concatenated value first (most reliable)
    let q = query(ratesCollection, where("concatenate", "==", concatenatedValue));
    let querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    // If not found, try with separate group and type
    q = query(
      ratesCollection, 
      where("group", "==", group), 
      where("type", "==", type)
    );
    querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    console.warn(`Standard rate not found for group: ${group}, type: ${type}`);
    return null;
  } catch (error) {
    console.error("Error fetching standard rate:", error);
    return null;
  }
};

/**
 * Fetches an overhead value from the database
 * @param {string} name - The overhead name (e.g. "MARGIN", "WASTAGE")
 * @returns {Promise<Object|null>} - The overhead object or null if not found
 */
export const fetchOverheadValue = async (name) => {
  try {
    const overheadsCollection = collection(db, "overheads");
    const q = query(overheadsCollection, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    console.warn(`Overhead not found for name: ${name}`);
    return null;
  } catch (error) {
    console.error("Error fetching overhead:", error);
    return null;
  }
};

/**
 * Fetches a markup value from the database
 * @param {string} type - The markup type (e.g. "STANDARD", "TIMELESS")
 * @returns {Promise<Object|null>} - The markup object or null if not found
 */
export const fetchMarkupValue = async (type = "STANDARD") => {
  try {
    const ratesCollection = collection(db, "standard_rates");
    const q = query(
      ratesCollection, 
      where("group", "==", "MARKUP"),
      where("type", "==", type)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    // If specific type not found, fall back to any markup
    const fallbackQuery = query(ratesCollection, where("group", "==", "MARKUP"));
    const fallbackSnapshot = await getDocs(fallbackQuery);
    
    if (!fallbackSnapshot.empty) {
      return { id: fallbackSnapshot.docs[0].id, ...fallbackSnapshot.docs[0].data() };
    }
    
    console.warn(`Markup not found for type: ${type}`);
    return null;
  } catch (error) {
    console.error("Error fetching markup:", error);
    return null;
  }
};

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Fetches a GST/HSN value from the database
 * @param {string} group - The group (e.g. "GST", "HSN")
 * @param {string} type - The type (e.g. "PRINTED MATERIAL", "BOOK")
 * @returns {Promise<Object|null>} - The GST/HSN object or null if not found
 */
export const fetchGstHsn = async (group, type) => {
  try {
    const gstHsnCollection = collection(db, "gst_and_hsn");
    const concatenatedValue = `${group} ${type}`.trim();
    
    // Try to fetch by concatenated value first (most reliable)
    let q = query(gstHsnCollection, where("concatenate", "==", concatenatedValue));
    let querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    // If not found, try with separate group and type
    q = query(
      gstHsnCollection, 
      where("group", "==", group), 
      where("type", "==", type)
    );
    querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    console.warn(`GST/HSN record not found for group: ${group}, type: ${type}`);
    return null;
  } catch (error) {
    console.error("Error fetching GST/HSN record:", error);
    return null;
  }
};

/**
 * Fetches all GST values from the database
 * @returns {Promise<Array>} - Array of GST objects
 */
export const fetchAllGstHsn = async () => {
  try {
    const gstHsnCollection = collection(db, "gst_and_hsn");
    const querySnapshot = await getDocs(gstHsnCollection);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all GST/HSN records:", error);
    return [];
  }
};

/**
 * Fetches GST/HSN records by group
 * @param {string} group - The group to filter by (e.g. "GST", "HSN")
 * @returns {Promise<Array>} - Array of matching GST/HSN objects
 */
export const fetchGstHsnByGroup = async (group) => {
  try {
    const gstHsnCollection = collection(db, "gst_and_hsn");
    const q = query(gstHsnCollection, where("group", "==", group));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching GST/HSN records for group ${group}:`, error);
    return [];
  }
};

/**
 * Fetches a margin value from standard_rates based on job type
 * @param {string} jobType - The job type (e.g. "CARD", "NOTEBOOK")
 * @returns {Promise<Object|null>} - The margin object or null if not found
 */
export const fetchMarginByJobType = async (jobType) => {
  try {
    // Convert jobType to uppercase for case-insensitive comparison
    const jobTypeUpper = jobType.toUpperCase();
    
    const ratesCollection = collection(db, "standard_rates");
    // Try first with the exact concatenated value
    const concatenatedValue = `MARGIN ${jobTypeUpper}`;
    
    // Try to fetch by concatenated value first (most reliable)
    let q = query(ratesCollection, where("concatenate", "==", concatenatedValue));
    let querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    // If not found, try with separate group and type
    q = query(
      ratesCollection, 
      where("group", "==", "MARGIN"), 
      where("type", "==", jobTypeUpper)
    );
    querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    // If still not found and jobType contains spaces (like "Biz Card"), 
    // try converting to a single word by removing spaces
    if (jobType.includes(' ')) {
      const jobTypeNoSpace = jobTypeUpper.replace(/\s+/g, '');
      
      // Try concatenated value without spaces
      q = query(ratesCollection, where("concatenate", "==", `MARGIN ${jobTypeNoSpace}`));
      querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      }
      
      // Try type without spaces
      q = query(
        ratesCollection, 
        where("group", "==", "MARGIN"), 
        where("type", "==", jobTypeNoSpace)
      );
      querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      }
    }
    
    console.warn(`Margin not found for job type: ${jobType}`);
    return null;
  } catch (error) {
    console.error("Error fetching margin by job type:", error);
    return null;
  }
};