import { fetchOverheadValue } from "../../../../../../utils/dbFetchUtils";

/**
 * Calculates miscellaneous costs based on form state
 * @param {Object} state - Form state containing Misc details
 * @returns {Promise<Object>} - Misc cost calculations
 */
export const calculateMiscCosts = async (state) => {
  try {
    const { misc } = state;
    
    // Check if Misc is used
    if (!misc?.isMiscUsed) {
      return { miscCostPerCard: "0.00" };
    }

    // Fetch Misc value from overheads
    const miscOverhead = await fetchOverheadValue("MISCELLANEOUS");
    
    // Use the value from DB or default if not found
    const miscCostPerCard = miscOverhead && miscOverhead.value
      ? parseFloat(miscOverhead.value)
      : 5.0; // Default to 5.0 if not found
    
    console.log("Misc calculation:", {
      isMiscUsed: misc.isMiscUsed,
      miscCostPerCard
    });
    
    return {
      miscCostPerCard: miscCostPerCard.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating Misc costs:", error);
    return { 
      error: "Error calculating Misc costs",
      miscCostPerCard: "0.00"
    };
  }
};