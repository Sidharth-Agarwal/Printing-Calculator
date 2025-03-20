import React from "react";
import NumberField from "./NumberField";

const DimensionInput = ({
  lengthId,
  lengthValue,
  lengthOnChange,
  lengthPlaceholder = "Length",
  lengthUnit = "in",
  breadthId,
  breadthValue,
  breadthOnChange,
  breadthPlaceholder = "Breadth",
  breadthUnit = "in",
  disabled = false,
  required = false,
  className = ""
}) => {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <div>
        <label htmlFor={lengthId} className="block mb-1 text-xs">
          Length ({lengthUnit})
        </label>
        <NumberField
          id={lengthId}
          value={lengthValue}
          onChange={lengthOnChange}
          placeholder={lengthPlaceholder}
          disabled={disabled}
          required={required}
        />
      </div>
      <div>
        <label htmlFor={breadthId} className="block mb-1 text-xs">
          Breadth ({breadthUnit})
        </label>
        <NumberField
          id={breadthId}
          value={breadthValue}
          onChange={breadthOnChange}
          placeholder={breadthPlaceholder}
          disabled={disabled}
          required={required}
        />
      </div>
    </div>
  );
};

export default DimensionInput;