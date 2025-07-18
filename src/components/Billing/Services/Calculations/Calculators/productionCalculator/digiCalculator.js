import { fetchPaperDetails } from '../../../../../../utils/fetchDataUtils';
import { fetchStandardRate } from '../../../../../../utils/dbFetchUtils';
import { getMarginsByJobType } from '../../../../../../utils/marginUtils';

/**
 * Helper function to calculate maximum babies per sheet
 * @param {Object} digiSize - Digi dimensions (length and breadth in cm)
 * @param {Object} paperSize - Paper dimensions (length and breadth in cm)
 * @returns {Number} - Maximum number of babies per sheet
 */
const calculateMaxBabiesPerSheet = (digiSize, paperSize) => {
  const { length: digiLength, breadth: digiBreadth } = digiSize;
  const { length: paperLength, breadth: paperBreadth } = paperSize;

  // Calculate babies in length-wise orientation
  const babiesByLength =
    Math.floor(paperLength / digiLength) * Math.floor(paperBreadth / digiBreadth);
  
  // Calculate babies in breadth-wise orientation
  const babiesByBreadth =
    Math.floor(paperLength / digiBreadth) * Math.floor(paperBreadth / digiLength);

  // Return the maximum of the two orientations
  return Math.max(babiesByLength, babiesByBreadth);
};

/**
 * Calculates digital printing costs based on form state
 * @param {Object} state - Form state containing digital details
 * @returns {Promise<Object>} - Digital printing cost calculations
 */
export const calculateDigiDetailsCosts = async (state) => {
  try {
    const { digiDetails, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const jobType = orderAndPaper.jobType || "CARD";
    const fragsPerDie = orderAndPaper.frags || 1;

    // Check if digital printing is used
    if (!digiDetails.isDigiUsed) {
      return { 
        digiCostPerCard: "0.00",
        digiPrintCostPerCard: "0.00",
        digiPaperCostPerCard: "0.00",
        digiGilCutCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !digiDetails.digiDimensions || !orderAndPaper.dieSize || !orderAndPaper.paperName) {
      return { 
        error: "Missing required information for digital printing calculations",
        digiCostPerCard: "0.00",
        digiPrintCostPerCard: "0.00",
        digiPaperCostPerCard: "0.00",
        digiGilCutCostPerCard: "0.00"
      };
    }

    // PART 1: Calculations with respect to the paper selected
    
    // 1. Fetch paper details for the paper entered in the form
    const paperDetails = await fetchPaperDetails(orderAndPaper.paperName);
    if (!paperDetails) {
      return { 
        error: `Paper details not found for: ${orderAndPaper.paperName}`,
        digiCostPerCard: "0.00",
        digiPrintCostPerCard: "0.00",
        digiPaperCostPerCard: "0.00",
        digiGilCutCostPerCard: "0.00"
      };
    }
    
    // 2. Convert digi dimensions from inches to cm
    const digiDimensionsCm = {
      length: parseFloat(digiDetails.digiDimensions.length) * 2.54,
      breadth: parseFloat(digiDetails.digiDimensions.breadth) * 2.54
    };
    
    // 3. Calculate maximum babies per sheet for paper
    const paperSize = {
      length: parseFloat(paperDetails.length),
      breadth: parseFloat(paperDetails.breadth)
    };
    
    const maxBabiesPerSheetPaper = calculateMaxBabiesPerSheet(digiDimensionsCm, paperSize);
    
    // PART 2: Calculations with respect to the die selected
    
    // 1. Get margin values based on job type
    const margins = getMarginsByJobType(jobType);
    const lengthMargin = margins.lengthMargin;
    const breadthMargin = margins.breadthMargin;
    console.log("MARGINS : ", margins);
    
    // 2. Convert die size from inches to cm and add margins
    const dieWithMargin = {
      length: (parseFloat(orderAndPaper.dieSize.length) * 2.54) + lengthMargin,
      breadth: (parseFloat(orderAndPaper.dieSize.breadth) * 2.54) + breadthMargin
    };
    
    // 3. Calculate maximum babies per sheet for die
    const maxBabiesPerSheetDie = calculateMaxBabiesPerSheet(dieWithMargin, digiDimensionsCm);
    console.log(maxBabiesPerSheetPaper)
    console.log(maxBabiesPerSheetDie)
    
    // Calculate total fragments per sheet
    const totalFragsPerSheet = maxBabiesPerSheetPaper * maxBabiesPerSheetDie;
    
    // Calculate total sheets required
    const totalSheets = Math.ceil(totalCards / totalFragsPerSheet);
    
    // UPDATED: Fetch digital print rate from standard rates instead of papers DB
    const digitalPrintRate = await fetchStandardRate('DIGITAL', 'PRINT');
    const digitalPrintRateValue = digitalPrintRate ? 
      parseFloat(digitalPrintRate.finalRate) : 
      20.0; // Default rate if not found (using value from screenshot)
    console.log("Digital printing rate : ",digitalPrintRate.finalRate)
    
    // Fetch GIL CUT rate
    const gilCutRate = await fetchStandardRate('GIL CUT', 'PER SHEET');
    const gilCutCostPerSheet = gilCutRate ? 
      parseFloat(gilCutRate.finalRate) : 
      0.25; // Default if not found
    
    // Calculate Digital Print cost per card (from standard rates)
    const digiPrintCostPerCard = digitalPrintRateValue / maxBabiesPerSheetDie;
    
    // Calculate Digital Paper cost components
    const paperCostPerCard = (parseFloat(paperDetails.finalRate) * totalSheets) / totalCards;
    const gilCutCostPerCard = gilCutCostPerSheet / fragsPerDie;
    
    // Total Digital Paper cost per card
    const digiPaperCostPerCard = (paperCostPerCard) / fragsPerDie;
    
    // Total Digital Printing cost per card
    const digiCostPerCard = digiPrintCostPerCard + digiPaperCostPerCard + gilCutCostPerCard;
    
    return {
      digiCostPerCard: digiCostPerCard.toFixed(2),
      digiPrintCostPerCard: digiPrintCostPerCard.toFixed(2),
      digiPaperCostPerCard: digiPaperCostPerCard.toFixed(2),
      digiGilCutCostPerCard: gilCutCostPerCard.toFixed(2),
      // Additional info for debugging or display
      maxBabiesPerSheetPaper,
      maxBabiesPerSheetDie,
      totalFragsPerSheet,
      totalSheets,
      paperRate: parseFloat(paperDetails.finalRate).toFixed(2),
      digitalPrintRate: digitalPrintRateValue.toFixed(2),
      gilCutRate: gilCutCostPerSheet.toFixed(2),
      lengthMargin: lengthMargin.toFixed(2), // Updated for debugging
      breadthMargin: breadthMargin.toFixed(2) // Updated for debugging
    };
  } catch (error) {
    console.error("Error calculating digital printing costs:", error);
    return { 
      error: "Error calculating digital printing costs",
      digiCostPerCard: "0.00",
      digiPrintCostPerCard: "0.00",
      digiPaperCostPerCard: "0.00",
      digiGilCutCostPerCard: "0.00"
    };
  }
};