import { fetchStandardRate } from "../../../../../../utils/dbFetchUtils";
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
 * Calculates pre die cutting costs based on form state
 * @param {Object} state - Form state containing pre-DC details
 * @returns {Promise<Object>} - Pre die cutting cost calculations
 */
export const calculatePreDieCuttingCosts = async (state) => {
  try {
    const { preDieCutting, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const dieCode = orderAndPaper.dieCode;

    // Check if pre-DC is used
    if (!preDieCutting.isPreDieCuttingUsed) {
      return { 
        preDieCuttingCostPerCard: "0.00",
        preDieCuttingMRCostPerCard: "0.00",
        preDieCuttingImpressionCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !preDieCutting.predcMR) {
      return { 
        error: "Missing required information for pre die cutting calculations",
        preDieCuttingCostPerCard: "0.00",
        preDieCuttingMRCostPerCard: "0.00",
        preDieCuttingImpressionCostPerCard: "0.00"
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
        console.log("PRE Frags per die:", fragsPerDie);
      }
    }

    // 1. Fetch MR cost from standard rates using the concatenated value
    const mrType = preDieCutting.predcMR;
    const mrConcatenated = preDieCutting.predcMRConcatenated || `PREDC MR ${mrType.toUpperCase()}`;
    
    const mrDetails = await fetchStandardRate("PREDC MR", mrType);
    
    // MR cost is the finalRate from the database, or fallback to defaults
    let mrRate = 0;
    if (mrDetails && mrDetails.finalRate) {
      mrRate = parseFloat(mrDetails.finalRate);
    } else {
      // Fallback based on type
      if (mrType.toUpperCase() === "SIMPLE") mrRate = 50;
      else if (mrType.toUpperCase() === "COMPLEX") mrRate = 100;
      else if (mrType.toUpperCase() === "SUPER COMPLEX") mrRate = 350;
      console.warn(`Using fallback MR cost for type ${mrType}: ${mrRate}`);
    }
    
    // 2. Fetch impression cost from standard rates
    const impressionDetails = await fetchStandardRate("IMPRESSION", "PREDC");
    const impressionCostPerUnit = impressionDetails ? 
      parseFloat(impressionDetails.finalRate || 0) : 
      0.25; // Default to 0.25 if not found

    const impressCostingPerUnit = impressionCostPerUnit / fragsPerDie;

    // 3. Calculate costs per card
    const mrCostPerCard = mrRate / totalCards;
    const impressionCostPerCard = impressCostingPerUnit; // Already per card
    
    // 4. Calculate total pre die cutting cost per card
    const preDieCuttingCostPerCard = mrCostPerCard + impressionCostPerCard;
    
    return {
      preDieCuttingCostPerCard: preDieCuttingCostPerCard.toFixed(2),
      preDieCuttingMRCostPerCard: mrCostPerCard.toFixed(2),
      preDieCuttingImpressionCostPerCard: impressionCostPerCard.toFixed(2),
      // Include additional info for debugging
      mrRate: mrRate.toFixed(2),
      mrConcatenated: mrConcatenated,
      impressionRate: impressionCostPerUnit.toFixed(2),
      fragsPerDie: fragsPerDie // Include frags per die for debugging
    };
  } catch (error) {
    console.error("Error calculating pre die cutting costs:", error);
    return { 
      error: "Error calculating pre die cutting costs",
      preDieCuttingCostPerCard: "0.00",
      preDieCuttingMRCostPerCard: "0.00",
      preDieCuttingImpressionCostPerCard: "0.00"
    };
  }
};