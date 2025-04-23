import React, { useReducer, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { performCompleteCalculations, recalculateTotals } from "./Services/Calculations/calculationsService";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from "../Login/AuthContext"; // Added import for auth context

// Import components
import ClientSelection from "./Sections/Fixed/ClientSelection";
import VersionSelection from "./Sections/Fixed/VersionSelection";
import OrderAndPaper from "./Sections/Fixed/OrderAndPaper";
import LPDetails from "./Sections/Production/LPDetails";
import FSDetails from "./Sections/Production/FSDetails";
import EMBDetails from "./Sections/Production/EMBDetails";
import DigiDetails from "./Sections/Production/DigiDetails";
import ScreenPrint from "./Sections/Production/ScreenPrint";
import DieCutting from "./Sections/Post Production/DieCutting";
import PostDC from "./Sections/Post Production/PostDC";
import FoldAndPaste from "./Sections/Post Production/FoldAndPaste";
import DstPaste from "./Sections/Post Production/DstPaste";
import QC from "./Sections/Post Production/QC";
import Packing from "./Sections/Post Production/Packing";
import Sandwich from "./Sections/Post Production/Sandwich";
import Misc from "./Sections/Post Production/Misc";
import ReviewAndSubmit from "./ReviewAndSubmit";

// Import service and job type configurations
import { serviceRegistry } from "./Services/Config/serviceRegistry";
import { jobTypeConfigurations } from "./Services/Config/jobTypeConfigurations";

// Initial state for all steps
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
  screenPrint: {
    isScreenPrintUsed: false
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
  },
  dstPaste: {
    isDstPasteUsed: false,
  },
  qc: {
    isQCUsed: false,
  },
  packing: {
    isPackingUsed: false,
  },
  misc: {
    isMiscUsed: false
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
    case "UPDATE_QC":
      return { ...state, qc: { ...state.qc, ...action.payload } };
    case "UPDATE_PACKING":
      return { ...state, packing: { ...state.packing, ...action.payload } };
    case "UPDATE_MISC":
      return { ...state, misc: { ...state.misc, ...action.payload } };
    case "UPDATE_SANDWICH":
      return { ...state, sandwich: { ...state.sandwich, ...action.payload } };
    case "RESET_FORM":
      return initialFormState;
    case "INITIALIZE_FORM":
      return { ...action.payload };
    default:
      return state;
  }
};

