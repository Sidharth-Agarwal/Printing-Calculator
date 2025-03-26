import React from "react";
import { SelectInput } from "../../shared/FormFields";
import SearchBar from "../../shared/SearchBar";
import Button from "../../shared/Button";

const MaterialSearch = ({ searchParams, setSearchParams, filterOptions }) => {
  const { materialTypes = [], suppliers = [] } = filterOptions;
  
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
        materialType: "",
        supplier: ""
      }
    });
  };
  
  // Prepare filter options for select inputs
  const materialTypeOptions = materialTypes.map(type => ({ 
    value: type, 
    label: type.charAt(0).toUpperCase() + type.slice(1) 
  }));
  
  const supplierOptions = suppliers.map(supplier => ({ 
    value: supplier, 
    label: supplier 
  }));

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search Input */}
        <div className="md:col-span-2">
          <SearchBar
            placeholder="Search by name, type, or supplier..."
            onSearch={handleSearch}
            initialValue={searchParams.term}
            searchImmediately={true}
          />
        </div>
        
        {/* Material Type Filter */}
        <SelectInput
          label="Filter by Material Type"
          name="materialType"
          value={searchParams.filters.materialType}
          onChange={handleFilterChange}
          options={materialTypeOptions}
          placeholder="All Material Types"
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Supplier Filter */}
        <SelectInput
          label="Filter by Supplier"
          name="supplier"
          value={searchParams.filters.supplier}
          onChange={handleFilterChange}
          options={supplierOptions}
          placeholder="All Suppliers"
        />
        
        {/* Additional filters could go here */}
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

export default MaterialSearch;