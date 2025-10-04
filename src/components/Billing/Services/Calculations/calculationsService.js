import { 
  calculatePaperAndCuttingCosts, 
  calculateLPCosts,
  calculateFSCosts,
  calculateEMBCosts,
  calculateScreenPrintCosts,
  calculateDigiDetailsCosts,
  calculatePreDieCuttingCosts,
  calculateDieCuttingCosts,
  calculatePostDCCosts,
  calculateFoldAndPasteCosts,
  calculateDstPasteCosts,
  calculateQCCosts,
  calculatePackingCosts,
  calculateMiscCosts,
  calculateWastage,
  calculateOverhead,
  calculateMarkup,
  calculateGST,
  calculateSandwichCosts,
  calculateMagnetCosts,
  calculateNotebookCosts
} from './Calculators';

// Import loyalty service functions
import { getClientCurrentTier, applyLoyaltyDiscount } from '../../../../utils/LoyaltyService';

// Import precision calculation helpers
import { 
  calculateWithPrecision, 
  addCurrency, 
  multiplyCurrency, 
  calculatePercentage 
} from '../../../../utils/calculationValidator';

/**
 * Performs all necessary calculations based on the form state
 * @param {Object} state - The complete form state
 * @returns {Promise<Object>} - Complete calculation results
 */
export const performCalculations = async (state) => {
  try {
    // Initialize results object
    const results = {};
    
    // Validate state
    if (!state || !state.orderAndPaper || !state.client?.clientId) {
      return { error: "Invalid form state for calculations" };
    }

    // Calculate paper and cutting costs
    const paperResults = await calculatePaperAndCuttingCosts(state);
    if (paperResults.error) {
      console.warn("Paper calculation error:", paperResults.error);
    }
    
    // Add paper results to the total results
    Object.assign(results, paperResults);

    // Add paper calculations to state for notebook calculator to use
    const stateWithPaperCalcs = {
      ...state,
      paperCalculations: paperResults
    };

    // Check if this is a notebook job type and notebook details are used
    if (state.orderAndPaper.jobType === "Notebook" && state.notebookDetails?.isNotebookUsed) {
      const notebookResults = await calculateNotebookCosts(stateWithPaperCalcs);
      if (notebookResults.error) {
        console.warn("Notebook calculation error:", notebookResults.error);
      } else {
        Object.assign(results, notebookResults);
      }
    }

    // Production services calculations
    if (state.lpDetails?.isLPUsed) {
      const lpResults = await calculateLPCosts(state);
      if (lpResults.error) {
        console.warn("LP calculation error:", lpResults.error);
      } else {
        Object.assign(results, lpResults);
      }
    }
    
    if (state.fsDetails?.isFSUsed) {
      const fsResults = await calculateFSCosts(state);
      if (fsResults.error) {
        console.warn("FS calculation error:", fsResults.error);
      } else {
        Object.assign(results, fsResults);
      }
    }
    
    // Calculate EMB (Embossing) costs if used
    if (state.embDetails?.isEMBUsed) {
      const embResults = await calculateEMBCosts(state);
      if (embResults.error) {
        console.warn("EMB calculation error:", embResults.error);
      } else {
        Object.assign(results, embResults);
      }
    }
    
    if (state.screenPrint?.isScreenPrintUsed) {
      const screenPrintResults = await calculateScreenPrintCosts(state);
      if (screenPrintResults.error) {
        console.warn("Screen printing calculation error:", screenPrintResults.error);
      } else {
        Object.assign(results, screenPrintResults);
      }
    }
    
    if (state.digiDetails?.isDigiUsed) {
      const digiResults = await calculateDigiDetailsCosts(state);
      if (digiResults.error) {
        console.warn("Digital printing calculation error:", digiResults.error);
      } else {
        Object.assign(results, digiResults);
      }
    }

    // Post-production services calculations
    if (state.preDieCutting?.isPreDieCuttingUsed) {
      const preDieCuttingResults = await calculatePreDieCuttingCosts(state);
      if (preDieCuttingResults.error) {
        console.warn("Pre die cutting calculation error:", preDieCuttingResults.error);
      } else {
        Object.assign(results, preDieCuttingResults);
      }
    }
    
    if (state.dieCutting?.isDieCuttingUsed) {
      const dieCuttingResults = await calculateDieCuttingCosts(state);
      if (dieCuttingResults.error) {
        console.warn("Die cutting calculation error:", dieCuttingResults.error);
      } else {
        Object.assign(results, dieCuttingResults);
      }
    }
    
    if (state.postDC?.isPostDCUsed) {
      const postDCResults = await calculatePostDCCosts(state);
      if (postDCResults.error) {
        console.warn("Post die cutting calculation error:", postDCResults.error);
      } else {
        Object.assign(results, postDCResults);
      }
    }
    
    // NEW: Calculate Fold And Paste costs if used
    if (state.foldAndPaste?.isFoldAndPasteUsed) {
      const foldAndPasteResults = await calculateFoldAndPasteCosts(state);
      if (foldAndPasteResults.error) {
        console.warn("Fold and paste calculation error:", foldAndPasteResults.error);
      } else {
        Object.assign(results, foldAndPasteResults);
      }
    }
    
    // NEW: Calculate DST Paste costs if used
    if (state.dstPaste?.isDstPasteUsed) {
      const dstPasteResults = await calculateDstPasteCosts(state);
      if (dstPasteResults.error) {
        console.warn("DST paste calculation error:", dstPasteResults.error);
      } else {
        Object.assign(results, dstPasteResults);
      }
    }
    
    // NEW: Calculate Magnet costs if used
    if (state.magnet?.isMagnetUsed) {
      const magnetResults = await calculateMagnetCosts(state);
      if (magnetResults.error) {
        console.warn("Magnet calculation error:", magnetResults.error);
      } else {
        Object.assign(results, magnetResults);
      }
    }
    
    if (state.qc?.isQCUsed) {
      const qcResults = await calculateQCCosts(state);
      if (qcResults.error) {
        console.warn("QC calculation error:", qcResults.error);
      } else {
        Object.assign(results, qcResults);
      }
    }
    
    if (state.packing?.isPackingUsed) {
      const packingResults = await calculatePackingCosts(state);
      if (packingResults.error) {
        console.warn("Packing calculation error:", packingResults.error);
      } else {
        Object.assign(results, packingResults);
      }
    }
    
    if (state.misc?.isMiscUsed) {
      const miscResults = await calculateMiscCosts(state);
      if (miscResults.error) {
        console.warn("Misc calculation error:", miscResults.error);
      } else {
        Object.assign(results, miscResults);
      }
    }
    
    if (state.sandwich?.isSandwichComponentUsed) {
      const sandwichResults = await calculateSandwichCosts(state);
      if (sandwichResults.error) {
        console.warn("Sandwich calculation error:", sandwichResults.error);
      } else {
        Object.assign(results, sandwichResults);
      }
    }

    return results;
  } catch (error) {
    console.error("Error performing calculations:", error);
    return { error: "Error performing calculations" };
  }
};

/**
 * Performs complete calculations according to the following flow:
 * 1. Calculate production services costs
 * 2. Calculate post-production services costs
 * 3. Add QC costs (if enabled)
 * 4. Calculate wastage and overhead on base cost
 * 5. Calculate COGS (base + wastage + overhead)
 * 6. Add packing costs (if enabled)
 * 7. Add misc costs (if selected)
 * 8. Apply markup to get final cost
 * 9. Apply GST based on job type to get total with tax
 * 10. Apply loyalty discount if applicable (NEW)
 **/

export const performCompleteCalculations = async (
  state, 
  miscChargePerCard = null,
  markupPercentage = null,
  markupType = "MARKUP TIMELESS",
  cachedGSTRate = null
) => {
  try {
    console.log("Starting complete calculations with:", {
      miscChargePerCard,
      markupType,
      markupPercentage,
      quantity: state.orderAndPaper?.quantity,
      jobType: state.orderAndPaper?.jobType,
      cachedGSTRate
    });

    // Get base calculations first
    const baseCalculations = await performCalculations(state);
    
    // If there's an error in base calculations, return it
    if (baseCalculations.error) {
      console.error("Base calculation error:", baseCalculations.error);
      return { error: baseCalculations.error };
    }

    console.log("Base calculations completed:", baseCalculations);

    // Define production and post-production cost fields
    const productionFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'screenPrintCostPerCard',
      'digiCostPerCard',
      'notebookCostPerCard',
    ];
    
    const postProductionFields = [
      'preDieCuttingCostPerCard',
      'dieCuttingCostPerCard',
      'postDCCostPerCard',
      'foldAndPasteCostPerCard',
      'dstPasteCostPerCard',
      'magnetCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'sandwichPaperCostPerCard',
    ];    

    // CRITICAL FIX: Calculate production costs using precision addition
    let productionCost = "0.00";
    productionFields.forEach(key => {
      const value = baseCalculations[key];
      const parsedValue = value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0;
      console.log(`Production field ${key}: ${value} -> ${parsedValue}`);
      productionCost = addCurrency(productionCost, parsedValue.toString());
    });
    
    // CRITICAL FIX: Calculate post-production costs using precision addition
    let postProductionCost = "0.00";
    postProductionFields.forEach(key => {
      const value = baseCalculations[key];
      const parsedValue = value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0;
      console.log(`Post-production field ${key}: ${value} -> ${parsedValue}`);
      postProductionCost = addCurrency(postProductionCost, parsedValue.toString());
    });
    
    console.log("Production cost:", productionCost);
    console.log("Post-production cost (without QC):", postProductionCost);
    
    // Calculate initial base cost without QC using precision addition
    const initialBaseCost = addCurrency(productionCost, postProductionCost);
    console.log("Initial base cost (without QC):", initialBaseCost);

    // 1. Calculate QC costs if QC is enabled
    let qcCost = "0.00";
    if (state.qc?.isQCUsed) {
      // Use the QC value from calculations or calculate if not present
      if (baseCalculations.qcCostPerCard) {
        qcCost = (parseFloat(baseCalculations.qcCostPerCard) || 0).toString();
      } else {
        const qcResult = await calculateQCCosts(state);
        qcCost = (parseFloat(qcResult.qcCostPerCard) || 0).toString();
      }
      console.log("QC cost per card:", qcCost);
    }

    // Add QC to get complete base cost using precision addition
    const baseCost = addCurrency(initialBaseCost, qcCost);
    console.log("Base cost with QC:", baseCost);

    // Calculate wastage and overhead on base cost
    const wastageResult = await calculateWastage(parseFloat(baseCost));
    const wastagePercentage = wastageResult.wastagePercentage;
    const wastageCost = wastageResult.wastageAmount;
    
    console.log("Wastage calculation:", {
      percentage: wastagePercentage,
      amount: wastageCost
    });
    
    const overheadResult = await calculateOverhead(parseFloat(baseCost));
    const overheadPercentage = overheadResult.overheadPercentage;
    const overheadCost = overheadResult.overheadAmount;
    
    console.log("Overhead calculation:", {
      percentage: overheadPercentage,
      amount: overheadCost
    });
    
    // CRITICAL FIX: Calculate COGS using precision addition
    const COGS = addCurrency(addCurrency(baseCost, wastageCost), overheadCost);
    console.log("COGS:", COGS);

    // 2. Calculate Packing cost if enabled (applied to COGS)
    let packingCost = "0.00";
    let packingPercentage = 0;
    
    if (state.packing?.isPackingUsed) {
      // Get packing percentage from calculations or fetch it
      if (baseCalculations.packingPercentage) {
        packingPercentage = parseFloat(baseCalculations.packingPercentage) || 0;
      } else {
        const packingResult = await calculatePackingCosts(state);
        packingPercentage = parseFloat(packingResult.packingPercentage) || 0;
      }
      
      // CRITICAL FIX: Calculate packing cost using precision percentage calculation
      packingCost = calculatePercentage(COGS, packingPercentage);
      
      console.log("Packing cost calculation:", {
        COGS,
        percentage: packingPercentage,
        costPerCard: packingCost
      });
    }

    // CRITICAL FIX: Calculate cost with packing using precision addition
    const costWithPacking = addCurrency(COGS, packingCost);
    console.log("Cost with packing:", costWithPacking);
    
    // 3. Calculate Misc cost if enabled
    let miscCost = "0.00";
    
    if (state.misc?.isMiscUsed) {
      // Use provided misc charge if available, otherwise fetch from database
      if (miscChargePerCard !== null) {
        miscCost = miscChargePerCard.toString();
      } else if (baseCalculations.miscCostPerCard) {
        miscCost = (parseFloat(baseCalculations.miscCostPerCard) || 0).toString();
      } else {
        const miscResult = await calculateMiscCosts(state);
        miscCost = (parseFloat(miscResult.miscCostPerCard) || 0).toString();
      }
      console.log("Misc cost per card:", miscCost);
    }

    // CRITICAL FIX: Calculate cost with misc using precision addition
    const costWithMisc = addCurrency(costWithPacking, miscCost);
    console.log("Cost with misc:", costWithMisc);
    
    // Calculate markup using specified percentage or fetch from DB
    let markupResult;
    if (markupPercentage !== null && typeof markupPercentage === 'number') {
      // CRITICAL FIX: Use precision calculation for markup
      const markupAmount = calculatePercentage(costWithMisc, markupPercentage);
      
      markupResult = {
        markupType: markupType,
        markupPercentage: markupPercentage,
        markupAmount: markupAmount
      };
      console.log("Using provided markup percentage:", markupPercentage);
    } else {
      // Otherwise fetch from database based on markup type
      console.log("Fetching markup from database for type:", markupType);
      markupResult = await calculateMarkup(parseFloat(costWithMisc), markupType);
      
      // Ensure the markupPercentage is a number
      if (typeof markupResult.markupPercentage !== 'number') {
        console.error("Invalid markup percentage type:", typeof markupResult.markupPercentage);
        console.error("Markup result:", markupResult);
        
        // Try to convert to number or use default
        const numericPercentage = parseFloat(markupResult.markupPercentage);
        if (!isNaN(numericPercentage)) {
          markupResult.markupPercentage = numericPercentage;
          markupResult.markupAmount = calculatePercentage(costWithMisc, numericPercentage);
        } else {
          // Use default fallback
          markupResult.markupPercentage = 50;
          markupResult.markupAmount = calculatePercentage(costWithMisc, 50);
        }
      }
    }
    
    console.log("Markup calculation:", markupResult);
    
    const markupCost = markupResult.markupAmount;
    
    // CRITICAL FIX: Calculate total cost per card using precision addition
    const totalCostPerCard = addCurrency(costWithMisc, markupCost);
    
    // CRITICAL FIX: Calculate total cost using precision multiplication
    const totalCost = multiplyCurrency(totalCostPerCard, state.orderAndPaper?.quantity || 0);
    
    console.log("Cost calculation after markup:", {
      totalCostPerCard,
      quantity: state.orderAndPaper?.quantity,
      totalCost
    });

    // 4. Calculate GST using cached rate or fetch from database
    let gstResult;
    if (cachedGSTRate !== null) {
      // CRITICAL FIX: Use precision calculation for GST
      const gstAmount = calculatePercentage(totalCost, cachedGSTRate);
      const totalWithGST = addCurrency(totalCost, gstAmount);
      
      gstResult = {
        gstRate: cachedGSTRate,
        gstAmount: gstAmount,
        totalWithGST: totalWithGST,
        success: true
      };
      console.log("Using cached GST rate:", cachedGSTRate + "%");
    } else {
      // Fallback to database fetch
      console.log("No cached GST rate, fetching from database...");
      const jobType = state.orderAndPaper?.jobType || "Card";
      gstResult = await calculateGST(parseFloat(totalCost), jobType);
      
      // If GST fetch failed, handle the error
      if (!gstResult.success) {
        console.error("GST calculation failed:", gstResult.error);
        return { 
          ...baseCalculations,
          error: `GST calculation failed: ${gstResult.error}` 
        };
      }
      
      // CRITICAL FIX: Ensure GST calculations use precision
      gstResult.gstAmount = calculatePercentage(totalCost, gstResult.gstRate);
      gstResult.totalWithGST = addCurrency(totalCost, gstResult.gstAmount);
    }
    
    console.log("GST calculation:", {
      jobType: state.orderAndPaper?.jobType,
      gstRate: gstResult.gstRate,
      gstAmount: gstResult.gstAmount,
      totalWithGST: gstResult.totalWithGST
    });
    
    const gstAmount = gstResult.gstAmount;
    const totalWithGST = gstResult.totalWithGST;
    
    // 5. NEW: Apply loyalty discount if applicable
    let finalCalculations = {
      // Original base calculations
      ...baseCalculations,
      
      // Cost components with detailed breakdown
      productionCost: parseFloat(productionCost).toFixed(2),
      postProductionCost: parseFloat(postProductionCost).toFixed(2),
      qcCostPerCard: parseFloat(qcCost).toFixed(2),
      baseCost: parseFloat(baseCost).toFixed(2),
      
      // Wastage and overhead
      wastagePercentage: wastagePercentage,
      wastageAmount: parseFloat(wastageCost).toFixed(2),
      overheadPercentage: overheadPercentage,
      overheadAmount: parseFloat(overheadCost).toFixed(2),
      
      // COGS
      COGS: parseFloat(COGS).toFixed(2),
      
      // Packing
      packingPercentage: packingPercentage,
      packingCostPerCard: parseFloat(packingCost).toFixed(2),
      costWithPacking: parseFloat(costWithPacking).toFixed(2),
      
      // Misc
      miscUsed: state.misc?.isMiscUsed || false,
      miscCostPerCard: parseFloat(miscCost).toFixed(2),
      costWithMisc: parseFloat(costWithMisc).toFixed(2),
      
      // Markup information
      markupType: markupResult.markupType,
      markupPercentage: markupResult.markupPercentage,
      markupAmount: parseFloat(markupResult.markupAmount).toFixed(2),
      
      // GST information
      gstRate: gstResult.gstRate,
      gstAmount: parseFloat(gstResult.gstAmount).toFixed(2),
      
      // Final totals
      subtotalPerCard: parseFloat(costWithMisc).toFixed(2),
      totalCostPerCard: parseFloat(totalCostPerCard).toFixed(2),
      totalCost: parseFloat(totalCost).toFixed(2),
      totalWithGST: parseFloat(totalWithGST).toFixed(2),
      
      // ⭐ NEW: Include totalSheetsRequired from paper calculations
      totalSheetsRequired: baseCalculations.totalSheetsRequired || 0
    };
    
    // Check for loyalty discount only if this is for an actual client (not just preview)
    if (state.client?.clientId && state.isLoyaltyEligible) {
      try {
        // Try to fetch client's current loyalty tier
        const clientTier = await getClientCurrentTier(state.client.clientId);
        
        // If client has a tier with a discount, apply it
        if (clientTier && clientTier.discount > 0) {
          console.log("Applying loyalty discount:", clientTier.discount + "%");
          
          // Apply loyalty discount to calculations
          finalCalculations = applyLoyaltyDiscount(finalCalculations, clientTier);
        }
      } catch (loyaltyError) {
        console.error("Error applying loyalty discount:", loyaltyError);
        // Continue without loyalty discount
      }
    }
    
    console.log("Complete calculation results:", finalCalculations);
    
    return finalCalculations;
  } catch (error) {
    console.error("Error in comprehensive calculations:", error);
    return { error: "Error calculating complete costs. Please try again." };
  }
};

/**
 * Function to recalculate totals when misc charge or markup changes
 * without needing to regenerate all base costs.
 * Follows the same calculation flow as performCompleteCalculations.
 * 
 * @param {Object} baseCalculations - Base calculations from previous calculation
 * @param {Number} miscChargePerCard - Misc charge per card
 * @param {Number} markupPercentage - Markup percentage
 * @param {Number} quantity - Total quantity of cards
 * @param {String} markupType - Markup type
 * @param {String} jobType - Job type for GST calculations
 * @param {Object} clientLoyaltyTier - Client's loyalty tier info (optional)
 * @param {Number} cachedGSTRate - Cached GST rate (optional)
 * @returns {Promise<Object>} - Updated calculations with new totals
 */
export const recalculateTotals = async (
  baseCalculations, 
  miscChargePerCard, 
  markupPercentage, 
  quantity,
  markupType = "MARKUP TIMELESS",
  jobType = "Card",
  clientLoyaltyTier = null,
  cachedGSTRate = null
) => {
  try {
    console.log("Recalculating totals with:", {
      miscChargePerCard,
      markupPercentage,
      quantity,
      markupType,
      jobType,
      cachedGSTRate
    });

    // Define production and post-production cost fields
    const productionFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'screenPrintCostPerCard',
      'digiCostPerCard',
      'notebookCostPerCard',
    ];
    
    const postProductionFields = [
      'preDieCuttingCostPerCard',
      'dieCuttingCostPerCard',
      'postDCCostPerCard',
      'foldAndPasteCostPerCard',
      'dstPasteCostPerCard',
      'magnetCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'sandwichPaperCostPerCard',
    ];    

    // CRITICAL FIX: Calculate production costs using precision addition
    let productionCost = "0.00";
    productionFields.forEach(key => {
      const value = baseCalculations[key];
      const parsedValue = value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0;
      productionCost = addCurrency(productionCost, parsedValue.toString());
    });
    
    // CRITICAL FIX: Calculate post-production costs using precision addition
    let postProductionCost = "0.00";
    postProductionFields.forEach(key => {
      const value = baseCalculations[key];
      const parsedValue = value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0;
      postProductionCost = addCurrency(postProductionCost, parsedValue.toString());
    });
    
    // Get QC cost
    const qcCost = baseCalculations.qcCostPerCard 
      ? (parseFloat(baseCalculations.qcCostPerCard) || 0).toString()
      : "0.00";
    
    // CRITICAL FIX: Calculate base cost using precision addition
    const baseCost = addCurrency(addCurrency(productionCost, postProductionCost), qcCost);

    // Calculate wastage and overhead on base cost
    const wastageResult = await calculateWastage(parseFloat(baseCost));
    const wastagePercentage = wastageResult.wastagePercentage;
    const wastageCost = wastageResult.wastageAmount;
    
    const overheadResult = await calculateOverhead(parseFloat(baseCost));
    const overheadPercentage = overheadResult.overheadPercentage;
    const overheadCost = overheadResult.overheadAmount;
    
    // CRITICAL FIX: Calculate COGS using precision addition
    const COGS = addCurrency(addCurrency(baseCost, wastageCost), overheadCost);
    
    // Get packing percentage and calculate cost
    const packingPercentage = baseCalculations.packingPercentage 
      ? parseFloat(baseCalculations.packingPercentage) 
      : 0;
    
    // Calculate packing cost as percentage of COGS
    // Check if packing is used in the base calculations
    const packingUsed = baseCalculations.packingCostPerCard && parseFloat(baseCalculations.packingCostPerCard) > 0;
    const packingCost = packingUsed ? calculatePercentage(COGS, packingPercentage) : "0.00";
    
    // CRITICAL FIX: Calculate cost with packing using precision addition
    const costWithPacking = addCurrency(COGS, packingCost);
    
    // Add misc charge if selected
    const miscUsed = baseCalculations.miscUsed || false;
    const miscCharge = miscUsed ? miscChargePerCard.toString() : "0.00";
    const costWithMisc = addCurrency(costWithPacking, miscCharge);
    
    // CRITICAL FIX: Calculate markup using precision percentage calculation
    const markupCost = calculatePercentage(costWithMisc, markupPercentage);
    
    // CRITICAL FIX: Calculate total cost per card using precision addition
    const totalCostPerCard = addCurrency(costWithMisc, markupCost);
    
    // CRITICAL FIX: Calculate total cost using precision multiplication
    const totalCost = multiplyCurrency(totalCostPerCard, quantity);
    
    // Use cached GST rate instead of calling calculateGST
    let gstAmount, totalWithGST, gstRate;
    
    if (cachedGSTRate !== null) {
      // CRITICAL FIX: Use precision calculations for GST
      gstRate = cachedGSTRate;
      gstAmount = calculatePercentage(totalCost, cachedGSTRate);
      totalWithGST = addCurrency(totalCost, gstAmount);
      console.log("Using cached GST rate in recalculation:", cachedGSTRate + "%");
    } else {
      // Fallback to database fetch
      console.log("No cached GST rate in recalculation, fetching from database...");
      const gstResult = await calculateGST(parseFloat(totalCost), jobType);
      
      if (!gstResult.success) {
        // Handle GST fetch error
        console.error("GST fetch failed in recalculation:", gstResult.error);
        return {
          ...baseCalculations,
          error: `GST calculation failed: ${gstResult.error}`
        };
      }
      
      gstRate = gstResult.gstRate;
      // CRITICAL FIX: Use precision calculations for GST
      gstAmount = calculatePercentage(totalCost, gstResult.gstRate);
      totalWithGST = addCurrency(totalCost, gstAmount);
    }
    
    // Prepare updated calculations
    let updatedCalculations = {
      ...baseCalculations, // Preserve original base calculations
      
      productionCost: parseFloat(productionCost).toFixed(2),
      postProductionCost: parseFloat(postProductionCost).toFixed(2),
      qcCostPerCard: parseFloat(qcCost).toFixed(2),
      baseCost: parseFloat(baseCost).toFixed(2),
      
      // Wastage and overhead
      wastagePercentage: wastagePercentage,
      wastageAmount: parseFloat(wastageCost).toFixed(2),
      overheadPercentage: overheadPercentage,
      overheadAmount: parseFloat(overheadCost).toFixed(2),
      
      // COGS
      COGS: parseFloat(COGS).toFixed(2),
      
      // Packing
      packingPercentage: packingPercentage,
      packingCostPerCard: parseFloat(packingCost).toFixed(2),
      costWithPacking: parseFloat(costWithPacking).toFixed(2),
      
      // Misc
      miscUsed: miscUsed,
      miscCostPerCard: parseFloat(miscCharge).toFixed(2),
      costWithMisc: parseFloat(costWithMisc).toFixed(2),
      
      // Markup
      markupType: markupType,
      markupPercentage: markupPercentage,
      markupAmount: parseFloat(markupCost).toFixed(2),
      
      // GST
      gstRate: gstRate,
      gstAmount: parseFloat(gstAmount).toFixed(2),
      
      // Totals
      subtotalPerCard: parseFloat(costWithMisc).toFixed(2),
      totalCostPerCard: parseFloat(totalCostPerCard).toFixed(2),
      totalCost: parseFloat(totalCost).toFixed(2),
      totalWithGST: parseFloat(totalWithGST).toFixed(2),
      
      // ⭐ NEW: Preserve totalSheetsRequired
      totalSheetsRequired: baseCalculations.totalSheetsRequired || 0
    };
    
    // Apply loyalty discount if applicable
    if (clientLoyaltyTier && clientLoyaltyTier.discount > 0) {
      updatedCalculations = applyLoyaltyDiscount(updatedCalculations, clientLoyaltyTier);
    }
    
    return updatedCalculations;
  } catch (error) {
    console.error("Error recalculating totals:", error);
    
    // Fallback to synchronous calculation with default percentages if the async calls fail
    const WASTAGE_PERCENTAGE = 5;
    const OVERHEAD_PERCENTAGE = 35;
    const DEFAULT_GST_RATE = 18;
    
    // Simple fallback calculation using precision helpers
    const baseCost = baseCalculations.baseCost || "0.00";
    const wastageCost = calculatePercentage(baseCost, WASTAGE_PERCENTAGE);
    const overheadCost = calculatePercentage(baseCost, OVERHEAD_PERCENTAGE);
    const COGS = addCurrency(addCurrency(baseCost, wastageCost), overheadCost);
    
    // Calculate packing cost as percentage of COGS
    const packingPercentage = baseCalculations.packingPercentage 
      ? parseFloat(baseCalculations.packingPercentage) 
      : 0;
    const packingCost = baseCalculations.packingCostPerCard && parseFloat(baseCalculations.packingCostPerCard) > 0
      ? calculatePercentage(COGS, packingPercentage)
      : "0.00";
    
    const costWithPacking = addCurrency(COGS, packingCost);
    
    const miscUsed = baseCalculations.miscUsed || false;
    const miscCharge = miscUsed ? miscChargePerCard.toString() : "0.00";
    const costWithMisc = addCurrency(costWithPacking, miscCharge);
    
    const markupCost = calculatePercentage(costWithMisc, markupPercentage);
    const totalCostPerCard = addCurrency(costWithMisc, markupCost);
    const totalCost = multiplyCurrency(totalCostPerCard, quantity);
    
    // Calculate GST (use cached rate if available, otherwise fallback)
    const gstRate = cachedGSTRate !== null ? cachedGSTRate : DEFAULT_GST_RATE;
    const gstAmount = calculatePercentage(totalCost, gstRate);
    const totalWithGST = addCurrency(totalCost, gstAmount);
    
    // Apply loyalty discount if applicable
    let updatedCalculations = {
      ...baseCalculations, // Preserve original base calculations
      error: "Error recalculating with database values, using fallback calculations.",
      baseCost: parseFloat(baseCost).toFixed(2),
      wastagePercentage: WASTAGE_PERCENTAGE,
      wastageAmount: parseFloat(wastageCost).toFixed(2),
      overheadPercentage: OVERHEAD_PERCENTAGE,
      overheadAmount: parseFloat(overheadCost).toFixed(2),
      COGS: parseFloat(COGS).toFixed(2),
      packingPercentage: packingPercentage,
      packingCostPerCard: parseFloat(packingCost).toFixed(2),
      costWithPacking: parseFloat(costWithPacking).toFixed(2),
      miscUsed: miscUsed,
      miscCostPerCard: parseFloat(miscCharge).toFixed(2),
      costWithMisc: parseFloat(costWithMisc).toFixed(2),
      markupType: markupType,
      markupPercentage: markupPercentage,
      markupAmount: parseFloat(markupCost).toFixed(2),
      subtotalPerCard: parseFloat(costWithMisc).toFixed(2),
      totalCostPerCard: parseFloat(totalCostPerCard).toFixed(2),
      totalCost: parseFloat(totalCost).toFixed(2),
      gstRate: gstRate,
      gstAmount: parseFloat(gstAmount).toFixed(2),
      totalWithGST: parseFloat(totalWithGST).toFixed(2),
      
      // ⭐ NEW: Preserve totalSheetsRequired even in fallback
      totalSheetsRequired: baseCalculations.totalSheetsRequired || 0
    };
    
    // Apply loyalty discount if applicable using precision calculations
    if (clientLoyaltyTier && clientLoyaltyTier.discount > 0) {
      const discountPercent = clientLoyaltyTier.discount;
      const discountAmount = calculatePercentage(totalCost, discountPercent);
      const discountedTotal = addCurrency(totalCost, `-${discountAmount}`);
      const newGstAmount = calculatePercentage(discountedTotal, gstRate);
      const newTotalWithGST = addCurrency(discountedTotal, newGstAmount);
      
      updatedCalculations = {
        ...updatedCalculations,
        loyaltyTierId: clientLoyaltyTier.dbId,
        loyaltyTierName: clientLoyaltyTier.name,
        loyaltyDiscount: discountPercent,
        loyaltyDiscountAmount: parseFloat(discountAmount).toFixed(2),
        discountedTotalCost: parseFloat(discountedTotal).toFixed(2),
        originalTotalCost: parseFloat(totalCost).toFixed(2),
        gstAmount: parseFloat(newGstAmount).toFixed(2),
        totalWithGST: parseFloat(newTotalWithGST).toFixed(2)
      };
    }
    
    return updatedCalculations;
  }
};

/**
 * NEW: Function to recalculate markup for edit mode
 * This ensures the markup is calculated on the correct base amount shown in UI
 * @param {Object} calculations - Existing calculations
 * @param {Number} newMarkupPercentage - New markup percentage
 * @param {String} newMarkupType - New markup type
 * @returns {Object} - Updated calculations with new markup
 */
export const recalculateMarkupForEdit = (calculations, newMarkupPercentage, newMarkupType) => {
  try {
    console.log("Recalculating markup for edit mode:", {
      subtotalPerCard: calculations.subtotalPerCard,
      newMarkupPercentage,
      newMarkupType
    });

    // Use the subtotalPerCard as the base for markup calculation in edit mode
    const subtotalPerCard = calculations.subtotalPerCard || calculations.costWithMisc || "0.00";
    
    // CRITICAL FIX: Calculate new markup amount using precision
    const newMarkupAmount = calculatePercentage(subtotalPerCard, newMarkupPercentage);
    
    // CRITICAL FIX: Calculate new total cost per card using precision addition
    const newTotalCostPerCard = addCurrency(subtotalPerCard, newMarkupAmount);
    
    // Calculate total for all cards using precision multiplication
    const quantity = parseInt(calculations.quantity || 1);
    const newTotalCost = multiplyCurrency(newTotalCostPerCard, quantity);
    
    // Recalculate GST on the new total using precision
    const gstRate = parseFloat(calculations.gstRate || 18);
    const newGstAmount = calculatePercentage(newTotalCost, gstRate);
    const newTotalWithGST = addCurrency(newTotalCost, newGstAmount);
    
    // Return updated calculations
    const updatedCalculations = {
      ...calculations,
      markupType: newMarkupType,
      markupPercentage: newMarkupPercentage,
      markupAmount: parseFloat(newMarkupAmount).toFixed(2),
      totalCostPerCard: parseFloat(newTotalCostPerCard).toFixed(2),
      totalCost: parseFloat(newTotalCost).toFixed(2),
      gstAmount: parseFloat(newGstAmount).toFixed(2),
      totalWithGST: parseFloat(newTotalWithGST).toFixed(2),
      
      // ⭐ NEW: Preserve totalSheetsRequired
      totalSheetsRequired: calculations.totalSheetsRequired || 0
    };
    
    console.log("Updated calculations for edit:", {
      markupAmount: updatedCalculations.markupAmount,
      totalCostPerCard: updatedCalculations.totalCostPerCard,
      totalCost: updatedCalculations.totalCost
    });
    
    return updatedCalculations;
  } catch (error) {
    console.error("Error recalculating markup for edit:", error);
    return calculations; // Return original if error
  }
};

/**
 * NEW: Simple markup recalculation function specifically for edit mode
 * Uses the displayed subtotal as the base for consistent calculations
 * @param {Object} existingCalculations - Current calculation state
 * @param {Number} markupPercentage - New markup percentage
 * @param {String} markupType - New markup type
 * @param {Number} quantity - Number of items
 * @param {Number} gstRate - GST rate to apply
 * @returns {Object} - Updated calculations
 */
export const simpleMarkupRecalculation = (existingCalculations, markupPercentage, markupType, quantity, gstRate) => {
  try {
    // Use the subtotal that's displayed in the UI
    const subtotalPerCard = existingCalculations.subtotalPerCard || "0.00";
    
    // CRITICAL FIX: Calculate new markup using precision
    const markupAmount = calculatePercentage(subtotalPerCard, markupPercentage);
    const totalCostPerCard = addCurrency(subtotalPerCard, markupAmount);
    const totalCost = multiplyCurrency(totalCostPerCard, quantity);
    
    // Calculate GST using precision
    const gstAmount = calculatePercentage(totalCost, gstRate);
    const totalWithGST = addCurrency(totalCost, gstAmount);
    
    return {
      ...existingCalculations,
      markupType: markupType,
      markupPercentage: markupPercentage,
      markupAmount: parseFloat(markupAmount).toFixed(2),
      totalCostPerCard: parseFloat(totalCostPerCard).toFixed(2),
      totalCost: parseFloat(totalCost).toFixed(2),
      gstRate: gstRate,
      gstAmount: parseFloat(gstAmount).toFixed(2),
      totalWithGST: parseFloat(totalWithGST).toFixed(2),
      
      // ⭐ NEW: Preserve totalSheetsRequired
      totalSheetsRequired: existingCalculations.totalSheetsRequired || 0
    };
  } catch (error) {
    console.error("Error in simple markup recalculation:", error);
    return existingCalculations;
  }
};