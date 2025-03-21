import { fetchPaperByName } from '../firebase/papers';
import { INCH_TO_CM, MARGIN_ADDITION, CUTTING_COST_PER_CARD, GIL_CUT_COST_PER_PAPER } from '../../constants/calculationConstants';
import { calculateMaxCardsPerSheet } from '../../utils/calculationHelpers';

// Calculate paper and cutting costs
export const calculatePaperAndCuttingCosts = async (orderAndPaper) => {
  try {
    const { paperName, dieSize, quantity } = orderAndPaper;
    
    // Fetch paper details from Firestore
    const paperDetails = await fetchPaperByName(paperName);
    
    if (!paperDetails) {
      return { error: `Paper details not found for: ${paperName}` };
    }

    // Convert inches to cm and add margin
    const dieSizeCm = {
      length: (parseFloat(dieSize.length) * INCH_TO_CM) + MARGIN_ADDITION,
      breadth: (parseFloat(dieSize.breadth) * INCH_TO_CM) + MARGIN_ADDITION,
    };

    const paperSizeCm = {
      length: parseFloat(paperDetails.length),
      breadth: parseFloat(paperDetails.breadth),
    };

    // Calculate maximum cards per sheet
    const maxCardsPerSheet = calculateMaxCardsPerSheet(dieSizeCm, paperSizeCm);
    const totalCards = parseInt(quantity, 10);
    
    if (maxCardsPerSheet === 0) {
      return { error: "Die size is too large for the selected paper" };
    }
    
    // Calculate papers required
    const totalPapersRequired = Math.ceil(totalCards / maxCardsPerSheet);

    // Calculate costs
    const gilCutCost = GIL_CUT_COST_PER_PAPER * totalPapersRequired;
    const paperCost = totalPapersRequired * parseFloat(paperDetails.finalRate);
    const cuttingCost = totalCards * CUTTING_COST_PER_CARD;

    // Calculate per card costs
    const paperCostPerCard = paperCost / totalCards;
    const cuttingCostPerCard = cuttingCost / totalCards;
    const gilCutCostPerCard = gilCutCost / totalCards;
    const paperAndCuttingCostPerCard = paperCostPerCard + cuttingCostPerCard + gilCutCostPerCard;

    return {
      paperCostPerCard: paperCostPerCard.toFixed(2),
      cuttingCostPerCard: cuttingCostPerCard.toFixed(2),
      gilCutCostPerCard: gilCutCostPerCard.toFixed(2),
      paperAndCuttingCostPerCard: paperAndCuttingCostPerCard.toFixed(2),
    };
  } catch (error) {
    console.error("Error calculating paper and cutting costs:", error);
    return { error: "Failed to calculate paper and cutting costs" };
  }
};