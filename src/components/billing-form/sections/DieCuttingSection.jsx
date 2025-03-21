import React, { useEffect } from "react";
import useFormSection from "../../../hooks/useFormSection";
import FormSectionWrapper from "../utils/FormSectionWrapper";
import { DIE_CUT_OPTIONS, MR_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import SelectField from "../fields/SelectField";

const DieCuttingSectionContent = ({ data, updateField }) => {
  // Reset PDC to "No" when difficulty is "No"
  useEffect(() => {
    if (data.difficulty === "No" && data.pdc === "Yes") {
      updateField("pdc", "No");
    }
  }, [data.difficulty, data.pdc, updateField]);

  // Handle difficulty change
  const handleDifficultyChange = (e) => {
    const difficulty = e.target.value;
    
    // If set to No, ensure PDC is also No
    if (difficulty === "No") {
      updateField("difficulty", difficulty);
      updateField("pdc", "No");
    } else {
      updateField("difficulty", difficulty);
    }
  };

  return (
    <div className="space-y-4">
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

        {/* PDC Dropdown */}
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
      </div>

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
  );
};

// Main component
const DieCuttingSection = () => {
  const { data, updateField } = useFormSection("dieCutting");
  
  return (
    <DieCuttingSectionContent
      data={data}
      updateField={updateField}
    />
  );
};

// Wrap the component with the section wrapper
export default FormSectionWrapper(DieCuttingSection, {
  sectionId: "dieCutting",
  toggleLabel: "Is Die Cutting being used?"
});