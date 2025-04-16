// enhancedCalculations.js
import { calculateEstimateCosts } from "./calculations";

/**
 * Comprehensive calculation service that handles all cost calculations
 * including base costs, markup, overhead, and wastage
 * @param {Object} state - The complete form state
 * @param {Number} miscCharge - Miscellaneous charge per card
 * @param {Number} markupPercentage - Markup percentage
 * @param {String} markupType - Type of markup (e.g., "STANDARD")
 * @returns {Promise<Object>} - Complete calculation results
 */
export const performCompleteCalculations = async (state, miscCharge = 5, markupPercentage = 0, markupType = "") => {
  try {
    // Get base calculations first
    const baseCalculations = await calculateEstimateCosts(state);
    
    // If there's an error in base calculations, return it
    if (baseCalculations.error) {
      return { error: baseCalculations.error };
    }

    // Constants for standard rates
    const WASTAGE_PERCENTAGE = 5; // 5% wastage
    const OVERHEAD_PERCENTAGE = 35; // 35% overhead
    
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
    const markupCost = costWithOverhead * (markupPercentage / 100);
    
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
      markupPercentage: markupPercentage,
      markupType: markupType,
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

/**
 * Simple function to recalculate just totals when misc charge or markup changes
 * without needing to regenerate all base costs
 * @param {Object} baseCalculations - Base calculations from calculateEstimateCosts
 * @param {Number} miscCharge - Misc charge per card
 * @param {Number} markupPercentage - Markup percentage
 * @param {Number} quantity - Total quantity of cards
 * @returns {Object} - Updated calculations with new totals
 */
export const recalculateTotals = (baseCalculations, miscCharge, markupPercentage, quantity) => {
  const WASTAGE_PERCENTAGE = 5;
  const OVERHEAD_PERCENTAGE = 35;
  
  // Define all cost fields that should be included
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
  const markupCost = costWithOverhead * (markupPercentage / 100);
  
  // Return updated totals
  return {
    baseCost: baseCost.toFixed(2),
    miscChargePerCard: miscCharge.toFixed(2),
    baseWithMisc: baseWithMisc.toFixed(2),
    wastageAmount: wastageCost.toFixed(2),
    overheadAmount: overheadCost.toFixed(2),
    markupAmount: markupCost.toFixed(2),
    subtotalPerCard: (costWithOverhead).toFixed(2),
    totalCostPerCard: (costWithOverhead + markupCost).toFixed(2),
    totalCost: ((costWithOverhead + markupCost) * quantity).toFixed(2)
  };
};