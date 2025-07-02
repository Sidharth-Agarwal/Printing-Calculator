import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION_NAME = "clients";

/**
 * Create a new client
 * @param {Object} clientData - Client data
 * @returns {Promise<Object>} - Created client with ID
 */
export const createClient = async (clientData) => {
  try {
    const clientRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...clientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: clientData.isActive !== undefined ? clientData.isActive : true,
      // Initialize discussion fields
      lastDiscussionDate: null,
      lastDiscussionSummary: null,
      totalDiscussions: 0
    });
    
    // Get the created document to return with ID
    const clientSnap = await getDoc(clientRef);
    
    return {
      id: clientRef.id,
      ...clientSnap.data()
    };
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

/**
 * Update an existing client
 * @param {string} clientId - ID of the client to update
 * @param {Object} clientData - Updated client data
 * @returns {Promise<void>}
 */
export const updateClient = async (clientId, clientData) => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    
    // Remove any undefined values
    Object.keys(clientData).forEach(key => 
      clientData[key] === undefined && delete clientData[key]
    );
    
    await updateDoc(clientRef, {
      ...clientData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating client ${clientId}:`, error);
    throw error;
  }
};

/**
 * Delete a client
 * @param {string} clientId - ID of the client to delete
 * @returns {Promise<void>}
 */
export const deleteClient = async (clientId) => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    await deleteDoc(clientRef);
  } catch (error) {
    console.error(`Error deleting client ${clientId}:`, error);
    throw error;
  }
};

/**
 * Get a client by ID
 * @param {string} clientId - ID of the client to fetch
 * @returns {Promise<Object|null>} - Client data or null if not found
 */
export const getClientById = async (clientId) => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    const clientSnap = await getDoc(clientRef);
    
    if (!clientSnap.exists()) {
      return null;
    }
    
    return {
      id: clientSnap.id,
      ...clientSnap.data()
    };
  } catch (error) {
    console.error(`Error fetching client ${clientId}:`, error);
    throw error;
  }
};

/**
 * Update client status
 * @param {string} clientId - ID of the client
 * @param {boolean} isActive - New active status
 * @returns {Promise<void>}
 */
export const updateClientStatus = async (clientId, isActive) => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    await updateDoc(clientRef, {
      isActive,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating client status ${clientId}:`, error);
    throw error;
  }
};

/**
 * Get clients by type
 * @param {string} clientType - Type to filter by ("Direct" or "B2B")
 * @returns {Promise<Array>} - Array of clients with the specified type
 */
export const getClientsByType = async (clientType) => {
  try {
    const clientsQuery = query(
      collection(db, COLLECTION_NAME),
      where("clientType", "==", clientType),
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(clientsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching clients with type ${clientType}:`, error);
    throw error;
  }
};

/**
 * Get active clients
 * @returns {Promise<Array>} - Array of active clients
 */
export const getActiveClients = async () => {
  try {
    const clientsQuery = query(
      collection(db, COLLECTION_NAME),
      where("isActive", "==", true),
      orderBy("name", "asc")
    );
    
    const querySnapshot = await getDocs(clientsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching active clients:", error);
    throw error;
  }
};

/**
 * Mark a client as inactive (soft delete)
 * @param {string} clientId - ID of the client
 * @returns {Promise<void>}
 */
export const markClientInactive = async (clientId) => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    await updateDoc(clientRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error marking client inactive ${clientId}:`, error);
    throw error;
  }
};

/**
 * Update client after discussion
 * @param {string} clientId - ID of the client
 * @param {string} discussionSummary - Summary of the discussion
 * @returns {Promise<void>}
 */
export const updateClientDiscussion = async (clientId, discussionSummary) => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    
    // Get current client data to increment discussion count
    const clientSnap = await getDoc(clientRef);
    const currentData = clientSnap.data();
    const currentDiscussionCount = currentData?.totalDiscussions || 0;
    
    await updateDoc(clientRef, {
      lastDiscussionDate: serverTimestamp(),
      lastDiscussionSummary: discussionSummary,
      totalDiscussions: currentDiscussionCount + 1,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating client discussion ${clientId}:`, error);
    throw error;
  }
};

/**
 * Update client business metrics
 * @param {string} clientId - ID of the client
 * @param {Object} metrics - Business metrics to update
 * @param {number} metrics.totalOrders - Total number of orders
 * @param {number} metrics.totalSpend - Total amount spent
 * @param {number} metrics.activeOrders - Number of active orders
 * @param {number} metrics.averageOrderValue - Average order value
 * @returns {Promise<void>}
 */
export const updateClientMetrics = async (clientId, metrics) => {
  try {
    const clientRef = doc(db, COLLECTION_NAME, clientId);
    await updateDoc(clientRef, {
      ...metrics,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating client metrics ${clientId}:`, error);
    throw error;
  }
};

/**
 * Search clients by name, email, or client code
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Array of matching clients
 */
export const searchClients = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Get all clients and filter manually (Firestore doesn't support case-insensitive search)
    const clientsQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(clientsQuery);
    
    const allClients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter clients based on search term
    return allClients.filter(client => 
      client.name?.toLowerCase().includes(searchTermLower) ||
      client.email?.toLowerCase().includes(searchTermLower) ||
      client.clientCode?.toLowerCase().includes(searchTermLower) ||
      client.contactPerson?.toLowerCase().includes(searchTermLower) ||
      client.phone?.includes(searchTerm)
    );
  } catch (error) {
    console.error(`Error searching clients with term ${searchTerm}:`, error);
    return [];
  }
};

/**
 * Get client statistics
 * @returns {Promise<Object>} - Client statistics
 */
export const getClientStats = async () => {
  try {
    const clientsQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(clientsQuery);
    
    const clients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const stats = {
      total: clients.length,
      active: clients.filter(c => c.isActive === true).length,
      inactive: clients.filter(c => c.isActive === false).length,
      b2b: clients.filter(c => c.clientType?.toUpperCase() === "B2B").length,
      direct: clients.filter(c => c.clientType?.toUpperCase() === "DIRECT" || !c.clientType).length,
      withAccounts: clients.filter(c => c.hasAccount === true).length,
      totalSpend: clients.reduce((sum, c) => sum + (c.totalSpend || 0), 0),
      totalOrders: clients.reduce((sum, c) => sum + (c.totalOrders || 0), 0),
      avgOrderValue: 0
    };
    
    // Calculate average order value
    if (stats.totalOrders > 0) {
      stats.avgOrderValue = stats.totalSpend / stats.totalOrders;
    }
    
    return stats;
  } catch (error) {
    console.error("Error fetching client statistics:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      b2b: 0,
      direct: 0,
      withAccounts: 0,
      totalSpend: 0,
      totalOrders: 0,
      avgOrderValue: 0
    };
  }
};

/**
 * Get clients with recent activity (discussions, orders, etc.)
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} - Array of clients with recent activity
 */
export const getClientsWithRecentActivity = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const clientsQuery = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(clientsQuery);
    
    const clients = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter clients with recent activity
    return clients.filter(client => {
      if (!client.lastDiscussionDate && !client.updatedAt) {
        return false;
      }
      
      const lastActivity = client.lastDiscussionDate || client.updatedAt;
      const activityDate = lastActivity?.toDate ? lastActivity.toDate() : 
                          (lastActivity?.seconds ? new Date(lastActivity.seconds * 1000) : 
                          new Date(lastActivity));
      
      return activityDate >= cutoffDate;
    });
  } catch (error) {
    console.error(`Error fetching clients with recent activity:`, error);
    return [];
  }
};