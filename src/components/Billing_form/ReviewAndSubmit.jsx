import React from "react";

const ReviewAndSubmit = ({ state, calculations, isCalculating, onPrevious, onCreateEstimate }) => {
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

  const handleCreateEstimate = (e) => {
    e.preventDefault();
    onCreateEstimate();
  };

  const renderValue = (key, value) => {
    if (key.toLowerCase().includes("date") && value) {
      return new Date(value).toLocaleDateString();
    }

    if (typeof value === "object" && value !== null && "length" in value && "breadth" in value) {
      const { length, breadth } = value;
      return `${length || "N/A"} x ${breadth || "N/A"}`;
    }

    if (key === "digiDimensions" || key === "plateDimensions" || key === "dieSize") {
      if (typeof value === "object") {
        const { length, breadth } = value;
        return `${length || "N/A"} x ${breadth || "N/A"}`;
      }
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

    return value || "Not Provided";
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
                <div key={key} className="flex items-center gap-2">
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

  return (
    <form onSubmit={handleCreateEstimate} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Review and Submit</h2>

      {state.orderAndPaper &&
        renderSectionInGrid("Order and Paper", state.orderAndPaper, ["dieSelection"])}

      <div className="space-y-4 bg-white">
        {state.lpDetails?.isLPUsed && renderSectionInFlex("LP Details", state.lpDetails, ["isLPUsed"])}
        {state.fsDetails?.isFSUsed &&
          renderSectionInFlex("FS Details", state.fsDetails, ["isFSUsed"])}
        {state.embDetails?.isEMBUsed &&
          renderSectionInFlex("EMB Details", state.embDetails, ["isEMBUsed"])}
        {state.digiDetails?.isDigiUsed &&
          renderSectionInFlex("Digi Details", state.digiDetails, ["isDigiUsed"])}
        {state.dieCutting?.isDieCuttingUsed &&
          renderSectionInFlex("Die Cutting", state.dieCutting, ["isDieCuttingUsed"])}
        {state.sandwich?.isSandwichComponentUsed &&
          renderSectionInFlex("Sandwich Details", state.sandwich, ["isSandwichComponentUsed"])}
        {state.pasting?.isPastingUsed &&
          renderSectionInFlex("Pasting Details", state.pasting, ["isPastingUsed"])}
      </div>

      {isCalculating ? (
        <div className="bg-white">
          <p className="text-gray-600 text-center">Calculating costs...</p>
        </div>
      ) : calculations && !calculations.error ? (
        <div className="space-y-4 bg-white">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Cost Calculations (per card)</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(calculations)
              .filter(([key, value]) => value !== null && value !== "Not Provided" && parseFloat(value) !== 0)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
                >
                  <span className="font-medium text-gray-600">{getLabel(key)}:</span>
                  <span className="text-gray-800">{renderValue(key, value)}</span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="bg-white">
          <p className="text-red-600 text-center">
            {calculations?.error || "Unable to fetch calculations."}
          </p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Create Estimate
        </button>
      </div>
    </form>
  );
};

export default ReviewAndSubmit;
