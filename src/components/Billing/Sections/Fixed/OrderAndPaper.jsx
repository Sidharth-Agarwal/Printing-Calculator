import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import SearchablePaperDropdown from "./SearchablePaperDropdown";
import InlineDieSelection from "./InlineDieSelection";

const OrderAndPaper = ({ 
  state, 
  dispatch, 
  onNext, 
  validationErrors = {}, 
  singlePageMode = false, 
  onJobTypeChange = null 
}) => {
  const { orderAndPaper } = state;

  const [papers, setPapers] = useState([]);
  const firstInputRef = useRef(null);

  // Focus on the first input field when the component loads
  useEffect(() => {
    if (firstInputRef.current && !singlePageMode) {
      firstInputRef.current.focus();
    }
  }, [singlePageMode]);

  // Fetch papers from Firestore and set the first paper if none is selected
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
      const paperData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(paperData);
      
      // If papers are loaded and no paper name is selected yet, set the first paper
      if (paperData.length > 0 && !orderAndPaper.paperName) {
        dispatch({
          type: "UPDATE_ORDER_AND_PAPER",
          payload: {
            paperName: paperData[0].paperName
          },
        });
      }
    });

    return () => unsubscribe();
  }, [dispatch, orderAndPaper.paperName]);

  // Set today's date for both date fields if they're not already set
  useEffect(() => {
    if (!orderAndPaper.date) {
      const today = new Date();
      dispatch({
        type: "UPDATE_ORDER_AND_PAPER",
        payload: {
          date: today
        },
      });
    }
    
    if (!orderAndPaper.deliveryDate) {
      const today = new Date();
      // Set delivery date to 7 days from today by default
      const deliveryDate = new Date();
      deliveryDate.setDate(today.getDate() + 15);
      dispatch({
        type: "UPDATE_ORDER_AND_PAPER",
        payload: {
          deliveryDate: deliveryDate
        },
      });
    }
  }, [dispatch, orderAndPaper.date, orderAndPaper.deliveryDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If this is a job type change and we have a custom handler
    if (name === "jobType" && onJobTypeChange) {
      onJobTypeChange(e);
    } else {
      // Debug log to track projectName changes
      if (name === "projectName") {
        console.log("Updating projectName to:", value);
      }
      
      // Normal field update
      dispatch({
        type: "UPDATE_ORDER_AND_PAPER",
        payload: {
          [name]: name === "quantity" ? Math.max(0, value) : value,
        },
      });
    }
  };

  const handleDieSelect = (dieData) => {
    console.log("OrderAndPaper receiving die data:", dieData);
    
    // Pass all the die data to the state
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: {
        dieSelection: dieData.dieSelection || "",
        dieCode: dieData.dieCode || "",
        dieSize: dieData.dieSize || { length: "", breadth: "" },
        productSize: dieData.productSize || { length: "", breadth: "" },
        image: dieData.image || "",
        frags: dieData.frags || "" // Make sure frags is included
      }
    });
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
    if (!singlePageMode) {
      onNext();
    }
  };

  // Custom styles for the datepicker to make it smaller
  const customDatePickerStyles = `
    .react-datepicker {
      font-size: 0.8rem;
      width: 200px;
    }
    .react-datepicker__month-container {
      width: 200px;
    }
    .react-datepicker__day {
      width: 1.5rem;
      line-height: 1.5rem;
      margin: 0.1rem;
    }
    .react-datepicker__day-name {
      width: 1.5rem;
      line-height: 1.5rem;
      margin: 0.1rem;
    }
    .react-datepicker__header {
      padding-top: 0.5rem;
    }
    .react-datepicker__current-month {
      font-size: 0.9rem;
    }
  `;

  return (
    <div>
      <style>{customDatePickerStyles}</style>
      <div>
        {!singlePageMode && (
          <h1 className="text-lg font-bold text-gray-700 mb-4">PROJECT & PAPER DETAILS</h1>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                id="projectName"
                ref={firstInputRef}
                type="text"
                name="projectName"
                placeholder="Enter the project name"
                value={orderAndPaper.projectName || ""}
                onChange={handleChange}
                className={`border rounded-md p-2 w-full text-sm ${
                  validationErrors.projectName ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.projectName && (
                <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.projectName}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                id="date"
                selected={orderAndPaper.date}
                onChange={(date) => handleDateChange("date", date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className="border rounded-md p-2 w-full text-sm"
                required
                popperClassName="small-calendar"
                calendarClassName="small-calendar"
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label htmlFor="deliveryDate" className="block mb-1">
                Estimated Delivery Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                id="deliveryDate"
                selected={orderAndPaper.deliveryDate}
                onChange={(date) => handleDateChange("deliveryDate", date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className="border rounded-md p-2 w-full text-sm"
                required
                popperClassName="small-calendar"
                calendarClassName="small-calendar"
              />
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="jobType" className="block mb-1">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                id="jobType"
                name="jobType"
                value={orderAndPaper.jobType || "Card"}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-sm"
                required
              >
                <option value="Card">Card</option>
                <option value="Biz Card">Biz Card</option>
                <option value="Envelope">Envelope</option>
                <option value="Seal">Seal</option>
                <option value="Magnet">Magnet</option>
                <option value="Packaging">Packaging</option>
                <option value="Notebook">Notebook</option>
                <option value="Liner">Liner</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                placeholder="Enter the required quantity"
                value={orderAndPaper.quantity || ""}
                onChange={handleChange}
                className={`border rounded-md p-2 w-full text-sm ${
                  validationErrors.quantity ? "border-red-500" : ""
                }`}
                required
              />
              {validationErrors.quantity && (
                <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.quantity}</p>
              )}
            </div>

            {/* Paper Provided */}
            <div>
              <label htmlFor="paperProvided" className="block mb-1">
                Paper Provided <span className="text-red-500">*</span>
              </label>
              <select
                id="paperProvided"
                name="paperProvided"
                value={orderAndPaper.paperProvided || "Yes"}
                onChange={handleChange}
                className="border rounded-md p-2 w-full text-sm"
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Paper Name - Using Searchable Dropdown */}
            <div>
              <label htmlFor="paperName" className="block mb-1">
                Paper Name <span className="text-red-500">*</span>
              </label>
              <SearchablePaperDropdown 
                papers={papers}
                selectedPaper={orderAndPaper.paperName || (papers.length > 0 ? papers[0].paperName : "")}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Die Selection Section - Inline but without dropdown */}
          <div className="mt-6 col-span-3">
            <label className="block mb-1 text-sm font-medium">
              Die Selection <span className="text-red-500">*</span>
            </label>
            <InlineDieSelection 
              selectedDie={{
                dieCode: orderAndPaper.dieCode || "",
                dieSize: orderAndPaper.dieSize || { length: "", breadth: "" },
                productSize: orderAndPaper.productSize || { length: "", breadth: "" },
                image: orderAndPaper.image || "",
                frags: orderAndPaper.frags || "" // Pass the frags to the InlineDieSelection component
              }}
              onDieSelect={handleDieSelect}
            />
            {validationErrors.dieCode && (
              <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.dieCode}</p>
            )}
          </div>

          {!singlePageMode && (
            <div className="flex justify-end mt-6">
              <button type="submit" className="mt-2 px-3 py-2 bg-blue-500 text-white rounded text-sm">
                Next
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrderAndPaper;