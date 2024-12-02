// import React from "react";

// const Pasting = ({ onPrevious, onCreateEstimate }) => {
//   const handleCreateEstimate = (e) => {
//     e.preventDefault(); // Prevent default form submission behavior
//     onCreateEstimate(); // Trigger the onCreateEstimate callback from BillingForm
//   };

//   return (
//     <form onSubmit={handleCreateEstimate}>
//       <div>
//         <h2 className="text-xl font-bold mb-4">Pasting</h2>
//         <p>No fields to populate in this section.</p>
//       </div>
//       <div className="flex justify-between mt-6">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white px-4 py-2 rounded"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="bg-green-500 text-white px-4 py-2 rounded"
//         >
//           Create Estimate
//         </button>
//       </div>
//     </form>
//   );
// };

// export default Pasting;

// import React from "react";

// const Pasting = ({ onPrevious, onCreateEstimate }) => {
//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">Pasting</h2>
//       <p>No fields to populate in this section.</p>
//       <div className="flex justify-between mt-6">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white px-4 py-2 rounded"
//         >
//           Previous
//         </button>
//         <button
//           type="button" // Use type="button" to avoid default form submission
//           onClick={onCreateEstimate}
//           className="bg-green-500 text-white px-4 py-2 rounded"
//         >
//           Create Estimate
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Pasting;

// Latest updated code
// const Pasting = ({ onPrevious, onCreateEstimate }) => {
//   const handleCreateEstimate = (e) => {
//     e.preventDefault(); // Prevent default form submission
//     onCreateEstimate(); // Trigger the parent function
//   };

//   return (
//     <form onSubmit={handleCreateEstimate}>
//       <div>
//         <h2 className="text-xl font-bold mb-4">Pasting</h2>
//         <p>No fields to populate in this section.</p>
//       </div>
//       <div className="flex justify-between mt-6">
//         <button
//           type="button"
//           onClick={onPrevious}
//           className="bg-gray-500 text-white px-4 py-2 rounded"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Create Estimate
//         </button>
//       </div>
//     </form>
//   );
// };

// export default Pasting;

import React from "react";

const Pasting = ({ onPrevious, onNext }) => {
  const handleNext = (e) => {
    e.preventDefault(); // Prevent default form submission
    onNext(); // Move to the ReviewAndSubmit component
  };

  return (
    <form onSubmit={handleNext} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Pasting</h2>
      <p>No fields to populate in this section.</p>
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default Pasting;
