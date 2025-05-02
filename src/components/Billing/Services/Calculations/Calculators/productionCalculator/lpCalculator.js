import { fetchMaterialDetails } from '../../../../../../utils/fetchDataUtils';
import { fetchStandardRate, fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';

/**
 * Calculates letter press (LP) costs based on form state
 * @param {Object} state - Form state containing LP details
 * @returns {Promise<Object>} - LP cost calculations
 */
export const calculateLPCosts = async (state) => {
  try {
    const { lpDetails, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);

    // Check if LP is used
    if (!lpDetails.isLPUsed || !lpDetails.colorDetails?.length) {
      return { 
        lpCostPerCard: "0.00",
        lpPlateCostPerCard: "0.00",
        lpPositiveFilmCostPerCard: "0.00",
        lpInkCostPerCard: "0.00",
        lpMRCostPerCard: "0.00",
        lpMkgCostPerCard: "0.00",
        lpTotalColorsCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !orderAndPaper.dieSize?.length || !orderAndPaper.dieSize?.breadth) {
      return { 
        error: "Missing required information for LP calculations",
        lpCostPerCard: "0.00",
        lpPlateCostPerCard: "0.00",
        lpPositiveFilmCostPerCard: "0.00",
        lpInkCostPerCard: "0.00",
        lpMRCostPerCard: "0.00",
        lpMkgCostPerCard: "0.00",
        lpTotalColorsCostPerCard: "0.00"
      };
    }

    // 1. Fetch margin value from overheads
    const marginValue = await fetchOverheadValue('MARGIN');
    const margin = marginValue ? parseFloat(marginValue.value) : 2; // Default margin if not found
    
    // Initialize cost variables
    let totalPlateCost = 0;
    let totalPositiveFilmCost = 0;
    let totalInkCost = 0;
    let totalMRCost = 0;
    let totalMkgCost = 0;
    let totalColorsCost = 0;

    // Process each color
    for (let i = 0; i < lpDetails.colorDetails.length; i++) {
      const colorDetail = lpDetails.colorDetails[i];
      
      // Calculate plate area
      let plateArea = 0;
      
      if (colorDetail.plateSizeType === "Auto") {
        // First check if product size is available
        if (orderAndPaper.productSize && orderAndPaper.productSize.length && orderAndPaper.productSize.breadth) {
          const productLengthCm = parseFloat(orderAndPaper.productSize.length) * 2.54;
          const productBreadthCm = parseFloat(orderAndPaper.productSize.breadth) * 2.54;
          plateArea = (productLengthCm + margin) * (productBreadthCm + margin);
        } else if (orderAndPaper.dieSize) {
          // Fall back to die dimensions if product size is not available
          const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
          const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
          plateArea = (dieLengthCm + margin) * (dieBreadthCm + margin);
        }
      } else {
        // Otherwise use the provided plate dimensions
        const providedLength = parseFloat(colorDetail.plateDimensions.length)
        const providedBreadth = parseFloat(colorDetail.plateDimensions.breadth)
        console.log(providedLength)
        console.log(providedLength + margin)
        console.log(providedBreadth)
        console.log(providedBreadth + margin)
        plateArea = (providedLength + margin) * (providedBreadth + margin);
      }
      
      // 2. Fetch plate material details
      const plateType = colorDetail.plateType || "Polymer Plate";
      const plateMaterialDetails = await fetchMaterialDetails(plateType);
      
      if (!plateMaterialDetails) {
        console.warn(`Material details not found for plate type: ${plateType}`);
        continue; // Skip this color if material details are not found
      }
      
      // 3. Calculate plate cost
      const plateCost = plateArea * parseFloat(plateMaterialDetails.finalCostPerUnit || 0);
      totalPlateCost += plateCost;
      
      // 5. Fetch positive film material details
      const positiveFilmDetails = await fetchMaterialDetails("Positive Film");
      
      if (positiveFilmDetails) {
        const positiveFilmCost = plateArea * parseFloat(positiveFilmDetails.finalCostPerUnit || 0);
        totalPositiveFilmCost += positiveFilmCost;
      } else {
        console.warn("Material details not found for Positive Film");
      }
      
      // 8. Process color-specific costs
      
      // 8.1 Fetch ink cost from standard rates
      const inkDetails = await fetchStandardRate("INK", "PER PIECE");
      const inkCostPerUnit = inkDetails ? parseFloat(inkDetails.finalRate || 0) : 1; // Default to 1 if not found
      totalInkCost += inkCostPerUnit * totalCards; // Total ink cost for all cards
      
      // 8.2 Fetch MR cost from standard rates
      const mrType = colorDetail.mrType || "SIMPLE"; // Default to SIMPLE if not specified
      const mrDetails = await fetchStandardRate("LP MR", mrType);
      
      let mrCost = 0;
      if (mrDetails) {
        mrCost = parseFloat(mrDetails.finalRate || 0);
      } else {
        console.warn(`No MR details found for LP MR type: ${mrType}`);
        // Fallback values based on complexity
        if (mrType === "SIMPLE") mrCost = 50;
        else if (mrType === "COMPLEX") mrCost = 100;
        else if (mrType === "SUPER COMPLEX") mrCost = 200;
      }
      totalMRCost += mrCost;
      
      // 8.3 Fetch MKG (Making) cost from standard rates
      const mkgDetails = await fetchStandardRate("MKG", "LP PLATE");
      let mkgCost = 0;
      
      if (mkgDetails) {
        mkgCost = parseFloat(mkgDetails.finalRate || 0);
      } else {
        console.warn("No MKG details found for LP PLATE");
        mkgCost = 30; // Fallback value based on screenshot
      }
      totalMkgCost += mkgCost;
      
      // Add this color's cost to the total colors cost
      const thisColorCost = inkCostPerUnit + (mrCost / totalCards) + (mkgCost / totalCards);
      totalColorsCost += thisColorCost * totalCards; // Total cost for all cards for this color
    }
    
    // Calculate per card costs
    const lpPlateCostPerCard = totalPlateCost / totalCards;
    const lpPositiveFilmCostPerCard = totalPositiveFilmCost / totalCards;
    const lpInkCostPerCard = totalInkCost / totalCards;
    const lpMRCostPerCard = totalMRCost / totalCards;
    const lpMkgCostPerCard = totalMkgCost / totalCards;
    const lpTotalColorsCostPerCard = totalColorsCost / totalCards;
    
    // Calculate total LP cost per card
    const lpCostPerCard = 
      lpPlateCostPerCard + 
      lpPositiveFilmCostPerCard + 
      lpInkCostPerCard + 
      lpMRCostPerCard + 
      lpMkgCostPerCard;
    
    // Return all calculations with detailed breakdowns
    return {
      lpCostPerCard: lpCostPerCard.toFixed(2),
      lpPlateCostPerCard: lpPlateCostPerCard.toFixed(2),
      lpPositiveFilmCostPerCard: lpPositiveFilmCostPerCard.toFixed(2),
      lpInkCostPerCard: lpInkCostPerCard.toFixed(2),
      lpMRCostPerCard: lpMRCostPerCard.toFixed(2),
      lpMkgCostPerCard: lpMkgCostPerCard.toFixed(2),
      lpTotalColorsCostPerCard: lpTotalColorsCostPerCard.toFixed(2),
      // Additional info for debugging
      totalPlateCost: totalPlateCost.toFixed(2),
      totalPositiveFilmCost: totalPositiveFilmCost.toFixed(2),
      totalInkCost: totalInkCost.toFixed(2),
      totalMRCost: totalMRCost.toFixed(2),
      totalMkgCost: totalMkgCost.toFixed(2),
      totalColorsCost: totalColorsCost.toFixed(2),
      colorsCount: lpDetails.colorDetails.length
    };
  } catch (error) {
    console.error("Error calculating LP costs:", error);
    return { 
      error: "Error calculating LP costs",
      lpCostPerCard: "0.00",
      lpPlateCostPerCard: "0.00",
      lpPositiveFilmCostPerCard: "0.00",
      lpInkCostPerCard: "0.00",
      lpMRCostPerCard: "0.00",
      lpMkgCostPerCard: "0.00",
      lpTotalColorsCostPerCard: "0.00"
    };
  }
};