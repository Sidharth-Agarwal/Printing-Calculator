import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import EditEstimateModal from "./EditEstimateModal";

const EstimateDetailsModal = ({ 
  estimate, 
  onClose, 
  onDownloadPdf, 
  isGeneratingPdf,
  estimates = [],
  setEstimatesData,
  groupKey 
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const fieldLabels = {
    clientName: "Name of the Client",
    projectName: "Name of the Project",
    date: "Order Date",
    deliveryDate: "Expected Delivery Date",
    jobType: "Job Type",
    quantity: "Quantity",
    paperProvided: "Paper Provided",
    dieCode: "Die Code",
    dieSize: "Die Size",
    dieSelection: "Die Selection",
    image: "Image",
    breadth: "Breadth",
    length: "Length",
    paperName: "Paper Name",
    plateSizeType: "Type of Plate Size",
    noOfColors: "Total number of colors",
    colorDetails: "Color Details of LP",
    mrType: "Type of MR",
    pantoneType: "Type of Pantone",
    plateDimensions: "Dimensions of Plate",
    plateType: "Type of Plate",
    fsType: "Type of FS",
    foilDetails: "Foil Details of FS",
    blockSizeType: "Block size Type",
    blockDimension: "Block Dimensions",
    foilType: "Type of Foil",
    blockType: "Type of Block",
    plateTypeMale: "Male Plate Type",
    plateTypeFemale: "Female Plate Type",
    embMR: "Type of MR",
    digiDie: "Digital Die Selected",
    digiDimensions: "Digital Die Dimensions",
    lpDetailsSandwich: "LP Details in Sandwich",
    fsDetailsSandwich: "FS Details in Sandwich",
    embDetailsSandwich: "EMB Details in Sandwich",
    paperCostPerCard: "Cost of Paper",
    cuttingCostPerCard: "Cost of Cutting",
    paperAndCuttingCostPerCard: "Total Paper and Cutting Cost",
    lpCostPerCard: "Cost of LP",
    fsCostPerCard: "Cost of FS",
    embCostPerCard: "Cost of EMB",
    lpCostPerCardSandwich: "Cost of LP in Sandwich",
    fsCostPerCardSandwich: "Cost of FS in Sandwich",
    embCostPerCardSandwich: "Cost of EMB in Sandwich",
    digiCostPerCard: "Digital Print Cost per Unit",
  };

  const costFieldsOrder = [
    'paperCostPerCard',
    'cuttingCostPerCard',
    'paperAndCuttingCostPerCard',
    'lpCostPerCard',
    'fsCostPerCard',
    'embCostPerCard',
    'lpCostPerCardSandwich',
    'fsCostPerCardSandwich',
    'embCostPerCardSandwich',
    'digiCostPerCard',
  ];

  const handleSaveNewEstimate = async (newEstimateData) => {
    try {
      // Add the new estimate to Firestore
      const docRef = await addDoc(collection(db, "estimates"), newEstimateData);
      
      // Add the new estimate to the local state
      const newEstimate = {
        id: docRef.id,
        ...newEstimateData
      };
      
      // Ensure we have a valid array of estimates
      const currentEstimates = Array.isArray(estimates) ? estimates : [];
      const updatedEstimates = [...currentEstimates, newEstimate];
      
      // Update the estimates data state
      setEstimatesData(prevData => ({
        ...prevData,
        [groupKey]: updatedEstimates
      }));

      setIsEditModalOpen(false);
      alert('New estimate created successfully!');
      
      // Reload the page after Firebase update
      window.location.reload();
    } catch (error) {
      console.error('Error creating new estimate:', error);
      alert('Failed to create new estimate. Please try again.');
    }
  };

  const getLabel = (key) => {
    if (fieldLabels[key]) {
      return fieldLabels[key];
    }
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .replace(/([a-z])([0-9])/g, "$1 $2")
      .replace(/([0-9])([a-z])/g, "$1 $2")
      .replace(/([A-Z][a-z]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1))
      .trim();
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === "") {
      return "Not Provided";
    }

    if (key.toLowerCase().includes("date") && value) {
      try {
        const date = new Date(value);
        return date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (error) {
        return value || "Not Provided";
      }
    }

    if (key === "dieSize" && typeof value === "string") {
      return value === " x " ? "Not Provided" : value;
    }

    if (key.toLowerCase() === "image" && value) {
      return (
        <img
          src={value}
          alt="Die Image"
          className="max-w-full max-h-20 object-contain border rounded-md"
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-4 bg-gray-100 p-2 rounded-md">
              {renderValue("item", item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      if ('length' in value && 'breadth' in value) {
        return `${value.length || 'N/A'} x ${value.breadth || 'N/A'}`;
      }

      return (
        <table className="w-full border-collapse border border-gray-300 rounded-md">
          <tbody>
            {Object.entries(value).map(([subKey, subValue], index) => (
              <tr
                key={subKey}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } border border-gray-300`}
              >
                <td className="p-2 font-medium text-gray-600">{getLabel(subKey)}:</td>
                <td className="p-2 text-gray-800">{renderValue(subKey, subValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return value.toString();
  };

  const renderMultipleTablesInRow = (dataArray) => {
    return (
      <div className="grid grid-cols-3 gap-4">
        {dataArray.map((item, index) => (
          <div key={index} className="bg-white p-2 rounded-md border">
            {renderValue("table", item)}
          </div>
        ))}
      </div>
    );
  };

  const renderSectionInFlex = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        <div className="space-y-4 bg-gray-100 p-4 rounded-md">
          {Object.entries(sectionData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key}>
                    <h4 className="font-medium text-gray-600 mb-2">{getLabel(key)}:</h4>
                    {renderMultipleTablesInRow(value)}
                  </div>
                );
              }
              return (
                <div key={key} className="flex items-center gap-1">
                  <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                  <span className="text-gray-800">{renderValue(key, value)}</span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderSectionInGrid = (heading, sectionData, excludedFields = []) => {
    if (!sectionData || typeof sectionData !== "object" || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <div key={heading} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{heading}:</h3>
        <div className="grid grid-cols-2 gap-3 bg-white">
          {Object.entries(sectionData)
            .filter(([key]) => !excludedFields.includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                <span className="text-gray-800">{renderValue(key, value)}</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const calculateTotalCostPerCard = (calculations) => {
    const relevantFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard'
    ];

    return relevantFields.reduce((acc, key) => {
      const value = calculations[key];
      return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-700">Estimate Details</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Estimate
            </button>
            {/* <button
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3M3 7V4a2 2 0 012-2h14a2 2 0 012 2v3" />
              </svg>
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
            </button> */}
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-xl"
            >
              ✖
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" id="pdf-content">
          <div className="space-y-6 bg-white">
            {estimate && 
              renderSectionInGrid("Order and Paper", {
                clientName: estimate.clientName,
                projectName: estimate.projectName,
                date: estimate.date,
                deliveryDate: estimate.deliveryDate,
                jobType: estimate.jobDetails?.jobType,
                quantity: estimate.jobDetails?.quantity,
                paperProvided: estimate.jobDetails?.paperProvided,
                paperName: estimate.jobDetails?.paperName,
                dieCode: estimate.dieDetails?.dieCode,
                dieSize: `${estimate.dieDetails?.dieSize?.length || ''} x ${estimate.dieDetails?.dieSize?.breadth || ''}`,
                image: estimate.dieDetails?.image
              })}

            <div className="space-y-4 bg-white">
              {estimate.lpDetails?.isLPUsed && 
                renderSectionInFlex("LP Details", estimate.lpDetails, ["isLPUsed"])}
              {estimate.fsDetails?.isFSUsed &&
                renderSectionInFlex("FS Details", estimate.fsDetails, ["isFSUsed"])}
              {estimate.embDetails?.isEMBUsed &&
                renderSectionInFlex("EMB Details", estimate.embDetails, ["isEMBUsed"])}
              {estimate.digiDetails?.isDigiUsed &&
                renderSectionInFlex("Digi Details", estimate.digiDetails, ["isDigiUsed"])}
              {estimate.dieCutting?.isDieCuttingUsed &&
                renderSectionInFlex("Die Cutting", estimate.dieCutting, ["isDieCuttingUsed"])}
              {estimate.sandwich?.isSandwichComponentUsed && (
                <>
                  {estimate.sandwich.lpDetailsSandwich?.isLPUsed &&
                    renderSectionInFlex("Sandwich LP Details", estimate.sandwich.lpDetailsSandwich, ["isLPUsed"])}
                  {estimate.sandwich.fsDetailsSandwich?.isFSUsed &&
                    renderSectionInFlex("Sandwich FS Details", estimate.sandwich.fsDetailsSandwich, ["isFSUsed"])}
                  {estimate.sandwich.embDetailsSandwich?.isEMBUsed &&
                    renderSectionInFlex("Sandwich EMB Details", estimate.sandwich.embDetailsSandwich, ["isEMBUsed"])}
                </>
              )}
              {estimate.pasting?.isPastingUsed &&
                renderSectionInFlex("Pasting Details", estimate.pasting, ["isPastingUsed"])}
            </div>

            {/* Calculations Section */}
            {estimate.calculations && (
              <div className="space-y-4 bg-white">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Cost Calculations (per card)</h3>
                <div className="grid grid-cols-3 gap-3">
                  {costFieldsOrder
                    .filter(key => 
                      estimate.calculations[key] !== null && 
                      estimate.calculations[key] !== undefined &&
                      estimate.calculations[key] !== "" &&
                      estimate.calculations[key] !== "Not Provided" && 
                      parseFloat(estimate.calculations[key]) !== 0
                    )
                    .map((key) => (
                      <div
                        key={key}
                        className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
                      >
                        <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                        <span className="text-gray-800">₹ {parseFloat(estimate.calculations[key]).toFixed(2)}</span>
                      </div>
                    ))}
                </div>

                {/* Total Calculations */}
                <div className="mt-6 bg-gray-100 p-4 rounded-md">
                  <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                    <span className="text-lg font-bold text-gray-700">Total Cost per Card:</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹ {calculateTotalCostPerCard(estimate.calculations).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-bold text-gray-700">
                      Total Cost ({estimate.jobDetails?.quantity || 0} pcs):
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹ {(calculateTotalCostPerCard(estimate.calculations) * 
                        (estimate.jobDetails?.quantity || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <EditEstimateModal
            estimate={estimate}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveNewEstimate}
            groupKey={groupKey}
            estimates={estimates}
          />
        )}
      </div>
    </div>
  );
};

export default EstimateDetailsModal;