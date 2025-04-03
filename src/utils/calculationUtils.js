// src/utils/calculationUtils.js
// Import the original calculation functions
import { 
  calculatePaperAndCuttingCosts,
  calculateLPCosts,
  calculateFSCosts,
  calculateEMBCosts,
  calculateDigiDetailsCosts,
  calculateDieCuttingCosts,
  calculateSandwichCosts,
  calculatePastingCosts
} from './calculations';

/**
 * Wrapper for the original calculateEstimateCosts function,
 * but with additional validation and error handling for the new form state structure
 * 
 * @param {Object} state - The updated form state with client info and version info
 * @returns {Promise<Object>} - Calculation results or error
 */
export const calculateEstimateCosts = async (state) => {
  try {
    // Check for required client info
    if (!state.clientInfo || !state.clientInfo.clientId || !state.clientInfo.clientName) {
      return { error: "Client information is required for calculations" };
    }
    
    // Check for required order info
    const { orderAndPaper } = state;
    if (!orderAndPaper || !orderAndPaper.projectName || !orderAndPaper.quantity) {
      return { error: "Project name and quantity are required for calculations" };
    }
    
    // Validate quantity
    const quantity = parseInt(orderAndPaper.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      return { error: "Invalid quantity: must be a positive number" };
    }
    
    // Check paper details
    if (!orderAndPaper.paperName) {
      return { error: "Paper selection is required for calculations" };
    }
    
    // Check die details
    if (!orderAndPaper.dieCode || !orderAndPaper.dieSize || 
        !orderAndPaper.dieSize.length || !orderAndPaper.dieSize.breadth) {
      return { error: "Die selection with dimensions is required for calculations" };
    }
    
    // All validations passed, proceed with original calculations
    const paperAndCuttingCosts = await calculatePaperAndCuttingCosts(state);
    if (paperAndCuttingCosts.error) return { error: paperAndCuttingCosts.error };

    const lpCosts = await calculateLPCosts(state);
    if (lpCosts.error) return { error: lpCosts.error };

    const fsCosts = await calculateFSCosts(state);
    if (fsCosts.error) return { error: fsCosts.error };

    const embCosts = await calculateEMBCosts(state);
    if (embCosts.error) return { error: embCosts.error };

    const digiCosts = await calculateDigiDetailsCosts(
      state.digiDetails,
      state.orderAndPaper.dieSize,
      parseInt(state.orderAndPaper.quantity, 10)
    );
    if (digiCosts.error) return { error: digiCosts.error };    

    // Handle Die Cutting Costs
    const dieCuttingCosts = await calculateDieCuttingCosts(state);
    if (dieCuttingCosts.error) return { error: dieCuttingCosts.error };

    // Handle Sandwich Costs
    const sandwichCosts = await calculateSandwichCosts(state.sandwich, state.orderAndPaper.quantity);
    if (sandwichCosts.error) return { error: sandwichCosts.error };

    // Handle Pasting Costs
    const pastingCosts = await calculatePastingCosts(state);
    if (pastingCosts.error) return { error: pastingCosts.error };

    // Combine all calculated costs
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
    return { error: "Error calculating costs. Please try again." };
  }
};

/**
 * Calculate total cost per card with wastage, overhead, and markup
 * @param {Object} calculations - Base calculations result
 * @param {number} markupPercentage - Markup percentage
 * @param {number} miscCharge - Miscellaneous charge per card
 * @param {number} quantity - Total quantity of cards
 * @returns {Object} - Detailed cost breakdown
 */
export const calculateTotalCost = (calculations, markupPercentage = 0, miscCharge = 5, quantity = 0) => {
  if (!calculations) return null;
  
  const WASTAGE_PERCENTAGE = 5; // 5% wastage
  const OVERHEAD_PERCENTAGE = 35; // 35% overhead
  
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
    const value = calculations[key];
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
  
  // Return comprehensive cost breakdown
  return {
    baseCost,
    miscCharge,
    baseWithMisc,
    wastagePercentage: WASTAGE_PERCENTAGE,
    wastageCost,
    overheadPercentage: OVERHEAD_PERCENTAGE,
    overheadCost,
    subtotal: costWithOverhead,
    markupPercentage,
    markupCost,
    totalCostPerCard: costWithOverhead + markupCost,
    quantity,
    totalCost: (costWithOverhead + markupCost) * quantity
  };
};

/**
 * Get enhanced calculations with all totals and breakdowns
 * @param {Object} calculations - Base calculations
 * @param {number} markupPercentage - Markup percentage
 * @param {number} miscCharge - Miscellaneous charge per card
 * @param {number} quantity - Total quantity of cards
 * @returns {Object} - Enhanced calculations object
 */
export const getEnhancedCalculations = (calculations, markupPercentage = 0, miscCharge = 5, quantity = 0) => {
  if (!calculations) return null;
  
  const costDetails = calculateTotalCost(calculations, markupPercentage, miscCharge, quantity);
  if (!costDetails) return null;
  
  return {
    ...calculations,
    
    // Standard cost components
    baseCost: costDetails.baseCost.toFixed(2),
    miscChargePerCard: costDetails.miscCharge.toFixed(2),
    baseWithMisc: costDetails.baseWithMisc.toFixed(2),
    wastagePercentage: costDetails.wastagePercentage,
    wastageAmount: costDetails.wastageCost.toFixed(2),
    overheadPercentage: costDetails.overheadPercentage,
    overheadAmount: costDetails.overheadCost.toFixed(2),
    
    // Markup information
    markupPercentage: costDetails.markupPercentage,
    markupAmount: costDetails.markupCost.toFixed(2),
    
    // Totals
    subtotalPerCard: costDetails.subtotal.toFixed(2),
    totalCostPerCard: costDetails.totalCostPerCard.toFixed(2),
    totalCost: costDetails.totalCost.toFixed(2)
  };
};

/**
 * Compare calculations between two estimates
 * @param {Object} oldCalc - Old calculations
 * @param {Object} newCalc - New calculations
 * @returns {Object} - Differences between calculations
 */
export const compareCalculations = (oldCalc, newCalc) => {
  if (!oldCalc || !newCalc) return {};
  
  const differences = {};
  
  // Fields to compare
  const comparisonFields = [
    'paperAndCuttingCostPerCard',
    'lpCostPerCard',
    'fsCostPerCard',
    'embCostPerCard',
    'digiCostPerCard',
    'dieCuttingCostPerCard',
    'pastingCostPerCard',
    'totalCostPerCard',
    'totalCost'
  ];
  
  comparisonFields.forEach(field => {
    const oldValue = parseFloat(oldCalc[field] || 0);
    const newValue = parseFloat(newCalc[field] || 0);
    
    if (oldValue !== newValue) {
      differences[field] = {
        before: oldValue,
        after: newValue,
        change: newValue - oldValue,
        percentChange: oldValue === 0 ? 100 : ((newValue - oldValue) / oldValue) * 100
      };
    }
  });
  
  return differences;
};