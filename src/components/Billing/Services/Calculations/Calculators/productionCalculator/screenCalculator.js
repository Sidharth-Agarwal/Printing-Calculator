import { fetchStandardRate } from '../../../../../../utils/dbFetchUtils';

/**
 * Calculates screen printing costs based on form state
 * @param {Object} state - Form state containing screen print details
 * @returns {Promise<Object>} - Screen printing cost calculations
 */
export const calculateScreenPrintCosts = async (state) => {
  try {
    // FIX: Check both possible structures to ensure backward compatibility
    const screenPrintInfo = state.screenPrintDetails || state.screenPrint;
    const { orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);

    // Check if screen printing is used
    // FIX: Check both possible flag locations
    const isScreenPrintUsed = screenPrintInfo?.isScreenPrintUsed || state.screenPrint?.isScreenPrintUsed;
    
    if (!isScreenPrintUsed) {
      return { 
        screenPrintCostPerCard: "0.00",
        screenPrintPerPieceCost: "0.00",
        screenPrintBaseCostPerCard: "0.00",
        screenPrintMRCostPerCard: "0.00"
      };
    }

    // Get the number of colors (default to 1 if not specified)
    const noOfColors = screenPrintInfo?.noOfColors || 1;
    
    // Get the MR type (default to "SIMPLE" if not specified)
    const mrType = screenPrintInfo?.screenMR || "SIMPLE";

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
    
    // 4. NEW: Fetch MR cost from standard rates based on the MR type
    const mrDetails = await fetchStandardRate("SCREEN MR", mrType);
    let mrCost = 0;
    
    if (mrDetails) {
      mrCost = parseFloat(mrDetails.finalRate || 0);
    } else {
      console.warn(`No MR details found for SCREEN MR type: ${mrType}`);
      // Fallback values based on complexity (similar to other calculators)
      if (mrType === "SIMPLE") mrCost = 100;
      else if (mrType === "COMPLEX") mrCost = 200;
      else if (mrType === "SUPER COMPLEX") mrCost = 300;
    }
    
    // 5. Calculate MR cost per card (dividing by quantity)
    const screenPrintMRCostPerCard = mrCost / totalCards;
    
    // 6. Sum all components first
    const totalComponentsCostPerCard = screenPrintPerPieceCost + screenPrintBaseCostPerCard + screenPrintMRCostPerCard;
    
    // 7. Multiply the total by number of colors to get final cost per card
    const finalScreenPrintCostPerCard = totalComponentsCostPerCard * noOfColors;
    
    // Log calculation for debugging
    console.log("Screen printing calculation:", {
      isScreenPrintUsed,
      noOfColors,
      mrType,
      screenPrintPerPieceCost,
      screenPrintBaseCostPerCard,
      screenPrintMRCostPerCard,
      totalComponentsCostPerCard,
      finalScreenPrintCostPerCard,
      totalCards
    });
    
    // Return all calculations with individual components multiplied by noOfColors
    return {
      screenPrintCostPerCard: finalScreenPrintCostPerCard.toFixed(2),
      screenPrintPerPieceCost: (screenPrintPerPieceCost * noOfColors).toFixed(2),
      screenPrintBaseCostPerCard: (screenPrintBaseCostPerCard * noOfColors).toFixed(2),
      screenPrintMRCostPerCard: (screenPrintMRCostPerCard * noOfColors).toFixed(2),
      // Additional info for debugging
      totalScreenPrintCost: (screenPrintCost * noOfColors).toFixed(2),
      totalMRCost: (mrCost * noOfColors).toFixed(2),
      noOfColors: noOfColors
    };
  } catch (error) {
    console.error("Error calculating screen printing costs:", error);
    return { 
      error: "Error calculating screen printing costs",
      screenPrintCostPerCard: "0.00",
      screenPrintPerPieceCost: "0.00",
      screenPrintBaseCostPerCard: "0.00",
      screenPrintMRCostPerCard: "0.00"
    };
  }
};