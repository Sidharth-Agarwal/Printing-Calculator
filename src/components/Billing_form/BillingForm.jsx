// import React, { useReducer, useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { collection, addDoc, doc, getDoc } from "firebase/firestore";
// import { db } from "../../firebaseConfig";
// import { calculateEstimateCosts } from "./calculations";
// import { formReducer, initialFormState, formStateToEstimate } from "../../models/formStateModel";
// import { ESTIMATE_STATUS } from "../../constants/statusConstants";
// import { createEstimate, createEstimateVersion, getEstimateById } from "../../utils/estimateVersionUtils";

// // Import components
// import ClientInfo from "./ClientInfo"; // New component
// import VersionInfo from "./VersionInfo"
// import OrderAndPaper from "./OrderAndPaper";
// import LPDetails from "./LPDetails";
// import FSDetails from "./FSDetails";
// import EMBDetails from "./EMBDetails";
// import DigiDetails from "./DigiDetails";
// import DieCutting from "./DieCutting";
// import Sandwich from "./Sandwich";
// import Pasting from "./Pasting";
// import ReviewAndSubmit from "./ReviewAndSubmit";
// import VersionHistoryModal from "./VersionHistoryModal"; // New component

// const BillingForm = ({ 
//   initialState = null, 
//   isEditMode = false, 
//   onSubmitSuccess = null, 
//   onClose = null, 
//   estimateId = null 
// }) => {
//   const navigate = useNavigate();
//   const [state, dispatch] = useReducer(formReducer, initialFormState);
//   const [calculations, setCalculations] = useState(null);
//   const [isCalculating, setIsCalculating] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [activeSection, setActiveSection] = useState(null); // State for tracking active/open section
//   const [validationErrors, setValidationErrors] = useState({});
//   const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
//   // New states for version control
//   const [versionHistory, setVersionHistory] = useState([]);
//   const [showVersionHistory, setShowVersionHistory] = useState(false);
//   const [changeNotes, setChangeNotes] = useState("");
//   const [originalState, setOriginalState] = useState(null); // To track changes
//   const [isModified, setIsModified] = useState(false);

//   const formRef = useRef(null);
//   const userId = "current-user-id"; // Should come from auth context

//   // Initialize form with data if in edit mode or loading existing estimate
//   useEffect(() => {
//     const loadEstimate = async () => {
//       if (estimateId) {
//         try {
//           const estimate = await getEstimateById(estimateId);
//           if (estimate) {
//             // Transform estimate document to form state
//             const formState = {
//               // Client info
//               clientInfo: {
//                 clientId: estimate.clientId || "",
//                 clientCode: estimate.clientCode || "",
//                 clientName: estimate.clientName || "",
//                 contactPerson: estimate.clientContact?.contactPerson || "",
//                 email: estimate.clientContact?.email || "",
//                 phone: estimate.clientContact?.phone || "",
//                 gstin: estimate.clientContact?.gstin || ""
//               },
              
//               // Version info
//               versionInfo: {
//                 estimateNumber: estimate.estimateNumber || "",
//                 version: estimate.version || 1,
//                 baseEstimateId: estimate.baseEstimateId || estimate.id || "",
//                 isNewEstimate: false,
//                 status: estimate.status || ESTIMATE_STATUS.DRAFT
//               },
              
//               // Order and paper
//               orderAndPaper: {
//                 projectName: estimate.projectName || "",
//                 date: estimate.date ? new Date(estimate.date.seconds * 1000) : new Date(),
//                 deliveryDate: estimate.deliveryDate ? new Date(estimate.deliveryDate.seconds * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//                 jobType: estimate.jobDetails?.jobType || "Card",
//                 quantity: estimate.jobDetails?.quantity || "",
//                 paperProvided: estimate.jobDetails?.paperProvided || "Yes",
//                 paperName: estimate.jobDetails?.paperName || "",
//                 dieSelection: estimate.dieDetails?.dieSelection || "",
//                 dieCode: estimate.dieDetails?.dieCode || "",
//                 dieSize: estimate.dieDetails?.dieSize || { length: "", breadth: "" },
//                 image: estimate.dieDetails?.image || "",
//               },
              
//               // Process details
//               lpDetails: estimate.lpDetails || initialFormState.lpDetails,
//               fsDetails: estimate.fsDetails || initialFormState.fsDetails,
//               embDetails: estimate.embDetails || initialFormState.embDetails,
//               digiDetails: estimate.digiDetails || initialFormState.digiDetails,
//               dieCutting: estimate.dieCutting || initialFormState.dieCutting,
//               sandwich: estimate.sandwich || initialFormState.sandwich,
//               pasting: estimate.pasting || initialFormState.pasting,
              
//               // Calculations
//               calculations: estimate.calculations || null
//             };
            
//             dispatch({ type: "INITIALIZE_FORM", payload: formState });
//             setOriginalState(formState); // Store for tracking changes
//             setCalculations(estimate.calculations || null);
            
//             // Load version history if available
//             if (estimate.versionHistory && estimate.versionHistory.length > 0) {
//               setVersionHistory(estimate.versionHistory);
//             }
//           }
//         } catch (error) {
//           console.error("Error loading estimate:", error);
//         }
//       } else if (initialState && isEditMode) {
//         dispatch({ type: "INITIALIZE_FORM", payload: initialState });
//         setOriginalState(initialState);
//       }
//     };
    
