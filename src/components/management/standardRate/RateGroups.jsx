import React from "react";
import SearchBar from "../../shared/SearchBar";
import Button from "../../shared/Button";

const RateGroups = ({ 
  groups = [], 
  activeGroup, 
  setActiveGroup, 
  searchTerm, 
  setSearchTerm,
  onClearFilters
}) => {
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleGroupClick = (group) => {
    setActiveGroup(group);
  };

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search bar */}
        <div className="flex-1">
          <SearchBar
            placeholder="Search rates..."
            onSearch={handleSearch}
            initialValue={searchTerm}
            searchImmediately={true}
          />
        </div>
        
        {/* Clear filters button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="md:w-auto w-full"
        >
          Clear Filters
        </Button>
      </div>
      
      {/* Group filters */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Filter by Group:</p>
        <div className="flex flex-wrap gap-2">
          <button
            className={`text-sm px-3 py-1 rounded-full ${
              activeGroup === "all"
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
            }`}
            onClick={() => handleGroupClick("all")}
          >
            All Groups
          </button>
          
          {groups.map((group) => (
            <button
              key={group}
              className={`text-sm px-3 py-1 rounded-full ${
                activeGroup === group
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              }`}
              onClick={() => handleGroupClick(group)}
            >
              {group}
            </button>
          ))}
          
          {groups.length === 0 && (
            <span className="text-sm text-gray-500">No groups available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateGroups;