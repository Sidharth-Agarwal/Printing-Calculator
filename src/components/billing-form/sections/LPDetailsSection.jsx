// // LPDetailsSection.jsx
// import React, { useState } from "react";
// import { useBillingForm } from "../../../context/BillingFormContext";
// import useFormState from "../../../hooks/useFormState";
// import { inchesToCm } from "../../../utils/calculationHelpers";
// import { MR_TYPE_OPTIONS, PLATE_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

// import FormField from "../../common/FormField";
// import FormToggle from "../fields/FormToggle";
// import NumberField from "../fields/NumberField";
// import SelectField from "../fields/SelectField";
// import { DEFAULT_LP_COLOR } from "../../../constants/defaultValues";

// const LPDetailsSection = () => {
//   const { state } = useBillingForm();
//   const { data, updateField, toggleField } = useFormState("lpDetails");
//   const [colorErrors, setColorErrors] = useState([]);

//   const handleNoOfColorsChange = (e) => {
//     const noOfColors = parseInt(e.target.value, 10) || 0;
    
//     // Generate color details based on the number of colors
//     let colorDetails = [...(data.colorDetails || [])];
    
//     // If we need more colors than we have, add new ones
//     if (noOfColors > colorDetails.length) {
//       const newColors = Array(noOfColors - colorDetails.length)
//         .fill(null)
//         .map(() => ({ ...DEFAULT_LP_COLOR }));
      
//       colorDetails = [...colorDetails, ...newColors];
//     }
//     // If we need fewer colors, remove the extra ones
//     else if (noOfColors < colorDetails.length) {
//       colorDetails = colorDetails.slice(0, noOfColors);
//     }
    
//     updateField("noOfColors", noOfColors);
//     updateField("colorDetails", colorDetails);
//   };

//   const handleColorDetailChange = (index, field, value) => {
//     const updatedDetails = [...(data.colorDetails || [])];
    
//     if (field === "plateSizeType") {
//       updatedDetails[index] = {
//         ...updatedDetails[index],
//         plateSizeType: value,
//         plateDimensions: value === "Auto"
//           ? {
//               length: state.orderAndPaper.dieSize.length 
//                 ? inchesToCm(state.orderAndPaper.dieSize.length) 
//                 : "",
//               breadth: state.orderAndPaper.dieSize.breadth 
//                 ? inchesToCm(state.orderAndPaper.dieSize.breadth) 
//                 : ""
//             }
//           : { length: "", breadth: "" }
//       };
//     } else if (field.startsWith("plateDimensions.")) {
//       const dimensionField = field.split(".")[1]; // "length" or "breadth"
//       updatedDetails[index] = {
//         ...updatedDetails[index],
//         plateDimensions: {
//           ...updatedDetails[index].plateDimensions,
//           [dimensionField]: value
//         }
//       };
//     } else {
//       updatedDetails[index] = {
//         ...updatedDetails[index],
//         [field]: value
//       };
//     }
    
//     updateField("colorDetails", updatedDetails);
//   };

//   if (!data.isLPUsed) {
//     return (
//       <FormToggle
//         label="Is LP being used?"
//         isChecked={data.isLPUsed}
//         onChange={() => toggleField("isLPUsed")}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <FormToggle
//         label="Is LP being used?"
//         isChecked={data.isLPUsed}
//         onChange={() => toggleField("isLPUsed")}
//       />

//       <FormField
//         label="Number of Colors"
//         name="noOfColors"
//       >
//         <NumberField
//           id="noOfColors"
//           name="noOfColors"
//           value={data.noOfColors}
//           onChange={handleNoOfColorsChange}
//           min="0"
//           max="10"
//         />
//       </FormField>

//       {data.noOfColors > 0 && (
//         <div className="space-y-4">
//           <h3 className="text-md font-semibold">Color Details</h3>
          
//           {Array.from({ length: data.noOfColors }, (_, index) => {
//             const color = data.colorDetails[index] || {};
//             return (
//               <div key={index} className="p-4 border rounded-md bg-gray-50 space-y-4">
//                 <h4 className="font-semibold text-sm">Color {index + 1}</h4>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Plate Size Type */}
//                   <FormField label="Plate Size Type">
//                     <SelectField
//                       id={`plateSizeType-${index}`}
//                       value={color.plateSizeType || "Auto"}
//                       onChange={(e) => handleColorDetailChange(index, "plateSizeType", e.target.value)}
//                       options={["Auto", "Manual"]}
//                     />
//                   </FormField>

//                   {/* Pantone Type */}
//                   <FormField label="Pantone Type">
//                     <input
//                       type="text"
//                       value={color.pantoneType || ""}
//                       onChange={(e) => handleColorDetailChange(index, "pantoneType", e.target.value)}
//                       placeholder="Enter Pantone Type"
//                       className="border rounded-md p-2 w-full text-xs"
//                     />
//                   </FormField>
//                 </div>

