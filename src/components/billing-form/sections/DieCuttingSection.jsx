import React, { useState, useEffect } from "react";
import FormGroup from "../containers/FormGroup";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";

const DieCuttingSection = ({ state, dispatch }) => {
  const { 
    isDieCuttingUsed = false, 
    difficulty = "No", 
    pdc = "No", 
    dcMR = "Simple",
    dcImpression = 0.25 // Default impression cost
  } = state.dieCutting || {};
  
  const [errors, setErrors] = useState({});

  // When DC is changed to No, automatically set PDC to No
  useEffect(() => {
    if (difficulty === "No" && pdc === "Yes") {
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { pdc: "No" }
      });
    }
  }, [difficulty, pdc, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special case for difficulty - if changed to No, reset PDC
    if (name === "difficulty" && value === "No") {
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { 
          [name]: value,
          pdc: "No" 
        }
      });
    } else {
      dispatch({
        type: "UPDATE_DIE_CUTTING",
        payload: { [name]: type === "checkbox" ? checked : value }
      });
    }

    // Clear errors on input change
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const toggleDieCuttingUsed = () => {
    dispatch({
      type: "UPDATE_DIE_CUTTING",
      payload: { 
        isDieCuttingUsed: !isDieCuttingUsed,
        // Reset values when toggling off
        difficulty: !isDieCuttingUsed ? "No" : "",
        pdc: !isDieCuttingUsed ? "No" : "",
        dcMR: !isDieCuttingUsed ? "Simple" : ""
      }
    });
  };

  return (
    <div className="space-y-6">
      <FormToggle
        label="Is Die Cutting being used?"
        isChecked={isDieCuttingUsed}
        onChange={toggleDieCuttingUsed}
      />

      {/* Conditional Fields */}
      {isDieCuttingUsed && (
        <div className="space-y-4">
          {/* Die Cut Dropdown */}
          <FormGroup
            label="DIE CUT"
            htmlFor="difficulty"
            error={errors.difficulty}
          >
            <SelectField
              id="difficulty"
              name="difficulty"
              value={difficulty}
              onChange={handleChange}
              options={["No", "Yes"]}
              required={isDieCuttingUsed}
            />
          </FormGroup>

          {/* PDC Dropdown - Only enabled when Die Cut is Yes */}
          <FormGroup
            label="PRE DIE CUT"
            htmlFor="pdc"
            error={errors.pdc}
          >
            <SelectField
              id="pdc"
              name="pdc"
              value={pdc}
              onChange={handleChange}
              options={["No", "Yes"]}
              disabled={difficulty === "No"}
              className={difficulty === "No" ? "bg-gray-100" : ""}
              required={isDieCuttingUsed && difficulty === "Yes"}
            />
          </FormGroup>

          {/* DC MR Dropdown - Only visible when Die Cut is Yes */}
          {difficulty === "Yes" && (
            <FormGroup
              label="DC MR"
              htmlFor="dcMR"
              error={errors.dcMR}
            >
              <SelectField
                id="dcMR"
                name="dcMR"
                value={dcMR}
                onChange={handleChange}
                options={["Simple", "Complex", "Super Complex"]}
                required={isDieCuttingUsed && difficulty === "Yes"}
              />
            </FormGroup>
          )}
        </div>
      )}
    </div>
  );
};

export default DieCuttingSection;