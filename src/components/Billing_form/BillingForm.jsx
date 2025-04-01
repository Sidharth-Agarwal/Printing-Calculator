import React, { useReducer, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { calculateEstimateCosts } from "./calculations";

// Import components
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
  orderAndPaper: {
    clientName: "",
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
  const { orderAndPaper, lpDetails, fsDetails, embDetails, digiDetails, dieCutting, sandwich, pasting } = state;

  return {
    clientName: orderAndPaper.clientName,
    projectName: orderAndPaper.projectName,
    date: orderAndPaper.date?.toISOString() || null,
    deliveryDate: orderAndPaper.deliveryDate?.toISOString() || null,
    jobDetails: {
      jobType: orderAndPaper.jobType,
      quantity: orderAndPaper.quantity,
      paperProvided: orderAndPaper.paperProvided,
      paperName: orderAndPaper.paperName,
    },
    dieDetails: {
      dieSelection: orderAndPaper.dieSelection,
      dieCode: orderAndPaper.dieCode,
      dieSize: orderAndPaper.dieSize,
      image: orderAndPaper.image,
    },
    lpDetails: lpDetails.isLPUsed ? lpDetails : null,
    fsDetails: fsDetails.isFSUsed ? fsDetails : null,
    embDetails: embDetails.isEMBUsed ? embDetails : null,
    digiDetails: digiDetails.isDigiUsed ? digiDetails : null,
    dieCutting: dieCutting.isDieCuttingUsed ? dieCutting : null,
    sandwich: sandwich.isSandwichComponentUsed ? sandwich : null,
    pasting: pasting.isPastingUsed ? pasting : null,
    calculations,
  };
};

// FormSection component - this is the component that wasn't working properly before
const FormSection = ({ title, children, id, activeSection, setActiveSection }) => {
  const isActive = activeSection === id;
  
  const toggleSection = () => {
    setActiveSection(isActive ? null : id);
  };
  
  return (
    <div className="mb-6 border rounded-lg overflow-hidden shadow-sm">
      <div 
        className={`p-3 flex justify-between items-center cursor-pointer ${isActive ? 'bg-blue-50' : 'bg-gray-50'}`}
        onClick={toggleSection}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-gray-500 text-xl">
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

  const formRef = useRef(null);

  // Initialize form with data if in edit mode
  useEffect(() => {
    if (initialState && isEditMode) {
      dispatch({ type: "INITIALIZE_FORM", payload: initialState });
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
    // Check if order and paper fields are filled
    const { clientName, projectName, quantity, paperName, dieCode, dieSize } = state.orderAndPaper;
    if (!clientName || !projectName || !quantity || !paperName || !dieCode || 
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
    const { orderAndPaper } = state;
    
    // Validate Order & Paper section
    if (!orderAndPaper.clientName) errors.clientName = "Client name is required";
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
        alert("Estimate created successfully!");
        dispatch({ type: "RESET_FORM" });
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

  return (
    <div className="bg-white rounded-lg">
      <div className="max-w-screen-xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">
          {isEditMode ? "EDIT ESTIMATE" : "CREATE NEW BILL"}
        </h1>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Order & Paper Section - Always visible */}
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">ORDER & PAPER DETAILS</h2>
            <OrderAndPaper 
              state={state} 
              dispatch={dispatch} 
              onNext={() => {}} 
              validationErrors={validationErrors}
              singlePageMode={true}
            />
          </div>

          {/* Processing Options in Collapsible Sections */}
          <div>
            <FormSection 
              title="LETTER PRESS (LP) DETAILS" 
              id="lp"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
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
              title="FOIL STAMPING (FS) DETAILS" 
              id="fs"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
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
              title="EMBOSSING (EMB) DETAILS" 
              id="emb"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
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
              title="DIGITAL PRINTING DETAILS" 
              id="digi"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
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
              title="DIE CUTTING DETAILS" 
              id="dieCutting"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
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
              title="SANDWICH DETAILS" 
              id="sandwich"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
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
              title="PASTING DETAILS" 
              id="pasting"
              activeSection={activeSection}
              setActiveSection={setActiveSection}
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

          {/* Cost Calculation & Review Section - Always visible */}
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm mt-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">COST CALCULATION & REVIEW</h2>
            <ReviewAndSubmit 
              state={state} 
              calculations={calculations} 
              isCalculating={isCalculating} 
              onPrevious={() => {}} 
              onCreateEstimate={handleCreateEstimate} 
              isEditMode={isEditMode}
              isSaving={isSubmitting}
              singlePageMode={true}
            />
          </div>

          <div className="flex justify-end mt-8 border-t pt-6">
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
        </form>
      </div>
    </div>
  );
};

export default BillingForm;