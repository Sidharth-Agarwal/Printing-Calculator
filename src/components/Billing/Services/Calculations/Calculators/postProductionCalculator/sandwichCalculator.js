import { fetchMaterialDetails } from '../../../../../../utils/fetchDataUtils';
import { fetchStandardRate, fetchOverheadValue } from '../../../../../../utils/dbFetchUtils';
import { calculateLPCosts } from '../productionCalculator/lpCalculator';
import { calculateFSCosts } from '../productionCalculator/fsCalculator';
import { calculateEMBCosts } from '../productionCalculator/embCalculator';

/**
 * Calculates sandwich/duplex costs based on form state
 * @param {Object} state - Form state containing sandwich details
 * @returns {Promise<Object>} - Sandwich cost calculations
 */
export const calculateSandwichCosts = async (state) => {
  try {
    const { sandwich, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);

    // Check if Sandwich/Duplex is used
    if (!sandwich.isSandwichComponentUsed) {
      return { 
        lpCostPerCardSandwich: "0.00",
        fsCostPerCardSandwich: "0.00",
        embCostPerCardSandwich: "0.00",
        sandwichCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !orderAndPaper.dieSize?.length || !orderAndPaper.dieSize?.breadth) {
      return { 
        error: "Missing required information for Sandwich calculations",
        lpCostPerCardSandwich: "0.00",
        fsCostPerCardSandwich: "0.00",
        embCostPerCardSandwich: "0.00",
        sandwichCostPerCard: "0.00"
      };
    }

    // Prepare temporary state for each service
    const prepareSandwichServiceState = (service, mainState) => {
      const sandwichDetails = mainState.sandwich?.[`${service}DetailsSandwich`];
      
      if (!sandwichDetails?.isLPUsed && !sandwichDetails?.isFSUsed && !sandwichDetails?.isEMBUsed) {
        return null;
      }

      // Create a modified state for calculating individual service costs
      const serviceState = {
        ...mainState,
        lpDetails: service === 'lp' ? {
          ...sandwichDetails,
          isLPUsed: sandwichDetails.isLPUsed,
          noOfColors: sandwichDetails.noOfColors,
          colorDetails: sandwichDetails.colorDetails
        } : { isLPUsed: false },
        fsDetails: service === 'fs' ? {
          ...sandwichDetails,
          isFSUsed: sandwichDetails.isFSUsed,
          fsType: sandwichDetails.fsType,
          foilDetails: sandwichDetails.foilDetails
        } : { isFSUsed: false },
        embDetails: service === 'emb' ? {
          ...sandwichDetails,
          isEMBUsed: sandwichDetails.isEMBUsed,
          plateSizeType: sandwichDetails.plateSizeType,
          plateDimensions: sandwichDetails.plateDimensions,
          plateTypeMale: sandwichDetails.plateTypeMale,
          plateTypeFemale: sandwichDetails.plateTypeFemale,
          embMR: sandwichDetails.embMR
        } : { isEMBUsed: false }
      };

      return serviceState;
    };

    // Calculate individual service costs
    const lpSandwichState = prepareSandwichServiceState('lp', state);
    const fsSandwichState = prepareSandwichServiceState('fs', state);
    const embSandwichState = prepareSandwichServiceState('emb', state);

    // Initialize results
    let lpCostPerCardSandwich = "0.00";
    let fsCostPerCardSandwich = "0.00";
    let embCostPerCardSandwich = "0.00";

    // Calculate LP Sandwich costs if applicable
    if (lpSandwichState) {
      const lpResults = await calculateLPCosts(lpSandwichState);
      if (!lpResults.error) {
        lpCostPerCardSandwich = lpResults.lpCostPerCard;
      }
    }

    // Calculate FS Sandwich costs if applicable
    if (fsSandwichState) {
      const fsResults = await calculateFSCosts(fsSandwichState);
      if (!fsResults.error) {
        fsCostPerCardSandwich = fsResults.fsCostPerCard;
      }
    }

    // Calculate EMB Sandwich costs if applicable
    if (embSandwichState) {
      const embResults = await calculateEMBCosts(embSandwichState);
      if (!embResults.error) {
        embCostPerCardSandwich = embResults.embCostPerCard;
      }
    }

    // Calculate total sandwich cost per card
    const sandwichCostPerCard = parseFloat(lpCostPerCardSandwich) + 
                                 parseFloat(fsCostPerCardSandwich) + 
                                 parseFloat(embCostPerCardSandwich);

    // Detailed calculation results
    const results = {
      lpCostPerCardSandwich: lpCostPerCardSandwich,
      fsCostPerCardSandwich: fsCostPerCardSandwich,
      embCostPerCardSandwich: embCostPerCardSandwich,
      sandwichCostPerCard: sandwichCostPerCard.toFixed(2)
    };

    console.log("Sandwich Calculation Results:", results);

    return results;
  } catch (error) {
    console.error("Error calculating sandwich costs:", error);
    return { 
      error: "Error calculating sandwich costs",
      lpCostPerCardSandwich: "0.00",
      fsCostPerCardSandwich: "0.00",
      embCostPerCardSandwich: "0.00",
      sandwichCostPerCard: "0.00"
    };
  }
};