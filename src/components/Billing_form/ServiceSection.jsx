import React from "react";
import ServiceToggle from "./ServiceToggle";
import { serviceRegistry } from "./serviceRegistry";

/**
 * A component to render a section of related services
 * 
 * @param {Object} props
 * @param {string} props.title - Section title (e.g., "Production Services")
 * @param {Array<string>} props.serviceCodes - Array of service codes to include
 * @param {Object} props.state - Current form state
 * @param {Function} props.dispatch - Dispatch function for state updates
 * @param {string|null} props.activeSection - Currently active section ID
 * @param {Function} props.setActiveSection - Function to set active section
 * @param {Function} props.createToggleHandler - Function to create toggle handlers
 */
const ServiceSection = ({ 
  title, 
  serviceCodes, 
  state, 
  dispatch, 
  activeSection, 
  setActiveSection,
  createToggleHandler 
}) => {
  
  // Filter out any invalid service codes
  const validServiceCodes = serviceCodes.filter(code => serviceRegistry[code]);
  
  if (validServiceCodes.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-6 p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">{title}</h2>
      
      {validServiceCodes.map(serviceCode => {
        const serviceInfo = serviceRegistry[serviceCode];
        if (!serviceInfo || !serviceInfo.component) return null;
        
        const Component = serviceInfo.component;
        const isUsed = state[serviceInfo.stateKey]?.[serviceInfo.toggleField] || false;
        const isExpanded = activeSection === serviceInfo.id;
        const toggleHandler = createToggleHandler(serviceCode);
        
        return (
          <ServiceToggle
            key={serviceInfo.id}
            title={serviceInfo.title}
            isUsed={isUsed}
            onToggle={toggleHandler}
            isExpanded={isExpanded}
            onExpand={() => setActiveSection(isExpanded ? null : serviceInfo.id)}
          >
            <Component
              state={state}
              dispatch={dispatch}
              onNext={() => {}}
              onPrevious={() => {}}
              singlePageMode={true}
            />
          </ServiceToggle>
        );
      })}
    </div>
  );
};

export default ServiceSection;