import {
  fetchPaperDetails,
  fetchMaterialDetails,
  fetchMRDetailsForLPDetails,
  fetchMRDetailsForFSDetails,
  fetchMRDetailsForEMBDetails,
  fetchPaperDetailsByDimensions,
  fetchMRDetailsForDieCutting
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
    length: (parseFloat(orderAndPaper.dieSize.length) * 2.54) + 2,
    breadth: (parseFloat(orderAndPaper.dieSize.breadth) * 2.54) + 2,
  };

  const paperSize = {
    length: parseFloat(paperDetails.length),
    breadth: parseFloat(paperDetails.breadth),
  };

  const maxCardsPerSheet = calculateMaxCardsPerSheet(dieSize, paperSize);
  const totalCards = parseInt(orderAndPaper.quantity, 10);
  const totalPapersRequired = Math.ceil(totalCards / maxCardsPerSheet);

  const gilCutCost = 0.25 * totalPapersRequired;

  const paperCost = totalPapersRequired * parseFloat(paperDetails.finalRate);
  const cuttingCost = totalCards * 0.10;

  return {
    paperCostPerCard: (paperCost / totalCards).toFixed(2),
    cuttingCostPerCard: (cuttingCost / totalCards).toFixed(2),
    paperAndCuttingCostPerCard: ((paperCost + cuttingCost + gilCutCost) / totalCards).toFixed(2),
  };
};

// Function to calculate LP costs
const calculateLPCosts = async (state) => {
  const { lpDetails, orderAndPaper } = state;
  const totalCards = parseInt(orderAndPaper.quantity, 10);

  if (!lpDetails.isLPUsed || !lpDetails.colorDetails?.length) {
    return { lpCostPerCard: 0 };
  }

  let totalLPCosting = 0;

  // Fetch MR details for all colors in LP details
  const mrDetailsArray = await fetchMRDetailsForLPDetails(lpDetails);

  for (let i = 0; i < lpDetails.colorDetails.length; i++) {
    let lpCostForEachIteration = 0;
    
    const color = lpDetails.colorDetails[i];

    // Step 1: Calculate cost per color (Pantone type)
    const colorCostPerCard = 1; // INR 1 for color
    const impressionCostPerCard = 0.5; // INR 0.5 for impression
    const labourCost = 1;
    let totalLPColorCost = (colorCostPerCard + impressionCostPerCard + labourCost) * totalCards;

    const plateArea = (parseFloat(color.plateDimensions.length || 0) + 2) * (parseFloat(color.plateDimensions.breadth || 0) + 2); // cm²

    // Step 2: Calculate polymer plate cost dynamically based on plate type
    const plateType = color.plateType || "Polymer Plate"; // Fallback to "Polymer Plate" if not provided
    const materialDetails = await fetchMaterialDetails(plateType);

    if (!materialDetails) {
      console.warn(`Material details not found for plate type: ${plateType}`);
      continue; // Skip this iteration if material details are not found
    }
    const plateCost = plateArea * parseFloat(materialDetails.finalCostPerUnit || 0);

    // Step 3: Calculate MR cost
    const mrDetails = mrDetailsArray[i];

    let totalMRRate = 0;
    
    if (mrDetails) {
      totalMRRate = parseFloat(mrDetails.finalRate || 0);
    } else {
      console.warn(`No MR details found for color index ${i}`);
    }

    lpCostForEachIteration = totalLPColorCost + plateCost + totalMRRate;

    totalLPCosting = totalLPCosting + lpCostForEachIteration;
  }

  const lpCostPerCard = totalLPCosting / totalCards;

  return { lpCostPerCard: lpCostPerCard.toFixed(2) };
};

