// src/utils/estimateVersionUtils.js
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
    serverTimestamp 
  } from "firebase/firestore";
  import { db } from "../firebaseConfig";
  import { updateClientEstimateSummary } from "./clientUtils";
  import { ESTIMATE_STATUS } from "../constants/statusConstants";
  
  /**
   * Generate a unique estimate number
   * @param {string} clientCode - Client code
   * @param {string} jobType - Job type (e.g., "Card", "Biz Card")
   * @returns {Promise<string>} - Generated estimate number
   */
  export const generateEstimateNumber = async (clientCode, jobType) => {
    try {
      // Format: EST-ACME001-CARD-25-0001
      // Parts: EST-[ClientCode]-[JobType]-[YearSuffix]-[SequentialNumber]
      
      const yearSuffix = new Date().getFullYear().toString().slice(-2);
      const typeCode = jobType.slice(0, 4).toUpperCase();
      
      // Get the last used number for this client and job type
      const estimatesRef = collection(db, "estimates");
      const prefix = `EST-${clientCode}-${typeCode}-${yearSuffix}`;
      
      const q = query(
        estimatesRef,
        where("estimateNumber", ">=", prefix),
        where("estimateNumber", "<", prefix + "\uf8ff"), // End suffix for range queries
        orderBy("estimateNumber", "desc"),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // First estimate with this prefix
        return `${prefix}-0001`;
      }
      
      // Get last used number and increment
      const lastEstimate = snapshot.docs[0].data();
      const lastNumber = lastEstimate.estimateNumber;
      const numberMatch = lastNumber.match(/-(\d+)$/);
      
      if (numberMatch && numberMatch[1]) {
        const sequenceNumber = parseInt(numberMatch[1], 10) + 1;
        return `${prefix}-${sequenceNumber.toString().padStart(4, '0')}`;
      } else {
        // Fallback if pattern doesn't match
        return `${prefix}-0001`;
      }
    } catch (error) {
      console.error("Error generating estimate number:", error);
      // Fallback with timestamp to ensure uniqueness
      const timestamp = Date.now().toString().slice(-6);
      return `EST-${clientCode}-${jobType.slice(0, 4).toUpperCase()}-${timestamp}`;
    }
  };
  
  /**
   * Create a new estimate
   * @param {Object} formState - Form state data
   * @param {string} userId - Current user ID
   * @returns {Promise<Object>} - Created estimate data
   */
  export const createEstimate = async (formState, userId) => {
    try {
      // Check required client info
      if (!formState.clientInfo.clientId || !formState.clientInfo.clientCode) {
        throw new Error("Client information is required");
      }
      
      // Generate estimate number if needed
      let estimateNumber = formState.versionInfo.estimateNumber;
      if (!estimateNumber) {
        estimateNumber = await generateEstimateNumber(
          formState.clientInfo.clientCode,
          formState.orderAndPaper.jobType
        );
      }
      
      // Create estimate document
      const estimateData = {
        // Client information
        clientId: formState.clientInfo.clientId,
        clientCode: formState.clientInfo.clientCode,
        clientName: formState.clientInfo.clientName,
        clientContact: {
          contactPerson: formState.clientInfo.contactPerson,
          email: formState.clientInfo.email,
          phone: formState.clientInfo.phone,
          gstin: formState.clientInfo.gstin
        },
        
        // Version information
        estimateNumber: estimateNumber,
        version: 1, // Initial version
        isLatestVersion: true,
        baseEstimateId: "", // Empty for first version
        
        // Version history
        versionHistory: [
          {
            version: 1,
            createdBy: userId,
            createdAt: serverTimestamp(),
            changeNotes: "Initial creation"
          }
        ],
        
        // Core project info
        projectName: formState.orderAndPaper.projectName,
        date: formState.orderAndPaper.date,
        deliveryDate: formState.orderAndPaper.deliveryDate,
        
        // Job details
        jobDetails: {
          jobType: formState.orderAndPaper.jobType,
          quantity: formState.orderAndPaper.quantity,
          paperProvided: formState.orderAndPaper.paperProvided,
          paperName: formState.orderAndPaper.paperName
        },
        
        // Die details
        dieDetails: {
          dieSelection: formState.orderAndPaper.dieSelection,
          dieCode: formState.orderAndPaper.dieCode,
          dieSize: formState.orderAndPaper.dieSize,
          image: formState.orderAndPaper.image
        },
        
        // Process details
        lpDetails: formState.lpDetails,
        fsDetails: formState.fsDetails,
        embDetails: formState.embDetails,
        digiDetails: formState.digiDetails,
        dieCutting: formState.dieCutting,
        sandwich: formState.sandwich,
        pasting: formState.pasting,
        
        // Calculations
        calculations: formState.calculations,
        
        // Status and metadata
        status: ESTIMATE_STATUS.DRAFT,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedBy: userId,
        updatedAt: serverTimestamp()
      };
      
      // Add document to Firestore
      const docRef = await addDoc(collection(db, "estimates"), estimateData);
      
      // Update client's estimate summary
      await updateClientEstimateSummary(formState.clientInfo.clientId, {
        estimateId: docRef.id,
        estimateNumber,
        projectName: formState.orderAndPaper.projectName,
        currentVersion: 1,
        status: ESTIMATE_STATUS.DRAFT
      });
      
      // Return created estimate with ID
      return {
        id: docRef.id,
        ...estimateData
      };
    } catch (error) {
      console.error("Error creating estimate:", error);
      throw error;
    }
  };
  
  /**
   * Create a new version of an existing estimate
   * @param {string} existingEstimateId - ID of the existing estimate
   * @param {Object} formState - Updated form state
   * @param {string} userId - Current user ID
   * @param {string} changeNotes - Notes about the changes made
   * @returns {Promise<Object>} - New estimate version data
   */
  export const createEstimateVersion = async (existingEstimateId, formState, userId, changeNotes = "") => {
    try {
      // Get the existing estimate
      const estRef = doc(db, "estimates", existingEstimateId);
      const estSnap = await getDoc(estRef);
      
      if (!estSnap.exists()) {
        throw new Error("Estimate not found");
      }
      
      const existingEstimate = estSnap.data();
      
      // Mark the current version as not latest
      await updateDoc(estRef, { 
        isLatestVersion: false,
        updatedBy: userId,
        updatedAt: serverTimestamp()
      });
      
      // Create new version
      const newVersion = existingEstimate.version + 1;
      
      // Prepare version history
      const versionHistory = existingEstimate.versionHistory || [];
      const newVersionEntry = {
        version: newVersion,
        createdBy: userId,
        createdAt: serverTimestamp(),
        changeNotes: changeNotes || "Updated estimate"
      };
      
      // Prepare new estimate data
      const newEstimateData = {
        // Keep existing client and estimate number
        clientId: existingEstimate.clientId,
        clientCode: existingEstimate.clientCode,
        clientName: existingEstimate.clientName,
        clientContact: existingEstimate.clientContact,
        estimateNumber: existingEstimate.estimateNumber,
        
        // Update version info
        version: newVersion,
        isLatestVersion: true,
        baseEstimateId: existingEstimate.baseEstimateId || existingEstimateId,
        
        // Update version history
        versionHistory: [...versionHistory, newVersionEntry],
        
        // Core project info (from form state)
        projectName: formState.orderAndPaper.projectName,
        date: formState.orderAndPaper.date,
        deliveryDate: formState.orderAndPaper.deliveryDate,
        
        // Job details (from form state)
        jobDetails: {
          jobType: formState.orderAndPaper.jobType,
          quantity: formState.orderAndPaper.quantity,
          paperProvided: formState.orderAndPaper.paperProvided,
          paperName: formState.orderAndPaper.paperName
        },
        
        // Die details (from form state)
        dieDetails: {
          dieSelection: formState.orderAndPaper.dieSelection,
          dieCode: formState.orderAndPaper.dieCode,
          dieSize: formState.orderAndPaper.dieSize,
          image: formState.orderAndPaper.image
        },
        
        // Process details (from form state)
        lpDetails: formState.lpDetails,
        fsDetails: formState.fsDetails,
        embDetails: formState.embDetails,
        digiDetails: formState.digiDetails,
        dieCutting: formState.dieCutting,
        sandwich: formState.sandwich,
        pasting: formState.pasting,
        
        // Calculations (from form state)
        calculations: formState.calculations,
        
        // Reset status to Draft for new version
        status: ESTIMATE_STATUS.DRAFT,
        
        // Update metadata
        createdBy: existingEstimate.createdBy,
        createdAt: existingEstimate.createdAt,
        updatedBy: userId,
        updatedAt: serverTimestamp()
      };
      
      // Add new version document to Firestore
      const newDocRef = await addDoc(collection(db, "estimates"), newEstimateData);
      
      // Update client's estimate summary
      await updateClientEstimateSummary(existingEstimate.clientId, {
        estimateId: existingEstimate.baseEstimateId || existingEstimateId,
        estimateNumber: existingEstimate.estimateNumber,
        projectName: formState.orderAndPaper.projectName,
        currentVersion: newVersion,
        status: ESTIMATE_STATUS.DRAFT
      });
      
      // Return new estimate version with ID
      return {
        id: newDocRef.id,
        ...newEstimateData
      };
    } catch (error) {
      console.error("Error creating estimate version:", error);
      throw error;
    }
  };
  
  /**
   * Get estimate by ID
   * @param {string} estimateId - Estimate ID
   * @returns {Promise<Object|null>} - Estimate data or null if not found
   */
  export const getEstimateById = async (estimateId) => {
    try {
      const docRef = doc(db, "estimates", estimateId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.warn(`Estimate with ID ${estimateId} not found`);
        return null;
      }
    } catch (error) {
      console.error("Error getting estimate:", error);
      throw error;
    }
  };
  
  /**
   * Get all versions of an estimate
   * @param {string} baseEstimateId - Base estimate ID
   * @returns {Promise<Array>} - Array of all versions
   */
  export const getEstimateVersions = async (baseEstimateId) => {
    try {
      if (!baseEstimateId) return [];
      
      // First, get the base estimate
      const baseEstimate = await getEstimateById(baseEstimateId);
      
      if (!baseEstimate) return [];
      
      // Query for all versions of this estimate
      const estimatesRef = collection(db, "estimates");
      const versionsQuery = query(
        estimatesRef,
        where("baseEstimateId", "==", baseEstimateId),
        orderBy("version", "desc")
      );
      
      const snapshot = await getDocs(versionsQuery);
      const versionDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Combine with base estimate if needed
      if (baseEstimate.baseEstimateId === "" || baseEstimate.baseEstimateId === baseEstimateId) {
        // This is the first version - add to results if not already included
        const isBaseIncluded = versionDocs.some(doc => doc.id === baseEstimateId);
        
        if (!isBaseIncluded) {
          versionDocs.push(baseEstimate);
        }
      }
      
      // Sort by version number
      return versionDocs.sort((a, b) => b.version - a.version);
    } catch (error) {
      console.error("Error getting estimate versions:", error);
      throw error;
    }
  };
  
  /**
   * Update estimate status
   * @param {string} estimateId - Estimate ID
   * @param {string} newStatus - New status
   * @param {string} userId - Current user ID
   * @returns {Promise<void>}
   */
  export const updateEstimateStatus = async (estimateId, newStatus, userId) => {
    try {
      if (!estimateId) throw new Error("Estimate ID is required");
      if (!Object.values(ESTIMATE_STATUS).includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }
      
      const estimateRef = doc(db, "estimates", estimateId);
      const estSnap = await getDoc(estimateRef);
      
      if (!estSnap.exists()) {
        throw new Error("Estimate not found");
      }
      
      const estimateData = estSnap.data();
      
      // Update status and metadata
      await updateDoc(estimateRef, {
        status: newStatus,
        updatedBy: userId,
        updatedAt: serverTimestamp()
      });
      
      // Update client's estimate summary
      await updateClientEstimateSummary(estimateData.clientId, {
        estimateId: estimateData.baseEstimateId || estimateId,
        estimateNumber: estimateData.estimateNumber,
        status: newStatus
      });
      
      return true;
    } catch (error) {
      console.error("Error updating estimate status:", error);
      throw error;
    }
  };
  
  /**
   * Compare two versions of an estimate
   * @param {Object} version1 - First version
   * @param {Object} version2 - Second version
   * @returns {Object} - Differences between versions
   */
  export const compareEstimateVersions = (version1, version2) => {
    if (!version1 || !version2) return {};
    
    const differences = {};
    
    // Compare key fields
    const fieldsToCompare = [
      { key: 'jobDetails.quantity', label: 'Quantity' },
      { key: 'jobDetails.paperName', label: 'Paper' },
      { key: 'jobDetails.jobType', label: 'Job Type' },
      { key: 'lpDetails.isLPUsed', label: 'Letter Press' },
      { key: 'fsDetails.isFSUsed', label: 'Foil Stamping' },
      { key: 'embDetails.isEMBUsed', label: 'Embossing' },
      { key: 'digiDetails.isDigiUsed', label: 'Digital Printing' },
      { key: 'dieCutting.isDieCuttingUsed', label: 'Die Cutting' },
      { key: 'sandwich.isSandwichComponentUsed', label: 'Sandwich' },
      { key: 'pasting.isPastingUsed', label: 'Pasting' },
      { key: 'calculations.totalCostPerCard', label: 'Cost Per Card' },
      { key: 'calculations.totalCost', label: 'Total Cost' },
    ];
    
    // Helper to get nested property
    const getNestedProperty = (obj, path) => {
      return path.split('.').reduce((prev, curr) => 
        prev && prev[curr] !== undefined ? prev[curr] : undefined, obj);
    };
    
    // Compare each field
    fieldsToCompare.forEach(field => {
      const value1 = getNestedProperty(version1, field.key);
      const value2 = getNestedProperty(version2, field.key);
      
      if (value1 !== value2) {
        differences[field.label] = {
          old: value1,
          new: value2
        };
      }
    });
    
    return differences;
};