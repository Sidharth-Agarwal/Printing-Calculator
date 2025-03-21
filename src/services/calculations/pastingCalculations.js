import { fetchMaterialByName } from '../firebase/materials';
import { INCH_TO_CM } from '../../constants/calculationConstants';

/**
 * Calculate Pasting costs
 * @param {Object} pasting - Pasting details from form state
 * @param {Object} orderDetails - Order details from form state
 * @returns {Object} - Calculated pasting costs
 */
export const calculatePastingCosts = async (pasting, orderDetails) => {
  try {
    const { isPastingUsed, pastingType } = pasting;
    const { dieSize, quantity } = orderDetails;
    const totalCards = parseInt(quantity, 10);

    if (!isPastingUsed) {
      return { pastingCostPerCard: "0.00", totalPastingCost: "0.00" };
    }

    let totalPastingCost = 0;

    // Calculate based on pasting type
    if (pastingType === "DST" || pastingType === "DST - Double Sided Tape") {
      // Try different possible material names for DST
      const dstMaterialNames = ["DST Type", "DST", "DST Decal FT7358"];
      let dstMaterial = null;
      
      // Try each possible name
      for (const name of dstMaterialNames) {
        dstMaterial = await fetchMaterialByName(name);
        if (dstMaterial) {
          console.log(`Found material details for: ${name}`);
          break;
        }
      }
      
      if (dstMaterial) {
        // Convert die dimensions to cm
        const lengthCm = parseFloat(dieSize.length) * INCH_TO_CM;
        const breadthCm = parseFloat(dieSize.breadth) * INCH_TO_CM;
        
        // Calculate DST cost based on area
        totalPastingCost = lengthCm * breadthCm * parseFloat(dstMaterial.finalCostPerUnit || 0);
      } else {
        // Fallback cost if material not found
        console.warn("DST material not found, using fallback cost");
        totalPastingCost = 5.00 * totalCards; // Example fallback
      }
    } else if (pastingType === "Fold") {
      // Basic folding cost
      totalPastingCost = 0.5 * totalCards;
    } else if (pastingType === "Paste") {
      // Basic pasting cost
      totalPastingCost = 1.0 * totalCards;
    } else if (pastingType === "Fold & Paste") {
      // Combined folding and pasting
      totalPastingCost = 1.5 * totalCards;
    } else if (pastingType === "Sandwich") {
      // Special sandwich pasting (may already be calculated in sandwich component)
      totalPastingCost = 2.0 * totalCards;
    } else {
      console.warn(`Unsupported pasting type: ${pastingType}`);
    }
    
    // Calculate per card cost
    let pastingCostPerCard = totalPastingCost / totalCards;
    
    // Apply minimum threshold for display if cost is very small but non-zero
    if (totalPastingCost > 0 && pastingCostPerCard < 0.01) {
      pastingCostPerCard = 0.01;
    }

    return {
      pastingCostPerCard: pastingCostPerCard.toFixed(2),
      totalPastingCost: totalPastingCost.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating pasting costs:", error);
    return { error: "Failed to calculate pasting costs" };
  }
};