/**
 * ENHANCED: Validation and precision calculation utilities for estimate calculations
 * This module provides high-precision arithmetic operations using BigInt to avoid
 * floating-point rounding errors that cause calculation inconsistencies.
 */

/**
 * Validates calculation consistency across estimates
 * @param {Array} estimates - Array of estimate objects with calculations
 * @returns {Object} - Validation result with errors and totals
 */
export const validateCalculationConsistency = (estimates) => {
  const errors = [];
  let totalCalculatedAmount = 0;
  let totalCalculatedGST = 0;
  let totalCalculatedFinal = 0;
  
  console.log('🔍 Starting calculation consistency validation for', estimates.length, 'estimates');
  
  estimates.forEach((estimate, index) => {
    const calc = estimate?.calculations || {};
    const quantity = parseInt(estimate?.jobDetails?.quantity || 0);
    
    if (!calc || Object.keys(calc).length === 0) {
      console.warn(`⚠️ Estimate ${estimate.id} has no calculations to validate`);
      return;
    }
    
    const unitCost = parseFloat(calc.totalCostPerCard || 0);
    const totalCost = parseFloat(calc.totalCost || 0);
    const gstRate = parseFloat(calc.gstRate || 18);
    const gstAmount = parseFloat(calc.gstAmount || 0);
    const finalTotal = parseFloat(calc.totalWithGST || 0);
    const markupPercentage = parseFloat(calc.markupPercentage || 0);
    const subtotalPerCard = parseFloat(calc.subtotalPerCard || calc.costWithMisc || 0);
    
    console.log(`🔍 Validating estimate ${index + 1} (${estimate.projectName}):`, {
      subtotalPerCard,
      markupPercentage,
      unitCost,
      quantity,
      totalCost,
      gstRate,
      gstAmount,
      finalTotal
    });
    
    // Use the enhanced precision calculation for validation
    const preciseCalc = calculateWithPrecision(
      subtotalPerCard,
      markupPercentage,
      quantity,
      gstRate
    );
    
    // Validate individual estimate calculations using precise values
    const expectedUnitCost = parseFloat(preciseCalc.totalCostPerCard);
    const expectedTotalCost = parseFloat(preciseCalc.totalCost);
    const expectedGSTAmount = parseFloat(preciseCalc.gstAmount);
    const expectedFinalTotal = parseFloat(preciseCalc.totalWithGST);
    
    // ENHANCED: Use tighter tolerance for better validation (0.005 = 0.5 paisa)
    const tolerance = 0.005;
    
    if (Math.abs(expectedUnitCost - unitCost) > tolerance) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName || `Estimate ${index + 1}`,
        field: 'totalCostPerCard',
        expected: expectedUnitCost,
        actual: unitCost,
        difference: Math.abs(expectedUnitCost - unitCost),
        tolerance: tolerance
      });
    }
    
    if (Math.abs(expectedTotalCost - totalCost) > tolerance) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName || `Estimate ${index + 1}`,
        field: 'totalCost',
        expected: expectedTotalCost,
        actual: totalCost,
        difference: Math.abs(expectedTotalCost - totalCost),
        tolerance: tolerance
      });
    }
    
    if (Math.abs(expectedGSTAmount - gstAmount) > tolerance) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName || `Estimate ${index + 1}`,
        field: 'gstAmount',
        expected: expectedGSTAmount,
        actual: gstAmount,
        difference: Math.abs(expectedGSTAmount - gstAmount),
        tolerance: tolerance
      });
    }
    
    if (Math.abs(expectedFinalTotal - finalTotal) > tolerance) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName || `Estimate ${index + 1}`,
        field: 'finalTotal',
        expected: expectedFinalTotal,
        actual: finalTotal,
        difference: Math.abs(expectedFinalTotal - finalTotal),
        tolerance: tolerance
      });
    }
    
    // Use actual saved values for totals (not recalculated)
    totalCalculatedAmount += totalCost;
    totalCalculatedGST += gstAmount;
    totalCalculatedFinal += finalTotal;
    
    if (errors.length === 0) {
      console.log(`✅ Estimate ${index + 1} calculations are consistent`);
    } else {
      console.warn(`⚠️ Estimate ${index + 1} has ${errors.filter(e => e.estimateId === estimate.id).length} calculation inconsistencies`);
    }
  });
  
  const validationResult = {
    hasErrors: errors.length > 0,
    errors,
    totals: {
      amount: totalCalculatedAmount,
      gst: totalCalculatedGST,
      final: totalCalculatedFinal
    }
  };
  
  if (validationResult.hasErrors) {
    console.warn(`⚠️ VALIDATION COMPLETE: Found ${errors.length} calculation inconsistencies across ${estimates.length} estimates`);
  } else {
    console.log(`✅ VALIDATION COMPLETE: All ${estimates.length} estimates have consistent calculations`);
  }
  
  return validationResult;
};

