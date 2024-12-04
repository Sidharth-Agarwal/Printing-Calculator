// import React, { useState, useEffect } from "react";

// const FSDetails = ({ onNext, onPrevious, initialData }) => {
//   const [data, setData] = useState({
//     isFSUsed: initialData?.isFSUsed || false,
//     fsType: initialData?.fsType || "",
//     foilDetails: initialData?.foilDetails || [], // Holds block size, foil type, block type, and MR for each foil
//   });

//   // Effect to reset foil details whenever fsType changes
//   useEffect(() => {
//     if (data.fsType) {
//       const numberOfFoilOptions =
//         data.fsType === "FS1"
//           ? 1
//           : data.fsType === "FS2"
//           ? 2
//           : data.fsType === "FS3"
//           ? 3
//           : data.fsType === "FS4"
//           ? 4
//           : 5; // For FS5
//       setData((prev) => ({
//         ...prev,
//         foilDetails: Array.from({ length: numberOfFoilOptions }, (_, index) => ({
//           blockSizeType: data.foilDetails[index]?.blockSizeType || "",
//           blockDimensions: data.foilDetails[index]?.blockDimensions || {
//             length: "",
//             breadth: "",
//           },
//           foilType: data.foilDetails[index]?.foilType || "",
//           blockType: data.foilDetails[index]?.blockType || "",
//           mrType: data.foilDetails[index]?.mrType || "",
//         })),
//       }));
//     }
//   }, [data.fsType]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleFoilDetailsChange = (index, field, value) => {
//     const updatedDetails = [...data.foilDetails];
//     updatedDetails[index] = {
//       ...updatedDetails[index],
//       [field]: value,
//     };
//     setData((prev) => ({ ...prev, foilDetails: updatedDetails }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onNext(data);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h2 className="text-xl font-bold text-gray-700 mb-4">FS Details</h2>
//       <label className="flex items-center">
//         <input
//           type="checkbox"
//           name="isFSUsed"
//           checked={data.isFSUsed}
//           onChange={handleChange}
//           className="mr-2"
//         />
//         Is FS being used?
//       </label>
//       {data.isFSUsed && (
//         <>
//           <div>
//             <label>FS Type:</label>
//             <select
//               name="fsType"
//               value={data.fsType}
//               onChange={handleChange}
//               className="border rounded-md p-2 w-full"
//             >
//               <option value="">Select FS Type</option>
//               {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type, index) => (
//                 <option key={index} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </select>
//           </div>
//           {data.fsType && (
//             <div>
//               <h3 className="text-lg font-semibold mt-4 mb-2">Foil Details</h3>
//               {data.foilDetails.map((_, index) => (
//                 <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
//                   <h4 className="text-md font-bold mb-2">Foil {index + 1}</h4>

//                   {/* Block Size */}
//                   <div>
//                     <label>Block Size:</label>
//                     <select
//                       value={data.foilDetails[index]?.blockSizeType || ""}
//                       onChange={(e) =>
//                         handleFoilDetailsChange(
//                           index,
//                           "blockSizeType",
//                           e.target.value
//                         )
//                       }
//                       className="border rounded-md p-2 w-full"
//                     >
//                       <option value="">Select Block Size Type</option>
//                       <option value="Auto">Auto</option>
//                       <option value="Manual">Manual</option>
//                     </select>
//                   </div>
//                   {data.foilDetails[index]?.blockSizeType === "Manual" && (
//                     <div className="grid grid-cols-2 gap-4 mt-2">
//                       <input
//                         type="number"
//                         name="length"
//                         placeholder="Block Length (cm)"
//                         value={
//                           data.foilDetails[index]?.blockDimensions?.length || ""
//                         }
//                         onChange={(e) =>
//                           handleFoilDetailsChange(index, "blockDimensions", {
//                             ...data.foilDetails[index]?.blockDimensions,
//                             length: e.target.value,
//                           })
//                         }
//                         className="border rounded-md p-2"
//                       />
//                       <input
//                         type="number"
//                         name="breadth"
//                         placeholder="Block Breadth (cm)"
//                         value={
//                           data.foilDetails[index]?.blockDimensions?.breadth || ""
//                         }
//                         onChange={(e) =>
//                           handleFoilDetailsChange(index, "blockDimensions", {
//                             ...data.foilDetails[index]?.blockDimensions,
//                             breadth: e.target.value,
//                           })
//                         }
//                         className="border rounded-md p-2"
//                       />
//                     </div>
//                   )}

//                   {/* Foil Type */}
//                   <div>
//                     <label>Foil Type:</label>
//                     <select
//                       value={data.foilDetails[index]?.foilType || ""}
//                       onChange={(e) =>
//                         handleFoilDetailsChange(index, "foilType", e.target.value)
//                       }
//                       className="border rounded-md p-2 w-full"
//                     >
//                       <option value="">Select Foil Type</option>
//                       {[
//                         "Rosegold MTS 355",
//                         "Gold MTS 220",
//                         "White 911",
//                         "Blk MTS 362",
//                         "Silver ALUFIN PMAL METALITE",
//                         "MTS 432 PINK",
//                       ].map((foilOption, idx) => (
//                         <option key={idx} value={foilOption}>
//                           {foilOption}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Block Type */}
//                   <div>
//                     <label>Block Type:</label>
//                     <select
//                       value={data.foilDetails[index]?.blockType || ""}
//                       onChange={(e) =>
//                         handleFoilDetailsChange(index, "blockType", e.target.value)
//                       }
//                       className="border rounded-md p-2 w-full"
//                     >
//                       <option value="">Select Block Type</option>
//                       {[
//                         "Magnesium Block 3MM",
//                         "Magnesium Block 4MM",
//                         "Magnesium Block 5MM",
//                         "Male Block",
//                         "Female Block",
//                       ].map((block, idx) => (
//                         <option key={idx} value={block}>
//                           {block}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* MR Type */}
//                   <div>
//                     <label>MR Type:</label>
//                     <select
//                       value={data.foilDetails[index]?.mrType || ""}
//                       onChange={(e) =>
//                         handleFoilDetailsChange(index, "mrType", e.target.value)
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

