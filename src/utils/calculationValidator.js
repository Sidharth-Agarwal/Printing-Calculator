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
    
    // Use the fixed precision calculation for validation
    const preciseCalc = calculateWithPrecision(
      parseFloat(calc.subtotalPerCard || calc.costWithMisc || 0),
      parseFloat(calc.markupPercentage || 0),
      quantity,
      gstRate
    );
    
    // Validate individual estimate calculations using precise values
    const expectedTotalCost = parseFloat(preciseCalc.totalCost);
    const expectedGSTAmount = parseFloat(preciseCalc.gstAmount);
    const expectedFinalTotal = parseFloat(preciseCalc.totalWithGST);
    
    if (Math.abs(expectedTotalCost - totalCost) > 0.01) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName,
        field: 'totalCost',
        expected: expectedTotalCost,
        actual: totalCost,
        difference: Math.abs(expectedTotalCost - totalCost)
      });
    }
    
    if (Math.abs(expectedGSTAmount - gstAmount) > 0.01) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName,
        field: 'gstAmount',
        expected: expectedGSTAmount,
        actual: gstAmount,
        difference: Math.abs(expectedGSTAmount - gstAmount)
      });
    }
    
    if (Math.abs(expectedFinalTotal - finalTotal) > 0.01) {
      errors.push({
        estimateId: estimate.id,
        projectName: estimate.projectName,
        field: 'finalTotal',
        expected: expectedFinalTotal,
        actual: finalTotal,
        difference: Math.abs(expectedFinalTotal - finalTotal)
      });
    }
    
    // Use actual saved values for totals (not recalculated)
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

// FIXED: Precision calculation helper to avoid floating point errors
export const calculateWithPrecision = (subtotal, markupPercentage, quantity, gstRate) => {
  // Work with integers in the smallest currency unit (cents/paise)
  // Use BigInt for large numbers to avoid integer overflow
  
  const subtotalPaise = BigInt(Math.round(subtotal * 100));
  const markupPercent = Math.round(markupPercentage * 100); // Store as basis points (10000 = 100%)
  const gstPercent = Math.round(gstRate * 100); // Store as basis points
  
  // Calculate markup: (subtotal * markupPercent) / 10000
  const markupPaise = (subtotalPaise * BigInt(markupPercent)) / BigInt(10000);
  
  // Total cost per card
  const totalCostPerCardPaise = subtotalPaise + markupPaise;
  
  // Total cost for all quantity
  const totalCostPaise = totalCostPerCardPaise * BigInt(quantity);
  
  // Calculate GST: (totalCost * gstPercent) / 10000
  const gstPaise = (totalCostPaise * BigInt(gstPercent)) / BigInt(10000);
  
  // Final total
  const totalWithGSTPaise = totalCostPaise + gstPaise;
  
  // Convert back to currency with proper rounding
  return {
    markupAmount: (Number(markupPaise) / 100).toFixed(2),
    totalCostPerCard: (Number(totalCostPerCardPaise) / 100).toFixed(2),
    totalCost: (Number(totalCostPaise) / 100).toFixed(2),
    gstAmount: (Number(gstPaise) / 100).toFixed(2),
    totalWithGST: (Number(totalWithGSTPaise) / 100).toFixed(2)
  };
};

// Helper function to safely add currency values
export const addCurrency = (...amounts) => {
  const totalPaise = amounts.reduce((sum, amount) => {
    return sum + BigInt(Math.round(parseFloat(amount || 0) * 100));
  }, BigInt(0));
  
  return (Number(totalPaise) / 100).toFixed(2);
};

// Helper function to safely multiply currency by quantity
export const multiplyCurrency = (amount, multiplier) => {
  const amountPaise = BigInt(Math.round(parseFloat(amount || 0) * 100));
  const result = amountPaise * BigInt(multiplier);
  return (Number(result) / 100).toFixed(2);
};

// Helper function to calculate percentage of currency amount
export const calculatePercentage = (amount, percentage) => {
  const amountPaise = BigInt(Math.round(parseFloat(amount || 0) * 100));
  const percentBasisPoints = Math.round(percentage * 100);
  const result = (amountPaise * BigInt(percentBasisPoints)) / BigInt(10000);
  return (Number(result) / 100).toFixed(2);
};