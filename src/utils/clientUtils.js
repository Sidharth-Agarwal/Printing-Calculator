// src/utils/clientUtils.js
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    runTransaction,
    serverTimestamp 
  } from "firebase/firestore";
  import { db } from "../firebaseConfig";
  
  /**
   * Generate a unique client code based on client name
   * @param {string} clientName - The name of the client
   * @returns {Promise<string>} - A unique client code
   */
  export const generateClientCode = async (clientName) => {
    // Create a clean prefix from the client name (first 4-5 chars)
    const namePrefix = clientName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5)
      .padEnd(3, 'X'); // Ensure at least 3 chars
    
    // Query for existing clients with this prefix
    const clientsRef = collection(db, "clients");
    const clientQuery = query(
      clientsRef, 
      where("clientCode", ">=", namePrefix), 
      where("clientCode", "<", namePrefix + "z")
    );
    
    const snapshot = await getDocs(clientQuery);
    
    // If no clients with this prefix, use 001 suffix
    if (snapshot.empty) {
      return `${namePrefix}001`;
    }
    
    // Find the highest existing suffix
    let maxSuffix = 0;
    snapshot.forEach((doc) => {
      const code = doc.data().clientCode;
      const suffixMatch = code.match(/(\d+)$/);
      if (suffixMatch && suffixMatch[1]) {
        const suffix = parseInt(suffixMatch[1], 10);
        maxSuffix = Math.max(maxSuffix, suffix);
      }
    });
    
    // Create new code with incremented suffix
    return `${namePrefix}${(maxSuffix + 1).toString().padStart(3, '0')}`;
  };
  
  /**
   * Create a new client
   * @param {Object} clientData - Client data to save
   * @param {string} userId - Current user ID
   * @returns {Promise<Object>} - Created client with ID
   */
  export const createClient = async (clientData, userId) => {
    try {
      // Generate unique client code
      const clientCode = await generateClientCode(clientData.name);
      
      // Prepare client data for saving
      const newClient = {
        ...clientData,
        clientCode,
        estimates: {
          count: 0,
          summary: []
        }
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "clients"), newClient);
      
      // Return created client with ID
      return {
        id: docRef.id,
        ...newClient
      };
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  };
  
  /**
   * Search for clients
   * @param {string} searchTerm - Search term
   * @param {number} [maxResults=10] - Maximum number of results to return
   * @returns {Promise<Array>} - Array of matching clients
   */
  export const searchClients = async (searchTerm, maxResults = 10) => {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        // Return recent clients if search term is too short
        const recentQuery = query(
          collection(db, "clients"),
          orderBy("name"),
          limit(maxResults)
        );
        
        const snapshot = await getDocs(recentQuery);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      // Search by name (case insensitive)
      const upperTerm = searchTerm.toUpperCase();
      const lowerTerm = searchTerm.toLowerCase();
      
      // Query for name that starts with the search term
      const nameStartsWithQuery = query(
        collection(db, "clients"),
        where("name", ">=", upperTerm),
        where("name", "<=", upperTerm + "\uf8ff"),
        limit(maxResults)
      );
      
      // Query for client code that starts with the search term
      const codeQuery = query(
        collection(db, "clients"),
        where("clientCode", ">=", upperTerm),
        where("clientCode", "<=", upperTerm + "\uf8ff"),
        limit(maxResults)
      );
      
      // Execute queries in parallel
      const [nameResults, codeResults] = await Promise.all([
        getDocs(nameStartsWithQuery),
        getDocs(codeQuery)
      ]);
      
      // Combine and deduplicate results
      const results = new Map();
      
      nameResults.docs.forEach(doc => {
        results.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      codeResults.docs.forEach(doc => {
        results.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      return Array.from(results.values()).slice(0, maxResults);
    } catch (error) {
      console.error("Error searching clients:", error);
      throw error;
    }
  };
  
  /**
   * Get client by ID
   * @param {string} clientId - Client ID
   * @returns {Promise<Object|null>} - Client data or null if not found
   */
  export const getClientById = async (clientId) => {
    try {
      const docRef = doc(db, "clients", clientId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.warn(`Client with ID ${clientId} not found`);
        return null;
      }
    } catch (error) {
      console.error("Error getting client:", error);
      throw error;
    }
  };
  
  /**
   * Update client's estimate summary
   * @param {string} clientId - Client ID
   * @param {Object} estimateInfo - Estimate summary info to add/update
   * @returns {Promise<void>}
   */
  export const updateClientEstimateSummary = async (clientId, estimateInfo) => {
    if (!clientId) return;
    
    const clientRef = doc(db, "clients", clientId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const clientDoc = await transaction.get(clientRef);
        
        if (!clientDoc.exists()) {
          throw new Error("Client document not found");
        }
        
        const clientData = clientDoc.data();
        const estimateSummary = clientData.estimates?.summary || [];
        const estimateCount = clientData.estimates?.count || 0;
        
        // Check if this estimate is already in the summary
        const existingIndex = estimateSummary.findIndex(
          summary => summary.estimateId === estimateInfo.estimateId || 
                     summary.estimateNumber === estimateInfo.estimateNumber
        );
        
        let newSummary = [...estimateSummary];
        let newCount = estimateCount;
        
        if (existingIndex >= 0) {
          // Update existing entry
          newSummary[existingIndex] = {
            ...newSummary[existingIndex],
            ...estimateInfo
          };
        } else {
          // Add new entry
          newSummary.unshift({
            ...estimateInfo
          });
          
          // Increment count for new estimates
          newCount += 1;
          
          // Limit to 10 most recent
          if (newSummary.length > 10) {
            newSummary = newSummary.slice(0, 10);
          }
        }
        
        // Update the client document
        transaction.update(clientRef, {
          "estimates.summary": newSummary,
          "estimates.count": newCount
        });
      });
      
      return true;
    } catch (error) {
      console.error("Error updating client estimate summary:", error);
      throw error;
    }
  };
  
  /**
   * Get client estimates
   * @param {string} clientId - Client ID
   * @param {number} [limit=20] - Maximum number of estimates to return
   * @returns {Promise<Array>} - Array of client estimates
   */
  export const getClientEstimates = async (clientId, maxResults = 20) => {
    try {
      if (!clientId) return [];
      
      const estimatesRef = collection(db, "estimates");
      const estimatesQuery = query(
        estimatesRef,
        where("clientId", "==", clientId),
        where("isLatestVersion", "==", true),
        orderBy("updatedAt", "desc"),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(estimatesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting client estimates:", error);
      throw error;
    }
  };
  
  /**
   * Update client data
   * @param {string} clientId - Client ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  export const updateClient = async (clientId, updateData) => {
    try {
      if (!clientId) throw new Error("Client ID is required");
      
      const clientRef = doc(db, "clients", clientId);
      await updateDoc(clientRef, updateData);
      
      return true;
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  };
  
  /**
   * Check if client exists by name (for duplicate prevention)
   * @param {string} clientName - Client name to check
   * @returns {Promise<boolean>} - True if client exists
   */
  export const checkClientNameExists = async (clientName) => {
    try {
      if (!clientName) return false;
      
      const exactName = clientName.trim();
      const clientsRef = collection(db, "clients");
      const nameQuery = query(
        clientsRef,
        where("name", "==", exactName)
      );
      
      const snapshot = await getDocs(nameQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking client name existence:", error);
      throw error;
    }
};