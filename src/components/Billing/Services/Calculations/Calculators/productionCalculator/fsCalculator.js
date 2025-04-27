import { fetchMaterialDetails } from '../../../../../../utils/fetchDataUtils';
import { fetchStandardRate, fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../../firebaseConfig';

/**
 * Fetch die details from Firestore database
 * @param {string} dieCode - Die code to look up
 * @returns {Promise<Object|null>} - The die details or null if not found
 */
const fetchDieDetails = async (dieCode) => {
  try {
    const diesCollection = collection(db, "dies");
    const q = query(diesCollection, where("dieCode", "==", dieCode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    console.warn(`Die not found for code: ${dieCode}`);
    return null;
  } catch (error) {
    console.error("Error fetching die details:", error);
    return null;
  }
};

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

    // NEW STEP: Fetch die details to get frags
    let dieDetails = null;
    let fragsPerDie = 1; // Default to 1 if not found
    
    if (dieCode) {
      dieDetails = await fetchDieDetails(dieCode);
      console.log("Die details:", dieDetails);
      if (dieDetails && dieDetails.frags) {
        fragsPerDie = parseInt(dieDetails.frags) || 1;
        console.log("Frags per die:", fragsPerDie);
      }
    }

    // 1. Fetch margin value from overheads
    const marginValue = await fetchOverheadValue('MARGIN');
    const margin = marginValue ? parseFloat(marginValue.value) : 2; // Default margin if not found
    
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
        if (orderAndPaper.productSize && orderAndPaper.productSize.length && orderAndPaper.productSize.breadth) {
          const productLengthCm = parseFloat(orderAndPaper.productSize.length) * 2.54;
          const productBreadthCm = parseFloat(orderAndPaper.productSize.breadth) * 2.54;
          blockArea = (productLengthCm + margin) * (productBreadthCm + margin);
        } else if (orderAndPaper.dieSize) {
          // Fall back to die dimensions if product size is not available
          const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
          const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
          blockArea = (dieLengthCm + margin) * (dieBreadthCm + margin);
        }
      } else {
        // Otherwise use the provided block dimensions
        blockArea = parseFloat(foilDetail.blockDimension.length) * parseFloat(foilDetail.blockDimension.breadth);
      }
      
      // 2. Fetch block material details
      const blockType = foilDetail.blockType || "Magnesium Block 3MM";
      const blockMaterialDetails = await fetchMaterialDetails(blockType);
      
      if (!blockMaterialDetails) {
        console.warn(`Material details not found for block type: ${blockType}`);
        continue; // Skip this foil if material details are not found
      }
      
      // 3. Calculate block cost and add freight
      const blockBaseCost = blockArea * parseFloat(blockMaterialDetails.landedCost || 0);
      totalBlockCost += blockBaseCost;
      totalFreightCost += freightCost;
      
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
      totalFoilCost += foilCost;
      
      // 5. Fetch impression cost from standard rates
      const impressionDetails = await fetchStandardRate("IMPRESSION", "FS");
      const impressionCostPerUnit = impressionDetails ? parseFloat(impressionDetails.finalRate || 0) : 1; // Default to 1 if not found
      totalImpressionCost += impressionCostPerUnit * totalCards; // Total impression cost for all cards
      
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
    const fsImpressionCostPerCard = totalImpressionCost / totalCards;
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
      fragsPerDie: fragsPerDie,
      foilsCount: fsDetails.foilDetails.length
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