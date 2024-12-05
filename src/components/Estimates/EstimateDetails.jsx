import React, { useState } from "react";
import EstimateDetails from "./EstimateDetails";

const GroupDropdown = ({ clientName, projectName, estimates }) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="cursor-pointer bg-gray-100 px-4 py-2 rounded-md flex justify-between items-center"
      >
        <h3 className="font-semibold text-lg">
          {clientName} - {projectName}
        </h3>
        <span>{openDropdown ? "▼" : "▶"}</span>
      </div>
      {openDropdown && (
        <div className="mt-4 space-y-4">
          {estimates.map((estimate) => (
            <EstimateDetails key={estimate.id} estimate={estimate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupDropdown;
