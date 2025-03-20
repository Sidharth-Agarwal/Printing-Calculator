import React, { useEffect, useState } from "react";
import FormGroup from "../containers/FormGroup";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";

const DigiDetailsSection = ({ state, dispatch }) => {
  const { isDigiUsed = false, digiDie = "", digiDimensions = {} } = state.digiDetails || {};
  const [errors, setErrors] = useState({});

  const DIGI_DIE_OPTIONS = {
    "12x18": { length: "12", breadth: "18" },
    "13x19": { length: "13", breadth: "19" },
  };

  const toggleDigiUsed = () => {
    const updatedIsDigiUsed = !isDigiUsed;
    dispatch({
      type: "UPDATE_DIGI_DETAILS",
      payload: {
        isDigiUsed: updatedIsDigiUsed,
        digiDie: updatedIsDigiUsed ? "" : "",
        digiDimensions: updatedIsDigiUsed ? {} : {},
      },
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "digiDie") {
      const selectedDimensions = DIGI_DIE_OPTIONS[value] || {};
      dispatch({
        type: "UPDATE_DIGI_DETAILS",
        payload: {
          digiDie: value,
          digiDimensions: selectedDimensions,
        },
      });
    } else {
      dispatch({
        type: "UPDATE_DIGI_DETAILS",
        payload: { [name]: value },
      });
    }
  };

  useEffect(() => {
    if (!isDigiUsed) {
      // Clear digiDie and digiDimensions fields when Digi is not used
      dispatch({
        type: "UPDATE_DIGI_DETAILS",
        payload: { digiDie: "", digiDimensions: {} },
      });
      setErrors({});
    }
  }, [isDigiUsed, dispatch]);

  return (
    <div className="space-y-6">
      <FormToggle
        label="Is Digi being used?"
        isChecked={isDigiUsed}
        onChange={toggleDigiUsed}
      />

      {isDigiUsed && (
        <div className="space-y-4">
          <FormGroup
            label="Select Digital Printing Die"
            htmlFor="digiDie"
            error={errors.digiDie}
            required={isDigiUsed}
          >
            <SelectField
              id="digiDie"
              name="digiDie"
              value={digiDie}
              onChange={handleChange}
              options={Object.keys(DIGI_DIE_OPTIONS)}
              placeholder="Select Digi Die"
              required={isDigiUsed}
            />
          </FormGroup>

          {isDigiUsed && digiDie && (
            <div className="mt-2 text-sm">
              <p className="text-gray-700">
                <strong>Dimensions:</strong>
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">Length:</span> {digiDimensions.length || "N/A"}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">Breadth:</span> {digiDimensions.breadth || "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DigiDetailsSection;