import React from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormSection from "../../../hooks/useFormSection";
import FormSectionWrapper from "../utils/FormSectionWrapper";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { MR_TYPE_OPTIONS, PLATE_TYPE_OPTIONS, FS_TYPE_OPTIONS, FOIL_TYPE_OPTIONS, BLOCK_TYPE_OPTIONS } from "../../../constants/dropdownOptions";
import { DEFAULT_LP_COLOR, DEFAULT_FS_FOIL } from "../../../constants/defaultValues";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import NumberField from "../fields/NumberField";
import SelectField from "../fields/SelectField";

const SandwichSectionContent = ({ data, updateField }) => {
  const { state } = useBillingForm();
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  // LP Sandwich Handlers
  const toggleLPSandwich = () => {
    const isCurrentlyUsed = data.lpDetailsSandwich?.isLPUsed || false;
    
    if (!isCurrentlyUsed) {
      // Enable LP in sandwich
      updateField("lpDetailsSandwich", {
        isLPUsed: true,
        noOfColors: 1,
        colorDetails: [{
          ...DEFAULT_LP_COLOR,
          plateDimensions: {
            length: dieSize.length ? inchesToCm(dieSize.length) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
          }
        }]
      });
    } else {
      // Disable LP in sandwich
      updateField("lpDetailsSandwich", {
        isLPUsed: false,
        noOfColors: 0,
        colorDetails: []
      });
    }
  };

  const handleLPSandwichColorCountChange = (e) => {
    const colorCount = parseInt(e.target.value, 10) || 0;
    
    // Generate or update color details array
    const colorDetails = Array.from({ length: colorCount }, (_, index) => {
      // Keep existing data if available, otherwise use defaults
      const existingColor = data.lpDetailsSandwich?.colorDetails?.[index];
      return existingColor || {
        ...DEFAULT_LP_COLOR,
        plateDimensions: {
          length: dieSize.length ? inchesToCm(dieSize.length) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
        }
      };
    });
    
    // Update LP sandwich
    updateField("lpDetailsSandwich", {
      ...data.lpDetailsSandwich,
      noOfColors: colorCount,
      colorDetails
    });
  };

  const handleLPSandwichColorDetailsChange = (index, field, value) => {
    const updatedColorDetails = [...(data.lpDetailsSandwich?.colorDetails || [])];
    
    if (field === "plateSizeType") {
      updatedColorDetails[index] = {
        ...updatedColorDetails[index],
        plateSizeType: value,
        plateDimensions: value === "Auto" 
          ? {
              length: dieSize.length ? inchesToCm(dieSize.length) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
            }
          : { length: "", breadth: "" }
      };
    } else if (field === "plateDimensions") {
      updatedColorDetails[index] = {
        ...updatedColorDetails[index],
        plateDimensions: {
          ...updatedColorDetails[index].plateDimensions,
          ...value
        }
      };
    } else {
      updatedColorDetails[index] = {
        ...updatedColorDetails[index],
        [field]: value
      };
    }
    
    updateField("lpDetailsSandwich", {
      ...data.lpDetailsSandwich,
      colorDetails: updatedColorDetails
    });
  };

  // FS Sandwich Handlers
  const toggleFSSandwich = () => {
    const isCurrentlyUsed = data.fsDetailsSandwich?.isFSUsed || false;
    
    if (!isCurrentlyUsed) {
      // Enable FS in sandwich
      updateField("fsDetailsSandwich", {
        isFSUsed: true,
        fsType: "FS1",
        foilDetails: [{
          ...DEFAULT_FS_FOIL,
          blockDimension: {
            length: dieSize.length ? inchesToCm(dieSize.length) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
          }
        }]
      });
    } else {
      // Disable FS in sandwich
      updateField("fsDetailsSandwich", {
        isFSUsed: false,
        fsType: "",
        foilDetails: []
      });
    }
  };

  const handleFSSandwichTypeChange = (e) => {
    const fsType = e.target.value;
    
    // Determine number of foils based on FS type
    const numberOfFoils = parseInt(fsType.replace("FS", ""), 10) || 0;
    
    // Generate foil details based on the number of foils
    const foilDetails = Array.from({ length: numberOfFoils }, (_, index) => {
      // Keep existing data if available, otherwise use defaults
      const existingFoil = data.fsDetailsSandwich?.foilDetails?.[index];
      return existingFoil || {
        ...DEFAULT_FS_FOIL,
        blockDimension: {
          length: dieSize.length ? inchesToCm(dieSize.length) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
        }
      };
    });
    
    updateField("fsDetailsSandwich", {
      ...data.fsDetailsSandwich,
      fsType,
      foilDetails
    });
  };

  const handleFSSandwichFoilChange = (index, field, value) => {
    const updatedFoilDetails = [...(data.fsDetailsSandwich?.foilDetails || [])];
    
    if (field === "blockSizeType") {
      updatedFoilDetails[index] = {
        ...updatedFoilDetails[index],
        blockSizeType: value,
        blockDimension: value === "Auto"
          ? {
              length: dieSize.length ? inchesToCm(dieSize.length) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
            }
          : { length: "", breadth: "" }
      };
    } else if (field === "blockDimension") {
      updatedFoilDetails[index] = {
        ...updatedFoilDetails[index],
        blockDimension: {
          ...updatedFoilDetails[index].blockDimension,
          ...value
        }
      };
    } else {
      updatedFoilDetails[index] = {
        ...updatedFoilDetails[index],
        [field]: value
      };
    }
    
    updateField("fsDetailsSandwich", {
      ...data.fsDetailsSandwich,
      foilDetails: updatedFoilDetails
    });
  };

  // EMB Sandwich Handlers
  const toggleEMBSandwich = () => {
    const isCurrentlyUsed = data.embDetailsSandwich?.isEMBUsed || false;
    
    if (!isCurrentlyUsed) {
      // Enable EMB in sandwich
      updateField("embDetailsSandwich", {
        isEMBUsed: true,
        plateSizeType: "Auto",
        plateDimensions: {
          length: dieSize.length ? inchesToCm(dieSize.length) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
        },
        plateTypeMale: "Polymer Plate",
        plateTypeFemale: "Polymer Plate",
        embMR: "Simple"
      });
    } else {
      // Disable EMB in sandwich
      updateField("embDetailsSandwich", {
        isEMBUsed: false,
        plateSizeType: "",
        plateDimensions: { length: "", breadth: "" },
        plateTypeMale: "",
        plateTypeFemale: "",
        embMR: ""
      });
    }
  };

  const handleEMBSandwichPlateSizeTypeChange = (e) => {
    const sizeType = e.target.value;
    
    updateField("embDetailsSandwich", {
      ...data.embDetailsSandwich,
      plateSizeType: sizeType,
      plateDimensions: sizeType === "Auto"
        ? {
            length: dieSize.length ? inchesToCm(dieSize.length) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
          }
        : { length: "", breadth: "" }
    });
  };

  const handleEMBSandwichDimensionChange = (field, value) => {
    updateField("embDetailsSandwich", {
      ...data.embDetailsSandwich,
      plateDimensions: {
        ...data.embDetailsSandwich?.plateDimensions,
        [field]: value
      }
    });
  };

  const handleEMBSandwichFieldChange = (field, value) => {
    updateField("embDetailsSandwich", {
      ...data.embDetailsSandwich,
      [field]: value
    });
  };

  return (
    <div className="space-y-8">
      {/* LP Sandwich Section */}
      <div className="border-t pt-4">
        <h3 className="text-md font-semibold mb-4">LETTER PRESS (LP) IN SANDWICH</h3>
        
        <FormToggle
          label="Use LP in Sandwich Component?"
          isChecked={data.lpDetailsSandwich?.isLPUsed || false}
          onChange={toggleLPSandwich}
        />

        {data.lpDetailsSandwich?.isLPUsed && (
          <div className="mt-4 space-y-4">
            <FormField label="Number of Colors">
              <NumberField
                id="lpSandwichNoOfColors"
                value={data.lpDetailsSandwich?.noOfColors || 0}
                onChange={handleLPSandwichColorCountChange}
                min="0"
                max="10"
              />
            </FormField>

            {data.lpDetailsSandwich?.noOfColors > 0 && data.lpDetailsSandwich?.colorDetails?.map((color, index) => (
              <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4">
                <h4 className="font-semibold text-sm">Color {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plate Size Type */}
                  <FormField label="Plate Size Type">
                    <SelectField
                      id={`lpSandwichPlateSizeType-${index}`}
                      value={color.plateSizeType || "Auto"}
                      onChange={(e) => handleLPSandwichColorDetailsChange(index, "plateSizeType", e.target.value)}
                      options={["Auto", "Manual"]}
                    />
                  </FormField>

                  {/* Pantone Type */}
                  <FormField label="Pantone Type">
                    <input
                      type="text"
                      value={color.pantoneType || ""}
                      onChange={(e) => handleLPSandwichColorDetailsChange(index, "pantoneType", e.target.value)}
                      placeholder="Enter Pantone Type"
                      className="border rounded-md p-2 w-full text-xs"
                    />
                  </FormField>
                </div>

                {color.plateSizeType && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Plate Dimensions */}
                    <FormField label="Length (cm)">
                      <NumberField
                        id={`lpSandwichPlateLength-${index}`}
                        value={color.plateDimensions?.length || ""}
                        onChange={(e) => handleLPSandwichColorDetailsChange(index, "plateDimensions", { length: e.target.value })}
                        placeholder="Length"
                        disabled={color.plateSizeType === "Auto"}
                      />
                    </FormField>

                    <FormField label="Breadth (cm)">
                      <NumberField
                        id={`lpSandwichPlateBreadth-${index}`}
                        value={color.plateDimensions?.breadth || ""}
                        onChange={(e) => handleLPSandwichColorDetailsChange(index, "plateDimensions", { breadth: e.target.value })}
                        placeholder="Breadth"
                        disabled={color.plateSizeType === "Auto"}
                      />
                    </FormField>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plate Type */}
                  <FormField label="Plate Type">
                    <SelectField
                      id={`lpSandwichPlateType-${index}`}
                      value={color.plateType || "Polymer Plate"}
                      onChange={(e) => handleLPSandwichColorDetailsChange(index, "plateType", e.target.value)}
                      options={PLATE_TYPE_OPTIONS}
                    />
                  </FormField>

                  {/* MR Type */}
                  <FormField label="MR Type">
                    <SelectField
                      id={`lpSandwichMrType-${index}`}
                      value={color.mrType || "Simple"}
                      onChange={(e) => handleLPSandwichColorDetailsChange(index, "mrType", e.target.value)}
                      options={MR_TYPE_OPTIONS}
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FS Sandwich Section */}
      <div className="border-t pt-4">
        <h3 className="text-md font-semibold mb-4">FOIL STAMPING (FS) IN SANDWICH</h3>
        
        <FormToggle
          label="Use FS in Sandwich Component?"
          isChecked={data.fsDetailsSandwich?.isFSUsed || false}
          onChange={toggleFSSandwich}
        />

        {data.fsDetailsSandwich?.isFSUsed && (
          <div className="mt-4 space-y-4">
            <FormField label="FS Type">
              <SelectField
                id="fsSandwichType"
                value={data.fsDetailsSandwich?.fsType || "FS1"}
                onChange={handleFSSandwichTypeChange}
                options={FS_TYPE_OPTIONS}
              />
            </FormField>

            {data.fsDetailsSandwich?.foilDetails?.map((foil, index) => (
              <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4">
                <h4 className="font-semibold text-sm">Foil {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Block Size Type */}
                  <FormField label="Block Size Type">
                    <SelectField
                      id={`fsSandwichBlockSizeType-${index}`}
                      value={foil.blockSizeType || "Auto"}
                      onChange={(e) => handleFSSandwichFoilChange(index, "blockSizeType", e.target.value)}
                      options={["Auto", "Manual"]}
                    />
                  </FormField>

                  {/* Foil Type */}
                  <FormField label="Foil Type">
                    <SelectField
                      id={`fsSandwichFoilType-${index}`}
                      value={foil.foilType || "Gold MTS 220"}
                      onChange={(e) => handleFSSandwichFoilChange(index, "foilType", e.target.value)}
                      options={FOIL_TYPE_OPTIONS}
                    />
                  </FormField>
                </div>

                {foil.blockSizeType && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Block Dimensions */}
                    <FormField label="Length (cm)">
                      <NumberField
                        id={`fsSandwichBlockLength-${index}`}
                        value={foil.blockDimension?.length || ""}
                        onChange={(e) => handleFSSandwichFoilChange(index, "blockDimension", { length: e.target.value })}
                        placeholder="Length"
                        disabled={foil.blockSizeType === "Auto"}
                      />
                    </FormField>

                    <FormField label="Breadth (cm)">
                      <NumberField
                        id={`fsSandwichBlockBreadth-${index}`}
                        value={foil.blockDimension?.breadth || ""}
                        onChange={(e) => handleFSSandwichFoilChange(index, "blockDimension", { breadth: e.target.value })}
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
                      id={`fsSandwichBlockType-${index}`}
                      value={foil.blockType || "Magnesium Block 3MM"}
                      onChange={(e) => handleFSSandwichFoilChange(index, "blockType", e.target.value)}
                      options={BLOCK_TYPE_OPTIONS}
                    />
                  </FormField>

                  {/* MR Type */}
                  <FormField label="MR Type">
                    <SelectField
                      id={`fsSandwichMrType-${index}`}
                      value={foil.mrType || "Simple"}
                      onChange={(e) => handleFSSandwichFoilChange(index, "mrType", e.target.value)}
                      options={MR_TYPE_OPTIONS}
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EMB Sandwich Section */}
      <div className="border-t pt-4">
        <h3 className="text-md font-semibold mb-4">EMBOSSING (EMB) IN SANDWICH</h3>
        
        <FormToggle
          label="Use EMB in Sandwich Component?"
          isChecked={data.embDetailsSandwich?.isEMBUsed || false}
          onChange={toggleEMBSandwich}
        />

        {data.embDetailsSandwich?.isEMBUsed && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Plate Size Type">
                <SelectField
                  id="embSandwichPlateSizeType"
                  value={data.embDetailsSandwich?.plateSizeType || "Auto"}
                  onChange={handleEMBSandwichPlateSizeTypeChange}
                  options={["Auto", "Manual"]}
                />
              </FormField>

              {/* Plate Type Male */}
              <FormField label="Plate Type Male">
                <SelectField
                  id="embSandwichPlateTypeMale"
                  value={data.embDetailsSandwich?.plateTypeMale || "Polymer Plate"}
                  onChange={(e) => handleEMBSandwichFieldChange("plateTypeMale", e.target.value)}
                  options={PLATE_TYPE_OPTIONS}
                />
              </FormField>
            </div>

            {data.embDetailsSandwich?.plateSizeType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plate Dimensions */}
                <FormField label="Length (cm)">
                  <NumberField
                    id="embSandwichPlateLength"
                    value={data.embDetailsSandwich?.plateDimensions?.length || ""}
                    onChange={(e) => handleEMBSandwichDimensionChange("length", e.target.value)}
                    placeholder="Length"
                    disabled={data.embDetailsSandwich?.plateSizeType === "Auto"}
                  />
                </FormField>

                <FormField label="Breadth (cm)">
                  <NumberField
                    id="embSandwichPlateBreadth"
                    value={data.embDetailsSandwich?.plateDimensions?.breadth || ""}
                    onChange={(e) => handleEMBSandwichDimensionChange("breadth", e.target.value)}
                    placeholder="Breadth"
                    disabled={data.embDetailsSandwich?.plateSizeType === "Auto"}
                  />
                </FormField>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plate Type Female */}
              <FormField label="Plate Type Female">
                <SelectField
                  id="embSandwichPlateTypeFemale"
                  value={data.embDetailsSandwich?.plateTypeFemale || "Polymer Plate"}
                  onChange={(e) => handleEMBSandwichFieldChange("plateTypeFemale", e.target.value)}
                  options={PLATE_TYPE_OPTIONS}
                />
              </FormField>

              {/* EMB MR */}
              <FormField label="EMB MR">
                <SelectField
                  id="embSandwichEmbMR"
                  value={data.embDetailsSandwich?.embMR || "Simple"}
                  onChange={(e) => handleEMBSandwichFieldChange("embMR", e.target.value)}
                  options={MR_TYPE_OPTIONS}
                />
              </FormField>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
const SandwichSection = () => {
  const { data, updateField } = useFormSection("sandwich");
  
  return (
    <SandwichSectionContent
      data={data}
      updateField={updateField}
    />
  );
};

// Wrap the component with the section wrapper
export default FormSectionWrapper(SandwichSection, {
  sectionId: "sandwich",
  toggleLabel: "Use Sandwich Component?"
});