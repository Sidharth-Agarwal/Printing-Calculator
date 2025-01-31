import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DieSelectionPopup from "./DieSelectionPopup";
import AddDieFormForPopup from "./AddDieFormForPopup";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const OrderAndPaper = ({ state, dispatch, onNext }) => {
  const { orderAndPaper } = state;

  const [papers, setPapers] = useState([]);
  const [showDiePopup, setShowDiePopup] = useState(false);
  const [showAddDiePopup, setShowAddDiePopup] = useState(false);

  const firstInputRef = useRef(null);

  // Focus on the first input field when the component loads
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Fetch papers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
      const paperData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(paperData);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: {
        [name]: name === "quantity" ? Math.max(0, value) : value,
      },
    });
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: {
        dieSize: {
          ...orderAndPaper.dieSize,
          [name]: value,
        },
      },
    });
  };

  const handleDieSelect = (die) => {
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: {
        dieSelection: die.dieName || "",
        dieCode: die.dieCode || "",
        dieSize: { length: die.dieSizeL || "", breadth: die.dieSizeB || "" },
        image: die.imageUrl || "",
      },
    });
    setShowDiePopup(false);
  };

  const handleAddDieSuccess = (newDie) => {
    handleDieSelect(newDie);
    setShowAddDiePopup(false);
  };

  const handleDateChange = (field, date) => {
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: {
        [field]: date,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div>
      <div>
        <h1 className="text-sm font-bold text-gray-700 mb-4">ORDER & PAPER DETAILS</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6  gap-3 text-sm">
            {/* Client Name */}
            <div>
              <label htmlFor="clientName" className="block mb-1">
                Client Name
              </label>
              <input
                id="clientName"
                ref={firstInputRef}
                type="text"
                name="clientName"
                placeholder="Enter the client name"
                value={orderAndPaper.clientName || ""}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-xs"
                required
              />
            </div>

            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block mb-1">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                name="projectName"
                placeholder="Enter the project name"
                value={orderAndPaper.projectName || ""}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-xs"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block mb-1">
                Date
              </label>
              <DatePicker
                id="date"
                selected={orderAndPaper.date}
                onChange={(date) => handleDateChange("date", date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className="border rounded-md p-2 w-full text-xs"
                required
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label htmlFor="deliveryDate" className="block mb-1">
                Estimated Delivery Date
              </label>
              <DatePicker
                id="deliveryDate"
                selected={orderAndPaper.deliveryDate}
                onChange={(date) => handleDateChange("deliveryDate", date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className="border rounded-md p-2 w-full text-xs"
                required
              />
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="jobType" className="block mb-1">
                Job Type
              </label>
              <select
                id="jobType"
                name="jobType"
                value={orderAndPaper.jobType || "Card"}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-xs"
                required
              >
                <option value="Card">Card</option>
                <option value="Biz Card">Biz Card</option>
                <option value="Vellum Jacket">Vellum Jacket</option>
                <option value="Envelope">Envelope</option>
                <option value="Tag">Tag</option>
                <option value="Magnet">Magnet</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block mb-1">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                placeholder="Enter the required quantity"
                value={orderAndPaper.quantity || ""}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-xs"
                required
              />
            </div>

            {/* Paper Provided */}
            <div>
              <label htmlFor="paperProvided" className="block mb-1">
                Paper Provided
              </label>
              <select
                id="paperProvided"
                name="paperProvided"
                value={orderAndPaper.paperProvided || "Yes"}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-xs"
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Paper Name */}
            <div>
              <label htmlFor="paperName" className="block mb-1">
                Paper Name
              </label>
              <select
                id="paperName"
                name="paperName"
                value={orderAndPaper.paperName || ""}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-xs"
                required
              >
                <option value="">Select Paper Name</option>
                {papers.map((paper) => (
                  <option key={paper.id} value={paper.paperName}>
                    {paper.paperName}
                  </option>
                ))}
              </select>
            </div>

            {/* Die Selection */}
            <div>
              <label htmlFor="dieSelection" className="block mb-1">
                Die Selection
              </label>
              <button
                id="dieSelection"
                type="button"
                onClick={() => setShowDiePopup(true)}
                className="border rounded-md p-2 bg-gray-100 w-full text-xs"
              >
                {orderAndPaper.dieSelection || "Select Die"}
              </button>
            </div>

            {/* Die Code */}
            <div>
              <label htmlFor="dieCode" className="block mb-1">
                Die Code
              </label>
              <input
                id="dieCode"
                type="text"
                name="dieCode"
                value={orderAndPaper.dieCode || ""}
                readOnly
                className="border rounded-md p-2 w-full bg-gray-200 text-xs"
              />
            </div>

            {/* Die Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="length" className="block mb-1">
                  Die Size (L)
                </label>
                <input
                  id="length"
                  type="number"
                  name="length"
                  placeholder="Die (L)"
                  value={orderAndPaper.dieSize?.length || ""}
                  onChange={handleNestedChange}
                  className="border rounded-md p-2 w-full text-xs"
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="breadth" className="block mb-1">
                  Die Size (B)
                </label>
                <input
                  id="breadth"
                  type="number"
                  name="breadth"
                  placeholder="Die (B)"
                  value={orderAndPaper.dieSize?.breadth || ""}
                  onChange={handleNestedChange}
                  className="border rounded-md p-2 w-full text-xs"
                  readOnly
                />
              </div>
            </div>

            {/* Die Image */}
            <div>
              <label htmlFor="image" className="block mb-1">
                Die Image
              </label>
              <img
                id="image"
                src={orderAndPaper.image || "https://via.placeholder.com/100"}
                alt="Die"
                className="w-[100px] h-[100px] object-contain border"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" className="mt-4 px-3 py-2 bg-blue-500 text-white rounded text-sm">
              Next
            </button>
          </div>
        </form>

        {/* Die Selection Popup */}
        {showDiePopup && (
          <DieSelectionPopup
            dispatch={dispatch}
            onClose={() => setShowDiePopup(false)}
            onAddNewDie={() => setShowAddDiePopup(true)}
          />
        )}

        {/* Add Die Popup */}
        {showAddDiePopup && (
          <AddDieFormForPopup
            onAddDie={handleAddDieSuccess}
            onClose={() => setShowAddDiePopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default OrderAndPaper;
