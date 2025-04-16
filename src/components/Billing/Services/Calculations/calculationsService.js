import { calculatePaperAndCuttingCosts } from './calculators';
import { fetchOverheadValue, fetchMarkupValue } from '../../../../utils/dbFetchUtils';

/**
 * Performs all necessary calculations based on the form state
 * @param {Object} state - The complete form state
 * @returns {Promise<Object>} - Complete calculation results
 */
export const performCalculations = async (state) => {
  try {
    // Initialize results object
    const results = {};
    
    // Validate state
    if (!state || !state.orderAndPaper || !state.client?.clientId) {
      return { error: "Invalid form state for calculations" };
    }

    // Calculate paper and cutting costs
    const paperResults = await calculatePaperAndCuttingCosts(state);
    if (paperResults.error) {
      console.warn("Paper calculation error:", paperResults.error);
    }
    
    // Add paper results to the total results
    Object.assign(results, paperResults);

    // Production services calculations will be added here
    // if (state.lpDetails?.isLPUsed) {
    //   const lpResults = await calculateLPCosts(state);
    //   Object.assign(results, lpResults);
    // }
    // ...

    // Post-production services calculations will be added here
    // if (state.dieCutting?.isDieCuttingUsed) {
    //   const dieCuttingResults = await calculateDieCuttingCosts(state);
    //   Object.assign(results, dieCuttingResults);
    // }
    // ...

    return results;
  } catch (error) {
    console.error("Error performing calculations:", error);
    return { error: "Error performing calculations" };
  }
};

/**
 * Performs complete calculations including markup, wastage, and overhead
 * @param {Object} state - The complete form state
 * @param {Number} miscCharge - Miscellaneous charge per card
 * @param {Number} markupPercentage - Optional override for markup percentage
 * @param {String} markupType - Optional override for markup type
 * @returns {Promise<Object>} - Complete calculation results
 */
export const performCompleteCalculations = async (
  state, 
  miscCharge = 5, 
  markupPercentage = null, 
  markupType = null
) => {
  try {
    // Get base calculations first
    const baseCalculations = await performCalculations(state);
    
    // If there's an error in base calculations, return it
    if (baseCalculations.error) {
      return { error: baseCalculations.error };
    }

    // Fetch standard overhead percentages
    const wastageOverhead = await fetchOverheadValue("WASTAGE");
    const generalOverhead = await fetchOverheadValue("OVERHEADS");
    
    // Default values if not found in database
    const WASTAGE_PERCENTAGE = wastageOverhead && wastageOverhead.percentage 
      ? parseFloat(wastageOverhead.percentage) 
      : 5; // 5% wastage default
      
    const OVERHEAD_PERCENTAGE = generalOverhead && generalOverhead.percentage 
      ? parseFloat(generalOverhead.percentage) 
      : 35; // 35% overhead default
    
    // Get markup percentage if not provided
    let finalMarkupPercentage = markupPercentage;
    let finalMarkupType = markupType;
    
    if (finalMarkupPercentage === null) {
      const markupInfo = await fetchMarkupValue(markupType || "STANDARD");
      if (markupInfo) {
        finalMarkupPercentage = parseFloat(markupInfo.finalRate) || 0;
        finalMarkupType = markupInfo.type || "STANDARD";
      } else {
        finalMarkupPercentage = 0;
        finalMarkupType = "STANDARD";
      }
    }
    
    // Define all cost fields that should be included in base cost
    const relevantFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard',
      'dieCuttingCostPerCard',
      'pastingCostPerCard'
    ];

    // Calculate base cost per card
    const baseCost = relevantFields.reduce((acc, key) => {
      const value = baseCalculations[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);

    // Add miscellaneous charge to base cost
    const baseWithMisc = baseCost + miscCharge;
    
    // Calculate wastage cost
    const wastageCost = baseWithMisc * (WASTAGE_PERCENTAGE / 100);
    
    // Calculate overhead cost
    const overheadCost = baseWithMisc * (OVERHEAD_PERCENTAGE / 100);
    
    // Calculate cost with wastage and overhead
    const costWithOverhead = baseWithMisc + wastageCost + overheadCost;
    
    // Calculate markup cost
    const markupCost = costWithOverhead * (finalMarkupPercentage / 100);
    
    // Calculate total cost
    const totalCostPerCard = costWithOverhead + markupCost;
    
    // Total cost for all cards
    const totalCost = totalCostPerCard * (state.orderAndPaper?.quantity || 0);

    // Return all calculations in one comprehensive object
    return {
      // Original base calculations
      ...baseCalculations,
      
      // Standard cost components
      baseCost: baseCost.toFixed(2),
      miscChargePerCard: miscCharge.toFixed(2),
      baseWithMisc: baseWithMisc.toFixed(2),
      wastagePercentage: WASTAGE_PERCENTAGE,
      wastageAmount: wastageCost.toFixed(2),
      overheadPercentage: OVERHEAD_PERCENTAGE,
      overheadAmount: overheadCost.toFixed(2),
      
      // Markup information
      markupPercentage: finalMarkupPercentage,
      markupType: finalMarkupType,
      markupAmount: markupCost.toFixed(2),
      
      // Totals
      subtotalPerCard: (costWithOverhead).toFixed(2),
      totalCostPerCard: totalCostPerCard.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  } catch (error) {
    console.error("Error in comprehensive calculations:", error);
    return { error: "Error calculating complete costs. Please try again." };
  }
};