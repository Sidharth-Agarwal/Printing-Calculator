import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebaseConfig";

const InlineDieSelection = ({ selectedDie, onDieSelect, compact = false }) => {
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
  const [selectedDieState, setSelectedDieState] = useState({});
  
  // New Die Form State
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

  // Enhanced search function with priority scoring and numerical sorting
  const calculateSearchScore = (die, searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const dieCode = (die.dieCode || "").toLowerCase();
    const type = (die.type || "").toLowerCase();
    const jobType = (die.jobType || "").toLowerCase();
    
    let score = 0;
    let numericalBonus = 0;
    
    // Check if this is a pattern like "c-1" and extract numerical part for sorting
    const searchPattern = lowerSearchTerm.match(/^([a-z]+)-?(\d*)$/i);
    const diePattern = dieCode.match(/^([a-z]+)-?(\d+)$/i);
    
    if (searchPattern && diePattern) {
      const searchPrefix = searchPattern[1];
      const searchNumber = searchPattern[2] ? parseInt(searchPattern[2]) : null;
      const diePrefix = diePattern[1];
      const dieNumber = parseInt(diePattern[2]);
      
      // If prefixes match (like "c" matches "c")
      if (diePrefix === searchPrefix) {
        if (searchNumber !== null) {
          // Exact match gets highest priority (1000 points)
          if (dieNumber === searchNumber) {
            score += 1000;
          }
          // Same prefix but different number (700 points base)
          else {
            score += 700;
            // Add numerical proximity bonus (closer numbers get higher score)
            const numberDifference = Math.abs(dieNumber - searchNumber);
            numericalBonus = Math.max(0, 100 - numberDifference * 2);
          }
        } else {
          // Searching just for prefix like "c" (600 points base)
          score += 600;
          // Smaller numbers get slightly higher priority for prefix-only searches
          numericalBonus = Math.max(0, 50 - dieNumber);
        }
      }
    }
    
    // Fallback to original scoring if pattern doesn't match
    if (score === 0) {
      // Exact match gets highest priority (1000 points)
      if (dieCode === lowerSearchTerm) {
        score += 1000;
      }
      // Starts with search term (800 points)
      else if (dieCode.startsWith(lowerSearchTerm)) {
        score += 800;
      }
      // Exact match after dash (700 points) - for cases like "c-1" matching "AC-1"
      else if (dieCode.includes('-' + lowerSearchTerm)) {
        score += 700;
      }
      // Exact match before dash (650 points) - for cases like "c-1" where "c" matches "C-19"
      else if (dieCode.includes(lowerSearchTerm + '-')) {
        score += 650;
      }
      // Starts with search term after dash (600 points)
      else if (dieCode.includes('-') && dieCode.split('-').some(part => part.startsWith(lowerSearchTerm))) {
        score += 600;
      }
      // Contains search term (500 points)
      else if (dieCode.includes(lowerSearchTerm)) {
        score += 500;
      }
      
      // Extra bonus for exact length match (if searching for "c-1", prefer "C-1" over "C-19")
      if (dieCode.includes(lowerSearchTerm) && dieCode.length === lowerSearchTerm.length) {
        score += 200;
      }
      
      // Bonus points for shorter die codes (closer matches)
      if (dieCode.includes(lowerSearchTerm)) {
        const lengthBonus = Math.max(0, 50 - Math.abs(dieCode.length - lowerSearchTerm.length) * 5);
        score += lengthBonus;
      }
    }
    
    // Add numerical bonus to the total score
    score += numericalBonus;
    
    // Secondary matches in type and job type (lower priority)
    if (type.includes(lowerSearchTerm)) {
      score += 100;
    }
    if (jobType.includes(lowerSearchTerm)) {
      score += 50;
    }
    
    return score;
  };

  // Enhanced filter and sort function
  const filterAndSortDies = (diesArray, searchTerm, jobType) => {
    if (!searchTerm.trim()) {
      // If no search term, just filter by job type
      return filterDiesByJobTypeArray(diesArray, jobType);
    }
    
    // Get base set based on job type
    const baseSet = getBaseSetForJobType(diesArray, jobType);
    
    // Calculate scores and filter
    const scoredDies = baseSet
      .map(die => ({
        ...die,
        searchScore: calculateSearchScore(die, searchTerm)
      }))
      .filter(die => die.searchScore > 0) // Only include dies with some relevance
      .sort((a, b) => b.searchScore - a.searchScore); // Sort by score (highest first)
    
    // Remove the searchScore property before returning
    return scoredDies.map(({ searchScore, ...die }) => die);
  };

  // Helper function to filter by job type and return array (not set state)
  const filterDiesByJobTypeArray = (diesArray, jobType) => {
    if (!jobType) return [];
    
    if (jobType === "Custom") {
      return diesArray;
    }
    
    if (jobType === "Card") {
      return diesArray.filter(die => die.jobType === "Card" || die.jobType === "Biz Card");
    }
    
    return diesArray.filter(die => die.jobType === jobType);
  };

  // Log selectedDie for debugging
  useEffect(() => {
    console.log("InlineDieSelection - Selected Die:", selectedDie);
    
    // Track selected die state
    setSelectedDieState(selectedDie);
    
    // Automatically show/hide selection UI based on whether a die is selected
    if (selectedDie && selectedDie.dieCode) {
      setShowSelectionUI(false);
    }
  }, [selectedDie]);

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

  // Helper function to get base set of dies based on job type
  const getBaseSetForJobType = (diesArray, jobType) => {
    if (jobType === "Custom") {
      return diesArray;
    } else if (jobType === "Card") {
      // For Card job type, include both Card and Biz Card dies
      return diesArray.filter(die => die.jobType === "Card" || die.jobType === "Biz Card");
    } else {
      // For other job types, filter by exact match
      return diesArray.filter(die => die.jobType === jobType);
    }
  };

  // Filter dies by job type
  const filterDiesByJobType = (dieArray, jobType) => {
    if (!jobType) return setFilteredDies([]);
    
    // If "Custom" is selected, show all dies
    if (jobType === "Custom") {
      setFilteredDies(dieArray);
      return;
    }
    
    // Special case: If "Card" is selected, show both "Card" and "Biz Card" dies
    if (jobType === "Card") {
      const filtered = dieArray.filter(die => 
        die.jobType === "Card" || die.jobType === "Biz Card"
      );
      setFilteredDies(filtered);
      return;
    }
    
    // For other job types, filter as usual
    const filtered = dieArray.filter(die => 
      die.jobType === jobType
    );
    
    setFilteredDies(filtered);
  };

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
        
        setDies(fetchedDies);
        
        // Update filtered dies based on the current job type
        filterDiesByJobType(fetchedDies, selectedJobType);
      } catch (error) {
        console.error("Error fetching dies:", error);
      }
    };
    fetchDies();
  }, [selectedJobType]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchDimensions((prev) => {
      const updated = { ...prev, [name]: value };
      performSearch(updated);
      return updated;
    });
  };

  // Updated handleTextSearch function with improved search
  const handleTextSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    if (!searchValue.trim()) {
      // When search term is cleared, show all dies for the current job type
      filterDiesByJobType(dies, selectedJobType);
      return;
    }
    
    // Use improved search with scoring
    const results = filterAndSortDies(dies, searchValue, selectedJobType);
    setFilteredDies(results);
  };

  // Modified performSearch function
  const performSearch = (dimensions) => {
    const { length, breadth } = dimensions;
    
    // If both fields are empty, show all dies for the current job type
    if (!length && !breadth && !searchTerm) {
      filterDiesByJobType(dies, selectedJobType);
      return;
    }

    // Get the base set of dies based on job type
    const baseSet = getBaseSetForJobType(dies, selectedJobType);
    
    let matches = [];

    // Text search takes precedence if present
    if (searchTerm) {
      // Use improved search for text
      matches = filterAndSortDies(dies, searchTerm, selectedJobType);
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
    // Log selection for debugging
    console.log("Die selection:", die);
    
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
      frags: die.frags || "",
      type: die.type || ""
    };
    
    // Update our local state first
    setSelectedDieState(dieSelection);
    
    // Pass the selection to the parent component
    onDieSelect(dieSelection);
    
    // Hide selection UI after die is selected
    setShowSelectionUI(false);
    
    // Log the die selection being sent to parent
    console.log("Die selection sent to parent:", dieSelection);
  };

  // Show selection UI again when "Change Die" is clicked
  const handleChangeDie = () => {
    setShowSelectionUI(true);
    // Reset search fields but maintain the job type filter
    setSearchTerm("");
    setSearchDimensions({ length: "", breadth: "" });
    filterDiesByJobType(dies, selectedJobType);
  };
  
  // Die Form Handlers
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
      if (dieWithId.jobType === selectedJobType || 
          (selectedJobType === "Card" && (dieWithId.jobType === "Card" || dieWithId.jobType === "Biz Card")) ||
          selectedJobType === "Custom") {
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
    <div className="relative rounded-md bg-white">
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
            
            {/* Die Form Content - Keeping the existing form structure */}
            <div className="p-6">
              <div className="mb-5">
                <h3 className="text-lg font-medium">{editingDie ? 'Edit Die' : 'Add New Die'}</h3>
              </div>
              
              {/* Display error message if there is one */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-1 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddDie} className="text-sm">
                {/* Primary fields - 4 in a row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-1">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
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

                {/* Calculated fields section */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Calculated Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                {/* Image upload */}
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
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
        // Die Selection UI - Updated layout with 50% search bar and 25% each for length/breadth
        <>
          <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-gray-600">
              Showing dies for {selectedJobType}: {filteredDies.length} found
            </div>
            <button
              type="button"
              onClick={() => setShowAddDieForm(true)}
              className="px-2 py-2 bg-red-600 text-white text-xs rounded-md flex items-center gap-1 hover:bg-red-700 transition-colors"
            >
              + New Die
            </button>
          </div>
          
          {/* Updated search layout: 50% search bar, 25% length, 25% breadth */}
          <div className="grid grid-cols-4 gap-3 mb-1">
            {/* Search input - takes 2 columns (50%) */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Search by Code, Type or Job Type</label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by code, type or job type"
                  value={searchTerm}
                  onChange={handleTextSearch}
                  className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs"
                  data-testid="die-search-input"
                />
              </div>
            </div>
            
            {/* Length input - takes 1 column (25%) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Length - Die or Product</label>
              <input
                type="number"
                name="length"
                step="0.01"
                placeholder="Length (inches)"
                value={searchDimensions.length}
                onChange={handleSearchChange}
                onWheel={(e) => e.target.blur()}
                className="border border-gray-300 rounded-md p-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs"
                data-testid="die-length-input"
              />
            </div>
            
            {/* Breadth input - takes 1 column (25%) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Breadth (inches) - Die or Product</label>
              <input
                type="number"
                name="breadth"
                step="0.01"
                placeholder="Breadth (inches)"
                value={searchDimensions.breadth}
                onChange={handleSearchChange}
                onWheel={(e) => e.target.blur()}
                className="border border-gray-300 rounded-md p-2 w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs"
                data-testid="die-breadth-input"
              />
            </div>
          </div>
  
          {/* Dies List */}
          <div className="max-h-40 overflow-y-auto rounded-md bg-white">
            {filteredDies.length > 0 ? (
              filteredDies.map((die) => (
                <div
                  key={die.id}
                  className="p-2 border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectDie(die)}
                  data-testid={`die-option-${die.dieCode}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-gray-800">Die Code: <span className="text-red-600">{die.dieCode}</span></p>
                      <p className="text-[10px] text-gray-600">
                        Die Size: {die.dieSizeL}" × {die.dieSizeB}"
                      </p>
                      <p className="text-[10px] text-gray-600">
                        Product Size: {die.productSizeL || "N/A"}" × {die.productSizeB || "N/A"}"
                      </p>
                      <p className="text-[10px] text-gray-600">
                        Type: {die.type || "N/A"} | Frags: {die.frags || "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {die.imageUrl && (
                        <img
                          src={die.imageUrl}
                          alt="Die"
                          className="w-16 h-16 object-contain border rounded"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-white border-b text-sm text-gray-600 text-center">
                {selectedJobType === "Custom" 
                  ? "No dies found matching your search criteria."
                  : selectedJobType === "Card"
                  ? "No Card or Biz Card dies found matching your search criteria."
                  : `No dies found for ${selectedJobType} matching your search criteria.`
                }
              </div>
            )}
          </div>
        </>
      ) : (
        // Selected Die Display
        <div className="flex justify-between items-center bg-white">
          <div className="flex items-center space-x-3 overflow-hidden flex-grow">
            {/* Die Image */}
            {selectedDie.image && (
              <div className="flex-shrink-0">
                <img
                  src={selectedDie.image}
                  alt={`Die ${selectedDie.dieCode}`}
                  className="w-12 h-12 object-contain border rounded-md bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Die Information */}
            <div className="flex items-center space-x-2 overflow-hidden flex-grow">
              <div className="text-sm font-medium flex items-center space-x-2">
                <span className="text-gray-700">Die Code:</span>
                <span className="text-red-600" data-testid="selected-die-code">{selectedDie.dieCode || "SS-4"}</span>
              </div>
              
              <div className="border-l border-gray-300 pl-2 text-xs flex-grow overflow-hidden">
                <span className="inline-block text-gray-700">
                  <span className="font-medium">Die Size:</span> {selectedDie.dieSize?.length || "7"}" × {selectedDie.dieSize?.breadth || "3"}" 
                </span>
                <span className="inline-block mx-1 text-gray-400">|</span>
                <span className="inline-block text-gray-700">
                  <span className="font-medium">Product Size:</span> {selectedDie.productSize?.length || "7"}" × {selectedDie.productSize?.breadth || "3"}"
                </span>
                <span className="inline-block mx-1 text-gray-400">|</span>
                <span className="inline-block text-gray-700">
                  <span className="font-medium">Type:</span> {(selectedDie.type) || "H/circle"}
                </span>
                <span className="inline-block mx-1 text-gray-400">|</span>
                <span className="inline-block text-gray-700">
                  <span className="font-medium">Frags:</span> {selectedDie.frags || "1"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            <button
              onClick={handleChangeDie}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
              data-testid="change-die-button"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Hidden input to store selected die info for form submission */}
      <input 
        type="hidden" 
        name="dieCode" 
        value={selectedDieState.dieCode || ""} 
        data-testid="hidden-die-code-input"
      />
      <input 
        type="hidden" 
        name="dieSizeLength" 
        value={selectedDieState.dieSize?.length || ""} 
      />
      <input 
        type="hidden" 
        name="dieSizeBreadth" 
        value={selectedDieState.dieSize?.breadth || ""} 
      />
      <input 
        type="hidden" 
        name="productSizeLength" 
        value={selectedDieState.productSize?.length || ""} 
      />
      <input 
        type="hidden" 
        name="productSizeBreadth" 
        value={selectedDieState.productSize?.breadth || ""} 
      />
      <input 
        type="hidden" 
        name="frags" 
        value={selectedDieState.frags || ""} 
      />
    </div>
  );
};

export default InlineDieSelection;