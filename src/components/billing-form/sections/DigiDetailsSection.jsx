// // DigiDetailsSection.jsx
// import React from "react";
// import { useBillingForm } from "../../../context/BillingFormContext";
// import useFormState from "../../../hooks/useFormState";
// import { DIGI_DIE_OPTIONS } from "../../../constants/dropdownOptions";
// import { formatDimensions } from "../../../utils/formatters";

// import FormField from "../../common/FormField";
// import FormToggle from "../fields/FormToggle";
// import SelectField from "../fields/SelectField";

// const DigiDetailsSection = () => {
//   const { data, updateField, toggleField } = useFormState("digiDetails");

//   const handleDigiDieChange = (e) => {
//     const digiDie = e.target.value;
//     updateField("digiDie", digiDie);
    
//     // Update dimensions based on selected die
//     if (digiDie && DIGI_DIE_OPTIONS[digiDie]) {
//       updateField("digiDimensions", DIGI_DIE_OPTIONS[digiDie]);
//     } else {
//       updateField("digiDimensions", { length: "", breadth: "" });
//     }
//   };

//   // Initialize with defaults when toggling on
//   const handleToggleDigi = () => {
//     if (!data.isDigiUsed) {
//       toggleField("isDigiUsed");
//     } else {
//       toggleField("isDigiUsed");
//       updateField("digiDie", "");
//       updateField("digiDimensions", { length: "", breadth: "" });
//     }
//   };

//   if (!data.isDigiUsed) {
//     return (
//       <FormToggle
//         label="Is Digital Printing being used?"
//         isChecked={data.isDigiUsed}
//         onChange={handleToggleDigi}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <FormToggle
//         label="Is Digital Printing being used?"
//         isChecked={data.isDigiUsed}
//         onChange={handleToggleDigi}
//       />

//       <FormField label="Digital Printing Die">
//         <SelectField
//           id="digiDie"
//           name="digiDie"
//           value={data.digiDie || ""}
//           onChange={handleDigiDieChange}
//           options={Object.keys(DIGI_DIE_OPTIONS)}
//           placeholder="Select Digital Die"
//         />
//       </FormField>

//       {data.digiDie && data.digiDimensions && (
//         <div className="mt-4 p-3 bg-gray-50 rounded border">
//           <h4 className="font-medium mb-2">Selected Dimensions:</h4>
//           <p>{formatDimensions(data.digiDimensions, "in")}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DigiDetailsSection;

import React, { useEffect, useState } from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { DIGI_DIE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";

const DigiDetailsSection = () => {
  const { data, updateField } = useFormState("digiDetails");
  const [errors, setErrors] = useState({});

  const handleToggleDigiUsed = () => {
    const updatedIsDigiUsed = !data.isDigiUsed;
    
    if (updatedIsDigiUsed) {
      // Initialize with default values when enabling Digital Printing
      updateField("isDigiUsed", true);
      updateField("digiDie", "");
      updateField("digiDimensions", {});
    } else {
      // Reset when disabling Digital Printing
      updateField("isDigiUsed", false);
      updateField("digiDie", "");
      updateField("digiDimensions", {});
    }
  };

  const handleDigiDieChange = (e) => {
    const dieName = e.target.value;
    updateField("digiDie", dieName);
    
    // Set dimensions based on the selected die
    if (dieName && DIGI_DIE_OPTIONS[dieName]) {
      updateField("digiDimensions", DIGI_DIE_OPTIONS[dieName]);
    } else {
      updateField("digiDimensions", {});
    }
  };

  return (
    <div className="space-y-6">
      {/* Digital Printing Toggle */}
      <FormToggle
        label="Is Digital Printing being used?"
        isChecked={data.isDigiUsed}
        onChange={handleToggleDigiUsed}
      />

      {data.isDigiUsed && (
        <>
          <FormField label="Select Digital Printing Die">
            <SelectField
              id="digiDie"
              value={data.digiDie || ""}
              onChange={handleDigiDieChange}
              options={Object.keys(DIGI_DIE_OPTIONS)}
              placeholder="Select Digi Die"
              required={data.isDigiUsed}
            />
          </FormField>

          {data.digiDie && data.digiDimensions && (
            <div className="mt-2 text-sm">
              <p className="text-gray-700 font-medium">Dimensions:</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">Length:</span> {data.digiDimensions.length || "N/A"}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">Breadth:</span> {data.digiDimensions.breadth || "N/A"}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DigiDetailsSection;