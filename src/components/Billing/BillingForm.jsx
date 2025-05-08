import React, { useReducer, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { performCompleteCalculations, recalculateTotals } from "./Services/Calculations/calculationsService";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from "../Login/AuthContext";

// Import components
import LPDetails from "./Sections/Production/LPDetails";
import FSDetails from "./Sections/Production/FSDetails";
import EMBDetails from "./Sections/Production/EMBDetails";
import DigiDetails from "./Sections/Production/DigiDetails";
import ScreenPrint from "./Sections/Production/ScreenPrint";
import NotebookDetails from "./Sections/Production/NotebookDetails";
import DieCutting from "./Sections/Post Production/DieCutting";
import PostDC from "./Sections/Post Production/PostDC";
import FoldAndPaste from "./Sections/Post Production/FoldAndPaste";
import DstPaste from "./Sections/Post Production/DstPaste";
import Magnet from "./Sections/Post Production/Magnet";
import QC from "./Sections/Post Production/QC";
import Packing from "./Sections/Post Production/Packing";
import Sandwich from "./Sections/Post Production/Sandwich";
import Misc from "./Sections/Post Production/Misc";
import ReviewAndSubmit from "./ReviewAndSubmit";
import SuccessNotification from "../Shared/SuccessNotification";
import FormSection from "../Shared/FormSection";
import FixedSection from "./Sections/Fixed/FixedSection";

// Import service and job type configurations
import { serviceRegistry } from "./Services/Config/serviceRegistry";
import { jobTypeConfigurations } from "./Services/Config/jobTypeConfigurations";

// Original initialFormState
const initialFormState = {
  // Client information
  client: {
    clientId: null,
    clientInfo: null
  },
  // Version information
  versionId: "",
  orderAndPaper: {
    projectName: "",
    date: null,
    deliveryDate: null,
    jobType: "Card", // Default job type
    quantity: "",
    paperProvided: "Yes",
    paperName: "",
    dieSelection: "",
    dieCode: "",
    dieSize: { length: "", breadth: "" },
    productSize: { length: "", breadth: "" },
    image: "",
    hsnCode: "",
  },
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
  notebookDetails: {
    isNotebookUsed: false,
    orientation: "",
    length: "",
    breadth: "",
    calculatedLength: "",
    calculatedBreadth: "",
    numberOfPages: "",
    bindingType: "",
    bindingTypeConcatenated: "",
    paperName: ""
  },
  screenPrint: {
    isScreenPrintUsed: false,
    noOfColors: 1,
    screenMR: "",
    screenMRConcatenated: ""
  },
  dieCutting: {
    isDieCuttingUsed: false,
    dcMR: "",
    dcMRConcatenated: ""
  },
  postDC: {
    isPostDCUsed: false,
    pdcMR: "",
    pdcMRConcatenated: ""
  },
  foldAndPaste: {
    isFoldAndPasteUsed: false,
    dstMaterial: "",
    dstType: "",
  },  
  dstPaste: {
    isDstPasteUsed: false,
    dstType: "",
  },
  magnet: {
    isMagnetUsed: false,
    magnetMaterial: ""
  },
  qc: {
    isQCUsed: false,
  },
  packing: {
    isPackingUsed: false,
  },
  misc: {
    isMiscUsed: false,
    miscCharge: ""
  },
  sandwich: {
    isSandwichComponentUsed: false,
    paperInfo: {
      paperName: ""
    },
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
      plateDimensions: { 
        length: "", 
        breadth: "",
        lengthInInches: "",
        breadthInInches: ""
      },
      plateTypeMale: "",
      plateTypeFemale: "",
      embMR: "",
      embMRConcatenated: ""
    }
  }
};

// Reducer function to handle updates to the state
const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_CLIENT":
      return { ...state, client: { ...state.client, ...action.payload } };
    case "UPDATE_VERSION":
      return { ...state, versionId: action.payload };
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
    case "UPDATE_NOTEBOOK_DETAILS":
      return { ...state, notebookDetails: { ...state.notebookDetails, ...action.payload } };
    case "UPDATE_SCREEN_PRINT":
      return { ...state, screenPrint: { ...state.screenPrint, ...action.payload } };
    case "UPDATE_DIE_CUTTING":
      return { ...state, dieCutting: { ...state.dieCutting, ...action.payload } };
    case "UPDATE_POST_DC":
      return { ...state, postDC: { ...state.postDC, ...action.payload } };
    case "UPDATE_FOLD_AND_PASTE":
      return { ...state, foldAndPaste: { ...state.foldAndPaste, ...action.payload } };
    case "UPDATE_DST_PASTE":
      return { ...state, dstPaste: { ...state.dstPaste, ...action.payload } };
    case "UPDATE_MAGNET":
      return { ...state, magnet: { ...state.magnet, ...action.payload } };
    case "UPDATE_QC":
      return { ...state, qc: { ...state.qc, ...action.payload } };
    case "UPDATE_PACKING":
      return { ...state, packing: { ...state.packing, ...action.payload } };
    case "UPDATE_MISC":
      return { ...state, misc: { ...state.misc, ...action.payload } };
    case "UPDATE_SANDWICH":
      return { ...state, sandwich: { ...state.sandwich, ...action.payload } };
    case "UPDATE_HSN_CODE":
      return { ...state, orderAndPaper: { ...state.orderAndPaper, hsnCode: action.payload } };
    case "RESET_FORM":
      return initialFormState;
    case "INITIALIZE_FORM":
      return { ...action.payload };
    default:
      return state;
  }
};

