import { 
  calculatePaperAndCuttingCosts, 
  calculateLPCosts,
  calculateFSCosts,
  calculateEMBCosts,
  calculateScreenPrintCosts,
  calculateDigiDetailsCosts,
  calculateDieCuttingCosts,
  calculatePostDCCosts,
  calculateFoldAndPasteCosts, // New calculator
  calculateDstPasteCosts,     // New calculator
  calculateQCCosts,
  calculatePackingCosts,
  calculateMiscCosts,
  calculateWastage,
  calculateOverhead,
  calculateMarkup,
  calculateGST,
  calculateSandwichCosts,
  calculateMagnetCosts,       // New calculator
  calculateNotebookCosts      // New notebook calculator
} from './Calculators';

// Import loyalty service functions
import { getClientCurrentTier, applyLoyaltyDiscount } from '../../../../utils/LoyaltyService';

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
  markupType = "MARKUP TIMELESS"
) => {
  try {
    console.log("Starting complete calculations with:", {
      miscChargePerCard,
      markupType,
      markupPercentage,
      quantity: state.orderAndPaper?.quantity,
      jobType: state.orderAndPaper?.jobType
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
      'notebookCostPerCard', // New notebook cost field
    ];
    
    const postProductionFields = [
      'dieCuttingCostPerCard',
      'postDCCostPerCard',
      'foldAndPasteCostPerCard',
      'dstPasteCostPerCard',
      'magnetCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'sandwichPaperCostPerCard',
      // Note: QC is handled separately per requirements
    ];    

    // Calculate production costs
    const productionCost = productionFields.reduce((acc, key) => {
      const value = baseCalculations[key];
      const parsedValue = value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0;
      console.log(`Production field ${key}: ${value} -> ${parsedValue}`);
      return acc + parsedValue;
    }, 0);
    
    // Calculate post-production costs (excluding QC, packing, and misc)
    const postProductionCost = postProductionFields.reduce((acc, key) => {
      const value = baseCalculations[key];
      const parsedValue = value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0;
      console.log(`Post-production field ${key}: ${value} -> ${parsedValue}`);
      return acc + parsedValue;
    }, 0);
    
    console.log("Production cost:", productionCost);
    console.log("Post-production cost (without QC):", postProductionCost);
    
    // Calculate initial base cost without QC
    const initialBaseCost = productionCost + postProductionCost;
    console.log("Initial base cost (without QC):", initialBaseCost);

    // 1. Calculate QC costs if QC is enabled
    let qcCost = 0;
    if (state.qc?.isQCUsed) {
      // Use the QC value from calculations or calculate if not present
      if (baseCalculations.qcCostPerCard) {
        qcCost = parseFloat(baseCalculations.qcCostPerCard) || 0;
      } else {
        const qcResult = await calculateQCCosts(state);
        qcCost = parseFloat(qcResult.qcCostPerCard) || 0;
      }
      console.log("QC cost per card:", qcCost);
    }

    // Add QC to get complete base cost
    const baseCost = initialBaseCost + qcCost;
    console.log("Base cost with QC:", baseCost);

    // Calculate wastage and overhead on base cost
    const wastageResult = await calculateWastage(baseCost);
    const wastagePercentage = wastageResult.wastagePercentage;
    const wastageCost = parseFloat(wastageResult.wastageAmount);
    
    console.log("Wastage calculation:", {
      percentage: wastagePercentage,
      amount: wastageCost
    });
    
    const overheadResult = await calculateOverhead(baseCost);
    const overheadPercentage = overheadResult.overheadPercentage;
    const overheadCost = parseFloat(overheadResult.overheadAmount);
    
    console.log("Overhead calculation:", {
      percentage: overheadPercentage,
      amount: overheadCost
    });
    
    // Calculate COGS (Cost of Goods Sold)
    const COGS = baseCost + wastageCost + overheadCost;
    console.log("COGS:", COGS);

    // 2. Calculate Packing cost if enabled (applied to COGS)
    let packingCost = 0;
    let packingPercentage = 0;
    
    if (state.packing?.isPackingUsed) {
      // Get packing percentage from calculations or fetch it
      if (baseCalculations.packingPercentage) {
        packingPercentage = parseFloat(baseCalculations.packingPercentage) || 0;
      } else {
        const packingResult = await calculatePackingCosts(state);
        packingPercentage = parseFloat(packingResult.packingPercentage) || 0;
      }
      
      // Calculate packing cost as percentage of COGS
      packingCost = COGS * (packingPercentage / 100);
      
      console.log("Packing cost calculation:", {
        COGS,
        percentage: packingPercentage,
        costPerCard: packingCost
      });
    }

    const costWithPacking = COGS + packingCost;
    console.log("Cost with packing:", costWithPacking);
    
    // 3. Calculate Misc cost if enabled
    let miscCost = 0;
    
    if (state.misc?.isMiscUsed) {
      // Use provided misc charge if available, otherwise fetch from database
      if (miscChargePerCard !== null) {
        miscCost = miscChargePerCard;
      } else if (baseCalculations.miscCostPerCard) {
        miscCost = parseFloat(baseCalculations.miscCostPerCard) || 0;
      } else {
        const miscResult = await calculateMiscCosts(state);
        miscCost = parseFloat(miscResult.miscCostPerCard) || 0;
      }
      console.log("Misc cost per card:", miscCost);
    }

    const costWithMisc = costWithPacking + miscCost;
    console.log("Cost with misc:", costWithMisc);
    
    // Calculate markup using specified percentage or fetch from DB
    let markupResult;
    if (markupPercentage !== null && typeof markupPercentage === 'number') {
      // If a specific percentage is provided as a number, use it directly
      markupResult = {
        markupType: markupType,
        markupPercentage: markupPercentage,
        markupAmount: (costWithMisc * (markupPercentage / 100)).toFixed(2)
      };
      console.log("Using provided markup percentage:", markupPercentage);
    } else {
      // Otherwise fetch from database based on markup type
      console.log("Fetching markup from database for type:", markupType);
      markupResult = await calculateMarkup(costWithMisc, markupType);
      
      // Ensure the markupPercentage is a number
      if (typeof markupResult.markupPercentage !== 'number') {
        console.error("Invalid markup percentage type:", typeof markupResult.markupPercentage);
        console.error("Markup result:", markupResult);
        
        // Try to convert to number or use default
        const numericPercentage = parseFloat(markupResult.markupPercentage);
        if (!isNaN(numericPercentage)) {
          markupResult.markupPercentage = numericPercentage;
          markupResult.markupAmount = (costWithMisc * (numericPercentage / 100)).toFixed(2);
        } else {
          // Use default fallback
          markupResult.markupPercentage = 50;
          markupResult.markupAmount = (costWithMisc * 0.5).toFixed(2);
        }
      }
    }
    
    console.log("Markup calculation:", markupResult);
    
    const markupCost = parseFloat(markupResult.markupAmount);
    
    // Calculate total cost per card
    const totalCostPerCard = (costWithMisc + markupCost).toFixed(2);
    
    // Total cost for all cards
    const totalCost = totalCostPerCard * (state.orderAndPaper?.quantity || 0);
    
    console.log("Cost calculation after markup:", {
      totalCostPerCard,
      quantity: state.orderAndPaper?.quantity,
      totalCost
    });

    // 4. Calculate GST based on job type
    const jobType = state.orderAndPaper?.jobType || "Card";
    const gstResult = await calculateGST(totalCost, jobType);
    
    console.log("GST calculation:", {
      jobType,
      gstRate: gstResult.gstRate,
      gstAmount: gstResult.gstAmount,
      totalWithGST: gstResult.totalWithGST
    });
    
    const gstAmount = parseFloat(gstResult.gstAmount);
    const totalWithGST = parseFloat(gstResult.totalWithGST);
    
    // 5. NEW: Apply loyalty discount if applicable
    let finalCalculations = {
      // Original base calculations
      ...baseCalculations,
      
      // Cost components with detailed breakdown
      productionCost: productionCost.toFixed(2),
      postProductionCost: postProductionCost.toFixed(2),
      qcCostPerCard: qcCost.toFixed(2),
      baseCost: baseCost.toFixed(2),
      
      // Wastage and overhead
      wastagePercentage: wastagePercentage,
      wastageAmount: wastageCost.toFixed(2),
      overheadPercentage: overheadPercentage,
      overheadAmount: overheadCost.toFixed(2),
      
      // COGS
      COGS: COGS.toFixed(2),
      
      // Packing
      packingPercentage: packingPercentage,
      packingCostPerCard: packingCost.toFixed(2),
      costWithPacking: costWithPacking.toFixed(2),
      
      // Misc
      miscUsed: state.misc?.isMiscUsed || false,
      miscCostPerCard: miscCost.toFixed(2),
      costWithMisc: costWithMisc.toFixed(2),
      
      // Markup information
      markupType: markupResult.markupType,
      markupPercentage: markupResult.markupPercentage,
      markupAmount: markupResult.markupAmount,
      
      // GST information
      gstRate: gstResult.gstRate,
      gstAmount: gstResult.gstAmount,
      
      // Final totals
      subtotalPerCard: costWithMisc.toFixed(2), // Subtotal is now cost with misc (before markup)
      totalCostPerCard: totalCostPerCard, // Total after markup (before GST)
      totalCost: totalCost.toFixed(2), // Total for all cards after markup (before GST)
      totalWithGST: gstResult.totalWithGST // Total for all cards including GST
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
 * @returns {Promise<Object>} - Updated calculations with new totals
 */
export const recalculateTotals = async (
  baseCalculations, 
  miscChargePerCard, 
  markupPercentage, 
  quantity,
  markupType = "MARKUP TIMELESS",
  jobType = "Card",
  clientLoyaltyTier = null
) => {
  try {
    // Define production and post-production cost fields
    const productionFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'screenPrintCostPerCard',
      'digiCostPerCard',
      'notebookCostPerCard', // New notebook cost field
    ];
    
    const postProductionFields = [
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

    // Calculate production costs
    const productionCost = productionFields.reduce((acc, key) => {
      const value = baseCalculations[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);
    
    // Calculate post-production costs
    const postProductionCost = postProductionFields.reduce((acc, key) => {
      const value = baseCalculations[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);
    
    // Get QC cost
    const qcCost = baseCalculations.qcCostPerCard 
      ? parseFloat(baseCalculations.qcCostPerCard) 
      : 0;
    
    // Calculate base cost as production + post-production + QC
    const baseCost = productionCost + postProductionCost + qcCost;

    // Calculate wastage and overhead on base cost
    const wastageResult = await calculateWastage(baseCost);
    const wastagePercentage = wastageResult.wastagePercentage;
    const wastageCost = parseFloat(wastageResult.wastageAmount);
    
    const overheadResult = await calculateOverhead(baseCost);
    const overheadPercentage = overheadResult.overheadPercentage;
    const overheadCost = parseFloat(overheadResult.overheadAmount);
    
    // Calculate COGS (Cost of Goods Sold)
    const COGS = baseCost + wastageCost + overheadCost;
    
    // Get packing percentage and calculate cost
    const packingPercentage = baseCalculations.packingPercentage 
      ? parseFloat(baseCalculations.packingPercentage) 
      : 0;
    
    // Calculate packing cost as percentage of COGS
    // Check if packing is used in the base calculations
    const packingUsed = baseCalculations.packingCostPerCard && parseFloat(baseCalculations.packingCostPerCard) > 0;
    const packingCost = packingUsed ? COGS * (packingPercentage / 100) : 0;
    
    const costWithPacking = COGS + packingCost;
    
    // Add misc charge if selected
    const miscUsed = baseCalculations.miscUsed || false;
    const miscCharge = miscUsed ? miscChargePerCard : 0;
    const costWithMisc = costWithPacking + miscCharge;
    
    // Calculate markup using the specified percentage
    const markupCost = costWithMisc * (markupPercentage / 100);
    
    // Calculate total cost per card
    const totalCostPerCard = costWithMisc + markupCost;
    
    // Total cost for all cards
    const totalCost = totalCostPerCard * quantity;
    
    // Calculate GST based on job type
    const gstResult = await calculateGST(totalCost, jobType);
    const gstAmount = parseFloat(gstResult.gstAmount);
    const totalWithGST = parseFloat(gstResult.totalWithGST);
    
    // Prepare updated calculations
    let updatedCalculations = {
      ...baseCalculations, // Preserve original base calculations
      
      productionCost: productionCost.toFixed(2),
      postProductionCost: postProductionCost.toFixed(2),
      qcCostPerCard: qcCost.toFixed(2),
      baseCost: baseCost.toFixed(2),
      
      // Wastage and overhead
      wastagePercentage: wastagePercentage,
      wastageAmount: wastageCost.toFixed(2),
      overheadPercentage: overheadPercentage,
      overheadAmount: overheadCost.toFixed(2),
      
      // COGS
      COGS: COGS.toFixed(2),
      
      // Packing
      packingPercentage: packingPercentage,
      packingCostPerCard: packingCost.toFixed(2),
      costWithPacking: costWithPacking.toFixed(2),
      
      // Misc
      miscUsed: miscUsed,
      miscCostPerCard: miscCharge.toFixed(2),
      costWithMisc: costWithMisc.toFixed(2),
      
      // Markup
      markupType: markupType,
      markupPercentage: markupPercentage,
      markupAmount: markupCost.toFixed(2),
      
      // GST
      gstRate: gstResult.gstRate,
      gstAmount: gstResult.gstAmount,
      
      // Totals
      subtotalPerCard: costWithMisc.toFixed(2),
      totalCostPerCard: totalCostPerCard.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalWithGST: gstResult.totalWithGST
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
    
    // Simple fallback calculation
    const baseCost = parseFloat(baseCalculations.baseCost || 0);
    const wastageCost = baseCost * (WASTAGE_PERCENTAGE / 100);
    const overheadCost = baseCost * (OVERHEAD_PERCENTAGE / 100);
    const COGS = baseCost + wastageCost + overheadCost;
    
    // Calculate packing cost as percentage of COGS
    const packingPercentage = baseCalculations.packingPercentage 
      ? parseFloat(baseCalculations.packingPercentage) 
      : 0;
    const packingCost = baseCalculations.packingCostPerCard && parseFloat(baseCalculations.packingCostPerCard) > 0
      ? COGS * (packingPercentage / 100) 
      : 0;
    
    const costWithPacking = COGS + packingCost;
    
    const miscUsed = baseCalculations.miscUsed || false;
    const miscCharge = miscUsed ? miscChargePerCard : 0;
    const costWithMisc = costWithPacking + miscCharge;
    
    const markupCost = costWithMisc * (markupPercentage / 100);
    const totalCostPerCard = costWithMisc + markupCost;
    const totalCost = totalCostPerCard * quantity;
    
    // Calculate GST (simple fallback)
    const gstAmount = totalCost * (DEFAULT_GST_RATE / 100);
    const totalWithGST = totalCost + gstAmount;
    
    // Apply loyalty discount if applicable
    let updatedCalculations = {
      ...baseCalculations, // Preserve original base calculations
      error: "Error recalculating with database values, using fallback calculations.",
      baseCost: baseCost.toFixed(2),
      wastagePercentage: WASTAGE_PERCENTAGE,
      wastageAmount: wastageCost.toFixed(2),
      overheadPercentage: OVERHEAD_PERCENTAGE,
      overheadAmount: overheadCost.toFixed(2),
      COGS: COGS.toFixed(2),
      packingPercentage: packingPercentage,
      packingCostPerCard: packingCost.toFixed(2),
      costWithPacking: costWithPacking.toFixed(2),
      miscUsed: miscUsed,
      miscCostPerCard: miscCharge.toFixed(2),
      costWithMisc: costWithMisc.toFixed(2),
      markupType: markupType,
      markupPercentage: markupPercentage,
      markupAmount: markupCost.toFixed(2),
      subtotalPerCard: costWithMisc.toFixed(2),
      totalCostPerCard: totalCostPerCard.toFixed(2),
      totalCost: totalCost.toFixed(2),
      gstRate: DEFAULT_GST_RATE,
      gstAmount: gstAmount.toFixed(2),
      totalWithGST: totalWithGST.toFixed(2)
    };
    
    // Apply loyalty discount if applicable
    if (clientLoyaltyTier && clientLoyaltyTier.discount > 0) {
      const discountPercent = clientLoyaltyTier.discount;
      const discountAmount = totalCost * (discountPercent / 100);
      const discountedTotal = totalCost - discountAmount;
      const newGstAmount = discountedTotal * (DEFAULT_GST_RATE / 100);
      const newTotalWithGST = discountedTotal + newGstAmount;
      
      updatedCalculations = {
        ...updatedCalculations,
        loyaltyTierId: clientLoyaltyTier.dbId,
        loyaltyTierName: clientLoyaltyTier.name,
        loyaltyDiscount: discountPercent,
        loyaltyDiscountAmount: discountAmount.toFixed(2),
        discountedTotalCost: discountedTotal.toFixed(2),
        originalTotalCost: totalCost.toFixed(2),
        gstAmount: newGstAmount.toFixed(2),
        totalWithGST: newTotalWithGST.toFixed(2)
      };
    }
    
    return updatedCalculations;
  }
};