/**
 * ENHANCED: High-precision calculation helper to avoid floating point errors
 * Uses BigInt arithmetic to ensure exact calculations without rounding errors
 * @param {Number} subtotal - Subtotal amount per card (before markup)
 * @param {Number} markupPercentage - Markup percentage to apply
 * @param {Number} quantity - Number of items
 * @param {Number} gstRate - GST rate percentage
 * @returns {Object} - Precisely calculated values
 */
export const calculateWithPrecision = (subtotal, markupPercentage, quantity, gstRate) => {
  console.log('🧮 Starting precision calculation:', {
    subtotal,
    markupPercentage,
    quantity,
    gstRate
  });
  
  try {
    // ENHANCED: Work with integers in the smallest currency unit (paise/cents)
    // Convert to BigInt to handle large numbers without overflow
    const subtotalPaise = BigInt(Math.round(subtotal * 100));
    const markupPercent = Math.round(markupPercentage * 100); // Store as basis points (10000 = 100%)
    const gstPercent = Math.round(gstRate * 100); // Store as basis points
    const quantityBig = BigInt(quantity);
    
    console.log('🔢 Converted to integers:', {
      subtotalPaise: subtotalPaise.toString(),
      markupPercent,
      gstPercent,
      quantity: quantityBig.toString()
    });
    
    // Calculate markup: (subtotal * markupPercent) / 10000
    const markupPaise = (subtotalPaise * BigInt(markupPercent)) / BigInt(10000);
    
    // Total cost per card after markup
    const totalCostPerCardPaise = subtotalPaise + markupPaise;
    
    // Total cost for all quantity
    const totalCostPaise = totalCostPerCardPaise * quantityBig;
    
    // Calculate GST: (totalCost * gstPercent) / 10000
    const gstPaise = (totalCostPaise * BigInt(gstPercent)) / BigInt(10000);
    
    // Final total with GST
    const totalWithGSTPaise = totalCostPaise + gstPaise;
    
    // Convert back to currency with proper precision
    const result = {
      markupAmount: (Number(markupPaise) / 100).toFixed(2),
      totalCostPerCard: (Number(totalCostPerCardPaise) / 100).toFixed(2),
      totalCost: (Number(totalCostPaise) / 100).toFixed(2),
      gstAmount: (Number(gstPaise) / 100).toFixed(2),
      totalWithGST: (Number(totalWithGSTPaise) / 100).toFixed(2)
    };
    
    console.log('✅ Precision calculation completed:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error in precision calculation:', error);
    
    // Fallback to standard calculation with careful rounding
    const markupAmount = Math.round((subtotal * markupPercentage / 100) * 100) / 100;
    const totalCostPerCard = Math.round((subtotal + markupAmount) * 100) / 100;
    const totalCost = Math.round((totalCostPerCard * quantity) * 100) / 100;
    const gstAmount = Math.round((totalCost * gstRate / 100) * 100) / 100;
    const totalWithGST = Math.round((totalCost + gstAmount) * 100) / 100;
    
    const fallbackResult = {
      markupAmount: markupAmount.toFixed(2),
      totalCostPerCard: totalCostPerCard.toFixed(2),
      totalCost: totalCost.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalWithGST: totalWithGST.toFixed(2)
    };
    
    console.warn('⚠️ Used fallback calculation:', fallbackResult);
    
    return fallbackResult;
  }
};

/**
 * ENHANCED: Helper function to safely add currency values with precision
 * @param {...string|number} amounts - Currency amounts to add
 * @returns {string} - Sum with 2 decimal places
 */
