import { fetchStandardRate } from "../../../../../../utils/dbFetchUtils";

/**
 * Calculates post die cutting costs based on form state
 * @param {Object} state - Form state containing post-DC details
 * @returns {Promise<Object>} - Post die cutting cost calculations
 */
export const calculatePostDCCosts = async (state) => {
  try {
    const { postDC, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);

    // Check if post-DC is used
    if (!postDC.isPostDCUsed) {
      return { 
        postDCCostPerCard: "0.00",
        postDCMRCostPerCard: "0.00",
        postDCImpressionCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !postDC.pdcMR) {
      return { 
        error: "Missing required information for post die cutting calculations",
        postDCCostPerCard: "0.00",
        postDCMRCostPerCard: "0.00",
        postDCImpressionCostPerCard: "0.00"
      };
    }

    // 1. Fetch MR cost from standard rates using the concatenated value
    const mrType = postDC.pdcMR;
    const mrConcatenated = postDC.pdcMRConcatenated || `PDC MR ${mrType.toUpperCase()}`;
    
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
    
    // 4. Calculate total post die cutting cost per card
    const postDCCostPerCard = mrCostPerCard + impressionCostPerCard;
    
    return {
      postDCCostPerCard: postDCCostPerCard.toFixed(2),
      postDCMRCostPerCard: mrCostPerCard.toFixed(2),
      postDCImpressionCostPerCard: impressionCostPerCard.toFixed(2),
      // Include additional info for debugging
      mrRate: mrRate.toFixed(2),
      mrConcatenated: mrConcatenated,
      impressionRate: impressionCostPerUnit.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating post die cutting costs:", error);
    return { 
      error: "Error calculating post die cutting costs",
      postDCCostPerCard: "0.00",
      postDCMRCostPerCard: "0.00",
      postDCImpressionCostPerCard: "0.00"
    };
  }
};