import React, { useState } from "react";
import OrderAndPaper from "./OrderAndPaper";
import LPDetails from "./LPDetails";
import FSDetails from "./FSDetails";
import EMBDetails from "./EMBDetails";
import DigiDetails from "./DigiDetails";
import Sandwich from "./Sandwich";
import DieCutting from "./DieCutting";
import Pasting from "./Pasting";
import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const BillingForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "billing"), formData);
      console.log("Data submitted successfully:", formData);
      alert("Data submitted successfully!");
      setStep(1);
      setFormData({});
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const steps = [
    <OrderAndPaper onNext={handleNext} key="step1" />,
    <LPDetails onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
    <FSDetails onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
    <EMBDetails onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
    <DigiDetails onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
    <Sandwich onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
    <DieCutting onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
    <Pasting onPrevious={handlePrevious} key="step8" />,
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Billing Form</h1>
        <div className="text-gray-600 mb-6">
          <p>
            Step {step} of {steps.length}
          </p>
          <div className="h-2 bg-gray-300 rounded-full mt-2">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${(step / steps.length) * 100}%` }}
            />
          </div>
        </div>
        {steps[step - 1]}
        {step === steps.length && (
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default BillingForm;
