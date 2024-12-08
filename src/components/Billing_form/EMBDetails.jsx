import React, { useEffect } from "react";

const EMBDetails = ({ state, dispatch, onNext, onPrevious }) => {
  const {
    isEMBUsed = false,
    plateSizeType = "",
    plateLength = "",
    plateBreadth = "",
    plateTypeMale = "",
    plateTypeFemale = "",
    embMR = "",
  } = state.embDetails || {};

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "UPDATE_EMB_DETAILS",
      payload: { [name]: type === "checkbox" ? checked : value },
    });
  };

  useEffect(() => {
    if (!isEMBUsed) {
      // Clear all EMB-related fields if EMB is not being used
      dispatch({
        type: "UPDATE_EMB_DETAILS",
        payload: {
          plateSizeType: "",
          plateLength: "",
          plateBreadth: "",
          plateTypeMale: "",
          plateTypeFemale: "",
          embMR: "",
        },
      });
    }
  }, [isEMBUsed, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Embossing (EMB) Details</h2>
      <label className="flex items-center">
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
          <div>
            <label>Plate Size:</label>
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
          </div>
          {plateSizeType === "Manual" && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="plateLength"
                placeholder="Plate Length (cm)"
                value={plateLength}
                onChange={handleChange}
                className="border rounded-md p-2"
              />
              <input
                type="number"
                name="plateBreadth"
                placeholder="Plate Breadth (cm)"
                value={plateBreadth}
                onChange={handleChange}
                className="border rounded-md p-2"
              />
            </div>
          )}
          <div>
            <label>Plate Type Male:</label>
            <select
              name="plateTypeMale"
              value={plateTypeMale}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Type Male</option>
              <option value="Polymer Plate">Polymer Plate</option>
            </select>
          </div>
          <div>
            <label>Plate Type Female:</label>
            <select
              name="plateTypeFemale"
              value={plateTypeFemale}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select Plate Type Female</option>
              <option value="Polymer Plate">Polymer Plate</option>
            </select>
          </div>
          <div>
            <label>EMB MR:</label>
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
          </div>
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

export default EMBDetails;