// Function to calculate FS costs
const calculateFSCosts = async (state) => {
  const { fsDetails, orderAndPaper } = state;
  const totalCards = parseInt(orderAndPaper.quantity, 10);

  if (!fsDetails.isFSUsed || !fsDetails.foilDetails?.length) {
    return { fsCostPerCard: 0 };
  }

  let totalFSCosting = 0;

  // Fetch MR details for all foils in FS details
  const mrDetailsArray = await fetchMRDetailsForFSDetails(fsDetails);
  console.log(mrDetailsArray)

  for (let i = 0; i < fsDetails.foilDetails.length; i++) {
    const impressionCostPerCard = 1;
    let fsCostForEachIteration = 0;
    
    const foil = fsDetails.foilDetails[i];

    // Validate block dimensions
    const blockDimensions = foil.blockDimension;
    if (!blockDimensions || !blockDimensions.length || !blockDimensions.breadth) {
      console.warn(`Invalid block dimensions for foil index ${i}`, foil);
      continue; // Skip invalid foils
    }
    
    // Step 1: Calculate block cost for this foil
    const blockMaterialDetails = await fetchMaterialDetails(foil.blockType);
    const blockFright = 500;

    let blockArea = 0;
    
    let blockCost = 0;
    if (blockMaterialDetails) {
      blockArea = (parseFloat(blockDimensions.length) + 2) * (parseFloat(blockDimensions.breadth) + 2); // cm² with margins
      console.log(blockArea);
      blockCost = blockArea * parseFloat(blockMaterialDetails.rate || 0) + blockFright;
      console.log(blockCost)
    } else {
      console.warn(`No material details found for block type: ${foil.blockType}`);
    }

    let blockCostPerUnit = blockCost / totalCards;
    
    // Step 2: Calculate foil cost
    const foilMaterialDetails = await fetchMaterialDetails(foil.foilType);
    console.log(foilMaterialDetails)
    
    let foilCost = 0;
    if (foilMaterialDetails) {
      foilCost = blockArea * parseFloat(foilMaterialDetails.finalCostPerUnit || 0);
      console.log(foilCost)
    } else {
      console.warn(`No material details found for foil type: ${foil.foilType}`);
    }

    // Step 3: Calculate MR cost
    const mrDetails = mrDetailsArray[i];
    
    let totalMRRate = 0;
    if (mrDetails) {
      totalMRRate = parseFloat(mrDetails.finalRate || 0);
    } else {
      console.warn(`No MR details found for foil index ${i}`);
    }

    mrCostPerCard = totalMRRate / totalCards

    fsCostForEachIteration = blockCostPerUnit + foilCost + mrCostPerCard + impressionCostPerCard;
    console.log(fsCostForEachIteration)
    
    totalFSCosting = totalFSCosting + fsCostForEachIteration;
  }

  const fsCostPerCard = totalFSCosting;

  return { fsCostPerCard: fsCostPerCard.toFixed(2) };
};

// Function to calculate EMB costs
const calculateEMBCosts = async (state) => {
  const { embDetails, orderAndPaper } = state;
  const totalCards = parseInt(orderAndPaper.quantity, 10);

  if (!embDetails.isEMBUsed) {
    return { embCostPerCard: 0 };
  }

  let totalEMBCosting = 0;

  // Calculate plate area
  const plateArea = 
    (parseFloat(embDetails.plateDimensions.length || 0) + 2) *
    (parseFloat(embDetails.plateDimensions.breadth || 0) + 2);
  
  // Step 1: Calculate Male Plate Cost
  const malePlateMaterialDetails = await fetchMaterialDetails(embDetails.plateTypeMale);
  
  let malePlateCost = 0;
  if (malePlateMaterialDetails) {
    malePlateCost = plateArea * parseFloat(malePlateMaterialDetails.finalCostPerUnit || 0);
  } else {
    console.warn(`No material details found for male plate type: ${embDetails.plateTypeMale}`);
  }
  
  // Step 2: Calculate Female Plate Cost
  const femalePlateMaterialDetails = await fetchMaterialDetails(embDetails.plateTypeFemale);
  
  let femalePlateCost = 0;
  if (femalePlateMaterialDetails) {
    femalePlateCost = plateArea * parseFloat(femalePlateMaterialDetails.finalCostPerUnit || 0);
  } else {
    console.warn(`No material details found for female plate type: ${embDetails.plateTypeFemale}`);
  }
  
  // Step 3: Calculate MR Cost
  const mrDetails = await fetchMRDetailsForEMBDetails(embDetails.embMR);
  
  let mrCost = 0;
  if (mrDetails) {
    mrCost = parseFloat(mrDetails.finalRate || 0);
  } else {
    console.warn(`No MR details found for EMB MR type: ${embDetails.embMR}`);
  }
  
  // Sum all costs
  totalEMBCosting = malePlateCost + femalePlateCost + mrCost;
  
  // Calculate per card cost
  const embCostPerCard = (totalEMBCosting / totalCards).toFixed(2);
  
  return { embCostPerCard };
};

