import { fetchStandardRate } from "../../../../../../utils/dbFetchUtils";

/**
 * Calculates quality control costs based on form state
 * @param {Object} state - Form state containing QC details
 * @returns {Promise<Object>} - QC cost calculations
 */
export const calculateQCCosts = async (state) => {
  try {
    const { qc } = state;
    
    // Check if QC is used
    if (!qc?.isQCUsed) {
      return { qcCostPerCard: "0.00" };
    }

    // Fetch QC value from standard_rates instead of overheads
    const qcRate = await fetchStandardRate("LABOUR", "QUALITY CHECK");
    
    // Use the finalRate from DB or default if not found
    const qcCostPerCard = qcRate && qcRate.finalRate
      ? parseFloat(qcRate.finalRate)
      : 1.0; // Default to 1.0 if not found
    
    console.log("QC calculation:", {
      isQCUsed: qc.isQCUsed,
      qcCostPerCard
    });
    
    return {
      qcCostPerCard: qcCostPerCard.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating QC costs:", error);
    return { 
      error: "Error calculating QC costs",
      qcCostPerCard: "0.00"
    };
  }
};