// import React, { useReducer } from "react";
// import OrderAndPaper from "./OrderAndPaper";
// import LPDetails from "./LPDetails";
// import FSDetails from "./FSDetails";
// import EMBDetails from "./EMBDetails";
// import DigiDetails from "./DigiDetails";
// import DieCutting from "./DieCutting";
// import Sandwich from "./Sandwich";
// import Pasting from "./Pasting";
// import ReviewAndSubmit from "./ReviewAndSubmit";
// import { db } from "../../firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";

// // Initial state for all steps
// const initialState = {
//   currentStep: 1,
//   orderAndPaper: {
//     clientName: "",
//     projectName: "",
//     date: null,
//     deliveryDate: null,
//     jobType: "Card",
//     quantity: "",
//     paperProvided: "Yes",
//     paperName: "",
//     dieSelection: "",
//     dieCode: "",
//     dieSize: { length: "", breadth: "" },
//     image: "",
//   },
//   lpDetails: {
//     isLPUsed: false,
//     noOfColors: 0,
//     colorDetails: [],
//   },
//   fsDetails: {
//     isFSUsed: false,
//     fsType: "",
//     foilDetails: [],
//   },
//   embDetails: {
//     isEMBUsed: false,
//     plateSizeType: "",
//     plateDimensions: { length: "", breadth: "" },
//     plateTypeMale: "",
//     plateTypeFemale: "",
//     embMR: "",
//   },
//   digiDetails: {
//     isDigiUsed: false,
//     digiDie: "",
//   },
//   dieCutting: {
//     isDieCuttingUsed: false,
//     difficulty: "",
//     pdc: "",
//     dcMR: "",
//   },
//   sandwich: {
//     isSandwichComponentUsed: false,
//   },
//   pasting: {},
// };

// // Reducer function to handle updates to the state
// const reducer = (state, action) => {
//   switch (action.type) {
//     case "UPDATE_ORDER_AND_PAPER":
//       return { ...state, orderAndPaper: { ...state.orderAndPaper, ...action.payload } };
//     case "UPDATE_LP_DETAILS":
//       return { ...state, lpDetails: { ...state.lpDetails, ...action.payload } };
//     case "UPDATE_FS_DETAILS":
//       return { ...state, fsDetails: { ...state.fsDetails, ...action.payload } };
//     case "UPDATE_EMB_DETAILS":
//       return { ...state, embDetails: { ...state.embDetails, ...action.payload } };
//     case "UPDATE_DIGI_DETAILS":
//       return { ...state, digiDetails: { ...state.digiDetails, ...action.payload } };
//     case "UPDATE_DIE_CUTTING":
//       return { ...state, dieCutting: { ...state.dieCutting, ...action.payload } };
//     case "UPDATE_SANDWICH":
//       return { ...state, sandwich: { ...state.sandwich, ...action.payload } };
//     case "UPDATE_PASTING":
//       return { ...state, pasting: { ...state.pasting, ...action.payload } };
//     case "RESET_FORM":
//       return initialState; // Reset the state to initialState
//     case "SET_STEP":
//       return { ...state, currentStep: action.payload };
//     default:
//       return state;
//   }
// };

// // Function to map the state to the desired Firebase structure
// const mapStateToFirebaseStructure = (state) => {
//   const {
//     orderAndPaper,
//     lpDetails,
//     fsDetails,
//     embDetails,
//     digiDetails,
//     dieCutting,
//     sandwich,
//     pasting,
//   } = state;

//   return {
//     clientName: orderAndPaper.clientName,
//     projectName: orderAndPaper.projectName,
//     date: orderAndPaper.date?.toISOString() || "",
//     deliveryDate: orderAndPaper.deliveryDate?.toISOString() || "",
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
//     lpDetails: lpDetails.isLPUsed
//       ? {
//           isLPUsed: lpDetails.isLPUsed,
//           noOfColors: lpDetails.noOfColors,
//           colorDetails: lpDetails.colorDetails,
//         }
//       : null,
//     fsDetails: fsDetails.isFSUsed
//       ? {
//           isFSUsed: fsDetails.isFSUsed,
//           fsType: fsDetails.fsType,
//           foilDetails: fsDetails.foilDetails,
//         }
//       : null,
//     embDetails: embDetails.isEMBUsed
//       ? {
//           isEMBUsed: embDetails.isEMBUsed,
//           plateSizeType: embDetails.plateSizeType,
//           plateDimensions: embDetails.plateDimensions,
//           plateTypeMale: embDetails.plateTypeMale,
//           plateTypeFemale: embDetails.plateTypeFemale,
//           embMR: embDetails.embMR,
//         }
//       : null,
//     digiDetails: digiDetails.isDigiUsed
//       ? {
//           isDigiUsed: digiDetails.isDigiUsed,
//           digiDie: digiDetails.digiDie,
//         }
//       : null,
//     dieCuttingDetails: dieCutting.isDieCuttingUsed
//       ? {
//           isDieCuttingUsed: dieCutting.isDieCuttingUsed,
//           difficulty: dieCutting.difficulty,
//           pdc: dieCutting.pdc,
//           dcMR: dieCutting.dcMR,
//         }
//       : null,
//     sandwichDetails: sandwich.isSandwichComponentUsed ? sandwich : null,
//     pastingDetails: pasting,
//   };
// };

