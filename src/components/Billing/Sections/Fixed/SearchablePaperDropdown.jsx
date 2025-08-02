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
      console.log("SearchablePaperDropdown - Current paper selection:", {
        paperName: selectedPaperObj.paperName,
        gsm: selectedPaperObj.gsm,
        company: selectedPaperObj.company
      });
    } else {
      // Clear selected details if no paper is selected
      setSelectedDetails({});
    }
  }, [selectedPaper, selectedPaperObj]);

  const filteredPapers = papers.filter((paper) =>
    paper.paperName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (paper) => {
    console.log("SearchablePaperDropdown - handleSelect called with paper:", paper);
    console.log("SearchablePaperDropdown - onChange function:", onChange);
    
    try {
      // Create a synthetic event with complete paper data
      const syntheticEvent = { 
        target: { 
          name: "paperSelection", // Changed to indicate complete paper data
          value: {
            paperName: paper.paperName,
            paperGsm: paper.gsm,
            paperCompany: paper.company
          }
        } 
      };
      
      console.log("SearchablePaperDropdown - Calling onChange with complete paper data:", syntheticEvent);
      
      // Call the parent component's onChange handler
      if (onChange && typeof onChange === 'function') {
        onChange(syntheticEvent);
        console.log("SearchablePaperDropdown - onChange called successfully with complete data");
      } else {
        console.error("SearchablePaperDropdown - onChange is not a function:", onChange);
      }
      
      // Close the dropdown and reset search
      setIsOpen(false);
      setSearchTerm("");
      
    } catch (error) {
      console.error("SearchablePaperDropdown - Error in handleSelect:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(""); // Clear search when closing
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

  // Clear search term when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selected paper display (closed state) - Updated for consistent height */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 rounded-md px-2 py-1 w-full text-xs flex justify-between items-center cursor-pointer bg-white hover:border-gray-400 transition-colors h-[36px]"
        data-testid="paper-dropdown-selector"
      >
        <div className="flex-1 overflow-hidden">
          {selectedPaperObj ? (
            <span className="truncate font-medium block leading-tight">
              {selectedPaper} ({selectedPaperObj.company} | {selectedPaperObj.gsm}gsm)
            </span>
          ) : (
            <span className="text-gray-500 block leading-tight">Select Paper</span>
          )}
        </div>
        <span className="ml-2 text-gray-500 flex-shrink-0">
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
                className="border border-gray-300 rounded-md pl-6 pr-2 py-1.5 w-full text-xs focus:outline-none focus:ring-1"
                data-testid="paper-search-input"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 absolute left-2.5 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className={`p-1 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedPaper === paper.paperName ? "bg-red-50" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("SearchablePaperDropdown - Paper option clicked:", paper.paperName, "GSM:", paper.gsm, "Company:", paper.company);
                    handleSelect(paper);
                  }}
                  data-testid={`paper-option-${paper.paperName}`}
                >
                  <div className="flex flex-col text-[12px]">
                    <span className={`font-medium ${selectedPaper === paper.paperName ? "text-red-700" : "text-gray-800"}`}>
                      {paper.paperName}
                    </span>
                    <span className="text-gray-500">
                      {paper.company} | {paper.gsm}gsm
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500 text-center">
                {searchTerm ? `No papers found matching "${searchTerm}"` : "No papers found"}
              </div>
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