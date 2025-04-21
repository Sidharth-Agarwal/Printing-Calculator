import { serviceRegistry } from './serviceRegistry';
import { jobTypeConfigurations } from './jobTypeConfigurations';

/**
 * Gets an array of service codes that should be visible for a specific job type
 * @param {string} jobType - The job type (e.g., "Card", "Envelope")
 * @param {string} group - The service group ("production" or "postProduction")
 * @returns {Array} Array of service codes
 */
export const getVisibleServicesForJobType = (jobType, group) => {
  const config = jobTypeConfigurations[jobType] || jobTypeConfigurations["Card"]; // Default to Card if jobType not found
  return group === "production" ? config.productionServices : config.postProductionServices;
};

/**
 * Creates a toggle handler function for a specific service
 * @param {string} serviceCode - The service code (e.g., "LP", "DC")
 * @param {object} state - The current form state
 * @param {function} dispatch - The dispatch function for updating state
 * @param {function} setActiveSection - Function to set the active section
 * @returns {function} A toggle handler function
 */
export const createToggleHandler = (serviceCode, state, dispatch, setActiveSection) => {
  const serviceInfo = serviceRegistry[serviceCode];
  if (!serviceInfo) return () => {};

  return () => {
    const stateKey = serviceInfo.stateKey;
    const toggleField = serviceInfo.toggleField;
    const currentValue = state[stateKey]?.[toggleField] || false;
    
    dispatch({
      type: `UPDATE_${stateKey.toUpperCase()}`,
      payload: { [toggleField]: !currentValue }
    });

    // Auto-expand section when toggled on
    if (!currentValue) {
      setActiveSection(serviceInfo.id);
    }
  };
};

/**
 * Applies default values for a job type
 * @param {string} jobType - The job type
 * @param {function} dispatch - The dispatch function for updating state
 */
export const applyDefaultsForJobType = (jobType, dispatch) => {
  const defaults = jobTypeConfigurations[jobType]?.defaultValues || {};
  
  // Apply defaults to each section
  Object.keys(defaults).forEach(sectionKey => {
    dispatch({
      type: `UPDATE_${sectionKey.toUpperCase()}`,
      payload: defaults[sectionKey]
    });
  });
};

/**
 * Resets services that are not applicable to the selected job type
 * @param {string} jobType - The job type
 * @param {function} dispatch - The dispatch function for updating state
 */
export const resetNonApplicableServices = (jobType, dispatch) => {
  const visibleProductionServices = getVisibleServicesForJobType(jobType, "production");
  const visiblePostProductionServices = getVisibleServicesForJobType(jobType, "postProduction");
  
  // Process all services in the registry
  Object.entries(serviceRegistry).forEach(([serviceCode, serviceInfo]) => {
    // Skip if the service is visible in either production or post-production
    if (visibleProductionServices.includes(serviceCode) || 
        visiblePostProductionServices.includes(serviceCode)) {
      return;
    }
    
    // Reset services that are not visible for this job type
    dispatch({
      type: `UPDATE_${serviceInfo.stateKey.toUpperCase()}`,
      payload: { [serviceInfo.toggleField]: false }
    });
  });
};

/**
 * Creates the component for a service
 * @param {string} serviceCode - The service code
 * @param {object} state - The current form state
 * @param {function} dispatch - The dispatch function for updating state
 * @param {string} activeSection - The currently active section
 * @param {function} setActiveSection - Function to set the active section
 * @returns {React.Component} The rendered component or null
 */
export const createServiceComponent = (serviceCode, state, dispatch, activeSection, setActiveSection) => {
  const serviceInfo = serviceRegistry[serviceCode];
  if (!serviceInfo || !serviceInfo.component) return null;
  
  const Component = serviceInfo.component;
  const isUsed = state[serviceInfo.stateKey]?.[serviceInfo.toggleField] || false;
  
  return {
    id: serviceInfo.id,
    title: serviceInfo.title,
    isUsed,
    toggleHandler: createToggleHandler(serviceCode, state, dispatch, setActiveSection),
    component: (
      <Component
        state={state}
        dispatch={dispatch}
        onNext={() => {}}
        onPrevious={() => {}}
        singlePageMode={true}
      />
    )
  };
};