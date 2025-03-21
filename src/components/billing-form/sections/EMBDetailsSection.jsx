// // EMBDetailsSection.jsx
// import React from "react";
// import { useBillingForm } from "../../../context/BillingFormContext";
// import useFormState from "../../../hooks/useFormState";
// import { inchesToCm } from "../../../utils/calculationHelpers";
// import { PLATE_TYPE_OPTIONS, MR_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

// import FormField from "../../common/FormField";
// import FormToggle from "../fields/FormToggle";
// import SelectField from "../fields/SelectField";
// import NumberField from "../fields/NumberField";

// const EMBDetailsSection = () => {
//   const { state } = useBillingForm();
//   const { data, updateField, toggleField } = useFormState("embDetails");

//   const handlePlateSizeTypeChange = (e) => {
//     const plateSizeType = e.target.value;
//     updateField("plateSizeType", plateSizeType);
    
//     // Update dimensions if Auto selected
//     if (plateSizeType === "Auto") {
//       updateField("plateDimensions", {
//         length: state.orderAndPaper.dieSize.length 
//           ? inchesToCm(state.orderAndPaper.dieSize.length) 
//           : "",
//         breadth: state.orderAndPaper.dieSize.breadth 
//           ? inchesToCm(state.orderAndPaper.dieSize.breadth) 
//           : ""
//       });
//     } else if (plateSizeType === "Manual") {
//       // Reset dimensions for manual entry
//       updateField("plateDimensions", { length: "", breadth: "" });
//     }
//   };

//   const handleDimensionChange = (field, value) => {
//     updateField("plateDimensions", {
//       ...data.plateDimensions,
//       [field]: value
//     });
//   };

//   // Initialize with defaults when toggling on
//   const handleToggleEMB = () => {
//     if (!data.isEMBUsed) {
//       toggleField("isEMBUsed");
//       updateField("plateSizeType", "Auto");
//       updateField("plateDimensions", {
//         length: state.orderAndPaper.dieSize.length 
//           ? inchesToCm(state.orderAndPaper.dieSize.length) 
//           : "",
//         breadth: state.orderAndPaper.dieSize.breadth 
//           ? inchesToCm(state.orderAndPaper.dieSize.breadth) 
//           : ""
//       });
//       updateField("plateTypeMale", "Polymer Plate");
//       updateField("plateTypeFemale", "Polymer Plate");
//       updateField("embMR", "Simple");
//     } else {
//       toggleField("isEMBUsed");
//     }
//   };

//   if (!data.isEMBUsed) {
//     return (
//       <FormToggle
//         label="Is EMB being used?"
//         isChecked={data.isEMBUsed}
//         onChange={handleToggleEMB}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <FormToggle
//         label="Is EMB being used?"
//         isChecked={data.isEMBUsed}
//         onChange={handleToggleEMB}
//       />

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <FormField label="Plate Size Type">
//           <SelectField
//             id="plateSizeType"
//             value={data.plateSizeType || "Auto"}
//             onChange={handlePlateSizeTypeChange}
//             options={["Auto", "Manual"]}
//           />
//         </FormField>

//         {/* Plate Type Male */}
//         <FormField label="Plate Type Male">
//           <SelectField
//             id="plateTypeMale"
//             name="plateTypeMale"
//             value={data.plateTypeMale || "Polymer Plate"}
//             onChange={(e) => updateField("plateTypeMale", e.target.value)}
//             options={PLATE_TYPE_OPTIONS}
//           />
//         </FormField>
//       </div>

//       {data.plateSizeType && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Plate Dimensions */}
//           <FormField label="Length (cm)">
//             <NumberField
//               id="plateLength"
//               value={data.plateDimensions?.length || ""}
//               onChange={(e) => handleDimensionChange("length", e.target.value)}
//               placeholder="Length"
//               disabled={data.plateSizeType === "Auto"}
//             />
//           </FormField>

//           <FormField label="Breadth (cm)">
//             <NumberField
//               id="plateBreadth"
//               value={data.plateDimensions?.breadth || ""}
//               onChange={(e) => handleDimensionChange("breadth", e.target.value)}
//               placeholder="Breadth"
//               disabled={data.plateSizeType === "Auto"}
//             />
//           </FormField>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Plate Type Female */}
//         <FormField label="Plate Type Female">
//           <SelectField
//             id="plateTypeFemale"
//             name="plateTypeFemale"
//             value={data.plateTypeFemale || "Polymer Plate"}
//             onChange={(e) => updateField("plateTypeFemale", e.target.value)}
//             options={PLATE_TYPE_OPTIONS}
//           />
//         </FormField>

