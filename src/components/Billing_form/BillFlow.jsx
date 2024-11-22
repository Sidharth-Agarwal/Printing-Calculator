import React, { useState } from "react";
import OrderAndPaper from "./Section1";
import FSSection from "./Section2FS";
import LPSection from "./Section2LP";
import EMBSection from "./Section3EMB";

const AddBillFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    orderAndPaper: {},
    fsDetails: {},
    lpDetails: {},
    embDetails: {},
  });

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    console.log("Submitting Data:", formData);
    // Push to Firebase here
  };

  const handleSectionDataChange = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      {currentStep === 1 && (
        <OrderAndPaper
          data={formData.orderAndPaper}
          onChange={(data) => handleSectionDataChange("orderAndPaper", data)}
          onNext={handleNext}
        />
      )}
      {currentStep === 2 && (
        <FSSection
          data={formData.fsDetails}
          onChange={(data) => handleSectionDataChange("fsDetails", data)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
      {currentStep === 3 && (
        <LPSection
          data={formData.lpDetails}
          onChange={(data) => handleSectionDataChange("lpDetails", data)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
      {currentStep === 4 && (
        <EMBSection
          data={formData.embDetails}
          onChange={(data) => handleSectionDataChange("embDetails", data)}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
        />
      )}

      <div className="mt-6">
        <p className="text-gray-500">Step {currentStep} of 4</p>
      </div>
    </div>
  );
};

export default AddBillFlow;
