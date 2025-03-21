// hooks/useCalculation.js
import { useState, useCallback, useRef } from 'react';
import { useBillingForm } from '../context/BillingFormContext';
import { calculateEstimateCosts } from '../services/calculations';
import { ACTION_TYPES } from '../context/BillingFormContext';

/**
 * Custom hook for handling calculations in the billing form
 * Improved version that prevents calculation-related freezing
 */
const useCalculation = () => {
  const { state, dispatch } = useBillingForm();
  
  // Local state for calculation status (don't use context for UI state)
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  const [lastCalculatedAt, setLastCalculatedAt] = useState(null);
  
  // Ref to track calculation timeouts
  const calculationTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  /**
   * Calculate costs manually with improved error handling
   */
  const calculateCosts = useCallback(async () => {
    // Don't start a new calculation if one is already in progress
    if (isCalculating) return null;
    
    // Clear any pending calculation timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
      calculationTimeoutRef.current = null;
    }
    
    // Cancel any in-progress calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsCalculating(true);
    setCalculationError(null);
    
    try {
      // Add a small delay to ensure the UI doesn't freeze
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Check if the calculation was aborted
      if (signal.aborted) return null;
      
      // Perform the calculation
      const result = await calculateEstimateCosts(state);
      
      // Check if the calculation was aborted
      if (signal.aborted) return null;
      
      // Handle calculation result
      if (result && result.error) {
        console.error("Calculation error:", result.error);
        setCalculationError(result.error);
        return null;
      }
      
      // Update the form context with the calculation results
      if (result) {
        dispatch({ type: ACTION_TYPES.UPDATE_CALCULATIONS, payload: result });
      }
      
      // Update last calculation time
      setLastCalculatedAt(new Date());
      
      return result;
    } catch (error) {
      // Ignore aborted calculations
      if (error.name === 'AbortError') {
        console.log('Calculation aborted');
        return null;
      }
      
      console.error("Calculation error:", error);
      setCalculationError(error.message || "An error occurred during calculation");
      return null;
    } finally {
      // Only reset calculating state if this is still the current calculation
      if (abortControllerRef.current && abortControllerRef.current.signal === signal) {
        setIsCalculating(false);
        abortControllerRef.current = null;
      }
    }
  }, [state, dispatch, isCalculating]);
  
  /**
   * Schedule a debounced calculation
   * This allows multiple state changes before triggering a calculation
   */
  const scheduleCalculation = useCallback((delay = 1000) => {
    // Clear any existing timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }
    
    // Set a new timeout for calculation
    calculationTimeoutRef.current = setTimeout(() => {
      calculateCosts().catch(error => {
        console.error("Scheduled calculation error:", error);
        setCalculationError(error.message || "Failed to perform scheduled calculation");
        setIsCalculating(false);
      });
    }, delay);
    
    // Return a function to cancel the scheduled calculation
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
        calculationTimeoutRef.current = null;
      }
    };
  }, [calculateCosts]);
  
  /**
   * Calculate totals with markup, including wastage, overhead, etc.
   */
  const calculateTotals = useCallback((calculations, markupPercentage = 0) => {
    if (!calculations) return {};

    // Constants
    const WASTAGE_PERCENTAGE = 5; // 5% wastage
    const OVERHEAD_PERCENTAGE = 35; // 35% overhead
    const MISC_CHARGE_PER_CARD = 5; // 5 rupees miscellaneous charge per card

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
      const value = calculations[key];
      return acc + (value !== null && value !== undefined ? parseFloat(value) || 0 : 0);
    }, 0);

    // Add miscellaneous charge to base cost
    const baseWithMisc = baseCost + MISC_CHARGE_PER_CARD;
    
    // Calculate wastage cost
    const wastageCost = baseWithMisc * (WASTAGE_PERCENTAGE / 100);
    
    // Calculate overhead cost
    const overheadCost = baseWithMisc * (OVERHEAD_PERCENTAGE / 100);
    
    // Calculate subtotal
    const subtotal = baseWithMisc + wastageCost + overheadCost;
    
    // Calculate markup cost
    const markupCost = subtotal * (markupPercentage / 100);
    
    // Calculate total cost per card
    const totalCostPerCard = subtotal + markupCost;
    
    // Calculate total cost for all cards
    const totalQuantity = parseInt(state.orderAndPaper?.quantity || 0, 10);
    const totalCost = totalCostPerCard * totalQuantity;

    return {
      baseCost: baseCost.toFixed(2),
      miscCharge: MISC_CHARGE_PER_CARD.toFixed(2),
      baseWithMisc: baseWithMisc.toFixed(2),
      wastageCost: wastageCost.toFixed(2),
      overheadCost: overheadCost.toFixed(2),
      subtotal: subtotal.toFixed(2),
      markupCost: markupCost.toFixed(2),
      totalCostPerCard: totalCostPerCard.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  }, [state.orderAndPaper?.quantity]);
  
  /**
   * Check if the form needs recalculation
   */
  const needsRecalculation = useCallback(() => {
    // If no calculations exist yet, definitely need to calculate
    if (!state.calculations) return true;
    
    // If no previous calculation time, need to calculate
    if (!lastCalculatedAt) return true;
    
    // Return true if it's been more than 5 minutes since last calculation
    return (new Date() - lastCalculatedAt) > 5 * 60 * 1000;
  }, [state.calculations, lastCalculatedAt]);
  
  /**
   * Cancel any pending or in-progress calculations
   */
  const cancelCalculation = useCallback(() => {
    // Cancel any scheduled calculation
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
      calculationTimeoutRef.current = null;
    }
    
    // Abort any in-progress calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Reset calculation state
    setIsCalculating(false);
  }, []);
  
  // Return the calculation-related methods and state
  // At the return statement in useCalculation.js
  return {
    // Methods
    calculateCosts,
    scheduleCalculation,
    calculateTotals,
    needsRecalculation,
    cancelCalculation,
    // Add this alias for backward compatibility
    cancelScheduledCalculation: cancelCalculation,
    
    // State
    isCalculating,
    calculationError,
    lastCalculatedAt
  };
};

export default useCalculation;