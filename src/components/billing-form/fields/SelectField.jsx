import React from "react";

const SelectField = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  required = false
}) => {
  return (
    <select
      id={id}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`border rounded-md p-2 w-full text-xs ${disabled ? 'bg-gray-100' : ''} ${className}`}
      disabled={disabled}
      required={required}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={typeof option === 'object' ? option.value : option}>
          {typeof option === 'object' ? option.label : option}
        </option>
      ))}
    </select>
  );
};

export default SelectField;