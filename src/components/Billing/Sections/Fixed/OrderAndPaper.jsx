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
  onJobTypeChange = null,
  compact = false,
  hideDieSelection = false // New prop to hide die selection
}) => {
  const { orderAndPaper } = state;

  const [papers, setPapers] = useState([]);
  const firstInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const [formChanges, setFormChanges] = useState({});
  const [initialPaperSelectionDone, setInitialPaperSelectionDone] = useState(false);

  // Focus on the first input field when the component loads
  useEffect(() => {
    if (firstInputRef.current && !singlePageMode) {
      firstInputRef.current.focus();
    }
  }, [singlePageMode]);

  // Log form state for debugging
  useEffect(() => {
    console.log("OrderAndPaper - Current orderAndPaper state:", {
      jobType: orderAndPaper.jobType,
      quantity: orderAndPaper.quantity,
      paperName: orderAndPaper.paperName,
      paperGsm: orderAndPaper.paperGsm,
      paperCompany: orderAndPaper.paperCompany,
      dieCode: orderAndPaper.dieCode,
      weddingDate: orderAndPaper.weddingDate
    });
  }, [orderAndPaper]);

  // FIXED: Fetch papers from Firestore and set WILD-450 paper if available, or the first paper if not
  // Only auto-select once to prevent overriding user selections
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
      const paperData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(paperData);
      
      // FIXED: Only auto-select if no paper is selected AND this is the first load
      // Check for complete paper data, not just paperName
      if (paperData.length > 0 && 
          !orderAndPaper.paperName && 
          !orderAndPaper.paperGsm && 
          !orderAndPaper.paperCompany &&
          !initialPaperSelectionDone) {
        
        // Look for the paper named "WILD-450"
        const wildPaper = paperData.find(paper => paper.paperName === "WILD-450");
        
        // If WILD-450 exists, select it; otherwise default to the first paper
        const selectedPaper = wildPaper || paperData[0];
        
        console.log("Auto-selecting paper (first time only):", {
          name: selectedPaper.paperName,
          gsm: selectedPaper.gsm,
          company: selectedPaper.company
        });
        
        dispatch({
          type: "UPDATE_ORDER_AND_PAPER",
          payload: {
            paperName: selectedPaper.paperName,
            paperGsm: selectedPaper.gsm,
            paperCompany: selectedPaper.company
          },
        });
        
        // Mark that initial selection is done
        setInitialPaperSelectionDone(true);
      }
    });

    return () => unsubscribe();
  }, [dispatch, orderAndPaper.paperName, orderAndPaper.paperGsm, orderAndPaper.paperCompany, initialPaperSelectionDone]);

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
      // Set delivery date to 15 days from today by default
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

  // FIXED: Updated handleChange to properly handle complete paper selection
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Track form changes for debugging
    setFormChanges(prev => ({
      ...prev,
      [name]: value
    }));
    
    // FIXED: Handle complete paper selection data from SearchablePaperDropdown
    if (name === "paperSelection") {
      console.log("Complete paper selection changed:", value);
      
      dispatch({
        type: "UPDATE_ORDER_AND_PAPER",
        payload: {
          paperName: value.paperName,
          paperGsm: value.paperGsm,
          paperCompany: value.paperCompany
        },
      });
      
      // Mark that user has made a manual selection
      setInitialPaperSelectionDone(true);
      return;
    }
    
    // Handle legacy paperName only updates (fallback for any direct paperName changes)
    if (name === "paperName") {
      console.log("Paper name only changed:", value);
      
      // Find the complete paper data
      const selectedPaperObj = papers.find(paper => paper.paperName === value);
      
      if (selectedPaperObj) {
        console.log("Found complete paper data for:", value, selectedPaperObj);
        dispatch({
          type: "UPDATE_ORDER_AND_PAPER",
          payload: {
            paperName: selectedPaperObj.paperName,
            paperGsm: selectedPaperObj.gsm,
            paperCompany: selectedPaperObj.company
          },
        });
      } else {
        // Fallback if paper not found - this shouldn't happen with the dropdown
        console.warn("Paper not found in papers list:", value);
        dispatch({
          type: "UPDATE_ORDER_AND_PAPER",
          payload: { paperName: value },
        });
      }
      
      // Mark that user has made a manual selection
      setInitialPaperSelectionDone(true);
      return;
    }
    
    // Handle paper details specifically (legacy support)
    if (name === "paperDetails") {
      console.log("Paper details selection changed:", value);
      
      dispatch({
        type: "UPDATE_ORDER_AND_PAPER",
        payload: {
          paperName: value.paperName,
          paperGsm: value.paperGsm,
          paperCompany: value.paperCompany
        },
      });
      
      // Mark that user has made a manual selection
      setInitialPaperSelectionDone(true);
      return;
    }
    
    // If this is a job type change and we have a custom handler
    if (name === "jobType") {
      console.log("Job type changed to:", value);
      
      if (onJobTypeChange) {
        onJobTypeChange(e);
      } else {
        // Directly update the job type in state if no custom handler
        dispatch({
          type: "UPDATE_ORDER_AND_PAPER",
          payload: { jobType: value },
        });
      }
    } else {
      // Debug log to track changes
      if (name === "projectName") {
        console.log("Updating projectName to:", value);
      } else if (name === "quantity") {
        console.log("Updating quantity to:", value);
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
        frags: dieData.frags || "",
        type: dieData.type || ""
      }
    });
    
    // Log the updated state after die selection
    console.log("Die selection updated state:", {
      dieSelection: dieData.dieSelection || "",
      dieCode: dieData.dieCode || "",
      dieSize: dieData.dieSize || { length: "", breadth: "" },
      productSize: dieData.productSize || { length: "", breadth: "" },
      frags: dieData.frags || "",
      type: dieData.type || ""
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
  const customStyles = `
    /* DatePicker Styles */
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
    
    /* Remove spinner (up/down arrows) from number inputs */
    .no-spinner::-webkit-inner-spin-button, 
    .no-spinner::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    .no-spinner {
      -moz-appearance: textfield;
    }
  `;

  return (
    <div>
      <style>{customStyles}</style>
      <div>
        {!singlePageMode && !compact && (
          <h1 className="text-lg font-bold text-gray-700 mb-4">PROJECT & PAPER DETAILS</h1>
        )}
        <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-6"}>
          {/* Form Fields Grid - Updated layout with three rows */}
          <div className="grid grid-cols-1 gap-4 text-sm">
            {/* First Row: Project Name, Job Type, Quantity */}
            <div className="grid grid-cols-3 gap-4">
              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className="block text-xs font-medium text-gray-600 mb-1">
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
                  className={`border rounded-md p-2 w-full text-xs ${
                    validationErrors.projectName ? "border-red-500" : ""
                  }`}
                  required
                />
                {validationErrors.projectName && (
                  <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.projectName}</p>
                )}
              </div>

              {/* Job Type */}
              <div>
                <label htmlFor="jobType" className="block text-xs font-medium text-gray-600 mb-1">
                  Job Type <span className="text-red-500">*</span>
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
                <label htmlFor="quantity" className="block text-xs font-medium text-gray-600 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={orderAndPaper.quantity || ""}
                  onChange={handleChange}
                  ref={quantityInputRef}
                  onWheel={(e) => e.target.blur()}
                  className={`text-xs border rounded-md p-2 w-full text-sm no-spinner ${
                    validationErrors.quantity ? "border-red-500" : ""
                  }`}
                  required
                />
                {validationErrors.quantity && (
                  <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.quantity}</p>
                )}
              </div>
            </div>

            {/* Second Row: Date, Delivery Date, Wedding Date */}
            <div className="grid grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-xs font-medium text-gray-600 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  id="date"
                  selected={orderAndPaper.date}
                  onChange={(date) => handleDateChange("date", date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="border rounded-md p-1.5 w-full text-xs"
                  required
                  popperClassName="small-calendar"
                  calendarClassName="small-calendar"
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label htmlFor="deliveryDate" className="block text-xs font-medium text-gray-600 mb-1">
                  Delivery Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  id="deliveryDate"
                  selected={orderAndPaper.deliveryDate}
                  onChange={(date) => handleDateChange("deliveryDate", date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="border rounded-md p-1.5 w-full text-xs"
                  required
                  popperClassName="small-calendar"
                  calendarClassName="small-calendar"
                />
              </div>

              {/* Wedding Date */}
              <div>
                <label htmlFor="weddingDate" className="block text-xs font-medium text-gray-600 mb-1">
                  Wedding Date
                </label>
                <DatePicker
                  id="weddingDate"
                  selected={orderAndPaper.weddingDate}
                  onChange={(date) => handleDateChange("weddingDate", date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="border rounded-md p-1.5 w-full text-xs"
                  popperClassName="small-calendar"
                  calendarClassName="small-calendar"
                />
              </div>
            </div>

            {/* Third Row: Paper Provided and Paper Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Paper Provided */}
              <div>
                <label htmlFor="paperProvided" className="block text-xs font-medium text-gray-600 mb-1">
                  Paper Provided <span className="text-red-500">*</span>
                </label>
                <select
                  id="paperProvided"
                  name="paperProvided"
                  value={orderAndPaper.paperProvided || "Yes"}
                  onChange={handleChange}
                  className="border rounded-md p-1.5 w-full text-xs"
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Paper Selection */}
              <div>
                <label htmlFor="paperName" className="block text-xs font-medium text-gray-600 mb-1">
                  Paper Name / Cover Name<span className="text-red-500">*</span>
                </label>
                <SearchablePaperDropdown 
                  papers={papers}
                  selectedPaper={orderAndPaper.paperName || ""}
                  onChange={handleChange}
                  compact={true}
                  isDieSelected={!!(orderAndPaper.dieCode)}
                />
              </div>
            </div>
          </div>

          {/* Die Selection Section - Only show if not hidden */}
          {!hideDieSelection && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Die Selection <span className="text-red-500">*</span>
              </label>
              <InlineDieSelection 
                selectedDie={{
                  dieCode: orderAndPaper.dieCode || "",
                  dieSize: orderAndPaper.dieSize || { length: "", breadth: "" },
                  productSize: orderAndPaper.productSize || { length: "", breadth: "" },
                  image: orderAndPaper.image || "",
                  frags: orderAndPaper.frags || "",
                  type: orderAndPaper.type || ""
                }}
                onDieSelect={handleDieSelect}
                compact={compact}
              />
              {validationErrors.dieCode && (
                <p className="text-red-500 text-xs mt-1 error-message">{validationErrors.dieCode}</p>
              )}
            </div>
          )}

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