import React from "react";

const SectionWrapper = ({ title, children }) => {
  return (
    <div className="border border-gray-300 rounded-lg shadow-md bg-white p-4 mb-4">
      <h4 className="text-lg font-semibold mb-3 text-gray-800">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
};

export default SectionWrapper;