//     loadEstimate();
//   }, [initialState, isEditMode, estimateId]);

//   // Calculate costs when form data changes
//   useEffect(() => {
//     const debounceTimer = setTimeout(() => {
//       performCalculations();
//     }, 1000); // 1 second debounce
    
//     // Check if state has been modified
//     if (originalState) {
//       const currentJson = JSON.stringify(state);
//       const originalJson = JSON.stringify(originalState);
//       setIsModified(currentJson !== originalJson);
//     }
    
//     return () => clearTimeout(debounceTimer);
//   }, [state, originalState]);

//   const performCalculations = async () => {
//     // Check if essential fields are filled
//     const { clientInfo, orderAndPaper } = state;
    
//     // Validate client information
//     if (!clientInfo.clientId || !clientInfo.clientName) {
//       return; // Don't calculate if client info is missing
//     }
    
//     // Check if order and paper fields are filled
//     const { projectName, quantity, paperName, dieCode, dieSize } = orderAndPaper;
//     if (!projectName || !quantity || !paperName || !dieCode || 
//         !dieSize.length || !dieSize.breadth) {
//       return; // Don't calculate if essential fields are missing
//     }
    
//     setIsCalculating(true);
//     try {
//       const result = await calculateEstimateCosts(state);
//       if (result.error) {
//         console.error("Error during calculations:", result.error);
//       } else {
//         setCalculations(result);
        
//         // Also update the form state with the calculations
//         dispatch({ type: "UPDATE_CALCULATIONS", payload: result });
//       }
//     } catch (error) {
//       console.error("Unexpected error during calculations:", error);
//     } finally {
//       setIsCalculating(false);
//     }
//   };

//   const validateForm = () => {
//     const errors = {};
//     const { clientInfo, orderAndPaper } = state;
    
//     // Validate Client info section
//     if (!clientInfo.clientId) errors.clientId = "Client selection is required";
//     if (!clientInfo.clientName) errors.clientName = "Client name is required";
    
//     // Validate Order & Paper section
//     if (!orderAndPaper.projectName) errors.projectName = "Project name is required";
//     if (!orderAndPaper.quantity) errors.quantity = "Quantity is required";
//     if (!orderAndPaper.dieCode) errors.dieCode = "Please select a die";
    
//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       // Scroll to the first error
//       const firstError = document.querySelector(".error-message");
//       if (firstError) {
//         firstError.scrollIntoView({ behavior: "smooth", block: "center" });
//       }
//       return;
//     }
    
//     setIsSubmitting(true);
//     try {
//       let result;
      
//       if (isEditMode && state.versionInfo.isNewEstimate === false) {
//         // This is an update to an existing estimate - create a new version
//         result = await createEstimateVersion(
//           estimateId || state.versionInfo.baseEstimateId,
//           state,
//           userId,
//           changeNotes || "Updated estimate"
//         );
        
//         alert("Estimate updated successfully!");
//       } else {
//         // This is a new estimate
//         result = await createEstimate(state, userId);
//         alert("Estimate created successfully!");
//       }
      
//       // Handle callback or navigation
//       if (isEditMode && onSubmitSuccess) {
//         await onSubmitSuccess(result);
//         if (onClose) onClose();
//       } else {
//         // Reset form for new estimates
//         dispatch({ type: "RESET_FORM" });
//         setOriginalState(null);
//         setVersionHistory([]);
        
//         // Navigate to estimates page
//         navigate('/material-stock/estimates-db');
//       }
//     } catch (error) {
//       console.error("Error handling estimate:", error);
//       alert("Failed to handle estimate: " + error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Handler for Review and Submit when calculations are ready
//   const handleCreateEstimate = (enhancedCalculations) => {
//     // For single page mode, we're just submitting the form
//     handleSubmit(new Event('submit'));
//   };

//   // Toggle handlers for each section
//   const toggleLPUsage = () => {
//     // If toggling on, set to default values; if toggling off, clear values
//     const isCurrentlyUsed = state.lpDetails.isLPUsed;
//     dispatch({
//       type: "UPDATE_LP_DETAILS",
//       payload: {
//         isLPUsed: !isCurrentlyUsed,
//         noOfColors: !isCurrentlyUsed ? 1 : 0,
//         colorDetails: !isCurrentlyUsed
//           ? [
//               {
//                 plateSizeType: "Auto",
//                 plateDimensions: { 
//                   length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
//                   breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
//                 },
//                 pantoneType: "",
//                 plateType: "Polymer Plate",
//                 mrType: "Simple"
//               }
//             ]
//           : []
//       }
//     });
    
//     // Auto-expand section when toggled on
//     if (!isCurrentlyUsed) {
//       setActiveSection("lp");
//     }
//   };