// const BillingForm = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   const handleNext = () => {
//     if (state.currentStep < 9) {
//       dispatch({ type: "SET_STEP", payload: state.currentStep + 1 });
//     }
//   };

//   const handlePrevious = () => {
//     if (state.currentStep > 1) {
//       dispatch({ type: "SET_STEP", payload: state.currentStep - 1 });
//     }
//   };

//   const handleCreateEstimate = async () => {
//     try {
//       // Transform the state into the required Firebase structure
//       const formattedData = mapStateToFirebaseStructure(state);

//       // Save to Firestore
//       await addDoc(collection(db, "estimates"), formattedData);
//       alert("Estimate created successfully!");

//       // Reset form state
//       dispatch({ type: "RESET_FORM" });

//       // Reload the page
//       window.location.reload();
//     } catch (error) {
//       console.error("Error creating estimate:", error);
//       alert("Failed to create estimate.");
//     }
//   };

//   const steps = [
//     <OrderAndPaper state={state} dispatch={dispatch} onNext={handleNext} key="step1" />,
//     <LPDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
//     <FSDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
//     <EMBDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
//     <DigiDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
//     <DieCutting state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
//     <Sandwich state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
//     <Pasting state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step8" />,
//     <ReviewAndSubmit
//       state={state}
//       onPrevious={handlePrevious}
//       onCreateEstimate={handleCreateEstimate}
//       key="step9"
//     />,
//   ];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-gray-700 mb-4">Billing Form</h1>
//         <div className="text-gray-600 mb-6">
//           <p>Step {state.currentStep} of {steps.length}</p>
//           <div className="h-2 bg-gray-300 rounded-full mt-2">
//             <div
//               className="h-2 bg-blue-500 rounded-full"
//               style={{ width: `${(state.currentStep / steps.length) * 100}%` }}
//             />
//           </div>
//         </div>
//         {steps[state.currentStep - 1]}
//       </div>
//     </div>
//   );
// };

// export default BillingForm;

// import React, { useReducer, useEffect } from "react";
// import OrderAndPaper from "./OrderAndPaper";
// import LPDetails from "./LPDetails";
// import FSDetails from "./FSDetails";
// import EMBDetails from "./EMBDetails";
// import DigiDetails from "./DigiDetails";
// import DieCutting from "./DieCutting";
// import Sandwich from "./Sandwich";
// import Pasting from "./Pasting";
// import ReviewAndSubmit from "./ReviewAndSubmit";
// import { db } from "../../firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";

// // Initial state for all steps
// const initialState = {
//   currentStep: 1,
//   orderAndPaper: {
//     clientName: "",
//     projectName: "",
//     date: null,
//     deliveryDate: null,
//     jobType: "Card",
//     quantity: "",
//     paperProvided: "Yes",
//     paperName: "",
//     dieSelection: "",
//     dieCode: "",
//     dieSize: { length: "", breadth: "" },
//     image: "",
//   },
//   lpDetails: {
//     isLPUsed: false,
//     noOfColors: 0, // Initially set to 0
//     colorDetails: [],
//   },
//   fsDetails: {
//     isFSUsed: false,
//     fsType: "",
//     foilDetails: [],
//   },
//   embDetails: {
//     isEMBUsed: false,
//     plateSizeType: "",
//     plateDimensions: { length: "", breadth: "" },
//     plateTypeMale: "",
//     plateTypeFemale: "",
//     embMR: "",
//   },
//   digiDetails: {
//     isDigiUsed: false,
//     digiDie: "",
//   },
//   dieCutting: {
//     isDieCuttingUsed: false,
//     difficulty: "",
//     pdc: "",
//     dcMR: "",
//   },
//   sandwich: {
//     isSandwichComponentUsed: false,
//   },
//   pasting: {},
// };

