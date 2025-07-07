import React, { useReducer, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { performCompleteCalculations, recalculateTotals } from "./Services/Calculations/calculationsService";
import { fetchGSTRate } from "./Services/Calculations/Calculators/finalCalculator/gstCalculator";
import { useAuth } from "../Login/AuthContext";

// Import components
import LPDetails from "./Sections/Production/LPDetails";
import FSDetails from "./Sections/Production/FSDetails";
import EMBDetails from "./Sections/Production/EMBDetails";
import DigiDetails from "./Sections/Production/DigiDetails";
import ScreenPrint from "./Sections/Production/ScreenPrint";
import NotebookDetails from "./Sections/Production/NotebookDetails";
import PreDieCutting from "./Sections/Post Production/PreDieCutting";
import DieCutting from "./Sections/Post Production/DieCutting";
import PostDC from "./Sections/Post Production/PostDC";
import FoldAndPaste from "./Sections/Post Production/FoldAndPaste";
import DstPaste from "./Sections/Post Production/DstPaste";
import Magnet from "./Sections/Post Production/Magnet";
import QC from "./Sections/Post Production/QC";
import Packing from "./Sections/Post Production/Packing";
import Sandwich from "./Sections/Post Production/Sandwich";
import Misc from "./Sections/Post Production/Misc";
import ReviewAndSubmit from "./ReviewAndSubmit";
import SuccessNotification from "../Shared/SuccessNotification";
import FormSection from "../Shared/FormSection";
import FixedSection from "./Sections/Fixed/FixedSection";

// Import service and job type configurations
import { serviceRegistry } from "./Services/Config/serviceRegistry";
import { jobTypeConfigurations } from "./Services/Config/jobTypeConfigurations";

// Original initialFormState
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
   jobType: "Card", // Default job type
   quantity: "",
   paperProvided: "Yes",
   paperName: "",
   paperGsm: "",
   paperCompany: "",
   dieSelection: "",
   dieCode: "",
   dieSize: { length: "", breadth: "" },
   productSize: { length: "", breadth: "" },
   image: "",
   hsnCode: "",
   frags: "",
   type: "" 
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
   embMRConcatenated: "",
   dstMaterial: ""
 },
 digiDetails: {
   isDigiUsed: false,
   digiDie: "",
   digiDimensions: { length: "", breadth: "" },
 },
 notebookDetails: {
   isNotebookUsed: false,
   orientation: "",
   length: "",
   breadth: "",
   calculatedLength: "",
   calculatedBreadth: "",
   numberOfPages: "",
   bindingType: "",
   bindingTypeConcatenated: "",
   paperName: ""
 },
 screenPrint: {
   isScreenPrintUsed: false,
   noOfColors: 1,
   screenMR: "",
   screenMRConcatenated: ""
 },
 preDieCutting: {
   isPreDieCuttingUsed: false,
   predcMR: "",
   predcMRConcatenated: ""
 },
 dieCutting: {
   isDieCuttingUsed: false,
   dcMR: "",
   dcMRConcatenated: ""
 },
 postDC: {
   isPostDCUsed: false,
   pdcMR: "",
   pdcMRConcatenated: ""
 },
 foldAndPaste: {
   isFoldAndPasteUsed: false,
   dstMaterial: "",
   dstType: "",
 },  
 dstPaste: {
   isDstPasteUsed: false,
   dstType: "",
 },
 magnet: {
   isMagnetUsed: false,
   magnetMaterial: ""
 },
 qc: {
   isQCUsed: false,
 },
 packing: {
   isPackingUsed: false,
 },
 misc: {
   isMiscUsed: false,
   miscCharge: ""
 },
 sandwich: {
   isSandwichComponentUsed: false,
   paperInfo: {
     paperName: ""
   },
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
     plateDimensions: { 
       length: "", 
       breadth: "",
       lengthInInches: "",
       breadthInInches: ""
     },
     plateTypeMale: "",
     plateTypeFemale: "",
     embMR: "",
     embMRConcatenated: ""
   }
 }
};

// Reducer function to handle updates to the state
const reducer = (state, action) => {
 switch (action.type) {
   case "UPDATE_CLIENT":
     return { ...state, client: { ...state.client, ...action.payload } };
   case "UPDATE_VERSION":
     return { ...state, versionId: action.payload };
   case "UPDATE_ORDER_AND_PAPER":
     console.log("UPDATE_ORDER_AND_PAPER:", action.payload);
     return { ...state, orderAndPaper: { ...state.orderAndPaper, ...action.payload } };
   case "UPDATE_LP_DETAILS":
     return { ...state, lpDetails: { ...state.lpDetails, ...action.payload } };
   case "UPDATE_FS_DETAILS":
     return { ...state, fsDetails: { ...state.fsDetails, ...action.payload } };
   case "UPDATE_EMB_DETAILS":
     return { ...state, embDetails: { ...state.embDetails, ...action.payload } };
   case "UPDATE_DIGI_DETAILS":
     return { ...state, digiDetails: { ...state.digiDetails, ...action.payload } };
   case "UPDATE_NOTEBOOK_DETAILS":
     return { ...state, notebookDetails: { ...state.notebookDetails, ...action.payload } };
   case "UPDATE_SCREEN_PRINT":
     return { ...state, screenPrint: { ...state.screenPrint, ...action.payload } };
   case "UPDATE_PRE_DIE_CUTTING":
     return { ...state, preDieCutting: { ...state.preDieCutting, ...action.payload } };
   case "UPDATE_DIE_CUTTING":
     return { ...state, dieCutting: { ...state.dieCutting, ...action.payload } };
   case "UPDATE_POST_DC":
     return { ...state, postDC: { ...state.postDC, ...action.payload } };
   case "UPDATE_FOLD_AND_PASTE":
     return { ...state, foldAndPaste: { ...state.foldAndPaste, ...action.payload } };
   case "UPDATE_DST_PASTE":
     return { ...state, dstPaste: { ...state.dstPaste, ...action.payload } };
   case "UPDATE_MAGNET":
     return { ...state, magnet: { ...state.magnet, ...action.payload } };
   case "UPDATE_QC":
     return { ...state, qc: { ...state.qc, ...action.payload } };
   case "UPDATE_PACKING":
     return { ...state, packing: { ...state.packing, ...action.payload } };
   case "UPDATE_MISC":
     return { ...state, misc: { ...state.misc, ...action.payload } };
   case "UPDATE_SANDWICH":
     return { ...state, sandwich: { ...state.sandwich, ...action.payload } };
   case "UPDATE_HSN_CODE":
     return { ...state, orderAndPaper: { ...state.orderAndPaper, hsnCode: action.payload } };
   case "RESET_FORM":
     return initialFormState;
   case "INITIALIZE_FORM":
     console.log("INITIALIZING FORM with data:", action.payload);
     return { ...action.payload };
   default:
     return state;
 }
};

