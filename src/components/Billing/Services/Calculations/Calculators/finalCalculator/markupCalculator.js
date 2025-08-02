import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../../firebaseConfig';
import { fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';
import { calculatePercentage } from '../../../../../../utils/calculationValidator';

/**
 * Calculates markup amount based on the subtotal cost
 * @param {number} subtotal - The subtotal amount (baseWithMisc + wastage + overhead)
 * @param {string} markupType - The markup type (e.g. "MARKUP WED INDIA", "MARKUP TIMELESS")
 * @returns {Promise<Object>} - Markup calculation details
 */
export const calculateMarkup = async (subtotal, markupType = "MARKUP TIMELESS") => {
  try {
    // Format the markup type if it doesn't start with "MARKUP"
    const formattedMarkupType = markupType.startsWith("MARKUP") 
      ? markupType 
      : `MARKUP ${markupType}`;
    
    // Fetch markup percentage from the database
    const markupOverhead = await fetchOverheadValue(formattedMarkupType);
    
    // If not found, try to fetch a default markup
    if (!markupOverhead) {
      console.warn(`Markup type "${formattedMarkupType}" not found, trying default "MARKUP TIMELESS"`);
      const defaultMarkup = await fetchOverheadValue("MARKUP TIMELESS");
      
      // If even the default markup is not found, use a hardcoded value
      if (!defaultMarkup) {
        // CRITICAL FIX: Use precision calculation for default markup
        const defaultMarkupAmount = calculatePercentage(subtotal.toString(), 50);
        
        return {
          markupType: "MARKUP TIMELESS",
          markupPercentage: 50, // Default percentage
          markupAmount: parseFloat(defaultMarkupAmount).toFixed(2),
          success: false,
          error: "Default markup not found, using 50%"
        };
      }
      
      // Use the default markup
      const defaultPercentage = parseFloat(defaultMarkup.percentage) || 50;
      const defaultMarkupAmount = calculatePercentage(subtotal.toString(), defaultPercentage);
      
      return {
        markupType: "MARKUP TIMELESS",
        markupPercentage: defaultPercentage,
        markupAmount: parseFloat(defaultMarkupAmount).toFixed(2),
        success: true
      };
    }
    
    // Use the found markup
    const markupPercentage = parseFloat(markupOverhead.percentage) || 0;
    
    // CRITICAL FIX: Use precision calculation for markup amount
    const markupAmount = calculatePercentage(subtotal.toString(), markupPercentage);
    
    console.log(`Markup calculation: Subtotal=${subtotal}, Type=${formattedMarkupType}, Rate=${markupPercentage}%, Amount=${markupAmount}`);
    
    return {
      markupType: formattedMarkupType,
      markupPercentage,
      markupAmount: parseFloat(markupAmount).toFixed(2),
      success: true
    };
  } catch (error) {
    console.error("Error calculating markup:", error);
    
    // CRITICAL FIX: Use precision calculation for fallback markup
    const fallbackMarkupAmount = calculatePercentage(subtotal.toString(), 50);
    
    // Return default values in case of error
    return {
      markupType: "MARKUP TIMELESS",
      markupPercentage: 50,
      markupAmount: parseFloat(fallbackMarkupAmount).toFixed(2),
      success: false,
      error: "Failed to calculate markup"
    };
  }
};

/**
 * Get a list of available markup types from the database
 * @returns {Promise<Array>} - Array of markup type objects
 */
export const getAvailableMarkupTypes = async () => {
  try {
    // Implement a fetch for all markup types in your database
    // This is a placeholder implementation
    // You'll need to modify this to match your actual database fetching logic
    
    // Example implementation if using Firestore
    const overheadsCollection = collection(db, "overheads");
    const q = query(overheadsCollection, where("name", ">=", "MARKUP "), where("name", "<=", "MARKUP" + "\uf8ff"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error) {
    console.error("Error fetching markup types:", error);
    return [];
  }
};