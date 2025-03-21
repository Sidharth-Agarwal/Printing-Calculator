// PastingSection.jsx
import React from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { PASTING_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";

const PastingSection = () => {
  const { data, updateField, toggleField } = useFormState("pasting");

  // Initialize with defaults when toggling on
  const handleTogglePasting = () => {
    if (!data.isPastingUsed) {
      toggleField("isPastingUsed");
      updateField("pastingType", "");
    } else {
      toggleField("isPastingUsed");
      updateField("pastingType", "");
    }
  };

  if (!data.isPastingUsed) {
    return (
      <FormToggle
        label="Use Pasting Component?"
        isChecked={data.isPastingUsed}
        onChange={handleTogglePasting}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FormToggle
        label="Use Pasting Component?"
        isChecked={data.isPastingUsed}
        onChange={handleTogglePasting}
      />

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

export default PastingSection;