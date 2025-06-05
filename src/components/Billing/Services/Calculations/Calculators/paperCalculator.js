import { fetchPaperDetails } from '../../../../../utils/fetchDataUtils';
import { fetchStandardRate } from '../../../../../utils/dbFetchUtils';
import { getMarginsByJobType } from '../../../../../utils/marginUtils';
import { db } from '../../../../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
 * Helper function to calculate maximum cards per sheet
 * @param {Object} dieSize - Die dimensions (length and breadth in cm)
 * @param {Object} paperSize - Paper dimensions (length and breadth in cm)
 * @returns {Number} - Maximum number of cards per sheet
 */
const calculateMaxCardsPerSheet = (dieSize, paperSize) => {
  const { length: dieLength, breadth: dieBreadth } = dieSize;
  const { length: paperLength, breadth: paperBreadth } = paperSize;

  // Calculate cards in length-wise orientation
  const cardsByLength =
    Math.floor(paperLength / dieLength) * Math.floor(paperBreadth / dieBreadth);
  
  // Calculate cards in breadth-wise orientation
  const cardsByBreadth =
    Math.floor(paperLength / dieBreadth) * Math.floor(paperBreadth / dieLength);

  // Return the maximum of the two orientations
  return Math.max(cardsByLength, cardsByBreadth);
};

/**
 * Calculates paper and cutting costs
 * @param {Object} state - Form state containing order and paper details
 * @returns {Promise<Object>} - Paper and cutting cost calculations
 */
export const calculatePaperAndCuttingCosts = async (state) => {
  try {
    const { orderAndPaper, notebookDetails } = state;
    const paperName = orderAndPaper.paperName;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const dieCode = orderAndPaper.dieCode;
    const jobType = orderAndPaper.jobType;
    
    // Check if we're dealing with a notebook job type
    const isNotebookJob = jobType === "Notebook" && notebookDetails?.isNotebookUsed;
    
    // Validate required inputs
    if (!paperName || !totalCards || 
        (!isNotebookJob && (!orderAndPaper.dieSize.length || !orderAndPaper.dieSize.breadth)) ||
        (isNotebookJob && (!notebookDetails.calculatedLength || !notebookDetails.calculatedBreadth))) {
      return { 
        error: "Missing required information for paper calculations",
        paperCostPerCard: "0.00",
        gilCutCostPerCard: "0.00",
        paperAndCuttingCostPerCard: "0.00"
      };
    }

    // 1. Fetch paper details from database
    const paperDetails = await fetchPaperDetails(paperName);
    if (!paperDetails) {
      return { 
        error: `Paper details not found for: ${paperName}`,
        paperCostPerCard: "0.00",
        gilCutCostPerCard: "0.00",
        paperAndCuttingCostPerCard: "0.00"
      };
    }

    // 2. Fetch GIL CUT rate from standard rates
    const gilCutRate = await fetchStandardRate('GIL CUT', 'PER SHEET');
    const gilCutCostPerSheet = gilCutRate ? parseFloat(gilCutRate.finalRate) : 0.25; // Default if not found

    // 3. Get margin values based on job type
    const margins = getMarginsByJobType(jobType || "CARD");
    const lengthMargin = margins.lengthMargin;
    const breadthMargin = margins.breadthMargin;
    console.log("MARGINS : ", margins);

    // 4. Get dimensions based on job type
    let dieSize = {};
    
    if (isNotebookJob) {
      // For notebooks, use the calculated dimensions from notebook details
      dieSize = {
        length: (parseFloat(notebookDetails.calculatedLength) * 2.54) + lengthMargin,
        breadth: (parseFloat(notebookDetails.calculatedBreadth) * 2.54) + breadthMargin,
      };
    } else {
      // For regular jobs, use the die dimensions
      dieSize = {
        length: (parseFloat(orderAndPaper.dieSize.length) * 2.54) + lengthMargin,
        breadth: (parseFloat(orderAndPaper.dieSize.breadth) * 2.54) + breadthMargin,
      };
    }

    // 5. Get paper dimensions (already in cm)
    const paperSize = {
      length: parseFloat(paperDetails.length),
      breadth: parseFloat(paperDetails.breadth),
    };

    // 6. Calculate maximum cards per sheet
    const maxCardsPerSheet = calculateMaxCardsPerSheet(dieSize, paperSize);
    
    // 7. Determine frags per die
    let fragsPerDie = 1; // Default to 1
    
    if (isNotebookJob) {
      // For notebooks, hardcode fragsPerDie to 1
      fragsPerDie = 1;
    } else if (dieCode) {
      // For other job types, fetch die details to get frags
      const dieDetails = await fetchDieDetails(dieCode);
      if (dieDetails && dieDetails.frags) {
        fragsPerDie = parseInt(dieDetails.frags) || 1;
      }
    }

    // Calculate total frags per sheet
    const totalFragsPerSheet = maxCardsPerSheet * fragsPerDie;
    
    // 8. Calculate total sheets required
    const totalSheetsRequired = Math.ceil(totalCards / totalFragsPerSheet);

    // 9. Calculate costs
    const paperCost = totalSheetsRequired * parseFloat(paperDetails.finalRate);
    const gilCutCost = gilCutCostPerSheet * totalSheetsRequired;
    
    // 10. Calculate per card costs
    const paperCostPerCard = paperCost / totalCards;
    const gilCutCostPerCard = gilCutCost / totalCards;
    const paperAndCuttingCostPerCard = paperCostPerCard + gilCutCostPerCard;

    // 11. Return the final calculations
    return {
      paperCostPerCard: paperCostPerCard.toFixed(2),
      gilCutCostPerCard: gilCutCostPerCard.toFixed(2),
      paperAndCuttingCostPerCard: paperAndCuttingCostPerCard.toFixed(2),
      // Additional info for debugging or display
      maxCardsPerSheet,
      totalSheetsRequired,
      totalFragsPerSheet, // Pass this for notebook calculator
      paperRate: parseFloat(paperDetails.finalRate).toFixed(2),
      gilCutRate: gilCutCostPerSheet.toFixed(2),
      fragsPerDie,
      lengthMargin: lengthMargin.toFixed(2), // Updated for debugging
      breadthMargin: breadthMargin.toFixed(2) // Updated for debugging
    };
  } catch (error) {
    console.error("Error calculating paper and cutting costs:", error);
    return { 
      error: "Error calculating paper and cutting costs",
      paperCostPerCard: "0.00",
      gilCutCostPerCard: "0.00",
      paperAndCuttingCostPerCard: "0.00"
    };
  }
};