//   const toggleFSUsage = () => {
//     const isCurrentlyUsed = state.fsDetails.isFSUsed;
//     dispatch({
//       type: "UPDATE_FS_DETAILS",
//       payload: {
//         isFSUsed: !isCurrentlyUsed,
//         fsType: !isCurrentlyUsed ? "FS1" : "",
//         foilDetails: !isCurrentlyUsed
//           ? [
//               {
//                 blockSizeType: "Auto",
//                 blockDimension: { 
//                   length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
//                   breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
//                 },
//                 foilType: "Gold MTS 220",
//                 blockType: "Magnesium Block 3MM",
//                 mrType: "Simple"
//               }
//             ]
//           : []
//       }
//     });
    
//     if (!isCurrentlyUsed) {
//       setActiveSection("fs");
//     }
//   };

//   const toggleEMBUsage = () => {
//     const isCurrentlyUsed = state.embDetails.isEMBUsed;
//     dispatch({
//       type: "UPDATE_EMB_DETAILS",
//       payload: {
//         isEMBUsed: !isCurrentlyUsed,
//         plateSizeType: !isCurrentlyUsed ? "Auto" : "",
//         plateDimensions: !isCurrentlyUsed
//           ? { 
//               length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
//               breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
//             }
//           : { length: "", breadth: "" },
//         plateTypeMale: !isCurrentlyUsed ? "Polymer Plate" : "",
//         plateTypeFemale: !isCurrentlyUsed ? "Polymer Plate" : "",
//         embMR: !isCurrentlyUsed ? "Simple" : ""
//       }
//     });
    
//     if (!isCurrentlyUsed) {
//       setActiveSection("emb");
//     }
//   };

//   const toggleDigiUsage = () => {
//     const isCurrentlyUsed = state.digiDetails.isDigiUsed;
//     dispatch({
//       type: "UPDATE_DIGI_DETAILS",
//       payload: {
//         isDigiUsed: !isCurrentlyUsed,
//         digiDie: !isCurrentlyUsed ? "" : "",
//         digiDimensions: !isCurrentlyUsed
//           ? { length: "", breadth: "" }
//           : { length: "", breadth: "" }
//       }
//     });
    
//     if (!isCurrentlyUsed) {
//       setActiveSection("digi");
//     }
//   };

//   const toggleDieCuttingUsage = () => {
//     const isCurrentlyUsed = state.dieCutting.isDieCuttingUsed;
//     dispatch({
//       type: "UPDATE_DIE_CUTTING",
//       payload: {
//         isDieCuttingUsed: !isCurrentlyUsed,
//         difficulty: !isCurrentlyUsed ? "No" : "",
//         pdc: !isCurrentlyUsed ? "No" : "",
//         dcMR: !isCurrentlyUsed ? "Simple" : ""
//       }
//     });
    
//     if (!isCurrentlyUsed) {
//       setActiveSection("dieCutting");
//     }
//   };

//   const toggleSandwichUsage = () => {
//     const isCurrentlyUsed = state.sandwich.isSandwichComponentUsed;
//     dispatch({
//       type: "UPDATE_SANDWICH",
//       payload: {
//         isSandwichComponentUsed: !isCurrentlyUsed,
//         lpDetailsSandwich: {
//           isLPUsed: false,
//           noOfColors: 0,
//           colorDetails: []
//         },
//         fsDetailsSandwich: {
//           isFSUsed: false,
//           fsType: "",
//           foilDetails: []
//         },
//         embDetailsSandwich: {
//           isEMBUsed: false,
//           plateSizeType: "",
//           plateDimensions: { length: "", breadth: "" },
//           plateTypeMale: "",
//           plateTypeFemale: "",
//           embMR: ""
//         }
//       }
//     });
    
//     if (!isCurrentlyUsed) {
//       setActiveSection("sandwich");
//     }
//   };

//   const togglePastingUsage = () => {
//     const isCurrentlyUsed = state.pasting.isPastingUsed;
//     dispatch({
//       type: "UPDATE_PASTING",
//       payload: {
//         isPastingUsed: !isCurrentlyUsed,
//         pastingType: !isCurrentlyUsed ? "" : ""
//       }
//     });
    
//     if (!isCurrentlyUsed) {
//       setActiveSection("pasting");
//     }
//   };

//   // Handle reset form
//   const handleResetForm = () => {
//     setShowResetConfirmation(true);
//   };

//   const confirmResetForm = () => {
//     dispatch({ type: "RESET_FORM" });
//     setShowResetConfirmation(false);
//     setActiveSection(null);
//     setValidationErrors({});
//     setCalculations(null);
//     setOriginalState(null);
//     setVersionHistory([]);
    
//     // Scroll to top of form
//     if (formRef.current) {
//       formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   // FormSection component with toggle in header
//   const FormSection = ({ title, children, id, activeSection, setActiveSection, isUsed = false, onToggleUsage }) => {
//     const isActive = activeSection === id;
    
//     const toggleSection = () => {
//       setActiveSection(isActive ? null : id);
//     };
    
//     return (
//       <div className="mb-6 border rounded-lg overflow-hidden shadow-sm">
//         <div 
//           className={`p-3 flex justify-between items-center ${isActive ? 'bg-blue-50' : 'bg-gray-50'}`}
//         >
//           <div className="flex items-center space-x-4">
//             {/* Toggle switch in section header */}
//             <div 
//               className="flex items-center space-x-2 cursor-pointer"
//               onClick={(e) => {
//                 e.stopPropagation(); // Prevent section expansion when clicking toggle
//                 onToggleUsage();
//               }}
//             >
//               <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//                 {isUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
//               </div>
//               <span className="text-sm font-medium text-gray-600">Use</span>
//             </div>
            