const calculateDigiDetailsCosts = async (digiDetails, dieSize, totalCards) => {
  try {
    // Validate digiDetails
    const { isDigiUsed = false, digiDimensions = {} } = digiDetails || {};
    if (!isDigiUsed || !digiDimensions.length || !digiDimensions.breadth) {
      console.warn("Digital printing is not used or dimensions are invalid.");
      return { digiCostPerCard: 0 };
    }

    // Convert dimensions from inches to cm - directly multiply by 2.54 as in other functions
    const dieDimensionsCm = {
      length: (parseFloat(dieSize.length || 0) * 2.54) + 2, // Adding 2cm margin as in other functions
      breadth: (parseFloat(dieSize.breadth || 0) * 2.54) + 2, // Adding 2cm margin as in other functions
    };

    const digiDimensionsCm = {
      length: parseFloat(digiDimensions.length || 0) * 2.54, 
      breadth: parseFloat(digiDimensions.breadth || 0) * 2.54,
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
      digiCostPerCard: (totalDigiCost / totalCards).toFixed(2)
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
 
    // LP Details Calculations for Sandwich - using same logic as calculateLPCosts
    if (lpDetailsSandwich?.isLPUsed && lpDetailsSandwich.colorDetails?.length > 0) {
      // Fetch MR details for all colors in LP details
      const mrDetailsArraySandwich = await fetchMRDetailsForLPDetails(lpDetailsSandwich);
 
      for (let i = 0; i < lpDetailsSandwich.colorDetails.length; i++) {
        let lpCostForEachIteration = 0;
        
        const color = lpDetailsSandwich.colorDetails[i];
 
        // Step 1: Calculate cost per color (Pantone type)
        const colorCostPerCard = 1; // INR 1 for color
        const impressionCostPerCard = 0.5; // INR 0.5 for impression
        const labourCost = 1; // Adding labour cost as in the original LP calculation
        let totalLPColorCost = (colorCostPerCard + impressionCostPerCard + labourCost) * totalCards;
 
        const plateArea = 
          (parseFloat(color.plateDimensions.length || 0) + 2) * 
          (parseFloat(color.plateDimensions.breadth || 0) + 2); // cm² with margins
 
        // Step 2: Calculate polymer plate cost dynamically based on plate type
        const plateType = color.plateType || "Polymer Plate"; // Fallback to "Polymer Plate" if not provided
        const materialDetails = await fetchMaterialDetails(plateType);
 
        if (!materialDetails) {
          console.warn(`Material details not found for plate type: ${plateType}`);
          continue; // Skip this iteration if material details are not found
        }
        const plateCost = plateArea * parseFloat(materialDetails.finalCostPerUnit || 0);
 
        // Step 3: Calculate MR cost
        const mrDetails = mrDetailsArraySandwich[i];
 
        let totalMRRate = 0;
        
        if (mrDetails) {
          totalMRRate = parseFloat(mrDetails.finalRate || 0);
        } else {
          console.warn(`No MR details found for color index ${i}`);
        }
 
        lpCostForEachIteration = totalLPColorCost + plateCost + totalMRRate;
        
        totalLPCostSandwich = totalLPCostSandwich + lpCostForEachIteration;
      }
    }
 
    // FS Details Calculations for Sandwich - using same logic as calculateFSCosts
    if (fsDetailsSandwich?.isFSUsed && fsDetailsSandwich.foilDetails?.length > 0) {
      // Fetch MR details for all foils in FS details
      const mrDetailsArraySandwich = await fetchMRDetailsForFSDetails(fsDetailsSandwich);
 
      for (let i = 0; i < fsDetailsSandwich.foilDetails.length; i++) {
        const impressionCostPerCard = 1;
        let fsCostForEachIteration = 0;
        
        const foil = fsDetailsSandwich.foilDetails[i];
 
        // Validate block dimensions
        const blockDimensions = foil.blockDimension;
        if (!blockDimensions || !blockDimensions.length || !blockDimensions.breadth) {
          console.warn(`Invalid block dimensions for foil index ${i}`, foil);
          continue; // Skip invalid foils
        }
        
        // Step 1: Calculate block cost for this foil
        const blockMaterialDetails = await fetchMaterialDetails(foil.blockType);
        const blockFright = 500; // Added blockFright as in the original FS calculation
 
        let blockArea = 0;
        
        let blockCost = 0;
        if (blockMaterialDetails) {
          blockArea = (parseFloat(blockDimensions.length) + 2) * (parseFloat(blockDimensions.breadth) + 2); // cm² with margins
          blockCost = blockArea * parseFloat(blockMaterialDetails.rate || 0) + blockFright;
        } else {
          console.warn(`No material details found for block type: ${foil.blockType}`);
        }
 
        let blockCostPerUnit = blockCost / totalCards;
        
        // Step 2: Calculate foil cost
        const foilMaterialDetails = await fetchMaterialDetails(foil.foilType);
        
        let foilCost = 0;
        if (foilMaterialDetails) {
          foilCost = blockArea * parseFloat(foilMaterialDetails.finalCostPerUnit || 0);
        } else {
          console.warn(`No material details found for foil type: ${foil.foilType}`);
        }
 
        // Step 3: Calculate MR cost
        const mrDetails = mrDetailsArraySandwich[i];
        
        let totalMRRate = 0;
        if (mrDetails) {
          totalMRRate = parseFloat(mrDetails.finalRate || 0);
        } else {
          console.warn(`No MR details found for foil index ${i}`);
        }
 
        let mrCostPerCard = totalMRRate / totalCards; // Calculate per card MR cost
 
        fsCostForEachIteration = blockCostPerUnit + foilCost + mrCostPerCard + impressionCostPerCard;
        
        totalFSCostSandwich = totalFSCostSandwich + fsCostForEachIteration;
      }
    }
 
    // EMB Details Calculations for Sandwich - using same logic as calculateEMBCosts
    if (embDetailsSandwich?.isEMBUsed) {
      // Calculate plate area with the +2 margin as in the original EMB function
      const plateArea = 
        (parseFloat(embDetailsSandwich.plateDimensions?.length || 0) + 2) *
        (parseFloat(embDetailsSandwich.plateDimensions?.breadth || 0) + 2);
      
      // Step 1: Calculate Male Plate Cost
      const malePlateMaterialDetails = await fetchMaterialDetails(embDetailsSandwich.plateTypeMale);
      
      let malePlateCost = 0;
      if (malePlateMaterialDetails) {
        malePlateCost = plateArea * parseFloat(malePlateMaterialDetails.finalCostPerUnit || 0);
      } else {
        console.warn(`No material details found for male plate type: ${embDetailsSandwich.plateTypeMale}`);
      }
      
      // Step 2: Calculate Female Plate Cost
      const femalePlateMaterialDetails = await fetchMaterialDetails(embDetailsSandwich.plateTypeFemale);
      
      let femalePlateCost = 0;
      if (femalePlateMaterialDetails) {
        femalePlateCost = plateArea * parseFloat(femalePlateMaterialDetails.finalCostPerUnit || 0);
      } else {
        console.warn(`No material details found for female plate type: ${embDetailsSandwich.plateTypeFemale}`);
      }
      
      // Step 3: Calculate MR Cost
      const mrDetails = await fetchMRDetailsForEMBDetails(embDetailsSandwich.embMR);
      
      let mrCost = 0;
      if (mrDetails) {
        mrCost = parseFloat(mrDetails.finalRate || 0);
      } else {
        console.warn(`No MR details found for EMB MR type: ${embDetailsSandwich.embMR}`);
      }
      
      // Sum all costs
      totalEMBCostSandwich = malePlateCost + femalePlateCost + mrCost;
    }
 
    // Calculate per card costs
    const lpCostPerCardSandwich = (totalLPCostSandwich / totalCards).toFixed(2);
    const fsCostPerCardSandwich = (totalFSCostSandwich / totalCards).toFixed(2);
    const embCostPerCardSandwich = (totalEMBCostSandwich / totalCards).toFixed(2);
 
    // Consolidate all costs
    return {
      lpCostPerCardSandwich,
      fsCostPerCardSandwich,
      embCostPerCardSandwich,
    };
  } catch (error) {
    console.error("Error calculating sandwich costs:", error);
    return { error: "Error calculating sandwich costs. Please try again." };
  }
};

const calculatePastingCosts = async (state) => {
  const { pasting, orderAndPaper } = state;
  const totalCards = parseInt(orderAndPaper.quantity, 10);

  if (!pasting.isPastingUsed) {
    return { pastingCostPerCard: 0 };
  }

  let totalPastingCosting = 0;

  // Get the pasting type
  const pastingType = pasting.pastingType;
  
  // Only process if pastingType is DST
  if (pastingType === "DST") {
    // Try all possible variations of the DST material name
    const materialNames = ["DST Type", "DST", "DST Decal FT7358"];
    let dstMaterial = null;
    
    // Try each possible material name until we find a match
    for (const name of materialNames) {
      const material = await fetchMaterialDetails(name);
      if (material) {
        dstMaterial = material;
        console.log(`Found material details for: ${name}`, dstMaterial);
        break;
      }
    }
    
    if (dstMaterial) {
      // Use the die dimensions for calculation
      const length = parseFloat(orderAndPaper.dieSize.length) * 2.54; // Convert to cm
      const breadth = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;
      
      // Calculate DST cost using the formula: (Length * Breadth * Rate)
      const dstCost = length * breadth * parseFloat(dstMaterial.finalCostPerUnit || 0);
      
      // Total pasting cost (not divided by cards yet)
      totalPastingCosting = dstCost;
      console.log(`DST cost calculation: Length=${length}cm, Breadth=${breadth}cm, Rate=${dstMaterial.finalCostPerUnit}, Total=${totalPastingCosting}`);
    } else {
      console.warn("Material details not found for any DST variant");
      // Provide a fallback cost
      const fallbackCost = 5.00; // Example fallback total cost
      totalPastingCosting = fallbackCost;
      console.log(`Using fallback DST cost: ${fallbackCost}`);
    }
  } else {
    console.warn(`Pasting type ${pastingType} is not currently supported for calculation`);
  }
  
  // Calculate per card cost, if it's extremely small, apply a minimum value
  // This ensures visibility in the UI
  let pastingCostPerCard = (totalPastingCosting / totalCards).toFixed(2);
  
  // Apply a minimum threshold of 0.01 if the cost is non-zero but rounds to zero
  if (totalPastingCosting > 0 && parseFloat(pastingCostPerCard) === 0) {
    pastingCostPerCard = "0.01"; // Minimum display value for non-zero costs
  }
  
  return { 
    pastingCostPerCard,
    totalPastingCost: totalPastingCosting.toFixed(2) // Also return the total cost for all cards
  };
};

// Function to calculate Die Cutting costs - simplified version
const calculateDieCuttingCosts = async (state) => {
  const { dieCutting, orderAndPaper } = state;
  const totalCards = parseInt(orderAndPaper.quantity, 10);

  // If die cutting is not used or if die cut option is No, return zero cost
  if (!dieCutting?.isDieCuttingUsed || dieCutting.difficulty === "No") {
    return { dieCuttingCostPerCard: 0 };
  }

  // Constants based on your provided image
  const DC_IMPRESSION_COST_PER_UNIT = 0.25; // ₹0.25 per unit

  try {
    // Get MR details for die cutting
    const mrType = dieCutting.dcMR;
    if (!mrType) {
      console.warn("No MR type specified for die cutting");
      return { dieCuttingCostPerCard: DC_IMPRESSION_COST_PER_UNIT.toFixed(2) };
    }

    // Fetch MR rate
    const mrDetails = await fetchMRDetailsForDieCutting(mrType);
    
    // MR cost is the finalRate from the database, or use fallback values
    let mrRate = 0;
    if (mrDetails) {
      mrRate = parseFloat(mrDetails.finalRate || 0);
    } else {
      // Fallback based on the image you provided
      if (mrType === "Simple") mrRate = 50;
      else if (mrType === "Complex") mrRate = 100;
      else if (mrType === "Super Complex") mrRate = 150;
      console.warn(`Using fallback MR cost for type: ${mrType}: ${mrRate}`);
    }

    let dcCostPerUnit = mrRate / totalCards;
    let pdcCostPerUnit = 0;

    // Add PDC cost if PDC is Yes (₹0.30 per unit)
    // const pdcCostPerUnit = dieCutting.pdc === "Yes" ? 0.30 : 0;
    if (dieCutting.pdc === "Yes") {
      pdcCostPerUnit = dcCostPerUnit;
    }

    // // Calculate cost per card: impression cost + MR cost per card + PDC cost if applicable
    // const dieCuttingCostPerCard = DC_IMPRESSION_COST_PER_UNIT + (mrRate / totalCards) + pdcCostPerUnit;
    const dcdieCuttingCostPerCard = DC_IMPRESSION_COST_PER_UNIT + dcCostPerUnit
    const pdcdieCuttingCostPerCard = DC_IMPRESSION_COST_PER_UNIT + pdcCostPerUnit
    
    console.log("dcdieCuttingCostPerCard", dcdieCuttingCostPerCard)
    console.log("pdcdieCuttingCostPerCard", pdcdieCuttingCostPerCard)

    const totalDieCuttingCost = dcdieCuttingCostPerCard + pdcdieCuttingCostPerCard;

    return { 
      dieCuttingCostPerCard: totalDieCuttingCost.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating die cutting costs:", error);
    return { dieCuttingCostPerCard: 0, error: "Error calculating die cutting costs" };
  }
};

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

    const digiCosts = await calculateDigiDetailsCosts(
      state.digiDetails,
      state.orderAndPaper.dieSize,
      parseInt(state.orderAndPaper.quantity, 10)
    );
    if (digiCosts.error) return { error: digiCosts.error };    

    // Handle Die Cutting Costs
    const dieCuttingCosts = await calculateDieCuttingCosts(state);
    if (dieCuttingCosts.error) return { error: dieCuttingCosts.error };

    // Handle Sandwich Costs
    const sandwichCosts = await calculateSandwichCosts(state.sandwich, state.orderAndPaper.quantity);
    if (sandwichCosts.error) return { error: sandwichCosts.error };

    // Handle Pasting Costs
    const pastingCosts = await calculatePastingCosts(state);
    if (pastingCosts.error) return { error: pastingCosts.error };

    // Combine all calculated costs
    return {
      ...paperAndCuttingCosts,
      ...lpCosts,
      ...fsCosts,
      ...embCosts,
      ...digiCosts,
      ...dieCuttingCosts,
      ...sandwichCosts,
      ...pastingCosts,
    };
  } catch (error) {
    console.error("Error calculating estimate costs:", error);
    return { error: "Error calculating costs. Please try again." };
  }
};