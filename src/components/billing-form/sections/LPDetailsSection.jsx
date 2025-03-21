import React from "react";
import useFormSection from "../../../hooks/useFormSection";
import FormSectionWrapper from "../utils/FormSectionWrapper";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { MR_TYPE_OPTIONS, PLATE_TYPE_OPTIONS } from "../../../constants/dropdownOptions";
import { DEFAULT_LP_COLOR } from "../../../constants/defaultValues";

import FormField from "../../common/FormField";
import NumberField from "../fields/NumberField";
import SelectField from "../fields/SelectField";

const LPDetailsSectionContent = ({ data, updateField }) => {
  // Handler for color count change
  const handleColorCountChange = (e) => {
    const colorCount = parseInt(e.target.value, 10) || 0;
    
    // Generate or update color details array
    const colorDetails = Array.from({ length: colorCount }, (_, index) => {
      // Keep existing data if available, otherwise use defaults
      const existingColor = data.colorDetails?.[index];
      return existingColor || { ...DEFAULT_LP_COLOR };
    });
    
    // Update both fields at once
    updateField("noOfColors", colorCount);
    updateField("colorDetails", colorDetails);
  };

  // Handler for color details changes
  const handleColorDetailsChange = (index, field, value) => {
    const updatedColorDetails = [...(data.colorDetails || [])];
    
    if (field === "plateSizeType") {
      // Special handling for plate size type changes
      updatedColorDetails[index] = {
        ...updatedColorDetails[index],
        plateSizeType: value,
        plateDimensions: value === "Auto" 
          ? {
              length: data.plateDimensions?.length || "",
              breadth: data.plateDimensions?.breadth || ""
            }
          : { length: "", breadth: "" }
      };
    } else if (field === "plateDimensions") {
      // Update plate dimensions
      updatedColorDetails[index] = {
        ...updatedColorDetails[index],
        plateDimensions: {
          ...updatedColorDetails[index].plateDimensions,
          ...value
        }
      };
    } else {
      // Update any other field
      updatedColorDetails[index] = {
        ...updatedColorDetails[index],
        [field]: value
      };
    }
    
    // Update the color details array
    updateField("colorDetails", updatedColorDetails);
  };

  return (
    <div className="space-y-4">
      {/* Color Count */}
      <FormField label="Number of Colors">
        <NumberField
          id="noOfColors"
          name="noOfColors"
          value={data.noOfColors || 0}
          onChange={handleColorCountChange}
          min={1}
          placeholder="Enter number of colors"
        />
      </FormField>

      {/* Color Details */}
      {data.noOfColors > 0 && data.colorDetails && (
        <div className="space-y-4 mt-4">
          <h3 className="font-medium text-gray-700">Color Details</h3>
          
          {data.colorDetails.map((color, index) => (
            <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4">
              <h4 className="font-semibold text-sm">Color {index + 1}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plate Size Type */}
                <FormField label="Plate Size Type">
                  <SelectField
                    id={`plateSize-${index}`}
                    value={color.plateSizeType || "Auto"}
                    onChange={(e) => handleColorDetailsChange(index, "plateSizeType", e.target.value)}
                    options={["Auto", "Manual"]}
                  />
                </FormField>

                {/* Plate Dimensions */}
                {color.plateSizeType && (
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Plate Length (cm)">
                      <NumberField
                        id={`plateLength-${index}`}
                        value={color.plateDimensions?.length || ""}
                        onChange={(e) => handleColorDetailsChange(index, "plateDimensions", { length: e.target.value })}
                        placeholder="Length"
                        disabled={color.plateSizeType === "Auto"}
                      />
                    </FormField>
                    <FormField label="Plate Breadth (cm)">
                      <NumberField
                        id={`plateBreadth-${index}`}
                        value={color.plateDimensions?.breadth || ""}
                        onChange={(e) => handleColorDetailsChange(index, "plateDimensions", { breadth: e.target.value })}
                        placeholder="Breadth"
                        disabled={color.plateSizeType === "Auto"}
                      />
                    </FormField>
                  </div>
                )}

                {/* Pantone Type */}
                <FormField label="Pantone Type">
                  <input
                    type="text"
                    placeholder="Enter Pantone Type"
                    value={color.pantoneType || ""}
                    onChange={(e) => handleColorDetailsChange(index, "pantoneType", e.target.value)}
                    className="border rounded-md p-2 w-full text-xs"
                  />
                </FormField>

                {/* Plate Type */}
                <FormField label="Plate Type">
                  <SelectField
                    id={`plateType-${index}`}
                    value={color.plateType || "Polymer Plate"}
                    onChange={(e) => handleColorDetailsChange(index, "plateType", e.target.value)}
                    options={PLATE_TYPE_OPTIONS}
                  />
                </FormField>

                {/* MR Type */}
                <FormField label="MR Type">
                  <SelectField
                    id={`mrType-${index}`}
                    value={color.mrType || "Simple"}
                    onChange={(e) => handleColorDetailsChange(index, "mrType", e.target.value)}
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
const LPDetailsSection = () => {
  const { data, updateField } = useFormSection("lpDetails");
  
  return (
    <LPDetailsSectionContent 
      data={data}
      updateField={updateField}
    />
  );
};

// Wrap the component with the section wrapper
export default FormSectionWrapper(LPDetailsSection, {
  sectionId: "lpDetails",
  toggleLabel: "Is LP being used?"
});