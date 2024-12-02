import React from "react";

const Pasting = ({ onPrevious, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    onSubmit(); // Trigger the onSubmit callback from BillingForm
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2 className="text-xl font-bold mb-4">Pasting</h2>
        <p>No fields to populate in this section.</p>
      </div>
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default Pasting;
