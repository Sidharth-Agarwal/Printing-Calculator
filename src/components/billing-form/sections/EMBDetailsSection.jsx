import React, { useEffect } from "react";
import { useBillingForm } from "../../../context/BillingFormContext";
import useFormSection from "../../../hooks/useFormSection";
import FormSectionWrapper from "../utils/FormSectionWrapper";
import { inchesToCm } from "../../../utils/calculationHelpers";
import { PLATE_TYPE_OPTIONS, MR_TYPE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import NumberField from "../fields/NumberField";
import SelectField from "../fields/SelectField";

const EMBDetailsSectionContent = ({ data, updateField }) => {
  const { state } = useBillingForm();
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  // Update dimensions when plate size type or die size changes
  useEffect(() => {
    if (data.plateSizeType === "Auto" && dieSize.length && dieSize.breadth) {
      updateField("plateDimensions", {
        length: dieSize.length ? inchesToCm(dieSize.length) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
      });
    }
  }, [data.plateSizeType, dieSize, updateField]);

  // Handler for plate size type change
  const handlePlateSizeTypeChange = (e) => {
    const plateSizeType = e.target.value;
    
    // Update dimensions if Auto selected
    if (plateSizeType === "Auto") {
      updateField("plateDimensions", {
        length: dieSize.length ? inchesToCm(dieSize.length) : "",
        breadth: dieSize.breadth ? inchesToCm(dieSize.breadth) : ""
      });
    } else if (plateSizeType === "Manual") {
      // Reset dimensions for manual entry
      updateField("plateDimensions", { length: "", breadth: "" });
    }
    
    updateField("plateSizeType", plateSizeType);
  };

  // Handler for dimension changes
  const handleDimensionChange = (field, value) => {
    updateField("plateDimensions", {
      ...data.plateDimensions,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Plate Size Type">
          <SelectField
            id="plateSizeType"
            value={data.plateSizeType || "Auto"}
            onChange={handlePlateSizeTypeChange}
            options={["Auto", "Manual"]}
          />
        </FormField>

        {/* Plate Type Male */}
        <FormField label="Plate Type Male">
          <SelectField
            id="plateTypeMale"
            name="plateTypeMale"
            value={data.plateTypeMale || "Polymer Plate"}
            onChange={(e) => updateField("plateTypeMale", e.target.value)}
            options={PLATE_TYPE_OPTIONS}
          />
        </FormField>
      </div>

      {data.plateSizeType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plate Dimensions */}
          <FormField label="Length (cm)">
            <NumberField
              id="plateLength"
              value={data.plateDimensions?.length || ""}
              onChange={(e) => handleDimensionChange("length", e.target.value)}
              placeholder="Length"
              disabled={data.plateSizeType === "Auto"}
            />
          </FormField>

          <FormField label="Breadth (cm)">
            <NumberField
              id="plateBreadth"
              value={data.plateDimensions?.breadth || ""}
              onChange={(e) => handleDimensionChange("breadth", e.target.value)}
              placeholder="Breadth"
              disabled={data.plateSizeType === "Auto"}
            />
          </FormField>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plate Type Female */}
        <FormField label="Plate Type Female">
          <SelectField
            id="plateTypeFemale"
            name="plateTypeFemale"
            value={data.plateTypeFemale || "Polymer Plate"}
            onChange={(e) => updateField("plateTypeFemale", e.target.value)}
            options={PLATE_TYPE_OPTIONS}
          />
        </FormField>

        {/* EMB MR */}
        <FormField label="EMB MR">
          <SelectField
            id="embMR"
            name="embMR"
            value={data.embMR || "Simple"}
            onChange={(e) => updateField("embMR", e.target.value)}
            options={MR_TYPE_OPTIONS}
          />
        </FormField>
      </div>
    </div>
  );
};

// Main component
const EMBDetailsSection = () => {
  const { data, updateField } = useFormSection("embDetails");
  
  return (
    <EMBDetailsSectionContent 
      data={data}
      updateField={updateField}
    />
  );
};

// Wrap the component with the section wrapper
export default FormSectionWrapper(EMBDetailsSection, {
  sectionId: "embDetails",
  toggleLabel: "Is EMB being used?"
});