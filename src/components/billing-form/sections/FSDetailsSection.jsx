import React from "react";
import useFormSection from "../../../hooks/useFormSection";
import FormSectionWrapper from "../utils/FormSectionWrapper";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { FS_TYPE_OPTIONS, FOIL_TYPE_OPTIONS, BLOCK_TYPE_OPTIONS, MR_TYPE_OPTIONS } from "../../../constants/dropdownOptions";
import { DEFAULT_FS_FOIL } from "../../../constants/defaultValues";

import FormField from "../../common/FormField";
import NumberField from "../fields/NumberField";
import SelectField from "../fields/SelectField";

const FSDetailsSectionContent = ({ data, updateField }) => {
  // Handler for FS type change
  const handleFSTypeChange = (e) => {
    const fsType = e.target.value;
    
    // Determine number of foils based on FS type
    const numberOfFoils = parseInt(fsType.replace("FS", ""), 10) || 0;
    
    // Generate foil details based on the number of foils
    const foilDetails = Array.from({ length: numberOfFoils }, (_, index) => {
      // Keep existing data if available, otherwise use defaults
      const existingFoil = data.foilDetails?.[index];
      return existingFoil || { ...DEFAULT_FS_FOIL };
    });
    
    // Update both fields
    updateField("fsType", fsType);
    updateField("foilDetails", foilDetails);
  };

  // Handler for foil details changes
  const handleFoilDetailChange = (index, field, value) => {
    const updatedDetails = [...(data.foilDetails || [])];
    
    if (field === "blockSizeType") {
      updatedDetails[index] = {
        ...updatedDetails[index],
        blockSizeType: value,
        blockDimension: value === "Auto"
          ? {
              length: data.blockDimension?.length || "",
              breadth: data.blockDimension?.breadth || ""
            }
          : { length: "", breadth: "" }
      };
    } else if (field === "blockDimension") {
      updatedDetails[index] = {
        ...updatedDetails[index],
        blockDimension: {
          ...updatedDetails[index].blockDimension,
          ...value
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

  return (
    <div className="space-y-4">
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
                      onChange={(e) => handleFoilDetailChange(index, "blockDimension", { length: e.target.value })}
                      placeholder="Length"
                      disabled={foil.blockSizeType === "Auto"}
                    />
                  </FormField>

                  <FormField label="Breadth (cm)">
                    <NumberField
                      id={`blockBreadth-${index}`}
                      value={foil.blockDimension?.breadth || ""}
                      onChange={(e) => handleFoilDetailChange(index, "blockDimension", { breadth: e.target.value })}
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

// Main component
const FSDetailsSection = () => {
  const { data, updateField } = useFormSection("fsDetails");
  
  return (
    <FSDetailsSectionContent 
      data={data}
      updateField={updateField}
    />
  );
};

// Wrap the component with the section wrapper
export default FormSectionWrapper(FSDetailsSection, {
  sectionId: "fsDetails",
  toggleLabel: "Is FS being used?"
});