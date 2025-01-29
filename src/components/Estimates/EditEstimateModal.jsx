import React, { useState } from 'react';
import BillingForm from '../Billing_form/BillingForm';

const EditEstimateModal = ({ estimate, onClose, onSave, groupKey, estimates = [], setEstimatesData }) => {
  const [isSaving, setIsSaving] = useState(false);

  const convertEstimateToFormState = (estimate) => {
    return {
      currentStep: 1,
      orderAndPaper: {
        clientName: estimate.clientName || "",
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
        image: estimate.dieDetails?.image || "",
      },
      lpDetails: {
        isLPUsed: estimate.lpDetails?.isLPUsed || false,
        noOfColors: estimate.lpDetails?.noOfColors || 0,
        colorDetails: estimate.lpDetails?.colorDetails || [],
      },
      fsDetails: {
        isFSUsed: estimate.fsDetails?.isFSUsed || false,
        fsType: estimate.fsDetails?.fsType || "",
        foilDetails: estimate.fsDetails?.foilDetails || [],
      },
      embDetails: {
        isEMBUsed: estimate.embDetails?.isEMBUsed || false,
        plateSizeType: estimate.embDetails?.plateSizeType || "",
        plateDimensions: estimate.embDetails?.plateDimensions || { length: "", breadth: "" },
        plateTypeMale: estimate.embDetails?.plateTypeMale || "",
        plateTypeFemale: estimate.embDetails?.plateTypeFemale || "",
        embMR: estimate.embDetails?.embMR || "",
      },
      digiDetails: {
        isDigiUsed: estimate.digiDetails?.isDigiUsed || false,
        digiDie: estimate.digiDetails?.digiDie || "",
        digiDimensions: estimate.digiDetails?.digiDimensions || { length: "", breadth: "" },
      },
      dieCutting: {
        isDieCuttingUsed: estimate.dieCutting?.isDieCuttingUsed || false,
        difficulty: estimate.dieCutting?.difficulty || "",
        pdc: estimate.dieCutting?.pdc || "",
        dcMR: estimate.dieCutting?.dcMR || "",
      },
      sandwich: {
        isSandwichComponentUsed: estimate.sandwich?.isSandwichComponentUsed || false,
        lpDetailsSandwich: estimate.sandwich?.lpDetailsSandwich || {
          isLPUsed: false,
          noOfColors: 0,
          colorDetails: [],
        },
        fsDetailsSandwich: estimate.sandwich?.fsDetailsSandwich || {
          isFSUsed: false,
          fsType: "",
          foilDetails: [],
        },
        embDetailsSandwich: estimate.sandwich?.embDetailsSandwich || {
          isEMBUsed: false,
          plateSizeType: "",
          plateDimensions: { length: "", breadth: "" },
          plateTypeMale: "",
          plateTypeFemale: "",
          embMR: "",
        },
      },
      pasting: {
        isPastingUsed: estimate.pasting?.isPastingUsed || false,
        pastingType: estimate.pasting?.pastingType || "",
      },
    };
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      // Create a new estimate with the form data
      const newEstimate = {
        ...formData,
        clientName: estimate.clientName, // Keep the same client name
        projectName: estimate.projectName, // Keep the same project name
        createdAt: new Date().toISOString(),
      };
      
      await onSave(newEstimate);
    } catch (error) {
      console.error('Error saving estimate:', error);
      alert(`Failed to save estimate: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
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
            initialState={convertEstimateToFormState(estimate)}
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