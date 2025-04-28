import { fetchStandardRate } from "../../../../../../utils/dbFetchUtils";

/**
 * Calculates DST paste costs based on form state
 * @param {Object} state - Form state containing DST paste details
 * @returns {Promise<Object>} - DST paste cost calculations
 */
export const calculateDstPasteCosts = async (state) => {
  try {
    const { dstPaste, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);

    // Check if DST paste is used
    if (!dstPaste || !dstPaste.isDstPasteUsed) {
      return { 
        dstPasteCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !dstPaste.dstType) {
      return { 
        error: "Missing required information for DST paste calculations",
        dstPasteCostPerCard: "0.00"
      };
    }

    // Fetch DST type rate from standard rates
    // The rate is already per card according to the standard rates table
    const dstTypeDetails = await fetchStandardRate("DST", dstPaste.dstType);
    
    if (!dstTypeDetails) {
      return {
        error: `DST rate details not found for type: ${dstPaste.dstType}`,
        dstPasteCostPerCard: "0.00"
      };
    }

    // Get the rate per card from the standard rates
    const dstCostPerCard = parseFloat(dstTypeDetails.finalRate || 0);
    
    // Return the cost per card (already in per card format from the DB)
    return {
      dstPasteCostPerCard: dstCostPerCard.toFixed(2),
      // Include additional info for debugging
      dstType: dstPaste.dstType,
      dstRate: dstCostPerCard.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating DST paste costs:", error);
    return { 
      error: "Error calculating DST paste costs",
      dstPasteCostPerCard: "0.00"
    };
  }
};