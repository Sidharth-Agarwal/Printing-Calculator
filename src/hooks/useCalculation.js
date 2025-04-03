// src/hooks/useCalculation.js
import { useState, useEffect, useCallback } from 'react';
import { calculateEstimateCosts } from '../utils/calculationUtils';

/**
 * Custom hook for handling estimate calculations
 * Provides debounced calculations, caching, and state management
 */
const useCalculation = (formState) => {
  const [calculations, setCalculations] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [miscCharge, setMiscCharge] = useState(5); // Default 5 rupees per card
  
  // Check if essential fields are filled for calculation
  const canCalculate = useCallback((state) => {
    // Validate client information
    if (!state.clientInfo?.clientId || !state.clientInfo?.clientName) {
      return false;
    }
    
    // Check essential order and paper fields
    const { orderAndPaper } = state;
    if (!orderAndPaper?.projectName || !orderAndPaper?.quantity || 
        !orderAndPaper?.paperName || !orderAndPaper?.dieCode || 
        !orderAndPaper?.dieSize?.length || !orderAndPaper?.dieSize?.breadth) {
      return false;
    }
    
    return true;
  }, []);
  
  // Perform calculations
  const performCalculations = useCallback(async (state) => {
    if (!canCalculate(state)) {
      return null;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      const result = await calculateEstimateCosts(state);
      
      if (result.error) {
        setError(result.error);
        console.error("Error during calculations:", result.error);
        return null;
      }
      
      setCalculations(result);
      return result;
    } catch (err) {
      setError('Unexpected error during calculations: ' + err.message);
      console.error("Unexpected error during calculations:", err);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [canCalculate]);
  
  // Calculate total cost with markup and miscellaneous charge
  const calculateTotalCost = useCallback((calcs = calculations) => {
    if (!calcs) return null;
    
    const WASTAGE_PERCENTAGE = 5; // 5% wastage
    const OVERHEAD_PERCENTAGE = 35; // 35% overhead
    
    // Define all cost fields that should be included
    const relevantFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard',
      'dieCuttingCostPerCard',
      'pastingCostPerCard'
    ];

    // Calculate base cost per card
    const baseCost = relevantFields.reduce((acc, key) => {
      const value = calcs[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);

    // Add miscellaneous charge to base cost
    const baseWithMisc = baseCost + miscCharge;
    
    // Calculate wastage cost
    const wastageCost = baseWithMisc * (WASTAGE_PERCENTAGE / 100);
    
    // Calculate overhead cost
    const overheadCost = baseWithMisc * (OVERHEAD_PERCENTAGE / 100);
    
    // Calculate cost with wastage and overhead
    const costWithOverhead = baseWithMisc + wastageCost + overheadCost;
    
    // Calculate markup cost
    const markupCost = costWithOverhead * (markupPercentage / 100);
    
    // Return comprehensive cost breakdown
    return {
      baseCost,
      miscCharge,
      baseWithMisc,
      wastagePercentage: WASTAGE_PERCENTAGE,
      wastageCost,
      overheadPercentage: OVERHEAD_PERCENTAGE,
      overheadCost,
      subtotal: costWithOverhead,
      markupPercentage,
      markupCost,
      totalCostPerCard: costWithOverhead + markupCost,
      quantity: formState?.orderAndPaper?.quantity || 0,
      totalCost: (costWithOverhead + markupCost) * (formState?.orderAndPaper?.quantity || 0)
    };
  }, [calculations, markupPercentage, miscCharge, formState]);
  
  // Create enhanced calculations object with all cost details
  const getEnhancedCalculations = useCallback(() => {
    if (!calculations) return null;
    
    const costDetails = calculateTotalCost();
    if (!costDetails) return null;
    
    return {
      ...calculations,
      
      // Standard cost components
      baseCost: costDetails.baseCost.toFixed(2),
      miscChargePerCard: costDetails.miscCharge.toFixed(2),
      baseWithMisc: costDetails.baseWithMisc.toFixed(2),
      wastagePercentage: costDetails.wastagePercentage,
      wastageAmount: costDetails.wastageCost.toFixed(2),
      overheadPercentage: costDetails.overheadPercentage,
      overheadAmount: costDetails.overheadCost.toFixed(2),
      
      // Markup information
      markupPercentage: costDetails.markupPercentage,
      markupAmount: costDetails.markupCost.toFixed(2),
      
      // Totals
      subtotalPerCard: costDetails.subtotal.toFixed(2),
      totalCostPerCard: costDetails.totalCostPerCard.toFixed(2),
      totalCost: costDetails.totalCost.toFixed(2)
    };
  }, [calculations, calculateTotalCost]);
  
  // Update calculations when form state changes
  useEffect(() => {
    if (!formState) return;
    
    const debounceTimer = setTimeout(() => {
      performCalculations(formState);
    }, 800); // 800ms debounce
    
    return () => clearTimeout(debounceTimer);
  }, [formState, performCalculations]);
  
  // Initialize markup from client's default markup if available
  useEffect(() => {
    if (formState?.clientInfo?.defaultMarkup) {
      setMarkupPercentage(formState.clientInfo.defaultMarkup);
    }
  }, [formState?.clientInfo?.defaultMarkup]);
  
  return {
    calculations,
    isCalculating,
    error,
    markupPercentage,
    setMarkupPercentage,
    miscCharge,
    setMiscCharge,
    performCalculations,
    calculateTotalCost,
    getEnhancedCalculations
  };
};

export default useCalculation;