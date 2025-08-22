import { collection, addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { formatCurrency } from "./LoyaltyService";

/**
 * Create a notification for a loyalty tier change
 */
export const createLoyaltyTierChangeNotification = async (clientId, clientName, oldTier, newTier) => {
  try {
    if (!clientId || !newTier) return null;
    
    const notification = {
      type: 'LOYALTY_TIER_CHANGE',
      clientId,
      clientName,
      oldTierId: oldTier?.dbId || null,
      oldTierName: oldTier?.name || null,
      newTierId: newTier.dbId,
      newTierName: newTier.name,
      newDiscount: newTier.discount,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const notificationsCollection = collection(db, "notifications");
    const docRef = await addDoc(notificationsCollection, notification);
    
    return {
      id: docRef.id,
      ...notification
    };
  } catch (error) {
    console.error("Error creating loyalty notification:", error);
    return null;
  }
};

/**
 * Delete notifications related to a specific client or estimate
 */
export const deleteRelatedNotifications = async (estimateId, clientId) => {
  try {
    // Query notifications related to this client
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("clientId", "==", clientId),
      where("type", "==", "LOYALTY_TIER_CHANGE")
    );
    
    const snapshot = await getDocs(q);
    
    // Delete each notification
    const deletePromises = snapshot.docs.map(doc => {
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error("Error deleting related notifications:", error);
    return { success: false, error };
  }
};

/**
 * Format a loyalty tier message for clients based on order amounts
 */
export const formatLoyaltyTierMessage = (oldTier, newTier, totalOrderAmount) => {
  if (!newTier) return null;
  
  const formattedAmount = formatCurrency(totalOrderAmount);
  
  if (!oldTier) {
    return `Congratulations! You've reached the ${newTier.name} loyalty tier with ${formattedAmount} in total orders. You now receive a ${newTier.discount}% discount on all orders.`;
  }
  
  return `Congratulations! You've been upgraded from ${oldTier.name} to ${newTier.name} with ${formattedAmount} in total orders. Your discount has increased from ${oldTier.discount}% to ${newTier.discount}%.`;
};

/**
 * Generate loyalty progress information for a client based on order amounts
 */
export const getLoyaltyProgressInfo = (clientTotalAmount, tiers) => {
  if (!tiers || tiers.length === 0 || !clientTotalAmount) {
    return {
      currentTierIndex: -1,
      nextTier: null,
      amountUntilNextTier: null,
      progressPercentage: 0
    };
  }
  
  // Sort tiers by amount threshold
  const sortedTiers = [...tiers].sort((a, b) => a.amountThreshold - b.amountThreshold);
  
  // Find current tier index
  let currentTierIndex = -1;
  for (let i = 0; i < sortedTiers.length; i++) {
    if (clientTotalAmount >= sortedTiers[i].amountThreshold) {
      currentTierIndex = i;
    } else {
      break;
    }
  }
  
  // If at highest tier or no tier at all
  if (currentTierIndex === sortedTiers.length - 1 || currentTierIndex === -1) {
    // If at highest tier
    if (currentTierIndex === sortedTiers.length - 1) {
      return {
        currentTierIndex,
        nextTier: null,
        amountUntilNextTier: null,
        progressPercentage: 100
      };
    }
    
    // If no tier yet
    const firstTier = sortedTiers[0];
    return {
      currentTierIndex: -1,
      nextTier: firstTier,
      amountUntilNextTier: firstTier.amountThreshold - clientTotalAmount,
      progressPercentage: (clientTotalAmount / firstTier.amountThreshold) * 100
    };
  }
  
  // There is a next tier available
  const currentTier = sortedTiers[currentTierIndex];
  const nextTier = sortedTiers[currentTierIndex + 1];
  const amountUntilNextTier = nextTier.amountThreshold - clientTotalAmount;
  
  // Calculate progress percentage to next tier
  const totalAmountForNextTier = nextTier.amountThreshold - currentTier.amountThreshold;
  const amountProgress = clientTotalAmount - currentTier.amountThreshold;
  const progressPercentage = (amountProgress / totalAmountForNextTier) * 100;
  
  return {
    currentTierIndex,
    nextTier,
    amountUntilNextTier,
    progressPercentage
  };
};

/**
 * Recalculate estimates with loyalty discount preview based on amounts
 * Can be used for displaying preview of discount on estimates screen
 */
export const previewLoyaltyDiscount = (calculations, discountPercentage) => {
  if (!calculations || !discountPercentage) {
    return calculations;
  }
  
  const discount = parseFloat(discountPercentage);
  
  if (isNaN(discount) || discount <= 0) {
    return calculations;
  }
  
  try {
    // Get the total cost before GST
    const totalCost = parseFloat(calculations.totalCost);
    
    // Calculate discount amount
    const discountAmount = (totalCost * discount) / 100;
    
    // Calculate new total after discount
    const discountedTotal = totalCost - discountAmount;
    
    // Recalculate GST based on the discounted total
    const gstRate = parseFloat(calculations.gstRate || 18);
    const newGstAmount = (discountedTotal * gstRate) / 100;
    
    // Calculate total with GST
    const newTotalWithGST = discountedTotal + newGstAmount;
    
    return {
      ...calculations,
      previewLoyaltyDiscount: discount,
      previewDiscountAmount: discountAmount.toFixed(2),
      previewDiscountedTotal: discountedTotal.toFixed(2),
      previewGstAmount: newGstAmount.toFixed(2),
      previewTotalWithGST: newTotalWithGST.toFixed(2)
    };
  } catch (error) {
    console.error("Error calculating loyalty discount preview:", error);
    return calculations;
  }
};

/**
 * Calculate what tier a hypothetical amount would qualify for
 */
export const getQualifyingTierForAmount = (amount, tiers) => {
  if (!amount || !tiers || tiers.length === 0) return null;
  
  const sortedTiers = [...tiers].sort((a, b) => a.amountThreshold - b.amountThreshold);
  
  let qualifyingTier = null;
  for (const tier of sortedTiers) {
    if (amount >= tier.amountThreshold) {
      qualifyingTier = tier;
    } else {
      break;
    }
  }
  
  return qualifyingTier;
};

/**
 * Format amount progress message for UI display
 */
export const formatAmountProgressMessage = (currentAmount, nextTier, currentTier = null) => {
  if (!nextTier) {
    return "Highest tier achieved!";
  }
  
  const amountNeeded = nextTier.amountThreshold - currentAmount;
  const formattedAmount = formatCurrency(amountNeeded);
  
  if (!currentTier) {
    return `${formattedAmount} more to reach ${nextTier.name}`;
  }
  
  return `${formattedAmount} more to upgrade to ${nextTier.name}`;
};