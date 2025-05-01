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
  
  console.log("Binding types from hook:", bindingTypes);
  
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
    console.log(`Handling change for ${name}: ${value}`);
    
    // Special handling for bindingType to also set the concatenated version
    if (name === "bindingType") {
      // Find the selected binding type's concatenated value
      const selectedBinding = bindingTypes.find(binding => binding.type === value);
      console.log("Selected binding:", selectedBinding);
      
      if (selectedBinding) {
        console.log(`Setting binding type to ${value} with concatenated value ${selectedBinding.concatenate}`);
        dispatch({
          type: "UPDATE_NOTEBOOK_DETAILS",
          payload: { 
            bindingType: value,
            bindingTypeConcatenated: selectedBinding.concatenate || `BINDING ${value}`
          }
        });
      } else {
        console.log(`No matching binding found for ${value}`);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paper Name - Using Searchable Dropdown */}
        <div>
          <div className="mb-1 text-sm">Paper Name:</div>
          <SearchablePaperDropdown 
            papers={papers}
            selectedPaper={notebookDetails.paperName || (papers.length > 0 ? papers[0].paperName : "")}
            onChange={handleChange}
          />
          {errors.paperName && (
            <p className="text-red-500 text-sm">{errors.paperName}</p>
          )}
        </div>

        {/* Orientation */}
        <div>
          <div className="mb-1 text-sm">Orientation:</div>
          <select
            id="orientation"
            name="orientation"
            value={notebookDetails.orientation || ""}
            onChange={handleChange}
            className="border rounded-md p-2 w-full text-sm"
          >
            <option value="">Select Orientation</option>
            <option value="Length Wise Baby Size">Length Wise Baby Size</option>
            <option value="Breadth Wise Baby Size">Breadth Wise Baby Size</option>
          </select>
          {errors.orientation && (
            <p className="text-red-500 text-sm">{errors.orientation}</p>
          )}
        </div>

        {/* Length */}
        <div>
          <div className="mb-1 text-sm">Length (inches):</div>
          <input
            type="number"
            id="length"
            name="length"
            placeholder="Enter length"
            value={notebookDetails.length || ""}
            onChange={handleChange}
            className="border rounded-md p-2 w-full text-sm"
            step="0.01"
          />
          {errors.length && (
            <p className="text-red-500 text-sm">{errors.length}</p>
          )}
        </div>

        {/* Breadth */}
        <div>
          <div className="mb-1 text-sm">Breadth (inches):</div>
          <input
            type="number"
            id="breadth"
            name="breadth"
            placeholder="Enter breadth"
            value={notebookDetails.breadth || ""}
            onChange={handleChange}
            className="border rounded-md p-2 w-full text-sm"
            step="0.01"
          />
          {errors.breadth && (
            <p className="text-red-500 text-sm">{errors.breadth}</p>
          )}
        </div>

        {/* Calculated Dimensions (Display Only) - Shown when we have orientation and dimensions */}
        {notebookDetails.orientation && (
          <>
            <div>
              <div className="mb-1 text-sm">Calculated Length (inches):</div>
              <div className="bg-gray-100 p-2 rounded-md border text-sm">
                {notebookDetails.calculatedLength || notebookDetails.length}
              </div>
            </div>
            <div>
              <div className="mb-1 text-sm">Calculated Breadth (inches):</div>
              <div className="bg-gray-100 p-2 rounded-md border text-sm">
                {notebookDetails.calculatedBreadth || notebookDetails.breadth}
              </div>
            </div>
          </>
        )}

        {/* Number of Pages */}
        <div>
          <div className="mb-1 text-sm">Number of Pages:</div>
          <input
            type="number"
            id="numberOfPages"
            name="numberOfPages"
            placeholder="Enter number of pages"
            value={notebookDetails.numberOfPages || ""}
            onChange={handleChange}
            className="border rounded-md p-2 w-full text-sm"
            min="1"
          />
          {errors.numberOfPages && (
            <p className="text-red-500 text-sm">{errors.numberOfPages}</p>
          )}
        </div>

        {/* Binding Type */}
        <div className="md:col-span-2">
          <div className="mb-1 text-sm">Binding Type:</div>
          {console.log("Rendering binding types dropdown with values:", bindingTypes)}
          {console.log("Current selected binding type:", notebookDetails.bindingType)}
          <select
            id="bindingType"
            name="bindingType"
            value={notebookDetails.bindingType || ""}
            onChange={handleChange}
            className="border rounded-md p-2 w-full text-sm"
            disabled={isLoading}
          >
            <option value="">Select Binding Type</option>
            {isLoading ? (
              <option value="" disabled>Loading binding types...</option>
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
            <p className="text-red-500 text-sm">{errors.bindingType}</p>
          )}
          {bindingTypes.length === 0 && !isLoading && (
            <p className="text-amber-500 text-sm mt-1">Warning: No binding types were loaded from the database</p>
          )}
        </div>
      </div>
    </form>
  );
};

export default NotebookDetails;