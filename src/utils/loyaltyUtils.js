import { collection, addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

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
 * Format a loyalty tier message for clients
 */
export const formatLoyaltyTierMessage = (oldTier, newTier, orderCount) => {
  if (!newTier) return null;
  
  if (!oldTier) {
    return `Congratulations! You've reached the ${newTier.name} loyalty tier with ${orderCount} orders. You now receive a ${newTier.discount}% discount on all orders.`;
  }
  
  return `Congratulations! You've been upgraded from ${oldTier.name} to ${newTier.name} with ${orderCount} orders. Your discount has increased from ${oldTier.discount}% to ${newTier.discount}%.`;
};

/**
 * Generate loyalty progress information for a client
 */
export const getLoyaltyProgressInfo = (clientOrderCount, tiers) => {
  if (!tiers || tiers.length === 0 || !clientOrderCount) {
    return {
      currentTierIndex: -1,
      nextTier: null,
      ordersUntilNextTier: null,
      progressPercentage: 0
    };
  }
  
  // Sort tiers by order threshold
  const sortedTiers = [...tiers].sort((a, b) => a.orderThreshold - b.orderThreshold);
  
  // Find current tier index
  let currentTierIndex = -1;
  for (let i = 0; i < sortedTiers.length; i++) {
    if (clientOrderCount >= sortedTiers[i].orderThreshold) {
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
        ordersUntilNextTier: null,
        progressPercentage: 100
      };
    }
    
    // If no tier yet
    const firstTier = sortedTiers[0];
    return {
      currentTierIndex: -1,
      nextTier: firstTier,
      ordersUntilNextTier: firstTier.orderThreshold - clientOrderCount,
      progressPercentage: (clientOrderCount / firstTier.orderThreshold) * 100
    };
  }
  
  // There is a next tier available
  const currentTier = sortedTiers[currentTierIndex];
  const nextTier = sortedTiers[currentTierIndex + 1];
  const ordersUntilNextTier = nextTier.orderThreshold - clientOrderCount;
  
  // Calculate progress percentage to next tier
  const totalOrdersForNextTier = nextTier.orderThreshold - currentTier.orderThreshold;
  const ordersProgress = clientOrderCount - currentTier.orderThreshold;
  const progressPercentage = (ordersProgress / totalOrdersForNextTier) * 100;
  
  return {
    currentTierIndex,
    nextTier,
    ordersUntilNextTier,
    progressPercentage
  };
};

/**
 * Recalculate estimates with loyalty discount
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