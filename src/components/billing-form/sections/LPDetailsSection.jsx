// LPDetailsSection.jsx
import React, { useState } from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { MR_TYPE_OPTIONS, PLATE_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import NumberField from "../fields/NumberField";
import SelectField from "../fields/SelectField";
import { DEFAULT_LP_COLOR } from "../../../constants/defaultValues";

const LPDetailsSection = () => {
  const { state } = useBillingForm();
  const { data, updateField, toggleField } = useFormState("lpDetails");
  const [colorErrors, setColorErrors] = useState([]);

  const handleNoOfColorsChange = (e) => {
    const noOfColors = parseInt(e.target.value, 10) || 0;
    
    // Generate color details based on the number of colors
    let colorDetails = [...(data.colorDetails || [])];
    
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
    
    updateField("noOfColors", noOfColors);
    updateField("colorDetails", colorDetails);
  };

  const handleColorDetailChange = (index, field, value) => {
    const updatedDetails = [...(data.colorDetails || [])];
    
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
    
    updateField("colorDetails", updatedDetails);
  };

  if (!data.isLPUsed) {
    return (
      <FormToggle
        label="Is LP being used?"
        isChecked={data.isLPUsed}
        onChange={() => toggleField("isLPUsed")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FormToggle
        label="Is LP being used?"
        isChecked={data.isLPUsed}
        onChange={() => toggleField("isLPUsed")}
      />

      <FormField
        label="Number of Colors"
        name="noOfColors"
      >
        <NumberField
          id="noOfColors"
          name="noOfColors"
          value={data.noOfColors}
          onChange={handleNoOfColorsChange}
          min="0"
          max="10"
        />
      </FormField>

      {data.noOfColors > 0 && (
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Color Details</h3>
          
          {Array.from({ length: data.noOfColors }, (_, index) => {
            const color = data.colorDetails[index] || {};
            return (
              <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4">
                <h4 className="font-semibold text-sm">Color {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plate Size Type */}
                  <FormField label="Plate Size Type">
                    <SelectField
                      id={`plateSizeType-${index}`}
                      value={color.plateSizeType || "Auto"}
                      onChange={(e) => handleColorDetailChange(index, "plateSizeType", e.target.value)}
                      options={["Auto", "Manual"]}
                    />
                  </FormField>

                  {/* Pantone Type */}
                  <FormField label="Pantone Type">
                    <input
                      type="text"
                      value={color.pantoneType || ""}
                      onChange={(e) => handleColorDetailChange(index, "pantoneType", e.target.value)}
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
                        id={`plateLength-${index}`}
                        value={color.plateDimensions?.length || ""}
                        onChange={(e) => handleColorDetailChange(index, "plateDimensions.length", e.target.value)}
                        placeholder="Length"
                        disabled={color.plateSizeType === "Auto"}
                      />
                    </FormField>

                    <FormField label="Breadth (cm)">
                      <NumberField
                        id={`plateBreadth-${index}`}
                        value={color.plateDimensions?.breadth || ""}
                        onChange={(e) => handleColorDetailChange(index, "plateDimensions.breadth", e.target.value)}
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
                      id={`plateType-${index}`}
                      value={color.plateType || "Polymer Plate"}
                      onChange={(e) => handleColorDetailChange(index, "plateType", e.target.value)}
                      options={PLATE_TYPE_OPTIONS}
                    />
                  </FormField>

                  {/* MR Type */}
                  <FormField label="MR Type">
                    <SelectField
                      id={`mrType-${index}`}
                      value={color.mrType || "Simple"}
                      onChange={(e) => handleColorDetailChange(index, "mrType", e.target.value)}
                      options={MR_TYPE_OPTIONS}
                    />
                  </FormField>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LPDetailsSection;