import React, { useState } from "react";

const DieCutting = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const dieCutting = state.dieCutting || {
    isDieCuttingUsed: false,
    difficulty: "",
    pdc: "",
    dcMR: "",
  };

  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (dieCutting.isDieCuttingUsed) {
      if (!dieCutting.difficulty) {
        newErrors.difficulty = "Difficulty is required.";
      }
      if (!dieCutting.pdc) {
        newErrors.pdc = "PDC selection is required.";
      }
      if (!dieCutting.dcMR) {
        newErrors.dcMR = "MR type is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!singlePageMode && validateFields()) {
      onNext();
    }
  };

  // When DC is not used, we don't need to show any content
  if (!dieCutting.isDieCuttingUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* DIE CUTTING CONTENT WILL GO HERE */}
      <div className="bg-gray-50 p-4 rounded text-center">
        <p className="text-gray-500">Die Cutting options configuration will go here.</p>
      </div>
    </form>
  );
};

export default DieCutting;