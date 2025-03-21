import React from "react";
import useFormSection from "../../../hooks/useFormSection";
import FormSectionWrapper from "../utils/FormSectionWrapper";
import { DIGI_DIE_OPTIONS } from "../../../constants/dropdownOptions";

import FormField from "../../common/FormField";
import SelectField from "../fields/SelectField";

const DigiDetailsSectionContent = ({ data, updateField }) => {
  // Handler for digi die selection
  const handleDigiDieChange = (e) => {
    const dieName = e.target.value;
    
    // Update the die name
    updateField("digiDie", dieName);
    
    // Also update the dimensions based on the selected die
    if (dieName && DIGI_DIE_OPTIONS[dieName]) {
      updateField("digiDimensions", DIGI_DIE_OPTIONS[dieName]);
    } else {
      updateField("digiDimensions", { length: "", breadth: "" });
    }
  };

  return (
    <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Length: </span> 
              {data.digiDimensions.length || "N/A"} inches
            </div>
            <div>
              <span className="font-medium">Breadth: </span>
              {data.digiDimensions.breadth || "N/A"} inches
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
const DigiDetailsSection = () => {
  const { data, updateField } = useFormSection("digiDetails");
  
  return (
    <DigiDetailsSectionContent
      data={data}
      updateField={updateField}
    />
  );
};

// Wrap the component with the section wrapper
export default FormSectionWrapper(DigiDetailsSection, {
  sectionId: "digiDetails",
  toggleLabel: "Is Digital Printing being used?"
});