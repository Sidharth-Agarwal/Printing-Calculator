import {
  fetchPaperDetails,
  fetchMaterialDetails,
  fetchMRDetailsForLPDetails,
  fetchMRDetailsForFSDetails, // Import FS MR details function
  fetchMRDetailsForEMBDetails,
} from "../../utils/fetchDataUtils"; // Adjust the path if necessary

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

// Function to calculate FS costs
const calculateFSCosts = async (state) => {
  const { fsDetails, orderAndPaper } = state;
  const totalCards = parseInt(orderAndPaper.quantity, 10);

  if (!fsDetails.isFSUsed || !fsDetails.foilDetails?.length) {
    return { fsCostPerCard: 0 };
  }

  let totalFoilCostPerCard = 0;
  let totalBlockCostPerCard = 0;
  let totalMRRatePerCard = 0;

  // Fetch MR details for all foils in FS details
  const mrDetailsArray = await fetchMRDetailsForFSDetails(fsDetails);

  for (let i = 0; i < fsDetails.foilDetails.length; i++) {
    const foil = fsDetails.foilDetails[i];

    // Validate block dimensions
    const blockDimensions = foil.blockDimension;
    if (!blockDimensions || !blockDimensions.length || !blockDimensions.breadth) {
      console.warn(`Invalid block dimensions for foil index ${i}`, foil);
      continue; // Skip invalid foils
    }
    
    // Step 1: Calculate foil cost
    const foilMaterialDetails = await fetchMaterialDetails(foil.foilType);
    console.log(foil.foilType)
    if (foilMaterialDetails) {
      const foilArea =parseFloat(blockDimensions.length) * parseFloat(blockDimensions.breadth); // cm²
      totalFoilCostPerCard += (foilArea * parseFloat(foilMaterialDetails.finalCostPerUnit || 0))
    } else {
      console.warn(`No material details found for foil type: ${foil.foilType}`);
    }

    // Step 2: Calculate block cost
    const blockMaterialDetails = await fetchMaterialDetails(foil.blockType);
    console.log(foil.blockType)
    if (blockMaterialDetails) {
      const blockArea = parseFloat(blockDimensions.length) * parseFloat(blockDimensions.breadth); // cm²
      totalBlockCostPerCard += (blockArea * parseFloat(blockMaterialDetails.landedCost || 0))
    } else {
      console.warn(`No material details found for block type: ${foil.blockType}`);
    }

    // Step 3: Calculate MR cost
    const mrDetails = mrDetailsArray[i];
    if (mrDetails) {
      totalMRRatePerCard += parseFloat(mrDetails.finalRate || 0) / totalCards;
    } else {
      console.warn(`No MR details found for foil index ${i}`);
    }
  }

  const fsCostPerCard = totalFoilCostPerCard + totalBlockCostPerCard + totalMRRatePerCard;

  return { fsCostPerCard: fsCostPerCard.toFixed(2) };
};

// Function to calculate EMB costs
const calculateEMBCosts = async (state) => {
  const { embDetails, orderAndPaper } = state;
  const totalCards = parseInt(orderAndPaper.quantity, 10);

  if (!embDetails.isEMBUsed) {
    return { embCostPerCard: 0 };
  }

  const plateArea =
    parseFloat(embDetails.plateDimensions.length || 0) *
    parseFloat(embDetails.plateDimensions.breadth || 0); // Calculate area

  let totalMalePlateCost = 0;
  let totalFemalePlateCost = 0;
  let totalMRRate = 0;

  // Calculate Male Plate Cost
  const malePlateMaterialDetails = await fetchMaterialDetails(embDetails.plateTypeMale);
  if (malePlateMaterialDetails) {
    totalMalePlateCost =
      (plateArea * parseFloat(malePlateMaterialDetails.finalCostPerUnit || 0)) / totalCards;
  } else {
    console.warn(`No material details found for male plate type: ${embDetails.plateTypeMale}`);
  }

  // Calculate Female Plate Cost
  const femalePlateMaterialDetails = await fetchMaterialDetails(embDetails.plateTypeFemale);
  if (femalePlateMaterialDetails) {
    totalFemalePlateCost =
      (plateArea * parseFloat(femalePlateMaterialDetails.finalCostPerUnit || 0)) / totalCards;
  } else {
    console.warn(`No material details found for female plate type: ${embDetails.plateTypeFemale}`);
  }

  // Calculate MR Cost
  const mrDetails = await fetchMRDetailsForEMBDetails(embDetails.embMR);
  if (mrDetails) {
    totalMRRate = parseFloat(mrDetails.finalRate || 0) / totalCards;
  } else {
    console.warn(`No MR details found for EMB MR type: ${embDetails.embMR}`);
  }

  // Total EMB Cost Per Card
  const embCostPerCard = (totalMalePlateCost + totalFemalePlateCost + totalMRRate).toFixed(2);

  return { embCostPerCard };
};

// Main function to calculate all estimate costs
export const calculateEstimateCosts = async (state) => {
  try {
    const paperAndCuttingCosts = await calculatePaperAndCuttingCosts(state);
    if (paperAndCuttingCosts.error) return { error: paperAndCuttingCosts.error };

    const lpCosts = await calculateLPCosts(state);
    if (lpCosts.error) return { error: lpCosts.error };

    const fsCosts = await calculateFSCosts(state);
    if (fsCosts.error) return { error: fsCosts.error };

    const embCosts = await calculateEMBCosts(state);
    if (embCosts.error) return { error: embCosts.error };

    return { ...paperAndCuttingCosts, ...lpCosts, ...fsCosts, ...embCosts };
  } catch (error) {
    console.error("Error calculating estimate costs:", error);
    return { error: "Error calculating costs. Please try again." };
  }
};