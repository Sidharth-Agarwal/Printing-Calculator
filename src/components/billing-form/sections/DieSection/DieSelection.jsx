import React from "react";
import FormGroup from "../../containers/FormGroup";

const DieSelection = ({ dieSelection, onSelectDie }) => {
  return (
    <FormGroup 
      label="Die Selection" 
      htmlFor="dieSelection"
      required
    >
      <button
        id="dieSelection"
        type="button"
        onClick={onSelectDie}
        className="border rounded-md p-2 bg-gray-100 w-full text-xs text-left"
      >
        {dieSelection || "Select Die"}
      </button>
    </FormGroup>
  );
};

export default DieSelection;