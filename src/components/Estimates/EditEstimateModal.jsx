import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import BillingForm from '../Billing/BillingForm';

const EditEstimateModal = ({ estimate, onClose, onSave, groupKey, estimates = [], setEstimatesData }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [initialFormState, setInitialFormState] = useState(null);
  const [isClientInactive, setIsClientInactive] = useState(false);
  const [formChangeDebug, setFormChangeDebug] = useState({});

  // Enhanced sanitizeEstimateStructure function
  const sanitizeEstimateStructure = (estimateData) => {
    if (!estimateData) return estimateData;
    
    const sanitized = {...estimateData};
    
    // Convert map to array for LP Details
    if (sanitized.lpDetails) {
      if (!Array.isArray(sanitized.lpDetails.colorDetails)) {
        if (sanitized.lpDetails.colorDetails && typeof sanitized.lpDetails.colorDetails === 'object') {
          const tempArray = [];
          Object.keys(sanitized.lpDetails.colorDetails)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(key => {
              tempArray.push(sanitized.lpDetails.colorDetails[key]);
            });
          console.log("Converted lpDetails.colorDetails from map to array:", tempArray);
          sanitized.lpDetails.colorDetails = tempArray;
        } else {
          sanitized.lpDetails.colorDetails = [];
        }
      }
    }
    
    // Convert map to array for FS Details
    if (sanitized.fsDetails) {
      if (!Array.isArray(sanitized.fsDetails.foilDetails)) {
        if (sanitized.fsDetails.foilDetails && typeof sanitized.fsDetails.foilDetails === 'object') {
          const tempArray = [];
          Object.keys(sanitized.fsDetails.foilDetails)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(key => {
              tempArray.push(sanitized.fsDetails.foilDetails[key]);
            });
          console.log("Converted fsDetails.foilDetails from map to array:", tempArray);
          sanitized.fsDetails.foilDetails = tempArray;
        } else {
          sanitized.fsDetails.foilDetails = [];
        }
      }
    }
    
    // Handle sandwich component if present
    if (sanitized.sandwich) {
      if (sanitized.sandwich.lpDetailsSandwich && !Array.isArray(sanitized.sandwich.lpDetailsSandwich.colorDetails)) {
        if (sanitized.sandwich.lpDetailsSandwich.colorDetails && 
            typeof sanitized.sandwich.lpDetailsSandwich.colorDetails === 'object') {
          const tempArray = [];
          Object.keys(sanitized.sandwich.lpDetailsSandwich.colorDetails)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(key => {
              tempArray.push(sanitized.sandwich.lpDetailsSandwich.colorDetails[key]);
            });
          sanitized.sandwich.lpDetailsSandwich.colorDetails = tempArray;
        } else {
          sanitized.sandwich.lpDetailsSandwich.colorDetails = [];
        }
      }
      
      if (sanitized.sandwich.fsDetailsSandwich && !Array.isArray(sanitized.sandwich.fsDetailsSandwich.foilDetails)) {
        if (sanitized.sandwich.fsDetailsSandwich.foilDetails && 
            typeof sanitized.sandwich.fsDetailsSandwich.foilDetails === 'object') {
          const tempArray = [];
          Object.keys(sanitized.sandwich.fsDetailsSandwich.foilDetails)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(key => {
              tempArray.push(sanitized.sandwich.fsDetailsSandwich.foilDetails[key]);
            });
          sanitized.sandwich.fsDetailsSandwich.foilDetails = tempArray;
        } else {
          sanitized.sandwich.fsDetailsSandwich.foilDetails = [];
        }
      }
    }
    
    return sanitized;
  };

  // Fetch complete client info when component mounts
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (!estimate) {
        setIsLoadingClient(false);
        return;
      }
      
      setIsLoadingClient(true);
      
      try {
        if (estimate.clientId) {
          const clientDoc = await getDoc(doc(db, "clients", estimate.clientId));
          
          if (clientDoc.exists()) {
            const clientData = {
              id: clientDoc.id,
              clientId: clientDoc.id,
              ...clientDoc.data()
            };
            
            setClientInfo(clientData);
            
            if (clientData.isActive === false) {
              setIsClientInactive(true);
            }
            
            const sanitizedEstimate = sanitizeEstimateStructure(estimate);
            const formState = convertEstimateToFormState(sanitizedEstimate, clientData);
            setInitialFormState(formState);
          } else {
            console.error("Client not found for ID:", estimate.clientId);
            const sanitizedEstimate = sanitizeEstimateStructure(estimate);
            const formState = convertEstimateToFormState(sanitizedEstimate, estimate.clientInfo || null);
            setInitialFormState(formState);
          }
        } else if (estimate.clientInfo) {
          setClientInfo(estimate.clientInfo);
          
          if (estimate.clientInfo.isActive === false) {
            setIsClientInactive(true);
          }
          
          const sanitizedEstimate = sanitizeEstimateStructure(estimate);
          const formState = convertEstimateToFormState(sanitizedEstimate, estimate.clientInfo);
          setInitialFormState(formState);
        } else {
          console.error("No client information available in the estimate");
          const sanitizedEstimate = sanitizeEstimateStructure(estimate);
          const formState = convertEstimateToFormState(sanitizedEstimate, null);
          setInitialFormState(formState);
        }
      } catch (error) {
        console.error("Error fetching client info:", error);
        const sanitizedEstimate = sanitizeEstimateStructure(estimate);
        const formState = convertEstimateToFormState(sanitizedEstimate, estimate.clientInfo || null);
        setInitialFormState(formState);
      } finally {
        setIsLoadingClient(false);
      }
    };

    fetchClientInfo();
  }, [estimate]);

  const convertEstimateToFormState = (estimate, fetchedClientInfo) => {
    let enhancedClientInfo = fetchedClientInfo;
    
    if (!enhancedClientInfo) {
      enhancedClientInfo = {
        id: estimate.clientId || "unknown",
        name: estimate.clientName || "Unknown Client",
        ...(estimate.clientInfo || {})
      };
    }
    
    // Log available data for debugging
    console.log("Converting estimate to form state. Critical fields:", {
      estimateProjectName: estimate.projectName,
      jobType: estimate.jobDetails?.jobType,
      quantity: estimate.jobDetails?.quantity,
      paperName: estimate.jobDetails?.paperName,
      dieCode: estimate.dieDetails?.dieCode,
      frags: estimate.dieDetails?.frags,
      type: estimate.dieDetails?.type,
      markupType: estimate.calculations?.markupType,
      markupPercentage: estimate.calculations?.markupPercentage
    });
    
    // Enhanced logging for all service details
    console.log("Form state service details:", {
      lpUsed: estimate.lpDetails?.isLPUsed,
      fsUsed: estimate.fsDetails?.isFSUsed,
      embUsed: estimate.embDetails?.isEMBUsed,
      digiUsed: estimate.digiDetails?.isDigiUsed,
      notebookUsed: estimate.notebookDetails?.isNotebookUsed,
      screenUsed: estimate.screenPrint?.isScreenPrintUsed,
      miscUsed: estimate.misc?.isMiscUsed,
      miscCharge: estimate.misc?.miscCharge,
      miscChargeType: typeof estimate.misc?.miscCharge
    });
    
    // Ensure arrays are properly set up
    const colorDetails = Array.isArray(estimate.lpDetails?.colorDetails) ? 
                          estimate.lpDetails.colorDetails : [];
    
    const foilDetails = Array.isArray(estimate.fsDetails?.foilDetails) ? 
                          estimate.fsDetails.foilDetails : [];
    
    // Structure to match BillingForm's expected state
    return {
      client: {
        clientId: estimate.clientId || (enhancedClientInfo && enhancedClientInfo.id) || null,
        clientInfo: enhancedClientInfo
      },
      versionId: estimate.versionId || "1",
      orderAndPaper: {
        projectName: estimate.projectName || "",
        date: estimate.date ? new Date(estimate.date) : null,
        deliveryDate: estimate.deliveryDate ? new Date(estimate.deliveryDate) : null,
        jobType: estimate.jobDetails?.jobType || "Card",
        quantity: estimate.jobDetails?.quantity || "",
        paperProvided: estimate.jobDetails?.paperProvided || "Yes",
        paperName: estimate.jobDetails?.paperName || "",
        paperGsm: estimate.jobDetails?.paperGsm || "",
        paperCompany: estimate.jobDetails?.paperCompany || "",
        dieSelection: estimate.dieDetails?.dieSelection || "",
        dieCode: estimate.dieDetails?.dieCode || "",
        dieSize: estimate.dieDetails?.dieSize || { length: "", breadth: "" },
        productSize: estimate.dieDetails?.productSize || { length: "", breadth: "" },
        image: estimate.dieDetails?.image || "",
        hsnCode: estimate.jobDetails?.hsnCode || "",
        frags: estimate.dieDetails?.frags || "",
        type: estimate.dieDetails?.type || ""
      },
      // FIXED: Ensure proper default structure for LP Details
      lpDetails: {
        isLPUsed: estimate.lpDetails?.isLPUsed || false,
        noOfColors: estimate.lpDetails?.noOfColors || 0,
        colorDetails: colorDetails,
      },
      // FIXED: Ensure proper default structure for FS Details
      fsDetails: {
        isFSUsed: estimate.fsDetails?.isFSUsed || false,
        fsType: estimate.fsDetails?.fsType || "",
        foilDetails: foilDetails,
      },
      // FIXED: Ensure proper default structure for EMB Details
      embDetails: {
        isEMBUsed: estimate.embDetails?.isEMBUsed || false,
        plateSizeType: estimate.embDetails?.plateSizeType || "",
        plateDimensions: estimate.embDetails?.plateDimensions || { length: "", breadth: "" },
        plateTypeMale: estimate.embDetails?.plateTypeMale || "",
        plateTypeFemale: estimate.embDetails?.plateTypeFemale || "",
        embMR: estimate.embDetails?.embMR || "",
        embMRConcatenated: estimate.embDetails?.embMRConcatenated || "",
        dstMaterial: estimate.embDetails?.dstMaterial || ""
      },
      // FIXED: Ensure proper default structure for Digi Details
      digiDetails: {
        isDigiUsed: estimate.digiDetails?.isDigiUsed || false,
        digiDie: estimate.digiDetails?.digiDie || "",
        digiDimensions: estimate.digiDetails?.digiDimensions || { length: "", breadth: "" },
      },
      // FIXED: Ensure proper default structure for Notebook Details
      notebookDetails: {
        isNotebookUsed: estimate.notebookDetails?.isNotebookUsed || false,
        orientation: estimate.notebookDetails?.orientation || "",
        length: estimate.notebookDetails?.length || "",
        breadth: estimate.notebookDetails?.breadth || "",
        calculatedLength: estimate.notebookDetails?.calculatedLength || "",
        calculatedBreadth: estimate.notebookDetails?.calculatedBreadth || "",
        numberOfPages: estimate.notebookDetails?.numberOfPages || "",
        bindingType: estimate.notebookDetails?.bindingType || "",
        bindingTypeConcatenated: estimate.notebookDetails?.bindingTypeConcatenated || "",
        paperName: estimate.notebookDetails?.paperName || ""
      },
      // FIXED: Ensure proper default structure for Screen Print
      screenPrint: {
        isScreenPrintUsed: estimate.screenPrint?.isScreenPrintUsed || false,
        noOfColors: estimate.screenPrint?.noOfColors || 1,
        screenMR: estimate.screenPrint?.screenMR || "",
        screenMRConcatenated: estimate.screenPrint?.screenMRConcatenated || ""
      },
      // FIXED: Ensure proper default structure for Pre Die Cutting
      preDieCutting: {
        isPreDieCuttingUsed: estimate.preDieCutting?.isPreDieCuttingUsed || false,
        predcMR: estimate.preDieCutting?.predcMR || "",
        predcMRConcatenated: estimate.preDieCutting?.predcMRConcatenated || ""
      },
      // FIXED: Ensure proper default structure for Die Cutting
      dieCutting: {
        isDieCuttingUsed: estimate.dieCutting?.isDieCuttingUsed || false,
        dcMR: estimate.dieCutting?.dcMR || "",
        dcMRConcatenated: estimate.dieCutting?.dcMRConcatenated || ""
      },
      // FIXED: Ensure proper default structure for Post DC
      postDC: {
        isPostDCUsed: estimate.postDC?.isPostDCUsed || false,
        pdcMR: estimate.postDC?.pdcMR || "",
        pdcMRConcatenated: estimate.postDC?.pdcMRConcatenated || ""
      },
      // FIXED: Ensure proper default structure for Fold And Paste
      foldAndPaste: {
        isFoldAndPasteUsed: estimate.foldAndPaste?.isFoldAndPasteUsed || false,
        dstMaterial: estimate.foldAndPaste?.dstMaterial || "",
        dstType: estimate.foldAndPaste?.dstType || "",
      },
      // FIXED: Ensure proper default structure for DST Paste
      dstPaste: {
        isDstPasteUsed: estimate.dstPaste?.isDstPasteUsed || false,
        dstType: estimate.dstPaste?.dstType || "",
      },
      // FIXED: Ensure proper default structure for Magnet
      magnet: {
        isMagnetUsed: estimate.magnet?.isMagnetUsed || false,
        magnetMaterial: estimate.magnet?.magnetMaterial || ""
      },
      // FIXED: Ensure proper default structure for QC
      qc: {
        isQCUsed: estimate.qc?.isQCUsed || false,
      },
      // FIXED: Ensure proper default structure for Packing
      packing: {
        isPackingUsed: estimate.packing?.isPackingUsed || false,
      },
      // FIXED: Proper misc handling - consistent with working pattern
      misc: {
        isMiscUsed: estimate.misc?.isMiscUsed || false,
        miscCharge: estimate.misc?.miscCharge || ""
      },
      // FIXED: Ensure proper default structure for Sandwich
      sandwich: {
        isSandwichComponentUsed: estimate.sandwich?.isSandwichComponentUsed || false,
        paperInfo: estimate.sandwich?.paperInfo || {
          paperName: ""
        },
        lpDetailsSandwich: {
          isLPUsed: estimate.sandwich?.lpDetailsSandwich?.isLPUsed || false,
          noOfColors: estimate.sandwich?.lpDetailsSandwich?.noOfColors || 0,
          colorDetails: Array.isArray(estimate.sandwich?.lpDetailsSandwich?.colorDetails) ?
                        estimate.sandwich.lpDetailsSandwich.colorDetails : [],
        },
        fsDetailsSandwich: {
          isFSUsed: estimate.sandwich?.fsDetailsSandwich?.isFSUsed || false,
          fsType: estimate.sandwich?.fsDetailsSandwich?.fsType || "",
          foilDetails: Array.isArray(estimate.sandwich?.fsDetailsSandwich?.foilDetails) ?
                      estimate.sandwich.fsDetailsSandwich.foilDetails : [],
        },
        embDetailsSandwich: {
          isEMBUsed: estimate.sandwich?.embDetailsSandwich?.isEMBUsed || false,
          plateSizeType: estimate.sandwich?.embDetailsSandwich?.plateSizeType || "",
          plateDimensions: estimate.sandwich?.embDetailsSandwich?.plateDimensions || { 
            length: "", 
            breadth: "",
            lengthInInches: "",
            breadthInInches: ""
          },
          plateTypeMale: estimate.sandwich?.embDetailsSandwich?.plateTypeMale || "",
          plateTypeFemale: estimate.sandwich?.embDetailsSandwich?.plateTypeFemale || "",
          embMR: estimate.sandwich?.embDetailsSandwich?.embMR || "",
          embMRConcatenated: estimate.sandwich?.embDetailsSandwich?.embMRConcatenated || ""
        },
      },
      // Preserve the original calculations INCLUDING markup information
      calculations: estimate.calculations || {},
    };
  };

  // Function to sanitize data before saving to Firestore
  const sanitizeForFirestore = (data) => {
    if (!data) return {};
    
    const sanitized = {...data};
    
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        sanitized[key] = null;
      } else if (sanitized[key] !== null && typeof sanitized[key] === 'object' && !Array.isArray(sanitized[key])) {
        sanitized[key] = sanitizeForFirestore(sanitized[key]);
      }
    });
    
    return sanitized;
  };

  // UPDATED: Enhanced handleSave with proper service handling (following Misc pattern)
  const handleSave = async (formData) => {
    if (isClientInactive) {
      if (!window.confirm("This client is inactive. Are you sure you want to update this estimate?")) {
        return;
      }
    }
    
    setIsSaving(true);
    try {
      console.log("COMPLETE FORM DATA:", formData);
      
      // Enhanced service logging for debugging
      console.log("Saving service details:", {
        originalLPUsed: estimate.lpDetails?.isLPUsed,
        formDataLPUsed: formData.lpDetails?.isLPUsed,
        originalFSUsed: estimate.fsDetails?.isFSUsed,
        formDataFSUsed: formData.fsDetails?.isFSUsed,
        originalEMBUsed: estimate.embDetails?.isEMBUsed,
        formDataEMBUsed: formData.embDetails?.isEMBUsed,
        originalDigiUsed: estimate.digiDetails?.isDigiUsed,
        formDataDigiUsed: formData.digiDetails?.isDigiUsed,
        originalNotebookUsed: estimate.notebookDetails?.isNotebookUsed,
        formDataNotebookUsed: formData.notebookDetails?.isNotebookUsed,
        originalScreenUsed: estimate.screenPrint?.isScreenPrintUsed,
        formDataScreenUsed: formData.screenPrint?.isScreenPrintUsed,
        originalMiscUsed: estimate.misc?.isMiscUsed,
        formDataMiscUsed: formData.misc?.isMiscUsed,
        finalMiscCharge: (formData.misc || estimate.misc)?.miscCharge
      });
      
      // Extract and prioritize form data values
      const updatedProjectName = formData.projectName || estimate.projectName || "Untitled Project";
      
      const updatedJobType = 
        (formData.jobDetails?.jobType) || 
        (formData.orderAndPaper?.jobType) || 
        estimate.jobDetails?.jobType || 
        "Card";
      
      const updatedQuantity = 
        (formData.jobDetails?.quantity) || 
        (formData.orderAndPaper?.quantity) || 
        estimate.jobDetails?.quantity || 
        "";
      
      const updatedPaperProvided = 
        (formData.jobDetails?.paperProvided) || 
        (formData.orderAndPaper?.paperProvided) || 
        estimate.jobDetails?.paperProvided || 
        "Yes";
      
      const updatedPaperName = 
        (formData.jobDetails?.paperName) || 
        (formData.orderAndPaper?.paperName) || 
        estimate.jobDetails?.paperName || 
        "";
      
      const updatedPaperGsm = 
        (formData.jobDetails?.paperGsm) || 
        (formData.orderAndPaper?.paperGsm) || 
        estimate.jobDetails?.paperGsm || 
        "";
      
      const updatedPaperCompany = 
        (formData.jobDetails?.paperCompany) || 
        (formData.orderAndPaper?.paperCompany) || 
        estimate.jobDetails?.paperCompany || 
        "";
      
      const updatedHsnCode = 
        (formData.jobDetails?.hsnCode) || 
        (formData.orderAndPaper?.hsnCode) || 
        estimate.jobDetails?.hsnCode || 
        "";
      
      const updatedDieSelection = 
        (formData.dieDetails?.dieSelection) || 
        (formData.orderAndPaper?.dieSelection) || 
        estimate.dieDetails?.dieSelection || 
        "";
      
      const updatedDieCode = 
        (formData.dieDetails?.dieCode) || 
        (formData.orderAndPaper?.dieCode) || 
        estimate.dieDetails?.dieCode || 
        "";
      
      const updatedDieSize = 
        (formData.dieDetails?.dieSize) || 
        (formData.orderAndPaper?.dieSize) || 
        estimate.dieDetails?.dieSize || 
        { length: "", breadth: "" };
      
      const updatedProductSize = 
        (formData.dieDetails?.productSize) || 
        (formData.orderAndPaper?.productSize) || 
        estimate.dieDetails?.productSize || 
        { length: "", breadth: "" };
      
      const updatedImage = 
        (formData.dieDetails?.image) || 
        (formData.orderAndPaper?.image) || 
        estimate.dieDetails?.image || 
        "";
      
      const updatedFrags = 
        (formData.dieDetails?.frags) || 
        (formData.orderAndPaper?.frags) || 
        estimate.dieDetails?.frags || 
        "";
      
      const updatedType = 
        (formData.dieDetails?.type) || 
        (formData.orderAndPaper?.type) || 
        estimate.dieDetails?.type || 
        "";
      
      console.log("Extracted critical values:", {
        projectName: updatedProjectName,
        jobType: updatedJobType,
        quantity: updatedQuantity,
        paperName: updatedPaperName,
        dieCode: updatedDieCode,
        frags: updatedFrags,
        type: updatedType
      });
      
      const clientName = formData.clientInfo?.name || 
                         formData.client?.clientInfo?.name || 
                         estimate.clientInfo?.name || 
                         estimate.clientName || 
                         "Unknown Client";
      
      const currentTimestamp = new Date().toISOString();
      
      // Create updated estimate with explicit values for critical fields
      const updatedEstimate = {
        id: estimate.id,
        clientId: formData.clientId || formData.client?.clientId || estimate.clientId,
        clientInfo: formData.clientInfo || formData.client?.clientInfo || estimate.clientInfo,
        clientName: clientName,
        
        projectName: updatedProjectName,
        
        date: formData.date || estimate.date,
        deliveryDate: formData.deliveryDate || estimate.deliveryDate,
        
        jobDetails: {
          jobType: updatedJobType,
          quantity: updatedQuantity,
          paperProvided: updatedPaperProvided,
          paperName: updatedPaperName,
          paperGsm: updatedPaperGsm,
          paperCompany: updatedPaperCompany,
          hsnCode: updatedHsnCode,
        },
        
        dieDetails: {
          dieSelection: updatedDieSelection,
          dieCode: updatedDieCode,
          dieSize: updatedDieSize,
          productSize: updatedProductSize,
          image: updatedImage,
          frags: updatedFrags,
          type: updatedType
        },
        
        lpDetails: formData.lpDetails || estimate.lpDetails || {
          isLPUsed: false,
          noOfColors: 0,
          colorDetails: []
        },
        fsDetails: formData.fsDetails || estimate.fsDetails || {
          isFSUsed: false,
          fsType: "",
          foilDetails: []
        },
        embDetails: formData.embDetails || estimate.embDetails || {
          isEMBUsed: false,
          plateSizeType: "",
          plateDimensions: { length: "", breadth: "" },
          plateTypeMale: "",
          plateTypeFemale: "",
          embMR: "",
          embMRConcatenated: "",
          dstMaterial: ""
        },
        digiDetails: formData.digiDetails || estimate.digiDetails || {
          isDigiUsed: false,
          digiDie: "",
          digiDimensions: { length: "", breadth: "" }
        },
        notebookDetails: formData.notebookDetails || estimate.notebookDetails || {
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
        screenPrint: formData.screenPrint || estimate.screenPrint || {
          isScreenPrintUsed: false,
          noOfColors: 1,
          screenMR: "",
          screenMRConcatenated: ""
        },
        preDieCutting: formData.preDieCutting || estimate.preDieCutting || {
          isPreDieCuttingUsed: false,
          predcMR: "",
          predcMRConcatenated: ""
        },
        dieCutting: formData.dieCutting || estimate.dieCutting || {
          isDieCuttingUsed: false,
          dcMR: "",
          dcMRConcatenated: ""
        },
        sandwich: formData.sandwich || estimate.sandwich || {
          isSandwichComponentUsed: false,
          paperInfo: { paperName: "" },
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
        },
        magnet: formData.magnet || estimate.magnet || {
          isMagnetUsed: false,
          magnetMaterial: ""
        },
        postDC: formData.postDC || estimate.postDC || {
          isPostDCUsed: false,
          pdcMR: "",
          pdcMRConcatenated: ""
        },
        foldAndPaste: formData.foldAndPaste || estimate.foldAndPaste || {
          isFoldAndPasteUsed: false,
          dstMaterial: "",
          dstType: ""
        },
        dstPaste: formData.dstPaste || estimate.dstPaste || {
          isDstPasteUsed: false,
          dstType: ""
        },
        qc: formData.qc || estimate.qc || {
          isQCUsed: false
        },
        packing: formData.packing || estimate.packing || {
          isPackingUsed: false
        },
        
        // FIXED: Enhanced misc handling - consistent with working Misc pattern
        misc: formData.misc || estimate.misc || {
          isMiscUsed: false,
          miscCharge: ""
        },
        
        calculations: formData.calculations || estimate.calculations,
        
        versionId: formData.versionId || estimate.versionId || "1",
        movedToOrders: estimate.movedToOrders || false,
        isCanceled: estimate.isCanceled || false,
        
        createdAt: estimate.createdAt || currentTimestamp,
        updatedAt: currentTimestamp,
      };
      
      console.log("FINAL VERIFICATION - All Service States:", {
        projectName: updatedEstimate.projectName,
        jobType: updatedEstimate.jobDetails.jobType,
        quantity: updatedEstimate.jobDetails.quantity,
        paperName: updatedEstimate.jobDetails.paperName,
        dieCode: updatedEstimate.dieDetails.dieCode,
        frags: updatedEstimate.dieDetails.frags,
        type: updatedEstimate.dieDetails.type,
        lpUsed: updatedEstimate.lpDetails?.isLPUsed,
        fsUsed: updatedEstimate.fsDetails?.isFSUsed,
        embUsed: updatedEstimate.embDetails?.isEMBUsed,
        digiUsed: updatedEstimate.digiDetails?.isDigiUsed,
        notebookUsed: updatedEstimate.notebookDetails?.isNotebookUsed,
        screenUsed: updatedEstimate.screenPrint?.isScreenPrintUsed,
        miscUsed: updatedEstimate.misc?.isMiscUsed,
        miscCharge: updatedEstimate.misc?.miscCharge,
        createdAt: updatedEstimate.createdAt,
        updatedAt: updatedEstimate.updatedAt
      });
      
      const sanitizedEstimate = sanitizeForFirestore(updatedEstimate);
      
      console.log("FINAL SANITIZED ESTIMATE - All Service States:", {
        projectName: sanitizedEstimate.projectName,
        jobType: sanitizedEstimate.jobDetails.jobType,
        quantity: sanitizedEstimate.jobDetails.quantity,
        paperName: sanitizedEstimate.jobDetails.paperName,
        dieCode: sanitizedEstimate.dieDetails.dieCode,
        frags: sanitizedEstimate.dieDetails.frags,
        type: sanitizedEstimate.dieDetails.type,
        lpUsed: sanitizedEstimate.lpDetails?.isLPUsed,
        fsUsed: sanitizedEstimate.fsDetails?.isFSUsed,
        embUsed: sanitizedEstimate.embDetails?.isEMBUsed,
        digiUsed: sanitizedEstimate.digiDetails?.isDigiUsed,
        notebookUsed: sanitizedEstimate.notebookDetails?.isNotebookUsed,
        screenUsed: sanitizedEstimate.screenPrint?.isScreenPrintUsed,
        miscUsed: sanitizedEstimate.misc?.isMiscUsed,
        miscCharge: sanitizedEstimate.misc?.miscCharge,
        createdAt: sanitizedEstimate.createdAt,
        updatedAt: sanitizedEstimate.updatedAt
      });
      
      await onSave(sanitizedEstimate);
    } catch (error) {
      console.error('Error saving estimate:', error);
      alert(`Failed to save estimate: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };  

  // Show loading state while fetching client info
  if (isLoadingClient) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-700">Loading client information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only render the form when initialFormState is ready
  if (!initialFormState) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <h2 className="text-lg font-bold text-gray-700">Edit Estimate</h2>
            {isClientInactive && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                Inactive Client
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isClientInactive && (
          <div className="bg-red-50 p-3 border-b border-red-100">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-red-700">
                  <span className="font-medium">Warning:</span> You are editing an estimate for an inactive client.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 max-h-[80vh] overflow-y-auto">
          <BillingForm
            initialState={initialFormState}
            isEditMode={true}
            onSubmitSuccess={handleSave}
            onClose={onClose}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default EditEstimateModal;