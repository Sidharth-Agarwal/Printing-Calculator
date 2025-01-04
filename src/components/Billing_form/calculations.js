import { fetchPaperDetails } from "../../utils/fetchDataUtils"; // Utility to fetch paper details from Firebase

const calculateMaxCardsPerSheet = (dieSize, paperSize) => {
  const { length: dieLength, breadth: dieBreadth } = dieSize;
  const { length: paperLength, breadth: paperBreadth } = paperSize;

  // Calculate cards per orientation
  const cardsByLength = Math.floor(paperLength / dieLength) * Math.floor(paperBreadth / dieBreadth);
  const cardsByBreadth = Math.floor(paperLength / dieBreadth) * Math.floor(paperBreadth / dieLength);

  // Choose the maximum orientation
  return Math.max(cardsByLength, cardsByBreadth);
};

const calculatePaperAndCuttingCosts = async (state) => {
  const { orderAndPaper } = state;

  // Fetch paper details from Firebase
  const paperName = orderAndPaper.paperName;
  const paperDetails = await fetchPaperDetails(paperName);

  if (!paperDetails) {
    console.error(`Paper details not found for: ${paperName}`);
    return {
      error: `Paper details not found for: ${paperName}`,
    };
  }

  // Convert die size to cm
  const dieSize = {
    length: parseFloat(orderAndPaper.dieSize.length) * 2.54, // inches to cm
    breadth: parseFloat(orderAndPaper.dieSize.breadth) * 2.54, // inches to cm
  };

  const paperSize = {
    length: parseFloat(paperDetails.length),
    breadth: parseFloat(paperDetails.breadth),
  };

  // Calculate max cards per sheet
  const maxCardsPerSheet = calculateMaxCardsPerSheet(dieSize, paperSize);

  // Calculate total papers required
  const totalCards = parseInt(orderAndPaper.quantity, 10);
  const totalPapersRequired = Math.ceil(totalCards / maxCardsPerSheet);

  // Calculate costs
  const paperCost = totalPapersRequired * parseFloat(paperDetails.finalRate); // INR
  const cuttingCost = totalCards * 0.10; // Assuming a flat cutting cost of INR 0.10 per card

  // Calculate per card costs
  const paperCostPerCard = paperCost / totalCards; // Paper cost per card
  const cuttingCostPerCard = cuttingCost / totalCards; // Cutting cost per card
  const paperAndCuttingCostPerCard = paperCostPerCard + cuttingCostPerCard;

  return {
    // maxCardsPerSheet,
    // totalPapersRequired,
    // paperCost,
    // cuttingCost,
    paperCostPerCard: paperCostPerCard.toFixed(2),
    cuttingCostPerCard: cuttingCostPerCard.toFixed(2),
    paperAndCuttingCostPerCard: paperAndCuttingCostPerCard.toFixed(2)
  };
};

export const calculateEstimateCosts = async (state) => {
  try {
    // Step 1: Calculate paper and cutting costs
    const paperAndCuttingCosts = await calculatePaperAndCuttingCosts(state);

    if (paperAndCuttingCosts.error) {
      return { error: paperAndCuttingCosts.error };
    }

    // Return all calculations, including per-card costs
    return {
      ...paperAndCuttingCosts,
    };
  } catch (error) {
    console.error("Error calculating estimate costs:", error);
    return { error: "Error calculating costs. Please try again." };
  }
};
