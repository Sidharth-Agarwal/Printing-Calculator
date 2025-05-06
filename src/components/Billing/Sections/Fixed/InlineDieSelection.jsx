import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebaseConfig";

const InlineDieSelection = ({ selectedDie, onDieSelect }) => {
  const [dies, setDies] = useState([]);
  const [filteredDies, setFilteredDies] = useState([]);
  const [searchDimensions, setSearchDimensions] = useState({
    length: "",
    breadth: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelectionUI, setShowSelectionUI] = useState(true);
  const [showAddDieForm, setShowAddDieForm] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState("Card"); // Default job type
  const [editingDie, setEditingDie] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // New Die Form State - Updated to match AddDieForm
  const [formData, setFormData] = useState({
    jobType: "",
    type: "",
    dieCode: "",
    frags: "",
    productSizeL: "",
    productSizeB: "",
    dieSizeL: "",
    dieSizeB: "",
    dieSizeL_CM: "",
    dieSizeB_CM: "",
    plateSizeL: "",
    plateSizeB: "",
    clsdPrntSizeL_CM: "",
    clsdPrntSizeB_CM: "",
    imageUrl: "",
  });
  
  const [dieImage, setDieImage] = useState(null);
  const jobTypeOptions = ["Card", "Biz Card", "Envelope", "Seal", "Magnet", "Packaging", "Notebook", "Liner"];

  // Calculate CM from inches
  const calculateCM = (inches) => {
    if (!inches || isNaN(inches)) return "";
    return (parseFloat(inches) * 2.54).toFixed(2);
  };

  // Update calculated fields whenever input fields change
  useEffect(() => {
    // Calculate L (CM) for PAPER and B (CM) for PAPER
    const dieSizeL_CM = calculateCM(formData.dieSizeL);
    const dieSizeB_CM = calculateCM(formData.dieSizeB);
    
    // PLATE Size is the same as Product Size
    const plateSizeL = formData.productSizeL;
    const plateSizeB = formData.productSizeB;
    
    // Calculate CLSD PRNT Size in CM
    const clsdPrntSizeL_CM = calculateCM(formData.productSizeL);
    const clsdPrntSizeB_CM = calculateCM(formData.productSizeB);
    
    setFormData(prev => ({
      ...prev,
      dieSizeL_CM,
      dieSizeB_CM,
      plateSizeL,
      plateSizeB,
      clsdPrntSizeL_CM,
      clsdPrntSizeB_CM,
    }));
  }, [formData.dieSizeL, formData.dieSizeB, formData.productSizeL, formData.productSizeB]);

  // Fetch dies from Firestore
  useEffect(() => {
    const fetchDies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "dies"));
        const fetchedDies = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log("All fetched dies:", fetchedDies);
        setDies(fetchedDies);
        
        // Update filtered dies based on the current job type
        filterDiesByJobType(fetchedDies, selectedJobType);
      } catch (error) {
        console.error("Error fetching dies:", error);
      }
    };
    fetchDies();
  }, [selectedJobType]);

  // When a die is selected (has dieCode), hide selection UI
  useEffect(() => {
    if (selectedDie.dieCode) {
      setShowSelectionUI(false);
    }
  }, [selectedDie.dieCode]);
  
  // Get job type from the parent form
  useEffect(() => {
    // Find the job type select in the parent form
    const jobTypeSelect = document.querySelector('select[name="jobType"]');
    
    if (jobTypeSelect) {
      // Set initial job type
      setSelectedJobType(jobTypeSelect.value);
      
      // Add event listener to update when job type changes
      const handleJobTypeChange = () => {
        setSelectedJobType(jobTypeSelect.value);
      };
      
      jobTypeSelect.addEventListener('change', handleJobTypeChange);
      
      // Clean up event listener
      return () => {
        jobTypeSelect.removeEventListener('change', handleJobTypeChange);
      };
    }
  }, []);

  // Filter dies by job type
  const filterDiesByJobType = (dieArray, jobType) => {
    if (!jobType) return setFilteredDies([]);
    
    // If "Custom" is selected, show all dies
    if (jobType === "Custom") {
      setFilteredDies(dieArray);
      return;
    }
    
    // For other job types, filter as usual
    const filtered = dieArray.filter(die => 
      die.jobType === jobType
    );
    
    setFilteredDies(filtered);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchDimensions((prev) => {
      const updated = { ...prev, [name]: value };
      performSearch(updated);
      return updated;
    });
  };

  const handleTextSearch = (e) => {
    setSearchTerm(e.target.value);
    const term = e.target.value.toLowerCase().trim();
    
    if (!term) {
      // When search term is cleared, show all dies for the current job type (or all dies for Custom)
      filterDiesByJobType(dies, selectedJobType);
      return;
    }
    
    // Filter based on text search
    let matches;
    
    // If Custom is selected, search across all dies
    if (selectedJobType === "Custom") {
      matches = dies.filter(die => 
        (die.dieCode && die.dieCode.toLowerCase().includes(term)) ||
        (die.type && die.type.toLowerCase().includes(term)) ||
        (die.jobType && die.jobType.toLowerCase().includes(term))
      );
    } else {
      // Otherwise filter within the selected job type
      matches = dies.filter(die => 
        die.jobType === selectedJobType && (
          (die.dieCode && die.dieCode.toLowerCase().includes(term)) ||
          (die.type && die.type.toLowerCase().includes(term))
        )
      );
    }
    
    setFilteredDies(matches);
  };

  // UPDATED: Modified to search in both die size AND product size
  const performSearch = (dimensions) => {
    const { length, breadth } = dimensions;
    
    // If both fields are empty, show all dies for the current job type
    if (!length && !breadth && !searchTerm) {
      filterDiesByJobType(dies, selectedJobType);
      return;
    }

    let baseSet;
    
    // If Custom is selected, use all dies as the base set
    if (selectedJobType === "Custom") {
      baseSet = dies;
    } else {
      // Otherwise filter by selected job type
      baseSet = dies.filter(die => die.jobType === selectedJobType);
    }
    
    let matches = [];

    // Text search takes precedence if present
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      matches = baseSet.filter(die => 
        (die.dieCode && die.dieCode.toLowerCase().includes(term)) ||
        (die.type && die.type.toLowerCase().includes(term)) ||
        (selectedJobType === "Custom" && die.jobType && die.jobType.toLowerCase().includes(term))
      );
    }
    // Otherwise search by dimensions
    else {
      // Case 1: Both length and breadth provided
      if (length && breadth) {
        matches = baseSet.filter(die => {
          // Check against die dimensions
          const dieMatch = 
            parseFloat(die.dieSizeL) === parseFloat(length) &&
            parseFloat(die.dieSizeB) === parseFloat(breadth);
          
          // Check against product dimensions
          const productMatch = 
            parseFloat(die.productSizeL) === parseFloat(length) &&
            parseFloat(die.productSizeB) === parseFloat(breadth);
          
          // Return true if either die size or product size matches
          return dieMatch || productMatch;
        });
      }
      // Case 2: Only length provided
      else if (length && !breadth) {
        matches = baseSet.filter(die => {
          // Check either die length or product length
          return parseFloat(die.dieSizeL) === parseFloat(length) || 
                 parseFloat(die.productSizeL) === parseFloat(length);
        });
      }
      // Case 3: Only breadth provided
      else if (!length && breadth) {
        matches = baseSet.filter(die => {
          // Check either die breadth or product breadth
          return parseFloat(die.dieSizeB) === parseFloat(breadth) || 
                 parseFloat(die.productSizeB) === parseFloat(breadth);
        });
      }
    }

    setFilteredDies(matches);
  };

  const handleSelectDie = (die) => {
    // Create the die selection object directly from the die data
    const dieSelection = {
      dieSelection: die.dieName || "",
      dieCode: die.dieCode || "",
      dieSize: { 
        length: die.dieSizeL || "", 
        breadth: die.dieSizeB || "" 
      },
      productSize: { 
        length: die.productSizeL || "", 
        breadth: die.productSizeB || "" 
      },
      image: die.imageUrl || "",
      frags: die.frags || "" // Include frags in the selection
    };
    
    // Pass the selection to the parent component
    onDieSelect(dieSelection);
    
    // Hide selection UI after die is selected
    setShowSelectionUI(false);
  };

  // Show selection UI again when "Change Die" is clicked
  const handleChangeDie = () => {
    setShowSelectionUI(true);
    // Reset search fields but maintain the job type filter
    setSearchTerm("");
    setSearchDimensions({ length: "", breadth: "" });
    filterDiesByJobType(dies, selectedJobType);
  };
  
  // Die Form Handlers - Updated to match AddDieForm
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the error when the die code is changed
    if (name === 'dieCode' && error) {
      setError(null);
    }
  };
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setDieImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setDieImage(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    
    // Reset the input file field
    const fileInput = document.querySelector("input[type='file']");
    if (fileInput) {
      fileInput.value = null;
    }
  };

  const resetForm = () => {
    setFormData({
      jobType: selectedJobType, // Default to current job type
      type: "",
      dieCode: "",
      frags: "",
      productSizeL: "",
      productSizeB: "",
      dieSizeL: "",
      dieSizeB: "",
      dieSizeL_CM: "",
      dieSizeB_CM: "",
      plateSizeL: "",
      plateSizeB: "",
      clsdPrntSizeL_CM: "",
      clsdPrntSizeB_CM: "",
      imageUrl: "",
    });
    setDieImage(null);
    setError(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleAddDie = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Check if die code already exists
      const dieCodeQuery = query(collection(db, "dies"), where("dieCode", "==", formData.dieCode));
      const querySnapshot = await getDocs(dieCodeQuery);
      
      if (!querySnapshot.empty) {
        setError("Die code already exists. Please use a unique code.");
        setIsSubmitting(false);
        return;
      }
      
      let imageUrl = formData.imageUrl;
      
      // Upload image if selected
      if (dieImage) {
        const imageRef = ref(storage, `dieImages/${formData.dieCode}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, dieImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      // Create die document with all the new fields
      const newDie = {
        ...formData,
        imageUrl,
        timestamp: new Date()
      };
      
      // Add to Firestore
      const diesCollection = collection(db, "dies");
      const docRef = await addDoc(diesCollection, newDie);
      
      // Add the new die to the local state
      const dieWithId = { id: docRef.id, ...newDie };
      setDies(prev => [...prev, dieWithId]);
      
      // Update filtered dies if the new die matches the current job type
      if (dieWithId.jobType === selectedJobType || selectedJobType === "Custom") {
        setFilteredDies(prev => [...prev, dieWithId]);
      }
      
      // Select the newly added die
      handleSelectDie(dieWithId);
      
      // Close form and reset
      setShowAddDieForm(false);
      resetForm();
      
      console.log("Die added successfully:", dieWithId);
    } catch (error) {
      console.error("Error adding die:", error);
      setError("Failed to add die. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDie = async (dieId, updatedDieData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if updating to a die code that already exists (and isn't this die)
      if (editingDie.dieCode !== updatedDieData.dieCode) {
        const dieCodeQuery = query(collection(db, "dies"), where("dieCode", "==", updatedDieData.dieCode));
        const querySnapshot = await getDocs(dieCodeQuery);
        
        if (!querySnapshot.empty) {
          setError("Die code already exists. Please use a unique code.");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Update the die in Firestore
      const dieRef = doc(db, "dies", dieId);
      await updateDoc(dieRef, updatedDieData);
      
      // Update local state
      setDies(prev => prev.map(die => 
        die.id === dieId ? { ...die, ...updatedDieData } : die
      ));
      
      // Update filtered dies
      setFilteredDies(prev => prev.map(die => 
        die.id === dieId ? { ...die, ...updatedDieData } : die
      ));
      
      // Close form and reset
      setShowAddDieForm(false);
      setEditingDie(null);
      resetForm();
      
      console.log("Die updated successfully");
    } catch (error) {
      console.error("Error updating die:", error);
      setError("Failed to update die. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit die handler
  const handleEditDie = (die) => {
    setEditingDie(die);
    
    // Calculate fields if they don't exist in the editing die data
    const updatedDie = {
      ...die,
      dieSizeL_CM: die.dieSizeL_CM || calculateCM(die.dieSizeL),
      dieSizeB_CM: die.dieSizeB_CM || calculateCM(die.dieSizeB),
      plateSizeL: die.plateSizeL || die.productSizeL || "",
      plateSizeB: die.plateSizeB || die.productSizeB || "",
      clsdPrntSizeL_CM: die.clsdPrntSizeL_CM || calculateCM(die.productSizeL),
      clsdPrntSizeB_CM: die.clsdPrntSizeB_CM || calculateCM(die.productSizeB),
    };
    
    setFormData(updatedDie);
    setDieImage(null);
    setShowAddDieForm(true);
  };

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showAddDieForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAddDieForm]);

  return (
    <div className="relative border rounded-md p-3 bg-gray-50">
      {/* Modal for Add/Edit Die Form */}
      {showAddDieForm && (
        <div 
          className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center" 
          onClick={(e) => {
            e.stopPropagation();
            if (!isSubmitting) {
              setShowAddDieForm(false);
              setEditingDie(null);
              resetForm();
            }
          }}
        >
          <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => {
                if (!isSubmitting) {
                  setShowAddDieForm(false);
                  setEditingDie(null);
                  resetForm();
                }
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
              disabled={isSubmitting}
            >
              <span className="text-2xl font-bold">&times;</span>
            </button>
            
            {/* Updated Die Form */}
            <div className="p-6">
              <div className="mb-5">
                <h3 className="text-lg font-medium">{editingDie ? 'Edit Die' : 'Add New Die'}</h3>
              </div>
              
              {/* Display error message if there is one */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddDie} className="text-sm">
                {/* Primary fields - 4 in a row */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Job Type:</label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleFormChange}
                      className="w-full p-1.5 border border-gray-300 rounded text-sm"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select</option>
                      {jobTypeOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type:</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type || ""}
                      onChange={handleFormChange}
                      placeholder="Enter type"
                      className="w-full p-1.5 border border-gray-300 rounded text-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Die Code:</label>
                    <input
                      type="text"
                      name="dieCode"
                      value={formData.dieCode || ""}
                      onChange={handleFormChange}
                      placeholder="Enter die code"
                      className="w-full p-1.5 border border-gray-300 rounded text-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Frags:</label>
                    <input
                      type="number"
                      name="frags"
                      value={formData.frags || ""}
                      onChange={handleFormChange}
                      placeholder="Enter frags"
                      className="w-full p-1.5 border border-gray-300 rounded text-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Dimensions - 4 in a row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Size L (in):</label>
                    <input
                      type="number"
                      name="productSizeL"
                      value={formData.productSizeL || ""}
                      onChange={handleFormChange}
                      placeholder="Length"
                      className="w-full p-1.5 border border-gray-300 rounded text-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Size B (in):</label>
                    <input
                      type="number"
                      name="productSizeB"
                      value={formData.productSizeB || ""}
                      onChange={handleFormChange}
                      placeholder="Breadth"
                      className="w-full p-1.5 border border-gray-300 rounded text-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Die Size L (in):</label>
                    <input
                      type="number"
                      name="dieSizeL"
                      value={formData.dieSizeL || ""}
                      onChange={handleFormChange}
                      placeholder="Length"
                      className="w-full p-1.5 border border-gray-300 rounded text-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Die Size B (in):</label>
                    <input
                      type="number"
                      name="dieSizeB"
                      value={formData.dieSizeB || ""}
                      onChange={handleFormChange}
                      placeholder="Breadth"
                      className="w-full p-1.5 border border-gray-300 rounded text-sm"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Calculated fields section - all 6 fields in 2 rows of 3 */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Calculated Fields</h3>
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">L (CM) for PAPER:</label>
                      <input
                        type="text"
                        value={formData.dieSizeL_CM || ""}
                        readOnly
                        className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">B (CM) for PAPER:</label>
                      <input
                        type="text"
                        value={formData.dieSizeB_CM || ""}
                        readOnly
                        className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">PLATE Size (L Inch):</label>
                      <input
                        type="text"
                        value={formData.plateSizeL || ""}
                        readOnly
                        className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">PLATE Size (B Inch):</label>
                      <input
                        type="text"
                        value={formData.plateSizeB || ""}
                        readOnly
                        className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">CLSD PRNT Size (L CM):</label>
                      <input
                        type="text"
                        value={formData.clsdPrntSizeL_CM || ""}
                        readOnly
                        className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">CLSD PRNT Size (B CM):</label>
                      <input
                        type="text"
                        value={formData.clsdPrntSizeB_CM || ""}
                        readOnly
                        className="w-full p-1.5 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Image upload - more compact */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Image:</label>
                  <div className="flex items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="w-full text-xs border border-gray-300 p-1.5 rounded" 
                      disabled={isSubmitting}
                    />
                    {(dieImage || formData.imageUrl) && (
                      <div className="flex items-center ml-2">
                        <img
                          src={dieImage ? URL.createObjectURL(dieImage) : formData.imageUrl}
                          alt="Selected"
                          className="w-10 h-10 object-cover border rounded"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                          disabled={isSubmitting}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDieForm(false);
                      setEditingDie(null);
                      resetForm();
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.preventDefault();
                      if (editingDie) {
                        handleUpdateDie(editingDie.id, { ...formData, imageUrl: dieImage ? null : formData.imageUrl });
                      } else {
                        handleAddDie(e);
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      editingDie ? 'Update Die' : 'Add Die'
                    )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
  
        {showSelectionUI ? (
          // Die Selection UI
          <>
            {/* Die list header with info and Add button */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {selectedJobType === "Custom" 
                  ? `Showing all dies: ${filteredDies.length} found`
                  : `Showing dies for ${selectedJobType}: ${filteredDies.length} found`
                }
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddDieForm(true);
                  // Initialize with the current job type
                  setFormData(prev => ({
                    ...prev,
                    jobType: selectedJobType
                  }));
                }}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded flex items-center gap-1"
              >
                <span>+</span> New Die
              </button>
            </div>
            
            {/* Search Fields */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Search by Code, Type or Job Type</label>
              <input
                type="text"
                placeholder="Type to search by die code, type or job type"
                value={searchTerm}
                onChange={handleTextSearch}
                className="border text-sm rounded-md p-2 w-full"
              />
            </div>
  
            <div className="text-xs text-gray-500 mb-2">- OR -</div>
            
            {/* Search by dimensions - updated label to indicate unified search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1">Length (inches) - Die or Product</label>
                <input
                  type="number"
                  name="length"
                  step="0.01"
                  placeholder="Enter Length"
                  value={searchDimensions.length}
                  onChange={handleSearchChange}
                  className="border text-sm rounded-md p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Breadth (inches) - Die or Product</label>
                <input
                  type="number"
                  name="breadth"
                  step="0.01"
                  placeholder="Enter Breadth"
                  value={searchDimensions.breadth}
                  onChange={handleSearchChange}
                  className="border text-sm rounded-md p-2 w-full"
                />
              </div>
            </div>
  
            {/* Dies List - Scrollable container showing dies for the selected job type */}
            <div className="max-h-60 overflow-y-auto border rounded-md bg-white">
              {filteredDies.length > 0 ? (
                filteredDies.map((die) => (
                  <div
                    key={die.id}
                    className="flex justify-between items-center p-3 border-b hover:bg-blue-50 cursor-pointer"
                  >
                    <div className="flex-grow" onClick={() => handleSelectDie(die)}>
                      <p className="text-sm font-medium">Die Code: {die.dieCode}</p>
                      <p className="text-xs text-gray-600">
                        Die Size: {die.dieSizeL}" × {die.dieSizeB}"
                      </p>
                      <p className="text-xs text-gray-600">
                        Product Size: {die.productSizeL || "N/A"}" × {die.productSizeB || "N/A"}"
                      </p>
                      <p className="text-xs text-gray-600">
                        Type: {die.type || "Not specified"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Frags: {die.frags || "N/A"}
                      </p>
                      {selectedJobType === "Custom" && (
                        <p className="text-xs text-gray-500">
                          Job Type: {die.jobType || "Not specified"}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {die.imageUrl && (
                        <img
                          src={die.imageUrl}
                          alt="Die"
                          className="w-16 h-16 object-contain border rounded"
                          onClick={() => handleSelectDie(die)}
                        />
                      )}
                      <button 
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        onClick={() => handleEditDie(die)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-white border-b text-sm text-gray-600">
                  {selectedJobType === "Custom" 
                    ? "No dies found in the database. Create a new die."
                    : `No dies found for ${selectedJobType}. Create a new die or select a different job type.`
                  }
                </div>
              )}
            </div>
          </>
        ) : (
          // Selected Die Display
          <div className="p-3 bg-white border rounded-md">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Selected Die:</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddDieForm(true);
                    setFormData(prev => ({
                      ...prev,
                      jobType: selectedJobType
                    }));
                  }}
                  className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
                >
                  + New Die
                </button>
                <button
                  onClick={handleChangeDie}
                  className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                >
                  Change Die
                </button>
              </div>
            </div>
            
            <div className="flex items-center mt-2 space-x-4">
              {selectedDie.image ? (
                <img
                  src={selectedDie.image}
                  alt="Selected Die"
                  className="w-16 h-16 object-contain border rounded"
                />
              ) : (
                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                  No image
                </div>
              )}
              <div className="flex flex-col">
                <div className="text-sm">
                  <strong>Die Code:</strong> {selectedDie.dieCode}
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Die Size:</strong> {selectedDie.dieSize.length}" × {selectedDie.dieSize.breadth}"
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Product Size:</strong> 
                  {selectedDie.productSize && 
                  (selectedDie.productSize.length || selectedDie.productSize.breadth) 
                    ? `${selectedDie.productSize.length || ""}\" × ${selectedDie.productSize.breadth || ""}\"` 
                    : "N/A"}
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Frags:</strong> {selectedDie.frags || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default InlineDieSelection;