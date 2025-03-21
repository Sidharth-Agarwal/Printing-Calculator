// components/billing-form/utils/FormSectionWrapper.jsx
import React, { useState, useEffect } from 'react';
import FormToggle from '../fields/FormToggle';

/**
 * Higher-Order Component (HOC) to standardize section behavior
 * This ensures all sections handle toggles and local state consistently
 * 
 * @param {React.Component} WrappedComponent - Section component to wrap
 * @param {Object} options - Configuration options
 * @returns {React.Component} - Enhanced section component
 */
const FormSectionWrapper = (WrappedComponent, options = {}) => {
  // Default options
  const {
    // Section ID (e.g., "lpDetails", "fsDetails")
    sectionId = null,
    
    // Toggle field name (default is "is[SectionName]Used")
    toggleName = null,
    
    // Toggle label (default is "Use [SectionName]?")
    toggleLabel = null,
    
    // Whether to wrap the section content in a container when enabled
    wrapContent = true
  } = options;

  // Determine actual values based on options or defaults
  const actualSectionId = sectionId || WrappedComponent.displayName || 'section';
  const actualToggleName = toggleName || `is${actualSectionId.charAt(0).toUpperCase() + actualSectionId.slice(1)}Used`;
  const actualToggleLabel = toggleLabel || `Use ${actualSectionId}?`;

  // The wrapped component
  const WrappedSection = (props) => {
    // Extract data and methods from props (typically from useFormSection)
    const { 
      data, 
      updateField, 
      toggleField,
      ...otherProps 
    } = props;

    // Create local state to track toggle status
    const [isEnabled, setIsEnabled] = useState(Boolean(data?.[actualToggleName]));

    // Sync with incoming data prop
    useEffect(() => {
      if (typeof data?.[actualToggleName] === 'boolean') {
        setIsEnabled(data[actualToggleName]);
      }
    }, [data, actualToggleName]);

    // Handler for toggling the section on/off
    const handleToggle = () => {
      console.log("Toggle clicked:", actualToggleName, "current value:", isEnabled);
      
      // Update local state immediately for responsive UI
      setIsEnabled(!isEnabled);
      
      // Update the global state via the appropriate method
      if (toggleField) {
        toggleField(actualToggleName);
      } else if (updateField) {
        updateField(actualToggleName, !isEnabled);
      }

      // Debug: log the updated data after toggle
      console.log("After toggle update, data:", {...data, [actualToggleName]: !isEnabled});
    };

    return (
      <div className="space-y-4">
        {/* Toggle component at the top of every section */}
        <FormToggle
          label={actualToggleLabel}
          isChecked={isEnabled}
          onChange={handleToggle}
        />
        
        {/* Only render section content if enabled */}
        {isEnabled && (
          <>
            {wrapContent ? (
              <div className="mt-4 pl-4 border-l-2 border-gray-200">
                <WrappedComponent
                  data={data}
                  updateField={updateField}
                  toggleField={toggleField}
                  {...otherProps}
                />
              </div>
            ) : (
              <WrappedComponent
                data={data}
                updateField={updateField}
                toggleField={toggleField}
                {...otherProps}
              />
            )}
          </>
        )}
      </div>
    );
  };

  // Set display name for easier debugging
  WrappedSection.displayName = `FormSectionWrapper(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WrappedSection;
};

export default FormSectionWrapper;