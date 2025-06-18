import { fetchMaterialDetails } from '../../../../../../utils/fetchDataUtils';
import { fetchStandardRate } from '../../../../../../utils/dbFetchUtils';
import { getMarginsByJobType } from '../../../../../../utils/marginUtils';

/**
 * Calculates embossing costs based on form state
 * @param {Object} state - Form state containing embossing details
 * @returns {Promise<Object>} - Embossing cost calculations
 */
export const calculateEMBCosts = async (state) => {
  try {
    const { embDetails, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const dieCode = orderAndPaper.dieCode;
    const jobType = orderAndPaper.jobType || "CARD";
    const fragsPerDie = orderAndPaper.frags || 1;

    // Check if embossing is used
    if (!embDetails.isEMBUsed) {
      return { 
        embCostPerCard: "0.00",
        embPlateCostPerCard: "0.00",
        embMRCostPerCard: "0.00",
        embPositiveFilmCostPerCard: "0.00",
        embMkgPlateCostPerCard: "0.00",
        embImpressionCostPerCard: "0.00",
        embDstMaterialCostPerCard: "0.00" // Add DST material cost field
      };
    }

    // Validate required inputs
    if (!totalCards || !embDetails.plateDimensions?.length || !embDetails.plateDimensions?.breadth) {
      return { 
        error: "Missing required information for embossing calculations",
        embCostPerCard: "0.00",
        embPlateCostPerCard: "0.00",
        embMRCostPerCard: "0.00",
        embPositiveFilmCostPerCard: "0.00",
        embMkgPlateCostPerCard: "0.00",
        embImpressionCostPerCard: "0.00",
        embDstMaterialCostPerCard: "0.00" // Add DST material cost field
      };
    }

    // 1. Get margin values based on job type
    const margins = getMarginsByJobType(jobType);
    const lengthMargin = margins.lengthMargin;
    const breadthMargin = margins.breadthMargin;
    console.log("MARGINS : ", margins);
    
    // Calculate plate area 
    let plateArea = 0;
    
    if (embDetails.plateSizeType === "Auto") {
      // First check if product size is available
      if (orderAndPaper.productSize && orderAndPaper.productSize.length && orderAndPaper.productSize.breadth) {
        const productLengthCm = parseFloat(orderAndPaper.productSize.length) * 2.54;
        const productBreadthCm = parseFloat(orderAndPaper.productSize.breadth) * 2.54;
        plateArea = (productLengthCm + lengthMargin) * (productBreadthCm + breadthMargin);
      } else if (orderAndPaper.dieSize) {
        // Fall back to die dimensions if product size is not available
        const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
        const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
        plateArea = (dieLengthCm + lengthMargin) * (dieBreadthCm + breadthMargin);
      }
    } else {
      // Otherwise use the provided plate dimensions
      const providedLength = parseFloat(embDetails.plateDimensions.length);
      const providedBreadth = parseFloat(embDetails.plateDimensions.breadth);
      plateArea = (providedLength + lengthMargin) * (providedBreadth + breadthMargin);
    }

    // 2. Fetch male plate material details
    const malePlateMaterialDetails = await fetchMaterialDetails(embDetails.plateTypeMale);
    if (!malePlateMaterialDetails) {
      console.warn(`Material details not found for male plate type: ${embDetails.plateTypeMale}`);
      return { error: `Material details not found for male plate type: ${embDetails.plateTypeMale}` };
    }

    // 3. Calculate male plate cost
    const malePlateCost = plateArea * parseFloat(malePlateMaterialDetails.finalCostPerUnit || 0);
    
    // 4. Fetch female plate material details
    const femalePlateMaterialDetails = await fetchMaterialDetails(embDetails.plateTypeFemale);
    if (!femalePlateMaterialDetails) {
      console.warn(`Material details not found for female plate type: ${embDetails.plateTypeFemale}`);
      return { error: `Material details not found for female plate type: ${embDetails.plateTypeFemale}` };
    }
    
    // 5. Calculate female plate cost
    const femalePlateCost = plateArea * parseFloat(femalePlateMaterialDetails.finalCostPerUnit || 0);
    
    // 6. Calculate total plate cost
    const totalPlateCost = malePlateCost + femalePlateCost;

    // 7. Fetch DST material details and calculate cost
    let dstMaterialCost = 0;
    if (embDetails.dstMaterial) {
      const dstMaterialDetails = await fetchMaterialDetails(embDetails.dstMaterial);
      if (dstMaterialDetails) {
        // Calculate DST material cost based on plate area
        dstMaterialCost = plateArea * parseFloat(dstMaterialDetails.finalCostPerUnit || 0);
      } else {
        console.warn(`Material details not found for DST material: ${embDetails.dstMaterial}`);
      }
    }
    
    // 8. Fetch positive film material details
    const positiveFilmDetails = await fetchMaterialDetails("Positive Film");
    let positiveFilmCost = 0;
    
    if (positiveFilmDetails) {
      positiveFilmCost = plateArea * parseFloat(positiveFilmDetails.finalCostPerUnit || 0);
    } else {
      console.warn("Material details not found for Positive Film");
    }

    // 9. Fetch MR (Machine Running) cost from standard rates
    const embMR = embDetails.embMR || "SIMPLE"; // Default to SIMPLE if not specified
    const concatenatedMR = `EMB MR ${embMR}`;
    
    const mrDetails = await fetchStandardRate("EMB MR", embMR);
    let mrCost = 0;
    
    if (mrDetails) {
      mrCost = parseFloat(mrDetails.finalRate || 0);
    } else {
      console.warn(`No MR details found for EMB MR type: ${embMR}`);
      // Fallback values based on complexity
      if (embMR === "SIMPLE") mrCost = 50;
      else if (embMR === "COMPLEX") mrCost = 100;
      else if (embMR === "SUPER COMPLEX") mrCost = 200;
    }

    // 10. Fetch MKG (Making) plate cost from standard rates
    const mkgDetails = await fetchStandardRate("MKG", "EMB PLATE");
    let mkgCost = 0;
    
    if (mkgDetails) {
      mkgCost = parseFloat(mkgDetails.finalRate || 0);
    } else {
      console.warn("No MKG details found for EMB PLATE");
      mkgCost = 500; // Fallback value
    }

    // 11. Fetch impression cost from standard rates
    const impressionDetails = await fetchStandardRate("IMPRESSION", "EMB");
    let impressionCostPerUnit = 0;
    
    if (impressionDetails) {
      impressionCostPerUnit = parseFloat(impressionDetails.finalRate || 0);
    } else {
      console.warn("No impression details found for EMB");
      impressionCostPerUnit = 1; // Fallback value
    }

    // 12. Calculate per card costs
    const embPlateCostPerCard = totalPlateCost / totalCards;
    const embMRCostPerCard = mrCost / totalCards;
    const embPositiveFilmCostPerCard = positiveFilmCost / totalCards;
    const embMkgPlateCostPerCard = mkgCost / totalCards;
    const embImpressionCostPerCard = impressionCostPerUnit / fragsPerDie;
    const embDstMaterialCostPerCard = dstMaterialCost / totalCards;
    
    // 13. Calculate total embossing cost per card including DST material cost
    const embCostPerCard = 
      embMRCostPerCard + 
      embPositiveFilmCostPerCard + 
      embMkgPlateCostPerCard + 
      embImpressionCostPerCard + 
      embDstMaterialCostPerCard; // Include DST material cost
    
    // 14. Return all calculations with detailed breakdowns
    return {
      embCostPerCard: embCostPerCard.toFixed(2),
      embMRCostPerCard: embMRCostPerCard.toFixed(2),
      embPositiveFilmCostPerCard: embPositiveFilmCostPerCard.toFixed(2),
      embMkgPlateCostPerCard: embMkgPlateCostPerCard.toFixed(2),
      embImpressionCostPerCard: embImpressionCostPerCard.toFixed(2),
      embDstMaterialCostPerCard: embDstMaterialCostPerCard.toFixed(2), // Include DST material cost
      // Additional data for debugging
      plateArea: plateArea.toFixed(2),
      malePlateCost: malePlateCost.toFixed(2),
      femalePlateCost: femalePlateCost.toFixed(2),
      totalPlateCost: totalPlateCost.toFixed(2),
      dstMaterialCost: dstMaterialCost.toFixed(2), // Include total DST material cost
      positiveFilmCost: positiveFilmCost.toFixed(2),
      mrCost: mrCost.toFixed(2),
      mkgCost: mkgCost.toFixed(2),
      fragsPerDie: fragsPerDie, // Include frags per die for debugging
      lengthMargin: lengthMargin.toFixed(2), // Updated for debugging
      breadthMargin: breadthMargin.toFixed(2) // Updated for debugging
    };
  } catch (error) {
    console.error("Error calculating embossing costs:", error);
    return { 
      error: "Error calculating embossing costs",
      embCostPerCard: "0.00",
      embPlateCostPerCard: "0.00",
      embMRCostPerCard: "0.00",
      embPositiveFilmCostPerCard: "0.00",
      embMkgPlateCostPerCard: "0.00",
      embImpressionCostPerCard: "0.00",
      embDstMaterialCostPerCard: "0.00" // Include DST material cost field
    };
  }
};