// BillingFormSinglePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

import { BillingFormProvider, useBillingForm } from "../../context/BillingFormContext";
import useAccordion from "../../hooks/useAccordion";
import useCalculation from "../../hooks/useCalculation";
import { FORM_SECTIONS } from "../../constants/sectionConfig";

import AccordionSection from "./containers/AccordionSection"
import OrderAndPaperSection from "./sections/OrderAndPaperSection";
import LPDetailsSection from "./sections/LPDetailsSection";
import FSDetailsSection from "./sections/FSDetailsSection";
import EMBDetailsSection from "./sections/EMBDetailsSection";
import DigiDetailsSection from "./sections/DigiDetailsSection";
import DieCuttingSection from "./sections/DieCuttingSection";
import SandwichSection from "./sections/SandwichSection";
import PastingSection from "./sections/PastingSection";
// import CostSummarySection from "./sections/CostSummarySection";

// Map state to Firebase structure for submission
const mapStateToFirebaseStructure = (state) => {
  const { orderAndPaper, lpDetails, fsDetails, embDetails, digiDetails, dieCutting, sandwich, pasting, calculations } = state;

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

// Inner component that uses the context
const BillingFormContent = ({ initialState, isEditMode, onSubmitSuccess, onClose }) => {
  const navigate = useNavigate();
  const { state, dispatch } = useBillingForm();
  const { openSections, toggleSection } = useAccordion();
  const { performCalculations, isCalculating, calculationError } = useCalculation();
  const [isSaving, setIsSaving] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);

  // Initialize form with data if in edit mode
  useEffect(() => {
    if (initialState && isEditMode) {
      dispatch({ type: "INITIALIZE_FORM", payload: initialState });
    }
  }, [initialState, isEditMode, dispatch]);

  // Auto-calculate when form state changes
  useEffect(() => {
    const autoCalculate = async () => {
      dispatch({ type: "SET_CALCULATING", payload: true });
      try {
        const result = await performCalculations();
        if (result?.error) {
          dispatch({ type: "SET_CALCULATION_ERROR", payload: result.error });
        } else {
          dispatch({ type: "UPDATE_CALCULATIONS", payload: result });
          dispatch({ type: "SET_CALCULATION_ERROR", payload: null });
        }
      } catch (error) {
        dispatch({ type: "SET_CALCULATION_ERROR", payload: error.message });
      } finally {
        dispatch({ type: "SET_CALCULATING", payload: false });
      }
    };

    // Debounced calculation to avoid excessive recalculations
    const timer = setTimeout(() => {
      autoCalculate();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    state.orderAndPaper,
    state.lpDetails,
    state.fsDetails,
    state.embDetails,
    state.digiDetails,
    state.dieCutting,
    state.sandwich,
    state.pasting,
    performCalculations,
    dispatch
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formattedData = mapStateToFirebaseStructure(state);
      
      if (isEditMode && onSubmitSuccess) {
        await onSubmitSuccess(formattedData);
        if (onClose) onClose();
      } else {
        await addDoc(collection(db, "estimates"), formattedData);
        alert("Estimate created successfully!");
        dispatch({ type: "RESET_FORM" });
        navigate('/material-stock/estimates-db');
      }
    } catch (error) {
      console.error("Error handling estimate:", error);
      alert("Failed to handle estimate.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get section component by ID
  const getSectionComponent = (sectionId) => {
    switch (sectionId) {
      case 'orderAndPaper':
        return <OrderAndPaperSection />;
      case 'lpDetails':
        return <LPDetailsSection />;
      case 'fsDetails':
        return <FSDetailsSection />;
      case 'embDetails':
        return <EMBDetailsSection />;
      case 'digiDetails':
        return <DigiDetailsSection />;
      case 'dieCutting':
        return <DieCuttingSection />;
      case 'sandwich':
        return <SandwichSection />;
      case 'pasting':
        return <PastingSection />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="max-w-screen-xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">
          {isEditMode ? "EDIT ESTIMATE" : "CREATE NEW ESTIMATE"}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Always visible cost summary section */}
          {/* <CostSummarySection 
            calculations={state.calculations} 
            isCalculating={state.isCalculating}
            calculationError={state.calculationError}
            markupPercentage={markupPercentage}
            setMarkupPercentage={setMarkupPercentage}
          /> */}

          {/* Form sections as accordions */}
          <div className="space-y-4 mt-6">
            {FORM_SECTIONS.map((section) => (
              <AccordionSection
                key={section.id}
                id={section.id}
                title={section.title}
                defaultOpen={section.defaultOpen}
              >
                {getSectionComponent(section.id)}
              </AccordionSection>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || state.isCalculating}
              className={`px-6 py-2 rounded-md flex items-center justify-center min-w-[120px] ${
                isSaving || state.isCalculating
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
              ) : state.isCalculating ? (
                'Calculating...'
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Estimate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Wrapper component that provides context
const BillingFormSinglePage = (props) => {
  return (
    <BillingFormProvider initialState={props.initialState}>
      <BillingFormContent {...props} />
    </BillingFormProvider>
  );
};

export default BillingFormSinglePage;