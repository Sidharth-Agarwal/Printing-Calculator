// import React, { useState } from "react";
// import OrderAndPaper from "./OrderAndPaper";
// import LPDetails from "./LPDetails";
// import FSDetails from "./FSDetails";
// import EMBDetails from "./EMBDetails";
// import DigiDetails from "./DigiDetails";
// import Sandwich from "./Sandwich";
// import DieCutting from "./DieCutting";
// import Pasting from "./Pasting";
// import { db } from "../../firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";

// const BillingForm = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({});

//   const handleNext = (data) => {
//     setFormData((prev) => ({ ...prev, ...data }));
//     setStep((prev) => prev + 1);
//   };

//   const handlePrevious = () => {
//     setStep((prev) => prev - 1);
//   };

//   const handleSubmit = async () => {
//     try {
//       await addDoc(collection(db, "billing"), formData);
//       console.log("Data submitted successfully:", formData);
//       alert("Data submitted successfully!");
//       setStep(1);
//       setFormData({});
//     } catch (error) {
//       console.error("Error submitting data:", error);
//     }
//   };

//   const steps = [
//     <OrderAndPaper onNext={handleNext} key="step1" />,
//     <LPDetails onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
//     <FSDetails onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
//     <EMBDetails onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
//     <DigiDetails onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
//     <Sandwich onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
//     <DieCutting onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
//     <Pasting onPrevious={handlePrevious} key="step8" />,
//     <Pasting onPrevious={goToPreviousStep} onSubmit={handleFinalSubmit} /> // Add your final submission logic here
//   ];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-gray-700 mb-4">Billing Form</h1>
//         <div className="text-gray-600 mb-6">
//           <p>
//             Step {step} of {steps.length}
//           </p>
//           <div className="h-2 bg-gray-300 rounded-full mt-2">
//             <div
//               className="h-2 bg-blue-500 rounded-full"
//               style={{ width: `${(step / steps.length) * 100}%` }}
//             />
//           </div>
//         </div>
//         {steps[step - 1]}
//         {step === steps.length && (
//           <button
//             onClick={handleSubmit}
//             className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
//           >
//             Submit
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BillingForm;

// import React, { useState } from "react";
// import OrderAndPaper from "./OrderAndPaper";
// import LPDetails from "./LPDetails";
// import FSDetails from "./FSDetails";
// import EMBDetails from "./EMBDetails";
// import DigiDetails from "./DigiDetails";
// import Sandwich from "./Sandwich";
// import DieCutting from "./DieCutting";
// import Pasting from "./Pasting";
// import { db } from "../../firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";

// const BillingForm = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({});

//   const handleNext = (data) => {
//     setFormData((prev) => ({ ...prev, ...data }));
//     setStep((prev) => prev + 1);
//   };

//   const handlePrevious = () => {
//     setStep((prev) => prev - 1);
//   };

//   const handleSubmit = async () => {
//     try {
//       // Log raw formData for debugging
//       console.log("Raw formData:", formData);

//       // Remove undefined fields
//       const sanitizedData = Object.fromEntries(
//         Object.entries(formData).filter(([_, value]) => value !== undefined)
//       );

//       // Submit sanitized data to Firestore
//       await addDoc(collection(db, "billing"), sanitizedData);

//       console.log("Data submitted successfully:", sanitizedData);
//       alert("Data submitted successfully!");

//       // Reset form and step
//       setStep(1);
//       setFormData({});
//     } catch (error) {
//       console.error("Error submitting data:", error);
//     }
//   };

//   const steps = [
//     <OrderAndPaper onNext={handleNext} key="step1" />,
//     <LPDetails onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
//     <FSDetails onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
//     <EMBDetails onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
//     <DigiDetails onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
//     <Sandwich onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
//     <DieCutting onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
//     <Pasting onPrevious={handlePrevious} onSubmit={handleSubmit} key="step8" />,
//   ];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-gray-700 mb-4">Billing Form</h1>
//         <div className="text-gray-600 mb-6">
//           <p>
//             Step {step} of {steps.length}
//           </p>
//           <div className="h-2 bg-gray-300 rounded-full mt-2">
//             <div
//               className="h-2 bg-blue-500 rounded-full"
//               style={{ width: `${(step / steps.length) * 100}%` }}
//             />
//           </div>
//         </div>
//         {steps[step - 1]}
//       </div>
//     </div>
//   );
// };

// export default BillingForm;

// Updated code for estimate generation
// import React, { useState } from "react";
// import OrderAndPaper from "./OrderAndPaper";
// import LPDetails from "./LPDetails";
// import FSDetails from "./FSDetails";
// import EMBDetails from "./EMBDetails";
// import DigiDetails from "./DigiDetails";
// import Sandwich from "./Sandwich";
// import DieCutting from "./DieCutting";
// import Pasting from "./Pasting";
// import { db } from "../../firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";

// const BillingForm = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({});

//   // Handles advancing to the next step with merged data
//   const handleNext = (data) => {
//     setFormData((prev) => ({ ...prev, ...data }));
//     setStep((prev) => prev + 1);
//   };

//   // Handles going back to the previous step
//   const handlePrevious = () => {
//     setStep((prev) => prev - 1);
//   };

//   // Handles creating an estimate and saving it to the database
//   const handleCreateEstimate = async () => {
//     try {
//       console.log("Raw formData:", formData);

//       // Sanitize formData by filtering out undefined and invalid values
//       const sanitizedData = Object.fromEntries(
//         Object.entries(formData).filter(
//           ([_, value]) => value !== undefined && !(value instanceof PointerEvent)
//         )
//       );

//       // Submit sanitized data to Firestore
//       await addDoc(collection(db, "estimates"), sanitizedData);

