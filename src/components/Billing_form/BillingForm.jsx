import React, { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderAndPaper from "./OrderAndPaper";
import LPDetails from "./LPDetails";
import FSDetails from "./FSDetails";
import EMBDetails from "./EMBDetails";
import DigiDetails from "./DigiDetails";
import DieCutting from "./DieCutting";
import Sandwich from "./Sandwich";
import Pasting from "./Pasting";
import ReviewAndSubmit from "./ReviewAndSubmit";
import { calculateEstimateCosts } from "./calculations";
import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// Initial state for all steps
const initialFormState = {
  currentStep: 1,
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
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "RESET_FORM":
      return initialFormState;
    case "INITIALIZE_FORM":
      return { ...action.payload, currentStep: 1 };
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

const BillingForm = ({ initialState = null, isEditMode = false, onSubmitSuccess = null, onClose = null }) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState || initialFormState);
  const [calculations, setCalculations] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize form with data if in edit mode
  useEffect(() => {
    if (initialState && isEditMode) {
      dispatch({ type: "INITIALIZE_FORM", payload: initialState });
    }
  }, [initialState, isEditMode]);

  // Calculate costs when reaching the review step
  useEffect(() => {
    const performCalculations = async () => {
      if (state.currentStep >= 8) {
        setIsCalculating(true);
        try {
          const result = await calculateEstimateCosts(state);
          if (result.error) {
            console.error("Error during calculations:", result.error);
            alert(result.error);
          } else {
            setCalculations(result);
          }
        } catch (error) {
          console.error("Unexpected error during calculations:", error);
          alert("Unexpected error during calculations. Please try again.");
        } finally {
          setIsCalculating(false);
        }
      }
    };

    performCalculations();
  }, [state.currentStep]);

  const handleNext = () => {
    if (state.currentStep < 9) {
      dispatch({ type: "SET_STEP", payload: state.currentStep + 1 });
    }
  };

  const handlePrevious = () => {
    if (state.currentStep > 1) {
      dispatch({ type: "SET_STEP", payload: state.currentStep - 1 });
    }
  };

  const handleSubmit = async () => {
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
    }
  };

  const steps = [
    <OrderAndPaper state={state} dispatch={dispatch} onNext={handleNext} key="step1" />,
    <LPDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
    <FSDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
    <EMBDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
    <DigiDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
    <DieCutting state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
    <Sandwich state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
    <Pasting state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step8" />,
    <ReviewAndSubmit state={state} calculations={calculations} isCalculating={isCalculating} onPrevious={handlePrevious} onCreateEstimate={handleSubmit} isEditMode={isEditMode} key="step9" />,
  ];

  return (
    <div className="bg-white rounded-lg">
      <div className="max-w-screen-xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">
          {isEditMode ? "EDIT EDTIMATE" : "CREATE NEW BILL"}
        </h1>
        
        {/* Progress Bar */}
        <div className="text-sm text-gray-600 mb-6">
          <p>Step {state.currentStep} of {steps.length}</p>
          <div className="h-2 bg-gray-200 rounded-full mt-1">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(state.currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-lg">
          {steps[state.currentStep - 1]}
        </div>
      </div>
    </div>
  );
};

export default BillingForm;