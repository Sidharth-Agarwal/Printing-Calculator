// import React, { useEffect } from "react";

// const EMBDetails = ({ state, dispatch, onNext, onPrevious }) => {
//   const {
//     isEMBUsed = false,
//     plateSizeType = "",
//     plateLength = "",
//     plateBreadth = "",
//     plateTypeMale = "",
//     plateTypeFemale = "",
//     embMR = "",
//   } = state.embDetails || {};

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     dispatch({
//       type: "UPDATE_EMB_DETAILS",
//       payload: { [name]: type === "checkbox" ? checked : value },
//     });
//   };

//   useEffect(() => {
//     if (!isEMBUsed) {
//       // Clear all EMB-related fields if EMB is not being used
//       dispatch({
//         type: "UPDATE_EMB_DETAILS",
//         payload: {
//           plateSizeType: "",
//           plateLength: "",
//           plateBreadth: "",
//           plateTypeMale: "",
//           plateTypeFemale: "",
//           embMR: "",
//         },
//       });
//     }
//   }, [isEMBUsed, dispatch]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext();
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">Embossing (EMB) Details</h2>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="isEMBUsed"
//           checked={isEMBUsed}
//           onChange={handleChange}
//           className="mr-2"
//         />
//         Is EMB being used?
//       </label>
//       {isEMBUsed && (
//         <>
//           <div>
//             <label>Plate Size:</label>
//             <select
//               name="plateSizeType"
//               value={plateSizeType}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select Plate Size Type</option>
//               <option value="Auto">Auto</option>
//               <option value="Manual">Manual</option>
//             </select>
//           </div>
//           {plateSizeType === "Manual" && (
//             <div className="grid grid-cols-2 gap-4">
//               <input
//                 type="number"
//                 name="plateLength"
//                 placeholder="Plate Length (cm)"
//                 value={plateLength}
//                 onChange={handleChange}
//                 className="border rounded-md p-2"
//               />
//               <input
//                 type="number"
//                 name="plateBreadth"
//                 placeholder="Plate Breadth (cm)"
//                 value={plateBreadth}
//                 onChange={handleChange}
//                 className="border rounded-md p-2"
//               />
//             </div>
//           )}
//           <div>
//             <label>Plate Type Male:</label>
//             <select
//               name="plateTypeMale"
//               value={plateTypeMale}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select Plate Type Male</option>
//               <option value="Polymer Plate">Polymer Plate</option>
//             </select>
//           </div>
//           <div>
//             <label>Plate Type Female:</label>
//             <select
//               name="plateTypeFemale"
//               value={plateTypeFemale}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select Plate Type Female</option>
//               <option value="Polymer Plate">Polymer Plate</option>
//             </select>
//           </div>
//           <div>
//             <label>EMB MR:</label>
//             <select
//               name="embMR"
//               value={embMR}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select MR Type</option>
//               <option value="Simple">Simple</option>
//               <option value="Complex">Complex</option>
//               <option value="Super Complex">Super Complex</option>
//             </select>
//           </div>
//         </>
//       )}
//       <div className="flex justify-between mt-4">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="px-4 py-2 bg-gray-300 text-black rounded-md"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="px-4 py-2 bg-blue-600 text-white rounded-md"
//         >
//           Next
//         </button>
//       </div>
//     </form>
//   );
// };

// export default EMBDetails;

import React, { useEffect, useState } from "react";

const EMBDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const {
    isEMBUsed = false,
    plateSizeType = "",
    plateDimensions = { length: "", breadth: "" },
    plateTypeMale = "",
    plateTypeFemale = "",
    embMR = "",
  } = state.embDetails || {};

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: { [name]: type === "checkbox" ? checked : value },
    });
  };

  const handleDimensionChange = (field, value) => {
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: {
        plateDimensions: {
          ...plateDimensions,
          [field]: value,
        },
      },
    });
  };

  const validateFields = () => {
    const validationErrors = {};
    if (isEMBUsed) {
      if (!plateSizeType) validationErrors.plateSizeType = "Plate Size Type is required.";
      if (plateSizeType === "Manual") {
        if (!plateDimensions.length) validationErrors.length = "Length is required.";
        if (!plateDimensions.breadth) validationErrors.breadth = "Breadth is required.";
      }
      if (!plateTypeMale) validationErrors.plateTypeMale = "Plate Type Male is required.";
      if (!plateTypeFemale) validationErrors.plateTypeFemale = "Plate Type Female is required.";
      if (!embMR) validationErrors.embMR = "EMB MR Type is required.";
    }
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) {
      onNext();
    }
  };

  useEffect(() => {
    if (!isEMBUsed) {
      // Clear all EMB-related fields and errors if EMB is not being used
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateSizeType: "",
          plateDimensions: { length: "", breadth: "" },
          plateTypeMale: "",
          plateTypeFemale: "",
          embMR: "",
        },
      });
      setErrors({});
    }
  }, [isEMBUsed, dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Embossing (EMB) Details</h2>
      <label className="font-semibold flex items-center">
        <input
          type="checkbox"
          name="isEMBUsed"
          checked={isEMBUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is EMB being used?
      </label>
      {isEMBUsed && (
        <>
          {/* Plate Size Type */}
          <div>
            <div className="mb-1">Plate Size:</div>
            <select
              name="plateSizeType"
              value={plateSizeType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Size Type</option>
              <option value="Auto">Auto</option>
              <option value="Manual">Manual</option>
            </select>
            {errors.plateSizeType && (
              <p className="text-red-500 text-sm">{errors.plateSizeType}</p>
            )}
          </div>

          {/* Manual Dimensions */}
          {plateSizeType === "Manual" && (
            <div>
              <label>Plate Dimensions (cm):</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Length"
                    value={plateDimensions.length || ""}
                    onChange={(e) => handleDimensionChange("length", e.target.value)}
                    className="border rounded-md p-2 w-full"
                  />
                  {errors.length && <p className="text-red-500 text-sm">{errors.length}</p>}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Breadth"
                    value={plateDimensions.breadth || ""}
                    onChange={(e) => handleDimensionChange("breadth", e.target.value)}
                    className="border rounded-md p-2 w-full"
                  />
                  {errors.breadth && <p className="text-red-500 text-sm">{errors.breadth}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Plate Type Male */}
          <div>
            <div className="mb-1">Plate Type Male:</div>
            <select
              name="plateTypeMale"
              value={plateTypeMale}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Type Male</option>
              <option value="Polymer Plate">Polymer Plate</option>
            </select>
            {errors.plateTypeMale && (
              <p className="text-red-500 text-sm">{errors.plateTypeMale}</p>
            )}
          </div>

          {/* Plate Type Female */}
          <div>
            <div className="mb-1">Plate Type Female:</div>
            <select
              name="plateTypeFemale"
              value={plateTypeFemale}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Type Female</option>
              <option value="Polymer Plate">Polymer Plate</option>
            </select>
            {errors.plateTypeFemale && (
              <p className="text-red-500 text-sm">{errors.plateTypeFemale}</p>
            )}
          </div>

          {/* EMB MR */}
          <div>
            <div className="mb-1">EMB MR:</div>
            <select
              name="embMR"
              value={embMR}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select MR Type</option>
              <option value="Simple">Simple</option>
              <option value="Complex">Complex</option>
              <option value="Super Complex">Super Complex</option>
            </select>
            {errors.embMR && <p className="text-red-500 text-sm">{errors.embMR}</p>}
          </div>
        </>
      )}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default EMBDetails;
