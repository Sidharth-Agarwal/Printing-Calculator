import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import BillingForm from '../Billing/BillingForm';

const EditEstimateModal = ({ estimate, onClose, onSave, groupKey, estimates = [], setEstimatesData }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [initialFormState, setInitialFormState] = useState(null);

  // Enhanced sanitizeEstimateStructure function
  const sanitizeEstimateStructure = (estimateData) => {
    if (!estimateData) return estimateData;
    
    const sanitized = {...estimateData};
    
    // Convert map to array for LP Details
    if (sanitized.lpDetails) {
      if (!Array.isArray(sanitized.lpDetails.colorDetails)) {
        // If it's an object with numeric keys, convert to array
        if (sanitized.lpDetails.colorDetails && typeof sanitized.lpDetails.colorDetails === 'object') {
          const tempArray = [];
          Object.keys(sanitized.lpDetails.colorDetails)
            .sort((a, b) => parseInt(a) - parseInt(b)) // Ensure proper order
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
        // If it's an object with numeric keys, convert to array
        if (sanitized.fsDetails.foilDetails && typeof sanitized.fsDetails.foilDetails === 'object') {
          const tempArray = [];
          Object.keys(sanitized.fsDetails.foilDetails)
            .sort((a, b) => parseInt(a) - parseInt(b)) // Ensure proper order
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
        // Same approach as above
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
        // Same approach as above
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
        // First check if we have the clientId
        if (estimate.clientId) {
          // Fetch the complete client details
          const clientDoc = await getDoc(doc(db, "clients", estimate.clientId));
          
          if (clientDoc.exists()) {
            const clientData = {
              id: clientDoc.id,
              clientId: clientDoc.id,
              ...clientDoc.data()
            };
            
            setClientInfo(clientData);
            
            // Sanitize estimate before converting to form state
            const sanitizedEstimate = sanitizeEstimateStructure(estimate);
            
            // Create form state with fetched client data and sanitized estimate
            const formState = convertEstimateToFormState(sanitizedEstimate, clientData);
            setInitialFormState(formState);
          } else {
            console.error("Client not found for ID:", estimate.clientId);
            
            // Try to use existing client info from the estimate
            const sanitizedEstimate = sanitizeEstimateStructure(estimate);
            const formState = convertEstimateToFormState(sanitizedEstimate, estimate.clientInfo || null);
            setInitialFormState(formState);
          }
        } else if (estimate.clientInfo) {
          // Use the client info already in the estimate
          setClientInfo(estimate.clientInfo);
          
          const sanitizedEstimate = sanitizeEstimateStructure(estimate);
          const formState = convertEstimateToFormState(sanitizedEstimate, estimate.clientInfo);
          setInitialFormState(formState);
        } else {
          console.error("No client information available in the estimate");
          
          // Create form state with minimal client info
          const sanitizedEstimate = sanitizeEstimateStructure(estimate);
          const formState = convertEstimateToFormState(sanitizedEstimate, null);
          setInitialFormState(formState);
        }
      } catch (error) {
        console.error("Error fetching client info:", error);
        
        // Create form state with existing client info on error
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
    // Use the provided client info or build from available data
    let enhancedClientInfo = fetchedClientInfo;
    
    if (!enhancedClientInfo) {
      enhancedClientInfo = {
        id: estimate.clientId || "unknown",
        name: estimate.clientName || "Unknown Client",
        ...(estimate.clientInfo || {})
      };
    }
    
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
        dieSelection: estimate.dieDetails?.dieSelection || "",
        dieCode: estimate.dieDetails?.dieCode || "",
        dieSize: estimate.dieDetails?.dieSize || { length: "", breadth: "" },
        productSize: estimate.dieDetails?.productSize || { length: "", breadth: "" },
        image: estimate.dieDetails?.image || "",
        hsnCode: estimate.jobDetails?.hsnCode || "", // Include HSN code
      },
      lpDetails: {
        isLPUsed: estimate.lpDetails?.isLPUsed || false,
        noOfColors: estimate.lpDetails?.noOfColors || 0,
        colorDetails: colorDetails, // Use sanitized array
      },
      fsDetails: {
        isFSUsed: estimate.fsDetails?.isFSUsed || false,
        fsType: estimate.fsDetails?.fsType || "",
        foilDetails: foilDetails, // Use sanitized array
      },
      embDetails: {
        isEMBUsed: estimate.embDetails?.isEMBUsed || false,
        plateSizeType: estimate.embDetails?.plateSizeType || "",
        plateDimensions: estimate.embDetails?.plateDimensions || { length: "", breadth: "" },
        plateTypeMale: estimate.embDetails?.plateTypeMale || "",
        plateTypeFemale: estimate.embDetails?.plateTypeFemale || "",
        embMR: estimate.embDetails?.embMR || "",
        embMRConcatenated: estimate.embDetails?.embMRConcatenated || "",
      },
      digiDetails: {
        isDigiUsed: estimate.digiDetails?.isDigiUsed || false,
        digiDie: estimate.digiDetails?.digiDie || "",
        digiDimensions: estimate.digiDetails?.digiDimensions || { length: "", breadth: "" },
      },
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
      screenPrint: {
        isScreenPrintUsed: estimate.screenPrint?.isScreenPrintUsed || false
      },
      dieCutting: {
        isDieCuttingUsed: estimate.dieCutting?.isDieCuttingUsed || false,
        dcMR: estimate.dieCutting?.dcMR || "",
        dcMRConcatenated: estimate.dieCutting?.dcMRConcatenated || ""
      },
      postDC: {
        isPostDCUsed: estimate.postDC?.isPostDCUsed || false,
        pdcMR: estimate.postDC?.pdcMR || "",
        pdcMRConcatenated: estimate.postDC?.pdcMRConcatenated || ""
      },
      foldAndPaste: {
        isFoldAndPasteUsed: estimate.foldAndPaste?.isFoldAndPasteUsed || false,
        dstMaterial: estimate.foldAndPaste?.dstMaterial || "",
        dstType: estimate.foldAndPaste?.dstType || "",
      },
      dstPaste: {
        isDstPasteUsed: estimate.dstPaste?.isDstPasteUsed || false,
        dstType: estimate.dstPaste?.dstType || "",
      },
      magnet: {
        isMagnetUsed: estimate.magnet?.isMagnetUsed || false,
        magnetMaterial: estimate.magnet?.magnetMaterial || ""
      },
      qc: {
        isQCUsed: estimate.qc?.isQCUsed || false,
      },
      packing: {
        isPackingUsed: estimate.packing?.isPackingUsed || false,
      },
      misc: {
        isMiscUsed: estimate.misc?.isMiscUsed || false,
        miscCharge: estimate.misc?.miscCharge || ""
      },
      sandwich: {
        isSandwichComponentUsed: estimate.sandwich?.isSandwichComponentUsed || false,
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
          plateDimensions: estimate.sandwich?.embDetailsSandwich?.plateDimensions || { length: "", breadth: "" },
          plateTypeMale: estimate.sandwich?.embDetailsSandwich?.plateTypeMale || "",
          plateTypeFemale: estimate.sandwich?.embDetailsSandwich?.plateTypeFemale || "",
          embMR: estimate.sandwich?.embDetailsSandwich?.embMR || "",
        },
      },
      // Preserve the original calculations to use with updated markup
      calculations: estimate.calculations || {},
    };
  };

  // Function to sanitize data before saving to Firestore
  const sanitizeForFirestore = (data) => {
    if (!data) return {};
    
    const sanitized = {...data};
    
    // Convert any undefined values to null
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        sanitized[key] = null;
      } else if (sanitized[key] !== null && typeof sanitized[key] === 'object' && !Array.isArray(sanitized[key])) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeForFirestore(sanitized[key]);
      }
    });
    
    return sanitized;
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      // Determine client name from available sources, ensuring it's never undefined
      const clientName = formData.client?.clientInfo?.name || 
                         estimate.clientInfo?.name || 
                         estimate.clientName || 
                         "Unknown Client";
      
      // Preserve important metadata when creating updated estimate
      const updatedEstimate = {
        ...formData,
        id: estimate.id,
        clientId: formData.client?.clientId || estimate.clientId,
        clientInfo: formData.client?.clientInfo || estimate.clientInfo,
        clientName: clientName, // Ensure clientName is always defined
        projectName: formData.orderAndPaper?.projectName || estimate.projectName,
        // Preserve any status flags from the original estimate
        movedToOrders: estimate.movedToOrders || false,
        isCanceled: estimate.isCanceled || false,
        updatedAt: new Date().toISOString(),
        createdAt: estimate.createdAt || new Date().toISOString(),
      };
      
      // Sanitize data before saving to Firestore to prevent undefined values
      const sanitizedEstimate = sanitizeForFirestore(updatedEstimate);
      
      // Log the sanitized data to verify clientName is present
      console.log("Saving estimate with clientName:", sanitizedEstimate.clientName);
      
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
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
          <h2 className="text-lg font-bold text-gray-700">Edit Estimate</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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