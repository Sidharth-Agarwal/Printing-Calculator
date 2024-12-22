// import React from "react";

// const DieCutting = ({ state, dispatch, onNext, onPrevious }) => {
//   const { isDieCuttingUsed = false, difficulty = "", pdc = "", dcMR = "" } = state.dieCutting || {};

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     dispatch({
//       type: "UPDATE_DIE_CUTTING",
//       payload: { [name]: type === "checkbox" ? checked : value },
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Ensure PDC field validation if selected as "Yes"
//     if (isDieCuttingUsed && pdc === "Yes" && !dcMR) {
//       alert("Please select a DC MR type when PDC is 'Yes'.");
//       return;
//     }

//     onNext();
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">Die Cutting</h2>

//       {/* Checkbox for Die Cutting Usage */}
//       <label className="font-semibold flex items-center">
//         <input
//           type="checkbox"
//           name="isDieCuttingUsed"
//           checked={isDieCuttingUsed}
//           onChange={handleChange}
//           className="mr-2"
//         />
//         Is Die Cutting being used?
//       </label>

//       {/* Conditional Fields */}
//       {isDieCuttingUsed && (
//         <>
//           {/* Difficulty Field */}
//           <div>
//             <label className="block mb-2">Difficulty:</label>
//             <select
//               name="difficulty"
//               value={difficulty}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//               required
//             >
//               <option value="">Select Difficulty</option>
//               <option value="Yes">Yes</option>
//               <option value="No">No</option>
//             </select>
//           </div>

//           {/* PDC Field */}
//           <div>
//             <label className="block mb-2">PDC:</label>
//             <select
//               name="pdc"
//               value={pdc}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//               required
//             >
//               <option value="">Select PDC</option>
//               <option value="Yes">Yes</option>
//               <option value="No">No</option>
//             </select>
//           </div>

//           {/* Conditional DC MR Field */}
//           {pdc === "Yes" && (
//             <div>
//               <label className="block mb-2">DC MR:</label>
//               <select
//                 name="dcMR"
//                 value={dcMR}
//                 onChange={handleChange}
//                 className="border rounded-md p-2 w-full"
//                 required
//               >
//                 <option value="">Select MR Type</option>
//                 <option value="Simple">Simple</option>
//                 <option value="Complex">Complex</option>
//                 <option value="Super Complex">Super Complex</option>
//               </select>
//             </div>
//           )}
//         </>
//       )}

//       {/* Navigation Buttons */}
//       <div className="flex justify-between">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white px-4 py-2 rounded-md"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded-md"
//         >
//           Next
//         </button>
//       </div>
//     </form>
//   );
// };

// export default DieCutting;

import React, { useState } from "react";

const DieCutting = ({ state, dispatch, onNext, onPrevious }) => {
  const { isDieCuttingUsed = false, difficulty = "", pdc = "", dcMR = "" } = state.dieCutting || {};
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "UPDATE_DIE_CUTTING",
      payload: { [name]: type === "checkbox" ? checked : value },
    });

    // Clear errors on input change
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (isDieCuttingUsed) {
      if (!difficulty) newErrors.difficulty = "Please select Difficulty.";
      if (!pdc) newErrors.pdc = "Please select PDC.";
      if ((difficulty === "Yes" || pdc === "Yes") && !dcMR) {
        newErrors.dcMR = "Please select DC MR.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Die Cutting</h2>

      <label className="font-semibold flex items-center">
        <input
          type="checkbox"
          name="isDieCuttingUsed"
          checked={isDieCuttingUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is Die Cutting being used?
      </label>

      {isDieCuttingUsed && (
        <>
          <div>
            <label className="block mb-2">Difficulty:</label>
            <select
              name="difficulty"
              value={difficulty}
              onChange={handleChange}
              className={`border rounded-md p-2 w-full ${errors.difficulty ? "border-red-500" : ""}`}
            >
              <option value="">Select Difficulty</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty}</p>}
          </div>

          <div>
            <label className="block mb-2">PDC:</label>
            <select
              name="pdc"
              value={pdc}
              onChange={handleChange}
              className={`border rounded-md p-2 w-full ${errors.pdc ? "border-red-500" : ""}`}
            >
              <option value="">Select PDC</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.pdc && <p className="text-red-500 text-sm">{errors.pdc}</p>}
          </div>

          {(difficulty === "Yes" || pdc === "Yes") && (
            <div>
              <label className="block mb-2">DC MR:</label>
              <select
                name="dcMR"
                value={dcMR}
                onChange={handleChange}
                className={`border rounded-md p-2 w-full ${errors.dcMR ? "border-red-500" : ""}`}
              >
                <option value="">Select MR Type</option>
                <option value="Simple">Simple</option>
                <option value="Complex">Complex</option>
                <option value="Super Complex">Super Complex</option>
              </select>
              {errors.dcMR && <p className="text-red-500 text-sm">{errors.dcMR}</p>}
            </div>
          )}
        </>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default DieCutting;
