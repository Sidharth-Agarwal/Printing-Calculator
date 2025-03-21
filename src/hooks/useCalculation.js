import { useState, useEffect, useCallback } from 'react';
import { useBillingForm } from '../context/BillingFormContext';
import { calculateEstimateCosts } from '../services/calculations';

/**
 * Custom hook for handling calculations in the billing form
 */
const useCalculation = () => {
  const { state, dispatch } = useBillingForm();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);

  // Function to perform calculations
  const performCalculations = useCallback(async () => {
    setIsCalculating(true);
    setCalculationError(null);

    try {
      const result = await calculateEstimateCosts(state);
      if (result.error) {
        setCalculationError(result.error);
        return null;
      }
      return result;
    } catch (error) {
      setCalculationError(error.message || 'Error performing calculations');
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [state]);

  // Calculate totals with wastage, overhead, and markup
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
    
    // Calculate cost with wastage and overhead
    const costWithOverhead = baseWithMisc + wastageCost + overheadCost;
    
    // Calculate markup cost
    const markupCost = costWithOverhead * (markupPercentage / 100);
    
    const totalCostPerCard = costWithOverhead + markupCost;
    const totalQuantity = parseInt(state.orderAndPaper?.quantity, 10) || 0;
    const totalCost = totalCostPerCard * totalQuantity;

    return {
      baseCost: baseCost.toFixed(2),
      miscCharge: MISC_CHARGE_PER_CARD.toFixed(2),
      baseWithMisc: baseWithMisc.toFixed(2),
      wastageCost: wastageCost.toFixed(2),
      overheadCost: overheadCost.toFixed(2),
      markupCost: markupCost.toFixed(2),
      totalCostPerCard: totalCostPerCard.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  }, [state.orderAndPaper?.quantity]);

  return {
    performCalculations,
    calculateTotals,
    isCalculating,
    calculationError
  };
};

export default useCalculation;