// // Reducer function to handle updates to the state
// const reducer = (state, action) => {
//   switch (action.type) {
//     case "UPDATE_ORDER_AND_PAPER":
//       return { ...state, orderAndPaper: { ...state.orderAndPaper, ...action.payload } };
//     case "UPDATE_LP_DETAILS":
//       return { ...state, lpDetails: { ...state.lpDetails, ...action.payload } };
//     case "UPDATE_FS_DETAILS":
//       return { ...state, fsDetails: { ...state.fsDetails, ...action.payload } };
//     case "UPDATE_EMB_DETAILS":
//       return { ...state, embDetails: { ...state.embDetails, ...action.payload } };
//     case "UPDATE_DIGI_DETAILS":
//       return { ...state, digiDetails: { ...state.digiDetails, ...action.payload } };
//     case "UPDATE_DIE_CUTTING":
//       return { ...state, dieCutting: { ...state.dieCutting, ...action.payload } };
//     case "UPDATE_SANDWICH":
//       return { ...state, sandwich: { ...state.sandwich, ...action.payload } };
//     case "UPDATE_PASTING":
//       return { ...state, pasting: { ...state.pasting, ...action.payload } };
//     case "SET_STEP":
//       return { ...state, currentStep: action.payload };
//     case "RESET_FORM":
//       return initialState;
//     default:
//       return state;
//   }
// };

// // Function to map the state to the desired Firebase structure
// const mapStateToFirebaseStructure = (state) => {
//   const {
//     orderAndPaper,
//     lpDetails,
//     fsDetails,
//     embDetails,
//     digiDetails,
//     dieCutting,
//     sandwich,
//     pasting,
//   } = state;

//   return {
//     clientName: orderAndPaper.clientName,
//     projectName: orderAndPaper.projectName,
//     date: orderAndPaper.date?.toISOString() || "",
//     deliveryDate: orderAndPaper.deliveryDate?.toISOString() || "",
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
//     lpDetails: lpDetails.isLPUsed
//       ? {
//           isLPUsed: lpDetails.isLPUsed,
//           noOfColors: lpDetails.noOfColors,
//           colorDetails: lpDetails.colorDetails,
//         }
//       : null,
//     fsDetails: fsDetails.isFSUsed
//       ? {
//           isFSUsed: fsDetails.isFSUsed,
//           fsType: fsDetails.fsType,
//           foilDetails: fsDetails.foilDetails,
//         }
//       : null,
//     embDetails: embDetails.isEMBUsed
//       ? {
//           isEMBUsed: embDetails.isEMBUsed,
//           plateSizeType: embDetails.plateSizeType,
//           plateDimensions: embDetails.plateDimensions,
//           plateTypeMale: embDetails.plateTypeMale,
//           plateTypeFemale: embDetails.plateTypeFemale,
//           embMR: embDetails.embMR,
//         }
//       : null,
//     digiDetails: digiDetails.isDigiUsed
//       ? {
//           isDigiUsed: digiDetails.isDigiUsed,
//           digiDie: digiDetails.digiDie,
//         }
//       : null,
//     dieCuttingDetails: dieCutting.isDieCuttingUsed
//       ? {
//           isDieCuttingUsed: dieCutting.isDieCuttingUsed,
//           difficulty: dieCutting.difficulty,
//           pdc: dieCutting.pdc,
//           dcMR: dieCutting.dcMR,
//         }
//       : null,
//     sandwichDetails: sandwich.isSandwichComponentUsed ? sandwich : null,
//     pastingDetails: pasting,
//   };
// };

// const BillingForm = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   // Load state from localStorage on mount
//   useEffect(() => {
//     const savedState = localStorage.getItem("billingFormState");
//     if (savedState) {
//       dispatch({ type: "RESET_FORM", payload: JSON.parse(savedState) });
//     }
//   }, []);

//   // Save state to localStorage on state change
//   useEffect(() => {
//     localStorage.setItem("billingFormState", JSON.stringify(state));
//   }, [state]);

//   const handleNext = () => {
//     if (state.currentStep < 9) {
//       dispatch({ type: "SET_STEP", payload: state.currentStep + 1 });
//     }
//   };

//   const handlePrevious = () => {
//     if (state.currentStep > 1) {
//       dispatch({ type: "SET_STEP", payload: state.currentStep - 1 });
//     }
//   };

//   const handleCreateEstimate = async () => {
//     try {
//       // Transform the state into the required Firebase structure
//       const formattedData = mapStateToFirebaseStructure(state);

//       // Save to Firestore
//       await addDoc(collection(db, "estimates"), formattedData);

//       // Clear localStorage and reset form
//       localStorage.removeItem("billingFormState");
//       dispatch({ type: "RESET_FORM" });