// Map state to Firebase structure with sanitization for undefined values
const mapStateToFirebaseStructure = (state, calculations) => {
  const { client, versionId, orderAndPaper, lpDetails, fsDetails, embDetails, digiDetails, screenPrint, dieCutting, sandwich } = state;

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

  // Create the sanitized Firebase data structure
  const firestoreData = {
    // Client reference information
    clientId: client.clientId,
    clientInfo: sanitizeForFirestore(client.clientInfo),
    
    // Version information
    versionId: versionId || "1", // Default to version 1 if not specified
    
    // Project specific information
    projectName: orderAndPaper.projectName,
    date: orderAndPaper.date?.toISOString() || null,
    deliveryDate: orderAndPaper.deliveryDate?.toISOString() || null,
    
    // Job details
    jobDetails: sanitizeForFirestore({
      jobType: orderAndPaper.jobType,
      quantity: orderAndPaper.quantity,
      paperProvided: orderAndPaper.paperProvided,
      paperName: orderAndPaper.paperName,
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
    screenPrint: screenPrint?.isScreenPrintUsed ? sanitizeForFirestore(screenPrint) : null,
    dieCutting: dieCutting.isDieCuttingUsed ? sanitizeForFirestore(dieCutting) : null,
    sandwich: sandwich.isSandwichComponentUsed ? sanitizeForFirestore(sandwich) : null,
    
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

  return firestoreData;
};

// FormSection component with toggle in header
const FormSection = ({ title, children, id, activeSection, setActiveSection, isUsed = false, onToggleUsage, isDisabled = false, bgColor = "bg-gray-50" }) => {
  const isActive = activeSection === id;
  
  const toggleSection = () => {
    if (!isDisabled) {
      setActiveSection(isActive ? null : id);
    }
  };
  
  // Special handling for the ReviewAndSubmit section (which has no toggle)
  const isReviewSection = id === "reviewAndSubmit";
  
  return (
    <div className={`mb-6 border rounded-lg overflow-hidden shadow-sm ${isDisabled ? 'opacity-60' : ''}`}>
      <div 
        className={`p-3 flex justify-between items-center ${isActive ? (bgColor || 'bg-blue-50') : (bgColor || 'bg-gray-50')} cursor-pointer`}
        onClick={toggleSection}
      >
        <div className="flex items-center space-x-4">
          {/* Toggle switch in section header - not shown for ReviewAndSubmit */}
          {!isReviewSection && (
            <div 
              className={`flex items-center space-x-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent section expansion when clicking toggle
                if (!isDisabled) {
                  onToggleUsage();
                }
              }}
            >
              <div className={`w-5 h-5 flex items-center justify-center border rounded-full ${isDisabled ? 'bg-gray-200 border-gray-300' : 'border-gray-300 bg-gray-200'}`}>
                {isUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
              </div>
            </div>
          )}
          
          {/* Section title */}
          <h2 
            className={`text-lg font-semibold ${isDisabled ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
          >
            {title}
          </h2>
        </div>
        
        {/* Expand/collapse button */}
        <span className="text-gray-500">
          {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </div>
      <div className={`transition-all duration-300 ${isActive ? 'block p-4' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
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
  
  // Define visible services based on the selected job type
  const [visibleProductionServices, setVisibleProductionServices] = useState([]);
  const [visiblePostProductionServices, setVisiblePostProductionServices] = useState([]);

  // Add B2B client detection using Auth context
  const { userRole, currentUser } = useAuth();
  const [isB2BClient, setIsB2BClient] = useState(false);
  const [linkedClientData, setLinkedClientData] = useState(null);

  const formRef = useRef(null);
  
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
      dispatch({ type: "INITIALIZE_FORM", payload: initialState });
      
      // If client info exists in initialState, set the selected client
      if (initialState.client?.clientId) {
        // Fetch the client from Firestore
        const fetchClient = async () => {
          try {
            const clientsCollection = collection(db, "clients");
            const q = query(clientsCollection, where("id", "==", initialState.client.clientId));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const clientData = {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data()
              };
              setSelectedClient(clientData);
            }
          } catch (error) {
            console.error("Error fetching client:", error);
          }
        };
        
        fetchClient();
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
    
  }, [state.orderAndPaper.jobType]);

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

  // Function to recalculate totals when markup changes
  const recalculateWithMarkup = async (markupType, markupPercentage) => {
    console.log("Recalculating with new markup:", markupType, markupPercentage);
    setIsCalculating(true);
    try {
      // Use the recalculateTotals function from calculationsService if we already have base calculations
      if (calculations && !calculations.error) {
        // Call recalculateTotals with the existing calculations, updated markup info, and quantity
        const result = await recalculateTotals(
          calculations,
          parseFloat(calculations.miscCostPerCard || 5), // Use existing misc charge or default
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
          5, // default misc charge
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
      // Pass the current markup values to the calculation service
      const result = await performCompleteCalculations(
        state,
        5, // default misc charge
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
          markupAmount: result.markupAmount
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
    
    // Validate Client selection
    if (!client.clientId) errors.clientId = "Client selection is required";
    
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
      
      // Log the data before saving to verify markup values
      console.log("Saving to Firebase:", {
        markupType: formattedData.calculations.markupType,
        markupPercentage: formattedData.calculations.markupPercentage,
        markupAmount: formattedData.calculations.markupAmount
      });
      
      if (isEditMode && onSubmitSuccess) {
        await onSubmitSuccess(formattedData);
        if (onClose) onClose();
      } else {
        await addDoc(collection(db, "estimates"), formattedData);
        
        alert("Estimate created successfully!");
        dispatch({ type: "RESET_FORM" });
        setSelectedClient(null);
        setSelectedVersion("");
        // Navigate to estimates page
        navigate('/material-stock/estimates-db');
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
    
    // The useEffect will handle updating the visible services
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
  
  const toggleScreenPrintUsage = () => {
    const isCurrentlyUsed = state.screenPrint?.isScreenPrintUsed || false;
    
    dispatch({
      type: "UPDATE_SCREEN_PRINT",
      payload: { 
        isScreenPrintUsed: !isCurrentlyUsed
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
      payload: { isFoldAndPasteUsed: !isCurrentlyUsed }
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
      payload: { isDstPasteUsed: !isCurrentlyUsed }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("dstPaste");
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
        isMiscUsed: !isCurrentlyUsed
      }
    });
    
    // Auto expand when toggled on
    if (!isCurrentlyUsed) {
      setActiveSection("misc");
    }
  };
  
  const toggleSandwichUsage = () => {
    const isCurrentlyUsed = state.sandwich?.isSandwichComponentUsed || false;
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: { 
        isSandwichComponentUsed: !isCurrentlyUsed,
        ...((!isCurrentlyUsed) && {
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
            plateDimensions: { length: "", breadth: "" },
            plateTypeMale: "",
            plateTypeFemale: "",
            embMR: ""
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
    dispatch({ type: "RESET_FORM" });
    setShowResetConfirmation(false);
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
          <h1 className="text-2xl font-bold text-gray-700">
            {isEditMode ? "EDIT ESTIMATE" : "CREATE NEW ESTIMATE"}
          </h1>
          
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
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">CLIENT SELECTION</h2>
            {isB2BClient && linkedClientData ? (
              /* For B2B clients, show readonly client info */
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center mb-2">
                  <span className="font-bold">Client:</span>
                  <span className="ml-2 text-lg">{linkedClientData.name || linkedClientData.clientInfo?.name}</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    B2B Client
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Client Code: {linkedClientData.clientCode || linkedClientData.clientInfo?.clientCode}</p>
                  {linkedClientData.contactPerson && (
                    <p>Contact: {linkedClientData.contactPerson}</p>
                  )}
                  {linkedClientData.email && (
                    <p>Email: {linkedClientData.email}</p>
                  )}
                </div>
              </div>
            ) : (
              /* For admin users, show normal client selection */
              <ClientSelection 
                onClientSelect={handleClientSelect}
                selectedClient={selectedClient}
                setSelectedClient={setSelectedClient}
                generateClientCode={generateClientCode}
              />
            )}
            {validationErrors.clientId && (
              <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.clientId}</p>
            )}
          </div>

          {/* Version Selection - Add after client selection */}
          {state.client.clientId && (
            <VersionSelection 
              clientId={state.client.clientId}
              selectedVersion={selectedVersion}
              onVersionSelect={handleVersionSelect}
            />
          )}
          {validationErrors.versionId && (
            <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.versionId}</p>
          )}

          {/* Order & Paper Section - Now Project Details */}
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">PROJECT & PAPER DETAILS</h2>
            <OrderAndPaper 
              state={state} 
              dispatch={dispatch} 
              onNext={() => {}} 
              validationErrors={validationErrors}
              singlePageMode={true}
              onJobTypeChange={handleJobTypeChange}
            />
          </div>

          {/* Production Services Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">PRODUCTION SERVICES</h2>
            
            {/* LP Section */}
            {isServiceVisible("LP") && (
              <FormSection 
                title="LETTER PRESS (LP)" 
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

            {/* FS Section */}
            {isServiceVisible("FS") && (
              <FormSection 
                title="FOIL STAMPING (FS)" 
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

            {/* EMB Section */}
            {isServiceVisible("EMB") && (
              <FormSection 
                title="EMBOSSING (EMB)" 
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

            {/* DIGI Section */}
            {isServiceVisible("DIGI") && (
              <FormSection 
                title="DIGITAL PRINTING" 
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
            
            {/* SCREEN PRINT Section */}
            {isServiceVisible("SCREEN") && (
              <FormSection 
                title="SCREEN PRINTING" 
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
          <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">POST-PRODUCTION SERVICES</h2>
            
            {/* Die Cutting Section */}
            {isServiceVisible("DC") && (
              <FormSection 
                title="DIE CUTTING" 
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
                title="POST DIE CUTTING" 
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
                title="FOLD & PASTE" 
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

            {/* QC Section */}
            {isServiceVisible("QC") && (
              <FormSection 
                title="QUALITY CONTROL" 
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
                title="PACKING" 
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
                title="MISCELLANEOUS" 
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
                title="DUPLEX/SANDWICH" 
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
          <div className="mt-6 border-2 rounded-lg">
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