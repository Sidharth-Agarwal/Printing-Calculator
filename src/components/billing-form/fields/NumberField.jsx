import React from "react";

const NumberField = ({
  id,
  name,
  value,
  onChange,
  placeholder = "",
  min,
  max,
  step = "any",
  className = "",
  disabled = false,
  required = false
}) => {
  return (
    <input
      id={id}
      type="number"
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={`border rounded-md p-2 w-full text-xs ${disabled ? 'bg-gray-100' : ''} ${className}`}
      disabled={disabled}
      required={required}
    />
  );
};

export default NumberField;