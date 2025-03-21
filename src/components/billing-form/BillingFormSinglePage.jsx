// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";

// import { BillingFormProvider, useBillingForm } from "../../context/BillingFormContext";
// import useAccordion from "../../hooks/useAccordion";
// import useCalculation from "../../hooks/useCalculation";
// import { FORM_SECTIONS } from "../../constants/sectionConfig";

// import AccordionSection from "./containers/AccordionSection"
// import OrderAndPaperSection from "./sections/OrderAndPaperSection";
// import LPDetailsSection from "./sections/LPDetailsSection";
// import FSDetailsSection from "./sections/FSDetailsSection";
// import EMBDetailsSection from "./sections/EMBDetailsSection";
// import DigiDetailsSection from "./sections/DigiDetailsSection";
// import DieCuttingSection from "./sections/DieCuttingSection";
// import SandwichSection from "./sections/SandwichSection";
// import PastingSection from "./sections/PastingSection";
// import CostSummarySection from "./sections/CostSummarySection";

// // Map state to Firebase structure for submission
// const mapStateToFirebaseStructure = (state) => {
//   const { orderAndPaper, lpDetails, fsDetails, embDetails, digiDetails, dieCutting, sandwich, pasting, calculations } = state;

//   return {
//     clientName: orderAndPaper.clientName,
//     projectName: orderAndPaper.projectName,
//     date: orderAndPaper.date?.toISOString() || null,
//     deliveryDate: orderAndPaper.deliveryDate?.toISOString() || null,
//     jobDetails: {
//       jobType: orderAndPaper.jobType,
//       quantity: orderAndPaper.quantity,
//       paperProvided: orderAndPaper.paperProvided,
//       paperName: orderAndPaper.paperName,
//     },
//     dieDetails: {
//       dieSelection: orderAndPaper.dieSelection,
//       dieCode: orderAndPaper.dieCode,
//       dieSize: orderAndPaper.dieSize,
//       image: orderAndPaper.image,
//     },
//     lpDetails: lpDetails.isLPUsed ? lpDetails : null,
//     fsDetails: fsDetails.isFSUsed ? fsDetails : null,
//     embDetails: embDetails.isEMBUsed ? embDetails : null,
//     digiDetails: digiDetails.isDigiUsed ? digiDetails : null,
//     dieCutting: dieCutting.isDieCuttingUsed ? dieCutting : null,
//     sandwich: sandwich.isSandwichComponentUsed ? sandwich : null,
//     pasting: pasting.isPastingUsed ? pasting : null,
//     calculations,
//   };
// };

// // Inner component that uses the context
// const BillingFormContent = ({ initialState, isEditMode, onSubmitSuccess, onClose }) => {
//   const navigate = useNavigate();
//   const { state, dispatch } = useBillingForm();
//   const { openSections, toggleSection } = useAccordion();
//   const { performCalculations, isCalculating, calculationError } = useCalculation();
//   const [isSaving, setIsSaving] = useState(false);
//   const [markupPercentage, setMarkupPercentage] = useState(0);
//   const [shouldAutoCalculate, setShouldAutoCalculate] = useState(false);
  
//   // Refs to track manual calculation and prevent infinite loops
//   const isInitialRender = useRef(true);
//   const lastCalculationTime = useRef(0);
//   const calculationTimeout = useRef(null);

//   // Initialize form with data if in edit mode
//   useEffect(() => {
//     if (initialState && isEditMode) {
//       dispatch({ type: "INITIALIZE_FORM", payload: initialState });
//     }
//   }, [initialState, isEditMode, dispatch]);

//   // Function to manually trigger calculations
//   const handleManualCalculate = useCallback(async () => {
//     // Clear any pending auto-calculations
//     if (calculationTimeout.current) {
//       clearTimeout(calculationTimeout.current);
//     }
    
//     dispatch({ type: "SET_CALCULATING", payload: true });
    
//     try {
//       // Perform calculation
//       const result = await performCalculations();
      
//       // Update state with results
//       if (result?.error) {
//         dispatch({ type: "SET_CALCULATION_ERROR", payload: result.error });
//       } else {
//         dispatch({ type: "UPDATE_CALCULATIONS", payload: result });
//         dispatch({ type: "SET_CALCULATION_ERROR", payload: null });
//       }
      
//       // Record calculation time
//       lastCalculationTime.current = Date.now();
//     } catch (error) {
//       console.error("Calculation error:", error);
//       dispatch({ type: "SET_CALCULATION_ERROR", payload: error.message || "Calculation failed" });
//     } finally {
//       dispatch({ type: "SET_CALCULATING", payload: false });
//     }
//   }, [dispatch, performCalculations]);

//   // Auto-calculate with throttling to prevent infinite loops
//   useEffect(() => {
//     // Skip on initial render
//     if (isInitialRender.current) {
//       isInitialRender.current = false;
//       return;
//     }
    
