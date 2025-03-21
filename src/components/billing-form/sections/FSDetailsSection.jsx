// FSDetailsSection.jsx
import React from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { FS_TYPE_OPTIONS, FOIL_TYPE_OPTIONS, BLOCK_TYPE_OPTIONS, MR_TYPE_OPTIONS } from "../../../constants/dropdownOptions";
import { DEFAULT_FS_FOIL } from "../../../constants/defaultValues";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";
import NumberField from "../fields/NumberField";

const FSDetailsSection = () => {
  const { state } = useBillingForm();
  const { data, updateField, toggleField } = useFormState("fsDetails");

  const handleFSTypeChange = (e) => {
    const fsType = e.target.value;
    updateField("fsType", fsType);
    
    // Determine number of foils based on FS type
    const numberOfFoils = fsType === "FS1" ? 1 
                        : fsType === "FS2" ? 2 
                        : fsType === "FS3" ? 3 
                        : fsType === "FS4" ? 4 
                        : fsType === "FS5" ? 5 : 0;
    
    // Generate foil details based on the number of foils
    let foilDetails = [...(data.foilDetails || [])];
    
    // If we need more foils than we have, add new ones
    if (numberOfFoils > foilDetails.length) {
      const newFoils = Array(numberOfFoils - foilDetails.length)
        .fill(null)
        .map(() => ({ ...DEFAULT_FS_FOIL }));
      
      foilDetails = [...foilDetails, ...newFoils];
    }
    // If we need fewer foils, remove the extra ones
    else if (numberOfFoils < foilDetails.length) {
      foilDetails = foilDetails.slice(0, numberOfFoils);
    }
    
    updateField("foilDetails", foilDetails);
  };

  const handleFoilDetailChange = (index, field, value) => {
    const updatedDetails = [...(data.foilDetails || [])];
    
    if (field === "blockSizeType") {
      updatedDetails[index] = {
        ...updatedDetails[index],
        blockSizeType: value,
        blockDimension: value === "Auto"
          ? {
              length: state.orderAndPaper.dieSize.length 
                ? inchesToCm(state.orderAndPaper.dieSize.length) 
                : "",
              breadth: state.orderAndPaper.dieSize.breadth 
                ? inchesToCm(state.orderAndPaper.dieSize.breadth) 
                : ""
            }
          : { length: "", breadth: "" }
      };
    } else if (field.startsWith("blockDimension.")) {
      const dimensionField = field.split(".")[1]; // "length" or "breadth"
      updatedDetails[index] = {
        ...updatedDetails[index],
        blockDimension: {
          ...updatedDetails[index].blockDimension,
          [dimensionField]: value
        }
      };
    } else {
      updatedDetails[index] = {
        ...updatedDetails[index],
        [field]: value
      };
    }
    
    updateField("foilDetails", updatedDetails);
  };

  if (!data.isFSUsed) {
    return (
      <FormToggle
        label="Is FS being used?"
        isChecked={data.isFSUsed}
        onChange={() => toggleField("isFSUsed")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FormToggle
        label="Is FS being used?"
        isChecked={data.isFSUsed}
        onChange={() => toggleField("isFSUsed")}
      />

      <FormField
        label="FS Type"
        name="fsType"
      >
        <SelectField
          id="fsType"
          name="fsType"
          value={data.fsType || ""}
          onChange={handleFSTypeChange}
          options={FS_TYPE_OPTIONS}
          placeholder="Select FS Type"
        />
      </FormField>

      {data.fsType && data.foilDetails && data.foilDetails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Foil Details</h3>
          
          {data.foilDetails.map((foil, index) => (
            <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4">
              <h4 className="font-semibold text-sm">Foil {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Block Size Type */}
                <FormField label="Block Size Type">
                  <SelectField
                    id={`blockSizeType-${index}`}
                    value={foil.blockSizeType || "Auto"}
                    onChange={(e) => handleFoilDetailChange(index, "blockSizeType", e.target.value)}
                    options={["Auto", "Manual"]}
                  />
                </FormField>

                {/* Foil Type */}
                <FormField label="Foil Type">
                  <SelectField
                    id={`foilType-${index}`}
                    value={foil.foilType || "Gold MTS 220"}
                    onChange={(e) => handleFoilDetailChange(index, "foilType", e.target.value)}
                    options={FOIL_TYPE_OPTIONS}
                  />
                </FormField>
              </div>

              {foil.blockSizeType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Block Dimensions */}
                  <FormField label="Length (cm)">
                    <NumberField
                      id={`blockLength-${index}`}
                      value={foil.blockDimension?.length || ""}
                      onChange={(e) => handleFoilDetailChange(index, "blockDimension.length", e.target.value)}
                      placeholder="Length"
                      disabled={foil.blockSizeType === "Auto"}
                    />
                  </FormField>

                  <FormField label="Breadth (cm)">
                    <NumberField
                      id={`blockBreadth-${index}`}
                      value={foil.blockDimension?.breadth || ""}
                      onChange={(e) => handleFoilDetailChange(index, "blockDimension.breadth", e.target.value)}
                      placeholder="Breadth"
                      disabled={foil.blockSizeType === "Auto"}
                    />
                  </FormField>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Block Type */}
                <FormField label="Block Type">
                  <SelectField
                    id={`blockType-${index}`}
                    value={foil.blockType || "Magnesium Block 3MM"}
                    onChange={(e) => handleFoilDetailChange(index, "blockType", e.target.value)}
                    options={BLOCK_TYPE_OPTIONS}
                  />
                </FormField>

                {/* MR Type */}
                <FormField label="MR Type">
                  <SelectField
                    id={`mrType-${index}`}
                    value={foil.mrType || "Simple"}
                    onChange={(e) => handleFoilDetailChange(index, "mrType", e.target.value)}
                    options={MR_TYPE_OPTIONS}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FSDetailsSection;