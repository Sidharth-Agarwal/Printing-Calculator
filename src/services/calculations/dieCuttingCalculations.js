import { fetchRateByTypeAndGroup } from '../firebase/standardRates';
import { DC_IMPRESSION_COST, MR_RATES } from '../../constants/calculationConstants';

/**
 * Calculate Die Cutting costs
 * @param {Object} dieCutting - Die cutting details from form state
 * @param {Object} orderDetails - Order details from form state
 * @returns {Object} - Calculated die cutting costs
 */
export const calculateDieCuttingCosts = async (dieCutting, orderDetails) => {
  try {
    const { isDieCuttingUsed, difficulty, pdc, dcMR } = dieCutting;
    const totalCards = parseInt(orderDetails.quantity, 10);

    // If die cutting is not used or difficulty is No, return zero cost
    if (!isDieCuttingUsed || difficulty === "No") {
      return { 
        dieCuttingCostPerCard: "0.00",
        dcImpressionCostPerCard: "0.00",
        dcMRCostPerCard: "0.00",
        pdcCostPerCard: "0.00"
      };
    }

    // Calculate impression cost
    const impressionCostPerUnit = DC_IMPRESSION_COST;
    const totalImpressionCost = impressionCostPerUnit * totalCards;

    // Get MR cost or use fallback
    let mrRate = 0;
    if (dcMR) {
      const mrDetails = await fetchRateByTypeAndGroup(dcMR, "MR");
      if (mrDetails) {
        mrRate = parseFloat(mrDetails.finalRate || 0);
      } else {
        // Use fallback values if MR details not found
        switch (dcMR) {
          case "Simple":
            mrRate = MR_RATES.SIMPLE;
            break;
          case "Complex":
            mrRate = MR_RATES.COMPLEX;
            break;
          case "Super Complex":
            mrRate = MR_RATES.SUPER_COMPLEX;
            break;
          default:
            mrRate = 0;
        }
        console.warn(`Using fallback MR cost for type: ${dcMR}: ${mrRate}`);
      }
    }

    // Calculate MR cost per unit
    const mrCostPerUnit = mrRate / totalCards;

    // Calculate PDC cost (same as die cutting cost if PDC is Yes)
    let pdcCostPerUnit = 0;
    if (pdc === "Yes") {
      pdcCostPerUnit = mrCostPerUnit;
    }

    // Calculate total die cutting costs
    const dcImpressionCostPerCard = impressionCostPerUnit;
    const dcMRCostPerCard = mrCostPerUnit;
    const pdcTotalCostPerCard = (pdc === "Yes") ? (impressionCostPerUnit + pdcCostPerUnit) : 0;
    const dieCuttingCostPerCard = (impressionCostPerUnit + mrCostPerUnit) + pdcTotalCostPerCard;

    return {
      dieCuttingCostPerCard: dieCuttingCostPerCard.toFixed(2),
      dcImpressionCostPerCard: dcImpressionCostPerCard.toFixed(2),
      dcMRCostPerCard: dcMRCostPerCard.toFixed(2),
      pdcCostPerCard: pdcTotalCostPerCard.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating die cutting costs:", error);
    return { error: "Failed to calculate die cutting costs" };
  }
};