import React, { useReducer, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { calculateEstimateCosts } from "./calculations";
import { safeNumber, format, calculateEnhancedValues } from "../../utils/calculationUtils";

// Import components
import ClientSelection from "./ClientSelection";
import VersionSelection from "./VersionSelection";
import OrderAndPaper from "./OrderAndPaper";
import LPDetails from "./LPDetails";
import FSDetails from "./FSDetails";
import EMBDetails from "./EMBDetails";
import DigiDetails from "./DigiDetails";
import DieCutting from "./DieCutting";
import Sandwich from "./Sandwich";
import Pasting from "./Pasting";
import ReviewAndSubmit from "./ReviewAndSubmit";

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
    jobType: "Card",
    quantity: "",
    paperProvided: "Yes",
    paperName: "",
    dieSelection: "",
    dieCode: "",
    dieSize: { length: "", breadth: "" },
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
    case "UPDATE_DIE_CUTTING":
      return { ...state, dieCutting: { ...state.dieCutting, ...action.payload } };
    case "UPDATE_SANDWICH":
      return { ...state, sandwich: { ...state.sandwich, ...action.payload } };
    case "UPDATE_PASTING":
      return { ...state, pasting: { ...state.pasting, ...action.payload } };
    case "RESET_FORM":
      return initialFormState;
    case "INITIALIZE_FORM":
      return { ...action.payload };
    default:
      return state;
  }
};

// FormSection component with toggle in header
const FormSection = ({ title, children, id, activeSection, setActiveSection, isUsed = false, onToggleUsage }) => {
  const isActive = activeSection === id;
  
  const toggleSection = () => {
    setActiveSection(isActive ? null : id);
  };
  
  return (
    <div className="mb-6 border rounded-lg overflow-hidden shadow-sm">
      <div 
        className={`p-3 flex justify-between items-center ${isActive ? 'bg-blue-50' : 'bg-gray-50'}`}
      >
        <div className="flex items-center space-x-4">
          {/* Toggle switch in section header */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // Prevent section expansion when clicking toggle
              onToggleUsage();
            }}
          >
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {isUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            {/* <span className="text-sm font-medium text-gray-600">Use</span> */}
          </div>
          
          {/* Section title */}
          <h2 
            className="text-lg font-semibold cursor-pointer"
            onClick={toggleSection}
          >
            {title}
          </h2>
        </div>
        
        {/* Expand/collapse button */}
        <span 
          className="text-gray-500 text-xl cursor-pointer"
          onClick={toggleSection}
        >
          {isActive ? '−' : '+'}
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
  const [activeSection, setActiveSection] = useState(null); // State for tracking active/open section
  const [validationErrors, setValidationErrors] = useState({});
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [showCostPreview, setShowCostPreview] = useState(false); // New state for toggling cost preview

  const formRef = useRef(null);
  
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
    }
  }, [initialState, isEditMode]);

  // Calculate costs when form data changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performCalculations();
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(debounceTimer);
  }, [state]);

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
      const result = await calculateEstimateCosts(state);
      if (result.error) {
        console.error("Error during calculations:", result.error);
      } else {
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
  const handleCreateEstimate = (enhancedCalcs) => {
    console.log("BillingForm received enhancedCalculations:", enhancedCalcs);
    
    // Verification step - calculate locally to ensure consistency
    if (calculations && enhancedCalcs) {
      const localCalcs = calculateEnhancedValues(
        calculations,
        parseInt(state.orderAndPaper?.quantity) || 0,
        safeNumber(enhancedCalcs.miscChargePerCard) || 5,
        safeNumber(enhancedCalcs.markupPercentage) || 20
      );
      
      console.log("Verification - local calculations totalCostPerCard:", localCalcs.totalCostPerCard);
      console.log("Received enhancedCalcs totalCostPerCard:", enhancedCalcs.totalCostPerCard);
      
      const isConsistent = localCalcs.totalCostPerCard === enhancedCalcs.totalCostPerCard;
      console.log("Calculations are consistent:", isConsistent);
      
      if (!isConsistent) {
        console.warn("Calculation inconsistency detected - using local calculations for safety");
        // Use locally calculated values if there's an inconsistency
        handleFormSubmit(localCalcs);
        return;
      }
    }
    
    // Proceed with the received calculations
    handleFormSubmit(enhancedCalcs);
  };
  
  const generateRobustEnhancedCalculations = (calculations, quantity, miscCharge = 5, markupPercentage = 20) => {
    // Safety check - if no calculations provided, return basic structure
    if (!calculations) {
      return {
        baseCost: "0.00",
        miscChargePerCard: miscCharge.toString(),
        baseWithMisc: miscCharge.toString(),
        wastagePercentage: 5,
        wastageAmount: "0.00",
        overheadPercentage: 35,
        overheadAmount: "0.00",
        markupPercentage: markupPercentage,
        markupType: "STANDARD",
        markupAmount: "0.00",
        subtotalPerCard: "0.00",
        totalCostPerCard: "0.00",
        totalCost: "0.00",
        quantity: parseInt(quantity) || 0,
        calculatedAt: new Date().toISOString()
      };
    }
    
    // IMPORTANT: Safe number conversion that handles all input types
    const safeNumber = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return isNaN(value) ? 0 : value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };
    
    // Format to 2 decimal places as string
    const format = (num) => {
      const value = safeNumber(num);
      return value.toFixed(2);
    };
    
    // Create a copy of calculations with all values as numbers
    const numericCalculations = {};
    
    // Convert all calculation values to numbers
    Object.keys(calculations).forEach(key => {
      numericCalculations[key] = safeNumber(calculations[key]);
    });
    
    // Extract important values with safe conversion
    const paperCostPerCard = safeNumber(calculations.paperCostPerCard);
    const cuttingCostPerCard = safeNumber(calculations.cuttingCostPerCard);
    const gilCutCostPerCard = safeNumber(calculations.gilCutCostPerCard);
    const paperAndCuttingCostPerCard = safeNumber(calculations.paperAndCuttingCostPerCard);
    
    const lpPlateCostPerCard = safeNumber(calculations.lpPlateCostPerCard);
    const lpMRCostPerCard = safeNumber(calculations.lpMRCostPerCard);
    const lpImpressionAndLaborCostPerCard = safeNumber(calculations.lpImpressionAndLaborCostPerCard);
    const lpCostPerCard = safeNumber(calculations.lpCostPerCard);
    
    const fsBlockCostPerCard = safeNumber(calculations.fsBlockCostPerCard);
    const fsFoilCostPerCard = safeNumber(calculations.fsFoilCostPerCard);
    const fsMRCostPerCard = safeNumber(calculations.fsMRCostPerCard);
    const fsImpressionCostPerCard = safeNumber(calculations.fsImpressionCostPerCard);
    const fsCostPerCard = safeNumber(calculations.fsCostPerCard);
    
    const embPlateCostPerCard = safeNumber(calculations.embPlateCostPerCard);
    const embMRCostPerCard = safeNumber(calculations.embMRCostPerCard);
    const embCostPerCard = safeNumber(calculations.embCostPerCard);
    
    const dieCuttingCostPerCard = safeNumber(calculations.dieCuttingCostPerCard);
    const dcImpressionCostPerCard = safeNumber(calculations.dcImpressionCostPerCard);
    const dcMRCostPerCard = safeNumber(calculations.dcMRCostPerCard);
    const pdcCostPerCard = safeNumber(calculations.pdcCostPerCard);
    
    const digiCostPerCard = safeNumber(calculations.digiCostPerCard);
    
    const lpCostPerCardSandwich = safeNumber(calculations.lpCostPerCardSandwich);
    const fsCostPerCardSandwich = safeNumber(calculations.fsCostPerCardSandwich);
    const embCostPerCardSandwich = safeNumber(calculations.embCostPerCardSandwich);
    
    const pastingCostPerCard = safeNumber(calculations.pastingCostPerCard);
    
    // Calculate base cost - Sum of all processing costs
    const baseCost = 
      paperAndCuttingCostPerCard + 
      lpCostPerCard + 
      fsCostPerCard + 
      embCostPerCard + 
      digiCostPerCard + 
      dieCuttingCostPerCard + 
      lpCostPerCardSandwich + 
      fsCostPerCardSandwich + 
      embCostPerCardSandwich + 
      pastingCostPerCard;
    
    // Convert quantity, misc charge and markup to numbers
    const numQuantity = parseInt(quantity) || 0;
    const numMiscCharge = safeNumber(miscCharge);
    const numMarkupPercentage = safeNumber(markupPercentage);
    
    // Add miscellaneous charge
    const baseWithMisc = baseCost + numMiscCharge;
    
    // Calculate wastage (5%)
    const wastageAmount = baseWithMisc * 0.05;
    
    // Calculate overhead (35%)
    const overheadAmount = baseWithMisc * 0.35;
    
    // Calculate subtotal
    const subtotal = baseWithMisc + wastageAmount + overheadAmount;
    
    // Calculate markup
    const markupAmount = subtotal * (numMarkupPercentage / 100);
    
    // Calculate total per card
    const totalPerCard = subtotal + markupAmount;
    
    // Calculate total for order
    const totalCost = totalPerCard * numQuantity;
    
    // Log all calculations for debugging
    console.log("CALCULATION VALUES:");
    console.log("Base Cost Components:", {
      paperAndCuttingCostPerCard,
      lpCostPerCard,
      fsCostPerCard,
      embCostPerCard,
      digiCostPerCard,
      dieCuttingCostPerCard,
      lpCostPerCardSandwich,
      fsCostPerCardSandwich,
      embCostPerCardSandwich,
      pastingCostPerCard
    });
    console.log("Key Calculation Values:", {
      baseCost,
      numMiscCharge,
      baseWithMisc,
      wastageAmount,
      overheadAmount,
      subtotal,
      markupAmount,
      totalPerCard,
      totalCost
    });
    
    // Return comprehensive enhanced calculations object
    return {
      // Main calculation components
      baseCost: format(baseCost),
      miscChargePerCard: format(numMiscCharge),
      baseWithMisc: format(baseWithMisc),
      
      // Wastage
      wastagePercentage: 5,
      wastageAmount: format(wastageAmount),
      
      // Overhead
      overheadPercentage: 35,
      overheadAmount: format(overheadAmount),
      
      // Markup
      markupPercentage: numMarkupPercentage,
      markupType: "STANDARD",
      markupAmount: format(markupAmount),
      
      // Totals
      subtotalPerCard: format(subtotal),
      totalCostPerCard: format(totalPerCard),
      totalCost: format(totalCost),
      
      // Order quantity
      quantity: numQuantity,
      
      // COMPONENT COSTS - all safely converted and formatted
      // Paper & Cutting details
      paperCostPerCard: format(paperCostPerCard),
      cuttingCostPerCard: format(cuttingCostPerCard),
      gilCutCostPerCard: format(gilCutCostPerCard),
      paperAndCuttingCostPerCard: format(paperAndCuttingCostPerCard),
      
      // Letter Press details
      lpPlateCostPerCard: format(lpPlateCostPerCard),
      lpMRCostPerCard: format(lpMRCostPerCard),
      lpImpressionAndLaborCostPerCard: format(lpImpressionAndLaborCostPerCard),
      lpCostPerCard: format(lpCostPerCard),
      
      // Foil Stamping details
      fsBlockCostPerCard: format(fsBlockCostPerCard),
      fsFoilCostPerCard: format(fsFoilCostPerCard),
      fsMRCostPerCard: format(fsMRCostPerCard),
      fsImpressionCostPerCard: format(fsImpressionCostPerCard),
      fsCostPerCard: format(fsCostPerCard),
      
      // Embossing details
      embPlateCostPerCard: format(embPlateCostPerCard),
      embMRCostPerCard: format(embMRCostPerCard),
      embCostPerCard: format(embCostPerCard),
      
      // Die Cutting details
      dcImpressionCostPerCard: format(dcImpressionCostPerCard),
      dcMRCostPerCard: format(dcMRCostPerCard), 
      pdcCostPerCard: format(pdcCostPerCard),
      dieCuttingCostPerCard: format(dieCuttingCostPerCard),
      
      // Digital Printing details
      digiCostPerCard: format(digiCostPerCard),
      
      // Sandwich component details
      lpCostPerCardSandwich: format(lpCostPerCardSandwich),
      lpPlateCostPerCardSandwich: format(calculations.lpPlateCostPerCardSandwich),
      lpMRCostPerCardSandwich: format(calculations.lpMRCostPerCardSandwich),
      lpImpressionAndLaborCostPerCardSandwich: format(calculations.lpImpressionAndLaborCostPerCardSandwich),
      
      fsCostPerCardSandwich: format(fsCostPerCardSandwich),
      fsBlockCostPerCardSandwich: format(calculations.fsBlockCostPerCardSandwich),
      fsFoilCostPerCardSandwich: format(calculations.fsFoilCostPerCardSandwich),
      fsMRCostPerCardSandwich: format(calculations.fsMRCostPerCardSandwich),
      fsImpressionCostPerCardSandwich: format(calculations.fsImpressionCostPerCardSandwich),
      
      embCostPerCardSandwich: format(embCostPerCardSandwich),
      embPlateCostPerCardSandwich: format(calculations.embPlateCostPerCardSandwich),
      embMRCostPerCardSandwich: format(calculations.embMRCostPerCardSandwich),
      
      // Pasting details
      pastingCostPerCard: format(pastingCostPerCard),
      
      // Add timestamp
      calculatedAt: new Date().toISOString()
    };
  };

  // Replace your current handleFormSubmit with this updated version
  const handleFormSubmit = async (enhancedCalcs) => {
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
      // Get values for calculations
      const quantity = parseInt(state.orderAndPaper?.quantity) || 0;
      
      // Get values from enhancedCalcs or use defaults
      let markupPercentage = 20;
      let miscCharge = 5;
      
      if (enhancedCalcs) {
        markupPercentage = safeNumber(enhancedCalcs.markupPercentage) || 20;
        miscCharge = safeNumber(enhancedCalcs.miscChargePerCard) || 5;
      }
      
      // Ensure we have consistent calculations using the shared function
      const finalCalculations = calculateEnhancedValues(
        calculations,
        quantity,
        miscCharge,
        markupPercentage
      );
      
      console.log("Final enhanced calculations being saved to Firebase:", finalCalculations);
      
      // Create the Firebase document
      const docData = {
        // Client reference information
        clientId: state.client.clientId,
        clientInfo: state.client.clientInfo,
        
        // Version information
        versionId: state.versionId || "1",
        
        // Project specific information
        projectName: state.orderAndPaper.projectName,
        date: state.orderAndPaper.date?.toISOString() || null,
        deliveryDate: state.orderAndPaper.deliveryDate?.toISOString() || null,
        
        // Job details
        jobDetails: {
          jobType: state.orderAndPaper.jobType,
          quantity: state.orderAndPaper.quantity,
          paperProvided: state.orderAndPaper.paperProvided,
          paperName: state.orderAndPaper.paperName,
        },
        
        // Die details
        dieDetails: {
          dieSelection: state.orderAndPaper.dieSelection,
          dieCode: state.orderAndPaper.dieCode,
          dieSize: state.orderAndPaper.dieSize,
          image: state.orderAndPaper.image,
        },
        
        // Processing options (only included when selected)
        lpDetails: state.lpDetails.isLPUsed ? state.lpDetails : null,
        fsDetails: state.fsDetails.isFSUsed ? state.fsDetails : null,
        embDetails: state.embDetails.isEMBUsed ? state.embDetails : null,
        digiDetails: state.digiDetails.isDigiUsed ? state.digiDetails : null,
        dieCutting: state.dieCutting.isDieCuttingUsed ? state.dieCutting : null,
        sandwich: state.sandwich.isSandwichComponentUsed ? state.sandwich : null,
        pasting: state.pasting.isPastingUsed ? state.pasting : null,
        
        // Base calculations
        calculations: calculations,
        
        // Enhanced calculations from the shared utility
        enhancedCalculations: finalCalculations,
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (isEditMode && onSubmitSuccess) {
        await onSubmitSuccess(docData);
        if (onClose) onClose();
      } else {
        const docRef = await addDoc(collection(db, "estimates"), docData);
        console.log("Document written with ID:", docRef.id);
        
        alert("Estimate created successfully!");
        dispatch({ type: "RESET_FORM" });
        setSelectedClient(null);
        setSelectedVersion("");
        // Navigate to estimates page
        navigate('/material-stock/estimates-db');
      }
    } catch (error) {
      console.error("Error handling estimate:", error);
      alert("Failed to handle estimate: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };  

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // We're now directly calling handleFormSubmit with null
    // The enhanced calculations will come from ReviewAndSubmit component
    // through the handleCreateEstimate function
    handleFormSubmit(null);
  };

  // Handle client selection from ClientSelection component
  const handleClientSelect = (clientData) => {
    if (clientData) {
      dispatch({
        type: "UPDATE_CLIENT",
        payload: clientData
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

  // Toggle handlers for each section
  const toggleLPUsage = () => {
    // If toggling on, set to default values; if toggling off, clear values
    const isCurrentlyUsed = state.lpDetails.isLPUsed;
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: {
        isLPUsed: !isCurrentlyUsed,
        noOfColors: !isCurrentlyUsed ? 1 : 0,
        colorDetails: !isCurrentlyUsed
          ? [
              {
                plateSizeType: "Auto",
                plateDimensions: { 
                  length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                  breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
                },
                pantoneType: "",
                plateType: "Polymer Plate",
                mrType: "Simple"
              }
            ]
          : []
      }
    });
    
    // Auto-expand section when toggled on
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
        fsType: !isCurrentlyUsed ? "FS1" : "",
        foilDetails: !isCurrentlyUsed
          ? [
              {
                blockSizeType: "Auto",
                blockDimension: { 
                  length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                  breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
                },
                foilType: "Gold MTS 220",
                blockType: "Magnesium Block 3MM",
                mrType: "Simple"
              }
            ]
          : []
      }
    });
    
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
        plateSizeType: !isCurrentlyUsed ? "Auto" : "",
        plateDimensions: !isCurrentlyUsed
          ? { 
              length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
              breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
            }
          : { length: "", breadth: "" },
        plateTypeMale: !isCurrentlyUsed ? "Polymer Plate" : "",
        plateTypeFemale: !isCurrentlyUsed ? "Polymer Plate" : "",
        embMR: !isCurrentlyUsed ? "Simple" : ""
      }
    });
    
    if (!isCurrentlyUsed) {
      setActiveSection("emb");
    }
  };

  const toggleDigiUsage = () => {
    const isCurrentlyUsed = state.digiDetails.isDigiUsed;
    dispatch({
      type: "UPDATE_DIGI_DETAILS",
      payload: {
        isDigiUsed: !isCurrentlyUsed,
        digiDie: !isCurrentlyUsed ? "" : "",
        digiDimensions: !isCurrentlyUsed
          ? { length: "", breadth: "" }
          : { length: "", breadth: "" }
      }
    });
    
    if (!isCurrentlyUsed) {
      setActiveSection("digi");
    }
  };

  const toggleDieCuttingUsage = () => {
    const isCurrentlyUsed = state.dieCutting.isDieCuttingUsed;
    dispatch({
      type: "UPDATE_DIE_CUTTING",
      payload: {
        isDieCuttingUsed: !isCurrentlyUsed,
        difficulty: !isCurrentlyUsed ? "No" : "",
        pdc: !isCurrentlyUsed ? "No" : "",
        dcMR: !isCurrentlyUsed ? "Simple" : ""
      }
    });
    
    if (!isCurrentlyUsed) {
      setActiveSection("dieCutting");
    }
  };

  const toggleSandwichUsage = () => {
    const isCurrentlyUsed = state.sandwich.isSandwichComponentUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        isSandwichComponentUsed: !isCurrentlyUsed,
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
      }
    });
    
    if (!isCurrentlyUsed) {
      setActiveSection("sandwich");
    }
  };

  const togglePastingUsage = () => {
    const isCurrentlyUsed = state.pasting.isPastingUsed;
    dispatch({
      type: "UPDATE_PASTING",
      payload: {
        isPastingUsed: !isCurrentlyUsed,
        pastingType: !isCurrentlyUsed ? "" : ""
      }
    });
    
    if (!isCurrentlyUsed) {
      setActiveSection("pasting");
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
    setSelectedClient(null);
    setSelectedVersion("");
    
    // Scroll to top of form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Toggle cost preview visibility
  const toggleCostPreview = () => {
    setShowCostPreview(!showCostPreview);
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-700">
            {isEditMode ? "EDIT ESTIMATE" : "CREATE NEW ESTIMATE"}
          </h1>
          
          <div className="flex space-x-3">
            {/* Preview Cost Button */}
            <button
              type="button"
              onClick={toggleCostPreview}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {showCostPreview ? "Hide Preview" : "Preview Costs"}
            </button>
            
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
          {/* Client Selection Section - New section at top */}
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">CLIENT SELECTION</h2>
            <ClientSelection 
              onClientSelect={handleClientSelect}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              generateClientCode={generateClientCode}
            />
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
            />
          </div>

          {/* Processing Options in Collapsible Sections with direct toggles */}
          <div>
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

            <FormSection 
              title="SANDWICH" 
              id="sandwich"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              isUsed={state.sandwich.isSandwichComponentUsed}
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

            <FormSection 
              title="PASTING" 
              id="pasting"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              isUsed={state.pasting.isPastingUsed}
              onToggleUsage={togglePastingUsage}
            >
              <Pasting 
                state={state} 
                dispatch={dispatch} 
                onNext={() => {}} 
                onPrevious={() => {}} 
                singlePageMode={true}
              />
            </FormSection>
          </div>

          {/* Cost Calculation & Review Section - Only visible when preview is toggled */}
          {showCostPreview && (
            <div className="bg-gray-50 p-5 rounded-lg shadow-sm mt-6 border-2 border-blue-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-700 border-b pb-2">COST CALCULATION PREVIEW</h2>
                <button 
                  type="button" 
                  onClick={toggleCostPreview}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <span className="text-xl">×</span> Close Preview
                </button>
              </div>
              <ReviewAndSubmit 
                state={state} 
                calculations={calculations} 
                isCalculating={isCalculating} 
                onPrevious={() => {}} 
                onCreateEstimate={handleCreateEstimate} 
                isEditMode={isEditMode}
                isSaving={isSubmitting}
                singlePageMode={true}
                previewMode={true}
              />
            </div>
          )}

          <div className="flex justify-between mt-8 border-t pt-6">
            {/* Left side: Preview costs button */}
            <button
              type="button"
              onClick={toggleCostPreview}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {showCostPreview ? "Hide Preview" : "Preview Costs"}
            </button>
            
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
                  isEditMode ? "Save Changes" : "Create Estimate"
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