export const addCurrency = (...amounts) => {
  try {
    const totalPaise = amounts.reduce((sum, amount) => {
      const amountStr = String(amount || 0);
      const amountNum = parseFloat(amountStr);
      
      if (isNaN(amountNum)) {
        console.warn('⚠️ Invalid amount in addCurrency:', amount);
        return sum;
      }
      
      return sum + BigInt(Math.round(amountNum * 100));
    }, BigInt(0));
    
    const result = (Number(totalPaise) / 100).toFixed(2);
    
    console.log('➕ Currency addition:', {
      inputs: amounts,
      result
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error in addCurrency:', error);
    
    // Fallback to standard addition with rounding
    const total = amounts.reduce((sum, amount) => {
      const amountNum = parseFloat(amount || 0);
      return sum + (isNaN(amountNum) ? 0 : amountNum);
    }, 0);
    
    return Math.round(total * 100) / 100;
  }
};

/**
 * ENHANCED: Helper function to safely multiply currency by quantity with precision
 * @param {string|number} amount - Currency amount
 * @param {number} multiplier - Quantity to multiply by
 * @returns {string} - Product with 2 decimal places
 */
export const multiplyCurrency = (amount, multiplier) => {
  try {
    const amountPaise = BigInt(Math.round(parseFloat(amount || 0) * 100));
    const multiplierBig = BigInt(multiplier || 0);
    const result = amountPaise * multiplierBig;
    
    const finalResult = (Number(result) / 100).toFixed(2);
    
    console.log('✖️ Currency multiplication:', {
      amount: parseFloat(amount || 0).toFixed(2),
      multiplier,
      result: finalResult
    });
    
    return finalResult;
  } catch (error) {
    console.error('❌ Error in multiplyCurrency:', error);
    
    // Fallback to standard multiplication with rounding
    const amountNum = parseFloat(amount || 0);
    const result = amountNum * (multiplier || 0);
    
    return Math.round(result * 100) / 100;
  }
};

/**
 * ENHANCED: Helper function to calculate percentage of currency amount with precision
 * @param {string|number} amount - Base currency amount
 * @param {number} percentage - Percentage to calculate
 * @returns {string} - Percentage amount with 2 decimal places
 */
export const calculatePercentage = (amount, percentage) => {
  try {
    const amountPaise = BigInt(Math.round(parseFloat(amount || 0) * 100));
    const percentBasisPoints = Math.round((percentage || 0) * 100); // Convert to basis points
    const result = (amountPaise * BigInt(percentBasisPoints)) / BigInt(10000);
    
    const finalResult = (Number(result) / 100).toFixed(2);
    
    console.log('📊 Percentage calculation:', {
      amount: parseFloat(amount || 0).toFixed(2),
      percentage: percentage || 0,
      result: finalResult
    });
    
    return finalResult;
  } catch (error) {
    console.error('❌ Error in calculatePercentage:', error);
    
    // Fallback to standard percentage calculation with rounding
    const amountNum = parseFloat(amount || 0);
    const result = (amountNum * (percentage || 0)) / 100;
    
    return Math.round(result * 100) / 100;
  }
};

/**
 * ENHANCED: Helper function to subtract currency values with precision
 * @param {string|number} amount1 - First amount
 * @param {string|number} amount2 - Amount to subtract
 * @returns {string} - Difference with 2 decimal places
 */
export const subtractCurrency = (amount1, amount2) => {
  try {
    const amount1Paise = BigInt(Math.round(parseFloat(amount1 || 0) * 100));
    const amount2Paise = BigInt(Math.round(parseFloat(amount2 || 0) * 100));
    const result = amount1Paise - amount2Paise;
    
    const finalResult = (Number(result) / 100).toFixed(2);
    
    console.log('➖ Currency subtraction:', {
      amount1: parseFloat(amount1 || 0).toFixed(2),
      amount2: parseFloat(amount2 || 0).toFixed(2),
      result: finalResult
    });
    
    return finalResult;
  } catch (error) {
    console.error('❌ Error in subtractCurrency:', error);
    
    // Fallback to standard subtraction with rounding
    const amount1Num = parseFloat(amount1 || 0);
    const amount2Num = parseFloat(amount2 || 0);
    const result = amount1Num - amount2Num;
    
    return Math.round(result * 100) / 100;
  }
};

/**
 * ENHANCED: Helper function to compare currency values with tolerance
 * @param {string|number} amount1 - First amount to compare
 * @param {string|number} amount2 - Second amount to compare
 * @param {number} tolerance - Acceptable difference (default: 0.005 = 0.5 paisa)
 * @returns {boolean} - True if amounts are equal within tolerance
 */
export const currencyEquals = (amount1, amount2, tolerance = 0.005) => {
  const num1 = parseFloat(amount1 || 0);
  const num2 = parseFloat(amount2 || 0);
  const difference = Math.abs(num1 - num2);
  
  const isEqual = difference <= tolerance;
  
  if (!isEqual) {
    console.log('💱 Currency comparison failed:', {
      amount1: num1.toFixed(2),
      amount2: num2.toFixed(2),
      difference: difference.toFixed(4),
      tolerance: tolerance.toFixed(4)
    });
  }
  
  return isEqual;
};

/**
 * ENHANCED: Helper function to round currency to nearest paisa
 * @param {string|number} amount - Amount to round
 * @returns {string} - Rounded amount with 2 decimal places
 */
export const roundCurrency = (amount) => {
  try {
    const amountNum = parseFloat(amount || 0);
    const rounded = Math.round(amountNum * 100) / 100;
    return rounded.toFixed(2);
  } catch (error) {
    console.error('❌ Error in roundCurrency:', error);
    return "0.00";
  }
};

/**
 * ENHANCED: Validation helper to check if a calculation result is reasonable
 * @param {Object} calculation - Calculation result object
 * @param {Object} inputs - Input values used for calculation
 * @returns {Object} - Validation result with warnings
 */
export const validateCalculationResult = (calculation, inputs) => {
  const warnings = [];
  
  try {
    const {
      markupAmount,
      totalCostPerCard,
      totalCost,
      gstAmount,
      totalWithGST
    } = calculation;
    
    const {
      subtotal,
      markupPercentage,
      quantity,
      gstRate
    } = inputs;
    
    // Check for reasonable markup amount
    const expectedMarkup = (subtotal * markupPercentage) / 100;
    if (!currencyEquals(markupAmount, expectedMarkup, 0.01)) {
      warnings.push({
        type: 'markup_mismatch',
        message: `Markup amount ${markupAmount} doesn't match expected ${expectedMarkup.toFixed(2)}`,
        severity: 'medium'
      });
    }
    
    // Check for reasonable total cost per card
    const expectedTotalPerCard = subtotal + parseFloat(markupAmount);
    if (!currencyEquals(totalCostPerCard, expectedTotalPerCard, 0.01)) {
      warnings.push({
        type: 'total_per_card_mismatch',
        message: `Total per card ${totalCostPerCard} doesn't match expected ${expectedTotalPerCard.toFixed(2)}`,
        severity: 'high'
      });
    }
    
    // Check for reasonable total cost
    const expectedTotal = parseFloat(totalCostPerCard) * quantity;
    if (!currencyEquals(totalCost, expectedTotal, 0.01)) {
      warnings.push({
        type: 'total_cost_mismatch',
        message: `Total cost ${totalCost} doesn't match expected ${expectedTotal.toFixed(2)}`,
        severity: 'high'
      });
    }
    
    // Check for reasonable GST amount
    const expectedGST = (parseFloat(totalCost) * gstRate) / 100;
    if (!currencyEquals(gstAmount, expectedGST, 0.01)) {
      warnings.push({
        type: 'gst_mismatch',
        message: `GST amount ${gstAmount} doesn't match expected ${expectedGST.toFixed(2)}`,
        severity: 'medium'
      });
    }
    
    // Check for reasonable final total
    const expectedFinal = parseFloat(totalCost) + parseFloat(gstAmount);
    if (!currencyEquals(totalWithGST, expectedFinal, 0.01)) {
      warnings.push({
        type: 'final_total_mismatch',
        message: `Final total ${totalWithGST} doesn't match expected ${expectedFinal.toFixed(2)}`,
        severity: 'high'
      });
    }
    
    // Check for extreme values
    if (parseFloat(totalWithGST) > 1000000) {
      warnings.push({
        type: 'extreme_value',
        message: `Total amount ${totalWithGST} seems unusually high`,
        severity: 'medium'
      });
    }
    
    if (parseFloat(totalWithGST) < 0.01) {
      warnings.push({
        type: 'extreme_value',
        message: `Total amount ${totalWithGST} seems unusually low`,
        severity: 'medium'
      });
    }
    
    // Check for zero or negative quantities
    if (quantity <= 0) {
      warnings.push({
        type: 'invalid_quantity',
        message: `Quantity ${quantity} is not valid`,
        severity: 'high'
      });
    }
    
    // Check for extreme markup percentages
    if (markupPercentage > 500) {
      warnings.push({
        type: 'extreme_markup',
        message: `Markup percentage ${markupPercentage}% seems unusually high`,
        severity: 'medium'
      });
    }
    
    if (markupPercentage < 0) {
      warnings.push({
        type: 'negative_markup',
        message: `Markup percentage ${markupPercentage}% is negative`,
        severity: 'high'
      });
    }
    
  } catch (error) {
    warnings.push({
      type: 'validation_error',
      message: `Error during calculation validation: ${error.message}`,
      severity: 'high'
    });
  }
  
  return {
    isValid: warnings.filter(w => w.severity === 'high').length === 0,
    warnings,
    summary: {
      total: warnings.length,
      high: warnings.filter(w => w.severity === 'high').length,
      medium: warnings.filter(w => w.severity === 'medium').length,
      low: warnings.filter(w => w.severity === 'low').length
    }
  };
};

/**
 * ENHANCED: Edit mode calculation preservation helper
 * Ensures calculations are preserved exactly during edit mode operations
 * @param {Object} originalCalculations - Original saved calculations
 * @param {Object} newInputs - New input parameters (if any changed)
 * @returns {Object} - Preserved or recalculated values
 */
export const preserveEditModeCalculations = (originalCalculations, newInputs = {}) => {
  console.log('🔒 Edit mode: Preserving calculations with inputs:', { originalCalculations, newInputs });
  
  try {
    // If no new inputs provided, return original calculations exactly
    if (!newInputs || Object.keys(newInputs).length === 0) {
      console.log('✅ No changes detected, preserving original calculations exactly');
      return originalCalculations;
    }
    
    // Extract original values
    const originalSubtotal = parseFloat(originalCalculations.subtotalPerCard || originalCalculations.costWithMisc || 0);
    const originalMarkupPercentage = parseFloat(originalCalculations.markupPercentage || 0);
    const originalQuantity = parseInt(originalCalculations.quantity || newInputs.quantity || 1);
    const originalGstRate = parseFloat(originalCalculations.gstRate || 18);
    
    // Use new values if provided, otherwise keep originals
    const subtotal = newInputs.subtotal !== undefined ? parseFloat(newInputs.subtotal) : originalSubtotal;
    const markupPercentage = newInputs.markupPercentage !== undefined ? parseFloat(newInputs.markupPercentage) : originalMarkupPercentage;
    const quantity = newInputs.quantity !== undefined ? parseInt(newInputs.quantity) : originalQuantity;
    const gstRate = newInputs.gstRate !== undefined ? parseFloat(newInputs.gstRate) : originalGstRate;
    
    console.log('🔄 Edit mode recalculation with:', {
      subtotal: { original: originalSubtotal, new: subtotal, changed: subtotal !== originalSubtotal },
      markupPercentage: { original: originalMarkupPercentage, new: markupPercentage, changed: markupPercentage !== originalMarkupPercentage },
      quantity: { original: originalQuantity, new: quantity, changed: quantity !== originalQuantity },
      gstRate: { original: originalGstRate, new: gstRate, changed: gstRate !== originalGstRate }
    });
    
    // If nothing actually changed, return original
    if (subtotal === originalSubtotal && 
        markupPercentage === originalMarkupPercentage && 
        quantity === originalQuantity && 
        gstRate === originalGstRate) {
      console.log('✅ Values unchanged, preserving original calculations');
      return originalCalculations;
    }
    
    // Recalculate with precision if values changed
    console.log('🔄 Values changed, recalculating with precision');
    const preciseCalc = calculateWithPrecision(subtotal, markupPercentage, quantity, gstRate);
    
    // Merge with original calculations, updating only the changed parts
    const updatedCalculations = {
      ...originalCalculations,
      // Update base values if they changed
      subtotalPerCard: subtotal.toFixed(2),
      markupPercentage: markupPercentage,
      markupAmount: preciseCalc.markupAmount,
      totalCostPerCard: preciseCalc.totalCostPerCard,
      totalCost: preciseCalc.totalCost,
      gstRate: gstRate,
      gstAmount: preciseCalc.gstAmount,
      totalWithGST: preciseCalc.totalWithGST,
      // Add preservation metadata
      preservationMode: 'edit_mode',
      lastModified: new Date().toISOString(),
      changedFields: Object.keys(newInputs)
    };
    
    console.log('✅ Edit mode calculations updated with precision:', updatedCalculations);
    
    return updatedCalculations;
    
  } catch (error) {
    console.error('❌ Error in edit mode calculation preservation:', error);
    
    // Return original calculations if preservation fails
    console.warn('⚠️ Falling back to original calculations due to error');
    return {
      ...originalCalculations,
      preservationError: error.message,
      preservationMode: 'fallback'
    };
  }
};

/**
 * ENHANCED: Batch validation for multiple estimates
 * @param {Array} estimates - Array of estimates to validate
 * @returns {Object} - Comprehensive validation report
 */
export const batchValidateEstimates = (estimates) => {
  console.log('🔍 Starting batch validation for', estimates.length, 'estimates');
  
  const results = {
    totalEstimates: estimates.length,
    validEstimates: 0,
    invalidEstimates: 0,
    estimateResults: [],
    overallSummary: {
      totalErrors: 0,
      totalWarnings: 0,
      commonIssues: {}
    }
  };
  
  estimates.forEach((estimate, index) => {
    try {
      const validation = validateCalculationConsistency([estimate]);
      const calculationCheck = estimate.calculations ? 
        validateCalculationResult(estimate.calculations, {
          subtotal: parseFloat(estimate.calculations.subtotalPerCard || 0),
          markupPercentage: parseFloat(estimate.calculations.markupPercentage || 0),
          quantity: parseInt(estimate.jobDetails?.quantity || 0),
          gstRate: parseFloat(estimate.calculations.gstRate || 18)
        }) : { isValid: false, warnings: [{ type: 'no_calculations', message: 'No calculations found', severity: 'high' }] };
      
      const estimateResult = {
        estimateId: estimate.id,
        projectName: estimate.projectName,
        isValid: !validation.hasErrors && calculationCheck.isValid,
        consistencyErrors: validation.errors,
        calculationWarnings: calculationCheck.warnings,
        totalIssues: validation.errors.length + calculationCheck.warnings.length
      };
      
      results.estimateResults.push(estimateResult);
      
      if (estimateResult.isValid) {
        results.validEstimates++;
      } else {
        results.invalidEstimates++;
      }
      
      // Aggregate errors and warnings
      results.overallSummary.totalErrors += validation.errors.length;
      results.overallSummary.totalWarnings += calculationCheck.warnings.length;
      
      // Track common issues
      [...validation.errors, ...calculationCheck.warnings].forEach(issue => {
        const issueType = issue.type || issue.field || 'unknown';
        results.overallSummary.commonIssues[issueType] = 
          (results.overallSummary.commonIssues[issueType] || 0) + 1;
      });
      
    } catch (error) {
      console.error(`❌ Error validating estimate ${estimate.id}:`, error);
      results.estimateResults.push({
        estimateId: estimate.id,
        projectName: estimate.projectName,
        isValid: false,
        error: error.message,
        totalIssues: 1
      });
      results.invalidEstimates++;
    }
  });
  
  console.log('✅ Batch validation completed:', {
    valid: results.validEstimates,
    invalid: results.invalidEstimates,
    totalErrors: results.overallSummary.totalErrors,
    totalWarnings: results.overallSummary.totalWarnings
  });
  
  return results;
};

export default {
  validateCalculationConsistency,
  calculateWithPrecision,
  addCurrency,
  multiplyCurrency,
  calculatePercentage,
  subtractCurrency,
  currencyEquals,
  roundCurrency,
  validateCalculationResult,
  preserveEditModeCalculations,
  batchValidateEstimates
};