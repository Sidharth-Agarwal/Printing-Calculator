// import React, { useEffect, useState } from "react";

// const EMBDetails = ({ state, dispatch, onNext, onPrevious }) => {
//   const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

//   const {
//     isEMBUsed = false,
//     plateSizeType = "",
//     plateDimensions = { length: "", breadth: "" },
//     plateTypeMale = "",
//     plateTypeFemale = "",
//     embMR = "",
//   } = state.embDetails || {};

//   const [errors, setErrors] = useState({});

//   const inchesToCm = (inches) => parseFloat(inches) * 2.54;

//   const toggleEMBUsed = () => {
//     const updatedIsEMBUsed = !isEMBUsed;
//     dispatch({
//       type: "UPDATE_EMB_DETAILS",
//       payload: {
//         isEMBUsed: updatedIsEMBUsed,
//         plateSizeType: updatedIsEMBUsed ? "" : "",
//         plateDimensions: updatedIsEMBUsed
//           ? { length: "", breadth: "" }
//           : { length: "", breadth: "" },
//         plateTypeMale: updatedIsEMBUsed ? "" : "",
//         plateTypeFemale: updatedIsEMBUsed ? "" : "",
//         embMR: updatedIsEMBUsed ? "" : "",
//       },
//     });
//     setErrors({});
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     dispatch({
//       type: "UPDATE_EMB_DETAILS",
//       payload: { [name]: value },
//     });

//     if (name === "plateSizeType" && value === "Auto") {
//       dispatch({
//         type: "UPDATE_EMB_DETAILS",
//         payload: {
//           plateDimensions: {
//             length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
//             breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
//           },
//         },
//       });
//     }

//     if (name === "plateSizeType" && value === "Manual") {
//       dispatch({
//         type: "UPDATE_EMB_DETAILS",
//         payload: {
//           plateDimensions: { length: "", breadth: "" },
//         },
//       });
//     }
//   };

//   const handleDimensionChange = (field, value) => {
//     dispatch({
//       type: "UPDATE_EMB_DETAILS",
//       payload: {
//         plateDimensions: {
//           ...plateDimensions,
//           [field]: value,
//         },
//       },
//     });
//   };

//   const validateFields = () => {
//     const validationErrors = {};
//     if (isEMBUsed) {
//       if (!plateSizeType) validationErrors.plateSizeType = "Plate Size Type is required.";
//       if (plateSizeType === "Manual") {
//         if (!plateDimensions.length) validationErrors.length = "Length is required.";
//         if (!plateDimensions.breadth) validationErrors.breadth = "Breadth is required.";
//       }
//       if (!plateTypeMale) validationErrors.plateTypeMale = "Plate Type Male is required.";
//       if (!plateTypeFemale) validationErrors.plateTypeFemale = "Plate Type Female is required.";
//       if (!embMR) validationErrors.embMR = "EMB MR Type is required.";
//     }
//     setErrors(validationErrors);
//     return Object.keys(validationErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (validateFields()) {
//       onNext();
//     }
//   };

//   useEffect(() => {
//     if (!isEMBUsed) {
//       dispatch({
//         type: "UPDATE_EMB_DETAILS",
//         payload: {
//           plateSizeType: "",
//           plateDimensions: { length: "", breadth: "" },
//           plateTypeMale: "",
//           plateTypeFemale: "",
//           embMR: "",
//         },
//       });
//       setErrors({});
//     }
//   }, [isEMBUsed, dispatch]);

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="space-y-4">
//         <h2 className="text-lg font-bold text-gray-700 mb-4">EMBOSSING (EMB) DETAILS</h2>
//         <div className="flex items-center space-x-3 cursor-pointer">
//           <label className="flex items-center space-x-3" onClick={toggleEMBUsed}>
//             {/* Circular Button */}
//             <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
//               {isEMBUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
//             </div>
//             {/* Label Text */}
//             <span className="text-gray-700 font-semibold text-sm">Is EMB being used?</span>
//           </label>
//         </div>
//       </div>

//       {isEMBUsed && (
//         <>
//           <div>
//             <div className="flex flex-wrap gap-4 text-sm">
//               {/* Plate Size Type */}
//               <div className="flex-1">
//                 <label htmlFor="plateSizeType" className="block mb-1">
//                   Plate Size:
//                 </label>
//                 <select
//                   name="plateSizeType"
//                   value={plateSizeType}
//                   onChange={handleChange}
//                   className="border rounded-md p-2 w-full"
//                 >
//                   <option value="">Select Plate Size Type</option>
//                   <option value="Auto">Auto</option>
//                   <option value="Manual">Manual</option>
//                 </select>
//                 {errors.plateSizeType && (
//                   <p className="text-red-500 text-sm">{errors.plateSizeType}</p>
//                 )}
//               </div>

//               {/* Plate Dimensions */}
//               {plateSizeType && (
//                 <>
//                   <div className="flex-1">
//                     <label htmlFor="length" className="block mb-1">
//                       Length:
//                     </label>
//                     <input
//                       type="number"
//                       id="length"
//                       placeholder="Length (cm)"
//                       value={plateDimensions.length || ""}
//                       onChange={(e) =>
//                         plateSizeType === "Manual"
//                           ? handleDimensionChange("length", e.target.value)
//                           : null
//                       }
//                       className={`border rounded-md p-2 w-full ${
//                         plateSizeType === "Auto" ? "bg-gray-100" : ""
//                       }`}
//                       readOnly={plateSizeType === "Auto"}
//                     />
//                     {errors.length && <p className="text-red-500 text-sm">{errors.length}</p>}
//                   </div>
//                   <div className="flex-1">
//                     <label htmlFor="breadth" className="block mb-1">
//                       Breadth:
//                     </label>
//                     <input
//                       type="number"
//                       id="breadth"
//                       placeholder="Breadth (cm)"
//                       value={plateDimensions.breadth || ""}
//                       onChange={(e) =>
//                         plateSizeType === "Manual"
//                           ? handleDimensionChange("breadth", e.target.value)
//                           : null
//                       }
//                       className={`border rounded-md p-2 w-full ${
//                         plateSizeType === "Auto" ? "bg-gray-100" : ""
//                       }`}
//                       readOnly={plateSizeType === "Auto"}
//                     />
//                     {errors.breadth && <p className="text-red-500 text-sm">{errors.breadth}</p>}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-4 text-sm">
//             {/* Plate Type Male */}
//             <div className="flex-1">
//               <label htmlFor="plateTypeMale" className="block mb-1">
//                 Plate Type Male:
//               </label>
//               <select
//                 name="plateTypeMale"
//                 value={plateTypeMale}
//                 onChange={handleChange}
//                 className="border rounded-md p-2 w-full"
//               >
//                 <option value="">Select Plate Type Male</option>
//                 <option value="Polymer Plate">Polymer Plate</option>
//               </select>
//               {errors.plateTypeMale && (
//                 <p className="text-red-500 text-sm">{errors.plateTypeMale}</p>
//               )}
//             </div>

//             {/* Plate Type Female */}
//             <div className="flex-1">
//               <label htmlFor="plateTypeFemale" className="block mb-1">
//                 Plate Type Female:
//               </label>
//               <select
//                 name="plateTypeFemale"
//                 value={plateTypeFemale}
//                 onChange={handleChange}
//                 className="border rounded-md p-2 w-full"
//               >
//                 <option value="">Select Plate Type Female</option>
//                 <option value="Polymer Plate">Polymer Plate</option>
//               </select>
//               {errors.plateTypeFemale && (
//                 <p className="text-red-500 text-sm">{errors.plateTypeFemale}</p>
//               )}
//             </div>

//             {/* EMB MR */}
//             <div className="flex-1">
//               <label htmlFor="embMR" className="block mb-1">
//                 EMB MR:
//               </label>
//               <select
//                 name="embMR"
//                 value={embMR}
//                 onChange={handleChange}
//                 className="border rounded-md p-2 w-full"
//               >
//                 <option value="">Select MR Type</option>
//                 <option value="Simple">Simple</option>
//                 <option value="Complex">Complex</option>
//                 <option value="Super Complex">Super Complex</option>
//               </select>
//               {errors.embMR && <p className="text-red-500 text-sm">{errors.embMR}</p>}
//             </div>
//           </div>
//         </>
//       )}

//       <div className="flex justify-between mt-4">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
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
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const {
    isEMBUsed = false,
    plateSizeType = "",
    plateDimensions = { length: "", breadth: "" },
    plateTypeMale = "",
    plateTypeFemale = "",
    embMR = "",
  } = state.embDetails || {};

  const [errors, setErrors] = useState({});

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  const toggleEMBUsed = () => {
    const updatedIsEMBUsed = !isEMBUsed;
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: {
        isEMBUsed: updatedIsEMBUsed,
        plateSizeType: updatedIsEMBUsed ? "Auto" : "", // Default to "Auto"
        plateDimensions: updatedIsEMBUsed
          ? { 
              length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
              breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
            }
          : { length: "", breadth: "" },
        plateTypeMale: updatedIsEMBUsed ? "Polymer Plate" : "", // Default to "Polymer Plate"
        plateTypeFemale: updatedIsEMBUsed ? "Polymer Plate" : "", // Default to "Polymer Plate"
        embMR: updatedIsEMBUsed ? "Simple" : "", // Default to "Simple"
      },
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: { [name]: value },
    });

    if (name === "plateSizeType" && value === "Auto") {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: {
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
          },
        },
      });
    }

    if (name === "plateSizeType" && value === "Manual") {
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateDimensions: { length: "", breadth: "" },
        },
      });
    }
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700 mb-4">EMBOSSING (EMB) DETAILS</h2>
        <div className="flex items-center space-x-3 cursor-pointer">
          <label className="flex items-center space-x-3" onClick={toggleEMBUsed}>
            {/* Circular Button */}
            <div className="w-5 h-5 flex items-center justify-center border rounded-full border-gray-300 bg-gray-200">
              {isEMBUsed && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
            </div>
            {/* Label Text */}
            <span className="text-gray-700 font-semibold text-sm">Is EMB being used?</span>
          </label>
        </div>
      </div>

      {isEMBUsed && (
        <>
          <div>
            <div className="flex flex-wrap gap-4 text-sm">
              {/* Plate Size Type */}
              <div className="flex-1">
                <label htmlFor="plateSizeType" className="block mb-1">
                  Plate Size:
                </label>
                <select
                  name="plateSizeType"
                  value={plateSizeType}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                >
                  {/* <option value="">Select Plate Size Type</option> */}
                  <option value="Auto">Auto</option>
                  <option value="Manual">Manual</option>
                </select>
                {errors.plateSizeType && (
                  <p className="text-red-500 text-sm">{errors.plateSizeType}</p>
                )}
              </div>

              {/* Plate Dimensions */}
              {plateSizeType && (
                <>
                  <div className="flex-1">
                    <label htmlFor="length" className="block mb-1">
                      Length:
                    </label>
                    <input
                      type="number"
                      id="length"
                      placeholder="Length (cm)"
                      value={plateDimensions.length || ""}
                      onChange={(e) =>
                        plateSizeType === "Manual"
                          ? handleDimensionChange("length", e.target.value)
                          : null
                      }
                      className={`border rounded-md p-2 w-full ${
                        plateSizeType === "Auto" ? "bg-gray-100" : ""
                      }`}
                      readOnly={plateSizeType === "Auto"}
                    />
                    {errors.length && <p className="text-red-500 text-sm">{errors.length}</p>}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="breadth" className="block mb-1">
                      Breadth:
                    </label>
                    <input
                      type="number"
                      id="breadth"
                      placeholder="Breadth (cm)"
                      value={plateDimensions.breadth || ""}
                      onChange={(e) =>
                        plateSizeType === "Manual"
                          ? handleDimensionChange("breadth", e.target.value)
                          : null
                      }
                      className={`border rounded-md p-2 w-full ${
                        plateSizeType === "Auto" ? "bg-gray-100" : ""
                      }`}
                      readOnly={plateSizeType === "Auto"}
                    />
                    {errors.breadth && <p className="text-red-500 text-sm">{errors.breadth}</p>}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {/* Plate Type Male */}
            <div className="flex-1">
              <label htmlFor="plateTypeMale" className="block mb-1">
                Plate Type Male:
              </label>
              <select
                name="plateTypeMale"
                value={plateTypeMale}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              >
                {/* <option value="">Select Plate Type Male</option> */}
                <option value="Polymer Plate">Polymer Plate</option>
              </select>
              {errors.plateTypeMale && (
                <p className="text-red-500 text-sm">{errors.plateTypeMale}</p>
              )}
            </div>

            {/* Plate Type Female */}
            <div className="flex-1">
              <label htmlFor="plateTypeFemale" className="block mb-1">
                Plate Type Female:
              </label>
              <select
                name="plateTypeFemale"
                value={plateTypeFemale}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              >
                {/* <option value="">Select Plate Type Female</option> */}
                <option value="Polymer Plate">Polymer Plate</option>
              </select>
              {errors.plateTypeFemale && (
                <p className="text-red-500 text-sm">{errors.plateTypeFemale}</p>
              )}
            </div>

            {/* EMB MR */}
            <div className="flex-1">
              <label htmlFor="embMR" className="block mb-1">
                EMB MR:
              </label>
              <select
                name="embMR"
                value={embMR}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              >
                {/* <option value="">Select MR Type</option> */}
                <option value="Simple">Simple</option>
                <option value="Complex">Complex</option>
                <option value="Super Complex">Super Complex</option>
              </select>
              {errors.embMR && <p className="text-red-500 text-sm">{errors.embMR}</p>}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white mt-2 px-3 py-2 rounded text-sm"
        >
          Previous
        </button>
        <button
          type="submit"
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default EMBDetails;