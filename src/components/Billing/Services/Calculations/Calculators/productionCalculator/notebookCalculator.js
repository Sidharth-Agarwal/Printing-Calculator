import { fetchPaperDetails } from '../../../../../../utils/fetchDataUtils';
import { fetchStandardRate } from '../../../../../../utils/dbFetchUtils';

/**
 * Calculates notebook costs based on form state
 * @param {Object} state - Form state containing notebook details
 * @returns {Promise<Object>} - Notebook cost calculations
 */
export const calculateNotebookCosts = async (state) => {
  try {
    const { notebookDetails, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const paperCalculations = state.paperCalculations || {}; // Get paper calculations if available

    // Check if notebook is used
    if (!notebookDetails?.isNotebookUsed) {
      return { 
        notebookCostPerCard: "0.00",
        notebookPagesCostPerCard: "0.00",
        notebookBindingCostPerCard: "0.00",
        totalFormaPossible: 0,
        totalPages: 0,
        totalFormaRequired: 0,
        totalSheets: 0
      };
    }

    // Validate required inputs
    if (!totalCards || !notebookDetails.calculatedLength || !notebookDetails.calculatedBreadth || 
        !notebookDetails.numberOfPages || !notebookDetails.bindingType || !notebookDetails.paperName) {
      return { 
        error: "Missing required information for notebook calculations",
        notebookCostPerCard: "0.00",
        notebookPagesCostPerCard: "0.00",
        notebookBindingCostPerCard: "0.00"
      };
    }

    // 1. Convert calculated dimensions from inches to cm
    const calculatedLengthCm = parseFloat(notebookDetails.calculatedLength) * 2.54;
    const calculatedBreadthCm = parseFloat(notebookDetails.calculatedBreadth) * 2.54;
    
    // 2. Calculate possible number of forma (round up to ceiling)
    const numberOfPages = parseInt(notebookDetails.numberOfPages, 10);
    const possibleNumberOfForma = parseInt(notebookDetails.numberOfPages, 10);
    
    // 3. Calculate total pages (possible forma * 4)
    const totalPages = possibleNumberOfForma * 4;
    
    // 4. Calculate total forma required (quantity * possible forma)
    const totalFormaRequired = totalCards * possibleNumberOfForma;
    
    // 5. Get totalFragsPerSheet from paper calculations
    const totalFragsPerSheet = paperCalculations.totalFragsPerSheet || 1;
    
    // 6. Calculate total sheets required
    const totalSheets = Math.ceil(totalFormaRequired / totalFragsPerSheet);
    
    // 7. Fetch paper details for the notebook's paper
    const paperDetails = await fetchPaperDetails(notebookDetails.paperName);
    if (!paperDetails) {
      return { 
        error: `Paper details not found for: ${notebookDetails.paperName}`,
        notebookCostPerCard: "0.00",
        notebookPagesCostPerCard: "0.00",
        notebookBindingCostPerCard: "0.00"
      };
    }
    
    // 8. Calculate cost of 1 forma (paper price / totalFragsPerSheet)
    const paperRate = parseFloat(paperDetails.finalRate);
    const costOf1Forma = paperRate / totalFragsPerSheet;
    
    // 9. Calculate cost of pages per notebook (cost of 1 forma * possible forma)
    const costOfPagesPerNotebook = costOf1Forma * possibleNumberOfForma;
    
    // 10. Fetch binding cost from standard rates
    const bindingType = notebookDetails.bindingTypeConcatenated || `BINDING ${notebookDetails.bindingType}`;
    const bindingDetails = await fetchStandardRate("BINDING", notebookDetails.bindingType);
    
    let bindingCost = 0;
    if (bindingDetails) {
      bindingCost = parseFloat(bindingDetails.finalRate || 0);
    } else {
      console.warn(`No binding details found for binding type: ${notebookDetails.bindingType}`);
      // Fallback value
      bindingCost = 10; 
    }
    
    // 11. Calculate total notebook cost per card (pages cost + binding cost)
    const notebookCostPerCard = costOfPagesPerNotebook + bindingCost;
    
    // 12. Return the final calculations
    return {
      notebookCostPerCard: notebookCostPerCard.toFixed(2),
      notebookPagesCostPerCard: costOfPagesPerNotebook.toFixed(2),
      notebookBindingCostPerCard: bindingCost.toFixed(2),
      // Additional info for debugging or display
      possibleNumberOfForma,
      totalPages,
      totalFormaRequired,
      totalSheets,
      costOf1Forma: costOf1Forma.toFixed(2),
      paperRate: paperRate.toFixed(2),
      bindingCost: bindingCost.toFixed(2),
      bindingType
    };
  } catch (error) {
    console.error("Error calculating notebook costs:", error);
    return { 
      error: "Error calculating notebook costs",
      notebookCostPerCard: "0.00",
      notebookPagesCostPerCard: "0.00",
      notebookBindingCostPerCard: "0.00"
    };
  }
};