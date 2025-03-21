// DigiDetailsSection.jsx
import React from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormState from "../../../hooks/useFormState";
import { DIGI_DIE_OPTIONS } from "../../../constants/dropdownOptions";
import { formatDimensions } from "../../../utils/formatters";

import FormField from "../../common/FormField";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";

const DigiDetailsSection = () => {
  const { data, updateField, toggleField } = useFormState("digiDetails");

  const handleDigiDieChange = (e) => {
    const digiDie = e.target.value;
    updateField("digiDie", digiDie);
    
    // Update dimensions based on selected die
    if (digiDie && DIGI_DIE_OPTIONS[digiDie]) {
      updateField("digiDimensions", DIGI_DIE_OPTIONS[digiDie]);
    } else {
      updateField("digiDimensions", { length: "", breadth: "" });
    }
  };

  // Initialize with defaults when toggling on
  const handleToggleDigi = () => {
    if (!data.isDigiUsed) {
      toggleField("isDigiUsed");
    } else {
      toggleField("isDigiUsed");
      updateField("digiDie", "");
      updateField("digiDimensions", { length: "", breadth: "" });
    }
  };

  if (!data.isDigiUsed) {
    return (
      <FormToggle
        label="Is Digital Printing being used?"
        isChecked={data.isDigiUsed}
        onChange={handleToggleDigi}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FormToggle
        label="Is Digital Printing being used?"
        isChecked={data.isDigiUsed}
        onChange={handleToggleDigi}
      />

      <FormField label="Digital Printing Die">
        <SelectField
          id="digiDie"
          name="digiDie"
          value={data.digiDie || ""}
          onChange={handleDigiDieChange}
          options={Object.keys(DIGI_DIE_OPTIONS)}
          placeholder="Select Digital Die"
        />
      </FormField>

      {data.digiDie && data.digiDimensions && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <h4 className="font-medium mb-2">Selected Dimensions:</h4>
          <p>{formatDimensions(data.digiDimensions, "in")}</p>
        </div>
      )}
    </div>
  );
};

export default DigiDetailsSection;