import { fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';
import { calculatePercentage } from '../../../../../../utils/calculationValidator';

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
    
    // CRITICAL FIX: Calculate wastage amount using precision calculation
    const wastageAmount = calculatePercentage(baseWithMisc.toString(), wastagePercentage);
    
    console.log(`Wastage calculation: Base=${baseWithMisc}, Rate=${wastagePercentage}%, Amount=${wastageAmount}`);
    
    return {
      wastagePercentage,
      wastageAmount: parseFloat(wastageAmount).toFixed(2),
      success: true
    };
  } catch (error) {
    console.error("Error calculating wastage:", error);
    
    // CRITICAL FIX: Use precision calculation for fallback wastage
    const fallbackWastageAmount = calculatePercentage(baseWithMisc.toString(), 5);
    
    // Return default values in case of error
    return {
      wastagePercentage: 5,
      wastageAmount: parseFloat(fallbackWastageAmount).toFixed(2),
      success: false,
      error: "Failed to calculate wastage"
    };
  }
};