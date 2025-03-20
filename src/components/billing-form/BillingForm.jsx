import React, { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { calculateEstimateCosts } from "./calculations";

// Import section components
import OrderAndPaper from "./sections/OrderAndPaper";
import LPDetailsSection from "./sections/LPDetailsSection";
import FSDetailsSection from "./sections/FSDetailsSection";
import EMBDetailsSection from "./sections/EMBDetailsSection";
import DigiDetailsSection from "./sections/DigiDetailsSection";
import DieCuttingSection from "./sections/DieCuttingSection";
import SandwichSection from "./sections/SandwichSection";
import PastingSection from "./sections/PastingSection";
import ReviewSection from "./sections/ReviewSection";

// Import container components
import AccordionSection from "./containers/AccordionSection";

// Initial state for all form sections
const initialFormState = {
  orderAndPaper: {
    clientName: "",
    projectName: "",
    date: new Date(),
    deliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)),
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
    // You can add additional fields to the calculations data here
    // For example:
    // additionalInfo: {
    //   createdAt: new Date().toISOString(),
    //   updatedBy: "user123",
    //   version: "1.0",
    // }
  };
};

const BillingForm = ({ initialState = null, isEditMode = false, onSubmitSuccess = null, onClose = null }) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState || initialFormState);
  const [calculations, setCalculations] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize form with data if in edit mode
  useEffect(() => {
    if (initialState && isEditMode) {
      dispatch({ type: "INITIALIZE_FORM", payload: initialState });
    }
  }, [initialState, isEditMode]);

  // Calculate costs when relevant form fields change
  useEffect(() => {
    const performCalculations = async () => {
      // Only calculate if key fields have values
      if (state.orderAndPaper.quantity && 
          state.orderAndPaper.paperName && 
          state.orderAndPaper.dieSize.length && 
          state.orderAndPaper.dieSize.breadth) {
        
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
      }
    };

    // Use a debounce to prevent too many calculations
    const debounceTimer = setTimeout(() => {
      performCalculations();
    }, 800);

    return () => clearTimeout(debounceTimer);
  }, [
    state.orderAndPaper.quantity,
    state.orderAndPaper.paperName,
    state.orderAndPaper.dieSize,
    state.lpDetails.isLPUsed,
    state.fsDetails.isFSUsed,
    state.embDetails.isEMBUsed,
    state.digiDetails.isDigiUsed,
    state.dieCutting.isDieCuttingUsed,
    state.sandwich.isSandwichComponentUsed,
    state.pasting.isPastingUsed
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Final calculation to ensure latest data
      const result = await calculateEstimateCosts(state);
      
      // Add any additional calculations fields or metadata here
      const enhancedCalculations = {
        ...(result || calculations),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add any other fields you need
      };
      
      const formattedData = mapStateToFirebaseStructure(state, enhancedCalculations);
      
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
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg mb-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-w-screen-xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-700 mb-6">
            {isEditMode ? "EDIT ESTIMATE" : "CREATE NEW BILL"}
          </h1>
          
          {/* Mobile Section Navigation */}
          <div className="md:hidden flex flex-wrap gap-2 mb-6">
            <button type="button" onClick={() => document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">Order</button>
            <button type="button" onClick={() => document.getElementById('lp-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">LP</button>
            <button type="button" onClick={() => document.getElementById('fs-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">FS</button>
            <button type="button" onClick={() => document.getElementById('emb-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">EMB</button>
            <button type="button" onClick={() => document.getElementById('digi-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">Digital</button>
            <button type="button" onClick={() => document.getElementById('die-cutting-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">Die Cutting</button>
            <button type="button" onClick={() => document.getElementById('sandwich-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">Sandwich</button>
            <button type="button" onClick={() => document.getElementById('pasting-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">Pasting</button>
            <button type="button" onClick={() => document.getElementById('review-section').scrollIntoView({ behavior: 'smooth' })} className="px-2 py-1 text-xs bg-gray-200 rounded">Review</button>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            <AccordionSection id="order-section" title="ORDER & PAPER DETAILS" defaultOpen={true}>
              <OrderAndPaper state={state} dispatch={dispatch} />
            </AccordionSection>
            
            <AccordionSection id="lp-section" title="LETTER PRESS (LP) DETAILS">
              <LPDetailsSection state={state} dispatch={dispatch} />
            </AccordionSection>
            
            <AccordionSection id="fs-section" title="FOIL STAMPING (FS) DETAILS">
              <FSDetailsSection state={state} dispatch={dispatch} />
            </AccordionSection>
            
            <AccordionSection id="emb-section" title="EMBOSSING (EMB) DETAILS">
              <EMBDetailsSection state={state} dispatch={dispatch} />
            </AccordionSection>
            
            <AccordionSection id="digi-section" title="DIGITAL PRINTING DETAILS">
              <DigiDetailsSection state={state} dispatch={dispatch} />
            </AccordionSection>
            
            <AccordionSection id="die-cutting-section" title="DIE CUTTING">
              <DieCuttingSection state={state} dispatch={dispatch} />
            </AccordionSection>
            
            <AccordionSection id="sandwich-section" title="SANDWICH DETAILS">
              <SandwichSection state={state} dispatch={dispatch} />
            </AccordionSection>
            
            <AccordionSection id="pasting-section" title="PASTING">
              <PastingSection state={state} dispatch={dispatch} />
            </AccordionSection>
            
            <AccordionSection id="review-section" title="REVIEW AND SUBMIT" defaultOpen={true}>
              <ReviewSection 
                state={state} 
                calculations={calculations} 
                isCalculating={isCalculating}
                isEditMode={isEditMode}
              />
            </AccordionSection>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSaving || isCalculating}
              className={`px-6 py-2 rounded-md flex items-center justify-center min-w-[120px] ${
                isSaving || isCalculating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white transition-colors duration-200`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : isCalculating ? (
                'Calculating...'
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Estimate'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BillingForm;