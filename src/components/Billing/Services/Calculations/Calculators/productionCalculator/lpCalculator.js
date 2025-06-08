import { fetchMaterialDetails } from '../../../../../../utils/fetchDataUtils';
import { fetchStandardRate } from '../../../../../../utils/dbFetchUtils';
import { getMarginsByJobType } from '../../../../../../utils/marginUtils';
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
 * Calculates letter press (LP) costs based on form state
 * @param {Object} state - Form state containing LP details
 * @returns {Promise<Object>} - LP cost calculations
 */
export const calculateLPCosts = async (state) => {
  try {
    const { lpDetails, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const dieCode = orderAndPaper.dieCode;
    const jobType = orderAndPaper.jobType || "CARD";

    // Check if LP is used
    if (!lpDetails.isLPUsed || !lpDetails.colorDetails?.length) {
      return { 
        lpCostPerCard: "0.00",
        lpPlateCostPerCard: "0.00",
        lpPositiveFilmCostPerCard: "0.00",
        lpInkCostPerCard: "0.00",
        lpMRCostPerCard: "0.00",
        lpMkgCostPerCard: "0.00",
        lpImpressionCostPerCard: "0.00", // Add impression cost field
        lpDstMaterialCostPerCard: "0.00", // Add DST material cost field
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
        lpImpressionCostPerCard: "0.00", // Add impression cost field
        lpDstMaterialCostPerCard: "0.00", // Add DST material cost field
        lpTotalColorsCostPerCard: "0.00"
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
        console.log("LP Frags per die:", fragsPerDie);
      }
    }

    // 1. Get margin values based on job type
    const margins = getMarginsByJobType(jobType);
    const lengthMargin = margins.lengthMargin;
    const breadthMargin = margins.breadthMargin;
    console.log("MARGINS : ", margins);
    
    // Initialize cost variables
    let totalPlateCost = 0;
    let totalPositiveFilmCost = 0;
    let totalInkCost = 0;
    let totalMRCost = 0;
    let totalMkgCost = 0;
    let totalImpressionCost = 0; // Add impression cost tracking
    let totalDstMaterialCost = 0; // Add DST material cost tracking
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
          plateArea = (productLengthCm + lengthMargin) * (productBreadthCm + breadthMargin);
        } else if (orderAndPaper.dieSize) {
          // Fall back to die dimensions if product size is not available
          const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
          const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
          plateArea = (dieLengthCm + lengthMargin) * (dieBreadthCm + breadthMargin);
        }
      } else {
        // Otherwise use the provided plate dimensions
        const providedLength = parseFloat(colorDetail.plateDimensions.length)
        const providedBreadth = parseFloat(colorDetail.plateDimensions.breadth)
        plateArea = (providedLength + lengthMargin) * (providedBreadth + breadthMargin);
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
      
      // 4. Fetch DST material details and calculate cost
      if (colorDetail.dstMaterial) {
        const dstMaterialDetails = await fetchMaterialDetails(colorDetail.dstMaterial);
        if (dstMaterialDetails) {
          // Calculate DST material cost based on plate area
          const dstMaterialCost = plateArea * parseFloat(dstMaterialDetails.finalCostPerUnit || 0);
          totalDstMaterialCost += dstMaterialCost;
        } else {
          console.warn(`Material details not found for DST material: ${colorDetail.dstMaterial}`);
        }
      }
      
      // 5. Fetch positive film material details
      const positiveFilmDetails = await fetchMaterialDetails("Positive Film");
      
      if (positiveFilmDetails) {
        const positiveFilmCost = plateArea * parseFloat(positiveFilmDetails.finalCostPerUnit || 0);
        totalPositiveFilmCost += positiveFilmCost;
      } else {
        console.warn("Material details not found for Positive Film");
      }
      
      // 6. Process color-specific costs
      
      // 6.1 Fetch ink cost from standard rates
      const inkDetails = await fetchStandardRate("INK", "PER PIECE");
      const inkCostPerUnit = inkDetails ? parseFloat(inkDetails.finalRate || 0) : 1; // Default to 1 if not found
      totalInkCost += inkCostPerUnit * totalCards; // Total ink cost for all cards
      
      // 6.2 Fetch impression cost from standard rates
      const impressionDetails = await fetchStandardRate("IMPRESSION", "LP");
      const impressionCostPerUnit = impressionDetails ? parseFloat(impressionDetails.finalRate || 0) : 1; // Default to 1 if not found
      const impressionCostPerCard = impressionCostPerUnit / fragsPerDie;
      totalImpressionCost += impressionCostPerCard; // Total impression cost for all cards
      console.log("LP total impresion cost per unit : ", impressionCostPerUnit)
      
      // 6.3 Fetch MR cost from standard rates
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
      
      // 6.4 Fetch MKG (Making) cost from standard rates
      const mkgDetails = await fetchStandardRate("MKG", "LP PLATE");
      let mkgCost = 0;
      
      if (mkgDetails) {
        mkgCost = parseFloat(mkgDetails.finalRate || 0);
      } else {
        console.warn("No MKG details found for LP PLATE");
        mkgCost = 30; // Fallback value based on screenshot
      }
      totalMkgCost += mkgCost;
      
      // Add this color's cost to the total colors cost (updated with impression cost)
      const thisColorCost = inkCostPerUnit + impressionCostPerUnit + (mrCost / totalCards) + (mkgCost / totalCards);
      totalColorsCost += thisColorCost * totalCards; // Total cost for all cards for this color
    }
    
    // Calculate per card costs
    const lpPlateCostPerCard = totalPlateCost / totalCards;
    const lpPositiveFilmCostPerCard = totalPositiveFilmCost / totalCards;
    const lpInkCostPerCard = totalInkCost / totalCards;
    const lpImpressionCostPerCard = totalImpressionCost; // Add impression cost per card
    const lpMRCostPerCard = totalMRCost / totalCards;
    const lpMkgCostPerCard = totalMkgCost / totalCards;
    const lpDstMaterialCostPerCard = totalDstMaterialCost / totalCards;
    const lpTotalColorsCostPerCard = totalColorsCost / totalCards;
    
    // Calculate total LP cost per card (updated to include impression cost)
    const lpCostPerCard = 
      lpPlateCostPerCard + 
      lpPositiveFilmCostPerCard + 
      lpInkCostPerCard + 
      lpImpressionCostPerCard + // Include impression cost
      lpMRCostPerCard + 
      lpMkgCostPerCard + 
      lpDstMaterialCostPerCard; // Include DST material cost
    
    // Return all calculations with detailed breakdowns
    return {
      lpCostPerCard: lpCostPerCard.toFixed(2),
      lpPlateCostPerCard: lpPlateCostPerCard.toFixed(2),
      lpPositiveFilmCostPerCard: lpPositiveFilmCostPerCard.toFixed(2),
      lpInkCostPerCard: lpInkCostPerCard.toFixed(2),
      lpImpressionCostPerCard: lpImpressionCostPerCard.toFixed(2), // Include impression cost
      lpMRCostPerCard: lpMRCostPerCard.toFixed(2),
      lpMkgCostPerCard: lpMkgCostPerCard.toFixed(2),
      lpDstMaterialCostPerCard: lpDstMaterialCostPerCard.toFixed(2), // Include DST material cost
      lpTotalColorsCostPerCard: lpTotalColorsCostPerCard.toFixed(2),
      // Additional info for debugging
      totalPlateCost: totalPlateCost.toFixed(2),
      totalPositiveFilmCost: totalPositiveFilmCost.toFixed(2),
      totalInkCost: totalInkCost.toFixed(2),
      totalImpressionCost: totalImpressionCost.toFixed(2), // Include total impression cost
      totalMRCost: totalMRCost.toFixed(2),
      totalMkgCost: totalMkgCost.toFixed(2),
      totalDstMaterialCost: totalDstMaterialCost.toFixed(2), // Include DST material cost
      totalColorsCost: totalColorsCost.toFixed(2),
      colorsCount: lpDetails.colorDetails.length,
      fragsPerDie: fragsPerDie, // Include frags per die for debugging
      lengthMargin: lengthMargin.toFixed(2), // Updated for debugging
      breadthMargin: breadthMargin.toFixed(2) // Updated for debugging
    };
  } catch (error) {
    console.error("Error calculating LP costs:", error);
    return { 
      error: "Error calculating LP costs",
      lpCostPerCard: "0.00",
      lpPlateCostPerCard: "0.00",
      lpPositiveFilmCostPerCard: "0.00",
      lpInkCostPerCard: "0.00",
      lpImpressionCostPerCard: "0.00", // Include impression cost
      lpMRCostPerCard: "0.00",
      lpMkgCostPerCard: "0.00",
      lpDstMaterialCostPerCard: "0.00", // Include DST material cost
      lpTotalColorsCostPerCard: "0.00"
    };
  }
};