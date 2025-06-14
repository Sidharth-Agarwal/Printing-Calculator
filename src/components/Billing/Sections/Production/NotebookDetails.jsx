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
  
  // Use the custom hook to fetch binding types
  const { bindingTypes, loading: isLoading } = useBindingTypes();
  
  // Fetch papers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
      const paperData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(paperData);
      
      // If papers are loaded and no paper name is selected yet, set the first paper
      if (paperData.length > 0 && !notebookDetails.paperName) {
        dispatch({
          type: "UPDATE_NOTEBOOK_DETAILS",
          payload: {
            paperName: paperData[0].paperName
          },
        });
      }
    });

    return () => unsubscribe();
  }, [dispatch, notebookDetails.paperName]);

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
    
    // Special handling for bindingType to also set the concatenated version
    if (name === "bindingType") {
      // Find the selected binding type's concatenated value
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
      // Handle all other fields normally
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

  // If Notebook is not used, don't render any content
  if (!notebookDetails.isNotebookUsed) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* Paper Selection */}
        <div>
          <h3 className="text-xs uppercase font-medium text-gray-500 mb-2">Paper Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paperName" className="block text-xs font-medium text-gray-600 mb-1">
                Paper Name:
              </label>
              <SearchablePaperDropdown 
                papers={papers}
                selectedPaper={notebookDetails.paperName || (papers.length > 0 ? papers[0].paperName : "")}
                onChange={handleChange}
              />
              {errors.paperName && (
                <p className="text-red-500 text-xs mt-1">{errors.paperName}</p>
              )}
            </div>

            {/* Orientation */}
            <div>
              <label htmlFor="orientation" className="block text-xs font-medium text-gray-600 mb-1">
                Orientation:
              </label>
              <select
                id="orientation"
                name="orientation"
                value={notebookDetails.orientation || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.orientation ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
              >
                <option value="">Select Orientation</option>
                <option value="Length Wise Baby Size">Length Wise Baby Size</option>
                <option value="Breadth Wise Baby Size">Breadth Wise Baby Size</option>
              </select>
              {errors.orientation && (
                <p className="text-red-500 text-xs mt-1">{errors.orientation}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h3 className="text-xs uppercase font-medium text-gray-500 mb-2">Dimensions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Length */}
            <div>
              <label htmlFor="length" className="block text-xs font-medium text-gray-600 mb-1">
                Length (inches):
              </label>
              <input
                type="number"
                id="length"
                name="length"
                placeholder="Enter length"
                value={notebookDetails.length || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.length ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                step="0.01"
              />
              {errors.length && (
                <p className="text-red-500 text-xs mt-1">{errors.length}</p>
              )}
            </div>

            {/* Breadth */}
            <div>
              <label htmlFor="breadth" className="block text-xs font-medium text-gray-600 mb-1">
                Breadth (inches):
              </label>
              <input
                type="number"
                id="breadth"
                name="breadth"
                placeholder="Enter breadth"
                value={notebookDetails.breadth || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.breadth ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                step="0.01"
              />
              {errors.breadth && (
                <p className="text-red-500 text-xs mt-1">{errors.breadth}</p>
              )}
            </div>
          </div>
        </div>

        {/* Calculated Dimensions (Display Only) */}
        {notebookDetails.orientation && notebookDetails.length && notebookDetails.breadth && (
          <div>
            <h3 className="text-xs uppercase font-medium text-gray-500 mb-2">Calculated Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Final Length (inches):
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {notebookDetails.calculatedLength || notebookDetails.length || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Final Breadth (inches):
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {notebookDetails.calculatedBreadth || notebookDetails.breadth || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xs uppercase font-medium text-gray-500 mb-2">Notebook Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Number of Pages */}
            <div>
              <label htmlFor="numberOfPages" className="block text-xs font-medium text-gray-600 mb-1">
                Number of Pages:
              </label>
              <input
                type="number"
                id="numberOfPages"
                name="numberOfPages"
                placeholder="Enter number of pages"
                value={notebookDetails.numberOfPages || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.numberOfPages ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
                min="1"
              />
              {errors.numberOfPages && (
                <p className="text-red-500 text-xs mt-1">{errors.numberOfPages}</p>
              )}
            </div>

            {/* Binding Type */}
            <div>
              <label htmlFor="bindingType" className="block text-xs font-medium text-gray-600 mb-1">
                Binding Type:
              </label>
              <select
                id="bindingType"
                name="bindingType"
                value={notebookDetails.bindingType || ""}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.bindingType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm`}
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
              {bindingTypes.length === 0 && !isLoading && (
                <p className="text-amber-500 text-xs mt-1">Warning: No binding types were loaded from the database</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default NotebookDetails;