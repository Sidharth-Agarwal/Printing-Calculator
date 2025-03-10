import {
  fetchPaperDetails,
  fetchMaterialDetails,
  fetchMRDetailsForLPDetails,
  fetchMRDetailsForFSDetails,
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

  let totalLPCosting = 0;

  // Fetch MR details for all colors in LP details
  const mrDetailsArray = await fetchMRDetailsForLPDetails(lpDetails);
  console.log(mrDetailsArray)

  // Positive Film Calculations
  length = parseFloat(orderAndPaper.dieSize.length) * 2.54;
  breadth = parseFloat(orderAndPaper.dieSize.breadth) * 2.54;

  const positiveFilm = "Positive Film"; // Fallback to "Polymer Plate" if not provided
  const positives = await fetchMaterialDetails(positiveFilm);

  if (!positives) {
    console.warn(`Material details not found for plate type: ${plateType}`);
  }
  
  const postiveFilmCost = (length * breadth * positives.finalCostPerUnit);

  totalLPCosting = totalLPCosting + postiveFilmCost

  for (let i = 0; i < lpDetails.colorDetails.length; i++) {
    let lpCostForEachIteration = 0;

    const color = lpDetails.colorDetails[i];

    // Step 1: Calculate cost per color (Pantone type)
    const colorCostPerCard = 1; // INR 1 for color
    const impressionCostPerCard = 0.5; // INR 0.5 for impression
    let totalLPColorCost = (colorCostPerCard + impressionCostPerCard) * totalCards;
    console.log("color cost : ",totalLPColorCost)

    const plateArea =
      parseFloat(color.plateDimensions.length || 0) *
      parseFloat(color.plateDimensions.breadth || 0); // cm²

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
      totalMRRate = parseFloat(mrDetails.finalRate || 0)
    } else {
      console.warn(`No MR details found for color index ${i}`);
    }

    lpCostForEachIteration = totalLPColorCost + plateCost + totalMRRate
    
    totalLPCosting = totalLPCosting + lpCostForEachIteration
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

  // Calculate block cost outside the loop - only once for the entire project
  let totalBlockCost = 0;
  
  // Get the first valid foil details to calculate the block cost
  const validFoil = fsDetails.foilDetails.find(foil => 
    foil.blockDimension && foil.blockDimension.length && foil.blockDimension.breadth && foil.blockType
  );
  
  if (validFoil) {
    const blockMaterialDetails = await fetchMaterialDetails(validFoil.blockType);
    console.log(validFoil.blockType);
    
    if (blockMaterialDetails) {
      const blockArea = parseFloat(validFoil.blockDimension.length) * parseFloat(validFoil.blockDimension.breadth); // cm²
      totalBlockCost = blockArea * parseFloat(blockMaterialDetails.landedCost || 0);
    } else {
      console.warn(`No material details found for block type: ${validFoil.blockType}`);
    }
  }
  
  // Add block cost to total costing
  totalFSCosting += totalBlockCost;

  // Fetch MR details for all foils in FS details
  const mrDetailsArray = await fetchMRDetailsForFSDetails(fsDetails);
  console.log(mrDetailsArray);

  for (let i = 0; i < fsDetails.foilDetails.length; i++) {
    let fsCostForEachIteration = 0;
    
    const foil = fsDetails.foilDetails[i];

    // Validate block dimensions
    const blockDimensions = foil.blockDimension;
    if (!blockDimensions || !blockDimensions.length || !blockDimensions.breadth) {
      console.warn(`Invalid block dimensions for foil index ${i}`, foil);
      continue; // Skip invalid foils
    }
    
    // Step 1: Calculate foil cost
    const foilMaterialDetails = await fetchMaterialDetails(foil.foilType);
    console.log(foil.foilType);
    
    let foilCost = 0;
    if (foilMaterialDetails) {
      const foilArea = parseFloat(blockDimensions.length) * parseFloat(blockDimensions.breadth); // cm²
      foilCost = foilArea * parseFloat(foilMaterialDetails.finalCostPerUnit || 0);
    } else {
      console.warn(`No material details found for foil type: ${foil.foilType}`);
    }

    // Step 2: Calculate MR cost
    const mrDetails = mrDetailsArray[i];
    
    let totalMRRate = 0;
    if (mrDetails) {
      totalMRRate = parseFloat(mrDetails.finalRate || 0);
    } else {
      console.warn(`No MR details found for foil index ${i}`);
    }

    fsCostForEachIteration = foilCost + totalMRRate;
    
    totalFSCosting = totalFSCosting + fsCostForEachIteration;
  }

  const fsCostPerCard = totalFSCosting / totalCards;

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
    parseFloat(embDetails.plateDimensions.length || 0) *
    parseFloat(embDetails.plateDimensions.breadth || 0);
  
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

    // return {
    //   digiCostPerCard: (totalDigiCost / totalCards).toFixed(2),
    //   totalPapersRequired,
    //   paperCost: paperCost.toFixed(2),
    //   printingCost: printingCost.toFixed(2),
    // };
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
 
    // LP Details Calculations for Sandwich
    if (lpDetailsSandwich?.isLPUsed && lpDetailsSandwich.colorDetails?.length > 0) {
      // Fetch MR details for all colors in LP details
      const mrDetailsArraySandwich = await fetchMRDetailsForLPDetails(lpDetailsSandwich);
      console.log(mrDetailsArraySandwich);
 
      // Positive Film Calculations for Sandwich LP
      length = parseFloat(lpDetailsSandwich.plateDimensions?.length || 0);
      breadth = parseFloat(lpDetailsSandwich.plateDimensions?.breadth || 0);
 
      const positiveFilm = "Positive Film";
      const positives = await fetchMaterialDetails(positiveFilm);
 
      if (!positives) {
        console.warn(`Material details not found for Positive Film`);
      } else {
        const postiveFilmCost = (length * breadth * positives.finalCostPerUnit);
        totalLPCostSandwich = totalLPCostSandwich + postiveFilmCost;
      }
 
      for (let i = 0; i < lpDetailsSandwich.colorDetails.length; i++) {
        let lpCostForEachIteration = 0;
        
        const color = lpDetailsSandwich.colorDetails[i];
 
        // Step 1: Calculate cost per color (Pantone type)
        const colorCostPerCard = 1; // INR 1 for color
        const impressionCostPerCard = 0.5; // INR 0.5 for impression
        let totalLPColorCost = (colorCostPerCard + impressionCostPerCard) * totalCards;
        console.log("color cost : ", totalLPColorCost);
 
        const plateArea =
          parseFloat(color.plateDimensions.length || 0) *
          parseFloat(color.plateDimensions.breadth || 0); // cm²
 
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
 
    // FS Details Calculations for Sandwich
    if (fsDetailsSandwich?.isFSUsed && fsDetailsSandwich.foilDetails?.length > 0) {
      // Calculate block cost outside the loop - only once for the entire sandwich project
      let totalBlockCost = 0;
      
      // Get the first valid foil details to calculate the block cost
      const validFoil = fsDetailsSandwich.foilDetails.find(foil => 
        foil.blockDimension && foil.blockDimension.length && foil.blockDimension.breadth && foil.blockType
      );
      
      if (validFoil) {
        const blockMaterialDetails = await fetchMaterialDetails(validFoil.blockType);
        console.log(validFoil.blockType);
        
        if (blockMaterialDetails) {
          const blockArea = parseFloat(validFoil.blockDimension.length) * parseFloat(validFoil.blockDimension.breadth); // cm²
          totalBlockCost = blockArea * parseFloat(blockMaterialDetails.landedCost || 0);
        } else {
          console.warn(`No material details found for block type: ${validFoil.blockType}`);
        }
      }
      
      // Add block cost to total costing
      totalFSCostSandwich += totalBlockCost;
 
      // Fetch MR details for all foils in FS details
      const mrDetailsArraySandwich = await fetchMRDetailsForFSDetails(fsDetailsSandwich);
      console.log(mrDetailsArraySandwich);
 
      for (let i = 0; i < fsDetailsSandwich.foilDetails.length; i++) {
        let fsCostForEachIteration = 0;
        
        const foil = fsDetailsSandwich.foilDetails[i];
 
        // Validate block dimensions
        const blockDimensions = foil.blockDimension;
        if (!blockDimensions || !blockDimensions.length || !blockDimensions.breadth) {
          console.warn(`Invalid block dimensions for foil index ${i}`, foil);
          continue; // Skip invalid foils
        }
        
        // Step 1: Calculate foil cost
        const foilMaterialDetails = await fetchMaterialDetails(foil.foilType);
        console.log(foil.foilType);
        
        let foilCost = 0;
        if (foilMaterialDetails) {
          const foilArea = parseFloat(blockDimensions.length) * parseFloat(blockDimensions.breadth); // cm²
          foilCost = foilArea * parseFloat(foilMaterialDetails.finalCostPerUnit || 0);
        } else {
          console.warn(`No material details found for foil type: ${foil.foilType}`);
        }
 
        // Step 2: Calculate MR cost
        const mrDetails = mrDetailsArraySandwich[i];
        
        let totalMRRate = 0;
        if (mrDetails) {
          totalMRRate = parseFloat(mrDetails.finalRate || 0);
        } else {
          console.warn(`No MR details found for foil index ${i}`);
        }
 
        fsCostForEachIteration = foilCost + totalMRRate;
        
        totalFSCostSandwich = totalFSCostSandwich + fsCostForEachIteration;
      }
    }
 
    // EMB Details Calculations for Sandwich
    if (embDetailsSandwich?.isEMBUsed) {
      // Calculate plate area
      const plateArea = 
        parseFloat(embDetailsSandwich.plateDimensions.length || 0) *
        parseFloat(embDetailsSandwich.plateDimensions.breadth || 0);
      
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

// const calculatePastingCosts = async (state) => {
//   const { pasting, orderAndPaper } = state;
//   const totalCards = parseInt(orderAndPaper.quantity, 10);

//   if (!pasting.isPastingUsed) {
//     return { pastingCostPerCard: 0 };
//   }

//   let totalPastingCosting = 0;

//   // Get the pasting type
//   const pastingType = pasting.pastingType;
  
//   // Only process if pastingType is DST
//   if (pastingType === "DST") {
//     // Fetch material details for DST
//     const dstMaterial = await fetchMaterialDetails("DST Type");
//     console.log(dstMaterial);
    
//     if (dstMaterial) {
//       // Calculate based on material rate
//       const dstCost = parseFloat(dstMaterial.finalCostPerUnit || 0) * totalCards;
//       totalPastingCosting += dstCost;
//     } else {
//       console.warn("Material details not found for DST");
//     }
    
//     // Add MR cost if applicable
//     // This section can be expanded later if needed
//   } else {
//     console.warn(`Pasting type ${pastingType} is not currently supported for calculation`);
//   }
  
//   // Calculate per card cost
//   const pastingCostPerCard = (totalPastingCosting / totalCards).toFixed(2);
  
//   return { pastingCostPerCard };
// };
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
  
  // Calculate per card cost: (Length * Breadth * Rate) / total cards
  const pastingCostPerCard = (totalPastingCosting / totalCards).toFixed(2);
  
  return { pastingCostPerCard };
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
      ...sandwichCosts,
      ...pastingCosts,
    };
  } catch (error) {
    console.error("Error calculating estimate costs:", error);
    return { error: "Error calculating costs. Please try again." };
  }
};

// export const calculateEstimateCosts = async (state) => {
//   try {
//     const paperAndCuttingCosts = await calculatePaperAndCuttingCosts(state);
//     if (paperAndCuttingCosts.error) return { error: paperAndCuttingCosts.error };

//     const lpCosts = await calculateLPCosts(state);
//     if (lpCosts.error) return { error: lpCosts.error };

//     const fsCosts = await calculateFSCosts(state);
//     if (fsCosts.error) return { error: fsCosts.error };

//     const embCosts = await calculateEMBCosts(state);
//     if (embCosts.error) return { error: embCosts.error };

//     const digiCosts = await calculateDigiDetailsCosts(
//       state.digiDetails,
//       state.orderAndPaper.dieSize,
//       parseInt(state.orderAndPaper.quantity, 10)
//     );
//     if (digiCosts.error) return { error: digiCosts.error };    

//     // Handle Sandwich Costs
//     const sandwichCosts = await calculateSandwichCosts(state.sandwich, state.orderAndPaper.quantity);
//     if (sandwichCosts.error) return { error: sandwichCosts.error };

//     // Combine all calculated costs
//     return {
//       ...paperAndCuttingCosts,
//       ...lpCosts,
//       ...fsCosts,
//       ...embCosts,
//       ...digiCosts,
//       ...sandwichCosts,
//     };
//   } catch (error) {
//     console.error("Error calculating estimate costs:", error);
//     return { error: "Error calculating costs. Please try again." };
//   }
// };
