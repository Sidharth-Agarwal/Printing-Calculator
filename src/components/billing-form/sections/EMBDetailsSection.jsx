import React, { useEffect, useState } from "react";
import FormGroup from "../containers/FormGroup";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";
import NumberField from "../fields/NumberField";

const EMBDetailsSection = ({ state, dispatch }) => {
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const {
    isEMBUsed = false,
    plateSizeType = "",
    plateDimensions = { length: "", breadth: "" },
    plateTypeMale = "",
    plateTypeFemale = "",
    embMR = "",
  } = state.embDetails || {};

  const [errors, setErrors] = useState({});

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  const toggleEMBUsed = () => {
    const updatedIsEMBUsed = !isEMBUsed;
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: {
        isEMBUsed: updatedIsEMBUsed,
        plateSizeType: updatedIsEMBUsed ? "Auto" : "", // Default to "Auto"
        plateDimensions: updatedIsEMBUsed
          ? { 
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
            }
          : { length: "", breadth: "" },
        plateTypeMale: updatedIsEMBUsed ? "Polymer Plate" : "", // Default to "Polymer Plate"
        plateTypeFemale: updatedIsEMBUsed ? "Polymer Plate" : "", // Default to "Polymer Plate"
        embMR: updatedIsEMBUsed ? "Simple" : "", // Default to "Simple"
      },
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: { [name]: value },
    });

    if (name === "plateSizeType" && value === "Auto") {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: {
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
          },
        },
      });
    }

    if (name === "plateSizeType" && value === "Manual") {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: { length: "", breadth: "" },
        },
      });
    }
  };

  const handleDimensionChange = (field, value) => {
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: {
        plateDimensions: {
          ...plateDimensions,
          [field]: value,
        },
      },
    });
  };

  useEffect(() => {
    if (!isEMBUsed) {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateSizeType: "",
          plateDimensions: { length: "", breadth: "" },
          plateTypeMale: "",
          plateTypeFemale: "",
          embMR: "",
        },
      });
      setErrors({});
    }
  }, [isEMBUsed, dispatch]);

  return (
    <div className="space-y-6">
      <FormToggle
        label="Is EMB being used?"
        isChecked={isEMBUsed}
        onChange={toggleEMBUsed}
      />

      {isEMBUsed && (
        <>
          <div>
            <div className="flex flex-wrap gap-4 text-sm">
              {/* Plate Size Type */}
              <div className="flex-1">
                <FormGroup 
                  label="Plate Size" 
                  htmlFor="plateSizeType"
                  error={errors.plateSizeType}
                >
                  <SelectField
                    id="plateSizeType"
                    name="plateSizeType"
                    value={plateSizeType}
                    onChange={handleChange}
                    options={["Auto", "Manual"]}
                    placeholder="Select Plate Size Type"
                    required={isEMBUsed}
                  />
                </FormGroup>
              </div>

              {/* Plate Dimensions */}
              {plateSizeType && (
                <>
                  <div className="flex-1">
                    <FormGroup
                      label="Length (cm)"
                      htmlFor="length"
                      error={errors.length}
                    >
                      <NumberField
                        id="length"
                        value={plateDimensions.length || ""}
                        onChange={(e) => handleDimensionChange("length", e.target.value)}
                        placeholder="Length (cm)"
                        disabled={plateSizeType === "Auto"}
                        required={isEMBUsed && plateSizeType === "Manual"}
                        className={plateSizeType === "Auto" ? "bg-gray-100" : ""}
                      />
                    </FormGroup>
                  </div>
                  <div className="flex-1">
                    <FormGroup
                      label="Breadth (cm)"
                      htmlFor="breadth"
                      error={errors.breadth}
                    >
                      <NumberField
                        id="breadth"
                        value={plateDimensions.breadth || ""}
                        onChange={(e) => handleDimensionChange("breadth", e.target.value)}
                        placeholder="Breadth (cm)"
                        disabled={plateSizeType === "Auto"}
                        required={isEMBUsed && plateSizeType === "Manual"}
                        className={plateSizeType === "Auto" ? "bg-gray-100" : ""}
                      />
                    </FormGroup>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {/* Plate Type Male */}
            <div className="flex-1">
              <FormGroup
                label="Plate Type Male"
                htmlFor="plateTypeMale"
                error={errors.plateTypeMale}
              >
                <SelectField
                  id="plateTypeMale"
                  name="plateTypeMale"
                  value={plateTypeMale}
                  onChange={handleChange}
                  options={["Polymer Plate"]}
                  placeholder="Select Plate Type Male"
                  required={isEMBUsed}
                />
              </FormGroup>
            </div>

            {/* Plate Type Female */}
            <div className="flex-1">
              <FormGroup
                label="Plate Type Female"
                htmlFor="plateTypeFemale"
                error={errors.plateTypeFemale}
              >
                <SelectField
                  id="plateTypeFemale"
                  name="plateTypeFemale"
                  value={plateTypeFemale}
                  onChange={handleChange}
                  options={["Polymer Plate"]}
                  placeholder="Select Plate Type Female"
                  required={isEMBUsed}
                />
              </FormGroup>
            </div>

            {/* EMB MR */}
            <div className="flex-1">
              <FormGroup
                label="EMB MR"
                htmlFor="embMR"
                error={errors.embMR}
              >
                <SelectField
                  id="embMR"
                  name="embMR"
                  value={embMR}
                  onChange={handleChange}
                  options={["Simple", "Complex", "Super Complex"]}
                  placeholder="Select MR Type"
                  required={isEMBUsed}
                />
              </FormGroup>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EMBDetailsSection;