// // DieCuttingSection.jsx
// import React, { useEffect } from "react";
// import { useBillingForm } from "../../../context/BillingFormContext";
// import useFormState from "../../../hooks/useFormState";
// import { DIE_CUT_OPTIONS, MR_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

// import FormField from "../../common/FormField";
// import FormToggle from "../fields/FormToggle";
// import SelectField from "../fields/SelectField";

// const DieCuttingSection = () => {
//   const { data, updateField, toggleField } = useFormState("dieCutting");

//   // Reset PDC to "No" when difficulty is "No"
//   useEffect(() => {
//     if (data.difficulty === "No" && data.pdc === "Yes") {
//       updateField("pdc", "No");
//     }
//   }, [data.difficulty, data.pdc, updateField]);

//   // Initialize with defaults when toggling on/off
//   const handleToggleDieCutting = () => {
//     if (!data.isDieCuttingUsed) {
//       toggleField("isDieCuttingUsed");
//       updateField("difficulty", "No");
//       updateField("pdc", "No");
//       updateField("dcMR", "Simple");
//       updateField("dcImpression", 0.25); // Default impression cost
//     } else {
//       toggleField("isDieCuttingUsed");
//     }
//   };

//   if (!data.isDieCuttingUsed) {
//     return (
//       <FormToggle
//         label="Is Die Cutting being used?"
//         isChecked={data.isDieCuttingUsed}
//         onChange={handleToggleDieCutting}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <FormToggle
//         label="Is Die Cutting being used?"
//         isChecked={data.isDieCuttingUsed}
//         onChange={handleToggleDieCutting}
//       />

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Die Cut Dropdown */}
//         <FormField label="DIE CUT">
//           <SelectField
//             id="difficulty"
//             name="difficulty"
//             value={data.difficulty || "No"}
//             onChange={(e) => updateField("difficulty", e.target.value)}
//             options={DIE_CUT_OPTIONS}
//           />
//         </FormField>

//         {/* PDC Dropdown */}
//         <FormField label="PRE DIE CUT">
//           <SelectField
//             id="pdc"
//             name="pdc"
//             value={data.pdc || "No"}
//             onChange={(e) => updateField("pdc", e.target.value)}
//             options={DIE_CUT_OPTIONS}
//             disabled={data.difficulty === "No"}
//           />
//         </FormField>
//       </div>

//       {/* DC MR Dropdown - Only visible when Die Cut is Yes */}
//       {data.difficulty === "Yes" && (
//         <FormField label="DC MR">
//           <SelectField
//             id="dcMR"
//             name="dcMR"
//             value={data.dcMR || "Simple"}
//             onChange={(e) => updateField("dcMR", e.target.value)}
//             options={MR_TYPE_OPTIONS}
//           />
//         </FormField>
//       )}
//     </div>
//   );
// };

// export default DieCuttingSection;

import React, { useEffect, useState } from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { DIE_CUT_OPTIONS, MR_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";

const DieCuttingSection = () => {
  const { data, updateField } = useFormState("dieCutting");
  const [errors, setErrors] = useState({});

  // When DC is changed to No, automatically set PDC to No
  useEffect(() => {
    if (data.difficulty === "No" && data.pdc === "Yes") {
      updateField("pdc", "No");
    }
  }, [data.difficulty, data.pdc, updateField]);

  const handleToggleDieCuttingUsed = () => {
    const updatedIsDieCuttingUsed = !data.isDieCuttingUsed;
    
    if (updatedIsDieCuttingUsed) {
      // Initialize with default values when enabling Die Cutting
      updateField("isDieCuttingUsed", true);
      updateField("difficulty", "No");
      updateField("pdc", "No");
      updateField("dcMR", "Simple");
      updateField("dcImpression", 0.25); // Default impression cost
    } else {
      // Reset when disabling Die Cutting
      updateField("isDieCuttingUsed", false);
      updateField("difficulty", "");
      updateField("pdc", "");
      updateField("dcMR", "");
      updateField("dcImpression", 0);
    }
  };

  const handleDifficultyChange = (e) => {
    const difficulty = e.target.value;
    
    // If changed to No, reset PDC
    if (difficulty === "No") {
      updateField("difficulty", difficulty);
      updateField("pdc", "No");
    } else {
      updateField("difficulty", difficulty);
    }
  };

  return (
    <div className="space-y-6">
      {/* Die Cutting Toggle */}
      <FormToggle
        label="Is Die Cutting being used?"
        isChecked={data.isDieCuttingUsed}
        onChange={handleToggleDieCuttingUsed}
      />

      {data.isDieCuttingUsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Die Cut Dropdown */}
          <FormField label="DIE CUT">
            <SelectField
              id="difficulty"
              name="difficulty"
              value={data.difficulty || "No"}
              onChange={handleDifficultyChange}
              options={DIE_CUT_OPTIONS}
            />
          </FormField>

          {/* PDC Dropdown - Only enabled when Die Cut is Yes */}
          <FormField label="PRE DIE CUT">
            <SelectField
              id="pdc"
              name="pdc"
              value={data.pdc || "No"}
              onChange={(e) => updateField("pdc", e.target.value)}
              options={DIE_CUT_OPTIONS}
              disabled={data.difficulty === "No"}
            />
          </FormField>

          {/* DC MR Dropdown - Only visible when Die Cut is Yes */}
          {data.difficulty === "Yes" && (
            <FormField label="DC MR">
              <SelectField
                id="dcMR"
                name="dcMR"
                value={data.dcMR || "Simple"}
                onChange={(e) => updateField("dcMR", e.target.value)}
                options={MR_TYPE_OPTIONS}
              />
            </FormField>
          )}
        </div>
      )}
    </div>
  );
};

export default DieCuttingSection;