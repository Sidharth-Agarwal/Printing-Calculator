// import React, { useState } from "react";
// import EstimateDetails from "./EstimateDetails";

// const GroupDropdown = ({ clientName, projectName, estimates }) => {
//   const [openDropdown, setOpenDropdown] = useState(false);

//   return (
//     <div className="border rounded-lg p-4 shadow-md">
//       <div
//         onClick={() => setOpenDropdown(!openDropdown)}
//         className="cursor-pointer bg-gray-100 px-4 py-2 rounded-md flex justify-between items-center"
//       >
//         <h3 className="font-semibold text-lg">
//           {clientName} - {projectName}
//         </h3>
//         <span>{openDropdown ? "▼" : "▶"}</span>
//       </div>
//       {openDropdown && (
//         <div className="mt-4 space-y-4">
//           {estimates.map((estimate) => (
//             <EstimateDetails key={estimate.id} estimate={estimate} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GroupDropdown;

import React, { useState } from "react";
import EstimateDetails from "./EstimateDetails";

const GroupDropdown = ({ clientName, projectName, estimates }) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div className="border border-gray-300 rounded-lg shadow-md bg-white">
      <div
        onClick={() => setOpenDropdown(!openDropdown)}
        className="cursor-pointer bg-gray-100 px-4 py-2 rounded-t-md flex justify-between items-center hover:bg-gray-200"
      >
        <h3 className="font-semibold text-lg text-gray-700">
          {clientName} - {projectName}
        </h3>
        <span className="text-blue-500">{openDropdown ? "▼" : "▶"}</span>
      </div>
      {openDropdown && (
        <div className="p-4">
          {estimates.map((estimate) => (
            <EstimateDetails key={estimate.id} estimate={estimate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupDropdown;
