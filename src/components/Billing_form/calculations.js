import {
  fetchPaperDetails,
  fetchMaterialDetails,
  fetchMRDetailsForLPDetails,
} from "../../utils/fetchDataUtils"; // Utility to fetch data from Firebase

// Helper function to calculate maximum cards per sheet
const calculateMaxCardsPerSheet = (dieSize, paperSize) => {
  const { length: dieLength, breadth: dieBreadth } = dieSize;
  const { length: paperLength, breadth: paperBreadth } = paperSize;

  const cardsByLength =
    Math.floor(paperLength / dieLength) * Math.floor(paperBreadth / dieBreadth);
  const cardsByBreadth =
    Math.floor(paperLength / dieBreadth) * Math.floor(paperBreadth / dieLength);

  return Math.max(cardsByLength, cardsByBreadth);
};

// Function to calculate paper and cutting costs
const calculatePaperAndCuttingCosts = async (state) => {
  const { orderAndPaper } = state;
  const paperName = orderAndPaper.paperName;
  const paperDetails = await fetchPaperDetails(paperName);

  if (!paperDetails) {
    return { error: `Paper details not found for: ${paperName}` };
  }

  const dieSize = {
    length: parseFloat(orderAndPaper.dieSize.length) * 2.54,
    breadth: parseFloat(orderAndPaper.dieSize.breadth) * 2.54,
  };

  const paperSize = {
    length: parseFloat(paperDetails.length),
    breadth: parseFloat(paperDetails.breadth),
  };

  const maxCardsPerSheet = calculateMaxCardsPerSheet(dieSize, paperSize);
  const totalCards = parseInt(orderAndPaper.quantity, 10);
  const totalPapersRequired = Math.ceil(totalCards / maxCardsPerSheet);

  const paperCost = totalPapersRequired * parseFloat(paperDetails.finalRate);
  const cuttingCost = totalCards * 0.10;

  return {
    paperCostPerCard: (paperCost / totalCards).toFixed(2),
    cuttingCostPerCard: (cuttingCost / totalCards).toFixed(2),
    paperAndCuttingCostPerCard: ((paperCost + cuttingCost) / totalCards).toFixed(2),
  };
};

// Function to calculate LP costs
const calculateLPCosts = async (state) => {
  const { lpDetails, orderAndPaper } = state;
  const totalCards = parseInt(orderAndPaper.quantity, 10);

  if (!lpDetails.isLPUsed || !lpDetails.colorDetails?.length) {
    return { lpCostPerCard: 0 };
  }

  let totalLPColorCost = 0;
  let totalPolymerPlateCost = 0;
  let totalMRRate = 0;

  const colorCostPerCard = 1; // INR 1 for color
  const impressionCostPerCard = 0.5; // INR 0.5 for impression

  // Fetch MR details for all colors in LP details
  const mrDetailsArray = await fetchMRDetailsForLPDetails(lpDetails);

  for (let i = 0; i < lpDetails.colorDetails.length; i++) {
    const color = lpDetails.colorDetails[i];

    // Step 1: Calculate cost per color (Pantone type)
    totalLPColorCost += (colorCostPerCard + impressionCostPerCard) * totalCards;

    // Step 2: Calculate polymer plate cost dynamically based on plate type
    const plateType = color.plateType || "Polymer Plate"; // Fallback to "Polymer Plate" if not provided
    const materialDetails = await fetchMaterialDetails(plateType);

    if (!materialDetails) {
      console.warn(`Material details not found for plate type: ${plateType}`);
      continue; // Skip this iteration if material details are not found
    }

    const plateArea =
      parseFloat(color.plateDimensions.length || 0) *
      parseFloat(color.plateDimensions.breadth || 0); // cm²
    const plateCost = plateArea * parseFloat(materialDetails.finalCostPerUnit || 0);
    totalPolymerPlateCost += plateCost / totalCards; // Cost per card
  }

  // Step 3: Calculate MR cost
  for (let i = 0; i < lpDetails.colorDetails.length; i++) {
    const mrDetails = mrDetailsArray[i];
    if (mrDetails) {
      totalMRRate += parseFloat(mrDetails.finalRate || 0) / totalCards; // Cost per card
    } else {
      console.warn(`No MR details found for color index ${i}`);
    }
  }

  const lpCostPerCard = (totalLPColorCost + totalPolymerPlateCost + totalMRRate) / totalCards;

  return { lpCostPerCard: lpCostPerCard.toFixed(2) };
};

// Main function to calculate all estimate costs
export const calculateEstimateCosts = async (state) => {
  try {
    const paperAndCuttingCosts = await calculatePaperAndCuttingCosts(state);
    if (paperAndCuttingCosts.error) return { error: paperAndCuttingCosts.error };

    const lpCosts = await calculateLPCosts(state);
    if (lpCosts.error) return { error: lpCosts.error };

    return { ...paperAndCuttingCosts, ...lpCosts };
  } catch (error) {
    console.error("Error calculating estimate costs:", error);
    return { error: "Error calculating costs. Please try again." };
  }
};
