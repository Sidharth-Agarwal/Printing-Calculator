import { fetchPaperDetails } from '../../../../../utils/fetchDataUtils';
import { fetchStandardRate, fetchOverheadValue } from '../../../../../utils/fetchDataUtils';

/**
 * Helper function to calculate maximum cards per sheet
 * @param {Object} dieSize - Die dimensions (length and breadth in cm)
 * @param {Object} paperSize - Paper dimensions (length and breadth in cm)
 * @returns {Number} - Maximum number of cards per sheet
 */
const calculateMaxCardsPerSheet = (dieSize, paperSize) => {
  const { length: dieLength, breadth: dieBreadth } = dieSize;
  const { length: paperLength, breadth: paperBreadth } = paperSize;

  // Calculate cards in length-wise orientation
  const cardsByLength =
    Math.floor(paperLength / dieLength) * Math.floor(paperBreadth / dieBreadth);
  
  // Calculate cards in breadth-wise orientation
  const cardsByBreadth =
    Math.floor(paperLength / dieBreadth) * Math.floor(paperBreadth / dieLength);

  // Return the maximum of the two orientations
  return Math.max(cardsByLength, cardsByBreadth);
};

/**
 * Calculates paper and cutting costs
 * @param {Object} state - Form state containing order and paper details
 * @returns {Promise<Object>} - Paper and cutting cost calculations
 */
export const calculatePaperAndCuttingCosts = async (state) => {
  try {
    const { orderAndPaper } = state;
    const paperName = orderAndPaper.paperName;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    
    // Validate required inputs
    if (!paperName || !totalCards || !orderAndPaper.dieSize.length || !orderAndPaper.dieSize.breadth) {
      return { 
        error: "Missing required information for paper calculations",
        paperCostPerCard: "0.00",
        gilCutCostPerCard: "0.00",
        paperAndCuttingCostPerCard: "0.00"
      };
    }

    // 1. Fetch paper details from database
    const paperDetails = await fetchPaperDetails(paperName);
    if (!paperDetails) {
      return { 
        error: `Paper details not found for: ${paperName}`,
        paperCostPerCard: "0.00",
        gilCutCostPerCard: "0.00",
        paperAndCuttingCostPerCard: "0.00"
      };
    }

    // 2. Fetch GIL CUT rate from standard rates
    const gilCutRate = await fetchStandardRate('GIL CUT', 'PER SHEET');
    const gilCutCostPerSheet = gilCutRate ? parseFloat(gilCutRate.finalRate) : 0.25; // Default if not found

    // 3. Fetch margin value from overheads
    const marginValue = await fetchOverheadValue('MARGIN');
    const margin = marginValue ? parseFloat(marginValue.value) : 2; // Default margin if not found

    // 4. Convert die size from inches to cm and add margin
    const dieSize = {
      length: (parseFloat(orderAndPaper.dieSize.length) * 2.54) + margin,
      breadth: (parseFloat(orderAndPaper.dieSize.breadth) * 2.54) + margin,
    };

    // 5. Get paper dimensions (already in cm)
    const paperSize = {
      length: parseFloat(paperDetails.length),
      breadth: parseFloat(paperDetails.breadth),
    };

    // 6. Calculate maximum cards per sheet
    const maxCardsPerSheet = calculateMaxCardsPerSheet(dieSize, paperSize);
    
    // 7. Calculate total sheets required
    const totalSheetsRequired = Math.ceil(totalCards / maxCardsPerSheet);

    // 8. Calculate costs
    const paperCost = totalSheetsRequired * parseFloat(paperDetails.finalRate);
    const gilCutCost = gilCutCostPerSheet * totalSheetsRequired;
    
    // 9. Calculate per card costs
    const paperCostPerCard = paperCost / totalCards;
    const gilCutCostPerCard = gilCutCost / totalCards;
    const paperAndCuttingCostPerCard = paperCostPerCard + gilCutCostPerCard;

    // 10. Return the final calculations
    return {
      paperCostPerCard: paperCostPerCard.toFixed(2),
      gilCutCostPerCard: gilCutCostPerCard.toFixed(2),
      paperAndCuttingCostPerCard: paperAndCuttingCostPerCard.toFixed(2),
      // Additional info for debugging or display
      maxCardsPerSheet,
      totalSheetsRequired,
      paperRate: parseFloat(paperDetails.finalRate).toFixed(2),
      gilCutRate: gilCutCostPerSheet.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating paper and cutting costs:", error);
    return { 
      error: "Error calculating paper and cutting costs",
      paperCostPerCard: "0.00",
      gilCutCostPerCard: "0.00",
      paperAndCuttingCostPerCard: "0.00"
    };
  }
};