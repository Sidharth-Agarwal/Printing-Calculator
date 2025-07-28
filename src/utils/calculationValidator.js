export const validateCalculationConsistency = (estimates) => {
  const errors = [];
  let totalCalculatedAmount = 0;
  let totalCalculatedGST = 0;
  let totalCalculatedFinal = 0;
  
  estimates.forEach((estimate, index) => {
    const calc = estimate?.calculations || {};
    const quantity = parseInt(estimate?.jobDetails?.quantity || 0);
    
    const unitCost = parseFloat(calc.totalCostPerCard || 0);
    const totalCost = parseFloat(calc.totalCost || 0);
    const gstRate = parseFloat(calc.gstRate || 18);
    const gstAmount = parseFloat(calc.gstAmount || 0);
    const finalTotal = parseFloat(calc.totalWithGST || 0);
    
    // Validate individual estimate calculations
    const expectedTotalCost = unitCost * quantity;
    const expectedGSTAmount = totalCost * (gstRate / 100);
    const expectedFinalTotal = totalCost + gstAmount;
    
    if (Math.abs(expectedTotalCost - totalCost) > 0.02) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName,
        field: 'totalCost',
        expected: expectedTotalCost,
        actual: totalCost,
        difference: Math.abs(expectedTotalCost - totalCost)
      });
    }
    
    if (Math.abs(expectedGSTAmount - gstAmount) > 0.02) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName,
        field: 'gstAmount',
        expected: expectedGSTAmount,
        actual: gstAmount,
        difference: Math.abs(expectedGSTAmount - gstAmount)
      });
    }
    
    if (Math.abs(expectedFinalTotal - finalTotal) > 0.02) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName,
        field: 'finalTotal',
        expected: expectedFinalTotal,
        actual: finalTotal,
        difference: Math.abs(expectedFinalTotal - finalTotal)
      });
    }
    
    // Accumulate for grand total validation
    totalCalculatedAmount += totalCost;
    totalCalculatedGST += gstAmount;
    totalCalculatedFinal += finalTotal;
  });
  
  return {
    hasErrors: errors.length > 0,
    errors,
    totals: {
      amount: totalCalculatedAmount,
      gst: totalCalculatedGST,
      final: totalCalculatedFinal
    }
  };
};

// Precision calculation helper to avoid floating point errors
export const calculateWithPrecision = (subtotal, markupPercentage, quantity, gstRate) => {
  // Calculate in cents to avoid floating point errors
  const subtotalCents = Math.round(subtotal * 100);
  const markupCents = Math.round(subtotalCents * (markupPercentage / 100));
  const totalCostPerCardCents = subtotalCents + markupCents;
  const totalCostCents = totalCostPerCardCents * quantity;
  const gstCents = Math.round(totalCostCents * (gstRate / 100));
  const totalWithGSTCents = totalCostCents + gstCents;
  
  return {
    markupAmount: (markupCents / 100).toFixed(2),
    totalCostPerCard: (totalCostPerCardCents / 100).toFixed(2),
    totalCost: (totalCostCents / 100).toFixed(2),
    gstAmount: (gstCents / 100).toFixed(2),
    totalWithGST: (totalWithGSTCents / 100).toFixed(2)
  };
};