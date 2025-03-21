import { fetchPapersByDimensions } from '../firebase/papers';
import { INCH_TO_CM, MARGIN_ADDITION } from '../../constants/calculationConstants';

/**
 * Calculate Digital Printing costs
 * @param {Object} digiDetails - Digital printing details from form state
 * @param {Object} orderDetails - Order details from form state
 * @returns {Object} - Calculated digital printing costs
 */
export const calculateDigiCosts = async (digiDetails, orderDetails) => {
  try {
    const { isDigiUsed, digiDie, digiDimensions } = digiDetails;
    const { dieSize, quantity } = orderDetails;
    const totalCards = parseInt(quantity, 10);

    if (!isDigiUsed || !digiDimensions || !digiDimensions.length || !digiDimensions.breadth) {
      return { digiCostPerCard: "0.00" };
    }

    // Convert dimensions from inches to cm
    const dieSizeCm = {
      length: (parseFloat(dieSize.length || 0) * INCH_TO_CM) + MARGIN_ADDITION,
      breadth: (parseFloat(dieSize.breadth || 0) * INCH_TO_CM) + MARGIN_ADDITION,
    };

    const digiDimensionsCm = {
      length: parseFloat(digiDimensions.length || 0) * INCH_TO_CM,
      breadth: parseFloat(digiDimensions.breadth || 0) * INCH_TO_CM,
    };

    // Calculate max cards per sheet for both orientations
    const lengthwiseCards =
      Math.floor(digiDimensionsCm.length / dieSizeCm.length) *
      Math.floor(digiDimensionsCm.breadth / dieSizeCm.breadth);

    const breadthwiseCards =
      Math.floor(digiDimensionsCm.length / dieSizeCm.breadth) *
      Math.floor(digiDimensionsCm.breadth / dieSizeCm.length);

    const maxCardsPerSheet = Math.max(lengthwiseCards, breadthwiseCards);

    if (maxCardsPerSheet === 0) {
      return { 
        error: "Die size is too large for the selected digital paper dimensions",
        digiCostPerCard: "0.00"
      };
    }

    // Calculate papers required
    const totalPapersRequired = Math.ceil(totalCards / maxCardsPerSheet);

    // Find best matching digital paper
    const digitalPapers = await fetchPapersByDimensions(
      digiDimensionsCm.length,
      digiDimensionsCm.breadth,
      "Digital" // Specify digital paper type
    );

    if (!digitalPapers || digitalPapers.length === 0) {
      return { 
        error: `No suitable digital paper found for dimensions: ${digiDimensionsCm.length} x ${digiDimensionsCm.breadth}`,
        digiCostPerCard: "0.00"
      };
    }

    // Use the best matching paper (usually first in the list)
    const paperDetails = digitalPapers[0];
    const paperCost = totalPapersRequired * parseFloat(paperDetails.finalRate);

    // Digital printing cost per card (set price)
    const printingCostPerCard = 20; // ₹20 per card for digital printing
    const printingCost = totalCards * printingCostPerCard;

    // Calculate total digital cost
    const totalDigiCost = paperCost + printingCost;
    const digiCostPerCard = totalDigiCost / totalCards;

    return {
      digiCostPerCard: digiCostPerCard.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating digital printing costs:", error);
    return { error: "Failed to calculate digital printing costs", digiCostPerCard: "0.00" };
  }
};