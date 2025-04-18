import { fetchOverheadValue } from "../../../../../../utils/dbFetchUtils";

/**
 * Calculates packing costs based on form state and base cost
 * @param {Object} state - Form state containing packing details
 * @param {Number} baseCost - The base cost per card (optional, can be calculated later in flow)
 * @returns {Promise<Object>} - Packing cost calculations
 */
export const calculatePackingCosts = async (state, baseCost = null) => {
  try {
    const { packing } = state;
    
    // Check if packing is used
    if (!packing?.isPackingUsed) {
      return { packingCostPerCard: "0.00", packingPercentage: 0 };
    }

    // Fetch Packing percentage from overheads
    const packingOverhead = await fetchOverheadValue("PACKAGING");
    
    // Use the percentage from DB or default if not found
    const packingPercentage = packingOverhead && packingOverhead.percentage
      ? parseFloat(packingOverhead.percentage)
      : 5.0; // Default to 5% if not found
    
    // If base cost is provided, calculate packing cost as percentage
    // Otherwise, just return the percentage for later calculation
    let packingCostPerCard = 0;
    
    if (baseCost !== null) {
      packingCostPerCard = baseCost * (packingPercentage / 100);
    }
    
    console.log("Packing calculation:", {
      isPackingUsed: packing.isPackingUsed,
      packingPercentage,
      baseCost,
      packingCostPerCard
    });
    
    return {
      packingCostPerCard: packingCostPerCard.toFixed(2),
      packingPercentage
    };
  } catch (error) {
    console.error("Error calculating Packing costs:", error);
    return { 
      error: "Error calculating Packing costs",
      packingCostPerCard: "0.00",
      packingPercentage: 0
    };
  }
};