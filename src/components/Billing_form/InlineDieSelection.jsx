import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const InlineDieSelection = ({ selectedDie, onDieSelect }) => {
  const [dies, setDies] = useState([]);
  const [filteredDies, setFilteredDies] = useState([]);
  const [searchDimensions, setSearchDimensions] = useState({
    length: "",
    breadth: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelectionUI, setShowSelectionUI] = useState(true);

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

  return (
    <div className="relative border rounded-md p-3 bg-gray-50">
      {showSelectionUI ? (
        // Die Selection UI
        <>
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
            <button
              onClick={handleChangeDie}
              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
            >
              Change Die
            </button>
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