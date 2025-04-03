// src/models/formStateModel.js
import { ESTIMATE_STATUS } from '../constants/statusConstants';

/**
 * Initial form state with client info and version control
 */
export const initialFormState = {
  // New client info section
  clientInfo: {
    clientId: "", // Firebase document ID
    clientCode: "", // ACME001, etc.
    clientName: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstin: ""
  },
  
  // Version control info
  versionInfo: {
    estimateNumber: "", // Will be generated for new estimates
    version: 1,
    baseEstimateId: "", // Empty for new estimates
    isNewEstimate: true, // Flag to track if this is a new estimate or an edit
    status: ESTIMATE_STATUS.DRAFT
  },
  
  // Order and paper details (modified from original)
  orderAndPaper: {
    projectName: "",
    date: null,
    deliveryDate: null,
    jobType: "Card",
    quantity: "",
    paperProvided: "Yes",
    paperName: "",
    dieSelection: "",
    dieCode: "",
    dieSize: { length: "", breadth: "" },
    image: "",
  },
  
  // All other sections remain the same
  lpDetails: {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: [],
  },
  fsDetails: {
    isFSUsed: false,
    fsType: "",
    foilDetails: [],
  },
  embDetails: {
    isEMBUsed: false,
    plateSizeType: "",
    plateDimensions: { length: "", breadth: "" },
    plateTypeMale: "",
    plateTypeFemale: "",
    embMR: "",
  },
  digiDetails: {
    isDigiUsed: false,
    digiDie: "",
    digiDimensions: { length: "", breadth: "" },
  },
  dieCutting: {
    isDieCuttingUsed: false,
    difficulty: "",
    pdc: "",
    dcMR: "",
  },
  sandwich: {
    isSandwichComponentUsed: false,
    lpDetailsSandwich: {
      isLPUsed: false,
      noOfColors: 0,
      colorDetails: [],
    },
    fsDetailsSandwich: {
      isFSUsed: false,
      fsType: "",
      foilDetails: [],
    },
    embDetailsSandwich: {
      isEMBUsed: false,
      plateSizeType: "",
      plateDimensions: { length: "", breadth: "" },
      plateTypeMale: "",
      plateTypeFemale: "",
      embMR: "",
    },
  },
  pasting: {
    isPastingUsed: false,
    pastingType: "",
  },
  
  // Calculations will be populated later
  calculations: null
};

/**
 * Convert Firebase estimate document to form state
 * @param {Object} estimateDoc - Estimate document from Firebase
 * @returns {Object} Formatted form state
 */
export const estimateToFormState = (estimateDoc) => {
  if (!estimateDoc) return initialFormState;
  
  return {
    // Client info
    clientInfo: {
      clientId: estimateDoc.clientId || "",
      clientCode: estimateDoc.clientCode || "",
      clientName: estimateDoc.clientName || "",
      contactPerson: estimateDoc.clientContact?.contactPerson || "",
      email: estimateDoc.clientContact?.email || "",
      phone: estimateDoc.clientContact?.phone || "",
      gstin: estimateDoc.clientContact?.gstin || ""
    },
    
    // Version info
    versionInfo: {
      estimateNumber: estimateDoc.estimateNumber || "",
      version: estimateDoc.version || 1,
      baseEstimateId: estimateDoc.baseEstimateId || estimateDoc.id || "",
      isNewEstimate: false,
      status: estimateDoc.status || ESTIMATE_STATUS.DRAFT
    },
    
    // Order and paper
    orderAndPaper: {
      projectName: estimateDoc.projectName || "",
      date: estimateDoc.date ? new Date(estimateDoc.date.seconds * 1000) : new Date(),
      deliveryDate: estimateDoc.deliveryDate ? new Date(estimateDoc.deliveryDate.seconds * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      jobType: estimateDoc.jobDetails?.jobType || "Card",
      quantity: estimateDoc.jobDetails?.quantity || "",
      paperProvided: estimateDoc.jobDetails?.paperProvided || "Yes",
      paperName: estimateDoc.jobDetails?.paperName || "",
      dieSelection: estimateDoc.dieDetails?.dieSelection || "",
      dieCode: estimateDoc.dieDetails?.dieCode || "",
      dieSize: estimateDoc.dieDetails?.dieSize || { length: "", breadth: "" },
      image: estimateDoc.dieDetails?.image || "",
    },
    
    // Process details
    lpDetails: estimateDoc.lpDetails || initialFormState.lpDetails,
    fsDetails: estimateDoc.fsDetails || initialFormState.fsDetails,
    embDetails: estimateDoc.embDetails || initialFormState.embDetails,
    digiDetails: estimateDoc.digiDetails || initialFormState.digiDetails,
    dieCutting: estimateDoc.dieCutting || initialFormState.dieCutting,
    sandwich: estimateDoc.sandwich || initialFormState.sandwich,
    pasting: estimateDoc.pasting || initialFormState.pasting,
    
    // Calculations
    calculations: estimateDoc.calculations || null
  };
};

/**
 * Convert form state to Firebase estimate document
 * @param {Object} formState - Current form state
 * @returns {Object} Formatted estimate document for Firebase
 */
export const formStateToEstimate = (formState) => {
  return {
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
    estimateNumber: formState.versionInfo.estimateNumber,
    version: formState.versionInfo.version,
    baseEstimateId: formState.versionInfo.baseEstimateId,
    isLatestVersion: true, // When saving, this should always be true
    
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
    
    // Status
    status: formState.versionInfo.status
  };
};

/**
 * Reducer function for form state
 */
export const formReducer = (state, action) => {
  switch (action.type) {
    // Client info updates
    case "UPDATE_CLIENT_INFO":
      return { ...state, clientInfo: { ...state.clientInfo, ...action.payload } };
    
    // Version info updates
    case "UPDATE_VERSION_INFO":
      return { ...state, versionInfo: { ...state.versionInfo, ...action.payload } };
    
    // Original cases
    case "UPDATE_ORDER_AND_PAPER":
      return { ...state, orderAndPaper: { ...state.orderAndPaper, ...action.payload } };
    
    case "UPDATE_LP_DETAILS":
      return { ...state, lpDetails: { ...state.lpDetails, ...action.payload } };
    
    case "UPDATE_FS_DETAILS":
      return { ...state, fsDetails: { ...state.fsDetails, ...action.payload } };
    
    case "UPDATE_EMB_DETAILS":
      return { ...state, embDetails: { ...state.embDetails, ...action.payload } };
    
    case "UPDATE_DIGI_DETAILS":
      return { ...state, digiDetails: { ...state.digiDetails, ...action.payload } };
    
    case "UPDATE_DIE_CUTTING":
      return { ...state, dieCutting: { ...state.dieCutting, ...action.payload } };
    
    case "UPDATE_SANDWICH":
      return { ...state, sandwich: { ...state.sandwich, ...action.payload } };
    
    case "UPDATE_PASTING":
      return { ...state, pasting: { ...state.pasting, ...action.payload } };
    
    case "UPDATE_CALCULATIONS":
      return { ...state, calculations: action.payload };
    
    case "RESET_FORM":
      return initialFormState;
    
    case "INITIALIZE_FORM":
      return { ...action.payload };
    
    default:
      return state;
  }
};