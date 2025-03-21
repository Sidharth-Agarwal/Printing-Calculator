import { calculatePaperAndCuttingCosts } from './paperCalculations';
import { calculateLPCosts } from './lpCalculations';
import { calculateFSCosts } from './fsCalculations';
import { calculateEMBCosts } from './embCalculations';
import { calculateDigiCosts } from './digiCalculations';
import { calculateDieCuttingCosts } from './dieCuttingCalculations';
import { calculateSandwichCosts } from './sandwichCalculations';
import { calculatePastingCosts } from './pastingCalculations';

/**
 * Calculate all estimate costs
 * @param {Object} state - The complete form state
 * @returns {Object} - All calculated costs
 */
export const calculateEstimateCosts = async (state) => {
  try {
    // Calculate paper and cutting costs
    const paperAndCuttingCosts = await calculatePaperAndCuttingCosts(state.orderAndPaper);
    if (paperAndCuttingCosts.error) return { error: paperAndCuttingCosts.error };

    // Calculate LP costs
    const lpCosts = await calculateLPCosts(state.lpDetails, state.orderAndPaper);
    if (lpCosts.error) return { error: lpCosts.error };

    // Calculate FS costs
    const fsCosts = await calculateFSCosts(state.fsDetails, state.orderAndPaper);
    if (fsCosts.error) return { error: fsCosts.error };

    // Calculate EMB costs
    const embCosts = await calculateEMBCosts(state.embDetails, state.orderAndPaper);
    if (embCosts.error) return { error: embCosts.error };

    // Calculate digital printing costs
    const digiCosts = await calculateDigiCosts(state.digiDetails, state.orderAndPaper);
    if (digiCosts.error) return { error: digiCosts.error };

    // Calculate die cutting costs
    const dieCuttingCosts = await calculateDieCuttingCosts(state.dieCutting, state.orderAndPaper);
    if (dieCuttingCosts.error) return { error: dieCuttingCosts.error };

    // Calculate sandwich costs
    const sandwichCosts = await calculateSandwichCosts(state.sandwich, state.orderAndPaper);
    if (sandwichCosts.error) return { error: sandwichCosts.error };

    // Calculate pasting costs
    const pastingCosts = await calculatePastingCosts(state.pasting, state.orderAndPaper);
    if (pastingCosts.error) return { error: pastingCosts.error };

    // Combine all costs
    return {
      ...paperAndCuttingCosts,
      ...lpCosts,
      ...fsCosts,
      ...embCosts,
      ...digiCosts,
      ...dieCuttingCosts,
      ...sandwichCosts,
      ...pastingCosts,
    };
  } catch (error) {
    console.error("Error calculating estimate costs:", error);
    return { error: "An unexpected error occurred while calculating costs" };
  }
};