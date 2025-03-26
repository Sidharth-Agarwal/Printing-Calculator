import React from "react";
import { SelectInput } from "../../shared/FormFields";
import SearchBar from "../../shared/SearchBar";
import Button from "../../shared/Button";

const PaperSearch = ({ searchParams, setSearchParams, filterOptions }) => {
  const { companies = [], paperTypes = [], gsmValues = [] } = filterOptions;
  
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
        company: "",
        gsm: "",
        paperType: ""
      }
    });
  };
  
  // Prepare filter options for select inputs
  const companyOptions = companies.map(company => ({ value: company, label: company }));
  const paperTypeOptions = paperTypes.map(type => ({ 
    value: type, 
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));
  const gsmOptions = gsmValues.map(gsm => ({ value: gsm.toString(), label: gsm.toString() }));

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search Input */}
        <div className="md:col-span-2">
          <SearchBar
            placeholder="Search paper name or company..."
            onSearch={handleSearch}
            initialValue={searchParams.term}
            searchImmediately={true}
          />
        </div>
        
        {/* Company Filter */}
        <SelectInput
          label="Filter by Company"
          name="company"
          value={searchParams.filters.company}
          onChange={handleFilterChange}
          options={companyOptions}
          placeholder="All Companies"
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
        {/* Paper Type Filter */}
        <SelectInput
          label="Filter by Paper Type"
          name="paperType"
          value={searchParams.filters.paperType}
          onChange={handleFilterChange}
          options={paperTypeOptions}
          placeholder="All Paper Types"
        />
        
        {/* GSM Filter */}
        <SelectInput
          label="Filter by GSM"
          name="gsm"
          value={searchParams.filters.gsm}
          onChange={handleFilterChange}
          options={gsmOptions}
          placeholder="All GSM Values"
        />
        
        {/* Additional filter could go here */}
        <div className="flex items-end">
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

export default PaperSearch;