// src/components/BillingForm/Services/Calculations/calculators/finalCalculators/wastageCalculator.js
import { fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';

/**
 * Calculates wastage amount based on base cost with miscellaneous charges
 * @param {number} baseWithMisc - The base cost with miscellaneous charges
 * @returns {Promise<Object>} - Wastage calculation details
 */
export const calculateWastage = async (baseWithMisc) => {
  try {
    // Fetch wastage percentage from the database
    const wastageOverhead = await fetchOverheadValue("WASTAGE");
    
    // Use the percentage from DB or default to 5% if not found
    const wastagePercentage = wastageOverhead && wastageOverhead.percentage
      ? parseFloat(wastageOverhead.percentage)
      : 5;
    
    // Calculate wastage amount
    const wastageAmount = baseWithMisc * (wastagePercentage / 100);
    
    return {
      wastagePercentage,
      wastageAmount: wastageAmount.toFixed(2),
      success: true
    };
  } catch (error) {
    console.error("Error calculating wastage:", error);
    // Return default values in case of error
    return {
      wastagePercentage: 5,
      wastageAmount: (baseWithMisc * 0.05).toFixed(2),
      success: false,
      error: "Failed to calculate wastage"
    };
  }
};