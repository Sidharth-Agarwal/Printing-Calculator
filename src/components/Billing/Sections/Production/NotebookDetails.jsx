import React, { useState, useEffect } from "react";
import useBindingTypes from "../../../../hooks/useBindingTypes";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import SearchablePaperDropdown from "../Fixed/SearchablePaperDropdown";

const NotebookDetails = ({ state, dispatch, onNext, onPrevious, singlePageMode = false }) => {
  const notebookDetails = state.notebookDetails || {
    isNotebookUsed: false,
    orientation: "",
    length: "",
    breadth: "",
    calculatedLength: "",
    calculatedBreadth: "",
    numberOfPages: "",
    bindingType: "",
    bindingTypeConcatenated: "",
    paperName: ""
  };

  const [errors, setErrors] = useState({});
  const [papers, setPapers] = useState([]);
  
  const { bindingTypes, loading: isLoading } = useBindingTypes();
  
  // FIXED: Clear errors when Notebook is turned off (same pattern as LPDetails)
  useEffect(() => {
    if (!notebookDetails.isNotebookUsed) {
      setErrors({});
    }
  }, [notebookDetails.isNotebookUsed]);

  // FIXED: Reset Notebook data when toggled off
  useEffect(() => {
    if (!notebookDetails.isNotebookUsed) {
      // When Notebook is not used, ensure clean state
      if (notebookDetails.orientation !== "" || notebookDetails.length !== "" || 
          notebookDetails.breadth !== "" || notebookDetails.numberOfPages !== "" || 
          notebookDetails.bindingType !== "" || notebookDetails.paperName !== "") {
        dispatch({
          type: "UPDATE_NOTEBOOK_DETAILS",
          payload: {
            isNotebookUsed: false,
            orientation: "",
            length: "",
            breadth: "",
            calculatedLength: "",
            calculatedBreadth: "",
            numberOfPages: "",
            bindingType: "",
            bindingTypeConcatenated: "",
            paperName: ""
          }
        });
      }
    }
  }, [notebookDetails.isNotebookUsed, notebookDetails.orientation, notebookDetails.length, 
      notebookDetails.breadth, notebookDetails.numberOfPages, notebookDetails.bindingType, 
      notebookDetails.paperName, dispatch]);

  // Fetch papers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
      const paperData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(paperData);
      
      if (paperData.length > 0 && !notebookDetails.paperName && notebookDetails.isNotebookUsed) {
        dispatch({
          type: "UPDATE_NOTEBOOK_DETAILS",
          payload: {
            paperName: paperData[0].paperName
          },
        });
      }
    });

    return () => unsubscribe();
  }, [dispatch, notebookDetails.paperName, notebookDetails.isNotebookUsed]);

  // Calculate dimensions based on orientation
  useEffect(() => {
    if (notebookDetails.isNotebookUsed && 
        notebookDetails.orientation && 
        notebookDetails.length && 
        notebookDetails.breadth) {
      
      let calculatedLength = notebookDetails.length;
      let calculatedBreadth = notebookDetails.breadth;
      
      if (notebookDetails.orientation === "Length Wise Baby Size") {
        calculatedLength = (parseFloat(notebookDetails.length) * 2).toString();
      } else if (notebookDetails.orientation === "Breadth Wise Baby Size") {
        calculatedBreadth = (parseFloat(notebookDetails.breadth) * 2).toString();
      }
      
      dispatch({
        type: "UPDATE_NOTEBOOK_DETAILS",
        payload: {
          calculatedLength,
          calculatedBreadth
        }
      });
    }
  }, [notebookDetails.orientation, notebookDetails.length, notebookDetails.breadth, dispatch, notebookDetails.isNotebookUsed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "paperSelection") {
      dispatch({
        type: "UPDATE_NOTEBOOK_DETAILS",
        payload: {
          paperName: value.paperName,
          paperGsm: value.paperGsm,
          paperCompany: value.paperCompany
        }
      });
      return;
    }
    
    if (name === "paperName") {
      const selectedPaperObj = papers.find(paper => paper.paperName === value);
      
      if (selectedPaperObj) {
        dispatch({
          type: "UPDATE_NOTEBOOK_DETAILS",
          payload: {
            paperName: selectedPaperObj.paperName,
            paperGsm: selectedPaperObj.gsm,
            paperCompany: selectedPaperObj.company
          }
        });
      } else {
        dispatch({
          type: "UPDATE_NOTEBOOK_DETAILS",
          payload: { paperName: value }
        });
      }
      return;
    }
    
    if (name === "bindingType") {
      const selectedBinding = bindingTypes.find(binding => binding.type === value);
      
      if (selectedBinding) {
        dispatch({
          type: "UPDATE_NOTEBOOK_DETAILS",
          payload: { 
            bindingType: value,
            bindingTypeConcatenated: selectedBinding.concatenate || `BINDING ${value}`
          }
        });
      } else {
        dispatch({
          type: "UPDATE_NOTEBOOK_DETAILS",
          payload: { 
            bindingType: value,
            bindingTypeConcatenated: ""
          }
        });
      }
    } else {
      dispatch({
        type: "UPDATE_NOTEBOOK_DETAILS",
        payload: { [name]: value }
      });
    }
  };

  const validateFields = () => {
    const newErrors = {};

    if (notebookDetails.isNotebookUsed) {
      if (!notebookDetails.orientation) {
        newErrors.orientation = "Orientation is required";
      }
      if (!notebookDetails.length) {
        newErrors.length = "Length is required";
      }
      if (!notebookDetails.breadth) {
        newErrors.breadth = "Breadth is required";
      }
      if (!notebookDetails.numberOfPages) {
        newErrors.numberOfPages = "Number of pages is required";
      }
      if (!notebookDetails.bindingType) {
        newErrors.bindingType = "Binding type is required";
      }
      if (!notebookDetails.paperName) {
        newErrors.paperName = "Paper name is required";
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

  // UPDATED: Always render all form fields, regardless of toggle state
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Row 1: Paper Name - Always visible */}
        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <label htmlFor="paperName" className="block text-xs font-medium text-gray-600 mb-1">
              Paper Name / Cover Name:
            </label>
            <SearchablePaperDropdown 
              papers={papers}
              selectedPaper={notebookDetails.paperName || (papers.length > 0 ? papers[0].paperName : "")}
              onChange={handleChange}
              isDieSelected={true}
            />
            {errors.paperName && (
              <p className="text-red-500 text-xs mt-1">{errors.paperName}</p>
            )}
          </div>
        </div>

        {/* Row 2: Orientation, Number of Formas, Binding Type - Always visible */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="orientation" className="block text-xs font-medium text-gray-600 mb-1">
              Orientation:
            </label>
            <select
              id="orientation"
              name="orientation"
              value={notebookDetails.orientation || ""}
              onChange={handleChange}
              className={`w-full px-2 py-2 border ${errors.orientation ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
            >
              <option value="">Select Orientation</option>
              <option value="Length Wise Baby Size">Length Wise Baby Size</option>
              <option value="Breadth Wise Baby Size">Breadth Wise Baby Size</option>
            </select>
            {errors.orientation && (
              <p className="text-red-500 text-xs mt-1">{errors.orientation}</p>
            )}
          </div>

          <div>
            <label htmlFor="numberOfPages" className="block text-xs font-medium text-gray-600 mb-1">
              Number of Formas:
            </label>
            <input
              type="number"
              id="numberOfPages"
              name="numberOfPages"
              placeholder="Number of formas"
              value={notebookDetails.numberOfPages || ""}
              onChange={handleChange}
              className={`w-full px-2 py-2 border ${errors.numberOfPages ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              min="1"
            />
            {errors.numberOfPages && (
              <p className="text-red-500 text-xs mt-1">{errors.numberOfPages}</p>
            )}
          </div>

          <div>
            <label htmlFor="bindingType" className="block text-xs font-medium text-gray-600 mb-1">
              Binding Type:
            </label>
            <select
              id="bindingType"
              name="bindingType"
              value={notebookDetails.bindingType || ""}
              onChange={handleChange}
              className={`w-full px-2 py-2 border ${errors.bindingType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              disabled={isLoading}
            >
              <option value="">Select Binding Type</option>
              {isLoading ? (
                <option value="" disabled>Loading...</option>
              ) : bindingTypes.length > 0 ? (
                bindingTypes.map((binding) => (
                  <option key={binding.id} value={binding.type}>
                    {binding.type}
                  </option>
                ))
              ) : (
                <option value="" disabled>No binding types found</option>
              )}
            </select>
            {errors.bindingType && (
              <p className="text-red-500 text-xs mt-1">{errors.bindingType}</p>
            )}
          </div>
        </div>

        {/* Row 3: Length, Breadth, Calculated Length, Calculated Breadth - Always visible */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label htmlFor="length" className="block text-xs font-medium text-gray-600 mb-1">
              Length:
            </label>
            <input
              type="number"
              id="length"
              name="length"
              placeholder="(inches)"
              value={notebookDetails.length || ""}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              className={`w-full px-2 py-2 border ${errors.length ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              step="0.01"
            />
            {errors.length && (
              <p className="text-red-500 text-xs mt-1">{errors.length}</p>
            )}
          </div>

          <div>
            <label htmlFor="breadth" className="block text-xs font-medium text-gray-600 mb-1">
              Breadth:
            </label>
            <input
              type="number"
              id="breadth"
              name="breadth"
              placeholder="(inches)"
              value={notebookDetails.breadth || ""}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              className={`w-full px-2 py-2 border ${errors.breadth ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs`}
              step="0.01"
            />
            {errors.breadth && (
              <p className="text-red-500 text-xs mt-1">{errors.breadth}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Final Length:
            </label>
            <input
              type="text"
              value={notebookDetails.calculatedLength || notebookDetails.length || ""}
              className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs"
              readOnly
              placeholder="(inches)"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Final Breadth:
            </label>
            <input
              type="text"
              value={notebookDetails.calculatedBreadth || notebookDetails.breadth || ""}
              className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs"
              readOnly
              placeholder="(inches)"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default NotebookDetails;