// Map state to Firebase structure with sanitization for undefined values
// Map state to Firebase structure with sanitization for undefined values
const mapStateToFirebaseStructure = (state, calculations) => {
  const { 
    client, 
    versionId, 
    orderAndPaper, 
    lpDetails, 
    fsDetails, 
    embDetails, 
    digiDetails, 
    screenPrint, 
    dieCutting, 
    sandwich,
    magnet,
    notebookDetails // Add notebookDetails to destructuring
  } = state;

  // Helper function to sanitize objects for Firebase
  const sanitizeForFirestore = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Replace undefined values with null (Firebase accepts null but not undefined)
      if (value === undefined) {
        sanitized[key] = null;
      } 
      // Recursively sanitize nested objects
      else if (value !== null && typeof value === 'object') {
        sanitized[key] = sanitizeForFirestore(value);
      } 
      // Keep other values as-is
      else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  // Log project name to help debug
  console.log("mapStateToFirebaseStructure: processing projectName =", orderAndPaper?.projectName);

  // Create the sanitized Firebase data structure
  const firestoreData = {
    // Client reference information
    clientId: client.clientId,
    clientInfo: sanitizeForFirestore(client.clientInfo),
    
    // Version information
    versionId: versionId || "1", // Default to version 1 if not specified
    
    // Project specific information - explicitly extract projectName
    projectName: orderAndPaper.projectName || "",
    date: orderAndPaper.date?.toISOString() || null,
    deliveryDate: orderAndPaper.deliveryDate?.toISOString() || null,
    
    // Job details with HSN code included
    jobDetails: sanitizeForFirestore({
      jobType: orderAndPaper.jobType,
      quantity: orderAndPaper.quantity,
      paperProvided: orderAndPaper.paperProvided,
      paperName: orderAndPaper.paperName,
      hsnCode: orderAndPaper.hsnCode || "", // Include HSN code
    }),
    
    // Die details with product size directly from orderAndPaper
    dieDetails: sanitizeForFirestore({
      dieSelection: orderAndPaper.dieSelection,
      dieCode: orderAndPaper.dieCode,
      dieSize: orderAndPaper.dieSize,
      productSize: orderAndPaper.productSize,
      image: orderAndPaper.image,
    }),
    
    // Processing options (only included when selected)
    lpDetails: lpDetails.isLPUsed ? sanitizeForFirestore(lpDetails) : null,
    fsDetails: fsDetails.isFSUsed ? sanitizeForFirestore(fsDetails) : null,
    embDetails: embDetails.isEMBUsed ? sanitizeForFirestore(embDetails) : null,
    digiDetails: digiDetails.isDigiUsed ? sanitizeForFirestore(digiDetails) : null,
    notebookDetails: notebookDetails?.isNotebookUsed ? sanitizeForFirestore(notebookDetails) : null,
    screenPrint: screenPrint?.isScreenPrintUsed ? sanitizeForFirestore(screenPrint) : null,
    dieCutting: dieCutting.isDieCuttingUsed ? sanitizeForFirestore(dieCutting) : null,
    sandwich: sandwich.isSandwichComponentUsed ? sanitizeForFirestore(sandwich) : null,
    magnet: magnet?.isMagnetUsed ? sanitizeForFirestore(magnet) : null,
    
    // Include other details based on what's enabled
    postDC: state.postDC?.isPostDCUsed ? sanitizeForFirestore(state.postDC) : null,
    foldAndPaste: state.foldAndPaste?.isFoldAndPasteUsed ? sanitizeForFirestore(state.foldAndPaste) : null,
    dstPaste: state.dstPaste?.isDstPasteUsed ? sanitizeForFirestore(state.dstPaste) : null,
    qc: state.qc?.isQCUsed ? sanitizeForFirestore(state.qc) : null,
    packing: state.packing?.isPackingUsed ? sanitizeForFirestore(state.packing) : null,
    misc: state.misc?.isMiscUsed ? sanitizeForFirestore(state.misc) : null,
    
    // Calculations - ensure markup values are included
    calculations: sanitizeForFirestore(calculations),
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Final verification log
  console.log("mapStateToFirebaseStructure: final projectName =", firestoreData.projectName);
  
  return firestoreData;
};

const BillingForm = ({ initialState = null, isEditMode = false, onSubmitSuccess = null, onClose = null }) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState || initialFormState);
  const [calculations, setCalculations] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("reviewAndSubmit"); // Initially expand ReviewAndSubmit
  const [validationErrors, setValidationErrors] = useState({});
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [defaultMarkup, setDefaultMarkup] = useState({ type: "MARKUP TIMELESS", percentage: 50 });
  const [selectedMarkupType, setSelectedMarkupType] = useState("MARKUP TIMELESS");
  const [markupPercentage, setMarkupPercentage] = useState(50);
  const [papers, setPapers] = useState([]);
  const [hsnRates, setHsnRates] = useState([]); // Store HSN rates from standard_rates
  
  // Success notification state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Define visible services based on the selected job type
  const [visibleProductionServices, setVisibleProductionServices] = useState([]);
  const [visiblePostProductionServices, setVisiblePostProductionServices] = useState([]);

  // Add B2B client detection using Auth context
  const { userRole, currentUser } = useAuth();
  const [isB2BClient, setIsB2BClient] = useState(false);
  const [linkedClientData, setLinkedClientData] = useState(null);

  const formRef = useRef(null);
  
  // Fetch HSN codes from standard_rates collection
  useEffect(() => {
    const fetchHsnCodes = async () => {
      try {
        console.log("Fetching HSN codes from standard_rates collection...");
        const standardRatesCollection = collection(db, "standard_rates");
        
        const unsubscribe = onSnapshot(standardRatesCollection, (snapshot) => {
          const ratesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          // Filter only for HSN rates where group is "HSN"
          const hsnCodesData = ratesData.filter(rate => rate.group === "HSN");
          console.log(`Fetched ${hsnCodesData.length} HSN codes from standard_rates`);
          
          setHsnRates(hsnCodesData);
          
          // If job type is already selected, update HSN code immediately
          if (state.orderAndPaper.jobType && hsnCodesData.length > 0) {
            updateHsnCodeForJobType(state.orderAndPaper.jobType, hsnCodesData);
          }
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching HSN codes:", error);
      }
    };
    
    fetchHsnCodes();
  }, []);
  
  // Function to update HSN code when job type changes
  const updateHsnCodeForJobType = (jobType, ratesArray = null) => {
    // Use passed rates array or state's hsnRates
    const ratesToUse = ratesArray || hsnRates;
    
    if (!ratesToUse || ratesToUse.length === 0) {
      console.log("No HSN rates available");
      return;
    }
    
    // Find matching HSN code
    const matchingHsn = ratesToUse.find(rate => 
      rate.type.toUpperCase() === jobType.toUpperCase()
    );
    
    if (matchingHsn) {
      const hsnCode = matchingHsn.finalRate || "";
      console.log(`Found HSN code ${hsnCode} for job type ${jobType}`);
      
      // Update HSN code in state
      dispatch({
        type: "UPDATE_HSN_CODE",
        payload: hsnCode
      });
    } else {
      console.log(`No HSN code found for job type ${jobType}`);
      
      // Reset HSN code if no matching code found
      dispatch({
        type: "UPDATE_HSN_CODE",
        payload: ""
      });
    }
  };
  
  // Fetch papers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
      const paperData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(paperData);
    });

    return () => unsubscribe();
  }, []);
  
  // Add CSS for success notification animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fade-in {
        0% { opacity: 0; transform: translateY(-20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes success-check {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .animate-fade-in {
        animation: fade-in 0.5s ease forwards;
      }
      
      .animate-success-check {
        animation: success-check 0.6s ease-in-out forwards;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Add useEffect to fetch B2B client data when component mounts
  useEffect(() => {
    const fetchB2BClientData = async () => {
      if (userRole === "b2b" && currentUser) {
        try {
          setIsB2BClient(true);
          
          // First get the user doc to find the linked client ID
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check if this user has a linked client ID
            if (userData.clientId) {
              // Fetch the client data
              const clientDoc = await getDoc(doc(db, "clients", userData.clientId));
              
              if (clientDoc.exists()) {
                const clientData = {
                  id: clientDoc.id,
                  clientId: clientDoc.id,
                  clientInfo: clientDoc.data(),
                  ...clientDoc.data()
                };
                
                setLinkedClientData(clientData);
                
                // Auto-select this client
                handleClientSelect({
                  clientId: clientData.id,
                  clientInfo: clientData
                });
                
                // Also set the selectedClient for props passed to ClientSelection
                setSelectedClient(clientData);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching B2B client data:", error);
        }
      }
    };
    
    fetchB2BClientData();
  }, [userRole, currentUser]);
  
  // Fetch default markup rates once when component mounts
  useEffect(() => {
    const fetchDefaultMarkup = async () => {
      try {
        // Query the overheads collection for markup entries
        const overheadsCollection = collection(db, "overheads");
        const markupQuery = query(overheadsCollection, where("name", ">=", "MARKUP "), where("name", "<=", "MARKUP" + "\uf8ff"));
        const querySnapshot = await getDocs(markupQuery);
        
        const fetchedMarkups = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          fetchedMarkups.push({
            id: doc.id,
            name: data.name,
            percentage: parseFloat(data.percentage) || 0
          });
        });
        
        if (fetchedMarkups.length > 0) {
          // For B2B clients, automatically select MARKUP B2B MERCH
          if (isB2BClient) {
            const b2bMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP B2B MERCH");
            if (b2bMarkup) {
              setDefaultMarkup({
                type: b2bMarkup.name,
                percentage: b2bMarkup.percentage
              });
              setSelectedMarkupType(b2bMarkup.name);
              setMarkupPercentage(b2bMarkup.percentage);
            } else {
              // Fallback to default if B2B MERCH not found
              setDefaultMarkup({
                type: fetchedMarkups[0].name,
                percentage: fetchedMarkups[0].percentage
              });
              setSelectedMarkupType(fetchedMarkups[0].name);
              setMarkupPercentage(fetchedMarkups[0].percentage);
            }
          } else {
            // For admin users, set default markup to MARKUP TIMELESS or first available
            const timelessMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP TIMELESS") || fetchedMarkups[0];
            setDefaultMarkup({
              type: timelessMarkup.name,
              percentage: timelessMarkup.percentage
            });
            setSelectedMarkupType(timelessMarkup.name);
            setMarkupPercentage(timelessMarkup.percentage);
          }
          
          console.log("Fetched markup rates:", fetchedMarkups);
        }
      } catch (error) {
        console.error("Error fetching markup rates:", error);
      }
    };
    
    fetchDefaultMarkup();
  }, [isB2BClient]);
  
  // Initialize form with data if in edit mode
  useEffect(() => {
    if (initialState && isEditMode) {
      // Initialize form state with the provided data
      dispatch({ type: "INITIALIZE_FORM", payload: initialState });
      
      // If client info exists in initialState, set the client for display
      if (initialState.client?.clientId) {
        console.log("Setting client from initialState:", initialState.client);
        
        // Create a client object from client info
        const clientData = {
          id: initialState.client.clientId,
          clientId: initialState.client.clientId,
          name: initialState.client.clientInfo?.name || "Unknown Client",
          clientCode: initialState.client.clientInfo?.clientCode || "",
          clientType: initialState.client.clientInfo?.clientType || "Direct",
          contactPerson: initialState.client.clientInfo?.contactPerson || "",
          email: initialState.client.clientInfo?.email || "",
          phone: initialState.client.clientInfo?.phone || "",
          ...initialState.client.clientInfo // Include any other client properties
        };
        
        // Set the selected client for display
        setSelectedClient(clientData);
      }
      
      // Set selected version if it exists in initialState
      if (initialState.versionId) {
        setSelectedVersion(initialState.versionId);
      }
      
      // Set markup if it exists in initialState calculations
      if (initialState.calculations?.markupType) {
        setSelectedMarkupType(initialState.calculations.markupType);
      }
      
      if (initialState.calculations?.markupPercentage) {
        setMarkupPercentage(parseFloat(initialState.calculations.markupPercentage));
      }
    }
  }, [initialState, isEditMode]);  

  // Update visible services when job type changes
  useEffect(() => {
    const jobType = state.orderAndPaper.jobType || "Card";
    const config = jobTypeConfigurations[jobType] || jobTypeConfigurations["Card"];
    
    // Set visible services based on job type
    setVisibleProductionServices(config.productionServices || []);
    setVisiblePostProductionServices(config.postProductionServices || []);
    
    // Reset non-applicable services to avoid showing disabled ones
    Object.entries(serviceRegistry).forEach(([serviceCode, serviceInfo]) => {
      const isVisible = 
        config.productionServices.includes(serviceCode) || 
        config.postProductionServices.includes(serviceCode);
      
      if (!isVisible && serviceInfo.stateKey && serviceInfo.toggleField) {
        // Reset this service if it's not visible for the current job type
        dispatch({
          type: `UPDATE_${serviceInfo.stateKey.toUpperCase()}`,
          payload: { [serviceInfo.toggleField]: false }
        });
      }
    });
    
    // Update HSN code when job type changes
    if (hsnRates.length > 0) {
      updateHsnCodeForJobType(jobType);
    }
    
  }, [state.orderAndPaper.jobType, hsnRates]);

  // Calculate costs when form data changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performCalculations();
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(debounceTimer);
  }, [state]);

  // Function to handle markup changes from ReviewAndSubmit component
  const handleMarkupChange = async (markupType, markupPercentage) => {
    // For B2B clients, only allow MARKUP B2B MERCH to be selected
    if (isB2BClient && markupType !== "MARKUP B2B MERCH") {
      const b2bMarkup = markupRates.find(rate => rate.name === "MARKUP B2B MERCH");
      if (b2bMarkup) {
        markupType = b2bMarkup.name;
        markupPercentage = b2bMarkup.percentage;
      }
    }
    
    setSelectedMarkupType(markupType);
    setMarkupPercentage(markupPercentage);
    
    await recalculateWithMarkup(markupType, markupPercentage);
  };

  // Function to close success notification
  const closeSuccessNotification = () => {
    setShowSuccessNotification(false);
  };

  // Function to recalculate totals when markup changes
  const recalculateWithMarkup = async (markupType, markupPercentage) => {
    console.log("Recalculating with new markup:", markupType, markupPercentage);
    setIsCalculating(true);
    try {
      // Get the misc charge from the form state if available and misc is enabled
      const miscCharge = state.misc?.isMiscUsed && state.misc?.miscCharge 
        ? parseFloat(state.misc.miscCharge) 
        : null; // Pass null to let the calculator fetch from DB
      
      // Use the recalculateTotals function from calculationsService if we already have base calculations
      if (calculations && !calculations.error) {
        // Call recalculateTotals with the existing calculations, updated markup info, and quantity
        const result = await recalculateTotals(
          calculations,
          miscCharge, // Use the custom misc charge if available
          markupPercentage,
          parseInt(state.orderAndPaper?.quantity, 10) || 0,
          markupType
        );

        if (result.error) {
          console.error("Error recalculating with new markup:", result.error);
        } else {
          console.log("Updated calculations with new markup:", result);
          setCalculations(result);
        }
      } else {
        // If we don't have base calculations yet, perform a complete calculation
        const result = await performCompleteCalculations(
          state,
          miscCharge, // Use the custom misc charge if available
          markupPercentage,
          markupType
        );
        
        if (result.error) {
          console.error("Error during calculations:", result.error);
        } else {
          setCalculations(result);
        }
      }
    } catch (error) {
      console.error("Unexpected error during markup recalculation:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Enhanced calculation function using the centralized calculation service
  const performCalculations = async () => {
    // Check if client and essential fields are filled
    const { projectName, quantity, paperName, dieCode, dieSize } = state.orderAndPaper;
    const { clientId } = state.client;
    
    if (!clientId || !projectName || !quantity || !paperName || !dieCode || 
        !dieSize.length || !dieSize.breadth) {
      return; // Don't calculate if essential fields are missing
    }
    
    setIsCalculating(true);
    try {
      // Get the misc charge from the form state if available and misc is enabled
      const miscCharge = state.misc?.isMiscUsed && state.misc?.miscCharge 
        ? parseFloat(state.misc.miscCharge) 
        : null; // Pass null to let the calculator fetch from DB
      
      // Pass the current markup values and misc charge to the calculation service
      const result = await performCompleteCalculations(
        state,
        miscCharge, // Use the custom misc charge if available
        markupPercentage,
        selectedMarkupType
      );
      
      if (result.error) {
        console.error("Error during calculations:", result.error);
      } else {
        // Verify markup values are included
        console.log("Calculation results with markup:", {
          markupType: result.markupType,
          markupPercentage: result.markupPercentage,
          markupAmount: result.markupAmount,
          miscCharge: miscCharge ? `Custom: ${miscCharge}` : "From DB"
        });
        
        setCalculations(result);
      }
    } catch (error) {
      console.error("Unexpected error during calculations:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const { orderAndPaper, client, versionId } = state;
    
    // Validate Client selection - skip in edit mode
    if (!isEditMode && !client.clientId) {
      errors.clientId = "Client selection is required";
    }
    
    // Validate Version selection
    if (!versionId) errors.versionId = "Version selection is required";
    
    // Validate Order & Paper section
    if (!orderAndPaper.projectName) errors.projectName = "Project name is required";
    if (!orderAndPaper.quantity) errors.quantity = "Quantity is required";
    if (!orderAndPaper.dieCode) errors.dieCode = "Please select a die";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler for Review and Submit when calculations are ready
  const handleCreateEstimate = (enhancedCalculations) => {
    // Log received calculations to verify markup values
    console.log("Enhanced calculations from ReviewAndSubmit:", {
      markupType: enhancedCalculations?.markupType,
      markupPercentage: enhancedCalculations?.markupPercentage,
      markupAmount: enhancedCalculations?.markupAmount
    });
    
    // Store the enhanced calculations to use in handleSubmit
    if (enhancedCalculations) {
      setCalculations(enhancedCalculations);
    }
    
    // Submit the form with the updated calculations
    handleSubmit(new Event('submit'));
  };

  // Function to perform a partial reset of the form, keeping client, version, and order info
  const partialResetForm = () => {
    const partialReset = {
      ...initialFormState,
      // Keep client information
      client: { ...state.client },
      // Keep version information
      versionId: state.versionId,
      // Keep order and paper information
      orderAndPaper: { ...state.orderAndPaper }
    };
    
    dispatch({ type: "INITIALIZE_FORM", payload: partialReset });
    setCalculations(null);
    setActiveSection("reviewAndSubmit");
  };

  // Function for full reset (used by the reset button)
  const fullResetForm = () => {
    dispatch({ type: "RESET_FORM" });
    setActiveSection(null);
    setValidationErrors({});
    setCalculations(null);
    
    // Don't reset client for B2B users, they should always use their own client
    if (!isB2BClient) {
      setSelectedClient(null);
    }
    
    setSelectedVersion("");
    
    // Reset markup to defaults
    setSelectedMarkupType(defaultMarkup.type);
    setMarkupPercentage(defaultMarkup.percentage);
    
    // Scroll to top of form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Double-check that markup values exist before saving
      const calculationsWithMarkup = {
        ...calculations,
        markupType: selectedMarkupType,
        markupPercentage: markupPercentage,
        markupAmount: calculations?.markupAmount || "0.00"
      };
      
      // Create the formatted data for Firebase using the enhanced calculations
      const formattedData = mapStateToFirebaseStructure(state, calculationsWithMarkup);
      
      // Log the data before saving to verify markup values and HSN code
      console.log("Saving to Firebase:", {
        markupType: formattedData.calculations.markupType,
        markupPercentage: formattedData.calculations.markupPercentage,
        markupAmount: formattedData.calculations.markupAmount,
        hsnCode: formattedData.jobDetails.hsnCode
      });
      
      if (isEditMode && onSubmitSuccess) {
        await onSubmitSuccess(formattedData);
        if (onClose) onClose();
      } else {
        await addDoc(collection(db, "estimates"), formattedData);
        
        // Show success notification
        setShowSuccessNotification(true);
        
        // Instead of fully resetting and navigating away, only reset production and post-production sections
        partialResetForm();
      }
    } catch (error) {
      console.error("Error handling estimate:", error);
      alert("Failed to handle estimate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle client selection from ClientSelection component
  const handleClientSelect = (clientData) => {
    // Don't allow client selection changes in edit mode
    if (isEditMode) return;
  
    if (clientData) {
      // Ensure clientInfo has a category property to avoid undefined values
      const sanitizedClientInfo = clientData.clientInfo || {};
      if (sanitizedClientInfo.category === undefined) {
        sanitizedClientInfo.category = null;
      }
      
      dispatch({
        type: "UPDATE_CLIENT",
        payload: {
          clientId: clientData.clientId,
          clientInfo: sanitizedClientInfo
        }
      });
    } else {
      dispatch({
        type: "UPDATE_CLIENT",
        payload: {
          clientId: null,
          clientInfo: null
        }
      });
      
      // Reset version when client is cleared
      setSelectedVersion("");
      dispatch({
        type: "UPDATE_VERSION",
        payload: ""
      });
    }
  };
  
  // Handle version selection
  const handleVersionSelect = (versionId) => {
    setSelectedVersion(versionId);
    dispatch({
      type: "UPDATE_VERSION",
      payload: versionId
    });
  };
  
  // Handle job type change in OrderAndPaper component
  const handleJobTypeChange = (e) => {
    const { value } = e.target;
    
    // Update the job type in the state
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: { jobType: value }
    });
    
    // The useEffect will handle updating the visible services and HSN code
  };
  
  // Generate client code function - needed for when creating new clients
  const generateClientCode = async (clientName) => {
    try {
      // Clean the name: remove spaces, special characters, and take first 4 letters
      const prefix = clientName
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 4)
        .toUpperCase();
      
      // Get all clients with this prefix to find the highest number
      const clientsCollection = collection(db, "clients");
      const querySnapshot = await getDocs(clientsCollection);
      
      let highestNum = 0;
      const pattern = new RegExp(`^${prefix}(\\d+)$`);
      
      // Look for existing codes with the same prefix
      querySnapshot.forEach(doc => {
        const clientData = doc.data();
        if (clientData.clientCode) {
          const match = clientData.clientCode.match(pattern);
          if (match && match[1]) {
            const num = parseInt(match[1]);
            if (!isNaN(num) && num > highestNum) {
              highestNum = num;
            }
          }
        }
      });
      
      // Generate new code with incremented number
      const nextNum = highestNum + 1;
      // Pad to ensure at least 3 digits
      const paddedNum = nextNum.toString().padStart(3, '0');
      
      return `${prefix}${paddedNum}`;
    } catch (error) {
      console.error("Error generating client code:", error);
      // Fallback to a simple random code if there's an error
      const randomNum = Math.floor(Math.random() * 900) + 100;
      return `${clientName.substring(0, 4).toUpperCase()}${randomNum}`;
    }
  };

  // Toggle functions for all service sections
  const toggleLPUsage = () => {
    const isCurrentlyUsed = state.lpDetails.isLPUsed;
    
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { 
        isLPUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          noOfColors: 1,
          colorDetails: [
            {
              plateSizeType: "Auto",
              plateDimensions: { 
                length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
              },
              pantoneType: "",
              plateType: "Polymer Plate",
              mrType: "SIMPLE", // Display value
              mrTypeConcatenated: "LP MR SIMPLE" // Value for calculations
            }
          ]
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("lp");
    }
  };
  
  const toggleFSUsage = () => {
    const isCurrentlyUsed = state.fsDetails.isFSUsed;
    
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { 
        isFSUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          fsType: "FS1",
          foilDetails: [
            {
              blockSizeType: "Auto",
              blockDimension: { 
                length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
              },
              foilType: "Gold MTS 220",
              blockType: "Magnesium Block 3MM",
              mrType: "SIMPLE", // Display value
              mrTypeConcatenated: "FS MR SIMPLE" // Value for calculations
            }
          ]
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("fs");
    }
  };
  
  const toggleEMBUsage = () => {
    const isCurrentlyUsed = state.embDetails.isEMBUsed;
    
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: { 
        isEMBUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          plateSizeType: "Auto",
          plateDimensions: { 
            length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
            breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
          },
          plateTypeMale: "Polymer Plate",
          plateTypeFemale: "Polymer Plate",
          embMR: "SIMPLE", // Display value
          embMRConcatenated: "EMB MR SIMPLE" // Value for calculations
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("emb");
    }
  };  
  
  const toggleDigiUsage = () => {
    const isCurrentlyUsed = state.digiDetails.isDigiUsed;
    
    // Define default DIGI_DIE_OPTIONS (same as in DigiDetails component)
    const DIGI_DIE_OPTIONS = {
      "12x18": { length: "12", breadth: "18" },
      "13x19": { length: "13", breadth: "19" },
    };
    
    // Get the first option as default
    const firstOption = Object.keys(DIGI_DIE_OPTIONS)[0] || "12x18";
    const defaultDimensions = DIGI_DIE_OPTIONS[firstOption] || { length: "12", breadth: "18" };
    
    dispatch({
      type: "UPDATE_DIGI_DETAILS",
      payload: { 
        isDigiUsed: !isCurrentlyUsed,
        // When toggling on, initialize with the first option
        ...(!isCurrentlyUsed && {
          digiDie: firstOption,
          digiDimensions: defaultDimensions
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("digi");
    }
  };
  
  const toggleNotebookUsage = () => {
    const isCurrentlyUsed = state.notebookDetails?.isNotebookUsed || false;
    
    dispatch({
      type: "UPDATE_NOTEBOOK_DETAILS",
      payload: { 
        isNotebookUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          orientation: "",
          length: "",
          breadth: "",
          calculatedLength: "",
          calculatedBreadth: "",
          numberOfPages: "",
          bindingType: "",
          bindingTypeConcatenated: "",
          paperName: papers.length > 0 ? papers[0].paperName : ""
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("notebook");
    }
  };

  const toggleScreenPrintUsage = () => {
    const isCurrentlyUsed = state.screenPrint?.isScreenPrintUsed || false;
    
    dispatch({
      type: "UPDATE_SCREEN_PRINT",
      payload: { 
        isScreenPrintUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          noOfColors: 1,
          screenMR: "", // Will be set by useEffect in ScreenPrint component
          screenMRConcatenated: "" // Will be set by useEffect in ScreenPrint component
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("screenPrint");
    }
  };
  
  const toggleDieCuttingUsage = () => {
    const isCurrentlyUsed = state.dieCutting.isDieCuttingUsed;
    
    dispatch({
      type: "UPDATE_DIE_CUTTING",
      payload: { 
        isDieCuttingUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          dcMR: "SIMPLE",
          dcMRConcatenated: "DC MR SIMPLE"
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("dieCutting");
    }
  };
  
  const togglePostDCUsage = () => {
    const isCurrentlyUsed = state.postDC?.isPostDCUsed || false;
    
    dispatch({
      type: "UPDATE_POST_DC",
      payload: { 
        isPostDCUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          pdcMR: "SIMPLE", // Default value, will be replaced when MR types are loaded
          pdcMRConcatenated: "PDC MR SIMPLE" // Default concatenated value
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("postDC");
    }
  };
  
  const toggleFoldAndPasteUsage = () => {
    const isCurrentlyUsed = state.foldAndPaste?.isFoldAndPasteUsed || false;
    
    dispatch({
      type: "UPDATE_FOLD_AND_PASTE",
      payload: { 
        isFoldAndPasteUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          dstMaterial: "", // Initialize dstMaterial field
          dstType: ""      // Initialize dstType field
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("foldAndPaste");
    }
  };
  
  const toggleDstPasteUsage = () => {
    const isCurrentlyUsed = state.dstPaste?.isDstPasteUsed || false;
    
    dispatch({
      type: "UPDATE_DST_PASTE",
      payload: { 
        isDstPasteUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          dstType: ""  // Initialize dstType field
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("dstPaste");
    }
  };

  const toggleMagnetUsage = () => {
    const isCurrentlyUsed = state.magnet?.isMagnetUsed || false;
    
    dispatch({
      type: "UPDATE_MAGNET",
      payload: { 
        isMagnetUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          magnetMaterial: ""
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("magnet");
    }
  };
  
  const toggleQCUsage = () => {
    const isCurrentlyUsed = state.qc?.isQCUsed || false;
    
    dispatch({
      type: "UPDATE_QC",
      payload: { isQCUsed: !isCurrentlyUsed }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("qc");
    }
  };
  
  const togglePackingUsage = () => {
    const isCurrentlyUsed = state.packing?.isPackingUsed || false;
    
    dispatch({
      type: "UPDATE_PACKING",
      payload: { isPackingUsed: !isCurrentlyUsed }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("packing");
    }
  };
  
  const toggleMiscUsage = () => {
    const isCurrentlyUsed = state.misc?.isMiscUsed || false;
    
    dispatch({
      type: "UPDATE_MISC",
      payload: { 
        isMiscUsed: !isCurrentlyUsed,
        miscCharge: "" // Initialize as empty string to allow fetching from DB
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("misc");
    }
  };
  
  const toggleSandwichUsage = () => {
    const isCurrentlyUsed = state.sandwich?.isSandwichComponentUsed || false;
    const defaultPaperName = papers.length > 0 ? papers[0].paperName : "";
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: { 
        isSandwichComponentUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
          // Initialize with the default paper if available
          paperInfo: {
            paperName: defaultPaperName
          },
          lpDetailsSandwich: {
            isLPUsed: false,
            noOfColors: 0,
            colorDetails: []
          },
          fsDetailsSandwich: {
            isFSUsed: false,
            fsType: "",
            foilDetails: []
          },
          embDetailsSandwich: {
            isEMBUsed: false,
            plateSizeType: "",
            plateDimensions: { 
              length: "", 
              breadth: "",
              lengthInInches: "",
              breadthInInches: "" 
            },
            plateTypeMale: "",
            plateTypeFemale: "",
            embMR: "",
            embMRConcatenated: ""
          }
        })
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("sandwich");
    }
  };
  
  // Special function for ReviewAndSubmit section
  const toggleReviewSection = () => {
    // This only expands/collapses the section without changing any usage state
    if (activeSection === "reviewAndSubmit") {
      setActiveSection(null);
    } else {
      setActiveSection("reviewAndSubmit");
    }
  };

  // Handle reset form
  const handleResetForm = () => {
    setShowResetConfirmation(true);
  };

  const confirmResetForm = () => {
    fullResetForm();
    setShowResetConfirmation(false);
  };

  // Check if a service is visible for the current job type
  const isServiceVisible = (serviceCode) => {
    return (
      visibleProductionServices.includes(serviceCode) ||
      visiblePostProductionServices.includes(serviceCode)
    );
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Billing Form
            </h1>
            <p className="text-gray-600 mt-1">
              Create, edit and generate new bills and estimates
            </p>
          </div>
          
          <div className="flex space-x-3">
            {/* Reset Form Button */}
            <button 
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Reset Form
            </button>
          </div>
        </div>

        {/* Success Notification Component */}
        <SuccessNotification
          message="Estimate Created Successfully! You can create another estimate with the same client and project details."
          isVisible={showSuccessNotification}
          onClose={closeSuccessNotification}
          duration={3000}
        />

        {/* Reset Confirmation Modal */}
        {showResetConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
              <p className="mb-6">Are you sure you want to reset the form? All entered data will be lost.</p>
              <div className="flex justify-end space-x-4">
                <button 
                  type="button"
                  onClick={() => setShowResetConfirmation(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={confirmResetForm}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection Section - Modified for B2B users */}
          <FixedSection
            state={state}
            dispatch={dispatch}
            isEditMode={isEditMode}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            selectedVersion={selectedVersion}
            handleClientSelect={handleClientSelect}
            handleVersionSelect={handleVersionSelect}
            generateClientCode={generateClientCode}
            isB2BClient={isB2BClient}
            linkedClientData={linkedClientData}
            validationErrors={validationErrors}
            handleJobTypeChange={handleJobTypeChange}
          />

          {/* Production Services Section */}
          <div className="mb-6 shadow rounded-lg px-4 py-3 border-b border-gray-200">
            <h2 className="mb-4 border-b border-gray-200 border-b border-gray-200 pb-2 text-lg font-medium text-gray-800">Production Services</h2>
            
            {/* LP Section */}
            {isServiceVisible("LP") && (
              <FormSection 
                title="Letter Press (LP)" 
                id="lp"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.lpDetails.isLPUsed}
                onToggleUsage={toggleLPUsage}
              >
                <LPDetails 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}

            {/* Other production service sections follow the same pattern */}
            {isServiceVisible("FS") && (
              <FormSection 
                title="Foil Stamping (FS)" 
                id="fs"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.fsDetails.isFSUsed}
                onToggleUsage={toggleFSUsage}
              >
                <FSDetails 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}
            
            {isServiceVisible("EMB") && (
              <FormSection 
                title="Embossing (EMB)" 
                id="emb"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.embDetails.isEMBUsed}
                onToggleUsage={toggleEMBUsage}
              >
                <EMBDetails 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}
            
            {isServiceVisible("DIGI") && (
              <FormSection 
                title="Digital Printing" 
                id="digi"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.digiDetails.isDigiUsed}
                onToggleUsage={toggleDigiUsage}
              >
                <DigiDetails 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}
            
            {isServiceVisible("NOTEBOOK") && (
              <FormSection 
                title="Notebook Details" 
                id="notebook"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.notebookDetails?.isNotebookUsed || false}
                onToggleUsage={toggleNotebookUsage}
              >
                <NotebookDetails 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}
            
            {isServiceVisible("SCREEN") && (
              <FormSection 
                title="Screen Printing" 
                id="screenPrint"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.screenPrint?.isScreenPrintUsed || false}
                onToggleUsage={toggleScreenPrintUsage}
              >
                <ScreenPrint 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}
          </div>

          {/* Post-Production Services Section */}
          <div className="mb-6 shadow rounded-lg px-4 py-3 border-b border-gray-200">
            <h2 className="mb-4 border-b border-gray-200 border-b border-gray-200 pb-2 text-lg font-medium text-gray-800">Post-Production Services</h2>
            
            {/* Die Cutting Section */}
            {isServiceVisible("DC") && (
              <FormSection 
                title="Die Cutting" 
                id="dieCutting"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.dieCutting.isDieCuttingUsed}
                onToggleUsage={toggleDieCuttingUsage}
              >
                <DieCutting 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}

            {/* Post DC Section */}
            {isServiceVisible("POST DC") && (
              <FormSection 
                title="Post Die Cutting" 
                id="postDC"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.postDC?.isPostDCUsed || false}
                onToggleUsage={togglePostDCUsage}
              >
                <PostDC 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}

            {/* Fold & Paste Section */}
            {isServiceVisible("FOLD & PASTE") && (
              <FormSection 
                title="Fold & Paste" 
                id="foldAndPaste"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.foldAndPaste?.isFoldAndPasteUsed || false}
                onToggleUsage={toggleFoldAndPasteUsage}
              >
                <FoldAndPaste 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}

            {/* DST Paste Section */}
            {isServiceVisible("DST PASTE") && (
              <FormSection 
                title="DST PASTE" 
                id="dstPaste"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.dstPaste?.isDstPasteUsed || false}
                onToggleUsage={toggleDstPasteUsage}
              >
                <DstPaste 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}

            {/* Magnet Section */}
            {isServiceVisible("MAGNET") && (
              <FormSection 
                title="MAGNET" 
                id="magnet"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.magnet?.isMagnetUsed || false}
                onToggleUsage={toggleMagnetUsage}
              >
                <Magnet 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}

            {/* QC Section */}
            {isServiceVisible("QC") && (
              <FormSection 
                title="Quality Check" 
                id="qc"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.qc?.isQCUsed || false}
                onToggleUsage={toggleQCUsage}
              >
                <QC 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}

            {/* Packing Section */}
            {isServiceVisible("PACKING") && (
              <FormSection 
                title="Packing" 
                id="packing"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.packing?.isPackingUsed || false}
                onToggleUsage={togglePackingUsage}
              >
                <Packing 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}
            
            {/* Misc Section */}
            {isServiceVisible("MISC") && (
              <FormSection 
                title="Miscellaneous" 
                id="misc"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.misc?.isMiscUsed || false}
                onToggleUsage={toggleMiscUsage}
              >
                <Misc 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}

            {/* Sandwich Section */}
            {isServiceVisible("DUPLEX") && (
              <FormSection 
                title="Duplex/Sandwich" 
                id="sandwich"
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isUsed={state.sandwich?.isSandwichComponentUsed || false}
                onToggleUsage={toggleSandwichUsage}
              >
                <Sandwich 
                  state={state} 
                  dispatch={dispatch} 
                  onNext={() => {}} 
                  onPrevious={() => {}} 
                  singlePageMode={true}
                />
              </FormSection>
            )}
          </div>

          {/* Cost Calculation & Review Section - Now Collapsible */}
          <div className="mt-6">
            <FormSection 
              title="COST CALCULATION" 
              id="reviewAndSubmit"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              isUsed={true}
              onToggleUsage={toggleReviewSection}
              bgColor="bg-blue-50"
            >
              <ReviewAndSubmit 
                state={state} 
                calculations={calculations} 
                isCalculating={isCalculating} 
                onCreateEstimate={handleCreateEstimate}
                onMarkupChange={handleMarkupChange} 
                isEditMode={isEditMode}
                isSaving={isSubmitting}
                previewMode={!isSubmitting}
              />
            </FormSection>
          </div>

          <div className="flex flex-row-reverse justify-between mt-8 border-t pt-6">
            {/* Right side: Cancel and Submit buttons */}
            <div className="flex">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-3 px-5 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  isEditMode ? "Save Changes" : "Submit"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingForm;