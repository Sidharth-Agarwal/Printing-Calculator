import { collection, doc, getDoc, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getLoyaltyTiers, getTierByOrderCount } from "./LoyaltyService";

/**
 * Check and update loyalty tiers for all clients
 * This can be run periodically to ensure all clients are in the correct tier
 */
export const syncAllClientLoyaltyTiers = async () => {
  try {
    const clientsCollection = collection(db, "clients");
    const snapshot = await getDocs(clientsCollection);
    
    const updatePromises = [];
    const results = {
      total: 0,
      updated: 0,
      errors: 0,
      details: []
    };
    
    // Process each client
    for (const clientDoc of snapshot.docs) {
      results.total++;
      const clientId = clientDoc.id;
      const clientData = clientDoc.data();
      
      // Only update B2B clients
      if (clientData.clientType && clientData.clientType.toUpperCase() === "B2B") {
        try {
          const currentOrderCount = clientData.orderCount || 0;
          
          // Skip clients with no orders
          if (currentOrderCount > 0) {
            // Get appropriate tier for this order count
            const appropriateTier = await getTierByOrderCount(currentOrderCount);
            
            // Check if client needs tier update
            const needsUpdate = 
              (!clientData.loyaltyTierId && appropriateTier) || 
              (clientData.loyaltyTierId !== (appropriateTier?.dbId || null));
            
            if (needsUpdate) {
              // Update client document with tier information including color
              const updatePromise = updateDoc(doc(db, "clients", clientId), {
                loyaltyTierId: appropriateTier?.dbId || null,
                loyaltyTierName: appropriateTier?.name || null,
                loyaltyTierColor: appropriateTier?.color || "#9f7aea", // Add tier color
                loyaltyTierDiscount: appropriateTier?.discount || 0, // Rename to keep consistent naming
                updatedAt: new Date().toISOString()
              });
              
              updatePromises.push(updatePromise);
              results.updated++;
              results.details.push({
                clientId,
                clientName: clientData.name,
                oldTierId: clientData.loyaltyTierId || null,
                newTierId: appropriateTier?.dbId || null,
                newTierColor: appropriateTier?.color || "#9f7aea",
                orderCount: currentOrderCount
              });
            }
          }
        } catch (clientError) {
          console.error(`Error processing client ${clientId}:`, clientError);
          results.errors++;
          results.details.push({
            clientId,
            clientName: clientData.name,
            error: clientError.message
          });
        }
      }
    }
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    return results;
  } catch (error) {
    console.error("Error syncing client loyalty tiers:", error);
    throw error;
  }
};

/**
 * Get a report of all clients and their loyalty status
 */
export const getLoyaltyStatusReport = async () => {
  try {
    // Get all loyalty tiers
    const tiers = await getLoyaltyTiers();
    
    // Get all B2B clients
    const clientsCollection = collection(db, "clients");
    const b2bQuery = query(clientsCollection, where("clientType", "==", "B2B"));
    const snapshot = await getDocs(b2bQuery);
    
    // Process client data
    const clientsData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        orderCount: data.orderCount || 0,
        currentTierId: data.loyaltyTierId,
        currentTierName: data.loyaltyTierName,
        color: data.loyaltyTierColor || "#9f7aea", // Include color in client data
        discount: data.loyaltyTierDiscount || 0
      };
    });
    
    // Create summary by tier
    const tierSummary = tiers.map(tier => {
      const clientsInTier = clientsData.filter(client => client.currentTierId === tier.dbId);
      return {
        tierId: tier.dbId,
        tierName: tier.name,
        clientCount: clientsInTier.length,
        orderThreshold: tier.orderThreshold,
        discount: tier.discount,
        color: tier.color || "#9f7aea" // Include color in tier summary
      };
    });
    
    // Add "No Tier" category for clients without a tier
    const clientsWithNoTier = clientsData.filter(client => !client.currentTierId);
    tierSummary.unshift({
      tierId: null,
      tierName: "No Tier",
      clientCount: clientsWithNoTier.length,
      orderThreshold: 0,
      discount: 0,
      color: "#cccccc" // Default color for "No Tier"
    });
    
    return {
      totalB2BClients: clientsData.length,
      clientsWithTiers: clientsData.filter(client => client.currentTierId).length,
      clientsWithNoTier: clientsWithNoTier.length,
      tierSummary,
      clientsData
    };
  } catch (error) {
    console.error("Error generating loyalty status report:", error);
    throw error;
  }
};

/**
 * Get detailed client loyalty history
 */