//         {/* EMB MR */}
//         <FormField label="EMB MR">
//           <SelectField
//             id="embMR"
//             name="embMR"
//             value={data.embMR || "Simple"}
//             onChange={(e) => updateField("embMR", e.target.value)}
//             options={MR_TYPE_OPTIONS}
//           />
//         </FormField>
//       </div>
//     </div>
//   );
// };

// export default EMBDetailsSection;

import React, { useState, useEffect } from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { PLATE_TYPE_OPTIONS, MR_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import NumberField from "../fields/NumberField";
import SelectField from "../fields/SelectField";

const EMBDetailsSection = () => {
  const { state } = useBillingForm();
  const { data, updateField } = useFormState("embDetails");
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };
  const [errors, setErrors] = useState({});

  // Update dimensions when plate size type or die size changes
  useEffect(() => {
    if (data.isEMBUsed && data.plateSizeType === "Auto") {
      updateField("plateDimensions", {
        length: dieSize.length ? inchesToCm(dieSize.length) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
      });
    }
  }, [data.isEMBUsed, data.plateSizeType, dieSize, updateField]);

  const handleToggleEMBUsed = () => {
    const updatedIsEMBUsed = !data.isEMBUsed;
    
    if (updatedIsEMBUsed) {
      // Initialize with default values when enabling EMB
      updateField("isEMBUsed", true);
      updateField("plateSizeType", "Auto");
      updateField("plateDimensions", {
        length: dieSize.length ? inchesToCm(dieSize.length) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
      });
      updateField("plateTypeMale", "Polymer Plate");
      updateField("plateTypeFemale", "Polymer Plate");
      updateField("embMR", "Simple");
    } else {
      // Reset when disabling EMB
      updateField("isEMBUsed", false);
      updateField("plateSizeType", "");
      updateField("plateDimensions", { length: "", breadth: "" });
      updateField("plateTypeMale", "");
      updateField("plateTypeFemale", "");
      updateField("embMR", "");
    }
  };

  const handlePlateSizeTypeChange = (e) => {
    const sizeType = e.target.value;
    updateField("plateSizeType", sizeType);
    
    if (sizeType === "Auto") {
      updateField("plateDimensions", {
        length: dieSize.length ? inchesToCm(dieSize.length) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
      });
    } else {
      // Clear dimensions for manual entry
      updateField("plateDimensions", { length: "", breadth: "" });
    }
  };

  const handleDimensionChange = (field, value) => {
    updateField("plateDimensions", {
      ...data.plateDimensions,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* EMB Toggle */}
      <FormToggle
        label="Is EMB being used?"
        isChecked={data.isEMBUsed}
        onChange={handleToggleEMBUsed}
      />

      {data.isEMBUsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plate Size Type */}
          <FormField label="Plate Size Type">
            <SelectField
              id="plateSizeType"
              value={data.plateSizeType || "Auto"}
              onChange={handlePlateSizeTypeChange}
              options={["Auto", "Manual"]}
            />
          </FormField>

          {/* Plate Dimensions */}
          {data.plateSizeType && (
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Plate Length (cm)">
                <NumberField
                  id="plateLength"
                  value={data.plateDimensions?.length || ""}
                  onChange={(e) => handleDimensionChange("length", e.target.value)}
                  placeholder="Length"
                  disabled={data.plateSizeType === "Auto"}
                />
              </FormField>
              <FormField label="Plate Breadth (cm)">
                <NumberField
                  id="plateBreadth"
                  value={data.plateDimensions?.breadth || ""}
                  onChange={(e) => handleDimensionChange("breadth", e.target.value)}
                  placeholder="Breadth"
                  disabled={data.plateSizeType === "Auto"}
                />
              </FormField>
            </div>
          )}

          {/* Plate Type Male */}
          <FormField label="Plate Type Male">
            <SelectField
              id="plateTypeMale"
              value={data.plateTypeMale || "Polymer Plate"}
              onChange={(e) => updateField("plateTypeMale", e.target.value)}
              options={PLATE_TYPE_OPTIONS}
            />
          </FormField>

          {/* Plate Type Female */}
          <FormField label="Plate Type Female">
            <SelectField
              id="plateTypeFemale"
              value={data.plateTypeFemale || "Polymer Plate"}
              onChange={(e) => updateField("plateTypeFemale", e.target.value)}
              options={PLATE_TYPE_OPTIONS}
            />
          </FormField>

          {/* EMB MR */}
          <FormField label="EMB MR">
            <SelectField
              id="embMR"
              value={data.embMR || "Simple"}
              onChange={(e) => updateField("embMR", e.target.value)}
              options={MR_TYPE_OPTIONS}
            />
          </FormField>
        </div>
      )}
    </div>
  );
};

export default EMBDetailsSection;