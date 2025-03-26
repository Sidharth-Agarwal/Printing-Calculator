import React from 'react';

// Text Input
export const TextInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  type = 'text', 
  error = '', 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Select Input
export const SelectInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option', 
  error = '', 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Textarea Input
export const TextareaInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = '', 
  rows = 4, 
  error = '', 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Checkbox Input
export const CheckboxInput = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  error = '', 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          {...props}
        />
        {label && (
          <label 
            htmlFor={name} 
            className="ml-2 block text-sm text-gray-700"
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Radio Group
export const RadioGroup = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  error = '', 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={disabled || option.disabled}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              {...props}
            />
            <label 
              htmlFor={`${name}-${option.value}`} 
              className="ml-2 block text-sm text-gray-700"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Toggle Switch
export const ToggleSwitch = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  error = '', 
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center">
        <label htmlFor={name} className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              className="sr-only"
              {...props}
            />
            <div className={`block w-10 h-6 rounded-full ${
              checked ? 'bg-blue-500' : 'bg-gray-300'
            } ${disabled ? 'opacity-50' : ''}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              checked ? 'transform translate-x-4' : ''
            }`}></div>
          </div>
          {label && <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Number Input with increment/decrement buttons
export const NumberInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  error = '', 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const handleIncrement = () => {
    if (disabled) return;
    const newValue = parseFloat(value || 0) + parseFloat(step);
    if (max !== undefined && newValue > max) return;
    onChange({ target: { name, value: newValue } });
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = parseFloat(value || 0) - parseFloat(step);
    if (min !== undefined && newValue < min) return;
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && parseFloat(value || 0) <= min)}
          className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100 focus:outline-none"
        >
          -
        </button>
        <input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-full px-3 py-2 border text-center text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          {...props}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && parseFloat(value || 0) >= max)}
          className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100 focus:outline-none"
        >
          +
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// DatePicker input wrapper
export const DatePickerInput = ({ 
  label, 
  name, 
  selected, 
  onChange, 
  dateFormat = "dd/MM/yyyy", 
  error = '', 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  // This is a wrapper component that you'll use with your date picker library
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          value={selected ? selected.toLocaleDateString() : ''}
          readOnly
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        {/* Here you would integrate your actual DatePicker component */}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// File Upload Input
export const FileInput = ({ 
  label, 
  name, 
  onChange, 
  accept, 
  error = '', 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={name}
              className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>Upload a file</span>
              <input
                id={name}
                name={name}
                type="file"
                onChange={onChange}
                accept={accept}
                disabled={disabled}
                className="sr-only"
                {...props}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          // Continuing from the FileInput component
          <p className="text-xs text-gray-500">
            {accept ? `${accept.replace(/,/g, ', ')} up to 10MB` : 'File up to 10MB'}
          </p>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Password Input with visibility toggle
export const PasswordInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = 'Enter password', 
  error = '', 
  required = false,
  disabled = false,
  showStrengthMeter = false,
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Simple password strength calculation (can be enhanced)
  const calculateStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };
  
  const getStrengthLabel = (strength) => {
    if (strength === 0) return 'Very Weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    if (strength === 4) return 'Strong';
    return 'Very Strong';
  };
  
  const getStrengthColor = (strength) => {
    if (strength === 0) return 'bg-red-500';
    if (strength === 1) return 'bg-red-400';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-yellow-400';
    if (strength === 4) return 'bg-green-400';
    return 'bg-green-500';
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const strength = showStrengthMeter ? calculateStrength(value) : 0;
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={toggleShowPassword}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      
      {/* Password Strength Meter */}
      {showStrengthMeter && value && (
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${getStrengthColor(strength)} h-2 rounded-full transition-all duration-300`} 
                style={{ width: `${(strength / 5) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-gray-600">{getStrengthLabel(strength)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Multi-select Input with chips/tags display
export const ChipInput = ({
  label,
  name,
  value = [],
  onChange,
  placeholder = 'Type and press Enter',
  error = '',
  required = false,
  disabled = false,
  suggestions = [],
  maxTags = null,
  className = '',
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Handle outside clicks for suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) && 
      !value.includes(suggestion)
  );
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      removeTag(value.length - 1);
    }
  };
  
  const addTag = (tag) => {
    const normalizedTag = tag.trim();
    if (normalizedTag && !value.includes(normalizedTag)) {
      if (maxTags === null || value.length < maxTags) {
        const newValue = [...value, normalizedTag];
        onChange({ target: { name, value: newValue } });
      }
    }
    setInputValue('');
    setShowSuggestions(false);
  };
  
  const removeTag = (index) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange({ target: { name, value: newValue } });
  };
  
  const selectSuggestion = (suggestion) => {
    addTag(suggestion);
    inputRef.current.focus();
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
          {maxTags !== null && (
            <span className="text-xs text-gray-500 ml-1">
              ({value.length}/{maxTags})
            </span>
          )}
        </label>
      )}
      <div 
        className={`flex flex-wrap items-center p-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        } focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500`}
      >
        {/* Tags display */}
        {value.map((tag, index) => (
          <div 
            key={index} 
            className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm mr-2 mb-2"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                onClick={() => removeTag(index)}
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          id={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={maxTags !== null && value.length >= maxTags ? '' : placeholder}
          disabled={disabled || (maxTags !== null && value.length >= maxTags)}
          className="flex-1 outline-none text-sm min-w-[120px] p-1 bg-transparent"
          {...props}
        />
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto z-10"
        >
          <ul>
            {filteredSuggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Color Picker Input
export const ColorInput = ({
  label,
  name,
  value,
  onChange,
  error = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  
  // Handle outside clicks to close the color picker
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  const togglePicker = () => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="flex items-center">
          {/* Color preview */}
          <div 
            className="w-8 h-8 border border-gray-300 rounded-md mr-2 cursor-pointer"
            style={{ backgroundColor: value }}
            onClick={togglePicker}
          ></div>
          
          {/* Color input field */}
          <input
            id={name}
            name={name}
            type="text"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`flex-1 px-3 py-2 border rounded-md shadow-sm text-sm ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            {...props}
          />
          
          {/* Native color picker for easy selection */}
          <input
            type="color"
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
          />
        </div>
        
        {/* Color picker dropdown (simplified - you might want to use a library) */}
        {showPicker && (
          <div 
            ref={pickerRef}
            className="absolute mt-1 left-0 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-10"
          >
            <input
              type="color"
              value={value}
              onChange={onChange}
              className="w-full h-32 cursor-pointer border-none p-0"
            />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Autocomplete Input
export const AutocompleteInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = 'Type to search',
  options = [],
  error = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef(null);
  const optionsRef = useRef(null);
  
  // Update input value when value changes externally
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      setInputValue(selectedOption ? selectedOption.label : '');
    } else {
      setInputValue('');
    }
  }, [value, options]);
  
  // Filter options based on input
  useEffect(() => {
    const filtered = options.filter(option => 
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [inputValue, options]);
  
  // Handle outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target) && 
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowOptions(true);
    
    // Clear the selected value if input is cleared
    if (e.target.value === '') {
      onChange({ target: { name, value: '' } });
    }
  };
  
  const handleSelectOption = (option) => {
    setInputValue(option.label);
    onChange({ target: { name, value: option.value } });
    setShowOptions(false);
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowOptions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          {...props}
        />
        
        {/* Options dropdown */}
        {showOptions && filteredOptions.length > 0 && (
          <ul 
            ref={optionsRef}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
          >
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelectOption(option)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-sm"
              >
                {option.label}
                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Address Input (structured input for addresses)
export const AddressInput = ({
  label,
  value = {},
  onChange,
  error = {},
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const handleChange = (field, val) => {
    onChange({
      ...value,
      [field]: val
    });
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="space-y-3">
        <TextInput
          name="addressLine1"
          placeholder="Address Line 1"
          value={value.addressLine1 || ''}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          error={error.addressLine1}
          disabled={disabled}
          required={required}
        />
        <TextInput
          name="addressLine2"
          placeholder="Address Line 2 (Optional)"
          value={value.addressLine2 || ''}
          onChange={(e) => handleChange('addressLine2', e.target.value)}
          error={error.addressLine2}
          disabled={disabled}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            name="city"
            placeholder="City"
            value={value.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            error={error.city}
            disabled={disabled}
            required={required}
          />
          <TextInput
            name="state"
            placeholder="State/Province"
            value={value.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            error={error.state}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            name="postalCode"
            placeholder="Postal Code"
            value={value.postalCode || ''}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            error={error.postalCode}
            disabled={disabled}
            required={required}
          />
          <TextInput
            name="country"
            placeholder="Country"
            value={value.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            error={error.country}
            disabled={disabled}
            required={required}
          />
        </div>
      </div>
    </div>
  );
};

// Dimensions Input (for length x breadth inputs)
export const DimensionsInput = ({
  label,
  value = { length: '', breadth: '' },
  onChange,
  error = {},
  required = false,
  disabled = false,
  unit = 'cm',
  className = '',
  ...props
}) => {
  const handleChange = (dimension, val) => {
    onChange({
      ...value,
      [dimension]: val
    });
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <input
            type="number"
            value={value.length}
            onChange={(e) => handleChange('length', e.target.value)}
            placeholder="Length"
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
              error.length ? 'border-red-500' : 'border-gray-300'
            } ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            {...props}
          />
          {error.length && <p className="mt-1 text-xs text-red-500">{error.length}</p>}
        </div>
        <span className="text-gray-500">×</span>
        <div className="flex-1">
          <input
            type="number"
            value={value.breadth}
            onChange={(e) => handleChange('breadth', e.target.value)}
            placeholder="Breadth"
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm ${
              error.breadth ? 'border-red-500' : 'border-gray-300'
            } ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            } focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            {...props}
          />
          {error.breadth && <p className="mt-1 text-xs text-red-500">{error.breadth}</p>}
        </div>
        <span className="text-gray-500 flex-shrink-0">{unit}</span>
      </div>
    </div>
  );
};