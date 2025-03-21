// SandwichSection.jsx (complete)
import React from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { MR_TYPE_OPTIONS, PLATE_TYPE_OPTIONS, FS_TYPE_OPTIONS, FOIL_TYPE_OPTIONS, BLOCK_TYPE_OPTIONS } from "../../../constants/dropdownOptions";
import { DEFAULT_LP_COLOR, DEFAULT_FS_FOIL } from "../../../constants/defaultValues";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";
import NumberField from "../fields/NumberField";

const SandwichSection = () => {
  const { state } = useBillingForm();
  const { data, updateField, toggleField } = useFormState("sandwich");

  // Handle LP sandwich section
  const toggleLPSandwich = () => {
    if (!data.lpDetailsSandwich?.isLPUsed) {
      updateField("lpDetailsSandwich", {
        ...data.lpDetailsSandwich,
        isLPUsed: true,
        noOfColors: 1,
        colorDetails: [{ ...DEFAULT_LP_COLOR }]
      });
    } else {
      updateField("lpDetailsSandwich", {
        ...data.lpDetailsSandwich,
        isLPUsed: false,
        noOfColors: 0,
        colorDetails: []
      });
    }
  };

  // Handle FS sandwich section
  const toggleFSSandwich = () => {
    if (!data.fsDetailsSandwich?.isFSUsed) {
      updateField("fsDetailsSandwich", {
        ...data.fsDetailsSandwich,
        isFSUsed: true,
        fsType: "FS1",
        foilDetails: [{ ...DEFAULT_FS_FOIL }]
      });
    } else {
      updateField("fsDetailsSandwich", {
        ...data.fsDetailsSandwich,
        isFSUsed: false,
        fsType: "",
        foilDetails: []
      });
    }
  };

  // Handle EMB sandwich section
  const toggleEMBSandwich = () => {
    if (!data.embDetailsSandwich?.isEMBUsed) {
      updateField("embDetailsSandwich", {
        ...data.embDetailsSandwich,
        isEMBUsed: true,
        plateSizeType: "Auto",
        plateDimensions: {
          length: state.orderAndPaper.dieSize.length 
            ? inchesToCm(state.orderAndPaper.dieSize.length) 
            : "",
          breadth: state.orderAndPaper.dieSize.breadth 
            ? inchesToCm(state.orderAndPaper.dieSize.breadth) 
            : ""
        },
        plateTypeMale: "Polymer Plate",
        plateTypeFemale: "Polymer Plate",
        embMR: "Simple"
      });
    } else {
      updateField("embDetailsSandwich", {
        ...data.embDetailsSandwich,
        isEMBUsed: false,
        plateSizeType: "",
        plateDimensions: { length: "", breadth: "" },
        plateTypeMale: "",
        plateTypeFemale: "",
        embMR: ""
      });
    }
  };

  // LP color details handling for sandwich
  const handleLPSandwichColorChange = (index, field, value) => {
    const updatedDetails = [...(data.lpDetailsSandwich?.colorDetails || [])];
    
    if (field === "plateSizeType") {
      updatedDetails[index] = {
        ...updatedDetails[index],
        plateSizeType: value,
        plateDimensions: value === "Auto"
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
    } else if (field.startsWith("plateDimensions.")) {
      const dimensionField = field.split(".")[1]; // "length" or "breadth"
      updatedDetails[index] = {
        ...updatedDetails[index],
        plateDimensions: {
          ...updatedDetails[index].plateDimensions,
          [dimensionField]: value
        }
      };
    } else {
      updatedDetails[index] = {
        ...updatedDetails[index],
        [field]: value
      };
    }
    
    updateField("lpDetailsSandwich", {
      ...data.lpDetailsSandwich,
      colorDetails: updatedDetails
    });
  };

  // Handle LP sandwich number of colors change
  const handleLPSandwichNoOfColorsChange = (e) => {
    const noOfColors = parseInt(e.target.value, 10) || 0;
    
    // Generate color details based on the number of colors
    let colorDetails = [...(data.lpDetailsSandwich?.colorDetails || [])];
    
    // If we need more colors than we have, add new ones
    if (noOfColors > colorDetails.length) {
      const newColors = Array(noOfColors - colorDetails.length)
        .fill(null)
        .map(() => ({ ...DEFAULT_LP_COLOR }));
      
      colorDetails = [...colorDetails, ...newColors];
    }
    // If we need fewer colors, remove the extra ones
    else if (noOfColors < colorDetails.length) {
      colorDetails = colorDetails.slice(0, noOfColors);
    }
    
    updateField("lpDetailsSandwich", {
      ...data.lpDetailsSandwich,
      noOfColors,
      colorDetails
    });
  };

  // FS foil details handling for sandwich
  const handleFSSandwichFoilChange = (index, field, value) => {
    const updatedDetails = [...(data.fsDetailsSandwich?.foilDetails || [])];
    
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
    
    updateField("fsDetailsSandwich", {
      ...data.fsDetailsSandwich,
      foilDetails: updatedDetails
    });
  };

  // Handle FS sandwich type change
  const handleFSSandwichTypeChange = (e) => {
    const fsType = e.target.value;
    
    // Determine number of foils based on FS type
    const numberOfFoils = fsType === "FS1" ? 1 
                        : fsType === "FS2" ? 2 
                        : fsType === "FS3" ? 3 
                        : fsType === "FS4" ? 4 
                        : fsType === "FS5" ? 5 : 0;
    
    // Generate foil details based on the number of foils
    let foilDetails = [...(data.fsDetailsSandwich?.foilDetails || [])];
    
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
    
    updateField("fsDetailsSandwich", {
      ...data.fsDetailsSandwich,
      fsType,
      foilDetails
    });
  };

  // EMB sandwich plate size type change
  const handleEMBSandwichPlateSizeTypeChange = (e) => {
    const plateSizeType = e.target.value;
    
    // Update dimensions if Auto selected
    if (plateSizeType === "Auto") {
      updateField("embDetailsSandwich", {
        ...data.embDetailsSandwich,
        plateSizeType,
        plateDimensions: {
          length: state.orderAndPaper.dieSize.length 
            ? inchesToCm(state.orderAndPaper.dieSize.length) 
            : "",
          breadth: state.orderAndPaper.dieSize.breadth 
            ? inchesToCm(state.orderAndPaper.dieSize.breadth) 
            : ""
        }
      });
    } else {
      updateField("embDetailsSandwich", {
        ...data.embDetailsSandwich,
        plateSizeType,
        plateDimensions: { length: "", breadth: "" }
      });
    }
  };

  // EMB sandwich dimension change
  const handleEMBSandwichDimensionChange = (field, value) => {
    updateField("embDetailsSandwich", {
      ...data.embDetailsSandwich,
      plateDimensions: {
        ...data.embDetailsSandwich?.plateDimensions,
        [field]: value
      }
    });
  };

  // EMB sandwich field change
  const handleEMBSandwichFieldChange = (field, value) => {
    updateField("embDetailsSandwich", {
      ...data.embDetailsSandwich,
      [field]: value
    });
  };

  if (!data.isSandwichComponentUsed) {
    return (
      <FormToggle
        label="Use Sandwich Component?"
        isChecked={data.isSandwichComponentUsed}
        onChange={() => toggleField("isSandwichComponentUsed")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FormToggle
        label="Use Sandwich Component?"
        isChecked={data.isSandwichComponentUsed}
        onChange={() => toggleField("isSandwichComponentUsed")}
      />

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
                onChange={handleLPSandwichNoOfColorsChange}
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
                      onChange={(e) => handleLPSandwichColorChange(index, "plateSizeType", e.target.value)}
                      options={["Auto", "Manual"]}
                    />
                  </FormField>

                  {/* Pantone Type */}
                  <FormField label="Pantone Type">
                    <input
                      type="text"
                      value={color.pantoneType || ""}
                      onChange={(e) => handleLPSandwichColorChange(index, "pantoneType", e.target.value)}
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
                        onChange={(e) => handleLPSandwichColorChange(index, "plateDimensions.length", e.target.value)}
                        placeholder="Length"
                        disabled={color.plateSizeType === "Auto"}
                      />
                    </FormField>

                    <FormField label="Breadth (cm)">
                      <NumberField
                        id={`lpSandwichPlateBreadth-${index}`}
                        value={color.plateDimensions?.breadth || ""}
                        onChange={(e) => handleLPSandwichColorChange(index, "plateDimensions.breadth", e.target.value)}
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
                      onChange={(e) => handleLPSandwichColorChange(index, "plateType", e.target.value)}
                      options={PLATE_TYPE_OPTIONS}
                    />
                  </FormField>

                  {/* MR Type */}
                  <FormField label="MR Type">
                    <SelectField
                      id={`lpSandwichMrType-${index}`}
                      value={color.mrType || "Simple"}
                      onChange={(e) => handleLPSandwichColorChange(index, "mrType", e.target.value)}
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
                        onChange={(e) => handleFSSandwichFoilChange(index, "blockDimension.length", e.target.value)}
                        placeholder="Length"
                        disabled={foil.blockSizeType === "Auto"}
                      />
                    </FormField>

                    <FormField label="Breadth (cm)">
                      <NumberField
                        id={`fsSandwichBlockBreadth-${index}`}
                        value={foil.blockDimension?.breadth || ""}
                        onChange={(e) => handleFSSandwichFoilChange(index, "blockDimension.breadth", e.target.value)}
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

export default SandwichSection;