// Map state to Firebase structure with sanitization for undefined values
const mapStateToFirebaseStructure = (state, calculations) => {
 const { 
   client, 
   versionId, 
   orderAndPaper, 
   lpDetails, 
   fsDetails, 
   embDetails, 
   digiDetails, 
   screenPrint, 
   preDieCutting,
   dieCutting, 
   sandwich,
   magnet,
   notebookDetails
 } = state;

 // Helper function to sanitize objects for Firebase
 const sanitizeForFirestore = (obj) => {
   if (obj === null || obj === undefined) return null;
   if (typeof obj !== 'object') return obj;
   
   const sanitized = {};
   for (const [key, value] of Object.entries(obj)) {
     // Replace undefined values with null (Firebase accepts null but not undefined)
     if (value === undefined) {
       sanitized[key] = null;
     } 
     // Recursively sanitize nested objects
     else if (value !== null && typeof value === 'object') {
       sanitized[key] = sanitizeForFirestore(value);
     } 
     // Keep other values as-is
     else {
       sanitized[key] = value;
     }
   }
   return sanitized;
 };

 // Log critical fields for debugging
 console.log("mapStateToFirebaseStructure - critical fields:", {
   projectName: orderAndPaper?.projectName,
   jobType: orderAndPaper?.jobType,
   quantity: orderAndPaper?.quantity,
   paperName: orderAndPaper?.paperName,
   dieCode: orderAndPaper?.dieCode,
   frags: orderAndPaper?.frags,
   type: orderAndPaper?.type
 });

 // Create the sanitized Firebase data structure
 const firestoreData = {
   // Client reference information
   clientId: client.clientId,
   clientInfo: sanitizeForFirestore(client.clientInfo),
   
   // Version information
   versionId: versionId || "1", // Default to version 1 if not specified
   
   // Project specific information - explicitly extract projectName
   projectName: orderAndPaper.projectName || "",
   date: orderAndPaper.date?.toISOString() || null,
   deliveryDate: orderAndPaper.deliveryDate?.toISOString() || null,
   
   // Job details with HSN code included
   jobDetails: sanitizeForFirestore({
     jobType: orderAndPaper.jobType,
     quantity: orderAndPaper.quantity,
     paperProvided: orderAndPaper.paperProvided,
     paperName: orderAndPaper.paperName,
     paperGsm: orderAndPaper.paperGsm,
     paperCompany: orderAndPaper.paperCompany,
     hsnCode: orderAndPaper.hsnCode || "",
   }),
   
   // Die details with product size directly from orderAndPaper
   dieDetails: sanitizeForFirestore({
     dieSelection: orderAndPaper.dieSelection,
     dieCode: orderAndPaper.dieCode,
     dieSize: orderAndPaper.dieSize,
     productSize: orderAndPaper.productSize,
     image: orderAndPaper.image,
     frags: orderAndPaper.frags,
     type: orderAndPaper.type
   }),
   
   // Processing options (only included when selected)
   lpDetails: lpDetails.isLPUsed ? sanitizeForFirestore(lpDetails) : null,
   fsDetails: fsDetails.isFSUsed ? sanitizeForFirestore(fsDetails) : null,
   embDetails: embDetails.isEMBUsed ? sanitizeForFirestore(embDetails) : null,
   digiDetails: digiDetails.isDigiUsed ? sanitizeForFirestore(digiDetails) : null,
   notebookDetails: notebookDetails?.isNotebookUsed ? sanitizeForFirestore(notebookDetails) : null,
   screenPrint: screenPrint?.isScreenPrintUsed ? sanitizeForFirestore(screenPrint) : null,
   preDieCutting: preDieCutting?.isPreDieCuttingUsed ? sanitizeForFirestore(preDieCutting) : null,
   dieCutting: dieCutting.isDieCuttingUsed ? sanitizeForFirestore(dieCutting) : null,
   sandwich: sandwich.isSandwichComponentUsed ? sanitizeForFirestore(sandwich) : null,
   magnet: magnet?.isMagnetUsed ? sanitizeForFirestore(magnet) : null,
   
   // Include other details based on what's enabled
   postDC: state.postDC?.isPostDCUsed ? sanitizeForFirestore(state.postDC) : null,
   foldAndPaste: state.foldAndPaste?.isFoldAndPasteUsed ? sanitizeForFirestore(state.foldAndPaste) : null,
   dstPaste: state.dstPaste?.isDstPasteUsed ? sanitizeForFirestore(state.dstPaste) : null,
   qc: state.qc?.isQCUsed ? sanitizeForFirestore(state.qc) : null,
   packing: state.packing?.isPackingUsed ? sanitizeForFirestore(state.packing) : null,
   misc: state.misc?.isMiscUsed ? sanitizeForFirestore(state.misc) : null,
   
   // Calculations - ensure markup values are included
   calculations: sanitizeForFirestore(calculations),
   
   // Metadata
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString(),
 };

 // Final verification log for critical fields
 console.log("mapStateToFirebaseStructure - final critical fields:", {
   projectName: firestoreData.projectName,
   jobType: firestoreData.jobDetails.jobType,
   quantity: firestoreData.jobDetails.quantity,
   paperName: firestoreData.jobDetails.paperName,
   dieCode: firestoreData.dieDetails.dieCode
 });
 
 return firestoreData;
};

