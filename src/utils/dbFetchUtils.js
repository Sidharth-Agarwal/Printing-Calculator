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