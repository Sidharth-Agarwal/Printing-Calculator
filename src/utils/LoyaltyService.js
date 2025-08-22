import { collection, doc, getDoc, getDocs, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Fetch all loyalty tiers sorted by amount threshold
 */
export const getLoyaltyTiers = async () => {
  try {
    const tiersCollection = collection(db, "loyaltyTiers");
    const snapshot = await getDocs(tiersCollection);
    
    const tiers = snapshot.docs.map((doc) => ({
      dbId: doc.id,
      ...doc.data()
    }));
    
    // Sort by amount threshold in ascending order
    return tiers.sort((a, b) => a.amountThreshold - b.amountThreshold);
  } catch (error) {
    console.error("Error fetching loyalty tiers:", error);
    throw error;
  }
};

/**
 * Get the appropriate loyalty tier based on total order amount
 */
export const getTierByOrderAmount = async (totalAmount) => {
  try {
    if (!totalAmount || totalAmount < 1) return null;
    
    const tiers = await getLoyaltyTiers();
    
    // Find the highest tier the client qualifies for
    let appropriateTier = null;
    
    for (const tier of tiers) {
      if (totalAmount >= tier.amountThreshold) {
        appropriateTier = tier;
      } else {
        // Stop once we reach a tier with higher threshold
        break;
      }
    }
    
    return appropriateTier;
  } catch (error) {
    console.error("Error getting tier by order amount:", error);
    return null;
  }
};

/**
 * Get a client's current loyalty tier
 */
export const getClientCurrentTier = async (clientId) => {
  try {
    if (!clientId) return null;
    
    // Get client document
    const clientDoc = await getDoc(doc(db, "clients", clientId));
    
    if (!clientDoc.exists()) {
      console.error(`Client with ID ${clientId} not found`);
      return null;
    }
    
    const clientData = clientDoc.data();
    
    // If client doesn't have a tier ID, check if they should based on total amount
    if (!clientData.loyaltyTierId && clientData.totalOrderAmount) {
      return await getTierByOrderAmount(clientData.totalOrderAmount);
    }
    
    // If client has a tier ID, fetch that tier
    if (clientData.loyaltyTierId) {
      const tierDoc = await getDoc(doc(db, "loyaltyTiers", clientData.loyaltyTierId));
      
      if (tierDoc.exists()) {
        return {
          dbId: tierDoc.id,
          ...tierDoc.data()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting client current tier:", error);
    return null;
  }
};

/**
 * Update a client's total order amount and loyalty tier
 */
export const updateClientOrderAmountAndTier = async (clientId, orderAmount) => {
  try {
    if (!clientId) {
      console.error("No client ID provided for loyalty update");
      return { success: false, message: "No client ID provided" };
    }
    
    if (!orderAmount || orderAmount <= 0) {
      console.error("Invalid order amount provided for loyalty update");
      return { success: false, message: "Invalid order amount" };
    }
    
    const clientRef = doc(db, "clients", clientId);
    const clientDoc = await getDoc(clientRef);
    
    if (!clientDoc.exists()) {
      console.error(`Client with ID ${clientId} not found`);
      return { success: false, message: "Client not found" };
    }
    
    const clientData = clientDoc.data();
    const currentOrderCount = clientData.orderCount || 0;
    const currentTotalAmount = clientData.totalOrderAmount || 0;
    const newOrderCount = currentOrderCount + 1;
    const newTotalAmount = currentTotalAmount + parseFloat(orderAmount);
    
    // Get the current tier before update
    const oldTier = await getClientCurrentTier(clientId);
    
    // Get the appropriate tier for the new total amount
    const newTier = await getTierByOrderAmount(newTotalAmount);
    
    // Check if tier changed
    const tierChanged = (!clientData.loyaltyTierId && newTier) || 
                        (clientData.loyaltyTierId !== (newTier?.dbId || null));
    
    // Update client document with loyalty tier information including color
    await updateDoc(clientRef, {
      orderCount: newOrderCount,
      totalOrderAmount: newTotalAmount,
      loyaltyTierId: newTier?.dbId || null,
      loyaltyTierName: newTier?.name || null,
      loyaltyTierColor: newTier?.color || "#9f7aea",
      loyaltyTierDiscount: newTier?.discount || 0,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true, 
      orderCount: newOrderCount,
      totalOrderAmount: newTotalAmount,
      tier: newTier,
      oldTier: oldTier,
      tierChanged
    };
  } catch (error) {
    console.error("Error updating client loyalty:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Apply a loyalty discount to order calculations - FIXED to handle 0% discount
 */
export const applyLoyaltyDiscount = (calculations, tier) => {
  try {
    // Add validation
    if (!calculations) {
      console.error("No calculations provided to applyLoyaltyDiscount");
      return calculations;
    }
    
    if (!tier) {
      console.error("No tier provided to applyLoyaltyDiscount");
      return calculations;
    }
    
    // Handle case where discount is undefined or null
    const discountPercent = parseFloat(tier.discount || 0);
    
    if (isNaN(discountPercent) || discountPercent < 0) {
      console.error("Invalid discount percentage:", tier.discount);
      return calculations;
    }
    
    // Get the total cost before GST - add more fallbacks
    const totalCost = parseFloat(calculations.totalCost || calculations.totalWithoutGST || 0);
    
    if (totalCost <= 0) {
      console.error("Invalid total cost for discount calculation:", totalCost);
      return {
        ...calculations,
        loyaltyTierId: tier.dbId,
        loyaltyTierName: tier.name,
        loyaltyTierColor: tier.color || "#9f7aea",
        loyaltyTierDiscount: discountPercent,
        loyaltyDiscountAmount: "0.00",
        discountedTotalCost: totalCost.toFixed(2),
        originalTotalCost: totalCost.toFixed(2)
      };
    }
    
    // FIXED: Handle 0% discount properly
    if (discountPercent === 0) {
      console.log("Applying 0% discount - no discount amount but keeping tier info");
      return {
        ...calculations,
        loyaltyTierId: tier.dbId,
        loyaltyTierName: tier.name,
        loyaltyTierColor: tier.color || "#9f7aea",
        loyaltyTierDiscount: 0,
        loyaltyDiscountAmount: "0.00",
        discountedTotalCost: totalCost.toFixed(2),
        originalTotalCost: totalCost.toFixed(2),
        // Keep original GST calculations
        gstAmount: calculations.gstAmount,
        totalWithGST: calculations.totalWithGST
      };
    }
    
    // Calculate discount amount for non-zero discounts
    const discountAmount = (totalCost * discountPercent) / 100;
    
    // Calculate new total after discount
    const discountedTotal = totalCost - discountAmount;
    
    // Recalculate GST based on the discounted total
    const gstRate = parseFloat(calculations.gstRate || 18);
    const newGstAmount = (discountedTotal * gstRate) / 100;
    
    // Calculate total with GST
    const newTotalWithGST = discountedTotal + newGstAmount;
    
    // Return updated calculations with loyalty discount applied
    const result = {
      ...calculations,
      loyaltyTierId: tier.dbId,
      loyaltyTierName: tier.name,
      loyaltyTierColor: tier.color || "#9f7aea",
      loyaltyTierDiscount: discountPercent,
      loyaltyDiscountAmount: discountAmount.toFixed(2),
      discountedTotalCost: discountedTotal.toFixed(2),
      originalTotalCost: totalCost.toFixed(2),
      // Update the GST amount and total with GST
      gstAmount: newGstAmount.toFixed(2),
      totalWithGST: newTotalWithGST.toFixed(2)
    };
    
    console.log("Applied loyalty discount successfully:", {
      originalTotal: totalCost,
      discountPercent: discountPercent,
      discountAmount: discountAmount.toFixed(2),
      finalTotal: newTotalWithGST.toFixed(2)
    });
    
    return result;
  } catch (error) {
    console.error("Error applying loyalty discount:", error);
    // Return original calculations with minimal loyalty info to prevent crashes
    return {
      ...calculations,
      loyaltyTierId: tier?.dbId || null,
      loyaltyTierName: tier?.name || null,
      loyaltyTierColor: tier?.color || "#9f7aea",
      loyaltyTierDiscount: parseFloat(tier?.discount || 0),
      loyaltyDiscountAmount: "0.00" // Safe fallback
    };
  }
};

/**
 * Check if client is eligible for loyalty program
 */
export const isClientEligibleForLoyalty = async (clientId) => {
  if (!clientId) return false;
  
  try {
    const clientDoc = await getDoc(doc(db, "clients", clientId));
    
    if (!clientDoc.exists()) return false;
    
    const clientData = clientDoc.data();
    
    // Check if client is a B2B client
    return clientData.clientType && clientData.clientType.toUpperCase() === "B2B";
  } catch (error) {
    console.error("Error checking client eligibility for loyalty:", error);
    return false;
  }
};

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "₹0";
  
  const numAmount = parseFloat(amount);
  
  // Format with Indian number system (lakhs/crores)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
};

/**
 * Calculate progress to next tier based on amount
 */
export const calculateTierProgress = (currentAmount, currentTier, nextTier) => {
  if (!nextTier) return 100; // Already at highest tier
  
  if (!currentTier) {
    // No current tier, progress towards first tier
    return Math.min((currentAmount / nextTier.amountThreshold) * 100, 100);
  }
  
  // Progress from current tier to next tier
  const amountRange = nextTier.amountThreshold - currentTier.amountThreshold;
  const amountProgress = currentAmount - currentTier.amountThreshold;
  
  return Math.min((amountProgress / amountRange) * 100, 100);
};