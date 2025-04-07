import React, { useReducer, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { calculateEstimateCosts } from "./calculations";

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

// Map state to Firebase structure
const mapStateToFirebaseStructure = (state, calculations) => {
  const { client, versionId, orderAndPaper, lpDetails, fsDetails, embDetails, digiDetails, dieCutting, sandwich, pasting } = state;

  return {
    // Client reference information
    clientId: client.clientId,
    clientInfo: client.clientInfo,
    
    // Version information
    versionId: versionId || "1", // Default to version 1 if not specified
    
    // Project specific information
    projectName: orderAndPaper.projectName,
    date: orderAndPaper.date?.toISOString() || null,
    deliveryDate: orderAndPaper.deliveryDate?.toISOString() || null,
    
    // Job details
    jobDetails: {
      jobType: orderAndPaper.jobType,
      quantity: orderAndPaper.quantity,
      paperProvided: orderAndPaper.paperProvided,
      paperName: orderAndPaper.paperName,
    },
    
    // Die details
    dieDetails: {
      dieSelection: orderAndPaper.dieSelection,
      dieCode: orderAndPaper.dieCode,
      dieSize: orderAndPaper.dieSize,
      image: orderAndPaper.image,
    },
    
    // Processing options (only included when selected)
    lpDetails: lpDetails.isLPUsed ? lpDetails : null,
    fsDetails: fsDetails.isFSUsed ? fsDetails : null,
    embDetails: embDetails.isEMBUsed ? embDetails : null,
    digiDetails: digiDetails.isDigiUsed ? digiDetails : null,
    dieCutting: dieCutting.isDieCuttingUsed ? dieCutting : null,
    sandwich: sandwich.isSandwichComponentUsed ? sandwich : null,
    pasting: pasting.isPastingUsed ? pasting : null,
    
    // Calculations
    calculations,
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
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
      const formattedData = mapStateToFirebaseStructure(state, calculations);
      if (isEditMode && onSubmitSuccess) {
        await onSubmitSuccess(formattedData);
        if (onClose) onClose();
      } else {
        await addDoc(collection(db, "estimates"), formattedData);
        
        // Optionally update client with estimate reference
        // This creates a bi-directional relationship
        // You could implement this if needed
        
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

  // Handler for Review and Submit when calculations are ready
  const handleCreateEstimate = (enhancedCalculations) => {
    // For single page mode, we're just submitting the form
    handleSubmit(new Event('submit'));
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
              {/* <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a preview of the cost calculation. The final calculation will be applied when the estimate is created.
                </p>
              </div> */}
              <ReviewAndSubmit 
                state={state} 
                calculations={calculations} 
                isCalculating={isCalculating} 
                onPrevious={() => {}} 
                onCreateEstimate={handleCreateEstimate} 
                isEditMode={isEditMode}
                isSaving={isSubmitting}
                singlePageMode={true}
                previewMode={true} // New prop to indicate preview mode
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