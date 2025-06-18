import { fetchStandardRate } from "../../../../../../utils/dbFetchUtils";
import { fetchMaterialDetails } from "../../../../../../utils/fetchDataUtils";
import { getMarginsByJobType } from "../../../../../../utils/marginUtils";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../../../firebaseConfig';

/**
 * Fetch die details from Firestore database to get the frags value
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
 * Calculates fold and paste costs based on form state
 * @param {Object} state - Form state containing fold and paste details
 * @returns {Promise<Object>} - Fold and paste cost calculations
 */
export const calculateFoldAndPasteCosts = async (state) => {
  try {
    const { foldAndPaste, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const dieCode = orderAndPaper.dieCode;
    const jobType = orderAndPaper.jobType || "CARD";
    const fragsPerDie = orderAndPaper.frags || 1;

    // Check if fold and paste is used
    if (!foldAndPaste || !foldAndPaste.isFoldAndPasteUsed) {
      return { 
        foldAndPasteCostPerCard: "0.00",
        dstMaterialCostPerCard: "0.00",
        foldAndPasteOperationCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !foldAndPaste.dstMaterial || !foldAndPaste.dstType || !dieCode) {
      return { 
        error: "Missing required information for fold and paste calculations",
        foldAndPasteCostPerCard: "0.00",
        dstMaterialCostPerCard: "0.00",
        foldAndPasteOperationCostPerCard: "0.00"
      };
    }

    // 1. Fetch die details to get the frags value
    const dieDetails = await fetchDieDetails(dieCode);
    if (!dieDetails) {
      return {
        error: `Die details not found for code: ${dieCode}`,
        foldAndPasteCostPerCard: "0.00",
        dstMaterialCostPerCard: "0.00",
        foldAndPasteOperationCostPerCard: "0.00"
      };
    }

    // 2. Get margin values based on job type
    const margins = getMarginsByJobType(jobType);
    const lengthMargin = margins.lengthMargin;
    const breadthMargin = margins.breadthMargin;
    console.log("MARGINS : ", margins);

    // 3. Calculate plate area for DST material
    let plateArea = 0;
    
    // First check if product size is available
    if (orderAndPaper.productSize && orderAndPaper.productSize.length && orderAndPaper.productSize.breadth) {
      const productLengthCm = parseFloat(orderAndPaper.productSize.length) * 2.54;
      const productBreadthCm = parseFloat(orderAndPaper.productSize.breadth) * 2.54;
      plateArea = (productLengthCm + lengthMargin) * (productBreadthCm + breadthMargin);
    } else if (orderAndPaper.dieSize && orderAndPaper.dieSize.length && orderAndPaper.dieSize.breadth) {
      // Fall back to die dimensions if product size is not available
      const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
      const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
      plateArea = (dieLengthCm + lengthMargin) * (dieBreadthCm + breadthMargin);
    } else {
      return {
        error: "Missing dimensions for DST material area calculation",
        foldAndPasteCostPerCard: "0.00",
        dstMaterialCostPerCard: "0.00",
        foldAndPasteOperationCostPerCard: "0.00"
      };
    }

    // 4. Fetch DST material details from materials DB
    const dstMaterialDetails = await fetchMaterialDetails(foldAndPaste.dstMaterial);
    
    if (!dstMaterialDetails) {
      return {
        error: `DST material details not found for: ${foldAndPaste.dstMaterial}`,
        foldAndPasteCostPerCard: "0.00",
        dstMaterialCostPerCard: "0.00",
        foldAndPasteOperationCostPerCard: "0.00"
      };
    }

    // 5. Calculate material cost based on area and material cost per unit
    const materialCostPerUnit = parseFloat(dstMaterialDetails.finalCostPerUnit || 0);
    const totalMaterialCost = plateArea * materialCostPerUnit;
    
    // 6. Fetch DST type rate from standard rates for operation cost
    const dstTypeDetails = await fetchStandardRate("DST", foldAndPaste.dstType);
    
    if (!dstTypeDetails) {
      return {
        error: `DST operation rate details not found for type: ${foldAndPaste.dstType}`,
        foldAndPasteCostPerCard: "0.00",
        dstMaterialCostPerCard: "0.00",
        foldAndPasteOperationCostPerCard: "0.00"
      };
    }

    // 7. Get the operation cost per card from the standard rates
    const operationCostPerCard = parseFloat(dstTypeDetails.finalRate || 0);
    
    // 8. Calculate total fold and paste cost per card
    // Now using the formula: (totalMaterialCost + operationCostPerCard) * fragsPerDie
    const totalMaterialCostPerCard = totalMaterialCost / fragsPerDie;
    operationCost = operationCostPerCard / fragsPerDie
    // const totalFoldAndPasteBaseCost = totalMaterialCostPerCard + operationCost;
    const totalFoldAndPasteCostPerCard = (totalMaterialCostPerCard + operationCost);
    
    return {
      foldAndPasteCostPerCard: totalFoldAndPasteCostPerCard.toFixed(2),
      dstMaterialCostPerCard: totalMaterialCostPerCard.toFixed(2),
      foldAndPasteOperationCostPerCard: operationCost.toFixed(2),
      // Additional info for debugging
      fragsPerDie: fragsPerDie,
      plateArea: plateArea.toFixed(2),
      dstMaterial: foldAndPaste.dstMaterial,
      dstType: foldAndPaste.dstType,
      materialCostPerUnit: materialCostPerUnit.toFixed(2),
      lengthMargin: lengthMargin.toFixed(2), // Updated for debugging
      breadthMargin: breadthMargin.toFixed(2) // Updated for debugging
    };
  } catch (error) {
    console.error("Error calculating fold and paste costs:", error);
    return { 
      error: "Error calculating fold and paste costs",
      foldAndPasteCostPerCard: "0.00",
      dstMaterialCostPerCard: "0.00",
      foldAndPasteOperationCostPerCard: "0.00"
    };
  }
};