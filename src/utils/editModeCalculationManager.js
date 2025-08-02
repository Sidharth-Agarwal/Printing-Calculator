/**
 * Edit Mode Calculation Manager
 * Specialized utilities for maintaining calculation consistency during edit operations
 * File: utils/editModeCalculationManager.js
 */

import { calculateWithPrecision, validateCalculationConsistency, currencyEquals } from './calculationValidator';

/**
 * CRITICAL: Edit mode calculation manager
 * Handles preservation and selective recalculation of estimates in edit mode
 */
export class EditModeCalculationManager {
  constructor(originalEstimate) {
    this.original = originalEstimate;
    this.originalBase = this.extractCalculationBase(originalEstimate);
    this.preservationMode = true;
    this.changedFields = new Set();
    
    console.log('🔒 Edit Mode Manager initialized:', {
      estimateId: originalEstimate.id,
      projectName: originalEstimate.projectName,
      originalBase: this.originalBase,
      hasCalculations: !!(originalEstimate.calculations)
    });
  }

  /**
   * Extract the calculation base values from the original estimate
   */
  extractCalculationBase(estimate) {
    if (!estimate.calculations) {
      return null;
    }

    return {
      subtotalPerCard: parseFloat(estimate.calculations.subtotalPerCard || estimate.calculations.costWithMisc || 0),
      markupType: estimate.calculations.markupType,
      markupPercentage: parseFloat(estimate.calculations.markupPercentage || 0),
      markupAmount: parseFloat(estimate.calculations.markupAmount || 0),
      totalCostPerCard: parseFloat(estimate.calculations.totalCostPerCard || 0),
      totalCost: parseFloat(estimate.calculations.totalCost || 0),
      gstRate: parseFloat(estimate.calculations.gstRate || 18),
      gstAmount: parseFloat(estimate.calculations.gstAmount || 0),
      totalWithGST: parseFloat(estimate.calculations.totalWithGST || 0),
      quantity: parseInt(estimate.jobDetails?.quantity || 1)
    };
  }

  /**
   * Track which fields have been changed
   */
  markFieldChanged(fieldName) {
    this.changedFields.add(fieldName);
    console.log(`📝 Field marked as changed: ${fieldName}`, {
      totalChangedFields: this.changedFields.size,
      changedFields: Array.from(this.changedFields)
    });
  }

  /**
   * Check if critical calculation fields have changed
   */
  hasCriticalChanges() {
    const criticalFields = ['quantity', 'markupPercentage', 'markupType', 'subtotalPerCard'];
    return criticalFields.some(field => this.changedFields.has(field));
  }

