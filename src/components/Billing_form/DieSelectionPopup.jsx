import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const DieSelectionPopup = ({ onClose, onSelect, onAddNewDie }) => {
  const [dies, setDies] = useState([]);
  const [filteredDies, setFilteredDies] = useState([]);
  const [searchDimensions, setSearchDimensions] = useState({
    length: "",
    breadth: "",
  });

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
        setFilteredDies(fetchedDies); // Initially display all dies
      } catch (error) {
        console.error("Error fetching dies:", error);
      }
    };
    fetchDies();
  }, []);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchDimensions((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const { length, breadth } = searchDimensions;
    if (!length || !breadth) {
      alert("Please enter both length and breadth to search!");
      return;
    }

    const matches = dies.filter(
      (die) =>
        parseFloat(die.dieSizeL) === parseFloat(length) &&
        parseFloat(die.dieSizeB) === parseFloat(breadth)
    );

    setFilteredDies(matches);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-[70%] max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Select Die</h2>

        {/* Search Fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Length *</label>
            <input
              type="number"
              name="length"
              placeholder="Enter Length (inches)"
              value={searchDimensions.length}
              onChange={handleSearchChange}
              className="border rounded-md p-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Breadth *</label>
            <input
              type="number"
              name="breadth"
              placeholder="Enter Breadth (inches)"
              value={searchDimensions.breadth}
              onChange={handleSearchChange}
              className="border rounded-md p-2 w-full"
              required
            />
          </div>
        </div>

        {/* Search and Add New Die Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Search
          </button>
          <button
            onClick={onAddNewDie}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Add New Die
          </button>
        </div>

        {/* Display Search Results */}
        {filteredDies.length > 0 ? (
          <div className="space-y-4">
            {filteredDies.map((die) => (
              <div
                key={die.id}
                className="flex justify-between items-center border p-4 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect(die)}
              >
                <div>
                  <p className="text-sm font-medium">Die Code: {die.dieCode}</p>
                  <p className="text-sm">Size: {die.dieSizeL}" x {die.dieSizeB}"</p>
                </div>
                <img
                  src={die.imageUrl || "https://via.placeholder.com/100"}
                  alt="Die"
                  className="w-16 h-16 object-contain border"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {searchDimensions.length && searchDimensions.breadth
              ? "No dies found for the given dimensions."
              : "Enter dimensions to search for dies."}
          </p>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DieSelectionPopup;
