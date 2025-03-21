import { calculateLPCosts } from './lpCalculations';
import { calculateFSCosts } from './fsCalculations';
import { calculateEMBCosts } from './embCalculations';

/**
 * Calculate Sandwich Component costs
 * @param {Object} sandwich - Sandwich component details from form state
 * @param {Object} orderDetails - Order details from form state
 * @returns {Object} - Calculated sandwich costs
 */
export const calculateSandwichCosts = async (sandwich, orderDetails) => {
  try {
    const { isSandwichComponentUsed, lpDetailsSandwich, fsDetailsSandwich, embDetailsSandwich } = sandwich;

    if (!isSandwichComponentUsed) {
      return {
        lpCostPerCardSandwich: "0.00",
        lpPlateCostPerCardSandwich: "0.00",
        lpMRCostPerCardSandwich: "0.00",
        lpImpressionAndLaborCostPerCardSandwich: "0.00",
        fsCostPerCardSandwich: "0.00",
        fsBlockCostPerCardSandwich: "0.00",
        fsFoilCostPerCardSandwich: "0.00",
        fsMRCostPerCardSandwich: "0.00",
        fsImpressionCostPerCardSandwich: "0.00",
        embCostPerCardSandwich: "0.00",
        embPlateCostPerCardSandwich: "0.00",
        embMRCostPerCardSandwich: "0.00"
      };
    }

    // Calculate LP costs for sandwich (reusing the LP calculations)
    const lpCostsSandwich = lpDetailsSandwich?.isLPUsed
      ? await calculateLPCosts(lpDetailsSandwich, orderDetails)
      : {
          lpCostPerCard: "0.00",
          lpPlateCostPerCard: "0.00",
          lpMRCostPerCard: "0.00",
          lpImpressionAndLaborCostPerCard: "0.00"
        };

    // Calculate FS costs for sandwich (reusing the FS calculations)
    const fsCostsSandwich = fsDetailsSandwich?.isFSUsed
      ? await calculateFSCosts(fsDetailsSandwich, orderDetails)
      : {
          fsCostPerCard: "0.00",
          fsBlockCostPerCard: "0.00",
          fsFoilCostPerCard: "0.00",
          fsMRCostPerCard: "0.00",
          fsImpressionCostPerCard: "0.00"
        };

    // Calculate EMB costs for sandwich (reusing the EMB calculations)
    const embCostsSandwich = embDetailsSandwich?.isEMBUsed
      ? await calculateEMBCosts(embDetailsSandwich, orderDetails)
      : {
          embCostPerCard: "0.00",
          embPlateCostPerCard: "0.00",
          embMRCostPerCard: "0.00"
        };

    // Return all costs with renamed keys for clarity
    return {
      // LP sandwich costs
      lpCostPerCardSandwich: lpCostsSandwich.lpCostPerCard,
      lpPlateCostPerCardSandwich: lpCostsSandwich.lpPlateCostPerCard,
      lpMRCostPerCardSandwich: lpCostsSandwich.lpMRCostPerCard,
      lpImpressionAndLaborCostPerCardSandwich: lpCostsSandwich.lpImpressionAndLaborCostPerCard,
      
      // FS sandwich costs
      fsCostPerCardSandwich: fsCostsSandwich.fsCostPerCard,
      fsBlockCostPerCardSandwich: fsCostsSandwich.fsBlockCostPerCard,
      fsFoilCostPerCardSandwich: fsCostsSandwich.fsFoilCostPerCard,
      fsMRCostPerCardSandwich: fsCostsSandwich.fsMRCostPerCard,
      fsImpressionCostPerCardSandwich: fsCostsSandwich.fsImpressionCostPerCard,
      
      // EMB sandwich costs
      embCostPerCardSandwich: embCostsSandwich.embCostPerCard,
      embPlateCostPerCardSandwich: embCostsSandwich.embPlateCostPerCard,
      embMRCostPerCardSandwich: embCostsSandwich.embMRCostPerCard
    };
  } catch (error) {
    console.error("Error calculating sandwich costs:", error);
    return { error: "Failed to calculate sandwich component costs" };
  }
};