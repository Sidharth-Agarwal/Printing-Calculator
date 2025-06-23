import { fetchMaterialDetails } from '../../../../../../utils/fetchDataUtils';
import { fetchStandardRate } from '../../../../../../utils/dbFetchUtils';
import { getMarginsByJobType } from '../../../../../../utils/marginUtils';

/**
 * Calculates foil stamping (FS) costs based on form state
 * @param {Object} state - Form state containing FS details
 * @returns {Promise<Object>} - FS cost calculations
 */
export const calculateFSCosts = async (state) => {
  try {
    const { fsDetails, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const dieCode = orderAndPaper.dieCode;
    const jobType = orderAndPaper.jobType || "CARD";
    console.log("JOB TYPE being used : ", jobType)
    const fragsPerDie = orderAndPaper.frags || 1;
    const normalizedJobType = (jobType || "").toLowerCase();
    console.log("JOB TYPE being used : ", normalizedJobType)

    // Check if FS is used
    if (!fsDetails.isFSUsed || !fsDetails.foilDetails?.length) {
      return { 
        fsCostPerCard: "0.00",
        fsBlockCostPerCard: "0.00",
        fsFoilCostPerCard: "0.00",
        fsImpressionCostPerCard: "0.00",
        fsMRCostPerCard: "0.00",
        fsFreightCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !orderAndPaper.dieSize?.length || !orderAndPaper.dieSize?.breadth) {
      return { 
        error: "Missing required information for FS calculations",
        fsCostPerCard: "0.00",
        fsBlockCostPerCard: "0.00",
        fsFoilCostPerCard: "0.00",
        fsImpressionCostPerCard: "0.00",
        fsMRCostPerCard: "0.00",
        fsFreightCostPerCard: "0.00"
      };
    }

    // 1. Get margin values based on job type
    const margins = getMarginsByJobType(jobType);
    const lengthMargin = margins.lengthMargin;
    const breadthMargin = margins.breadthMargin;
    console.log("MARGINS : ", margins);
    
    // 1a. Fetch freight cost for blocks from standard rates
    const freightDetails = await fetchStandardRate("FREIGHT", "BLOCK");
    const freightCost = freightDetails ? parseFloat(freightDetails.finalRate || 0) : 500; // Default to 500 if not found
    
    // Initialize cost variables
    let totalBlockCost = 0;
    let totalFoilCost = 0;
    let totalImpressionCost = 0;
    let totalMRCost = 0;
    let totalFreightCost = 0;

    // Process each foil detail
    for (let i = 0; i < fsDetails.foilDetails.length; i++) {
      const foilDetail = fsDetails.foilDetails[i];
      
      // Calculate block area
      let blockArea = 0;
      
      if (foilDetail.blockSizeType === "Auto") {
        // First check if product size is available
        if (normalizedJobType === "envelope") {
          const productLengthCm = parseFloat(orderAndPaper.productSize.length) * 2.54;
          const productBreadthCm = parseFloat(orderAndPaper.productSize.breadth) * 2.54;
          console.log("Product length : ", productLengthCm)
          console.log("Product length : ", productBreadthCm)
          blockArea = (productLengthCm + lengthMargin) * (productBreadthCm + breadthMargin);
        }
        else if (normalizedJobType === "packaging") {
          const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
          const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
          console.log("Die length : ", dieLengthCm)
          console.log("Die length : ", dieBreadthCm)
          blockArea = (dieLengthCm + lengthMargin) * (dieBreadthCm + breadthMargin);
        }
        else if (normalizedJobType === "card" || normalizedJobType === "biz card" || normalizedJobType === "magnet" || normalizedJobType === "seal" || normalizedJobType === "liner" || normalizedJobType === "notebook") {
          if(fragsPerDie >= 2) {
            const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
            const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
            console.log("Die length : ", dieLengthCm)
            console.log("Die length : ", dieBreadthCm)
            blockArea = (dieLengthCm + lengthMargin) * (dieBreadthCm + breadthMargin);
          } else {
            const productLengthCm = parseFloat(orderAndPaper.productSize.length) * 2.54;
            const productBreadthCm = parseFloat(orderAndPaper.productSize.breadth) * 2.54;
            console.log("Product length : ", productLengthCm)
            console.log("Product length : ", productBreadthCm)
            blockArea = (productLengthCm + lengthMargin) * (productBreadthCm + breadthMargin);
          }
        }
      } else {
        // Otherwise use the provided block dimensions
        const providedLength = parseFloat(foilDetail.blockDimension.length)
        const providedBreadth = parseFloat(foilDetail.blockDimension.breadth)
        blockArea = (providedLength + lengthMargin) * (providedBreadth + breadthMargin);
      }
      
      // 2. Fetch block material details
      const blockType = foilDetail.blockType || "Magnesium Block 3MM";
      const blockMaterialDetails = await fetchMaterialDetails(blockType);
      console.log("block details: ", blockMaterialDetails)
      
      if (!blockMaterialDetails) {
        console.warn(`Material details not found for block type: ${blockType}`);
        continue; // Skip this foil if material details are not found
      }
      
      // 3. Calculate block cost and add freight
      const blockBaseCost = blockArea * parseFloat(blockMaterialDetails.landedCost || 0);
      totalBlockCost += blockBaseCost;
      totalFreightCost += freightCost;
      console.log("Block Cost : ", blockBaseCost)
      
      // 4. Fetch foil material details
      const foilType = foilDetail.foilType || "Gold MTS 220";
      const foilMaterialDetails = await fetchMaterialDetails(foilType);
      
      if (!foilMaterialDetails) {
        console.warn(`Material details not found for foil type: ${foilType}`);
        continue; // Skip this foil if material details are not found
      }
      
      // Calculate foil cost
      const foilCostPerUnit = parseFloat(foilMaterialDetails.finalCostPerUnit || 0);
      const foilCost = blockArea * foilCostPerUnit;
      console.log("Foil Cost Parse : ", parseFloat(foilMaterialDetails.finalCostPerUnit || 0))
      console.log("Foil Cost : ", foilCost)
      totalFoilCost += foilCost;
      
      // 5. Fetch impression cost from standard rates
      const impressionDetails = await fetchStandardRate("IMPRESSION", "FS");
      const impressionCostPerUnit = impressionDetails ? parseFloat(impressionDetails.finalRate || 0) : 1; // Default to 1 if not found
      console.log("FS Impression : ", impressionCostPerUnit);
      totalImpressionCost += impressionCostPerUnit / fragsPerDie; // Total impression cost for all cards
      console.log("FS impression cost : ", totalImpressionCost)
      
      // 6. Fetch MR cost from standard rates
      const mrType = foilDetail.mrType || "SIMPLE"; // Default to SIMPLE if not specified
      const mrDetails = await fetchStandardRate("FS MR", mrType);
      
      let mrCost = 0;
      if (mrDetails) {
        mrCost = parseFloat(mrDetails.finalRate || 0);
      } else {
        console.warn(`No MR details found for FS MR type: ${mrType}`);
        // Fallback values based on complexity
        if (mrType === "SIMPLE") mrCost = 300;
        else if (mrType === "COMPLEX") mrCost = 500;
        else if (mrType === "SUPER COMPLEX") mrCost = 750;
      }
      totalMRCost += mrCost;
    }
    
    // Calculate per card costs
    const fsBlockCostPerCard = totalBlockCost / totalCards;
    // Modified: Account for frags when calculating foil cost per card
    const fsFoilCostPerCard = totalFoilCost / fragsPerDie;
    const fsImpressionCostPerCard = totalImpressionCost;
    const fsMRCostPerCard = totalMRCost / totalCards;
    const fsFreightCostPerCard = totalFreightCost / totalCards;
    
    // Calculate total FS cost per card
    const fsCostPerCard = 
      fsBlockCostPerCard + 
      fsFoilCostPerCard + 
      fsImpressionCostPerCard + 
      fsMRCostPerCard +
      fsFreightCostPerCard;
    
    // Return all calculations with detailed breakdowns
    return {
      fsCostPerCard: fsCostPerCard.toFixed(2),
      fsBlockCostPerCard: fsBlockCostPerCard.toFixed(2),
      fsFoilCostPerCard: fsFoilCostPerCard.toFixed(2),
      fsImpressionCostPerCard: fsImpressionCostPerCard.toFixed(2),
      fsMRCostPerCard: fsMRCostPerCard.toFixed(2),
      fsFreightCostPerCard: fsFreightCostPerCard.toFixed(2),
      // Additional info for debugging
      totalBlockCost: totalBlockCost.toFixed(2),
      totalFoilCost: totalFoilCost.toFixed(2),
      totalImpressionCost: totalImpressionCost.toFixed(2),
      totalMRCost: totalMRCost.toFixed(2),
      totalFreightCost: totalFreightCost.toFixed(2),
      fragsPerDie: fragsPerDie, // Include frags per die for debugging
      foilsCount: fsDetails.foilDetails.length,
      lengthMargin: lengthMargin.toFixed(2), // Updated for debugging
      breadthMargin: breadthMargin.toFixed(2) // Updated for debugging
    };
  } catch (error) {
    console.error("Error calculating FS costs:", error);
    return { 
      error: "Error calculating FS costs",
      fsCostPerCard: "0.00",
      fsBlockCostPerCard: "0.00",
      fsFoilCostPerCard: "0.00",
      fsImpressionCostPerCard: "0.00",
      fsMRCostPerCard: "0.00",
      fsFreightCostPerCard: "0.00"
    };
  }
};