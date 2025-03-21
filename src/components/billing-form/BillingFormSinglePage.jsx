// components/billing-form/BillingFormSinglePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { BillingFormProvider, useBillingForm } from "../../context/BillingFormContext";
import useAccordion from "../../hooks/useAccordion";
import useFormActions from "../../hooks/useFormAction";
import useCalculation from "../../hooks/useCalculation";
import { FORM_SECTIONS } from "../../constants/sectionConfig";

import AccordionSection from "./containers/AccordionSection";
import OrderAndPaperSection from "./sections/OrderAndPaperSection";
import LPDetailsSection from "./sections/LPDetailsSection";
import FSDetailsSection from "./sections/FSDetailsSection";
import EMBDetailsSection from "./sections/EMBDetailsSection";
import DigiDetailsSection from "./sections/DigiDetailsSection";
import DieCuttingSection from "./sections/DieCuttingSection";
import SandwichSection from "./sections/SandwichSection";
import PastingSection from "./sections/PastingSection";
import CostSummarySection from "./sections/CostSummarySection";
import CalculationControl from "./utils/CalculationControl";

// Inner component that uses the context
const BillingFormContent = ({ initialState, isEditMode, onSubmitSuccess, onClose }) => {
  const navigate = useNavigate();
  const { state } = useBillingForm();
  const { openSections } = useAccordion();
  const { 
    isSaving, 
    submitError, 
    submitForm, 
    resetForm, 
    initializeForm 
  } = useFormActions();
  
  const {
    calculateCosts,
    scheduleCalculation,
    cancelScheduledCalculation,
    isCalculating,
    calculationError,
    lastCalculatedAt
  } = useCalculation();
  
  // Local state
  const [autoCalculate, setAutoCalculate] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  
  // References
  const formInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // Initialize the form with data when in edit mode
  useEffect(() => {
    if (initialState && isEditMode && !formInitializedRef.current) {
      initializeForm(initialState);
      formInitializedRef.current = true;
    }
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      cancelScheduledCalculation();
    };
  }, [initialState, isEditMode, initializeForm, cancelScheduledCalculation]);
  
  // Handle auto calculation
  useEffect(() => {
    if (!autoCalculate) return;
    
    // Add a delay before scheduling to prevent excessive calculations
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        const cancelFn = scheduleCalculation(1000);
        return cancelFn;
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [
    autoCalculate,
    scheduleCalculation,
    state.orderAndPaper,
    state.lpDetails,
    state.fsDetails,
    state.embDetails,
    state.digiDetails,
    state.dieCutting,
    state.sandwich,
    state.pasting
  ]);
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run calculation before submitting if no calculations exist
    if (!state.calculations) {
      await calculateCosts();
    }
    
    try {
      // Submit the form
      if (isEditMode && onSubmitSuccess) {
        await onSubmitSuccess(state);
        if (onClose) onClose();
      } else {
        await submitForm(
          // Success callback
          (id) => {
            alert("Estimate created successfully!");
            resetForm();
            navigate('/material-stock/estimates-db');
          },
          // Error callback
          (error) => {
            alert("Failed to create estimate. Please try again.");
          }
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  
  // Get section component by ID
  const getSectionComponent = (sectionId) => {
    switch (sectionId) {
      case 'orderAndPaper': return <OrderAndPaperSection />;
      case 'lpDetails': return <LPDetailsSection />;
      case 'fsDetails': return <FSDetailsSection />;
      case 'embDetails': return <EMBDetailsSection />;
      case 'digiDetails': return <DigiDetailsSection />;
      case 'dieCutting': return <DieCuttingSection />;
      case 'sandwich': return <SandwichSection />;
      case 'pasting': return <PastingSection />;
      default: return null;
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
          <CostSummarySection 
            calculations={state.calculations} 
            isCalculating={isCalculating}
            calculationError={calculationError}
            markupPercentage={markupPercentage}
            setMarkupPercentage={setMarkupPercentage}
          />

          {/* Calculation Controls */}
          <CalculationControl 
            isCalculating={isCalculating}
            onCalculate={calculateCosts}
            autoCalculate={autoCalculate}
            setAutoCalculate={setAutoCalculate}
            calculationError={calculationError}
            lastCalculatedAt={lastCalculatedAt}
          />

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

          {/* Error display */}
          {(calculationError || submitError) && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
              <p className="font-medium">Error:</p>
              <p>{calculationError || submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
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