  /**
   * CRITICAL: Get preserved or recalculated values based on what changed
   */
  getCalculations(newFormData) {
    if (!this.originalBase) {
      console.warn('⚠️ No original calculation base available');
      return null;
    }

    // Extract current values from form data
    const currentQuantity = parseInt(newFormData.orderAndPaper?.quantity || newFormData.jobDetails?.quantity || this.originalBase.quantity);
    const currentMarkupPercentage = newFormData.markupPercentage || this.originalBase.markupPercentage;
    const currentMarkupType = newFormData.markupType || this.originalBase.markupType;

    // Check what has actually changed
    const quantityChanged = currentQuantity !== this.originalBase.quantity;
    const markupChanged = currentMarkupPercentage !== this.originalBase.markupPercentage;
    const markupTypeChanged = currentMarkupType !== this.originalBase.markupType;

    console.log('🔍 Checking for changes:', {
      quantity: { original: this.originalBase.quantity, current: currentQuantity, changed: quantityChanged },
      markupPercentage: { original: this.originalBase.markupPercentage, current: currentMarkupPercentage, changed: markupChanged },
      markupType: { original: this.originalBase.markupType, current: currentMarkupType, changed: markupTypeChanged }
    });

    // If nothing critical changed, return exact original calculations
    if (!quantityChanged && !markupChanged && !markupTypeChanged) {
      console.log('✅ No critical changes detected, preserving exact original calculations');
      return {
        ...this.original.calculations,
        preservationMode: 'exact_preservation',
        preservedAt: new Date().toISOString()
      };
    }

    // If only markup changed, recalculate with precision using original base
    if (!quantityChanged && (markupChanged || markupTypeChanged)) {
      console.log('🔄 Markup changed, recalculating with preserved base');
      
      const preciseCalc = calculateWithPrecision(
        this.originalBase.subtotalPerCard,
        currentMarkupPercentage,
        this.originalBase.quantity,
        this.originalBase.gstRate
      );

      return {
        ...this.original.calculations,
        // Update only markup-related fields
        markupType: currentMarkupType,
        markupPercentage: currentMarkupPercentage,
        markupAmount: preciseCalc.markupAmount,
        totalCostPerCard: preciseCalc.totalCostPerCard,
        totalCost: preciseCalc.totalCost,
        gstAmount: preciseCalc.gstAmount,
        totalWithGST: preciseCalc.totalWithGST,
        preservationMode: 'markup_recalculation',
        recalculatedAt: new Date().toISOString(),
        changedFields: ['markupPercentage', 'markupType']
      };
    }

    // If quantity changed, recalculate total-related fields
    if (quantityChanged) {
      console.log('🔄 Quantity changed, recalculating totals with preserved per-card values');
      
      const preciseCalc = calculateWithPrecision(
        this.originalBase.subtotalPerCard,
        currentMarkupPercentage,
        currentQuantity,
        this.originalBase.gstRate
      );

      return {
        ...this.original.calculations,
        // Update all calculation fields for quantity change
        markupType: currentMarkupType,
        markupPercentage: currentMarkupPercentage,
        markupAmount: preciseCalc.markupAmount,
        totalCostPerCard: preciseCalc.totalCostPerCard,
        totalCost: preciseCalc.totalCost,
        gstAmount: preciseCalc.gstAmount,
        totalWithGST: preciseCalc.totalWithGST,
        preservationMode: 'quantity_recalculation',
        recalculatedAt: new Date().toISOString(),
        changedFields: Array.from(this.changedFields)
      };
    }

    // Fallback: return original calculations
    console.log('⚠️ Unexpected change pattern, preserving original calculations');
    return {
      ...this.original.calculations,
      preservationMode: 'fallback_preservation',
      preservedAt: new Date().toISOString()
    };
  }

  /**
   * Validate the current calculations against expected values
   */
  validateCurrentCalculations(calculations) {
    if (!calculations) {
      return {
        isValid: false,
        errors: ['No calculations provided for validation']
      };
    }

    const tempEstimate = {
      id: this.original.id,
      projectName: this.original.projectName,
      jobDetails: {
        quantity: calculations.quantity || this.originalBase?.quantity
      },
      calculations: calculations
    };

    const validation = validateCalculationConsistency([tempEstimate]);
    
    return {
      isValid: !validation.hasErrors,
      errors: validation.errors,
      preservationMode: calculations.preservationMode || 'unknown'
    };
  }

  /**
   * Get a summary of what changed and how calculations were handled
   */
  getSummary(finalCalculations) {
    return {
      estimateId: this.original.id,
      projectName: this.original.projectName,
      preservationMode: finalCalculations?.preservationMode || 'unknown',
      changedFields: Array.from(this.changedFields),
      hasCriticalChanges: this.hasCriticalChanges(),
      originalBase: this.originalBase,
      finalValues: finalCalculations ? {
        subtotalPerCard: finalCalculations.subtotalPerCard,
        markupPercentage: finalCalculations.markupPercentage,
        totalCostPerCard: finalCalculations.totalCostPerCard,
        totalWithGST: finalCalculations.totalWithGST
      } : null,
      validationPassed: finalCalculations ? this.validateCurrentCalculations(finalCalculations).isValid : false
    };
  }
}

/**
 * Utility function to create and use EditModeCalculationManager
 */
export const handleEditModeCalculations = (originalEstimate, newFormData, changedFields = []) => {
  const manager = new EditModeCalculationManager(originalEstimate);
  
  // Mark changed fields
  changedFields.forEach(field => manager.markFieldChanged(field));
  
  // Get preserved/recalculated values
  const calculations = manager.getCalculations(newFormData);
  
  // Validate the results
  const validation = manager.validateCurrentCalculations(calculations);
  
  // Get summary
  const summary = manager.getSummary(calculations);
  
  console.log('📊 Edit mode calculation handling complete:', summary);
  
  if (!validation.isValid) {
    console.warn('⚠️ Validation failed for edit mode calculations:', validation.errors);
  }
  
  return {
    calculations,
    validation,
    summary,
    manager
  };
};

