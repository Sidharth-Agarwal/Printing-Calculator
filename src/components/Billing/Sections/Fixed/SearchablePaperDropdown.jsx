import React, { useState, useEffect, useRef } from "react";

const SearchablePaperDropdown = ({ papers, selectedPaper, onChange, compact = false, isDieSelected = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [selectedDetails, setSelectedDetails] = useState({});

  // Get the selected paper object
  const selectedPaperObj = papers.find(paper => paper.paperName === selectedPaper);

  // Keep track of currently selected paper details for debugging
  useEffect(() => {
    if (selectedPaperObj) {
      setSelectedDetails({
        paperName: selectedPaperObj.paperName,
        paperGsm: selectedPaperObj.gsm,
        paperCompany: selectedPaperObj.company
      });
      
      // Log current selection for debugging
      console.log("Current paper selection:", {
        paperName: selectedPaperObj.paperName,
        gsm: selectedPaperObj.gsm,
        company: selectedPaperObj.company
      });
    }
  }, [selectedPaper, selectedPaperObj]);

  const filteredPapers = papers.filter((paper) =>
    paper.paperName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Updated to pass the entire paper object instead of just the name
  const handleSelect = (paper) => {
    // Log the selection for debugging
    console.log("Paper selected:", {
      paperName: paper.paperName,
      gsm: paper.gsm,
      company: paper.company
    });
    
    // Create a proper synthetic event to pass to onChange
    const syntheticEvent = { 
      target: { 
        name: "paperDetails", 
        value: {
          paperName: paper.paperName,
          paperGsm: paper.gsm,
          paperCompany: paper.company
        } 
      } 
    };
    
    // Call the parent component's onChange handler with our synthetic event
    onChange(syntheticEvent);
    
    // Close the dropdown and reset search
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
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selected paper display (closed state) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 rounded-md p-2 w-full text-sm flex justify-between items-center cursor-pointer bg-white hover:border-gray-400 transition-colors"
        data-testid="paper-dropdown-selector"
      >
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-medium">{selectedPaper || "Select Paper"}</span>
          {selectedPaperObj && (
            <span className="text-xs text-gray-500 truncate">
              {selectedPaperObj.company} | {selectedPaperObj.gsm}gsm
            </span>
          )}
        </div>
        <span className="ml-2 text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {/* Dropdown (open state) - Conditional positioning based on die selection */}
      {isOpen && (
        <div className={`w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ${
          isDieSelected ? 'mt-1' : 'absolute z-10 mt-1'
        }`}>
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search papers..."
                className="border border-gray-300 rounded-md pl-8 pr-2 py-1.5 w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                data-testid="paper-search-input"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Results */}
          <div>
            {filteredPapers.length > 0 ? (
              filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className={`p-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedPaper === paper.paperName ? "bg-red-50" : ""
                  }`}
                  onClick={() => handleSelect(paper)}
                  data-testid={`paper-option-${paper.paperName}`}
                >
                  <div className="flex flex-col">
                    <span className={`font-medium ${selectedPaper === paper.paperName ? "text-red-700" : "text-gray-800"}`}>
                      {paper.paperName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {paper.company} | {paper.gsm}gsm
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500 text-center">No papers found</div>
            )}
          </div>
        </div>
      )}

      {/* Hidden debug info - can be removed in production */}
      {process.env.NODE_ENV === 'development' && (
        <input 
          type="hidden" 
          name="paperName" 
          value={selectedDetails.paperName || ""} 
          data-gsm={selectedDetails.paperGsm || ""}
          data-company={selectedDetails.paperCompany || ""}
        />
      )}
    </div>
  );
};

export default SearchablePaperDropdown;