//                 {color.plateSizeType && (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Plate Dimensions */}
//                     <FormField label="Length (cm)">
//                       <NumberField
//                         id={`plateLength-${index}`}
//                         value={color.plateDimensions?.length || ""}
//                         onChange={(e) => handleColorDetailChange(index, "plateDimensions.length", e.target.value)}
//                         placeholder="Length"
//                         disabled={color.plateSizeType === "Auto"}
//                       />
//                     </FormField>

//                     <FormField label="Breadth (cm)">
//                       <NumberField
//                         id={`plateBreadth-${index}`}
//                         value={color.plateDimensions?.breadth || ""}
//                         onChange={(e) => handleColorDetailChange(index, "plateDimensions.breadth", e.target.value)}
//                         placeholder="Breadth"
//                         disabled={color.plateSizeType === "Auto"}
//                       />
//                     </FormField>
//                   </div>
//                 )}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Plate Type */}
//                   <FormField label="Plate Type">
//                     <SelectField
//                       id={`plateType-${index}`}
//                       value={color.plateType || "Polymer Plate"}
//                       onChange={(e) => handleColorDetailChange(index, "plateType", e.target.value)}
//                       options={PLATE_TYPE_OPTIONS}
//                     />
//                   </FormField>

//                   {/* MR Type */}
//                   <FormField label="MR Type">
//                     <SelectField
//                       id={`mrType-${index}`}
//                       value={color.mrType || "Simple"}
//                       onChange={(e) => handleColorDetailChange(index, "mrType", e.target.value)}
//                       options={MR_TYPE_OPTIONS}
//                     />
//                   </FormField>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default LPDetailsSection;

import React, { useState, useEffect } from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { MR_TYPE_OPTIONS, PLATE_TYPE_OPTIONS } from "../../../constants/dropdownOptions";
import { DEFAULT_LP_COLOR } from "../../../constants/defaultValues";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import NumberField from "../fields/NumberField";
import SelectField from "../fields/SelectField";

const LPDetailsSection = () => {
  const { state } = useBillingForm();
  const { data, updateField } = useFormState("lpDetails");
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const [errors, setErrors] = useState({});

  // Update plate dimensions automatically when die size changes
  useEffect(() => {
    if (data.isLPUsed && data.colorDetails && data.colorDetails.length > 0) {
      const updatedColorDetails = data.colorDetails.map(color => {
        if (color.plateSizeType === "Auto") {
          return {
            ...color,
            plateDimensions: {
              length: dieSize.length ? inchesToCm(dieSize.length) : "",
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
            }
          };
        }
        return color;
      });

      // Only update if dimensions actually changed
      const needsUpdate = JSON.stringify(data.colorDetails) !== JSON.stringify(updatedColorDetails);
      if (needsUpdate) {
        updateField("colorDetails", updatedColorDetails);
      }
    }
  }, [data.isLPUsed, data.colorDetails, dieSize, updateField]);

  const handleToggleLPUsed = () => {
    const updatedIsLPUsed = !data.isLPUsed;
    if (updatedIsLPUsed) {
      // Initialize with default values when enabling LP
      updateField("isLPUsed", true);
      updateField("noOfColors", 1);
      updateField("colorDetails", [
        {
          ...DEFAULT_LP_COLOR,
          plateDimensions: {
            length: dieSize.length ? inchesToCm(dieSize.length) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
          }
        }
      ]);
    } else {
      // Reset when disabling LP
      updateField("isLPUsed", false);
      updateField("noOfColors", 0);
      updateField("colorDetails", []);
    }
  };

  const handleColorCountChange = (e) => {
    const colorCount = parseInt(e.target.value, 10) || 0;
    updateField("noOfColors", colorCount);

    // Generate or update color details array
    const updatedColorDetails = Array.from({ length: colorCount }, (_, index) => {
      // Keep existing data if available, otherwise use defaults
      const existingColor = data.colorDetails[index];
      return existingColor || {
        ...DEFAULT_LP_COLOR,
        plateDimensions: {
          length: dieSize.length ? inchesToCm(dieSize.length) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
        }
      };
    });

    updateField("colorDetails", updatedColorDetails);
  };

  const handleColorDetailsChange = (index, field, value) => {
    const updatedColorDetails = [...data.colorDetails];

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

    updateField("colorDetails", updatedColorDetails);
  };

  return (
    <div className="space-y-6">
      {/* LP Toggle */}
      <FormToggle
        label="Is LP being used?"
        isChecked={data.isLPUsed}
        onChange={handleToggleLPUsed}
      />

      {data.isLPUsed && (
        <>
          {/* Color Count */}
          <FormField label="Number of Colors">
            <NumberField
              id="noOfColors"
              name="noOfColors"
              value={data.noOfColors || 0}
              onChange={handleColorCountChange}
              min={1}
              placeholder="Enter number of colors"
              required
            />
          </FormField>

          {/* Color Details */}
          {data.colorDetails && data.colorDetails.length > 0 && (
            <div className="space-y-4">
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
        </>
      )}
    </div>
  );
};

export default LPDetailsSection;