// export default FSDetails;

import React, { useEffect } from "react";

const FSDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const { isFSUsed, fsType, foilDetails = [] } = state.fsDetails || {};

  // Effect to update foil details whenever fsType changes
  useEffect(() => {
    if (fsType) {
      const numberOfFoilOptions =
        fsType === "FS1"
          ? 1
          : fsType === "FS2"
          ? 2
          : fsType === "FS3"
          ? 3
          : fsType === "FS4"
          ? 4
          : 5; // For FS5
      const updatedFoilDetails = Array.from({ length: numberOfFoilOptions }, (_, index) => ({
        blockSizeType: foilDetails[index]?.blockSizeType || "",
        blockLength: foilDetails[index]?.blockLength || "",
        blockBreadth: foilDetails[index]?.blockBreadth || "",
        foilType: foilDetails[index]?.foilType || "",
        blockType: foilDetails[index]?.blockType || "",
        mrType: foilDetails[index]?.mrType || "",
      }));

      dispatch({
        type: "UPDATE_FS_DETAILS",
        payload: { foilDetails: updatedFoilDetails },
      });
    }
  }, [fsType, foilDetails, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { [name]: type === "checkbox" ? checked : value },
    });
  };

  const handleFoilDetailsChange = (index, field, value) => {
    const updatedFoilDetails = [...foilDetails];
    updatedFoilDetails[index] = {
      ...updatedFoilDetails[index],
      [field]: value,
    };

    dispatch({
      type: "UPDATE_FS_DETAILS",
      payload: { foilDetails: updatedFoilDetails },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">FS Details</h2>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="isFSUsed"
          checked={isFSUsed || false}
          onChange={handleChange}
          className="mr-2"
        />
        Is FS being used?
      </label>
      {isFSUsed && (
        <>
          <div>
            <label>FS Type:</label>
            <select
              name="fsType"
              value={fsType || ""}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select FS Type</option>
              {["FS1", "FS2", "FS3", "FS4", "FS5"].map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {fsType && (
            <div>
              <h3 className="text-lg font-semibold mt-4 mb-2">Foil Details</h3>
              {foilDetails.map((foil, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                  <h4 className="text-md font-bold mb-2">Foil {index + 1}</h4>

                  {/* Block Size */}
                  <div>
                    <label>Block Size:</label>
                    <select
                      value={foil.blockSizeType || ""}
                      onChange={(e) =>
                        handleFoilDetailsChange(index, "blockSizeType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select Block Size Type</option>
                      <option value="Auto">Auto</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  {foil.blockSizeType === "Manual" && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <input
                        type="number"
                        name="blockLength"
                        placeholder="Block Length (cm)"
                        value={foil.blockLength || ""}
                        onChange={(e) =>
                          handleFoilDetailsChange(index, "blockLength", e.target.value)
                        }
                        className="border rounded-md p-2"
                      />
                      <input
                        type="number"
                        name="blockBreadth"
                        placeholder="Block Breadth (cm)"
                        value={foil.blockBreadth || ""}
                        onChange={(e) =>
                          handleFoilDetailsChange(index, "blockBreadth", e.target.value)
                        }
                        className="border rounded-md p-2"
                      />
                    </div>
                  )}

                  {/* Foil Type */}
                  <div>
                    <label>Foil Type:</label>
                    <select
                      value={foil.foilType || ""}
                      onChange={(e) =>
                        handleFoilDetailsChange(index, "foilType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select Foil Type</option>
                      {[
                        "Rosegold MTS 355",
                        "Gold MTS 220",
                        "White 911",
                        "Blk MTS 362",
                        "Silver ALUFIN PMAL METALITE",
                        "MTS 432 PINK",
                      ].map((foilOption, idx) => (
                        <option key={idx} value={foilOption}>
                          {foilOption}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Block Type */}
                  <div>
                    <label>Block Type:</label>
                    <select
                      value={foil.blockType || ""}
                      onChange={(e) =>
                        handleFoilDetailsChange(index, "blockType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select Block Type</option>
                      {[
                        "Magnesium Block 3MM",
                        "Magnesium Block 4MM",
                        "Magnesium Block 5MM",
                        "Male Block",
                        "Female Block",
                      ].map((block, idx) => (
                        <option key={idx} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* MR Type */}
                  <div>
                    <label>MR Type:</label>
                    <select
                      value={foil.mrType || ""}
                      onChange={(e) =>
                        handleFoilDetailsChange(index, "mrType", e.target.value)
                      }
                      className="border rounded-md p-2 w-full"
                    >
                      <option value="">Select MR Type</option>
                      <option value="Simple">Simple</option>
                      <option value="Complex">Complex</option>
                      <option value="Super Complex">Super Complex</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-300 text-black rounded-md"
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

export default FSDetails;
