import React from "react";
import { SelectInput } from "../../shared/FormFields";
import SearchBar from "../../shared/SearchBar";
import Button from "../../shared/Button";

const DieSearch = ({ searchParams, setSearchParams, filterOptions }) => {
  const { jobTypes = [], dieTypes = [] } = filterOptions;
  
  const handleSearch = (term) => {
    setSearchParams(prev => ({
      ...prev,
      term
    }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setSearchParams(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [name]: value
      }
    }));
  };
  
  const clearFilters = () => {
    setSearchParams({
      term: "",
      filters: {
        jobType: "",
        type: ""
      }
    });
  };
  
  // Prepare filter options for select inputs
  const jobTypeOptions = jobTypes.map(type => ({ value: type, label: type }));
  const typeOptions = dieTypes.map(type => ({ value: type, label: type }));

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search Input */}
        <div className="md:col-span-2">
          <SearchBar
            placeholder="Search die code or type..."
            onSearch={handleSearch}
            initialValue={searchParams.term}
            searchImmediately={true}
          />
        </div>
        
        {/* Job Type Filter */}
        <SelectInput
          label="Filter by Job Type"
          name="jobType"
          value={searchParams.filters.jobType}
          onChange={handleFilterChange}
          options={jobTypeOptions}
          placeholder="All Job Types"
        />
        
        {/* Clear Filters Button */}
        <div>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Die Type Filter */}
        <SelectInput
          label="Filter by Die Type"
          name="type"
          value={searchParams.filters.type}
          onChange={handleFilterChange}
          options={typeOptions}
          placeholder="All Die Types"
        />
        
        {/* Additional filters could go here */}
        <div className="col-span-2 flex items-end">
          <div className="text-sm text-gray-500 italic mt-auto mb-3">
            {searchParams.term || Object.values(searchParams.filters).some(v => v) 
              ? "Filtered results shown below"
              : "No filters applied"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DieSearch;