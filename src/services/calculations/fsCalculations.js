import { fetchMaterialByName } from '../firebase/materials';
import { fetchRateByTypeAndGroup } from '../firebase/standardRates';
import { MARGIN_ADDITION, FS_IMPRESSION_COST } from '../../constants/calculationConstants';

/**
 * Calculate Foil Stamping (FS) costs
 * @param {Object} fsDetails - FS details from form state
 * @param {Object} orderDetails - Order details from form state
 * @returns {Object} - Calculated FS costs
 */
export const calculateFSCosts = async (fsDetails, orderDetails) => {
  try {
    const { isFSUsed, foilDetails } = fsDetails;
    const totalCards = parseInt(orderDetails.quantity, 10);

    if (!isFSUsed || !foilDetails || foilDetails.length === 0) {
      return { 
        fsCostPerCard: "0.00",
        fsBlockCostPerCard: "0.00",
        fsFoilCostPerCard: "0.00",
        fsMRCostPerCard: "0.00",
        fsImpressionCostPerCard: "0.00"
      };
    }

    let totalFSCosting = 0;
    let totalBlockCost = 0;
    let totalFoilCost = 0;
    let totalMRCost = 0;
    let totalImpressionCost = 0;

    // Process each foil
    for (const foil of foilDetails) {
      // Calculate impression cost
      const impressionCost = FS_IMPRESSION_COST * totalCards;
      totalImpressionCost += impressionCost;

      // Validate block dimensions
      const blockDimensions = foil.blockDimension;
      if (!blockDimensions || !blockDimensions.length || !blockDimensions.breadth) {
        console.warn("Invalid block dimensions", foil);
        continue;
      }

      // Calculate block area with margin
      const blockArea = (parseFloat(blockDimensions.length) + MARGIN_ADDITION) * 
                         (parseFloat(blockDimensions.breadth) + MARGIN_ADDITION);

      // Get block material cost
      const blockType = foil.blockType || "Magnesium Block 3MM";
      const blockMaterialDetails = await fetchMaterialByName(blockType);
      
      if (!blockMaterialDetails) {
        console.warn(`Material details not found for block type: ${blockType}`);
        continue;
      }
      
      // Calculate block cost (including freight)
      const blockFright = 500; // Standard freight cost for blocks
      const blockCost = (blockArea * parseFloat(blockMaterialDetails.rate || 0)) + blockFright;
      totalBlockCost += blockCost;

      // Calculate block cost per unit
      const blockCostPerUnit = blockCost / totalCards;

      // Get foil material cost
      const foilType = foil.foilType || "Gold MTS 220";
      const foilMaterialDetails = await fetchMaterialByName(foilType);
      
      if (!foilMaterialDetails) {
        console.warn(`Material details not found for foil type: ${foilType}`);
        continue;
      }
      
      // Calculate foil cost
      const foilCost = blockArea * parseFloat(foilMaterialDetails.finalCostPerUnit || 0);
      totalFoilCost += foilCost;

      // Get MR cost
      const mrType = foil.mrType || "Simple";
      const mrDetails = await fetchRateByTypeAndGroup(mrType, "MR");
      
      if (!mrDetails) {
        console.warn(`MR details not found for: ${mrType}`);
        continue;
      }
      
      const mrCost = parseFloat(mrDetails.finalRate || 0);
      totalMRCost += mrCost;

      // Calculate MR cost per card
      const mrCostPerCard = mrCost / totalCards;

      // Calculate total cost for this foil
      const foilTotalCost = blockCostPerUnit + foilCost + mrCostPerCard + (impressionCost / totalCards);
      totalFSCosting += foilTotalCost;
    }

    // Calculate per card costs
    const fsBlockCostPerCard = totalBlockCost / totalCards;
    const fsFoilCostPerCard = totalFoilCost / totalCards;
    const fsMRCostPerCard = totalMRCost / totalCards;
    const fsImpressionCostPerCard = totalImpressionCost / totalCards;

    return {
      fsCostPerCard: totalFSCosting.toFixed(2),
      fsBlockCostPerCard: fsBlockCostPerCard.toFixed(2),
      fsFoilCostPerCard: fsFoilCostPerCard.toFixed(2),
      fsMRCostPerCard: fsMRCostPerCard.toFixed(2),
      fsImpressionCostPerCard: fsImpressionCostPerCard.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating FS costs:", error);
    return { error: "Failed to calculate foil stamping costs" };
  }
};