//     // Skip if auto-calculate is disabled
//     if (!shouldAutoCalculate) {
//       return;
//     }
    
//     // Clear any pending calculation
//     if (calculationTimeout.current) {
//       clearTimeout(calculationTimeout.current);
//     }
    
//     // Debounce calculation with longer timeout
//     calculationTimeout.current = setTimeout(() => {
//       // Check if enough time has passed since last calculation
//       const currentTime = Date.now();
//       const timeSinceLastCalculation = currentTime - lastCalculationTime.current;
      
//       // Only calculate if it's been at least 2 seconds since last calculation
//       if (timeSinceLastCalculation > 2000) {
//         handleManualCalculate();
//       }
//     }, 1000); // 1 second debounce
    
//     return () => {
//       if (calculationTimeout.current) {
//         clearTimeout(calculationTimeout.current);
//       }
//     };
//   }, [
//     state.orderAndPaper,
//     state.lpDetails,
//     state.fsDetails,
//     state.embDetails,
//     state.digiDetails,
//     state.dieCutting,
//     state.sandwich,
//     state.pasting,
//     handleManualCalculate,
//     shouldAutoCalculate
//   ]);

//   // Safety timeout to prevent infinite calculating state
//   useEffect(() => {
//     if (state.isCalculating) {
//       const safetyTimer = setTimeout(() => {
//         if (state.isCalculating) {
//           console.warn("Calculation safety timeout triggered");
//           dispatch({ type: "SET_CALCULATING", payload: false });
//           dispatch({ type: "SET_CALCULATION_ERROR", payload: "Calculation timed out. Please try again." });
//         }
//       }, 15000); // 15 second max calculation time
      
//       return () => clearTimeout(safetyTimer);
//     }
//   }, [state.isCalculating, dispatch]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Run calculation one more time before saving
//     if (!state.calculations) {
//       await handleManualCalculate();
//     }
    
//     setIsSaving(true);

//     try {
//       const formattedData = mapStateToFirebaseStructure(state);
      
//       if (isEditMode && onSubmitSuccess) {
//         await onSubmitSuccess(formattedData);
//         if (onClose) onClose();
//       } else {
//         await addDoc(collection(db, "estimates"), formattedData);
//         alert("Estimate created successfully!");
//         dispatch({ type: "RESET_FORM" });
//         navigate('/material-stock/estimates-db');
//       }
//     } catch (error) {
//       console.error("Error handling estimate:", error);
//       alert("Failed to handle estimate.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Get section component by ID
//   const getSectionComponent = (sectionId) => {
//     switch (sectionId) {
//       case 'orderAndPaper':
//         return <OrderAndPaperSection />;
//       case 'lpDetails':
//         return <LPDetailsSection />;
//       case 'fsDetails':
//         return <FSDetailsSection />;
//       case 'embDetails':
//         return <EMBDetailsSection />;
//       case 'digiDetails':
//         return <DigiDetailsSection />;
//       case 'dieCutting':
//         return <DieCuttingSection />;
//       case 'sandwich':
//         return <SandwichSection />;
//       case 'pasting':
//         return <PastingSection />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg">
//       <div className="max-w-screen-xl mx-auto p-4">
//         <h1 className="text-2xl font-bold text-gray-700 mb-4">
//           {isEditMode ? "EDIT ESTIMATE" : "CREATE NEW ESTIMATE"}
//         </h1>

//         <form onSubmit={handleSubmit}>
//           {/* Always visible cost summary section */}
//           <CostSummarySection 
//             calculations={state.calculations} 
//             isCalculating={state.isCalculating}
//             calculationError={state.calculationError}
//             markupPercentage={markupPercentage}
//             setMarkupPercentage={setMarkupPercentage}
//           />

//           {/* Auto-Calculate Toggle */}
//           <div className="flex items-center justify-end mb-4 space-x-4">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="autoCalculate"
//                 checked={shouldAutoCalculate}
//                 onChange={() => setShouldAutoCalculate(!shouldAutoCalculate)}
//                 className="mr-2 h-4 w-4"
//               />
//               <label htmlFor="autoCalculate" className="text-sm text-gray-600">
//                 Auto Calculate
//               </label>
//             </div>
            
//             {/* Manual Calculate Button */}
//             <button
//               type="button"
//               onClick={handleManualCalculate}
//               disabled={state.isCalculating}
//               className={`px-4 py-1 rounded-md ${
//                 state.isCalculating
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-blue-500 hover:bg-blue-600'
//               } text-white transition-colors duration-200 text-sm`}
//             >
//               {state.isCalculating ? "Calculating..." : "Calculate"}
//             </button>
//           </div>

//           {/* Form sections as accordions */}
//           <div className="space-y-4 mt-6">
//             {FORM_SECTIONS.map((section) => (
//               <AccordionSection
//                 key={section.id}
//                 id={section.id}
//                 title={section.title}
//                 defaultOpen={section.defaultOpen}
//               >
//                 {getSectionComponent(section.id)}
//               </AccordionSection>
//             ))}
//           </div>

