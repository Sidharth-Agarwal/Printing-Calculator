import { fetchStandardRate } from "../../../../../../utils/dbFetchUtils";

/**
 * Calculates die cutting costs based on form state
 * @param {Object} state - Form state containing die cutting details
 * @returns {Promise<Object>} - Die cutting cost calculations
 */
export const calculateDieCuttingCosts = async (state) => {
  try {
    const { dieCutting, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);

    // Check if die cutting is used
    if (!dieCutting.isDieCuttingUsed) {
      return { 
        dieCuttingCostPerCard: "0.00",
        dieCuttingMRCostPerCard: "0.00",
        dieCuttingImpressionCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !dieCutting.dcMR) {
      return { 
        error: "Missing required information for die cutting calculations",
        dieCuttingCostPerCard: "0.00",
        dieCuttingMRCostPerCard: "0.00",
        dieCuttingImpressionCostPerCard: "0.00"
      };
    }

    // 1. Fetch MR cost from standard rates using the concatenated value
    const mrType = dieCutting.dcMR;
    const mrConcatenated = dieCutting.dcMRConcatenated || `DC MR ${mrType.toUpperCase()}`;
    
    const mrDetails = await fetchStandardRate("DC MR", mrType);
    
    // MR cost is the finalRate from the database, or fallback to defaults
    let mrRate = 0;
    if (mrDetails && mrDetails.finalRate) {
      mrRate = parseFloat(mrDetails.finalRate);
    } else {
      // Fallback based on type
      if (mrType.toUpperCase() === "SIMPLE") mrRate = 50;
      else if (mrType.toUpperCase() === "COMPLEX") mrRate = 100;
      else if (mrType.toUpperCase() === "SUPER COMPLEX") mrRate = 350;
      console.warn(`Using fallback MR cost for type ${mrType}: ${mrRate}`);
    }
    
    // 2. Fetch impression cost from standard rates
    const impressionDetails = await fetchStandardRate("IMPRESSION", "DC");
    const impressionCostPerUnit = impressionDetails ? 
      parseFloat(impressionDetails.finalRate || 0) : 
      0.25; // Default to 0.25 if not found

    // 3. Calculate costs per card
    const mrCostPerCard = mrRate / totalCards;
    const impressionCostPerCard = impressionCostPerUnit; // Already per card
    
    // 4. Calculate total die cutting cost per card
    const dieCuttingCostPerCard = mrCostPerCard + impressionCostPerCard;
    
    return {
      dieCuttingCostPerCard: dieCuttingCostPerCard.toFixed(2),
      dieCuttingMRCostPerCard: mrCostPerCard.toFixed(2),
      dieCuttingImpressionCostPerCard: impressionCostPerCard.toFixed(2),
      // Include additional info for debugging
      mrRate: mrRate.toFixed(2),
      mrConcatenated: mrConcatenated,
      impressionRate: impressionCostPerUnit.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating die cutting costs:", error);
    return { 
      error: "Error calculating die cutting costs",
      dieCuttingCostPerCard: "0.00",
      dieCuttingMRCostPerCard: "0.00",
      dieCuttingImpressionCostPerCard: "0.00"
    };
  }
};