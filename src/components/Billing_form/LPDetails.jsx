// import React from "react";

// const LPDetails = ({ state, dispatch, onNext, onPrevious }) => {
//   const lpDetails = state.lpDetails || {
//     isLPUsed: false,
//     noOfColors: 0,
//     colorDetails: [], // Holds plate size, ink type, plate type, MR type for each color
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     if (name === "isLPUsed") {
//       if (checked) {
//         // Set No of Colors to 1 and initialize Color Details when LP is used
//         dispatch({
//           type: "UPDATE_LP_DETAILS",
//           payload: {
//             isLPUsed: true,
//             noOfColors: 1,
//             colorDetails: [
//               {
//                 plateSizeType: "",
//                 plateDimensions: { length: "", breadth: "" },
//                 inkType: "",
//                 plateType: "",
//                 mrType: "",
//               },
//             ],
//           },
//         });
//       } else {
//         // Reset No of Colors to 0 and clear Color Details if LP is not used
//         dispatch({
//           type: "UPDATE_LP_DETAILS",
//           payload: {
//             isLPUsed: false,
//             noOfColors: 0,
//             colorDetails: [],
//           },
//         });
//       }
//     } else if (name === "noOfColors") {
//       dispatch({
//         type: "UPDATE_LP_DETAILS",
//         payload: { [name]: value },
//       });
//       generateColorDetails(value);
//     }
//   };

//   const handleColorDetailsChange = (index, field, value) => {
//     const updatedDetails = [...lpDetails.colorDetails];
//     updatedDetails[index] = {
//       ...updatedDetails[index],
//       [field]: value,
//     };
//     dispatch({
//       type: "UPDATE_LP_DETAILS",
//       payload: { colorDetails: updatedDetails },
//     });
//   };

//   const generateColorDetails = (noOfColors) => {
//     const details = Array.from({ length: noOfColors }, (_, index) => ({
//       plateSizeType: lpDetails.colorDetails[index]?.plateSizeType || "",
//       plateDimensions: lpDetails.colorDetails[index]?.plateDimensions || {
//         length: "",
//         breadth: "",
//       },
//       inkType: lpDetails.colorDetails[index]?.inkType || "",
//       plateType: lpDetails.colorDetails[index]?.plateType || "",
//       mrType: lpDetails.colorDetails[index]?.mrType || "",
//     }));
//     dispatch({
//       type: "UPDATE_LP_DETAILS",
//       payload: { colorDetails: details },
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext();
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">Letter Press (LP) Details</h2>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="isLPUsed"
//           checked={lpDetails.isLPUsed}
//           onChange={handleChange}
//           className="mr-2"
//         />
//         Is LP being used?
//       </label>
//       {lpDetails.isLPUsed && (
//         <>
//           <div>
//             <label>No of Colors:</label>
//             <input
//               type="number"
//               name="noOfColors"
//               value={lpDetails.noOfColors}
//               min="1"
//               max="10"
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             />
//           </div>

//           {lpDetails.noOfColors > 0 && (
//             <div>
//               <h3 className="text-lg font-semibold mt-4 mb-2">Color Details</h3>
//               {Array.from({ length: lpDetails.noOfColors }, (_, index) => (
//                 <div
//                   key={index}
//                   className="mb-4 p-4 border rounded-md bg-gray-50"
//                 >
//                   <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>

//                   {/* Plate Size Type */}
//                   <div>
//                     <label>Plate Size:</label>
//                     <select
//                       value={lpDetails.colorDetails[index]?.plateSizeType || ""}
//                       onChange={(e) =>
//                         handleColorDetailsChange(
//                           index,
//                           "plateSizeType",
//                           e.target.value
//                         )
//                       }
//                       className="border rounded-md p-2 w-full"
//                       required
//                     >
//                       <option value="">Select Plate Size</option>
//                       <option value="Auto">Auto</option>
//                       <option value="Manual">Manual</option>
//                     </select>
//                   </div>

//                   {/* Manual Plate Dimensions */}
//                   {lpDetails.colorDetails[index]?.plateSizeType === "Manual" && (
//                     <div className="grid grid-cols-2 gap-4 mt-2">
//                       <input
//                         type="number"
//                         name="length"
//                         placeholder="Length (cm)"
//                         value={
//                           lpDetails.colorDetails[index]?.plateDimensions?.length || ""
//                         }
//                         required
//                         onChange={(e) =>
//                           handleColorDetailsChange(index, "plateDimensions", {
//                             ...lpDetails.colorDetails[index]?.plateDimensions,
//                             length: e.target.value,
//                           })
//                         }
//                         className="border rounded-md p-2"
//                       />
//                       <input
//                         type="number"
//                         name="breadth"
//                         placeholder="Breadth (cm)"
//                         value={
//                           lpDetails.colorDetails[index]?.plateDimensions?.breadth || ""
//                         }
//                         required
//                         onChange={(e) =>
//                           handleColorDetailsChange(index, "plateDimensions", {
//                             ...lpDetails.colorDetails[index]?.plateDimensions,
//                             breadth: e.target.value,
//                           })
//                         }
//                         className="border rounded-md p-2"
//                       />
//                     </div>
//                   )}

//                   {/* Ink Type */}
//                   <div>
//                     <label>Ink Type:</label>
//                     <select
//                       value={lpDetails.colorDetails[index]?.inkType || ""}
//                       required
//                       onChange={(e) =>
//                         handleColorDetailsChange(index, "inkType", e.target.value)
//                       }
//                       className="border rounded-md p-2 w-full"
//                     >
//                       <option value="">Select Ink Type</option>
//                       {[
//                         "Ink Black",
//                         "Ink Cyan",
//                         "Ink Magenta",
//                         "Ink Varnish",
//                         "Ink Milk White",
//                         "Ink Opaque White",
//                         "Ink White",
//                         "Ink Yellow",
//                       ].map((ink, idx) => (
//                         <option key={idx} value={ink}>
//                           {ink}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Plate Type */}
//                   <div>
//                     <label>Plate Type:</label>
//                     <select
//                       value={lpDetails.colorDetails[index]?.plateType || ""}
//                       required
//                       onChange={(e) =>
//                         handleColorDetailsChange(index, "plateType", e.target.value)
//                       }
//                       className="border rounded-md p-2 w-full"
//                     >
//                       <option value="">Select Plate Type</option>
//                       <option value="Polymer Plate">Polymer Plate</option>
//                     </select>
//                   </div>

//                   {/* MR Type */}
//                   <div>
//                     <label>MR Type:</label>
//                     <select
//                       value={lpDetails.colorDetails[index]?.mrType || ""}
//                       required
//                       onChange={(e) =>
//                         handleColorDetailsChange(index, "mrType", e.target.value)
//                       }
//                       className="border rounded-md p-2 w-full"
//                     >
//                       <option value="">Select MR Type</option>
//                       <option value="Simple">Simple</option>
//                       <option value="Complex">Complex</option>
//                       <option value="Super Complex">Super Complex</option>
//                     </select>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}
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

// export default LPDetails;

import React, { useState } from "react";

const LPDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const lpDetails = state.lpDetails || {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: [], // Holds plate size, ink type, plate type, MR type for each color
  };

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "isLPUsed") {
      if (checked) {
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: {
            isLPUsed: true,
            noOfColors: 1,
            colorDetails: [
              {
                plateSizeType: "",
                plateDimensions: { length: "", breadth: "" },
                inkType: "",
                plateType: "",
                mrType: "",
              },
            ],
          },
        });
      } else {
        dispatch({
          type: "UPDATE_LP_DETAILS",
          payload: {
            isLPUsed: false,
            noOfColors: 0,
            colorDetails: [],
          },
        });
        setErrors({}); // Clear errors when toggled off
      }
    } else if (name === "noOfColors") {
      dispatch({
        type: "UPDATE_LP_DETAILS",
        payload: { [name]: value },
      });
      generateColorDetails(value);
    }
  };

  const handleColorDetailsChange = (index, field, value) => {
    const updatedDetails = [...lpDetails.colorDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: updatedDetails },
    });
  };

  const generateColorDetails = (noOfColors) => {
    const details = Array.from({ length: noOfColors }, (_, index) => ({
      plateSizeType: lpDetails.colorDetails[index]?.plateSizeType || "",
      plateDimensions: lpDetails.colorDetails[index]?.plateDimensions || {
        length: "",
        breadth: "",
      },
      inkType: lpDetails.colorDetails[index]?.inkType || "",
      plateType: lpDetails.colorDetails[index]?.plateType || "",
      mrType: lpDetails.colorDetails[index]?.mrType || "",
    }));
    dispatch({
      type: "UPDATE_LP_DETAILS",
      payload: { colorDetails: details },
    });
  };

  const validateFields = () => {
    const newErrors = {};

    if (lpDetails.isLPUsed) {
      if (!lpDetails.noOfColors || lpDetails.noOfColors < 1) {
        newErrors.noOfColors = "Number of colors must be at least 1.";
      }

      lpDetails.colorDetails.forEach((color, index) => {
        if (!color.plateSizeType) {
          newErrors[`plateSizeType_${index}`] = "Plate size type is required.";
        }
        if (color.plateSizeType === "Manual") {
          if (!color.plateDimensions?.length) {
            newErrors[`plateLength_${index}`] = "Plate length is required.";
          }
          if (!color.plateDimensions?.breadth) {
            newErrors[`plateBreadth_${index}`] = "Plate breadth is required.";
          }
        }
        if (!color.inkType) {
          newErrors[`inkType_${index}`] = "Ink type is required.";
        }
        if (!color.plateType) {
          newErrors[`plateType_${index}`] = "Plate type is required.";
        }
        if (!color.mrType) {
          newErrors[`mrType_${index}`] = "MR type is required.";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Validation passes if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Letter Press (LP) Details</h2>
      <label className="font-semibold flex items-center">
        <input
          type="checkbox"
          name="isLPUsed"
          checked={lpDetails.isLPUsed}
          onChange={handleChange}
          className="mr-2"
        />
        Is LP being used?
      </label>
      {lpDetails.isLPUsed && (
        <>
          <div>
            <div className="mb-1">No of Colors:</div>
            <input
              type="number"
              name="noOfColors"
              value={lpDetails.noOfColors}
              min="1"
              max="10"
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            />
            {errors.noOfColors && (
              <p className="text-red-500 text-sm">{errors.noOfColors}</p>
            )}
          </div>

          {lpDetails.noOfColors > 0 && (
            <div>
              <h3 className="text-xl font-semibold mt-4 mb-2">Color Details</h3>
              {Array.from({ length: lpDetails.noOfColors }, (_, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded-md bg-gray-50"
                >
                  <h4 className="text-md font-bold mb-2">Color {index + 1}</h4>

                  {/* Plate Size Type */}
                  <div>
                    <div className="mb-1">Plate Size:</div>
                    <select
                      value={lpDetails.colorDetails[index]?.plateSizeType || ""}
                      onChange={(e) =>
                        handleColorDetailsChange(
                          index,
                          "plateSizeType",
                          e.target.value
                        )
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select Plate Size</option>
                      <option value="Auto">Auto</option>
                      <option value="Manual">Manual</option>
                    </select>
                    {errors[`plateSizeType_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`plateSizeType_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Manual Plate Dimensions */}
                  {lpDetails.colorDetails[index]?.plateSizeType === "Manual" && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <input
                        type="number"
                        name="length"
                        placeholder="Length (cm)"
                        value={
                          lpDetails.colorDetails[index]?.plateDimensions?.length || ""
                        }
                        onChange={(e) =>
                          handleColorDetailsChange(index, "plateDimensions", {
                            ...lpDetails.colorDetails[index]?.plateDimensions,
                            length: e.target.value,
                          })
                        }
                        className="border rounded-md p-2"
                      />
                      {errors[`plateLength_${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`plateLength_${index}`]}
                        </p>
                      )}
                      <input
                        type="number"
                        name="breadth"
                        placeholder="Breadth (cm)"
                        value={
                          lpDetails.colorDetails[index]?.plateDimensions?.breadth ||
                          ""
                        }
                        onChange={(e) =>
                          handleColorDetailsChange(index, "plateDimensions", {
                            ...lpDetails.colorDetails[index]?.plateDimensions,
                            breadth: e.target.value,
                          })
                        }
                        className="border rounded-md p-2"
                      />
                      {errors[`plateBreadth_${index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`plateBreadth_${index}`]}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Ink Type */}
                  <div>
                    <div className="mt-2 mb-1">Ink Type:</div>
                    <select
                      value={lpDetails.colorDetails[index]?.inkType || ""}
                      onChange={(e) =>
                        handleColorDetailsChange(index, "inkType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select Ink Type</option>
                      {[
                        "Ink Black",
                        "Ink Cyan",
                        "Ink Magenta",
                        "Ink Varnish",
                        "Ink Milk White",
                        "Ink Opaque White",
                        "Ink White",
                        "Ink Yellow",
                      ].map((ink, idx) => (
                        <option key={idx} value={ink}>
                          {ink}
                        </option>
                      ))}
                    </select>
                    {errors[`inkType_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`inkType_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Plate Type */}
                  <div>
                    <div className="mt-2 mb-1">Plate Type:</div>
                    <select
                      value={lpDetails.colorDetails[index]?.plateType || ""}
                      onChange={(e) =>
                        handleColorDetailsChange(index, "plateType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select Plate Type</option>
                      <option value="Polymer Plate">Polymer Plate</option>
                    </select>
                    {errors[`plateType_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`plateType_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* MR Type */}
                  <div>
                    <div className="mt-2 mb-1">MR Type:</div>
                    <select
                      value={lpDetails.colorDetails[index]?.mrType || ""}
                      onChange={(e) =>
                        handleColorDetailsChange(index, "mrType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select MR Type</option>
                      <option value="Simple">Simple</option>
                      <option value="Complex">Complex</option>
                      <option value="Super Complex">Super Complex</option>
                    </select>
                    {errors[`mrType_${index}`] && (
                      <p className="text-red-500 text-sm">
                        {errors[`mrType_${index}`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
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

export default LPDetails;
