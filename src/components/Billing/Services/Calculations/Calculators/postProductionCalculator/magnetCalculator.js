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
 * Calculates magnet costs based on form state
 * @param {Object} state - Form state containing magnet details
 * @returns {Promise<Object>} - Magnet cost calculations
 */
export const calculateMagnetCosts = async (state) => {
  try {
    const { magnet, orderAndPaper } = state;
    const totalCards = parseInt(orderAndPaper.quantity, 10);
    const dieCode = orderAndPaper.dieCode;
    const jobType = orderAndPaper.jobType || "CARD";
    console.log("JOB TYPE being used : ", jobType)
    const fragsPerDie = orderAndPaper.frags || 1;
    const normalizedJobType = (jobType || "").toLowerCase();
    console.log("JOB TYPE being used : ", normalizedJobType)
    
    // Check if magnet is used
    if (!magnet || !magnet.isMagnetUsed) {
      return { 
        magnetCostPerCard: "0.00"
      };
    }

    // Validate required inputs
    if (!totalCards || !magnet.magnetMaterial || !dieCode) {
      return { 
        error: "Missing required information for magnet calculations",
        magnetCostPerCard: "0.00"
      };
    }

    // 1. Fetch die details to get the frags value
    const dieDetails = await fetchDieDetails(dieCode);
    if (!dieDetails) {
      return {
        error: `Die details not found for code: ${dieCode}`,
        magnetCostPerCard: "0.00"
      };
    }

    // 2. Get margin values based on job type
    const margins = getMarginsByJobType(jobType);
    const lengthMargin = margins.lengthMargin;
    const breadthMargin = margins.breadthMargin;
    console.log("MARGINS : ", margins);
    
    // 3. Calculate plate area for magnet material
    let plateArea = 0;
    
    // First check if product size is available
    if (normalizedJobType === "envelope") {
      const productLengthCm = parseFloat(orderAndPaper.productSize.length) * 2.54;
      const productBreadthCm = parseFloat(orderAndPaper.productSize.breadth) * 2.54;
      console.log("Product length : ", productLengthCm)
      console.log("Product length : ", productBreadthCm)
      plateArea = (productLengthCm + lengthMargin) * (productBreadthCm + breadthMargin);
    }
    else if (normalizedJobType === "packaging") {
      const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
      const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
      console.log("Die length : ", dieLengthCm)
      console.log("Die length : ", dieBreadthCm)
      plateArea = (dieLengthCm + lengthMargin) * (dieBreadthCm + breadthMargin);
    }
    else if (normalizedJobType === "card" || normalizedJobType === "biz card" || normalizedJobType === "magnet" || normalizedJobType === "seal" || normalizedJobType === "liner" || normalizedJobType === "notebook") {
      if(fragsPerDie >= 2) {
        const dieLengthCm = parseFloat(orderAndPaper.dieSize.length) * 2.54;
        const dieBreadthCm = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
        console.log("Die length : ", dieLengthCm)
        console.log("Die length : ", dieBreadthCm)
        plateArea = (dieLengthCm + lengthMargin) * (dieBreadthCm + breadthMargin);
      } else {
        const productLengthCm = parseFloat(orderAndPaper.productSize.length) * 2.54;
        const productBreadthCm = parseFloat(orderAndPaper.productSize.breadth) * 2.54;
        console.log("Product length : ", productLengthCm)
        console.log("Product length : ", productBreadthCm)
        plateArea = (productLengthCm + lengthMargin) * (productBreadthCm + breadthMargin);
      }
    }

    // 4. Fetch magnet material details from materials DB
    const magnetMaterialDetails = await fetchMaterialDetails(magnet.magnetMaterial);
    
    if (!magnetMaterialDetails) {
      return {
        error: `Magnet material details not found for: ${magnet.magnetMaterial}`,
        magnetCostPerCard: "0.00"
      };
    }

    // 5. Calculate material cost based on area and material cost per unit
    const materialCostPerUnit = parseFloat(magnetMaterialDetails.finalCostPerUnit || 0);
    const totalMagnetCost = plateArea * materialCostPerUnit;
    
    // 6. Calculate magnet cost per card, dividing by frags
    const magnetCostPerCard = (totalMagnetCost / fragsPerDie);
    
    return {
      magnetCostPerCard: magnetCostPerCard.toFixed(2),
      // Additional info for debugging
      fragsPerDie: fragsPerDie,
      plateArea: plateArea.toFixed(2),
      magnetMaterial: magnet.magnetMaterial,
      materialCostPerUnit: materialCostPerUnit.toFixed(2),
      lengthMargin: lengthMargin.toFixed(2), // Updated for debugging
      breadthMargin: breadthMargin.toFixed(2) // Updated for debugging
    };
  } catch (error) {
    console.error("Error calculating magnet costs:", error);
    return { 
      error: "Error calculating magnet costs",
      magnetCostPerCard: "0.00"
    };
  }
};