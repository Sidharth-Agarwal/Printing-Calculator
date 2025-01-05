import {
  fetchPaperDetails,
  fetchMaterialDetails,
  fetchMRDetailsForLPDetails,
  fetchMRDetailsForFSDetails, // Import FS MR details function
  fetchMRDetailsForEMBDetails,
  fetchPaperDetailsByDimensions,
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

const calculateDigiDetailsCosts = async (digiDetails, dieSize, totalCards) => {
  try {
    // Helper function to convert inches to cm (rounded to 1 decimal)
    const inchesToCm = (inches) => parseFloat((parseFloat(inches) * 2.54).toFixed(1));

    // Validate digiDetails
    const { isDigiUsed = false, digiDimensions = {} } = digiDetails || {};
    if (!isDigiUsed || !digiDimensions.length || !digiDimensions.breadth) {
      console.warn("Digital printing is not used or dimensions are invalid.");
      return { digiCostPerCard: 0 };
    }

    // Convert dimensions from inches to cm
    const dieDimensionsCm = {
      length: inchesToCm(dieSize.length || 0),
      breadth: inchesToCm(dieSize.breadth || 0),
    };

    const digiDimensionsCm = {
      length: inchesToCm(digiDimensions.length || 0),
      breadth: inchesToCm(digiDimensions.breadth || 0),
    };

    console.log("Converted Dimensions (cm):", { dieDimensionsCm, digiDimensionsCm });

    // Calculate max cards per sheet for both orientations
    const lengthwiseCards =
      Math.floor(digiDimensionsCm.length / dieDimensionsCm.length) *
      Math.floor(digiDimensionsCm.breadth / dieDimensionsCm.breadth);

    const breadthwiseCards =
      Math.floor(digiDimensionsCm.length / dieDimensionsCm.breadth) *
      Math.floor(digiDimensionsCm.breadth / dieDimensionsCm.length);

    const maxCardsPerSheet = Math.max(lengthwiseCards, breadthwiseCards);

    if (maxCardsPerSheet === 0) {
      console.warn("Die size is too large for the selected digital paper dimensions.");
      return { digiCostPerCard: 0 };
    }

    const totalPapersRequired = Math.ceil(totalCards / maxCardsPerSheet);

    // Fetch the best match paper based on dimensions
    const paperDetails = await fetchPaperDetailsByDimensions(
      digiDimensionsCm.length,
      digiDimensionsCm.breadth,
      "Digital" // Specify "Digital" as the paper name
    );

    if (!paperDetails) {
      console.warn(
        `No suitable paper found for dimensions: ${digiDimensionsCm.length} x ${digiDimensionsCm.breadth}`
      );
      return { digiCostPerCard: 0 };
    }

    const paperCost = totalPapersRequired * parseFloat(paperDetails.finalRate);

    // Calculate printing cost
    const printingCost = totalCards * 20;

    // Calculate total cost
    const totalDigiCost = paperCost + printingCost;

    return {
      digiCostPerCard: (totalDigiCost / totalCards).toFixed(2),
      totalPapersRequired,
      paperCost: paperCost.toFixed(2),
      printingCost: printingCost.toFixed(2),
    };
  } catch (error) {
    console.error("Error calculating digital printing costs:", error);
    return { error: "Error calculating digital printing costs. Please try again." };
  }
};

const calculateSandwichCosts = async (sandwichDetails, totalCards) => {
  try {
    // Validate sandwichDetails
    if (!sandwichDetails) {
      throw new Error("Sandwich details are undefined or missing.");
    }

    const { lpDetailsSandwich, fsDetailsSandwich, embDetailsSandwich } = sandwichDetails;

    let totalLPCostSandwich = 0;
    let totalFSCostSandwich = 0;
    let totalEMBCostSandwich = 0;

    // LP Details Calculations
    if (lpDetailsSandwich?.isLPUsed && lpDetailsSandwich.colorDetails?.length > 0) {
      let totalLPColorCostSandwich = 0;
      let totalPolymerPlateCostSandwich = 0;
      let totalMRRateSandwich = 0;

      const colorCostPerCardSandwich = 1; // INR 1 for color
      const impressionCostPerCardSandwich = 0.5; // INR 0.5 for impression

      const mrDetailsArraySandwich = await fetchMRDetailsForLPDetails(lpDetailsSandwich);

      for (let i = 0; i < lpDetailsSandwich.colorDetails.length; i++) {
        const color = lpDetailsSandwich.colorDetails[i];

        // Color and impression costs
        totalLPColorCostSandwich += (colorCostPerCardSandwich + impressionCostPerCardSandwich) * totalCards;

        // Polymer plate cost
        const plateType = color.plateType || "Polymer Plate";
        const materialDetails = await fetchMaterialDetails(plateType);

        if (materialDetails) {
          const plateArea =
            parseFloat(color.plateDimensions.length || 0) *
            parseFloat(color.plateDimensions.breadth || 0); // cm²
          const plateCost = plateArea * parseFloat(materialDetails.finalCostPerUnit || 0);
          totalPolymerPlateCostSandwich += plateCost / totalCards; // Cost per card
        } else {
          console.warn(`Material details not found for plate type: ${plateType}`);
        }

        // MR cost
        const mrDetails = mrDetailsArraySandwich[i];
        if (mrDetails) {
          totalMRRateSandwich += parseFloat(mrDetails.finalRate || 0) / totalCards;
        } else {
          console.warn(`No MR details found for LP color index ${i}`);
        }
      }

      totalLPCostSandwich =
        (totalLPColorCostSandwich + totalPolymerPlateCostSandwich + totalMRRateSandwich) / totalCards;
    }

    // FS Details Calculations
    if (fsDetailsSandwich?.isFSUsed && fsDetailsSandwich.foilDetails?.length > 0) {
      let totalFoilCostPerCardSandwich = 0;
      let totalBlockCostPerCardSandwich = 0;
      let totalMRRatePerCardSandwich = 0;

      const mrDetailsArraySandwich = await fetchMRDetailsForFSDetails(fsDetailsSandwich);

      for (let i = 0; i < fsDetailsSandwich.foilDetails.length; i++) {
        const foil = fsDetailsSandwich.foilDetails[i];

        // Validate block dimensions
        const blockDimensions = foil.blockDimension;
        if (!blockDimensions || !blockDimensions.length || !blockDimensions.breadth) {
          console.warn(`Invalid block dimensions for foil index ${i}`);
          continue; // Skip invalid foils
        }

        // Foil cost
        const foilMaterialDetails = await fetchMaterialDetails(foil.foilType);
        if (foilMaterialDetails) {
          const foilArea =
            parseFloat(blockDimensions.length) * parseFloat(blockDimensions.breadth); // cm²
          totalFoilCostPerCardSandwich +=
            (foilArea * parseFloat(foilMaterialDetails.finalCostPerUnit || 0)) / totalCards;
        } else {
          console.warn(`No material details found for foil type: ${foil.foilType}`);
        }

        // Block cost
        const blockMaterialDetails = await fetchMaterialDetails(foil.blockType);
        if (blockMaterialDetails) {
          const blockArea =
            parseFloat(blockDimensions.length) * parseFloat(blockDimensions.breadth); // cm²
          totalBlockCostPerCardSandwich +=
            (blockArea * parseFloat(blockMaterialDetails.landedCost || 0)) / totalCards;
        } else {
          console.warn(`No material details found for block type: ${foil.blockType}`);
        }

        // MR cost
        const mrDetails = mrDetailsArraySandwich[i];
        if (mrDetails) {
          totalMRRatePerCardSandwich += parseFloat(mrDetails.finalRate || 0) / totalCards;
        } else {
          console.warn(`No MR details found for FS foil index ${i}`);
        }
      }

      totalFSCostSandwich =
        totalFoilCostPerCardSandwich + totalBlockCostPerCardSandwich + totalMRRatePerCardSandwich;
    }

    // EMB Details Calculations
    if (embDetailsSandwich?.isEMBUsed) {
      const plateAreaSandwich =
        parseFloat(embDetailsSandwich.plateDimensions.length || 0) *
        parseFloat(embDetailsSandwich.plateDimensions.breadth || 0); // cm²

      let totalMalePlateCostSandwich = 0;
      let totalFemalePlateCostSandwich = 0;
      let totalMRRateSandwich = 0;

      // Male Plate Cost
      const malePlateMaterialDetails = await fetchMaterialDetails(embDetailsSandwich.plateTypeMale);
      if (malePlateMaterialDetails) {
        totalMalePlateCostSandwich =
          (plateAreaSandwich * parseFloat(malePlateMaterialDetails.finalCostPerUnit || 0)) / totalCards;
      } else {
        console.warn(`No material details found for male plate type: ${embDetailsSandwich.plateTypeMale}`);
      }

      // Female Plate Cost
      const femalePlateMaterialDetails = await fetchMaterialDetails(embDetailsSandwich.plateTypeFemale);
      if (femalePlateMaterialDetails) {
        totalFemalePlateCostSandwich =
          (plateAreaSandwich * parseFloat(femalePlateMaterialDetails.finalCostPerUnit || 0)) / totalCards;
      } else {
        console.warn(
          `No material details found for female plate type: ${embDetailsSandwich.plateTypeFemale}`
        );
      }

      // MR Cost
      const mrDetailsSandwich = await fetchMRDetailsForEMBDetails(embDetailsSandwich.embMR);
      if (mrDetailsSandwich) {
        totalMRRateSandwich = parseFloat(mrDetailsSandwich.finalRate || 0) / totalCards;
      } else {
        console.warn(`No MR details found for EMB MR type: ${embDetailsSandwich.embMR}`);
      }

      totalEMBCostSandwich = totalMalePlateCostSandwich + totalFemalePlateCostSandwich + totalMRRateSandwich;
    }

    // Consolidate all costs
    return {
      lpCostPerCardSandwich: totalLPCostSandwich.toFixed(2),
      fsCostPerCardSandwich: totalFSCostSandwich.toFixed(2),
      embCostPerCardSandwich: totalEMBCostSandwich.toFixed(2),
    };
  } catch (error) {
    console.error("Error calculating sandwich costs:", error);
    return { error: "Error calculating sandwich costs. Please try again." };
  }
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

    // const digiCosts = await calculateDigiDetailsCosts(state.digiDetails, state.orderAndPaper.dieSize, parseInt(state.orderAndPaper.quantity, 10));
    // if (digiCosts.error) return { error: digiCosts.error };

    const digiCosts = await calculateDigiDetailsCosts(
      state.digiDetails,
      state.orderAndPaper.dieSize,
      parseInt(state.orderAndPaper.quantity, 10)
    );
    if (digiCosts.error) return { error: digiCosts.error };    

    // Handle Sandwich Costs
    const sandwichCosts = await calculateSandwichCosts(state.sandwich, state.orderAndPaper.quantity);
    if (sandwichCosts.error) return { error: sandwichCosts.error };

    // Combine all calculated costs
    return {
      ...paperAndCuttingCosts,
      ...lpCosts,
      ...fsCosts,
      ...embCosts,
      ...digiCosts,
      ...sandwichCosts,
    };
  } catch (error) {
    console.error("Error calculating estimate costs:", error);
    return { error: "Error calculating costs. Please try again." };
  }
};