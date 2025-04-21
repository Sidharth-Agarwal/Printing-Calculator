import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
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
  
  // New Die Form State
  const [newDieData, setNewDieData] = useState({
    jobType: "",
    type: "",
    dieCode: "",
    frags: "",
    productSizeL: "",
    productSizeB: "",
    dieSizeL: "",
    dieSizeB: "",
    price: "",
  });
  const [dieImage, setDieImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const jobTypeOptions = ["Card", "Biz Card", "Magnet", "Envelope"];

  // Fetch dies from Firestore
  useEffect(() => {
    const fetchDies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "dies"));
        const fetchedDies = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDies(fetchedDies);
      } catch (error) {
        console.error("Error fetching dies:", error);
      }
    };
    fetchDies();
  }, []);

  // When a die is selected (has dieCode), hide selection UI
  useEffect(() => {
    if (selectedDie.dieCode) {
      setShowSelectionUI(false);
    }
  }, [selectedDie.dieCode]);

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
      performSearch(searchDimensions);
      return;
    }
    
    // Filter dies based on text search
    const matches = dies.filter(die => 
      (die.dieCode && die.dieCode.toLowerCase().includes(term)) ||
      (die.jobType && die.jobType.toLowerCase().includes(term))
    );
    
    setFilteredDies(matches);
  };

  const performSearch = (dimensions) => {
    const { length, breadth } = dimensions;
    
    // If both fields are empty and no search term, don't show any results
    if (!length && !breadth && !searchTerm) {
      setFilteredDies([]);
      return;
    }

    let matches = [];

    // Text search takes precedence if present
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      matches = dies.filter(die => 
        (die.dieCode && die.dieCode.toLowerCase().includes(term)) ||
        (die.jobType && die.jobType.toLowerCase().includes(term))
      );
    }
    // Otherwise search by dimensions
    else {
      // Case 1: Both length and breadth provided
      if (length && breadth) {
        matches = dies.filter(
          (die) =>
            parseFloat(die.dieSizeL) === parseFloat(length) &&
            parseFloat(die.dieSizeB) === parseFloat(breadth)
        );
      }
      // Case 2: Only length provided
      else if (length && !breadth) {
        matches = dies.filter(
          (die) => parseFloat(die.dieSizeL) === parseFloat(length)
        );
      }
      // Case 3: Only breadth provided
      else if (!length && breadth) {
        matches = dies.filter(
          (die) => parseFloat(die.dieSizeB) === parseFloat(breadth)
        );
      }
    }

    setFilteredDies(matches);
  };

  const handleSelectDie = (die) => {
    onDieSelect({
      dieSelection: die.dieName || "",
      dieCode: die.dieCode || "",
      dieSize: { length: die.dieSizeL || "", breadth: die.dieSizeB || "" },
      image: die.imageUrl || "",
    });
    
    // Hide selection UI after die is selected
    setShowSelectionUI(false);
  };

  // Show selection UI again when "Change Die" is clicked
  const handleChangeDie = () => {
    setShowSelectionUI(true);
    // Reset search fields
    setSearchTerm("");
    setSearchDimensions({ length: "", breadth: "" });
    setFilteredDies([]);
  };
  
  // New Die Form Handlers
  const handleDieFormChange = (e) => {
    const { name, value } = e.target;
    setNewDieData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setDieImage(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setNewDieData({
      jobType: "",
      type: "",
      dieCode: "",
      frags: "",
      productSizeL: "",
      productSizeB: "",
      dieSizeL: "",
      dieSizeB: "",
      price: "",
    });
    setDieImage(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };
  
  const handleAddDie = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    try {
      setIsSubmitting(true);
      let imageUrl = "";
      
      // Upload image if selected
      if (dieImage) {
        const imageRef = ref(storage, `dieImages/${newDieData.dieCode}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, dieImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      // Create die document
      const newDie = {
        ...newDieData,
        imageUrl,
        timestamp: new Date()
      };
      
      // Add to Firestore
      const diesCollection = collection(db, "dies");
      const docRef = await addDoc(diesCollection, newDie);
      
      // Add the new die to the local state
      const dieWithId = { id: docRef.id, ...newDie };
      setDies(prev => [...prev, dieWithId]);
      
      // Select the newly added die
      handleSelectDie(dieWithId);
      
      // Close form and reset
      setShowAddDieForm(false);
      resetForm();
      
      // Use a less intrusive notification instead of alert
      // alert("Die added successfully!");
      console.log("Die added successfully:", dieWithId);
    } catch (error) {
      console.error("Error adding die:", error);
      alert("Failed to add die. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Modal for Add Die Form - Using a Portal approach would be better in production */}
      {showAddDieForm && (
        <div 
          className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center" 
          onClick={(e) => {
            e.stopPropagation();
            setShowAddDieForm(false);
          }}
        >
          <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setShowAddDieForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
            >
              <span className="text-2xl font-bold">&times;</span>
            </button>
            
            {/* Add Die Form matching the style in the screenshot */}
            <form onSubmit={handleAddDie} className="p-6" noValidate>
              <div className="mb-5">
                <h3 className="text-lg font-medium">Add New Die</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type:</label>
                  <select
                    name="jobType"
                    value={newDieData.jobType}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    required
                  >
                    <option value="">Select Job Type</option>
                    {jobTypeOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Type:</label>
                  <input
                    type="text"
                    name="type"
                    value={newDieData.type}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    placeholder="Enter the type of the die"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Die Code:</label>
                  <input
                    type="text"
                    name="dieCode"
                    value={newDieData.dieCode}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    placeholder="Enter die code"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Frags:</label>
                  <input
                    type="number"
                    name="frags"
                    value={newDieData.frags}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    placeholder="Enter number of frags"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Product Size L (in):</label>
                  <input
                    type="number"
                    step="0.01"
                    name="productSizeL"
                    value={newDieData.productSizeL || ""}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    placeholder="Enter length of the product"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Product Size B (in):</label>
                  <input
                    type="number"
                    step="0.01"
                    name="productSizeB"
                    value={newDieData.productSizeB || ""}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    placeholder="Enter breadth of the product"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Die Size L (in):</label>
                  <input
                    type="number"
                    step="0.01"
                    name="dieSizeL"
                    value={newDieData.dieSizeL}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    placeholder="Enter length of the die"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Die Size B (in):</label>
                  <input
                    type="number"
                    step="0.01"
                    name="dieSizeB"
                    value={newDieData.dieSizeB}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    placeholder="Enter breadth of the die"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Price (INR):</label>
                  <input
                    type="number"
                    name="price"
                    value={newDieData.price}
                    onChange={handleDieFormChange}
                    className="border text-md rounded-md p-2 w-full"
                    placeholder="Enter price of the die"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Image:</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="w-full"
                  />
                  {dieImage && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(dieImage)} 
                        alt="Die Preview" 
                        className="w-16 h-16 object-cover border rounded" 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button" // Changed from submit to button
                  onClick={handleAddDie}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    "Add New Die"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDieForm(false)}
                  className="ml-3 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSelectionUI ? (
        // Die Selection UI
        <>
          {/* New "Add Die" button at the top */}
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setShowAddDieForm(true)}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded flex items-center gap-1"
            >
              <span>+</span> New Die
            </button>
          </div>
          
          {/* Search Fields */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Search by Code or Job Type</label>
            <input
              type="text"
              placeholder="Type to search by die code or job type"
              value={searchTerm}
              onChange={handleTextSearch}
              className="border text-sm rounded-md p-2 w-full"
            />
          </div>

          <div className="text-xs text-gray-500 mb-2">- OR -</div>
          
          {/* Search by dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1">Length (inches)</label>
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
              <label className="block text-sm mb-1">Breadth (inches)</label>
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

          {/* Search Results */}
          <div className="max-h-60 overflow-y-auto border rounded-md bg-white">
            {filteredDies.length > 0 ? (
              filteredDies.map((die) => (
                <div
                  key={die.id}
                  className="flex justify-between items-center p-3 border-b hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleSelectDie(die)}
                >
                  <div>
                    <p className="text-sm font-medium">Die Code: {die.dieCode}</p>
                    <p className="text-xs text-gray-600">
                      Size: {die.dieSizeL}" × {die.dieSizeB}"
                    </p>
                    <p className="text-xs text-gray-600">
                      Job Type: {die.jobType || "Not specified"}
                    </p>
                  </div>
                  {die.imageUrl && (
                    <img
                      src={die.imageUrl}
                      alt="Die"
                      className="w-16 h-16 object-contain border rounded"
                    />
                  )}
                </div>
              ))
            ) : (searchDimensions.length || searchDimensions.breadth || searchTerm) ? (
              <div className="p-3 bg-white border-b text-sm text-gray-600">
                No dies found matching your search criteria.
              </div>
            ) : (
              <div className="p-3 bg-white border-b text-sm text-gray-600">
                Enter search criteria above to find dies.
              </div>
            )}
          </div>
        </>
      ) : (
        // Selected Die Display - Compact View with Change Button
        <div className="p-3 bg-white border rounded-md">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Selected Die:</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddDieForm(true)}
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
            <div>
              <p className="text-sm"><strong>Die Code:</strong> {selectedDie.dieCode}</p>
              <p className="text-xs text-gray-600">
                <strong>Size:</strong> {selectedDie.dieSize.length}" × {selectedDie.dieSize.breadth}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineDieSelection;