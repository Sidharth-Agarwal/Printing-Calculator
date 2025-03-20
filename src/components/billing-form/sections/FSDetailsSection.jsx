import React, { useState, useEffect } from "react";
import FormGroup from "../containers/FormGroup";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";

const FSDetailsSection = ({ state, dispatch }) => {
  const fsDetails = state.fsDetails || {
    isFSUsed: false,
    fsType: "FS1",
    foilDetails: [],
  };

  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const [errors, setErrors] = useState({});

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  // Update foil details dynamically when FS type changes
  useEffect(() => {
    if (fsDetails.isFSUsed && fsDetails.fsType) {
      const numberOfFoilOptions =
        fsDetails.fsType === "FS1"
          ? 1
          : fsDetails.fsType === "FS2"
          ? 2
          : fsDetails.fsType === "FS3"
          ? 3
          : fsDetails.fsType === "FS4"
          ? 4
          : 5; // For FS5

      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => {
        const currentFoil = fsDetails.foilDetails[index] || {};
        
        // Set defaults for new entries
        const newFoil = {
          blockSizeType: currentFoil.blockSizeType || "Auto",
          blockDimension: currentFoil.blockDimension || { 
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : ""
          },
          foilType: currentFoil.foilType || "Gold MTS 220",
          blockType: currentFoil.blockType || "Magnesium Block 3MM",
          mrType: currentFoil.mrType || "Simple"
        };
        
        // Always update dimensions if Auto is selected
        if (newFoil.blockSizeType === "Auto") {
          newFoil.blockDimension = {
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
          };
        }
        
        return newFoil;
      });

      const needsUpdate = JSON.stringify(fsDetails.foilDetails) !== JSON.stringify(updatedFoilDetails);

      if (needsUpdate) {
        dispatch({
          type: "UPDATE_FS_DETAILS",
          payload: { foilDetails: updatedFoilDetails },
        });
      }
    }
  }, [fsDetails.fsType, fsDetails.isFSUsed, fsDetails.foilDetails, dieSize, dispatch]);

  const toggleFSUsed = () => {
    const updatedIsFSUsed = !fsDetails.isFSUsed;
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: {
        isFSUsed: updatedIsFSUsed,
        fsType: updatedIsFSUsed ? "FS1" : "",
        foilDetails: updatedIsFSUsed
          ? [
              {
                blockSizeType: "Auto", // Default to "Auto"
                blockDimension: { 
                  length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                  breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
                },
                foilType: "Gold MTS 220", // Default foil type
                blockType: "Magnesium Block 3MM", // Default block type
                mrType: "Simple", // Default MR type
              },
            ]
          : [],
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { [name]: value },
    });
  };

  const handleFoilDetailsChange = (index, field, value) => {
    const updatedFoilDetails = [...fsDetails.foilDetails];

    if (field === "blockSizeType") {
      updatedFoilDetails[index].blockSizeType = value;

      if (value === "Manual") {
        updatedFoilDetails[index].blockDimension = { length: "", breadth: "" };
      }

      if (value === "Auto") {
        updatedFoilDetails[index].blockDimension = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "blockDimension") {
      updatedFoilDetails[index].blockDimension = {
        ...updatedFoilDetails[index].blockDimension,
        ...value,
      };
    } else {
      updatedFoilDetails[index][field] = value;
    }

    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { foilDetails: updatedFoilDetails },
    });
  };

  return (
    <div className="space-y-6">
      <FormToggle
        label="Is FS being used?"
        isChecked={fsDetails.isFSUsed}
        onChange={toggleFSUsed}
      />

      {fsDetails.isFSUsed && (
        <>
          <FormGroup label="FS Type" htmlFor="fsType">
            <SelectField
              id="fsType"
              name="fsType"
              value={fsDetails.fsType}
              onChange={handleChange}
              options={["FS1", "FS2", "FS3", "FS4", "FS5"]}
              placeholder="Select FS Type"
              required={fsDetails.isFSUsed}
            />
            {errors.fsType && <p className="text-red-500 text-sm">{errors.fsType}</p>}
          </FormGroup>

          {fsDetails.fsType && (
            <div>
              <h3 className="text-md font-semibold mt-4 mb-2">Foil Details</h3>
              {fsDetails.foilDetails.map((foil, index) => (
                <FoilDetailsCard
                  key={index}
                  index={index}
                  foil={foil}
                  handleFoilDetailsChange={handleFoilDetailsChange}
                  errors={errors}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Foil Details Card Component to reduce complexity
const FoilDetailsCard = ({ index, foil, handleFoilDetailsChange, errors }) => {
  const FOIL_TYPES = [
    "Rosegold MTS 355",
    "Gold MTS 220",
    "White 911",
    "Blk MTS 362",
    "Silver ALUFIN PMAL METALITE",
    "MTS 432 PINK"
  ];

  const BLOCK_TYPES = [
    "Magnesium Block 3MM",
    "Magnesium Block 4MM",
    "Magnesium Block 5MM",
    "Male Block",
    "Female Block"
  ];

  const MR_TYPES = [
    "Simple",
    "Complex",
    "Super Complex"
  ];

  return (
    <div className="mb-4 p-4 border rounded-md bg-gray-50">
      <h4 className="text-sm font-semibold mb-2">Foil {index + 1}</h4>

      <div className="flex flex-wrap gap-4 text-sm">
        {/* Block Size Type */}
        <div className="flex-1">
          <div className="mb-1">Block Size (cm):</div>
          <SelectField
            value={foil.blockSizeType || "Auto"}
            onChange={(e) =>
              handleFoilDetailsChange(index, "blockSizeType", e.target.value)
            }
            options={["Auto", "Manual"]}
            placeholder="Select Block Size Type"
          />
          {errors[`blockSizeType-${index}`] && (
            <p className="text-red-500 text-sm">{errors[`blockSizeType-${index}`]}</p>
          )}
        </div>

        {/* Block Dimensions */}
        {foil.blockSizeType && (
          <>
            <div className="flex-1">
              <label htmlFor={`length-${index}`} className="block mb-1">
                Length:
              </label>
              <input
                type="number"
                id={`length-${index}`}
                placeholder="Length (cm)"
                value={foil.blockDimension?.length || ""}
                onChange={(e) =>
                  handleFoilDetailsChange(index, "blockDimension", {
                    length: e.target.value,
                  })
                }
                className={`border rounded-md p-2 w-full ${
                  foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                }`}
                readOnly={foil.blockSizeType === "Auto"}
              />
              {errors[`blockLength-${index}`] && (
                <p className="text-red-500 text-sm">{errors[`blockLength-${index}`]}</p>
              )}
            </div>

            <div className="flex-1">
              <label htmlFor={`breadth-${index}`} className="block mb-1">
                Breadth:
              </label>
              <input
                type="number"
                id={`breadth-${index}`}
                placeholder="Breadth (cm)"
                value={foil.blockDimension?.breadth || ""}
                onChange={(e) =>
                  handleFoilDetailsChange(index, "blockDimension", {
                    breadth: e.target.value,
                  })
                }
                className={`border rounded-md p-2 w-full ${
                  foil.blockSizeType === "Auto" ? "bg-gray-100" : ""
                }`}
                readOnly={foil.blockSizeType === "Auto"}
              />
              {errors[`blockBreadth-${index}`] && (
                <p className="text-red-500 text-sm">{errors[`blockBreadth-${index}`]}</p>
              )}
            </div>
          </>
        )}

        {/* Foil Type */}
        <div className="flex-1">
          <div className="mb-1">Foil Type:</div>
          <SelectField
            value={foil.foilType || "Gold MTS 220"}
            onChange={(e) =>
              handleFoilDetailsChange(index, "foilType", e.target.value)
            }
            options={FOIL_TYPES}
          />
          {errors[`foilType-${index}`] && (
            <p className="text-red-500 text-sm">{errors[`foilType-${index}`]}</p>
          )}
        </div>

        {/* Block Type */}
        <div className="flex-1">
          <div className="mb-1">Block Type:</div>
          <SelectField
            value={foil.blockType || "Magnesium Block 3MM"}
            onChange={(e) =>
              handleFoilDetailsChange(index, "blockType", e.target.value)
            }
            options={BLOCK_TYPES}
          />
          {errors[`blockType-${index}`] && (
            <p className="text-red-500 text-sm">{errors[`blockType-${index}`]}</p>
          )}
        </div>

        {/* MR Type */}
        <div className="flex-1">
          <div className="mb-1">MR Type:</div>
          <SelectField
            value={foil.mrType || "Simple"}
            onChange={(e) =>
              handleFoilDetailsChange(index, "mrType", e.target.value)
            }
            options={MR_TYPES}
          />
          {errors[`mrType-${index}`] && (
            <p className="text-red-500 text-sm">{errors[`mrType-${index}`]}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FSDetailsSection;