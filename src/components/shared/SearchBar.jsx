import React, { useState } from 'react';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search...', 
  initialValue = '',
  className = '',
  searchImmediately = false,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchImmediately) {
      onSearch(value);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} {...props}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          type="search"
          className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
        />
        
        {searchTerm && (
          <button 
            type="button"
            className="absolute inset-y-0 right-10 flex items-center pr-3"
            onClick={handleClear}
          >
            <svg 
              className="w-4 h-4 text-gray-500 hover:text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      
      {!searchImmediately && (
        <button 
          type="submit"
          className="absolute right-0 top-0 bottom-0 px-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Search
        </button>
      )}
    </form>
  );
};

export default SearchBar;