import { fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';
import { calculatePercentage } from '../../../../../../utils/calculationValidator';

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
    
    // CRITICAL FIX: Calculate overhead amount using precision calculation
    const overheadAmount = calculatePercentage(baseWithMisc.toString(), overheadPercentage);
    
    console.log(`Overhead calculation: Base=${baseWithMisc}, Rate=${overheadPercentage}%, Amount=${overheadAmount}`);
    
    return {
      overheadPercentage,
      overheadAmount: parseFloat(overheadAmount).toFixed(2),
      success: true
    };
  } catch (error) {
    console.error("Error calculating overhead:", error);
    
    // CRITICAL FIX: Use precision calculation for fallback overhead
    const fallbackOverheadAmount = calculatePercentage(baseWithMisc.toString(), 35);
    
    // Return default values in case of error
    return {
      overheadPercentage: 35,
      overheadAmount: parseFloat(fallbackOverheadAmount).toFixed(2),
      success: false,
      error: "Failed to calculate overhead"
    };
  }
};