import { fetchMaterialByName } from '../firebase/materials';
import { fetchRateByTypeAndGroup } from '../firebase/standardRates';
import { MARGIN_ADDITION } from '../../constants/calculationConstants';

/**
 * Calculate Embossing (EMB) costs
 * @param {Object} embDetails - EMB details from form state
 * @param {Object} orderDetails - Order details from form state
 * @returns {Object} - Calculated EMB costs
 */
export const calculateEMBCosts = async (embDetails, orderDetails) => {
  try {
    const { isEMBUsed, plateDimensions, plateTypeMale, plateTypeFemale, embMR } = embDetails;
    const totalCards = parseInt(orderDetails.quantity, 10);

    if (!isEMBUsed) {
      return { 
        embCostPerCard: "0.00",
        embPlateCostPerCard: "0.00",
        embMRCostPerCard: "0.00" 
      };
    }

    // Validate required fields
    if (!plateDimensions || !plateTypeMale || !plateTypeFemale || !embMR) {
      console.warn("Missing required EMB details", embDetails);
      return { 
        embCostPerCard: "0.00",
        embPlateCostPerCard: "0.00",
        embMRCostPerCard: "0.00" 
      };
    }

    // Calculate plate area with margin
    const plateArea = (parseFloat(plateDimensions.length || 0) + MARGIN_ADDITION) *
                      (parseFloat(plateDimensions.breadth || 0) + MARGIN_ADDITION);

    // Get male plate material cost
    const malePlateMaterialDetails = await fetchMaterialByName(plateTypeMale);
    let malePlateCost = 0;
    
    if (malePlateMaterialDetails) {
      malePlateCost = plateArea * parseFloat(malePlateMaterialDetails.finalCostPerUnit || 0);
    } else {
      console.warn(`Material details not found for male plate type: ${plateTypeMale}`);
    }

    // Get female plate material cost
    const femalePlateMaterialDetails = await fetchMaterialByName(plateTypeFemale);
    let femalePlateCost = 0;
    
    if (femalePlateMaterialDetails) {
      femalePlateCost = plateArea * parseFloat(femalePlateMaterialDetails.finalCostPerUnit || 0);
    } else {
      console.warn(`Material details not found for female plate type: ${plateTypeFemale}`);
    }

    // Calculate total plate cost
    const totalPlateCost = malePlateCost + femalePlateCost;

    // Get MR cost
    const mrDetails = await fetchRateByTypeAndGroup(embMR, "MR");
    let mrCost = 0;
    
    if (mrDetails) {
      mrCost = parseFloat(mrDetails.finalRate || 0);
    } else {
      console.warn(`MR details not found for EMB MR type: ${embMR}`);
    }

    // Calculate total embossing cost
    const totalEMBCost = totalPlateCost + mrCost;
    
    // Calculate per card costs
    const embCostPerCard = totalEMBCost / totalCards;
    const embPlateCostPerCard = totalPlateCost / totalCards;
    const embMRCostPerCard = mrCost / totalCards;

    return {
      embCostPerCard: embCostPerCard.toFixed(2),
      embPlateCostPerCard: embPlateCostPerCard.toFixed(2),
      embMRCostPerCard: embMRCostPerCard.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating EMB costs:", error);
    return { error: "Failed to calculate embossing costs" };
  }
};