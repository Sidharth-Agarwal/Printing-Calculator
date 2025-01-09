import React from "react";

const ToggleSwitch = ({ value, onChange }) => {
  const handleToggle = () => {
    onChange(!value); // Toggle the value and call the onChange handler
  };

  return (
    <div
      className={`relative inline-block w-12 h-6 cursor-pointer rounded-full transition ${
        value ? "bg-green-500" : "bg-gray-300"
      }`}
      onClick={handleToggle}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          value ? "transform translate-x-6" : ""
        }`}
      ></span>
    </div>
  );
};

export default ToggleSwitch;
