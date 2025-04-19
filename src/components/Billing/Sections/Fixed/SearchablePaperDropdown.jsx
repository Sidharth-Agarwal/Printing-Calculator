import React, { useState, useEffect, useRef } from "react";

const SearchablePaperDropdown = ({ papers, selectedPaper, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Get the selected paper object
  const selectedPaperObj = papers.find(paper => paper.paperName === selectedPaper);

  const filteredPapers = papers.filter((paper) =>
    paper.paperName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (paperName) => {
    onChange({ target: { name: "paperName", value: paperName } });
    setIsOpen(false);
    setSearchTerm("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected paper display (closed state) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border rounded-md p-2 w-full text-sm flex justify-between items-center cursor-pointer bg-white"
      >
        <div className="flex flex-col">
          <span>{selectedPaper || "Select Paper"}</span>
          {selectedPaperObj && (
            <span className="text-xs text-gray-500">
              {selectedPaperObj.company} | {selectedPaperObj.gsm}gsm | {selectedPaperObj.finalRate} INR
            </span>
          )}
        </div>
        <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
      </div>

      {/* Dropdown (open state) */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Search input */}
          <div className="sticky top-0 bg-white p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search papers..."
              className="border rounded-md p-2 w-full text-sm"
            />
          </div>

          {/* Results */}
          <div>
            {filteredPapers.length > 0 ? (
              filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedPaper === paper.paperName ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleSelect(paper.paperName)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{paper.paperName}</span>
                    <span className="text-xs text-gray-500">
                      {paper.company} | {paper.gsm}gsm | {paper.finalRate} INR
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">No papers found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchablePaperDropdown;