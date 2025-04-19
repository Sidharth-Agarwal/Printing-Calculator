import { fetchStandardRate } from '../../../../../../utils/dbFetchUtils';

/**
 * Calculates screen printing costs based on form state
 * @param {Object} state - Form state containing screen print details
 * @returns {Promise<Object>} - Screen printing cost calculations
 */
export const calculateScreenPrintCosts = async (state) => {
  try {
    const { screenPrintDetails, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);

    // Check if screen printing is used
    if (!screenPrintDetails?.isScreenPrintUsed) {
      return { 
        screenPrintCostPerCard: "0.00",
        screenPrintPerPieceCost: "0.00",
        screenPrintBaseCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards) {
      return { 
        error: "Missing quantity information for screen printing calculations",
        screenPrintCostPerCard: "0.00",
        screenPrintPerPieceCost: "0.00",
        screenPrintBaseCostPerCard: "0.00"
      };
    }

    // 1. Fetch SCREEN PRINT PER PIECE cost from standard rates
    const screenPrintPerPieceDetails = await fetchStandardRate("SCREEN PRINT", "PER PIECE");
    const screenPrintPerPieceCost = screenPrintPerPieceDetails 
      ? parseFloat(screenPrintPerPieceDetails.finalRate || 0) 
      : 10; // Default to 10 if not found
    
    // 2. Fetch SCREEN PRINT COST from standard rates
    const screenPrintCostDetails = await fetchStandardRate("SCREEN PRINT", "COST");
    const screenPrintCost = screenPrintCostDetails 
      ? parseFloat(screenPrintCostDetails.finalRate || 0) 
      : 100; // Default to 100 if not found
    
    // 3. Calculate SCREEN PRINT COST per unit
    const screenPrintBaseCostPerCard = screenPrintCost / totalCards;
    
    // 4. Calculate total screen printing cost per card
    const screenPrintCostPerCard = screenPrintPerPieceCost + screenPrintBaseCostPerCard;
    
    // Return all calculations
    return {
      screenPrintCostPerCard: screenPrintCostPerCard.toFixed(2),
      screenPrintPerPieceCost: screenPrintPerPieceCost.toFixed(2),
      screenPrintBaseCostPerCard: screenPrintBaseCostPerCard.toFixed(2),
      // Additional info for debugging
      totalScreenPrintCost: screenPrintCost.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating screen printing costs:", error);
    return { 
      error: "Error calculating screen printing costs",
      screenPrintCostPerCard: "0.00",
      screenPrintPerPieceCost: "0.00",
      screenPrintBaseCostPerCard: "0.00"
    };
  }
};