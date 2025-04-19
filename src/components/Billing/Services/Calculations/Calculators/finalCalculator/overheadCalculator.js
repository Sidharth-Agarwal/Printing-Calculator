// src/components/BillingForm/Services/Calculations/calculators/finalCalculators/overheadCalculator.js
import { fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';

/**
 * Calculates overhead amount based on base cost with miscellaneous charges
 * @param {number} baseWithMisc - The base cost with miscellaneous charges
 * @returns {Promise<Object>} - Overhead calculation details
 */
export const calculateOverhead = async (baseWithMisc) => {
  try {
    // Fetch overhead percentage from the database
    const generalOverhead = await fetchOverheadValue("OVERHEADS");
    
    // Use the percentage from DB or default to 35% if not found
    const overheadPercentage = generalOverhead && generalOverhead.percentage
      ? parseFloat(generalOverhead.percentage)
      : 35;
    
    // Calculate overhead amount
    const overheadAmount = baseWithMisc * (overheadPercentage / 100);
    
    return {
      overheadPercentage,
      overheadAmount: overheadAmount.toFixed(2),
      success: true
    };
  } catch (error) {
    console.error("Error calculating overhead:", error);
    // Return default values in case of error
    return {
      overheadPercentage: 35,
      overheadAmount: (baseWithMisc * 0.35).toFixed(2),
      success: false,
      error: "Failed to calculate overhead"
    };
  }
};