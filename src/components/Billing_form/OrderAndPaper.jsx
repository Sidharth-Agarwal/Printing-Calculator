import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DieSelectionPopup from "./DieSelectionPopup";
import AddDieFormForPopup from "./AddDieFormForPopup";
import { storage } from "../../firebaseConfig";

const OrderAndPaper = ({ onNext, initialData }) => {
  const [data, setData] = useState({
    clientName: initialData?.clientName || "",
    date: initialData?.date ? new Date(initialData.date) : null,
    deliveryDate: initialData?.deliveryDate ? new Date(initialData.deliveryDate) : null,
    jobType: initialData?.jobType || "",
    quantity: initialData?.quantity || "",
    paperProvided: initialData?.paperProvided || "",
    paperName: initialData?.paperName || "",
    dieSelection: initialData?.dieSelection || "",
    dieCode: initialData?.dieCode || "",
    dieSize: initialData?.dieSize || { length: "", breadth: "" },
    image: initialData?.image || "",
  });

  const [showDiePopup, setShowDiePopup] = useState(false);
  const [showAddDiePopup, setShowAddDiePopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      dieSize: { ...prev.dieSize, [name]: value },
    }));
  };

  const handleDieSelect = (die) => {
    setData((prev) => ({
      ...prev,
      dieSelection: die.dieName,
      dieCode: die.dieCode,
      dieSize: { length: die.dieSizeL, breadth: die.dieSizeB },
      image: die.imageUrl,
    }));
    setShowDiePopup(false);
  };

  const handleAddDieSuccess = (newDie) => {
    handleDieSelect(newDie);
    setShowAddDiePopup(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...data,
      date: data.date ? data.date.toLocaleDateString("en-US") : "",
      deliveryDate: data.deliveryDate
        ? data.deliveryDate.toLocaleDateString("en-US")
        : "",
    };
    onNext(formattedData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Order and Paper Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Client Name */}
          <div>
            <label htmlFor="clientName" className="block font-medium mb-1">
              Client Name
            </label>
            <input
              id="clientName"
              type="text"
              name="clientName"
              placeholder="Enter the client name"
              value={data.clientName}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block font-medium mb-1">
              Date
            </label>
            <DatePicker
              id="date"
              selected={data.date}
              onChange={(date) => setData((prev) => ({ ...prev, date }))}
              dateFormat="MM/dd/yyyy"
              placeholderText="MM/DD/YYYY"
              className="border rounded-md p-2 w-full"
              required
            />
          </div>

          {/* Estimated Delivery Date */}
          <div>
            <label htmlFor="deliveryDate" className="block font-medium mb-1">
              Estimated Delivery Date
            </label>
            <DatePicker
              id="deliveryDate"
              selected={data.deliveryDate}
              onChange={(date) => setData((prev) => ({ ...prev, deliveryDate: date }))}
              dateFormat="MM/dd/yyyy"
              placeholderText="MM/DD/YYYY"
              className="border rounded-md p-2 w-full"
              required
            />
          </div>

          {/* Job Type */}
          <div>
            <label htmlFor="jobType" className="block font-medium mb-1">
              Job Type
            </label>
            <select
              id="jobType"
              name="jobType"
              value={data.jobType}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="">Select Job Type</option>
              {["Card", "Biz Card", "Vellum Jacket", "Envelope", "Tag", "Magnet"].map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block font-medium mb-1">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              name="quantity"
              placeholder="Enter the required quantity"
              value={data.quantity}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            />
          </div>

          {/* Paper Provided */}
          <div>
            <label htmlFor="paperProvided" className="block font-medium mb-1">
              Paper Provided
            </label>
            <select
              id="paperProvided"
              name="paperProvided"
              value={data.paperProvided}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="">Paper Provided?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Paper Name */}
          <div>
            <label htmlFor="paperName" className="block font-medium mb-1">
              Paper Name
            </label>
            <select
              id="paperName"
              name="paperName"
              value={data.paperName}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
              required
            >
              <option value="">Select Paper Name</option>
              {["Wild 450", "Wild 650"].map((paper, index) => (
                <option key={index} value={paper}>
                  {paper}
                </option>
              ))}
            </select>
          </div>

          {/* Die Selection */}
          <div>
            <label htmlFor="dieSelection" className="block font-medium mb-1">
              Die Selection
            </label>
            <button
              id="dieSelection"
              type="button"
              onClick={() => setShowDiePopup(true)}
              className="border rounded-md p-2 bg-gray-100 w-full"
            >
              {data.dieSelection || "Select Die"}
            </button>
          </div>

          {/* Die Code */}
          <div>
            <label htmlFor="dieCode" className="block font-medium mb-1">
              Die Code
            </label>
            <input
              id="dieCode"
              type="text"
              name="dieCode"
              value={data.dieCode}
              readOnly
              className="border rounded-md p-2 w-full bg-gray-200"
            />
          </div>

          {/* Die Size */}
          <div className="flex space-x-4">
            <div className="w-full">
              <label htmlFor="length" className="block font-medium mb-1">
                Die Size (Length)
              </label>
              <input
                id="length"
                type="number"
                name="length"
                placeholder="Die Size (L)"
                value={data.dieSize.length}
                onChange={handleNestedChange}
                className="border rounded-md p-2 w-full"
                readOnly
              />
            </div>
            <div className="w-full">
              <label htmlFor="breadth" className="block font-medium mb-1">
                Die Size (Breadth)
              </label>
              <input
                id="breadth"
                type="number"
                name="breadth"
                placeholder="Die Size (B)"
                value={data.dieSize.breadth}
                onChange={handleNestedChange}
                className="border rounded-md p-2 w-full"
                readOnly
              />
            </div>
          </div>

          {/* Die Image */}
          <div>
            <label htmlFor="image" className="block font-medium mb-1">
              Die Image
            </label>
            <img
              id="image"
              src={data.image || "https://via.placeholder.com/150"}
              alt="Die"
              className="w-40 h-40 object-contain border"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Next
          </button>
        </div>
      </form>

      {/* Die Selection Popup */}
      {showDiePopup && (
        <DieSelectionPopup
          onClose={() => setShowDiePopup(false)}
          onSelect={handleDieSelect}
          onAddNewDie={() => setShowAddDiePopup(true)}
        />
      )}

      {/* Add Die Popup */}
      {showAddDiePopup && (
        <AddDieFormForPopup
          onAddDie={handleAddDieSuccess}
          storage={storage}
          onClose={() => setShowAddDiePopup(false)}
        />
      )}
    </div>
  );
};

export default OrderAndPaper;
