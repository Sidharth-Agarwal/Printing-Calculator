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

    // First, check if there's a user-defined value in the state
    let miscCostPerCard;
    
    if (misc.miscCharge && !isNaN(parseFloat(misc.miscCharge))) {
      // Use the user-defined value from the UI
      miscCostPerCard = parseFloat(misc.miscCharge);
      console.log("Using user-defined misc charge:", miscCostPerCard);
    } else {
      // Fetch Misc value from overheads as fallback
      const miscOverhead = await fetchOverheadValue("MISCELLANEOUS");
      
      // Use the value from DB or default if not found
      miscCostPerCard = miscOverhead && miscOverhead.value
        ? parseFloat(miscOverhead.value)
        : 5.0; // Default to 5.0 if not found
      
      console.log("Using DB misc charge:", miscCostPerCard);
    }
    
    console.log("Misc calculation:", {
      isMiscUsed: misc.isMiscUsed,
      userDefined: !!misc.miscCharge,
      miscCostPerCard
    });
    
    return {
      miscCostPerCard: miscCostPerCard.toFixed(2),
      miscChargeSource: misc.miscCharge ? "user" : "database"
    };
  } catch (error) {
    console.error("Error calculating Misc costs:", error);
    return { 
      error: "Error calculating Misc costs",
      miscCostPerCard: "0.00"
    };
  }
};