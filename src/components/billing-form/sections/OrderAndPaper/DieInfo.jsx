import React from "react";
import FormGroup from "../../containers/FormGroup";
import DimensionInput from "../../fields/DimensionInput";

const DieInfo = ({ dieSelection, dieCode, dieSize, image, onSelectDie, dispatch }) => {
  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: {
        dieSize: {
          ...dieSize,
          [name]: value,
        },
      },
    });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Die Information</h3>
      <div className="space-y-4">
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

        <FormGroup 
          label="Die Code" 
          htmlFor="dieCode"
        >
          <input
            id="dieCode"
            type="text"
            name="dieCode"
            value={dieCode || ""}
            readOnly
            className="border rounded-md p-2 w-full bg-gray-200 text-xs"
          />
        </FormGroup>

        <FormGroup
          label="Die Size"
          required
        >
          <DimensionInput
            lengthId="dieLength"
            lengthValue={dieSize?.length || ""}
            lengthOnChange={(e) => handleNestedChange({ target: { name: 'length', value: e.target.value } })}
            lengthPlaceholder="Length"
            breadthId="dieBreadth"
            breadthValue={dieSize?.breadth || ""}
            breadthOnChange={(e) => handleNestedChange({ target: { name: 'breadth', value: e.target.value } })}
            breadthPlaceholder="Breadth"
            disabled={true}
          />
        </FormGroup>

        {image && (
          <FormGroup
            label="Die Image"
          >
            <img
              src={image || "https://via.placeholder.com/100"}
              alt="Die"
              className="w-[100px] h-[100px] object-contain border"
            />
          </FormGroup>
        )}
      </div>
    </div>
  );
};

export default DieInfo;