/**
 * Specialized function for ReviewAndSubmit component in edit mode
 */
export const getEditModeCalculationsForReview = (originalEstimate, currentMarkupType, currentMarkupPercentage) => {
  if (!originalEstimate.calculations) {
    return null;
  }

  const manager = new EditModeCalculationManager(originalEstimate);
  
  // Check if markup changed
  const originalMarkupType = originalEstimate.calculations.markupType;
  const originalMarkupPercentage = parseFloat(originalEstimate.calculations.markupPercentage || 0);
  
  if (currentMarkupType === originalMarkupType && currentMarkupPercentage === originalMarkupPercentage) {
    // No markup changes, return exact original
    console.log('✅ No markup changes in review, preserving exact calculations');
    return {
      ...originalEstimate.calculations,
      preservationMode: 'review_exact_preservation'
    };
  }

  // Markup changed, recalculate with precision
  console.log('🔄 Markup changed in review, recalculating with precision');
  
  const originalBase = manager.originalBase;
  const preciseCalc = calculateWithPrecision(
    originalBase.subtotalPerCard,
    currentMarkupPercentage,
    originalBase.quantity,
    originalBase.gstRate
  );

  return {
    ...originalEstimate.calculations,
    markupType: currentMarkupType,
    markupPercentage: currentMarkupPercentage,
    markupAmount: preciseCalc.markupAmount,
    totalCostPerCard: preciseCalc.totalCostPerCard,
    totalCost: preciseCalc.totalCost,
    gstAmount: preciseCalc.gstAmount,
    totalWithGST: preciseCalc.totalWithGST,
    preservationMode: 'review_markup_recalculation',
    recalculatedAt: new Date().toISOString()
  };
};

/**
 * Helper to detect what fields actually changed between original and new data
 */
export const detectChangedFields = (originalEstimate, newFormData) => {
  const changedFields = [];
  
  // Check basic fields
  if (originalEstimate.projectName !== newFormData.projectName) {
    changedFields.push('projectName');
  }
  
  // Check quantity
  const originalQuantity = parseInt(originalEstimate.jobDetails?.quantity || 0);
  const newQuantity = parseInt(newFormData.orderAndPaper?.quantity || newFormData.jobDetails?.quantity || 0);
  if (originalQuantity !== newQuantity) {
    changedFields.push('quantity');
  }
  
  // Check job type
  if (originalEstimate.jobDetails?.jobType !== newFormData.orderAndPaper?.jobType) {
    changedFields.push('jobType');
  }
  
  // Check paper details
  if (originalEstimate.jobDetails?.paperName !== newFormData.orderAndPaper?.paperName) {
    changedFields.push('paperName');
  }
  
  // Check die details
  if (originalEstimate.dieDetails?.dieCode !== newFormData.orderAndPaper?.dieCode) {
    changedFields.push('dieCode');
  }
  
  // Check service usage
  const services = ['lpDetails', 'fsDetails', 'embDetails', 'digiDetails', 'notebookDetails', 'screenPrint', 'misc'];
  services.forEach(service => {
    const originalUsage = originalEstimate[service]?.isLPUsed || 
                         originalEstimate[service]?.isFSUsed || 
                         originalEstimate[service]?.isEMBUsed || 
                         originalEstimate[service]?.isDigiUsed || 
                         originalEstimate[service]?.isNotebookUsed || 
                         originalEstimate[service]?.isScreenPrintUsed || 
                         originalEstimate[service]?.isMiscUsed || false;
    
    const newUsage = newFormData[service]?.isLPUsed || 
                    newFormData[service]?.isFSUsed || 
                    newFormData[service]?.isEMBUsed || 
                    newFormData[service]?.isDigiUsed || 
                    newFormData[service]?.isNotebookUsed || 
                    newFormData[service]?.isScreenPrintUsed || 
                    newFormData[service]?.isMiscUsed || false;
    
    if (originalUsage !== newUsage) {
      changedFields.push(service);
    }
  });
  
  console.log('🔍 Detected changed fields:', changedFields);
  return changedFields;
};

export default {
  EditModeCalculationManager,
  handleEditModeCalculations,
  getEditModeCalculationsForReview,
  detectChangedFields
};