export const getClientLoyaltyHistory = async (clientId) => {
  try {
    if (!clientId) return null;
    
    // Get client details
    const clientDoc = await getDoc(doc(db, "clients", clientId));
    
    if (!clientDoc.exists()) {
      return null;
    }
    
    const clientData = clientDoc.data();
    
    // Get client's orders
    const ordersCollection = collection(db, "orders");
    const ordersQuery = query(
      ordersCollection, 
      where("clientId", "==", clientId)
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    
    // Extract loyalty info from orders
    const ordersWithLoyalty = ordersSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date || data.createdAt,
          loyaltyInfo: data.loyaltyInfo || null,
          totalWithDiscount: data.calculations?.discountedTotalCost || data.calculations?.totalCost,
          discountAmount: data.calculations?.loyaltyDiscountAmount || 0
        };
      })
      .filter(order => order.loyaltyInfo)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get all tiers
    const tiers = await getLoyaltyTiers();
    
    // Calculate next tier information
    let nextTier = null;
    let ordersUntilNextTier = null;
    
    if (clientData.loyaltyTierId) {
      const currentTierIndex = tiers.findIndex(t => t.dbId === clientData.loyaltyTierId);
      
      if (currentTierIndex >= 0 && currentTierIndex < tiers.length - 1) {
        nextTier = tiers[currentTierIndex + 1];
        ordersUntilNextTier = nextTier.orderThreshold - (clientData.orderCount || 0);
      }
    } else {
      // If client has no tier but has orders, check if they're close to the first tier
      if ((clientData.orderCount || 0) > 0 && tiers.length > 0) {
        nextTier = tiers[0];
        ordersUntilNextTier = nextTier.orderThreshold - (clientData.orderCount || 0);
      }
    }
    
    // Calculate total savings from loyalty discounts
    const totalSavings = ordersWithLoyalty.reduce(
      (sum, order) => sum + parseFloat(order.discountAmount || 0), 
      0
    );
    
    return {
      clientInfo: {
        id: clientId,
        name: clientData.name,
        email: clientData.email,
        orderCount: clientData.orderCount || 0,
        currentTierId: clientData.loyaltyTierId,
        currentTierName: clientData.loyaltyTierName,
        currentTierColor: clientData.loyaltyTierColor || "#9f7aea", // Include color in client info
        currentDiscount: clientData.loyaltyTierDiscount || 0
      },
      nextTier: nextTier ? {
        id: nextTier.dbId,
        name: nextTier.name,
        discount: nextTier.discount,
        color: nextTier.color || "#9f7aea", // Include color in next tier info
        ordersRequired: ordersUntilNextTier
      } : null,
      totalSavings: totalSavings.toFixed(2),
      ordersWithLoyalty
    };
  } catch (error) {
    console.error("Error getting client loyalty history:", error);
    return null;
  }
};

/**
 * Update a single client's loyalty tier based on order count
 * @param {string} clientId - Client's document ID
 * @param {number} orderCount - Current order count
 * @returns {Promise<Object>} - Result of the update operation
 */
export const updateClientLoyaltyTier = async (clientId, orderCount) => {
  try {
    if (!clientId) {
      throw new Error("Client ID is required");
    }
    
    // Get the client document
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    
    if (!clientSnap.exists()) {
      throw new Error("Client not found");
    }
    
    const clientData = clientSnap.data();
    
    // Only update B2B clients
    if (!clientData.clientType || clientData.clientType.toUpperCase() !== "B2B") {
      return {
        success: false,
        message: "Only B2B clients can be enrolled in loyalty program"
      };
    }
    
    // Get appropriate tier for this order count
    const appropriateTier = await getTierByOrderCount(orderCount);
    
    // If no appropriate tier found, clear loyalty info
    if (!appropriateTier) {
      await updateDoc(clientRef, {
        loyaltyTierId: null,
        loyaltyTierName: null,
        loyaltyTierColor: null, // Clear color
        loyaltyTierDiscount: 0,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        message: "Client not eligible for any loyalty tier",
        tierInfo: null
      };
    }
    
    // Update client with tier information
    await updateDoc(clientRef, {
      loyaltyTierId: appropriateTier.dbId,
      loyaltyTierName: appropriateTier.name,
      loyaltyTierColor: appropriateTier.color || "#9f7aea", // Set tier color
      loyaltyTierDiscount: appropriateTier.discount,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      message: `Client updated to tier: ${appropriateTier.name}`,
      tierInfo: {
        id: appropriateTier.dbId,
        name: appropriateTier.name,
        color: appropriateTier.color || "#9f7aea",
        discount: appropriateTier.discount
      }
    };
  } catch (error) {
    console.error("Error updating client loyalty tier:", error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
};