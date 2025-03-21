import { fetchMaterialByName } from '../firebase/materials';
import { fetchRateByTypeAndGroup } from '../firebase/standardRates';
import { INCH_TO_CM, MARGIN_ADDITION, LP_COLOR_COST, LP_IMPRESSION_COST, LP_LABOR_COST } from '../../constants/calculationConstants';

// Calculate letterpress costs
export const calculateLPCosts = async (lpDetails, orderDetails) => {
  try {
    const { isLPUsed, colorDetails } = lpDetails;
    const totalCards = parseInt(orderDetails.quantity, 10);

    if (!isLPUsed || !colorDetails || colorDetails.length === 0) {
      return { 
        lpCostPerCard: "0.00",
        lpPlateCostPerCard: "0.00",
        lpMRCostPerCard: "0.00",
        lpImpressionAndLaborCostPerCard: "0.00"
      };
    }

    let totalLPCosting = 0;
    let totalPlateCost = 0;
    let totalMRCost = 0;
    let totalImpressionAndLaborCost = 0;

    // Calculate costs for each color
    for (const color of colorDetails) {
      // Calculate impression and labor cost
      const colorCost = LP_COLOR_COST * totalCards;
      const impressionCost = LP_IMPRESSION_COST * totalCards;
      const laborCost = LP_LABOR_COST * totalCards;
      const totalLPColorCost = colorCost + impressionCost + laborCost;
      
      totalImpressionAndLaborCost += totalLPColorCost;

      // Get plate dimensions
      let plateDimensions = color.plateDimensions;
      if (!plateDimensions || !plateDimensions.length || !plateDimensions.breadth) {
        continue;
      }

      // Calculate plate area with margin
      const plateArea = (parseFloat(plateDimensions.length) + MARGIN_ADDITION) * 
                       (parseFloat(plateDimensions.breadth) + MARGIN_ADDITION);

      // Get plate material cost
      const plateType = color.plateType || "Polymer Plate";
      const materialDetails = await fetchMaterialByName(plateType);
      
      if (!materialDetails) {
        console.warn(`Material details not found for plate type: ${plateType}`);
        continue;
      }
      
      // Calculate plate cost
      const plateCost = plateArea * parseFloat(materialDetails.finalCostPerUnit || 0);
      totalPlateCost += plateCost;

      // Get MR cost
      const mrType = color.mrType || "Simple";
      const mrDetails = await fetchRateByTypeAndGroup(mrType, "MR");
      
      if (!mrDetails) {
        console.warn(`MR details not found for: ${mrType}`);
        continue;
      }
      
      const mrCost = parseFloat(mrDetails.finalRate || 0);
      totalMRCost += mrCost;

      // Calculate total cost for this color
      const colorTotalCost = totalLPColorCost + plateCost + mrCost;
      totalLPCosting += colorTotalCost;
    }

    // Calculate per card costs
    const lpCostPerCard = totalLPCosting / totalCards;
    const lpPlateCostPerCard = totalPlateCost / totalCards;
    const lpMRCostPerCard = totalMRCost / totalCards;
    const lpImpressionAndLaborCostPerCard = totalImpressionAndLaborCost / totalCards;

    return {
      lpCostPerCard: lpCostPerCard.toFixed(2),
      lpPlateCostPerCard: lpPlateCostPerCard.toFixed(2),
      lpMRCostPerCard: lpMRCostPerCard.toFixed(2),
      lpImpressionAndLaborCostPerCard: lpImpressionAndLaborCostPerCard.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating LP costs:", error);
    return { error: "Failed to calculate letterpress costs" };
  }
};