//             {/* Section title */}
//             <h2 
//               className="text-lg font-semibold cursor-pointer"
//               onClick={toggleSection}
//             >
//               {title}
//             </h2>
//           </div>
          
//           {/* Expand/collapse button */}
//           <span 
//             className="text-gray-500 text-xl cursor-pointer"
//             onClick={toggleSection}
//           >
//             {isActive ? '−' : '+'}
//           </span>
//         </div>
//         <div className={`transition-all duration-300 ${isActive ? 'block p-4' : 'hidden'}`}>
//           {children}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="bg-white rounded-lg">
//       <div className="max-w-screen-xl mx-auto p-4">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold text-gray-700">
//             {isEditMode ? "EDIT ESTIMATE" : "CREATE NEW BILL"}
//           </h1>

//           <div className="flex space-x-2">
//             {/* Version History Button - Only show in edit mode */}
//             {isEditMode && versionHistory.length > 0 && (
//               <button
//                 type="button"
//                 onClick={() => setShowVersionHistory(true)}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//               >
//                 Version History
//               </button>
//             )}
            
//             {/* Reset Form Button */}
//             <button 
//               type="button"
//               onClick={handleResetForm}
//               className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
//             >
//               Reset Form
//             </button>
//           </div>
//         </div>

//         {/* Version Info Banner - Displayed when editing an estimate */}
//         {isEditMode && state.versionInfo.version > 0 && (
//           <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
//             <div>
//               <span className="font-semibold">Estimate #:</span> {state.versionInfo.estimateNumber} | 
//               <span className="ml-2 font-semibold">Version:</span> {state.versionInfo.version} | 
//               <span className="ml-2 font-semibold">Status:</span> {state.versionInfo.status}
//             </div>
//             {isModified && (
//               <span className="text-sm bg-yellow-100 px-2 py-1 rounded">
//                 Modified - Will create new version
//               </span>
//             )}
//           </div>
//         )}

//         {/* Reset Confirmation Modal */}
//         {showResetConfirmation && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
//               <h2 className="text-xl font-bold mb-4">Confirm Reset</h2>
//               <p className="mb-6">Are you sure you want to reset the form? All entered data will be lost.</p>
//               <div className="flex justify-end space-x-4">
//                 <button 
//                   type="button"
//                   onClick={() => setShowResetConfirmation(false)}
//                   className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   type="button"
//                   onClick={confirmResetForm}
//                   className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
//                 >
//                   Reset Form
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Version History Modal */}
//         {showVersionHistory && (
//           <VersionHistoryModal
//             versionHistory={versionHistory}
//             estimateNumber={state.versionInfo.estimateNumber}
//             currentVersion={state.versionInfo.version}
//             onClose={() => setShowVersionHistory(false)}
//           />
//         )}

//         <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
//           {/* Client Info Section - New component */}
//           <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
//             <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">CLIENT INFORMATION</h2>
//             <ClientInfo 
//               state={state} 
//               dispatch={dispatch}
//               validationErrors={validationErrors}
//             />
//           </div>

//           {/* Order & Paper Section - Modified to remove client info */}
//           <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
//             <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">ORDER & PAPER DETAILS</h2>
//             <OrderAndPaper 
//               state={state} 
//               dispatch={dispatch} 
//               onNext={() => {}} 
//               validationErrors={validationErrors}
//               singlePageMode={true}
//             />
//           </div>

//           {/* Processing Options in Collapsible Sections with direct toggles */}
//           <div>
//             <FormSection 
//               title="LETTER PRESS (LP) DETAILS" 
//               id="lp"
//               activeSection={activeSection}
//               setActiveSection={setActiveSection}
//               isUsed={state.lpDetails.isLPUsed}
//               onToggleUsage={toggleLPUsage}
//             >
//               <LPDetails 
//                 state={state} 
//                 dispatch={dispatch} 
//                 onNext={() => {}} 
//                 onPrevious={() => {}} 
//                 singlePageMode={true}
//               />
//             </FormSection>

//             <FormSection 
//               title="FOIL STAMPING (FS) DETAILS" 
//               id="fs"
//               activeSection={activeSection}
//               setActiveSection={setActiveSection}
//               isUsed={state.fsDetails.isFSUsed}
//               onToggleUsage={toggleFSUsage}
//             >
//               <FSDetails 
//                 state={state} 
//                 dispatch={dispatch} 
//                 onNext={() => {}} 
//                 onPrevious={() => {}} 
//                 singlePageMode={true}
//               />
//             </FormSection>

//             <FormSection 
//               title="EMBOSSING (EMB) DETAILS" 
//               id="emb"
//               activeSection={activeSection}
//               setActiveSection={setActiveSection}
//               isUsed={state.embDetails.isEMBUsed}
//               onToggleUsage={toggleEMBUsage}
//             >
//               <EMBDetails 
//                 state={state} 
//                 dispatch={dispatch} 
//                 onNext={() => {}} 
//                 onPrevious={() => {}} 
//                 singlePageMode={true}
//               />
//             </FormSection>

