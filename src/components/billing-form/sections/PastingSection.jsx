import React from "react";
import useFormSection from "../../../hooks/useFormSection";
import FormSectionWrapper from "../utils/FormSectionWrapper";
import { PASTING_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import SelectField from "../fields/SelectField";

const PastingSectionContent = ({ data, updateField }) => {
  return (
    <div className="space-y-4">
      <FormField label="Pasting Type">
        <SelectField
          id="pastingType"
          name="pastingType"
          value={data.pastingType || ""}
          onChange={(e) => updateField("pastingType", e.target.value)}
          options={PASTING_TYPE_OPTIONS}
          placeholder="Select Pasting Type"
        />
      </FormField>
    </div>
  );
};

// Main component
const PastingSection = () => {
  const { data, updateField } = useFormSection("pasting");
  
  return (
    <PastingSectionContent
      data={data}
      updateField={updateField}
    />
  );
};

// Wrap the component with the section wrapper
export default FormSectionWrapper(PastingSection, {
  sectionId: "pasting",
  toggleLabel: "Use Pasting Component?"
});