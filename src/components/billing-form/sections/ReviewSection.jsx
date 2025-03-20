import React, { useState } from "react";
import FormGroup from "../containers/FormGroup";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";

const PastingSection = ({ state, dispatch }) => {
  const { isPastingUsed = false, pastingType = "" } = state.pasting || {};
  const [errors, setErrors] = useState({});

  const togglePastingUsed = () => {
    dispatch({
      type: "UPDATE_PASTING",
      payload: { 
        isPastingUsed: !isPastingUsed,
        pastingType: !isPastingUsed ? "" : pastingType
      }
    });
  };

  const handleChange = (field, value) => {
    dispatch({
      type: "UPDATE_PASTING",
      payload: { [field]: value },
    });

    // Clear errors on input change
    setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
  };

  const PASTING_TYPES = [
    "DST - Double Sided Tape",
    "Fold",
    "Paste",
    "Fold & Paste",
    "Sandwich"
  ];

  return (
    <div className="space-y-6">
      <FormToggle
        label="Use Pasting Component?"
        isChecked={isPastingUsed}
        onChange={togglePastingUsed}
      />

      {/* Conditional Pasting Type Dropdown */}
      {isPastingUsed && (
        <FormGroup
          label="Pasting Type"
          htmlFor="pastingType"
          error={errors.pastingType}
          required={isPastingUsed}
        >
          <SelectField
            id="pastingType"
            name="pastingType"
            value={pastingType}
            onChange={(e) => handleChange("pastingType", e.target.value)}
            options={PASTING_TYPES}
            placeholder="Select Pasting Type"
            required={isPastingUsed}
          />
        </FormGroup>
      )}
    </div>
  );
};

export default PastingSection;