//             <FormSection 
//               title="DIGITAL PRINTING DETAILS" 
//               id="digi"
//               activeSection={activeSection}
//               setActiveSection={setActiveSection}
//               isUsed={state.digiDetails.isDigiUsed}
//               onToggleUsage={toggleDigiUsage}
//             >
//               <DigiDetails 
//                 state={state} 
//                 dispatch={dispatch} 
//                 onNext={() => {}} 
//                 onPrevious={() => {}} 
//                 singlePageMode={true}
//               />
//             </FormSection>

//             <FormSection 
//               title="DIE CUTTING DETAILS" 
//               id="dieCutting"
//               activeSection={activeSection}
//               setActiveSection={setActiveSection}
//               isUsed={state.dieCutting.isDieCuttingUsed}
//               onToggleUsage={toggleDieCuttingUsage}
//             >
//               <DieCutting 
//                 state={state} 
//                 dispatch={dispatch} 
//                 onNext={() => {}} 
//                 onPrevious={() => {}} 
//                 singlePageMode={true}
//               />
//             </FormSection>

//             <FormSection 
//               title="SANDWICH DETAILS" 
//               id="sandwich"
//               activeSection={activeSection}
//               setActiveSection={setActiveSection}
//               isUsed={state.sandwich.isSandwichComponentUsed}
//               onToggleUsage={toggleSandwichUsage}
//             >
//               <Sandwich 
//                 state={state} 
//                 dispatch={dispatch} 
//                 onNext={() => {}} 
//                 onPrevious={() => {}} 
//                 singlePageMode={true}
//               />
//             </FormSection>

//             <FormSection 
//               title="PASTING DETAILS" 
//               id="pasting"
//               activeSection={activeSection}
//               setActiveSection={setActiveSection}
//               isUsed={state.pasting.isPastingUsed}
//               onToggleUsage={togglePastingUsage}
//             >
//               <Pasting 
//                 state={state} 
//                 dispatch={dispatch} 
//                 onNext={() => {}} 
//                 onPrevious={() => {}} 
//                 singlePageMode={true}
//               />
//             </FormSection>
//           </div>

//           {/* Cost Calculation & Review Section - Always visible */}
//           <div className="bg-gray-50 p-5 rounded-lg shadow-sm mt-6">
//             <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">COST CALCULATION & REVIEW</h2>
//             <ReviewAndSubmit 
//               state={state} 
//               calculations={calculations} 
//               isCalculating={isCalculating} 
//               onPrevious={() => {}} 
//               onCreateEstimate={handleCreateEstimate} 
//               isEditMode={isEditMode}
//               isSaving={isSubmitting}
//               singlePageMode={true}
//             />
//           </div>

//           {/* Version Notes - Only shown when editing */}
//           {isEditMode && isModified && (
//             <div className="bg-yellow-50 p-5 rounded-lg shadow-sm border border-yellow-200">
//               <h2 className="text-lg font-semibold mb-2">Version Change Notes</h2>
//               <p className="text-gray-600 mb-2">
//                 Add notes describing what changed in this version. This helps track the history of changes.
//               </p>
//               <textarea
//                 value={changeNotes}
//                 onChange={(e) => setChangeNotes(e.target.value)}
//                 placeholder="What changed in this version? (optional)"
//                 className="w-full p-3 border rounded-md h-24"
//               />
//             </div>
//           )}

//           <div className="flex justify-end mt-8 border-t pt-6">
//             {onClose && (
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="mr-3 px-5 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </button>
//             )}
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors font-medium"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Saving...
//                 </>
//               ) : (
//                 isEditMode && isModified ? "Save as New Version" : 
//                 isEditMode ? "Save Changes" : "Create Estimate"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BillingForm;