const BillingForm = ({ initialState = null, isEditMode = false, onSubmitSuccess = null, onClose = null }) => {
 const navigate = useNavigate();
 const [state, dispatch] = useReducer(reducer, initialState || initialFormState);
 const [calculations, setCalculations] = useState(null);
 const [isCalculating, setIsCalculating] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 
 // UPDATED: Multiple sections can be open simultaneously
 const [activeSections, setActiveSections] = useState({
   reviewAndSubmit: true, // Cost calculations always open
   lp: false,
   fs: false,
   emb: false,
   digi: false,
   notebook: false,
   screenPrint: false,
   preDieCutting: false,
   dieCutting: false,
   postDC: false,
   foldAndPaste: false,
   dstPaste: false,
   magnet: false,
   qc: false,
   packing: false,
   misc: false,
   sandwich: false
 });
 
 const [validationErrors, setValidationErrors] = useState({});
 const [showResetConfirmation, setShowResetConfirmation] = useState(false);
 const [selectedClient, setSelectedClient] = useState(null);
 const [selectedVersion, setSelectedVersion] = useState("");
 const [defaultMarkup, setDefaultMarkup] = useState({ type: "MARKUP TIMELESS", percentage: 50 });
 const [selectedMarkupType, setSelectedMarkupType] = useState("MARKUP TIMELESS");
 const [markupPercentage, setMarkupPercentage] = useState(50);
 const [papers, setPapers] = useState([]);
 const [hsnRates, setHsnRates] = useState([]); // Store HSN rates from standard_rates
 const [formChangeDebug, setFormChangeDebug] = useState({}); // Track form changes for debugging
 
 // ⭐ NEW: Updated GST Rate Caching States
 const [cachedGSTRates, setCachedGSTRates] = useState({}); // Cache by job type
 const [gstError, setGstError] = useState(null);
 const previousJobType = useRef(state.orderAndPaper.jobType || "Card");
 
 // Success notification state
 const [showSuccessNotification, setShowSuccessNotification] = useState(false);
 
 // Define visible services based on the selected job type
 const [visibleProductionServices, setVisibleProductionServices] = useState([]);
 const [visiblePostProductionServices, setVisiblePostProductionServices] = useState([]);

 // Add B2B client detection using Auth context
 const { userRole, currentUser } = useAuth();
 const [isB2BClient, setIsB2BClient] = useState(false);
 const [linkedClientData, setLinkedClientData] = useState(null);

 // State to track direct initialization
 const [directInitializationDone, setDirectInitializationDone] = useState(false);

 const formRef = useRef(null);
 
 // UPDATED: Helper functions for multiple sections
 const toggleSection = (sectionId) => {
   setActiveSections(prev => ({
     ...prev,
     [sectionId]: !prev[sectionId]
   }));
 };

 const expandSection = (sectionId) => {
   setActiveSections(prev => ({
     ...prev,
     [sectionId]: true
   }));
 };
 
 // ⭐ NEW: GST Rate Caching with job type change detection
 useEffect(() => {
   const currentJobType = state.orderAndPaper.jobType || "Card";
   
   // Clear cache when job type changes
   if (currentJobType !== previousJobType.current) {
     console.log(`Job type changed: ${previousJobType.current} → ${currentJobType}, clearing GST cache`);
     setCachedGSTRates({}); // Clear cache for fresh fetch
     previousJobType.current = currentJobType;
     setGstError(null); // Clear any previous errors
   }
 }, [state.orderAndPaper.jobType]);

 // ⭐ NEW: Function to get GST rate for a job type (with caching)
 const getGSTRateForJobType = async (jobType) => {
   // Check if we have this job type cached
   if (cachedGSTRates[jobType]) {
     console.log(`Using cached GST rate for ${jobType}: ${cachedGSTRates[jobType]}%`);
     return cachedGSTRates[jobType];
   }
   
   try {
     console.log(`Fetching fresh GST rate for ${jobType}`);
     const gstRate = await fetchGSTRate(jobType);
     
     // Cache this rate for this job type
     setCachedGSTRates({ [jobType]: gstRate });
     console.log(`Cached GST rate for ${jobType}: ${gstRate}%`);
     return gstRate;
   } catch (error) {
     console.error("Error fetching GST rate:", error);
     setGstError(`Failed to fetch GST rate for ${jobType}: ${error.message}`);
     throw error;
   }
 };
 
 // Fetch HSN codes from standard_rates collection
 useEffect(() => {
   const fetchHsnCodes = async () => {
     try {
       console.log("Fetching HSN codes from gst_and_hsn collection...");
       const gstHsnCollection = collection(db, "gst_and_hsn");
       
       const unsubscribe = onSnapshot(gstHsnCollection, (snapshot) => {
         const hsnData = snapshot.docs.map((doc) => ({
           id: doc.id,
           ...doc.data(),
         }));
         
         // Filter only for HSN records - group should be "HSN"
         const hsnCodesData = hsnData.filter(item => item.group === "HSN");
         console.log(`Fetched ${hsnCodesData.length} HSN codes from gst_and_hsn`);
         
         setHsnRates(hsnCodesData);
         
         // If job type is already selected, update HSN code immediately
         if (state.orderAndPaper.jobType && hsnCodesData.length > 0) {
           updateHsnCodeForJobType(state.orderAndPaper.jobType, hsnCodesData);
         }
       });
       
       return () => unsubscribe();
     } catch (error) {
       console.error("Error fetching HSN codes:", error);
     }
   };
   
   fetchHsnCodes();
 }, []);  
 
 // Fetch papers from Firestore
 useEffect(() => {
   const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
     const paperData = snapshot.docs.map((doc) => ({
       id: doc.id,
       ...doc.data(),
     }));
     setPapers(paperData);
   });

   return () => unsubscribe();
 }, []);
 
 // Update visible services when job type changes
 useEffect(() => {
   const jobType = state.orderAndPaper.jobType || "Card";
   const config = jobTypeConfigurations[jobType] || jobTypeConfigurations["Card"];
   
   // Set visible services based on job type
   setVisibleProductionServices(config.productionServices || []);
   setVisiblePostProductionServices(config.postProductionServices || []);
   
   // Update HSN code when job type changes
   if (hsnRates.length > 0) {
     updateHsnCodeForJobType(jobType);
   }
 }, [state.orderAndPaper.jobType, hsnRates]);

 // Log form state changes for debugging critical fields
 useEffect(() => {
   // Log critical fields when they change
   console.log("BillingForm - Current critical field values:", {
    projectName: state.orderAndPaper.projectName,
    jobType: state.orderAndPaper.jobType,
    quantity: state.orderAndPaper.quantity,
    paperName: state.orderAndPaper.paperName,
    dieCode: state.orderAndPaper.dieCode,
    frags: state.orderAndPaper.frags,
    type: state.orderAndPaper.type
   });
 }, [
   state.orderAndPaper.projectName,
   state.orderAndPaper.jobType,
   state.orderAndPaper.quantity,
   state.orderAndPaper.paperName,
   state.orderAndPaper.dieCode,
   state.orderAndPaper.frags,
   state.orderAndPaper.type
 ]);

 // Direct initialization of default services
 useEffect(() => {
   // Only run this once at the beginning and only for new forms
   if (!directInitializationDone && !isEditMode) {
     console.log("Performing direct initialization of default services");
     
     // Get the current job type
     const jobType = state.orderAndPaper.jobType || "Card";
     
     // Get the services that should be active by default
     const defaultActiveProductionServices = 
       jobTypeConfigurations[jobType]?.defaultActiveServices?.production || [];
     const defaultActivePostProductionServices = 
       jobTypeConfigurations[jobType]?.defaultActiveServices?.postProduction || [];
     
     console.log("Default active services:", {
       production: defaultActiveProductionServices,
       postProduction: defaultActivePostProductionServices
     });
     
     // DIRECT SERVICE ACTIVATION - Production Services
     if (defaultActiveProductionServices.includes("LP")) {
       console.log("Activating LP service");
       dispatch({
         type: "UPDATE_LP_DETAILS",
         payload: { 
           isLPUsed: true,
           noOfColors: 1,
           colorDetails: [
             {
               plateSizeType: "Auto",
               plateDimensions: { 
                 length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                 breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
               },
               pantoneType: "",
               plateType: "Polymer Plate",
               mrType: "SIMPLE",
               mrTypeConcatenated: "LP MR SIMPLE",
               dstMaterial: ""
             }
           ]
         }
       });
     }
     
     if (defaultActiveProductionServices.includes("DIGI")) {
       console.log("Activating DIGI service");
       dispatch({
         type: "UPDATE_DIGI_DETAILS",
         payload: { 
           isDigiUsed: true,
           digiDie: "12x18",
           digiDimensions: { length: "12", breadth: "18" }
         }
       });
     }
     
     if (defaultActiveProductionServices.includes("FS")) {
       console.log("Activating FS service");
       dispatch({
         type: "UPDATE_FS_DETAILS",
         payload: { 
           isFSUsed: true,
           fsType: "FS1",
           foilDetails: [
             {
               blockSizeType: "Auto",
               blockDimension: { 
                 length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                 breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
               },
               foilType: "Gold MTS 220",
               blockType: "Magnesium Block 3MM",
               mrType: "SIMPLE",
               mrTypeConcatenated: "FS MR SIMPLE"
             }
           ]
         }
       });
     }
     
     if (defaultActiveProductionServices.includes("EMB")) {
       console.log("Activating EMB service");
       dispatch({
         type: "UPDATE_EMB_DETAILS",
         payload: { 
           isEMBUsed: true,
           plateSizeType: "Auto",
           plateDimensions: { 
             length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
             breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
           },
           plateTypeMale: "Polymer Plate",
           plateTypeFemale: "Polymer Plate",
           embMR: "SIMPLE",
           embMRConcatenated: "EMB MR SIMPLE",
           dstMaterial: ""
         }
       });
     }
     
     if (defaultActiveProductionServices.includes("SCREEN")) {
       console.log("Activating SCREEN service");
       dispatch({
         type: "UPDATE_SCREEN_PRINT",
         payload: { 
           isScreenPrintUsed: true,
           noOfColors: 1,
           screenMR: "SIMPLE",
           screenMRConcatenated: "SCREEN MR SIMPLE"
         }
       });
     }
     
     if (defaultActiveProductionServices.includes("NOTEBOOK")) {
       console.log("Activating NOTEBOOK service");
       dispatch({
         type: "UPDATE_NOTEBOOK_DETAILS",
         payload: { 
           isNotebookUsed: true,
           orientation: "",
           length: "",
           breadth: "",
           calculatedLength: "",
           calculatedBreadth: "",
           numberOfPages: "",
           bindingType: "",
           bindingTypeConcatenated: "",
           paperName: papers.length > 0 ? papers[0].paperName : ""
         }
       });
     }
     
     // DIRECT SERVICE ACTIVATION - Post-Production Services
     if (defaultActivePostProductionServices.includes("PRE DC")) {
       console.log("Activating PRE DC service");
       dispatch({
         type: "UPDATE_PRE_DIE_CUTTING",
         payload: { 
           isPreDieCuttingUsed: true,
           predcMR: "SIMPLE",
           predcMRConcatenated: "PREDC MR SIMPLE"
         }
       });
     }
     
     if (defaultActivePostProductionServices.includes("DC")) {
       console.log("Activating DC service");
       dispatch({
         type: "UPDATE_DIE_CUTTING",
         payload: { 
           isDieCuttingUsed: true,
           dcMR: "SIMPLE",
           dcMRConcatenated: "DC MR SIMPLE"
         }
       });
     }
     
     if (defaultActivePostProductionServices.includes("POST DC")) {
       console.log("Activating POST DC service");
       dispatch({
         type: "UPDATE_POST_DC",
         payload: { 
           isPostDCUsed: true,
           pdcMR: "SIMPLE",
           pdcMRConcatenated: "PDC MR SIMPLE"
         }
       });
     }
     
     if (defaultActivePostProductionServices.includes("FOLD & PASTE")) {
       console.log("Activating FOLD & PASTE service");
       dispatch({
         type: "UPDATE_FOLD_AND_PASTE",
         payload: { 
           isFoldAndPasteUsed: true,
           dstMaterial: "",
           dstType: ""
         }
       });
     }

     if (defaultActivePostProductionServices.includes("DST PASTE")) {
       console.log("Activating DST PASTE service");
       dispatch({
         type: "UPDATE_DST_PASTE",
         payload: { 
           isDstPasteUsed: true,
           dstType: ""
         }
       });
     }
     
     if (defaultActivePostProductionServices.includes("MAGNET")) {
       console.log("Activating MAGNET service");
       dispatch({
         type: "UPDATE_MAGNET",
         payload: { 
           isMagnetUsed: true,
           magnetMaterial: ""
         }
       });
     }
     
     if (defaultActivePostProductionServices.includes("QC")) {
       console.log("Activating QC service");
       dispatch({
         type: "UPDATE_QC",
         payload: { 
           isQCUsed: true
         }
       });
     }
     
     if (defaultActivePostProductionServices.includes("PACKING")) {
       console.log("Activating PACKING service");
       dispatch({
         type: "UPDATE_PACKING",
         payload: { 
           isPackingUsed: true
         }
       });
     }
     
     if (defaultActivePostProductionServices.includes("DUPLEX")) {
       console.log("Activating DUPLEX service");
       dispatch({
         type: "UPDATE_SANDWICH",
         payload: { 
           isSandwichComponentUsed: true,
           paperInfo: {
             paperName: papers.length > 0 ? papers[0].paperName : ""
           }
         }
       });
     }
     
     if (defaultActivePostProductionServices.includes("MISC")) {
       console.log("Activating MISC service");
       dispatch({
         type: "UPDATE_MISC",
         payload: { 
           isMiscUsed: true,
           miscCharge: ""
         }
       });
     }
     
     // Expand one of the active services (preferably a production service)
     let sectionToExpand = null;
     
     if (defaultActiveProductionServices.length > 0) {
       const firstActiveService = defaultActiveProductionServices[0];
       sectionToExpand = serviceRegistry[firstActiveService]?.id;
     } else if (defaultActivePostProductionServices.length > 0) {
       const firstActiveService = defaultActivePostProductionServices[0];
       sectionToExpand = serviceRegistry[firstActiveService]?.id;
     }
     
     if (sectionToExpand) {
       console.log(`Expanding section: ${sectionToExpand}`);
       expandSection(sectionToExpand);
     }
     
     // Mark initialization as done
     setDirectInitializationDone(true);
   }
 }, [directInitializationDone, isEditMode, state.orderAndPaper.jobType, papers]);

 // Initialize form with data if in edit mode
  useEffect(() => {
    if (initialState && isEditMode) {
      // Initialize form state with the provided data
      dispatch({ type: "INITIALIZE_FORM", payload: initialState });
      
      // Log critical fields for debugging
      console.log("BillingForm - Initializing with data:", {
        projectName: initialState.orderAndPaper?.projectName,
        jobType: initialState.orderAndPaper?.jobType,
        quantity: initialState.orderAndPaper?.quantity,
        paperName: initialState.orderAndPaper?.paperName,
        dieCode: initialState.orderAndPaper?.dieCode
      });
      
      // If client info exists in initialState, set the client for display
      if (initialState.client?.clientId) {
        console.log("Setting client from initialState:", initialState.client);
        
        // Create a client object from client info
        const clientData = {
          id: initialState.client.clientId,
          clientId: initialState.client.clientId,
          name: initialState.client.clientInfo?.name || "Unknown Client",
          clientCode: initialState.client.clientInfo?.clientCode || "",
          clientType: initialState.client.clientInfo?.clientType || "Direct",
          contactPerson: initialState.client.clientInfo?.contactPerson || "",
          email: initialState.client.clientInfo?.email || "",
          phone: initialState.client.clientInfo?.phone || "",
          ...initialState.client.clientInfo // Include any other client properties
        };
        
        // Set the selected client for display
        setSelectedClient(clientData);
      }
      
      // Set selected version if it exists in initialState
      if (initialState.versionId) {
        setSelectedVersion(initialState.versionId);
      }
      
      // CRITICAL FIX: Set markup BEFORE triggering calculations
      if (initialState.calculations?.markupType && initialState.calculations?.markupPercentage) {
        console.log("BillingForm - Setting markup from initialState:", {
          type: initialState.calculations.markupType,
          percentage: initialState.calculations.markupPercentage
        });
        
        setSelectedMarkupType(initialState.calculations.markupType);
        setMarkupPercentage(parseFloat(initialState.calculations.markupPercentage));
        
        // Set the calculations immediately to avoid the ReviewAndSubmit component
        // from overriding with defaults
        setCalculations(initialState.calculations);
      }
      
      // Mark initialization as done for edit mode
      setDirectInitializationDone(true);
    }
  }, [initialState, isEditMode]);

 // Add useEffect to fetch B2B client data when component mounts
 useEffect(() => {
   const fetchB2BClientData = async () => {
     if (userRole === "b2b" && currentUser) {
       try {
         setIsB2BClient(true);
         
         // First get the user doc to find the linked client ID
         const userDoc = await getDoc(doc(db, "users", currentUser.uid));
         
         if (userDoc.exists()) {
           const userData = userDoc.data();
           
           // Check if this user has a linked client ID
           if (userData.clientId) {
             // Fetch the client data
             const clientDoc = await getDoc(doc(db, "clients", userData.clientId));
             
             if (clientDoc.exists()) {
               const clientData = {
                 id: clientDoc.id,
                 clientId: clientDoc.id,
                 clientInfo: clientDoc.data(),
                 ...clientDoc.data()
               };
               
               setLinkedClientData(clientData);
               
               // Auto-select this client
               handleClientSelect({
                 clientId: clientData.id,
                 clientInfo: clientData
               });
               
               // Also set the selectedClient for props passed to ClientSelection
               setSelectedClient(clientData);
             }
           }
         }
       } catch (error) {
         console.error("Error fetching B2B client data:", error);
       }
     }
   };
   
   fetchB2BClientData();
 }, [userRole, currentUser]);
 
 // Fetch default markup rates once when component mounts
 useEffect(() => {
   const fetchDefaultMarkup = async () => {
     try {
       // Query the overheads collection for markup entries
       const overheadsCollection = collection(db, "overheads");
       const markupQuery = query(overheadsCollection, where("name", ">=", "MARKUP "), where("name", "<=", "MARKUP" + "\uf8ff"));
       const querySnapshot = await getDocs(markupQuery);
       
       const fetchedMarkups = [];
       querySnapshot.forEach(doc => {
         const data = doc.data();
         fetchedMarkups.push({
           id: doc.id,
           name: data.name,
           percentage: parseFloat(data.percentage) || 0
         });
       });
       
       if (fetchedMarkups.length > 0) {
         // For B2B clients, automatically select MARKUP B2B MERCH
         if (isB2BClient) {
           const b2bMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP B2B MERCH");
           if (b2bMarkup) {
             setDefaultMarkup({
               type: b2bMarkup.name,
               percentage: b2bMarkup.percentage
             });
             setSelectedMarkupType(b2bMarkup.name);
             setMarkupPercentage(b2bMarkup.percentage);
           } else {
             // Fallback to default if B2B MERCH not found
             setDefaultMarkup({
               type: fetchedMarkups[0].name,
               percentage: fetchedMarkups[0].percentage
             });
             setSelectedMarkupType(fetchedMarkups[0].name);
             setMarkupPercentage(fetchedMarkups[0].percentage);
           }
         } else {
           // For admin users, set default markup to MARKUP TIMELESS or first available
           const timelessMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP TIMELESS") || fetchedMarkups[0];
           setDefaultMarkup({
             type: timelessMarkup.name,
             percentage: timelessMarkup.percentage
           });
           setSelectedMarkupType(timelessMarkup.name);
           setMarkupPercentage(timelessMarkup.percentage);
         }
         
         console.log("Fetched markup rates:", fetchedMarkups);
       }
     } catch (error) {
       console.error("Error fetching markup rates:", error);
     }
   };
   
   fetchDefaultMarkup();
 }, [isB2BClient]);

 // Function to update HSN code when job type changes
 const updateHsnCodeForJobType = (jobType, ratesArray = null) => {
   // Use passed rates array or state's hsnRates
   const ratesToUse = ratesArray || hsnRates;
   
   if (!ratesToUse || ratesToUse.length === 0) {
     console.log("No HSN rates available");
     return;
   }
   
   // Find matching HSN code - match on 'type' field which contains the job type
   const matchingHsn = ratesToUse.find(rate => 
     rate.type.toUpperCase() === jobType.toUpperCase()
   );
   
   if (matchingHsn) {
     // Use 'value' instead of 'finalRate' for the new database structure
     const hsnCode = matchingHsn.value || "";
     console.log(`Found HSN code ${hsnCode} for job type ${jobType}`);
     
     // Update HSN code in state
     dispatch({
       type: "UPDATE_HSN_CODE",
       payload: hsnCode
     });
   } else {
     console.log(`No HSN code found for job type ${jobType}`);
     
     // Reset HSN code if no matching code found
     dispatch({
       type: "UPDATE_HSN_CODE",
       payload: ""
     });
   }
 };  

 // Calculate costs when form data changes
 useEffect(() => {
   const debounceTimer = setTimeout(() => {
     performCalculations();
   }, 1000); // 1 second debounce
   
   return () => clearTimeout(debounceTimer);
 }, [state]);

 // Enhanced job type change handler - direct activation approach
 const handleJobTypeChange = (e) => {
   const { value } = e.target;
   
   console.log(`Job type changed to: ${value}`);
   
   // Track the change for debugging
   setFormChangeDebug(prev => ({
     ...prev,
     jobType: value
   }));
   
   // First update the job type in state
   dispatch({
     type: "UPDATE_ORDER_AND_PAPER",
     payload: { jobType: value }
   });
   
   // Only if not in edit mode, directly activate services
   if (!isEditMode) {
     // First reset all services
     Object.entries(serviceRegistry).forEach(([serviceCode, serviceInfo]) => {
       dispatch({
         type: `UPDATE_${serviceInfo.stateKey.toUpperCase()}`,
         payload: { [serviceInfo.toggleField]: false }
       });
     });
     
     // Get default active services for the new job type
     const defaultActiveProductionServices = 
       jobTypeConfigurations[value]?.defaultActiveServices?.production || [];
     const defaultActivePostProductionServices = 
       jobTypeConfigurations[value]?.defaultActiveServices?.postProduction || [];
     
     console.log("Default active services for new job type:", {
       production: defaultActiveProductionServices,
       postProduction: defaultActivePostProductionServices
     });
     
     // Set a timeout to ensure state updates have processed
     setTimeout(() => {
       // DIRECT SERVICE ACTIVATION - Production Services
       if (defaultActiveProductionServices.includes("LP")) {
         console.log("Activating LP service");
         dispatch({
           type: "UPDATE_LP_DETAILS",
           payload: { 
             isLPUsed: true,
             noOfColors: 1,
             colorDetails: [
               {
                 plateSizeType: "Auto",
                 plateDimensions: { 
                   length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                   breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
                 },
                 pantoneType: "",
                 plateType: "Polymer Plate",
                 mrType: "SIMPLE",
                 mrTypeConcatenated: "LP MR SIMPLE"
               }
             ]
           }
         });
       }
       
       if (defaultActiveProductionServices.includes("DIGI")) {
         console.log("Activating DIGI service");
         dispatch({
           type: "UPDATE_DIGI_DETAILS",
           payload: { 
             isDigiUsed: true,
             digiDie: "12x18",
             digiDimensions: { length: "12", breadth: "18" }
           }
         });
       }
       
       if (defaultActiveProductionServices.includes("FS")) {
         console.log("Activating FS service");
         dispatch({
           type: "UPDATE_FS_DETAILS",
           payload: { 
             isFSUsed: true,
             fsType: "FS1",
             foilDetails: [
               {
                 blockSizeType: "Auto",
                 blockDimension: { 
                   length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                   breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
                 },
                 foilType: "Gold MTS 220",
                 blockType: "Magnesium Block 3MM",
                 mrType: "SIMPLE",
                 mrTypeConcatenated: "FS MR SIMPLE"
               }
             ]
           }
         });
       }
       
       if (defaultActiveProductionServices.includes("EMB")) {
         console.log("Activating EMB service");
         dispatch({
           type: "UPDATE_EMB_DETAILS",
           payload: { 
             isEMBUsed: true,
             plateSizeType: "Auto",
             plateDimensions: { 
               length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
               breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
             },
             plateTypeMale: "Polymer Plate",
             plateTypeFemale: "Polymer Plate",
             embMR: "SIMPLE",
             embMRConcatenated: "EMB MR SIMPLE"
           }
         });
       }
       
       if (defaultActiveProductionServices.includes("SCREEN")) {
         console.log("Activating SCREEN service");
         dispatch({
           type: "UPDATE_SCREEN_PRINT",
           payload: { 
             isScreenPrintUsed: true,
             noOfColors: 1,
             screenMR: "SIMPLE",
             screenMRConcatenated: "SCREEN MR SIMPLE"
           }
         });
       }
       
       if (defaultActiveProductionServices.includes("NOTEBOOK")) {
         console.log("Activating NOTEBOOK service");
         dispatch({
           type: "UPDATE_NOTEBOOK_DETAILS",
           payload: { 
             isNotebookUsed: true,
             orientation: "",
             length: "",
             breadth: "",
             calculatedLength: "",
             calculatedBreadth: "",
             numberOfPages: "",
             bindingType: "",
             bindingTypeConcatenated: "",
             paperName: papers.length > 0 ? papers[0].paperName : ""
           }
         });
       }
       
       // DIRECT SERVICE ACTIVATION - Post-Production Services
       if (defaultActivePostProductionServices.includes("PRE DC")) {
         console.log("Activating PRE DC service");
         dispatch({
           type: "UPDATE_PRE_DIE_CUTTING",
           payload: { 
             isPreDieCuttingUsed: true,
             predcMR: "SIMPLE",
             predcMRConcatenated: "PREDC MR SIMPLE"
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("DC")) {
         console.log("Activating DC service");
         dispatch({
           type: "UPDATE_DIE_CUTTING",
           payload: { 
             isDieCuttingUsed: true,
             dcMR: "SIMPLE",
             dcMRConcatenated: "DC MR SIMPLE"
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("POST DC")) {
         console.log("Activating POST DC service");
         dispatch({
           type: "UPDATE_POST_DC",
           payload: { 
             isPostDCUsed: true,
             pdcMR: "SIMPLE",
             pdcMRConcatenated: "PDC MR SIMPLE"
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("FOLD & PASTE")) {
         console.log("Activating FOLD & PASTE service");
         dispatch({
           type: "UPDATE_FOLD_AND_PASTE",
           payload: { 
             isFoldAndPasteUsed: true,
             dstMaterial: "",
             dstType: ""
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("DST PASTE")) {
         console.log("Activating DST PASTE service");
         dispatch({
           type: "UPDATE_DST_PASTE",
           payload: { 
             isDstPasteUsed: true,
             dstType: ""
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("MAGNET")) {
         console.log("Activating MAGNET service");
         dispatch({
           type: "UPDATE_MAGNET",
           payload: { 
             isMagnetUsed: true,
             magnetMaterial: ""
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("QC")) {
         console.log("Activating QC service");
         dispatch({
           type: "UPDATE_QC",
           payload: { 
             isQCUsed: true
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("PACKING")) {
         console.log("Activating PACKING service");
         dispatch({
           type: "UPDATE_PACKING",
           payload: { 
             isPackingUsed: true
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("DUPLEX")) {
         console.log("Activating DUPLEX service");
         dispatch({
           type: "UPDATE_SANDWICH",
           payload: { 
             isSandwichComponentUsed: true,
             paperInfo: {
               paperName: papers.length > 0 ? papers[0].paperName : ""
             }
           }
         });
       }
       
       if (defaultActivePostProductionServices.includes("MISC")) {
         console.log("Activating MISC service");
         dispatch({
           type: "UPDATE_MISC",
           payload: { 
             isMiscUsed: true,
             miscCharge: ""
           }
         });
       }
       
       // Open first activated section if available
       let sectionToExpand = null;
       
       if (defaultActiveProductionServices.length > 0) {
         const firstActiveService = defaultActiveProductionServices[0];
         sectionToExpand = serviceRegistry[firstActiveService]?.id;
       } else if (defaultActivePostProductionServices.length > 0) {
         const firstActiveService = defaultActivePostProductionServices[0];
         sectionToExpand = serviceRegistry[firstActiveService]?.id;
       }
       
       if (sectionToExpand) {
         console.log(`Expanding section: ${sectionToExpand}`);
         expandSection(sectionToExpand);
       }
     }, 0);
   }
   
   // Update HSN code when job type changes
   if (hsnRates.length > 0) {
     updateHsnCodeForJobType(value);
   }
 };

 // ⭐ UPDATED: Function to handle markup changes from ReviewAndSubmit component
 const handleMarkupChange = async (markupType, markupPercentage) => {
   // For B2B clients, only allow MARKUP B2B MERCH to be selected
   if (isB2BClient && markupType !== "MARKUP B2B MERCH") {
     const b2bMarkup = markupRates.find(rate => rate.name === "MARKUP B2B MERCH");
     if (b2bMarkup) {
       markupType = b2bMarkup.name;
       markupPercentage = b2bMarkup.percentage;
     }
   }
   
   setSelectedMarkupType(markupType);
   setMarkupPercentage(markupPercentage);
   
   await recalculateWithMarkup(markupType, markupPercentage);
 };

 // Function to close success notification
 const closeSuccessNotification = () => {
   setShowSuccessNotification(false);
 };

 // ⭐ UPDATED: Function to recalculate totals when markup changes (with fresh GST)
  const recalculateWithMarkup = async (markupType, markupPercentage) => {
    console.log("Recalculating with new markup:", markupType, markupPercentage);
    setIsCalculating(true);
    try {
      const jobType = state.orderAndPaper?.jobType || "Card";
      
      // Get GST rate (cached or fresh) for this job type
      const gstRate = await getGSTRateForJobType(jobType);
      
      // Get the misc charge from the form state if available and misc is enabled
      const miscCharge = state.misc?.isMiscUsed && state.misc?.miscCharge 
        ? parseFloat(state.misc.miscCharge) 
        : null;

      // CRITICAL FIX: Handle edit mode differently
      if (isEditMode && calculations && !calculations.error) {
        console.log("Edit mode detected - using simplified markup recalculation");
        
        // Use the displayed subtotal as the base for markup calculation
        const subtotalPerCard = parseFloat(calculations.subtotalPerCard || calculations.costWithMisc || 0);
        const quantity = parseInt(state.orderAndPaper?.quantity || 1);
        
        // Calculate new markup amount based on displayed subtotal
        const newMarkupAmount = subtotalPerCard * (markupPercentage / 100);
        const newTotalCostPerCard = subtotalPerCard + newMarkupAmount;
        const newTotalCost = newTotalCostPerCard * quantity;
        
        // Recalculate GST on the new total
        const newGstAmount = newTotalCost * (gstRate / 100);
        const newTotalWithGST = newTotalCost + newGstAmount;
        
        // Create updated calculations object
        const updatedCalculations = {
          ...calculations,
          markupType: markupType,
          markupPercentage: markupPercentage,
          markupAmount: newMarkupAmount.toFixed(2),
          totalCostPerCard: newTotalCostPerCard.toFixed(2),
          totalCost: newTotalCost.toFixed(2),
          gstRate: gstRate,
          gstAmount: newGstAmount.toFixed(2),
          totalWithGST: newTotalWithGST.toFixed(2)
        };
        
        console.log("Edit mode markup recalculation completed:", {
          subtotalPerCard: subtotalPerCard.toFixed(2),
          markupPercentage,
          markupAmount: newMarkupAmount.toFixed(2),
          totalCostPerCard: newTotalCostPerCard.toFixed(2),
          totalCost: newTotalCost.toFixed(2),
          gstAmount: newGstAmount.toFixed(2),
          totalWithGST: newTotalWithGST.toFixed(2)
        });
        
        setCalculations(updatedCalculations);
        return;
      }

      // For new estimates (non-edit mode), use the existing complex recalculation logic
      console.log("New estimate mode - using full recalculation logic");
      
      // Use the recalculateTotals function from calculationsService if we already have base calculations
      if (calculations && !calculations.error) {
        console.log("Using existing calculations for recalculation");
        
        // Call recalculateTotals with the existing calculations, updated markup info, quantity, and fresh GST rate
        const result = await recalculateTotals(
          calculations,
          miscCharge, // Use the custom misc charge if available
          markupPercentage,
          parseInt(state.orderAndPaper?.quantity, 10) || 0,
          markupType,
          state.orderAndPaper?.jobType || "Card",
          null, // clientLoyaltyTier
          gstRate // ⭐ Pass fresh GST rate
        );

        if (result.error) {
          console.error("Error recalculating with new markup:", result.error);
          // Don't update calculations if there's an error
        } else {
          console.log("Updated calculations with new markup:", result);
          setCalculations(result);
        }
      } else {
        console.log("No existing calculations - performing complete calculation");
        
        // If we don't have base calculations yet, perform a complete calculation
        const result = await performCompleteCalculations(
          state,
          miscCharge, // Use the custom misc charge if available
          markupPercentage,
          markupType,
          gstRate // ⭐ Pass fresh GST rate
        );
        
        if (result.error) {
          console.error("Error during complete calculations:", result.error);
          // Don't update calculations if there's an error
        } else {
          console.log("Complete calculations performed successfully:", result);
          setCalculations(result);
        }
      }
    } catch (error) {
      console.error("Unexpected error during markup recalculation:", error);
      
      // Fallback: If there's an error and we're in edit mode, try a simple calculation
      if (isEditMode && calculations && !calculations.error) {
        try {
          const subtotalPerCard = parseFloat(calculations.subtotalPerCard || 0);
          const quantity = parseInt(state.orderAndPaper?.quantity || 1);
          const fallbackGstRate = 18; // Default GST rate
          
          const markupAmount = subtotalPerCard * (markupPercentage / 100);
          const totalCostPerCard = subtotalPerCard + markupAmount;
          const totalCost = totalCostPerCard * quantity;
          const gstAmount = totalCost * (fallbackGstRate / 100);
          const totalWithGST = totalCost + gstAmount;
          
          const fallbackCalculations = {
            ...calculations,
            markupType: markupType,
            markupPercentage: markupPercentage,
            markupAmount: markupAmount.toFixed(2),
            totalCostPerCard: totalCostPerCard.toFixed(2),
            totalCost: totalCost.toFixed(2),
            gstRate: fallbackGstRate,
            gstAmount: gstAmount.toFixed(2),
            totalWithGST: totalWithGST.toFixed(2),
            error: "Using fallback calculation due to error"
          };
          
          console.log("Applied fallback calculation for edit mode:", fallbackCalculations);
          setCalculations(fallbackCalculations);
        } catch (fallbackError) {
          console.error("Even fallback calculation failed:", fallbackError);
        }
      }
    } finally {
      setIsCalculating(false);
    }
  };

 // ⭐ UPDATED: Enhanced calculation function using the centralized calculation service (with fresh GST)
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
     const jobType = state.orderAndPaper?.jobType || "Card";
     
     // Get GST rate (cached or fresh) for this job type
     const gstRate = await getGSTRateForJobType(jobType);
     
     // Get the misc charge from the form state if available and misc is enabled
     const miscCharge = state.misc?.isMiscUsed && state.misc?.miscCharge 
       ? parseFloat(state.misc.miscCharge) 
       : null; // Pass null to let the calculator fetch from DB
     
     // Pass the current markup values, misc charge, and fresh GST rate to the calculation service
     const result = await performCompleteCalculations(
       state,
       miscCharge, // Use the custom misc charge if available
       markupPercentage,
       selectedMarkupType,
       gstRate // ⭐ Pass fresh GST rate
     );
     
     if (result.error) {
       console.error("Error during calculations:", result.error);
     } else {
       // Verify markup values are included
       console.log("Calculation results with markup:", {
         markupType: result.markupType,
         markupPercentage: result.markupPercentage,
         markupAmount: result.markupAmount,
         gstRate: result.gstRate,
         miscCharge: miscCharge ? `Custom: ${miscCharge}` : "From DB"
       });
       
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
   
   // Validate Client selection - skip in edit mode
   if (!isEditMode && !client.clientId) {
     errors.clientId = "Client selection is required";
   }
   
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
 const handleCreateEstimate = (enhancedCalculations) => {
   // Log received calculations to verify markup values
   console.log("Enhanced calculations from ReviewAndSubmit:", {
     markupType: enhancedCalculations?.markupType,
     markupPercentage: enhancedCalculations?.markupPercentage,
     markupAmount: enhancedCalculations?.markupAmount,
     gstRate: enhancedCalculations?.gstRate
   });
   
   // Store the enhanced calculations to use in handleSubmit
   if (enhancedCalculations) {
     setCalculations(enhancedCalculations);
   }
   
   // Submit the form with the updated calculations
   handleSubmit(new Event('submit'));
 };

 // Function to perform a partial reset of the form, keeping client, version, and order info
 const partialResetForm = () => {
   const partialReset = {
     ...initialFormState,
     // Keep client information
     client: { ...state.client },
     // Keep version information
     versionId: state.versionId,
     // Keep order and paper information
     orderAndPaper: { ...state.orderAndPaper }
   };
   
   dispatch({ type: "INITIALIZE_FORM", payload: partialReset });
   setCalculations(null);
   setActiveSections(prev => ({
     ...prev,
     reviewAndSubmit: true // Keep cost calculations open
   }));
   
   // Reset direct initialization flag to reapply default services
   setDirectInitializationDone(false);
   
   // Set default active services for current job type
   const jobType = state.orderAndPaper.jobType || "Card";
   
   // Wait for state to be updated
   setTimeout(() => {
     // Get default active services for the job type
     const defaultActiveProductionServices = 
       jobTypeConfigurations[jobType]?.defaultActiveServices?.production || [];
     const defaultActivePostProductionServices = 
       jobTypeConfigurations[jobType]?.defaultActiveServices?.postProduction || [];
     
     console.log("Re-activating default services after partial reset:", {
       production: defaultActiveProductionServices,
       postProduction: defaultActivePostProductionServices
     });
     
     // Re-activate default services and expand their sections
     defaultActiveProductionServices.forEach(serviceCode => {
       const sectionId = serviceRegistry[serviceCode]?.id;
       if (sectionId) {
         expandSection(sectionId);
       }
     });
     
     defaultActivePostProductionServices.forEach(serviceCode => {
       const sectionId = serviceRegistry[serviceCode]?.id;
       if (sectionId) {
         expandSection(sectionId);
       }
     });
     
     // Mark initialization as done
     setDirectInitializationDone(true);
   }, 0);
 };

 // Function for full reset (used by the reset button)
 const fullResetForm = () => {
   dispatch({ type: "RESET_FORM" });
   setActiveSections({
     reviewAndSubmit: true, // Keep cost calculations open
     lp: false,
     fs: false,
     emb: false,
     digi: false,
     notebook: false,
     screenPrint: false,
     preDieCutting: false,
     dieCutting: false,
     postDC: false,
     foldAndPaste: false,
     dstPaste: false,
     magnet: false,
     qc: false,
     packing: false,
     misc: false,
     sandwich: false
   });
   setValidationErrors({});
   setCalculations(null);
   
   // Don't reset client for B2B users, they should always use their own client
   if (!isB2BClient) {
     setSelectedClient(null);
   }
   
   setSelectedVersion("");
   
   // Reset markup to defaults
   setSelectedMarkupType(defaultMarkup.type);
   setMarkupPercentage(defaultMarkup.percentage);
   
   // Reset GST cache
   setCachedGSTRates({});
   setGstError(null);
   previousJobType.current = "Card"; // Reset to default job type
   
   // Reset direct initialization flag
   setDirectInitializationDone(false);
   
   // Set default active services for the default job type after reset
   const jobType = "Card"; // Default job type
   
   // Using a timeout to ensure state is reset before setting default services
   setTimeout(() => {
     // Get default active services for the job type
     const defaultActiveProductionServices = 
       jobTypeConfigurations[jobType]?.defaultActiveServices?.production || [];
     const defaultActivePostProductionServices = 
       jobTypeConfigurations[jobType]?.defaultActiveServices?.postProduction || [];
     
     console.log("Re-activating default services after full reset:", {
       production: defaultActiveProductionServices,
       postProduction: defaultActivePostProductionServices
     });
     
     // Mark as initialized
     setDirectInitializationDone(true);
     
     // Expand default sections
     defaultActiveProductionServices.forEach(serviceCode => {
       const sectionId = serviceRegistry[serviceCode]?.id;
       if (sectionId) {
         expandSection(sectionId);
       }
     });
     
     defaultActivePostProductionServices.forEach(serviceCode => {
       const sectionId = serviceRegistry[serviceCode]?.id;
       if (sectionId) {
         expandSection(sectionId);
       }
     });
   }, 0);
   
   // Scroll to top of form
   if (formRef.current) {
     formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
   }
 };

 // Updated handleSubmit function with better debugging and explicit field handling
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
   
   // Log critical form state before submission for debugging
   console.log("Form state before submission:", {
     jobType: state.orderAndPaper.jobType,
     quantity: state.orderAndPaper.quantity,
     paperName: state.orderAndPaper.paperName,
     dieCode: state.orderAndPaper.dieCode,
     projectName: state.orderAndPaper.projectName
   });
   
   setIsSubmitting(true);
   try {
     // Double-check that markup values exist before saving
     const calculationsWithMarkup = {
       ...calculations,
       markupType: selectedMarkupType,
       markupPercentage: markupPercentage,
       markupAmount: calculations?.markupAmount || "0.00"
     };
     
     // Create the formatted data for Firebase using the enhanced calculations
     const formattedData = mapStateToFirebaseStructure(state, calculationsWithMarkup);
     
     // Log the data before saving to verify critical fields
     console.log("Saving to Firebase - critical fields:", {
       jobType: formattedData.jobDetails.jobType,
       quantity: formattedData.jobDetails.quantity,
       paperName: formattedData.jobDetails.paperName,
       dieCode: formattedData.dieDetails.dieCode,
       projectName: formattedData.projectName
     });
     
     if (isEditMode && onSubmitSuccess) {
       await onSubmitSuccess(formattedData);
       if (onClose) onClose();
     } else {
       await addDoc(collection(db, "estimates"), formattedData);
       
       // Show success notification
       setShowSuccessNotification(true);
       
       // Instead of fully resetting and navigating away, only reset production and post-production sections
       partialResetForm();
     }
   } catch (error) {
     console.error("Error handling estimate:", error);
     alert("Failed to handle estimate.");
   } finally {
     setIsSubmitting(false);
   }
 };

 // Handle client selection from ClientSelection component
 const handleClientSelect = (clientData) => {
   // Don't allow client selection changes in edit mode
   if (isEditMode) return;
 
   if (clientData) {
     // Ensure clientInfo has a category property to avoid undefined values
     const sanitizedClientInfo = clientData.clientInfo || {};
     if (sanitizedClientInfo.category === undefined) {
       sanitizedClientInfo.category = null;
     }
     
     dispatch({
       type: "UPDATE_CLIENT",
       payload: {
         clientId: clientData.clientId,
         clientInfo: sanitizedClientInfo
       }
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

 // UPDATED: Toggle functions for all service sections
 const toggleLPUsage = () => {
   const isCurrentlyUsed = state.lpDetails.isLPUsed;
   
   dispatch({
     type: "UPDATE_LP_DETAILS",
     payload: { 
       isLPUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         noOfColors: 1,
         colorDetails: [
           {
             plateSizeType: "Auto",
             plateDimensions: { 
               length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
               breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
             },
             pantoneType: "",
             plateType: "Polymer Plate",
             mrType: "SIMPLE",
             mrTypeConcatenated: "LP MR SIMPLE",
             dstMaterial: ""
           }
         ]
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("lp");
   }
 };  
 
 const toggleFSUsage = () => {
   const isCurrentlyUsed = state.fsDetails.isFSUsed;
   
   dispatch({
     type: "UPDATE_FS_DETAILS",
     payload: { 
       isFSUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         fsType: "FS1",
         foilDetails: [
           {
             blockSizeType: "Auto",
             blockDimension: { 
               length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
               breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
             },
             foilType: "Gold MTS 220",
             blockType: "Magnesium Block 3MM",
             mrType: "SIMPLE", // Display value
             mrTypeConcatenated: "FS MR SIMPLE" // Value for calculations
           }
         ]
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("fs");
   }
 };
 
 const toggleEMBUsage = () => {
   const isCurrentlyUsed = state.embDetails.isEMBUsed;
   
   dispatch({
     type: "UPDATE_EMB_DETAILS",
     payload: { 
       isEMBUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         plateSizeType: "Auto",
         plateDimensions: { 
           length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
           breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
         },
         plateTypeMale: "Polymer Plate",
         plateTypeFemale: "Polymer Plate",
         embMR: "SIMPLE",
         embMRConcatenated: "EMB MR SIMPLE",
         dstMaterial: ""
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("emb");
   }
 };    
 
 const toggleDigiUsage = () => {
   const isCurrentlyUsed = state.digiDetails.isDigiUsed;
   
   // Define default DIGI_DIE_OPTIONS (same as in DigiDetails component)
   const DIGI_DIE_OPTIONS = {
     "12x18": { length: "12", breadth: "18" },
     "13x19": { length: "13", breadth: "19" },
   };
   
   // Get the first option as default
   const firstOption = Object.keys(DIGI_DIE_OPTIONS)[0] || "12x18";
   const defaultDimensions = DIGI_DIE_OPTIONS[firstOption] || { length: "12", breadth: "18" };
   
   dispatch({
     type: "UPDATE_DIGI_DETAILS",
     payload: { 
       isDigiUsed: !isCurrentlyUsed,
       // When toggling on, initialize with the first option
       ...(!isCurrentlyUsed && {
         digiDie: firstOption,
         digiDimensions: defaultDimensions
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("digi");
   }
 };
 
 const toggleNotebookUsage = () => {
   const isCurrentlyUsed = state.notebookDetails?.isNotebookUsed || false;
   
   dispatch({
     type: "UPDATE_NOTEBOOK_DETAILS",
     payload: { 
       isNotebookUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         orientation: "",
         length: "",
         breadth: "",
         calculatedLength: "",
         calculatedBreadth: "",
         numberOfPages: "",
         bindingType: "",
         bindingTypeConcatenated: "",
         paperName: papers.length > 0 ? papers[0].paperName : ""
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("notebook");
   }
 };

 const toggleScreenPrintUsage = () => {
   const isCurrentlyUsed = state.screenPrint?.isScreenPrintUsed || false;
   
   dispatch({
     type: "UPDATE_SCREEN_PRINT",
     payload: { 
       isScreenPrintUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         noOfColors: 1,
         screenMR: "SIMPLE", // Default value
         screenMRConcatenated: "SCREEN MR SIMPLE" // Default concatenated value
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("screenPrint");
   }
 };
 
 // Add Toggle function for PreDieCutting
 const togglePreDieCuttingUsage = () => {
   const isCurrentlyUsed = state.preDieCutting?.isPreDieCuttingUsed || false;
   
   dispatch({
     type: "UPDATE_PRE_DIE_CUTTING",
     payload: { 
       isPreDieCuttingUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         predcMR: "SIMPLE", // Default value
         predcMRConcatenated: "PREDC MR SIMPLE" // Default concatenated value
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("preDieCutting");
   }
 };
 
 const toggleDieCuttingUsage = () => {
   const isCurrentlyUsed = state.dieCutting.isDieCuttingUsed;
   
   dispatch({
     type: "UPDATE_DIE_CUTTING",
     payload: { 
       isDieCuttingUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         dcMR: "SIMPLE",
         dcMRConcatenated: "DC MR SIMPLE"
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("dieCutting");
   }
 };
 
 const togglePostDCUsage = () => {
   const isCurrentlyUsed = state.postDC?.isPostDCUsed || false;
   
   dispatch({
     type: "UPDATE_POST_DC",
     payload: { 
       isPostDCUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         pdcMR: "SIMPLE", // Default value, will be replaced when MR types are loaded
         pdcMRConcatenated: "PDC MR SIMPLE" // Default concatenated value
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("postDC");
   }
 };
 
 const toggleFoldAndPasteUsage = () => {
   const isCurrentlyUsed = state.foldAndPaste?.isFoldAndPasteUsed || false;
   
   dispatch({
     type: "UPDATE_FOLD_AND_PASTE",
     payload: { 
       isFoldAndPasteUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         dstMaterial: "", // Initialize dstMaterial field
         dstType: ""      // Initialize dstType field
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("foldAndPaste");
   }
 };
 
 const toggleDstPasteUsage = () => {
   const isCurrentlyUsed = state.dstPaste?.isDstPasteUsed || false;
   
   dispatch({
     type: "UPDATE_DST_PASTE",
     payload: { 
       isDstPasteUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         dstType: ""  // Initialize dstType field
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("dstPaste");
   }
 };

 const toggleMagnetUsage = () => {
   const isCurrentlyUsed = state.magnet?.isMagnetUsed || false;
   
   dispatch({
     type: "UPDATE_MAGNET",
     payload: { 
       isMagnetUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         magnetMaterial: ""
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("magnet");
   }
 };
 
 const toggleQCUsage = () => {
   const isCurrentlyUsed = state.qc?.isQCUsed || false;
   
   dispatch({
     type: "UPDATE_QC",
     payload: { isQCUsed: !isCurrentlyUsed }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("qc");
   }
 };
 
 const togglePackingUsage = () => {
   const isCurrentlyUsed = state.packing?.isPackingUsed || false;
   
   dispatch({
     type: "UPDATE_PACKING",
     payload: { isPackingUsed: !isCurrentlyUsed }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("packing");
   }
 };
 
 const toggleMiscUsage = () => {
   const isCurrentlyUsed = state.misc?.isMiscUsed || false;
   
   dispatch({
     type: "UPDATE_MISC",
     payload: { 
       isMiscUsed: !isCurrentlyUsed,
       miscCharge: "" // Initialize as empty string to allow fetching from DB
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("misc");
   }
 };
 
 const toggleSandwichUsage = () => {
   const isCurrentlyUsed = state.sandwich?.isSandwichComponentUsed || false;
   const defaultPaperName = papers.length > 0 ? papers[0].paperName : "";
   
   dispatch({
     type: "UPDATE_SANDWICH",
     payload: { 
       isSandwichComponentUsed: !isCurrentlyUsed,
       ...((!isCurrentlyUsed) && {
         // Initialize with the default paper if available
         paperInfo: {
           paperName: defaultPaperName
         },
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
           plateDimensions: { 
             length: "", 
             breadth: "",
             lengthInInches: "",
             breadthInInches: "" 
           },
           plateTypeMale: "",
           plateTypeFemale: "",
           embMR: "",
           embMRConcatenated: ""
         }
       })
     }
   });
   
   // Auto expand when toggled on
   if (!isCurrentlyUsed) {
     expandSection("sandwich");
   }
 };
 
 // UPDATED: Special function for ReviewAndSubmit section
 const toggleReviewSection = () => {
   toggleSection("reviewAndSubmit");
 };

 // Handle reset form
 const handleResetForm = () => {
   setShowResetConfirmation(true);
 };

 const confirmResetForm = () => {
   // Close the confirmation modal
   setShowResetConfirmation(false);
   
   // Show a brief loading message (optional)
   setIsSubmitting(true);
   
   // Short timeout to allow the UI to update before refreshing
   setTimeout(() => {
     // Refresh the page
     window.location.reload();
   }, 100);
 };  

 // Check if a service is visible for the current job type
 const isServiceVisible = (serviceCode) => {
   return (
     visibleProductionServices.includes(serviceCode) ||
     visiblePostProductionServices.includes(serviceCode)
   );
 };

 return (
   <div className="bg-white rounded-lg">
     <div className="max-w-screen-xl mx-auto p-4">
       <div className="flex justify-between items-center mb-4">
         <div className="mb-6">
           <h1 className="text-2xl font-bold text-gray-900">
             New Bill
           </h1>
           <p className="text-gray-600 mt-1">
             Create, edit and generate new bills and estimates
           </p>
         </div>
         
         <div className="flex space-x-3">
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

       {/* ⭐ UPDATED: GST Error Display */}
       {gstError && (
         <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
           <p className="text-red-600 text-sm">
             <strong>GST Configuration Error:</strong> {gstError}
           </p>
           <p className="text-red-500 text-xs mt-1">
             Please ensure GST rates are configured in the database for all job types.
           </p>
         </div>
       )}

       {/* Success Notification Component */}
       <SuccessNotification
         message="Estimate Created Successfully! You can create another estimate with the same client and project details."
         isVisible={showSuccessNotification}
         onClose={closeSuccessNotification}
         duration={3000}
       />

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
         {/* Client Selection Section - Modified for B2B users */}
         <FixedSection
           state={state}
           dispatch={dispatch}
           isEditMode={isEditMode}
           selectedClient={selectedClient}
           setSelectedClient={setSelectedClient}
           selectedVersion={selectedVersion}
           handleClientSelect={handleClientSelect}
           handleVersionSelect={handleVersionSelect}
           generateClientCode={generateClientCode}
           isB2BClient={isB2BClient}
           linkedClientData={linkedClientData}
           validationErrors={validationErrors}
           handleJobTypeChange={handleJobTypeChange}
         />

         {/* Production Services Section */}
         <div className="mb-6 shadow rounded-lg px-4 py-3 border-b border-gray-200">
           <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-medium text-gray-800">Production Services</h2>
           
           {/* LP Section */}
           {isServiceVisible("LP") && (
             <FormSection 
               title="Letter Press (LP)" 
               id="lp"
               activeSection={activeSections.lp ? "lp" : null}
               setActiveSection={() => toggleSection("lp")}
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
           )}

           {/* FS Section */}
           {isServiceVisible("FS") && (
             <FormSection 
               title="Foil Stamping (FS)" 
               id="fs"
               activeSection={activeSections.fs ? "fs" : null}
               setActiveSection={() => toggleSection("fs")}
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
           )}
           
           {/* EMB Section */}
           {isServiceVisible("EMB") && (
             <FormSection 
               title="Embossing (EMB)" 
               id="emb"
               activeSection={activeSections.emb ? "emb" : null}
               setActiveSection={() => toggleSection("emb")}
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
           )}
           
           {/* DIGI Section */}
           {isServiceVisible("DIGI") && (
             <FormSection 
               title="Digital Printing" 
               id="digi"
               activeSection={activeSections.digi ? "digi" : null}
               setActiveSection={() => toggleSection("digi")}
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
           )}
           
           {/* NOTEBOOK Section */}
           {isServiceVisible("NOTEBOOK") && (
             <FormSection 
               title="Notebook Details" 
               id="notebook"
               activeSection={activeSections.notebook ? "notebook" : null}
               setActiveSection={() => toggleSection("notebook")}
               isUsed={state.notebookDetails?.isNotebookUsed || false}
               onToggleUsage={toggleNotebookUsage}
             >
               <NotebookDetails 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}
           
           {/* SCREEN Section */}
           {isServiceVisible("SCREEN") && (
             <FormSection 
               title="Screen Printing" 
               id="screenPrint"
               activeSection={activeSections.screenPrint ? "screenPrint" : null}
               setActiveSection={() => toggleSection("screenPrint")}
               isUsed={state.screenPrint?.isScreenPrintUsed || false}
               onToggleUsage={toggleScreenPrintUsage}
             >
               <ScreenPrint 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}
         </div>

         {/* Post-Production Services Section */}
         <div className="mb-6 shadow rounded-lg px-4 py-3 border-b border-gray-200">
           <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-medium text-gray-800">Post-Production Services</h2>
           
           {/* Pre Die Cutting Section */}
           {isServiceVisible("PRE DC") && (
             <FormSection 
               title="Pre Die Cutting" 
               id="preDieCutting"
               activeSection={activeSections.preDieCutting ? "preDieCutting" : null}
               setActiveSection={() => toggleSection("preDieCutting")}
               isUsed={state.preDieCutting?.isPreDieCuttingUsed || false}
               onToggleUsage={togglePreDieCuttingUsage}
             >
               <PreDieCutting 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}
           
           {/* Die Cutting Section */}
           {isServiceVisible("DC") && (
             <FormSection 
               title="Die Cutting" 
               id="dieCutting"
               activeSection={activeSections.dieCutting ? "dieCutting" : null}
               setActiveSection={() => toggleSection("dieCutting")}
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
           )}

           {/* Post DC Section */}
           {isServiceVisible("POST DC") && (
             <FormSection 
               title="Post Die Cutting" 
               id="postDC"
               activeSection={activeSections.postDC ? "postDC" : null}
               setActiveSection={() => toggleSection("postDC")}
               isUsed={state.postDC?.isPostDCUsed || false}
               onToggleUsage={togglePostDCUsage}
             >
               <PostDC 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}

           {/* DST Paste Section */}
           {isServiceVisible("DST PASTE") && (
             <FormSection 
               title="DST Paste" 
               id="dstPaste"
               activeSection={activeSections.dstPaste ? "dstPaste" : null}
               setActiveSection={() => toggleSection("dstPaste")}
               isUsed={state.dstPaste?.isDstPasteUsed || false}
               onToggleUsage={toggleDstPasteUsage}
             >
               <DstPaste 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}

           {/* Fold & Paste Section */}
           {isServiceVisible("FOLD & PASTE") && (
             <FormSection 
               title="Fold & Paste" 
               id="foldAndPaste"
               activeSection={activeSections.foldAndPaste ? "foldAndPaste" : null}
               setActiveSection={() => toggleSection("foldAndPaste")}
               isUsed={state.foldAndPaste?.isFoldAndPasteUsed || false}
               onToggleUsage={toggleFoldAndPasteUsage}
             >
               <FoldAndPaste 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}

           {/* Magnet Section */}
           {isServiceVisible("MAGNET") && (
             <FormSection 
               title="Magnet" 
               id="magnet"
               activeSection={activeSections.magnet ? "magnet" : null}
               setActiveSection={() => toggleSection("magnet")}
               isUsed={state.magnet?.isMagnetUsed || false}
               onToggleUsage={toggleMagnetUsage}
             >
               <Magnet 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}

           {/* QC Section */}
           {isServiceVisible("QC") && (
             <FormSection 
               title="Quality Check" 
               id="qc"
               activeSection={activeSections.qc ? "qc" : null}
               setActiveSection={() => toggleSection("qc")}
               isUsed={state.qc?.isQCUsed || false}
               onToggleUsage={toggleQCUsage}
             >
               <QC 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}

           {/* Packing Section */}
           {isServiceVisible("PACKING") && (
             <FormSection 
               title="Packing" 
               id="packing"
               activeSection={activeSections.packing ? "packing" : null}
               setActiveSection={() => toggleSection("packing")}
               isUsed={state.packing?.isPackingUsed || false}
               onToggleUsage={togglePackingUsage}
             >
               <Packing 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}
           
           {/* Misc Section */}
           {isServiceVisible("MISC") && (
             <FormSection 
               title="Miscellaneous" 
               id="misc"
               activeSection={activeSections.misc ? "misc" : null}
               setActiveSection={() => toggleSection("misc")}
               isUsed={state.misc?.isMiscUsed || false}
               onToggleUsage={toggleMiscUsage}
             >
               <Misc 
                 state={state} 
                 dispatch={dispatch} 
                 onNext={() => {}} 
                 onPrevious={() => {}} 
                 singlePageMode={true}
               />
             </FormSection>
           )}

           {/* Sandwich Section */}
           {isServiceVisible("DUPLEX") && (
             <FormSection 
               title="Duplex/Sandwich" 
               id="sandwich"
               activeSection={activeSections.sandwich ? "sandwich" : null}
               setActiveSection={() => toggleSection("sandwich")}
               isUsed={state.sandwich?.isSandwichComponentUsed || false}
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
           )}
         </div>

         {/* Cost Calculation & Review Section - Now Always Open but Still Collapsible */}
         <div className="mt-6">
           <FormSection 
             title="COST CALCULATION" 
             id="reviewAndSubmit"
             activeSection={activeSections.reviewAndSubmit ? "reviewAndSubmit" : null}
             setActiveSection={() => toggleSection("reviewAndSubmit")}
             isUsed={true}
             onToggleUsage={toggleReviewSection}
             bgColor="bg-blue-50"
           >
             <ReviewAndSubmit 
               state={state} 
               calculations={calculations} 
               isCalculating={isCalculating} 
               onCreateEstimate={handleCreateEstimate}
               onMarkupChange={handleMarkupChange} 
               isEditMode={isEditMode}
               isSaving={isSubmitting}
               previewMode={!isSubmitting}
             />
           </FormSection>
         </div>

         <div className="flex flex-row-reverse justify-between mt-8 border-t pt-6">
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
                 isEditMode ? "Save Changes" : "Submit"
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