//       console.log("Estimate created successfully:", sanitizedData);
//       alert("Estimate created successfully!");

//       // Reset form and step
//       setStep(1);
//       setFormData({});
//     } catch (error) {
//       console.error("Error creating estimate:", error);
//     }
//   };

//   // Steps array
//   const steps = [
//     <OrderAndPaper onNext={handleNext} key="step1" />,
//     <LPDetails onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
//     <FSDetails onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
//     <EMBDetails onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
//     <DigiDetails onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
//     <Sandwich onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
//     <DieCutting onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
//     <Pasting onPrevious={handlePrevious} onCreateEstimate={handleCreateEstimate} key="step8" />,
//   ];  

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-gray-700 mb-4">Billing Form</h1>
//         <div className="text-gray-600 mb-6">
//           <p>
//             Step {step} of {steps.length}
//           </p>
//           <div className="h-2 bg-gray-300 rounded-full mt-2">
//             <div
//               className="h-2 bg-blue-500 rounded-full"
//               style={{ width: `${(step / steps.length) * 100}%` }}
//             />
//           </div>
//         </div>
//         {steps[step - 1]}
//       </div>
//     </div>
//   );
// };

// export default BillingForm;


// Latest Updated Code
// import React, { useState } from "react";
// import OrderAndPaper from "./OrderAndPaper";
// import LPDetails from "./LPDetails";
// import FSDetails from "./FSDetails";
// import EMBDetails from "./EMBDetails";
// import DigiDetails from "./DigiDetails";
// import Sandwich from "./Sandwich";
// import DieCutting from "./DieCutting";
// import Pasting from "./Pasting";
// import { db } from "../../firebaseConfig";
// import { collection, addDoc } from "firebase/firestore";

// const BillingForm = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({});

//   const handleNext = (data) => {
//     setFormData((prev) => ({
//       ...prev,
//       ...data,
//     }));
//     setStep((prev) => prev + 1);
//   };

//   const handlePrevious = () => {
//     setStep((prev) => prev - 1);
//   };

//   const handleCreateEstimate = async () => {
//     try {
//       console.log("Raw formData before processing:", formData);

//       // Convert undefined/empty values to null
//       const processedData = Object.fromEntries(
//         Object.entries(formData).map(([key, value]) => [
//           key,
//           value === undefined || value === "" ? null : value,
//         ])
//       );

//       console.log("Processed formData:", processedData);

//       // Submit processed data to Firestore
//       await addDoc(collection(db, "estimates"), processedData);

//       console.log("Estimate created successfully:", processedData);
//       alert("Estimate created successfully!");

//       // Reset the form and step
//       setStep(1);
//       setFormData({});
//     } catch (error) {
//       console.error("Error creating estimate:", error);
//     }
//   };

//   const steps = [
//     <OrderAndPaper onNext={handleNext} key="step1" />,
//     <LPDetails onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
//     <FSDetails onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
//     <EMBDetails onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
//     <DigiDetails onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
//     <Sandwich onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
//     <DieCutting onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
//     <Pasting
//       onPrevious={handlePrevious}
//       onCreateEstimate={handleCreateEstimate}
//       key="step8"
//     />,
//   ];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-gray-700 mb-4">Billing Form</h1>
//         <div className="text-gray-600 mb-6">
//           <p>
//             Step {step} of {steps.length}
//           </p>
//           <div className="h-2 bg-gray-300 rounded-full mt-2">
//             <div
//               className="h-2 bg-blue-500 rounded-full"
//               style={{ width: `${(step / steps.length) * 100}%` }}
//             />
//           </div>
//         </div>
//         {steps[step - 1]}
//       </div>
//     </div>
//   );
// };

// export default BillingForm;

import React, { useState } from "react";
import OrderAndPaper from "./OrderAndPaper";
import LPDetails from "./LPDetails";
import FSDetails from "./FSDetails";
import EMBDetails from "./EMBDetails";
import DigiDetails from "./DigiDetails";
import DieCutting from "./DieCutting";
import Sandwich from "./Sandwich";
import Pasting from "./Pasting";
import ReviewAndSubmit from "./ReviewAndSubmit";
import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const BillingForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = (data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
    setStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
  };

  const handleCreateEstimate = async () => {
    try {
      console.log("Raw formData before processing:", formData);

      // Convert undefined/empty values to null
      const processedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === undefined || value === "" ? null : value,
        ])
      );

      console.log("Processed formData:", processedData);

      // Submit processed data to Firestore
      await addDoc(collection(db, "estimates"), processedData);

      console.log("Estimate created successfully:", processedData);
      alert("Estimate created successfully!");

      // Reset the form and step
      setStep(1);
      setFormData({});
    } catch (error) {
      console.error("Error creating estimate:", error);
    }
  };

  const steps = [
    <OrderAndPaper onNext={handleNext} key="step1" />,
    <LPDetails onNext={handleNext} onPrevious={handlePrevious} key="step2" />,
    <FSDetails onNext={handleNext} onPrevious={handlePrevious} key="step3" />,
    <EMBDetails onNext={handleNext} onPrevious={handlePrevious} key="step4" />,
    <DigiDetails onNext={handleNext} onPrevious={handlePrevious} key="step5" />,
    <DieCutting onNext={handleNext} onPrevious={handlePrevious} key="step6" />,
    <Sandwich onNext={handleNext} onPrevious={handlePrevious} key="step7" />,
    <Pasting onNext={handleNext} onPrevious={handlePrevious} key="step8" />,
    <ReviewAndSubmit
      formData={formData}
      onPrevious={handlePrevious}
      onCreateEstimate={handleCreateEstimate}
      key="step9"
    />,
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
      </div>
    </div>
  );
};

export default BillingForm;
