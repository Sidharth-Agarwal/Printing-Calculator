import React, { useState, useEffect } from "react";
import { fetchDies, searchDiesByDimensions } from "../../../services/firebase/dies";
import FormField from "../../common/FormField";
import NumberField from "../fields/NumberField";

const DieSelectionPopup = ({ onClose, onSelectDie, onAddNewDie }) => {
  const [dies, setDies] = useState([]);
  const [filteredDies, setFilteredDies] = useState([]);
  const [searchDimensions, setSearchDimensions] = useState({
    length: "",
    breadth: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all dies on component mount
  useEffect(() => {
    const loadDies = async () => {
      try {
        const diesData = await fetchDies();
        setDies(diesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dies:", error);
        setIsLoading(false);
      }
    };

    loadDies();
  }, []);

  const handleSearchChange = (field, value) => {
    setSearchDimensions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    const { length, breadth } = searchDimensions;
    
    // Check if at least one dimension is provided
    if (!length && !breadth) {
      alert("Please enter at least one dimension (length or breadth) to search!");
      return;
    }

    try {
      // Search dies by dimensions
      const results = await searchDiesByDimensions(length, breadth);
      setFilteredDies(results);
    } catch (error) {
      console.error("Error searching dies:", error);
      alert("Error searching dies. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[70%] max-w-4xl max-h-[90vh] flex flex-col">
        <h2 className="text-md font-semibold mb-4">Select Die</h2>

        {/* Search Fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <FormField label="Length">
            <NumberField
              id="searchLength"
              value={searchDimensions.length}
              onChange={(e) => handleSearchChange("length", e.target.value)}
              placeholder="Enter Length (inches)"
            />
          </FormField>

          <FormField label="Breadth">
            <NumberField
              id="searchBreadth"
              value={searchDimensions.breadth}
              onChange={(e) => handleSearchChange("breadth", e.target.value)}
              placeholder="Enter Breadth (inches)"
            />
          </FormField>
        </div>

        {/* Search and Add New Die Buttons */}
        <div className="flex justify-between items-center mb-6 text-sm">
          <button
            type="button" // Added to prevent form submission
            onClick={handleSearch}
            className="bg-blue-500 text-white px-3 py-2 rounded-md"
          >
            Search
          </button>
          <button
            type="button" // Added to prevent form submission
            onClick={onAddNewDie}
            className="bg-gray-500 text-white px-3 py-2 rounded-md"
          >
            Add New Die
          </button>
        </div>

        {/* Display Search Results */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading dies...</div>
          ) : filteredDies.length > 0 ? (
            filteredDies.map((die) => (
              <div
                key={die.id}
                className="flex justify-between items-center border px-4 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectDie(die)}
              >
                <div>
                  <p className="text-sm font-medium">Die Code: {die.dieCode}</p>
                  <p className="text-sm">
                    Size: {die.dieSizeL}" x {die.dieSizeB}"
                  </p>
                </div>
                <img
                  src={die.imageUrl || "https://via.placeholder.com/100"}
                  alt="Die"
                  className="w-16 h-16 object-contain border"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              {searchDimensions.length || searchDimensions.breadth 
                ? "No dies found for the given dimensions."
                : "Enter dimensions to search for dies."}
            </p>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <button
            type="button" // Added to prevent form submission
            onClick={onClose}
            className="bg-gray-500 text-sm text-white px-3 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DieSelectionPopup;