//           {/* Error display */}
//           {calculationError && (
//             <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
//               <p className="font-medium">Calculation Error:</p>
//               <p>{calculationError}</p>
//             </div>
//           )}

//           {/* Submit Button */}
//           <div className="mt-6 flex justify-end">
//             <button
//               type="submit"
//               disabled={isSaving || state.isCalculating}
//               className={`px-6 py-2 rounded-md flex items-center justify-center min-w-[120px] ${
//                 isSaving || state.isCalculating
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-green-500 hover:bg-green-600'
//               } text-white transition-colors duration-200`}
//             >
//               {isSaving ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Saving...
//                 </>
//               ) : state.isCalculating ? (
//                 'Calculating...'
//               ) : isEditMode ? (
//                 'Save Changes'
//               ) : (
//                 'Create Estimate'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Wrapper component that provides context
// const BillingFormSinglePage = (props) => {
//   return (
//     <BillingFormProvider initialState={props.initialState}>
//       <BillingFormContent {...props} />
//     </BillingFormProvider>
//   );
// };

// export default BillingFormSinglePage;

// BillingFormSinglePage.jsx
import React, { useEffect, useState, useRef } from "react";
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
import CostSummarySection from "./sections/CostSummarySection";

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
  const { openSections } = useAccordion();
  const { performCalculations } = useCalculation();
  const [isSaving, setIsSaving] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [manualCalculationMode, setManualCalculationMode] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  
  // Reference to track if component is mounted
  const isMountedRef = useRef(true);
  // Reference to track calculation timeout
  const calculationTimeoutRef = useRef(null);

  // Initialize form with data if in edit mode
  useEffect(() => {
    if (initialState && isEditMode) {
      dispatch({ type: "INITIALIZE_FORM", payload: initialState });
    }
    
    // Cleanup function for component unmount
    return () => {
      isMountedRef.current = false;
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [initialState, isEditMode, dispatch]);

  // Manual calculation function
  const handleCalculate = async () => {
    // Clear any existing calculation timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
      calculationTimeoutRef.current = null;
    }
    
    // Set calculating state
    setIsCalculating(true);
    setCalculationError(null);
    
    try {
      // Perform calculation
      const result = await performCalculations();
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        if (result?.error) {
          setCalculationError(result.error);
        } else {
          // Update calculations in state
          dispatch({ type: "UPDATE_CALCULATIONS", payload: result });
        }
      }
    } catch (error) {
      console.error("Calculation error:", error);
      if (isMountedRef.current) {
        setCalculationError(error.message || "An error occurred during calculation");
      }
    } finally {
      // Reset calculating state if component is still mounted
      if (isMountedRef.current) {
        setIsCalculating(false);
      }
    }
  };

  // Safety timeout for calculation
  useEffect(() => {
    if (isCalculating) {
      const safetyTimer = setTimeout(() => {
        if (isMountedRef.current && isCalculating) {
          console.warn("Calculation safety timeout triggered");
          setIsCalculating(false);
          setCalculationError("Calculation timed out. Please try again.");
        }
      }, 15000); // 15 second max calculation time
      
      return () => clearTimeout(safetyTimer);
    }
  }, [isCalculating]);

  // Handler for state changes (only for auto-calculation mode)
  useEffect(() => {
    // Skip auto-calculation if in manual mode
    if (manualCalculationMode) return;
    
    // Cancel previous timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }
    
    // Set a new timeout for debounced calculation
    calculationTimeoutRef.current = setTimeout(() => {
      handleCalculate();
    }, 1500); // 1.5 second delay
    
    // Cleanup function
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [
    manualCalculationMode,
    state.orderAndPaper,
    state.lpDetails,
    state.fsDetails,
    state.embDetails,
    state.digiDetails,
    state.dieCutting,
    state.sandwich,
    state.pasting
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run calculation one more time before saving
    if (!state.calculations) {
      await handleCalculate();
    }
    
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
          <CostSummarySection 
            calculations={state.calculations} 
            isCalculating={isCalculating}
            calculationError={calculationError}
            markupPercentage={markupPercentage}
            setMarkupPercentage={setMarkupPercentage}
          />

          {/* Calculation Controls */}
          <div className="flex items-center justify-end mb-4 space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoCalculate"
                checked={!manualCalculationMode}
                onChange={() => setManualCalculationMode(!manualCalculationMode)}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="autoCalculate" className="text-sm text-gray-600">
                Auto Calculate
              </label>
            </div>
            
            {/* Manual Calculate Button */}
            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className={`px-4 py-1 rounded-md ${
                isCalculating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-colors duration-200 text-sm`}
            >
              {isCalculating ? "Calculating..." : "Calculate"}
            </button>
          </div>

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
          {calculationError && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
              <p className="font-medium">Calculation Error:</p>
              <p>{calculationError}</p>
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