//       alert("Estimate created successfully!");
//     } catch (error) {
//       console.error("Error creating estimate:", error);
//       alert("Failed to create estimate.");
//     }
//   };

//   const steps = [
//     <OrderAndPaper state={state} dispatch={dispatch} onNext={handleNext} key="step1" />,
//     <LPDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
//     <FSDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
//     <EMBDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
//     <DigiDetails state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
//     <DieCutting state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
//     <Sandwich state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
//     <Pasting state={state} dispatch={dispatch} onNext={handleNext} onPrevious={handlePrevious} key="step8" />,
//     <ReviewAndSubmit
//       state={state}
//       onPrevious={handlePrevious}
//       onCreateEstimate={handleCreateEstimate}
//       key="step9"
//     />,
//   ];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-gray-700 mb-4">Billing Form</h1>
//         <div className="text-gray-600 mb-6">
//           <p>Step {state.currentStep} of {steps.length}</p>
//           <div className="h-2 bg-gray-300 rounded-full mt-2">
//             <div
//               className="h-2 bg-blue-500 rounded-full"
//               style={{ width: `${(state.currentStep / steps.length) * 100}%` }}
//             />
//           </div>
//         </div>
//         {steps[state.currentStep - 1]}
//       </div>
//     </div>
//   );
// };

// export default BillingForm;

import React, { useReducer, useEffect } from "react";
import OrderAndPaper from "./OrderAndPaper";
import LPDetails from "./LPDetails";
import FSDetails from "./FSDetails";
import EMBDetails from "./EMBDetails";
import DigiDetails from "./DigiDetails";
import DieCutting from "./DieCutting";
import Sandwich from "./Sandwich";
import Pasting from "./Pasting";
import ReviewAndSubmit from "./ReviewAndSubmit";
import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// Initial state for all steps
const initialState = {
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
  },
  dieCutting: {
    isDieCuttingUsed: false,
    difficulty: "",
    pdc: "",
    dcMR: "",
  },
  sandwich: {
    isSandwichComponentUsed: false,
  },
  pasting: {},
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
      return initialState;
    default:
      return state;
  }
};

// Function to map the state to the desired Firebase structure
const mapStateToFirebaseStructure = (state) => {
  const {
    orderAndPaper,
    lpDetails,
    fsDetails,
    embDetails,
    digiDetails,
    dieCutting,
    sandwich,
    pasting,
  } = state;

  return {
    clientName: orderAndPaper.clientName,
    projectName: orderAndPaper.projectName,
    date: orderAndPaper.date instanceof Date ? orderAndPaper.date.toISOString() : null,
    deliveryDate: orderAndPaper.deliveryDate instanceof Date ? orderAndPaper.deliveryDate.toISOString() : null,
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
    dieCuttingDetails: dieCutting.isDieCuttingUsed ? dieCutting : null,
    sandwichDetails: sandwich.isSandwichComponentUsed ? sandwich : null,
    pastingDetails: pasting,
  };
};

const BillingForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Save form state to local storage on every update
  useEffect(() => {
    localStorage.setItem("billingFormState", JSON.stringify(state));
  }, [state]);

  // Load form state from local storage on initial render
  useEffect(() => {
    const storedState = JSON.parse(localStorage.getItem("billingFormState"));
    if (storedState) {
      if (storedState.orderAndPaper.date) {
        storedState.orderAndPaper.date = new Date(storedState.orderAndPaper.date);
      }
      if (storedState.orderAndPaper.deliveryDate) {
        storedState.orderAndPaper.deliveryDate = new Date(storedState.orderAndPaper.deliveryDate);
      }
      dispatch({ type: "LOAD_STATE", payload: storedState });
    }
  }, []);

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

  const handleCreateEstimate = async () => {
    try {
      const formattedData = mapStateToFirebaseStructure(state);
      await addDoc(collection(db, "estimates"), formattedData);
      alert("Estimate created successfully!");
      dispatch({ type: "RESET_FORM" }); // Reset form to initial state
      localStorage.removeItem("billingFormState"); // Clear local storage
      window.location.reload(); // Reload the page
    } catch (error) {
      console.error("Error creating estimate:", error);
      alert("Failed to create estimate.");
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
    <ReviewAndSubmit
      state={state}
      onPrevious={handlePrevious}
      onCreateEstimate={handleCreateEstimate}
      key="step9"
    />,
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Billing Form</h1>
        <div className="text-gray-600 mb-6">
          <p>Step {state.currentStep} of {steps.length}</p>
          <div className="h-2 bg-gray-300 rounded-full mt-2">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${(state.currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
        {steps[state.currentStep - 1]}
      </div>
    </div>
  );
};

export default BillingForm;
