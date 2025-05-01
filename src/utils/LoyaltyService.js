import { collection, doc, getDoc, getDocs, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Fetch all loyalty tiers sorted by order threshold
 */
export const getLoyaltyTiers = async () => {
  try {
    const tiersCollection = collection(db, "loyaltyTiers");
    const snapshot = await getDocs(tiersCollection);
    
    const tiers = snapshot.docs.map((doc) => ({
      dbId: doc.id,
      ...doc.data()
    }));
    
    // Sort by order threshold in ascending order
    return tiers.sort((a, b) => a.orderThreshold - b.orderThreshold);
  } catch (error) {
    console.error("Error fetching loyalty tiers:", error);
    throw error;
  }
};

/**
 * Get the appropriate loyalty tier based on order count
 */
export const getTierByOrderCount = async (orderCount) => {
  try {
    if (!orderCount || orderCount < 1) return null;
    
    const tiers = await getLoyaltyTiers();
    
    // Find the highest tier the client qualifies for
    let appropriateTier = null;
    
    for (const tier of tiers) {
      if (orderCount >= tier.orderThreshold) {
        appropriateTier = tier;
      } else {
        // Stop once we reach a tier with higher threshold
        break;
      }
    }
    
    return appropriateTier;
  } catch (error) {
    console.error("Error getting tier by order count:", error);
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
    
    // If client doesn't have a tier ID, check if they should based on order count
    if (!clientData.loyaltyTierId && clientData.orderCount) {
      return await getTierByOrderCount(clientData.orderCount);
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
 * Update a client's order count and loyalty tier
 */
export const updateClientOrderCountAndTier = async (clientId) => {
  try {
    if (!clientId) {
      console.error("No client ID provided for loyalty update");
      return { success: false, message: "No client ID provided" };
    }
    
    const clientRef = doc(db, "clients", clientId);
    const clientDoc = await getDoc(clientRef);
    
    if (!clientDoc.exists()) {
      console.error(`Client with ID ${clientId} not found`);
      return { success: false, message: "Client not found" };
    }
    
    const clientData = clientDoc.data();
    const currentOrderCount = clientData.orderCount || 0;
    const newOrderCount = currentOrderCount + 1;
    
    // Get the appropriate tier for the new order count
    const newTier = await getTierByOrderCount(newOrderCount);
    
    // Check if tier changed
    const tierChanged = (!clientData.loyaltyTierId && newTier) || 
                        (clientData.loyaltyTierId !== (newTier?.dbId || null));
    
    // Update client document
    await updateDoc(clientRef, {
      orderCount: newOrderCount,
      loyaltyTierId: newTier?.dbId || null,
      loyaltyTierName: newTier?.name || null,
      loyaltyDiscount: newTier?.discount || 0,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true, 
      orderCount: newOrderCount, 
      tier: newTier,
      tierChanged
    };
  } catch (error) {
    console.error("Error updating client loyalty:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Apply a loyalty discount to order calculations
 */
export const applyLoyaltyDiscount = (calculations, tier) => {
  try {
    if (!calculations || !tier || !tier.discount) {
      return calculations;
    }
    
    const discountPercent = parseFloat(tier.discount);
    
    if (isNaN(discountPercent) || discountPercent <= 0) {
      return calculations;
    }
    
    // Get the total cost before GST
    const totalCost = parseFloat(calculations.totalCost);
    
    // Calculate discount amount
    const discountAmount = (totalCost * discountPercent) / 100;
    
    // Calculate new total after discount
    const discountedTotal = totalCost - discountAmount;
    
    // Recalculate GST based on the discounted total
    const gstRate = parseFloat(calculations.gstRate || 18);
    const newGstAmount = (discountedTotal * gstRate) / 100;
    
    // Calculate total with GST
    const newTotalWithGST = discountedTotal + newGstAmount;
    
    // Return updated calculations with loyalty discount applied
    return {
      ...calculations,
      loyaltyTierId: tier.dbId,
      loyaltyTierName: tier.name,
      loyaltyDiscount: discountPercent,
      loyaltyDiscountAmount: discountAmount.toFixed(2),
      discountedTotalCost: discountedTotal.toFixed(2),
      originalTotalCost: totalCost.toFixed(2),
      // Update the GST amount and total with GST
      gstAmount: newGstAmount.toFixed(2),
      totalWithGST: newTotalWithGST.toFixed(2)
    };
  } catch (error) {
    console.error("Error applying loyalty discount:", error);
    return calculations;
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