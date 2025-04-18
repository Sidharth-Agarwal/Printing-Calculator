// src/components/BillingForm/Services/Calculations/calculators/finalCalculators/markupCalculator.js
import { fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';

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
        return {
          markupType: "MARKUP TIMELESS",
          markupPercentage: 50, // Default percentage
          markupAmount: (subtotal * 0.5).toFixed(2),
          success: false,
          error: "Default markup not found, using 50%"
        };
      }
      
      // Use the default markup
      const defaultPercentage = parseFloat(defaultMarkup.percentage) || 50;
      return {
        markupType: "MARKUP TIMELESS",
        markupPercentage: defaultPercentage,
        markupAmount: (subtotal * (defaultPercentage / 100)).toFixed(2),
        success: true
      };
    }
    
    // Use the found markup
    const markupPercentage = parseFloat(markupOverhead.percentage) || 0;
    const markupAmount = subtotal * (markupPercentage / 100);
    
    return {
      markupType: formattedMarkupType,
      markupPercentage,
      markupAmount: markupAmount.toFixed(2),
      success: true
    };
  } catch (error) {
    console.error("Error calculating markup:", error);
    // Return default values in case of error
    return {
      markupType: "MARKUP TIMELESS",
      markupPercentage: 50,
      markupAmount: (subtotal * 0.5).toFixed(2),
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
    const q = query(overheadsCollection, where("name", "like", "MARKUP%"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // For now, return a hardcoded list based on your screenshot
    // return [
    //   { name: "MARKUP WED INDIA", percentage: 100 },
    //   { name: "MARKUP WED B2B", percentage: 100 },
    //   { name: "MARKUP B2B MERCH", percentage: 100 },
    //   { name: "MARKUP ZERO", percentage: 1 },
    //   { name: "MARKUP BIZ CARD", percentage: 100 },
    //   { name: "MARKUP FACTORY MERCH", percentage: 30 },
    //   { name: "MARKUP TIMELESS", percentage: 50 }
    // ];
  } catch (error) {
    console.error("Error fetching markup types:", error);
    return [];
  }
};