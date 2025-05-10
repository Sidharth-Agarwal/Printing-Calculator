import { fetchStandardRate } from "../../../../../../utils/dbFetchUtils";

/**
 * Calculates pre die cutting costs based on form state
 * @param {Object} state - Form state containing pre-DC details
 * @returns {Promise<Object>} - Pre die cutting cost calculations
 */
export const calculatePreDieCuttingCosts = async (state) => {
  try {
    const { preDieCutting, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);

    // Check if pre-DC is used
    if (!preDieCutting.isPreDieCuttingUsed) {
      return { 
        preDieCuttingCostPerCard: "0.00",
        preDieCuttingMRCostPerCard: "0.00",
        preDieCuttingImpressionCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !preDieCutting.predcMR) {
      return { 
        error: "Missing required information for pre die cutting calculations",
        preDieCuttingCostPerCard: "0.00",
        preDieCuttingMRCostPerCard: "0.00",
        preDieCuttingImpressionCostPerCard: "0.00"
      };
    }

    // 1. Fetch MR cost from standard rates using the concatenated value
    const mrType = preDieCutting.predcMR;
    const mrConcatenated = preDieCutting.predcMRConcatenated || `PDC MR ${mrType.toUpperCase()}`;
    
    const mrDetails = await fetchStandardRate("PDC MR", mrType);
    
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
    const impressionDetails = await fetchStandardRate("IMPRESSION", "PDC");
    const impressionCostPerUnit = impressionDetails ? 
      parseFloat(impressionDetails.finalRate || 0) : 
      0.25; // Default to 0.25 if not found

    // 3. Calculate costs per card
    const mrCostPerCard = mrRate / totalCards;
    const impressionCostPerCard = impressionCostPerUnit; // Already per card
    
    // 4. Calculate total pre die cutting cost per card
    const preDieCuttingCostPerCard = mrCostPerCard + impressionCostPerCard;
    
    return {
      preDieCuttingCostPerCard: preDieCuttingCostPerCard.toFixed(2),
      preDieCuttingMRCostPerCard: mrCostPerCard.toFixed(2),
      preDieCuttingImpressionCostPerCard: impressionCostPerCard.toFixed(2),
      // Include additional info for debugging
      mrRate: mrRate.toFixed(2),
      mrConcatenated: mrConcatenated,
      impressionRate: impressionCostPerUnit.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating pre die cutting costs:", error);
    return { 
      error: "Error calculating pre die cutting costs",
      preDieCuttingCostPerCard: "0.00",
      preDieCuttingMRCostPerCard: "0.00",
      preDieCuttingImpressionCostPerCard: "0.00"
    };
  }
};