import React, { useState, useRef, useEffect } from 'react';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  isSearchable = false,
  isMulti = false,
  isDisabled = false,
  error = '',
  required = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Handle outside clicks
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable]);
  
  // Filter options based on search term
  const filteredOptions = isSearchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;
  
  // Handle single select
  const handleSelect = (option) => {
    if (isDisabled) return;
    
    if (isMulti) {
      // For multi-select, toggle the selected option
      const selected = Array.isArray(value) ? value : [];
      const isSelected = selected.some(item => item.value === option.value);
      
      if (isSelected) {
        onChange(selected.filter(item => item.value !== option.value));
      } else {
        onChange([...selected, option]);
      }
    } else {
      // For single select, set the selected option and close dropdown
      onChange(option);
      setIsOpen(false);
    }
    
    if (!isMulti) {
      setSearchTerm('');
    }
  };
  
  // Check if an option is selected
  const isSelected = (option) => {
    if (isMulti && Array.isArray(value)) {
      return value.some(item => item.value === option.value);
    }
    return value && value.value === option.value;
  };
  
  // Toggle the dropdown
  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Clear the selection
  const clearSelection = (e) => {
    e.stopPropagation();
    onChange(isMulti ? [] : null);
    setSearchTerm('');
  };
  
  // Render selected value(s)
  const renderValue = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-gray-400">{placeholder}</span>;
    }
    
    if (isMulti && Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400">{placeholder}</span>;
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {value.map(item => (
            <div key={item.value} className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs flex items-center">
              {item.label}
              <button
                type="button"
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(item);
                }}
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      );
    }
    
    return <span>{value.label}</span>;
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div ref={containerRef} className="relative">
        {/* Selected Value Display */}
        <div
          onClick={toggleDropdown}
          className={`w-full bg-white border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            isDisabled ? 'bg-gray-100 text-gray-500' : ''
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
        >
          <div className="flex items-center justify-between">
            {renderValue()}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
        
        {/* Dropdown */}
        {isOpen && (
          <div className="absolute mt-1 w-full z-10 bg-white shadow-lg max-h-60 rounded-md overflow-auto focus:outline-none">
            {/* Search input */}
            {isSearchable && (
              <div className="sticky top-0 z-10 bg-white p-2 border-b">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search..."
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            {/* Options list */}
            <ul className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`px-3 py-2 cursor-pointer text-sm ${
                      isSelected(option)
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    {isMulti && (
                      <input
                        type="checkbox"
                        checked={isSelected(option)}
                        readOnly
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    )}
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-gray-500">No options found</li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;