import React, { useReducer, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { calculateEstimateCosts } from "./calculations";
import { formReducer, initialFormState } from "../../models/formStateModel";
import { ESTIMATE_STATUS, ALLOWED_STATUS_TRANSITIONS } from "../../constants/statusConstants";
import { createEstimate, createEstimateVersion, getEstimateById } from "../../utils/estimateVersionUtils";
import { formatDate } from "../../utils/formatUtils";
import { generateGroupEstimatePDF } from "../../utils/pdfUtils";

// Custom hooks
// import { useAuth } from "../../context/AuthContext";

// Import components
import ClientInfo from "./ClientInfo";
import VersionInfo from "./VersionInfo";
import OrderAndPaper from "./OrderAndPaper";
import LPDetails from "./LPDetails";
import FSDetails from "./FSDetails";
import EMBDetails from "./EMBDetails";
import DigiDetails from "./DigiDetails";
import DieCutting from "./DieCutting";
import Sandwich from "./Sandwich";
import Pasting from "./Pasting";
import ReviewAndSubmit from "./ReviewAndSubmit";
import VersionHistoryModal from "./VersionHistoryModal";

const BillingForm = ({ 
  initialState = null, 
  isEditMode = false, 
  onSubmitSuccess = null, 
  onClose = null, 
  estimateId = null 
}) => {
  const navigate = useNavigate();
  // const { currentUser, getUserId } = useAuth();
  // const userId = getUserId() || "current-user-id";
  const userId = "current-user-id"; 
  
  // Form state
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [calculations, setCalculations] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI state
  const [activeSection, setActiveSection] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  // Version control state
  const [versionHistory, setVersionHistory] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [originalState, setOriginalState] = useState(null);
  const [isModified, setIsModified] = useState(false);
  
  // Markup and pricing state
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [miscCharge, setMiscCharge] = useState(5); // Default 5 rupees per card
  
  // Refs
  const formRef = useRef(null);
  const calculationTimeoutRef = useRef(null);

  // Initialize form with data if in edit mode or loading existing estimate
  useEffect(() => {
    const loadEstimate = async () => {
      if (estimateId) {
        try {
          const estimate = await getEstimateById(estimateId);
          if (estimate) {
            // Transform estimate document to form state
            const formState = {
              // Client info
              clientInfo: {
                clientId: estimate.clientId || "",
                clientCode: estimate.clientCode || "",
                clientName: estimate.clientName || "",
                contactPerson: estimate.clientContact?.contactPerson || "",
                email: estimate.clientContact?.email || "",
                phone: estimate.clientContact?.phone || "",
                gstin: estimate.clientContact?.gstin || ""
              },
              
              // Version info
              versionInfo: {
                estimateNumber: estimate.estimateNumber || "",
                version: estimate.version || 1,
                baseEstimateId: estimate.baseEstimateId || estimate.id || "",
                isNewEstimate: false,
                status: estimate.status || ESTIMATE_STATUS.DRAFT
              },
              
              // Order and paper
              orderAndPaper: {
                projectName: estimate.projectName || "",
                date: estimate.date ? new Date(estimate.date.seconds * 1000) : new Date(),
                deliveryDate: estimate.deliveryDate ? new Date(estimate.deliveryDate.seconds * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                jobType: estimate.jobDetails?.jobType || "Card",
                quantity: estimate.jobDetails?.quantity || "",
                paperProvided: estimate.jobDetails?.paperProvided || "Yes",
                paperName: estimate.jobDetails?.paperName || "",
                dieSelection: estimate.dieDetails?.dieSelection || "",
                dieCode: estimate.dieDetails?.dieCode || "",
                dieSize: estimate.dieDetails?.dieSize || { length: "", breadth: "" },
                image: estimate.dieDetails?.image || "",
              },
              
              // Process details
              lpDetails: estimate.lpDetails || initialFormState.lpDetails,
              fsDetails: estimate.fsDetails || initialFormState.fsDetails,
              embDetails: estimate.embDetails || initialFormState.embDetails,
              digiDetails: estimate.digiDetails || initialFormState.digiDetails,
              dieCutting: estimate.dieCutting || initialFormState.dieCutting,
              sandwich: estimate.sandwich || initialFormState.sandwich,
              pasting: estimate.pasting || initialFormState.pasting,
              
              // Calculations
              calculations: estimate.calculations || null
            };
            
            dispatch({ type: "INITIALIZE_FORM", payload: formState });
            setOriginalState(formState); // Store for tracking changes
            setCalculations(estimate.calculations || null);
            
            // Initialize markup and misc charge if available
            if (estimate.calculations) {
              if (estimate.calculations.markupPercentage) {
                setMarkupPercentage(parseFloat(estimate.calculations.markupPercentage) || 0);
              }
              if (estimate.calculations.miscChargePerCard) {
                setMiscCharge(parseFloat(estimate.calculations.miscChargePerCard) || 5);
              }
            }
            
            // Load version history if available
            if (estimate.versionHistory && estimate.versionHistory.length > 0) {
              setVersionHistory(estimate.versionHistory);
            }
          }
        } catch (error) {
          console.error("Error loading estimate:", error);
        }
      } else if (initialState && isEditMode) {
        dispatch({ type: "INITIALIZE_FORM", payload: initialState });
        setOriginalState(initialState);
        
        // Initialize calculations, markup and misc charge if available
        if (initialState.calculations) {
          setCalculations(initialState.calculations);
          
          if (initialState.calculations.markupPercentage) {
            setMarkupPercentage(parseFloat(initialState.calculations.markupPercentage) || 0);
          }
          if (initialState.calculations.miscChargePerCard) {
            setMiscCharge(parseFloat(initialState.calculations.miscChargePerCard) || 5);
          }
        }
      }
    };
    
    loadEstimate();
  }, [initialState, isEditMode, estimateId]);

  // Calculate costs when form data changes with debounce
  useEffect(() => {
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }
    
    calculationTimeoutRef.current = setTimeout(() => {
      performCalculations();
    }, 800); // 800ms debounce
    
    // Check if state has been modified
    if (originalState) {
      const currentJson = JSON.stringify(state);
      const originalJson = JSON.stringify(originalState);
      setIsModified(currentJson !== originalJson);
    }
    
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [state, originalState]);

  const performCalculations = async () => {
    // Check if essential fields are filled
    const { clientInfo, orderAndPaper } = state;
    
    // Validate client information
    if (!clientInfo.clientId || !clientInfo.clientName) {
      return; // Don't calculate if client info is missing
    }
    
    // Check if order and paper fields are filled
    const { projectName, quantity, paperName, dieCode, dieSize } = orderAndPaper;
    if (!projectName || !quantity || !paperName || !dieCode || 
        !dieSize.length || !dieSize.breadth) {
      return; // Don't calculate if essential fields are missing
    }
    
    setIsCalculating(true);
    setCalculationError(null);
    
    try {
      const result = await calculateEstimateCosts(state);
      if (result.error) {
        setCalculationError(result.error);
        console.error("Error during calculations:", result.error);
      } else {
        setCalculations(result);
        
        // Also update the form state with the calculations
        dispatch({ type: "UPDATE_CALCULATIONS", payload: result });
      }
    } catch (error) {
      setCalculationError("Unexpected error during calculations");
      console.error("Unexpected error during calculations:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Get enhanced calculations with markup and misc charge
  const getEnhancedCalculations = () => {
    if (!calculations) return null;
    
    const totalCards = parseInt(state.orderAndPaper.quantity, 10) || 0;
    
    // Define standard percentages
    const WASTAGE_PERCENTAGE = 5; // 5% wastage
    const OVERHEAD_PERCENTAGE = 35; // 35% overhead

    // Calculate base cost per card from all components
    const relevantFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard',
      'dieCuttingCostPerCard',
      'pastingCostPerCard'
    ];

    const baseCost = relevantFields.reduce((acc, key) => {
      const value = calculations[key];
      return acc + (value !== undefined && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);

    // Add miscellaneous charge to base cost
    const baseWithMisc = baseCost + miscCharge;
    
    // Calculate wastage cost
    const wastageCost = baseWithMisc * (WASTAGE_PERCENTAGE / 100);
    
    // Calculate overhead cost
    const overheadCost = baseWithMisc * (OVERHEAD_PERCENTAGE / 100);
    
    // Calculate cost with wastage and overhead
    const costWithOverhead = baseWithMisc + wastageCost + overheadCost;
    
    // Calculate markup cost
    const markupCost = costWithOverhead * (markupPercentage / 100);
    
    // Calculate total cost per card and total cost
    const totalCostPerCard = costWithOverhead + markupCost;
    const totalCost = totalCostPerCard * totalCards;
    
    // Return enhanced calculations with all components
    return {
      ...calculations,
      
      // Base cost components
      baseCost: baseCost.toFixed(2),
      miscChargePerCard: miscCharge.toFixed(2),
      baseWithMisc: baseWithMisc.toFixed(2),
      
      // Wastage and overhead
      wastagePercentage: WASTAGE_PERCENTAGE,
      wastageAmount: wastageCost.toFixed(2),
      overheadPercentage: OVERHEAD_PERCENTAGE,
      overheadAmount: overheadCost.toFixed(2),
      
      // Markup
      markupPercentage: markupPercentage,
      markupAmount: markupCost.toFixed(2),
      
      // Totals
      subtotalPerCard: costWithOverhead.toFixed(2),
      totalCostPerCard: totalCostPerCard.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  };

  const validateForm = () => {
    const errors = {};
    const { clientInfo, orderAndPaper, versionInfo } = state;
    
    // Validate Client info section
    if (!clientInfo.clientId) errors.clientId = "Client selection is required";
    if (!clientInfo.clientName) errors.clientName = "Client name is required";
    
    // Validate Order & Paper section
    if (!orderAndPaper.projectName) errors.projectName = "Project name is required";
    if (!orderAndPaper.quantity) errors.quantity = "Quantity is required";
    if (!orderAndPaper.dieCode) errors.dieCode = "Please select a die";
    
    // Validate date fields
    if (!orderAndPaper.date) errors.date = "Order date is required";
    if (!orderAndPaper.deliveryDate) errors.deliveryDate = "Delivery date is required";
    
    // Validate status if changing status
    if (isEditMode && versionInfo.status) {
      const currentStatus = originalState?.versionInfo?.status;
      if (currentStatus && versionInfo.status !== currentStatus) {
        const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
        if (!allowedTransitions.includes(versionInfo.status)) {
          errors.status = `Cannot transition from ${currentStatus} to ${versionInfo.status}`;
        }
      }
    }
    
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
    
    // Get enhanced calculations with markup
    const enhancedCalculations = getEnhancedCalculations();
    
    // Update the form state with enhanced calculations
    if (enhancedCalculations) {
      dispatch({ 
        type: "UPDATE_CALCULATIONS", 
        payload: enhancedCalculations 
      });
    }
    
    setIsSubmitting(true);
    try {
      let result;
      
      if (isEditMode && state.versionInfo.isNewEstimate === false) {
        // This is an update to an existing estimate - create a new version
        result = await createEstimateVersion(
          estimateId || state.versionInfo.baseEstimateId,
          {
            ...state,
            calculations: enhancedCalculations || state.calculations
          },
          userId,
          changeNotes || "Updated estimate"
        );
        
        alert("Estimate updated successfully!");
      } else {
        // This is a new estimate
        result = await createEstimate(
          {
            ...state,
            calculations: enhancedCalculations || state.calculations
          }, 
          userId
        );
        alert("Estimate created successfully!");
      }
      
      // Handle callback or navigation
      if (isEditMode && onSubmitSuccess) {
        await onSubmitSuccess(result);
        if (onClose) onClose();
      } else {
        // Reset form for new estimates
        dispatch({ type: "RESET_FORM" });
        setOriginalState(null);
        setVersionHistory([]);
        setCalculations(null);
        setMarkupPercentage(0);
        setMiscCharge(5);
        
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

  // Generate PDF of the current estimate
  const handleGeneratePDF = () => {
    if (!state.clientInfo?.clientName || !state.versionInfo?.estimateNumber) {
      alert("Cannot generate PDF: Missing client info or estimate number");
      return;
    }
    
    try {
      const currentStateWithCalcs = {
        ...state,
        calculations: getEnhancedCalculations() || state.calculations
      };
      
      generateGroupEstimatePDF([currentStateWithCalcs]);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF: " + error.message);
    }
  };

  // Handler for Review and Submit when calculations are ready
  const handleCreateEstimate = (enhancedCalculations) => {
    // For single page mode, we're just submitting the form
    // Update form state with enhanced calculations if provided
    if (enhancedCalculations) {
      dispatch({ 
        type: "UPDATE_CALCULATIONS", 
        payload: enhancedCalculations 
      });
    }
    
    handleSubmit(new Event('submit'));
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
    setOriginalState(null);
    setVersionHistory([]);
    setMarkupPercentage(0);
    setMiscCharge(5);
    
    // Scroll to top of form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
              <span className="text-sm font-medium text-gray-600">Use</span>
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

  return (
    <div className="bg-white rounded-lg">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-700">
            {isEditMode ? "EDIT ESTIMATE" : "CREATE NEW BILL"}
          </h1>

          <div className="flex space-x-2">
            {/* Generate PDF Button */}
            {isEditMode && state.versionInfo?.estimateNumber && (
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                disabled={isCalculating || isSubmitting}
              >
                Generate PDF
              </button>
            )}
            
            {/* Version History Button - Only show in edit mode */}
            {isEditMode && versionHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setShowVersionHistory(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Version History
              </button>
            )}
            
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
        
        {/* Version Info Banner - Displayed when editing an estimate */}
        {isEditMode && state.versionInfo.version > 0 && (
          <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
            <div>
              <span className="font-semibold">Estimate #:</span> {state.versionInfo.estimateNumber} | 
              <span className="ml-2 font-semibold">Version:</span> {state.versionInfo.version} | 
              <span className="ml-2 font-semibold">Status:</span> {state.versionInfo.status}
            </div>
            {isModified && (
              <span className="text-sm bg-yellow-100 px-2 py-1 rounded">
                Modified - Will create new version
              </span>
            )}
          </div>
        )}

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

        {/* Version History Modal */}
        {showVersionHistory && (
          <VersionHistoryModal
            versionHistory={versionHistory}
            estimateNumber={state.versionInfo.estimateNumber}
            currentVersion={state.versionInfo.version}
            onClose={() => setShowVersionHistory(false)}
          />
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Version Info Section - Only show in edit mode */}
          {/* {isEditMode && state.versionInfo.version > 0 && (
            <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">VERSION INFORMATION</h2>
              <VersionInfo 
                versionInfo={state.versionInfo}
                dispatch={dispatch}
                isModified={isModified}
                versionHistory={versionHistory}
                onViewHistory={() => setShowVersionHistory(true)}
                validationErrors={validationErrors}
              />
            </div>
          )} */}
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">VERSION INFORMATION</h2>
            <VersionInfo 
              versionInfo={state.versionInfo}
              dispatch={dispatch}
              isModified={isModified}
              versionHistory={versionHistory}
              onViewHistory={() => setShowVersionHistory(true)}
              validationErrors={validationErrors}
            />
          </div>

          {/* Client Info Section */}
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 border-b pb-2">CLIENT INFORMATION</h2>
            <ClientInfo 
              state={state} 
              dispatch={dispatch}
              validationErrors={validationErrors}
            />
          </div>

          {/* Order & Paper Section */}
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

          {/* Processing Options in Collapsible Sections with direct toggles */}
          <div>
            <FormSection 
              title="LETTER PRESS (LP) DETAILS" 
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
              title="FOIL STAMPING (FS) DETAILS" 
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
              title="EMBOSSING (EMB) DETAILS" 
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
              title="DIGITAL PRINTING DETAILS" 
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
              title="DIE CUTTING DETAILS" 
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
              title="SANDWICH DETAILS" 
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
              title="PASTING DETAILS" 
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
              markupPercentage={markupPercentage}
              setMarkupPercentage={setMarkupPercentage}
              miscCharge={miscCharge}
              setMiscCharge={setMiscCharge}
              calculationError={calculationError}
            />
          </div>

          {/* Version Notes - Only shown when editing */}
          {isEditMode && isModified && (
            <div className="bg-yellow-50 p-5 rounded-lg shadow-sm border border-yellow-200">
              <h2 className="text-lg font-semibold mb-2">Version Change Notes</h2>
              <p className="text-gray-600 mb-2">
                Add notes describing what changed in this version. This helps track the history of changes.
              </p>
              <textarea
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="What changed in this version? (optional)"
                className="w-full p-3 border rounded-md h-24"
              />
            </div>
          )}

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
              disabled={isSubmitting || isCalculating}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : isCalculating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </>
              ) : (
                isEditMode && isModified ? "Save as New Version" : 
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