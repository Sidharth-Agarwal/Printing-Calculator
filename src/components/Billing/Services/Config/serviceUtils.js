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
 * Gets an array of service codes that should be active by default for a specific job type
 * @param {string} jobType - The job type (e.g., "Card", "Envelope")
 * @param {string} group - The service group ("production" or "postProduction")
 * @returns {Array} Array of service codes that should be active by default
 */
export const getDefaultActiveServicesForJobType = (jobType, group) => {
  const config = jobTypeConfigurations[jobType] || jobTypeConfigurations["Card"];
  const key = group === "production" ? "production" : "postProduction";
  return config?.defaultActiveServices?.[key] || [];
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
 * Sets default active services for a job type
 * @param {string} jobType - The job type
 * @param {object} state - The current form state
 * @param {function} dispatch - The dispatch function for updating state
 * @param {function} setActiveSection - Function to set the active section
 * @returns {Array} Array of activated service IDs
 */
export const setDefaultActiveServices = (jobType, state, dispatch, setActiveSection) => {
  const defaultActiveProductionServices = getDefaultActiveServicesForJobType(jobType, "production");
  const defaultActivePostProductionServices = getDefaultActiveServicesForJobType(jobType, "postProduction");
  const activatedSections = [];
  
  console.log(`Setting default active services for ${jobType}:`, {
    production: defaultActiveProductionServices,
    postProduction: defaultActivePostProductionServices
  });
  
  // Process all services in the registry
  Object.entries(serviceRegistry).forEach(([serviceCode, serviceInfo]) => {
    const shouldBeActive = 
      defaultActiveProductionServices.includes(serviceCode) || 
      defaultActivePostProductionServices.includes(serviceCode);
    
    const isCurrentlyActive = state[serviceInfo.stateKey]?.[serviceInfo.toggleField] || false;
    
    // Skip if already in desired state
    if (shouldBeActive === isCurrentlyActive) return;
    
    // Update state to activate service
    if (shouldBeActive) {
      // Prepare default values for service based on service type
      let additionalConfig = {};
      
      // Add service-specific default values here
      switch(serviceCode) {
        case "LP":
          additionalConfig = {
            noOfColors: 1,
            colorDetails: [
              {
                plateSizeType: "Auto",
                plateDimensions: { 
                  length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                  breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
                },
                pantoneType: "",
                plateType: "Polymer Plate",
                mrType: "SIMPLE", // Display value
                mrTypeConcatenated: "LP MR SIMPLE" // Value for calculations
              }
            ]
          };
          break;
        case "FS":
          additionalConfig = {
            fsType: "FS1",
            foilDetails: [
              {
                blockSizeType: "Auto",
                blockDimension: { 
                  length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
                  breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
                },
                foilType: "Gold MTS 220",
                blockType: "Magnesium Block 3MM",
                mrType: "SIMPLE", // Display value
                mrTypeConcatenated: "FS MR SIMPLE" // Value for calculations
              }
            ]
          };
          break;
        case "EMB":
          additionalConfig = {
            plateSizeType: "Auto",
            plateDimensions: { 
              length: state.orderAndPaper.dieSize.length ? (parseFloat(state.orderAndPaper.dieSize.length) * 2.54).toFixed(2) : "", 
              breadth: state.orderAndPaper.dieSize.breadth ? (parseFloat(state.orderAndPaper.dieSize.breadth) * 2.54).toFixed(2) : "" 
            },
            plateTypeMale: "Polymer Plate",
            plateTypeFemale: "Polymer Plate",
            embMR: "SIMPLE", // Display value
            embMRConcatenated: "EMB MR SIMPLE" // Value for calculations
          };
          break;
        case "DIGI":
          additionalConfig = {
            digiDie: "12x18",
            digiDimensions: { length: "12", breadth: "18" }
          };
          break;
        case "NOTEBOOK":
          additionalConfig = {
            orientation: "",
            length: "",
            breadth: "",
            calculatedLength: "",
            calculatedBreadth: "",
            numberOfPages: "",
            bindingType: "",
            bindingTypeConcatenated: ""
          };
          break;
        case "SCREEN":
          additionalConfig = {
            noOfColors: 1,
            screenMR: "SIMPLE",
            screenMRConcatenated: "SCREEN MR SIMPLE"
          };
          break;
        case "DC":
          additionalConfig = {
            dcMR: "SIMPLE",
            dcMRConcatenated: "DC MR SIMPLE"
          };
          break;
        case "POST DC":
          additionalConfig = {
            pdcMR: "SIMPLE",
            pdcMRConcatenated: "PDC MR SIMPLE"
          };
          break;
        case "FOLD & PASTE":
          additionalConfig = {
            dstMaterial: "",
            dstType: ""
          };
          break;
        case "DST PASTE":
          additionalConfig = {
            dstType: ""
          };
          break;
        case "MAGNET":
          additionalConfig = {
            magnetMaterial: ""
          };
          break;
        case "QC":
          // QC doesn't need additional config
          break;
        case "PACKING":
          // Packing doesn't need additional config
          break;
        case "DUPLEX":
          additionalConfig = {
            paperInfo: {
              paperName: ""
            },
            lpDetailsSandwich: {
              isLPUsed: false,
              noOfColors: 0,
              colorDetails: []
            },
            fsDetailsSandwich: {
              isFSUsed: false,
              fsType: "",
              foilDetails: []
            },
            embDetailsSandwich: {
              isEMBUsed: false,
              plateSizeType: "",
              plateDimensions: { 
                length: "", 
                breadth: "",
                lengthInInches: "",
                breadthInInches: "" 
              },
              plateTypeMale: "",
              plateTypeFemale: "",
              embMR: "",
              embMRConcatenated: ""
            }
          };
          break;
        case "MISC":
          additionalConfig = {
            miscCharge: ""
          };
          break;
        default:
          // No specific defaults for other services
          break;
      }
      
      dispatch({
        type: `UPDATE_${serviceInfo.stateKey.toUpperCase()}`,
        payload: { 
          [serviceInfo.toggleField]: true,
          ...additionalConfig
        }
      });
      
      // Keep track of activated sections
      activatedSections.push(serviceInfo.id);
      console.log(`Activated service: ${serviceCode}`);
    } else {
      // Deactivate service if it shouldn't be active
      dispatch({
        type: `UPDATE_${serviceInfo.stateKey.toUpperCase()}`,
        payload: { [serviceInfo.toggleField]: false }
      });
      console.log(`Deactivated service: ${serviceCode}`);
    }
  });
  
  // Return list of activated sections
  return activatedSections;
};

/**
 * Resets services that are not applicable to the selected job type
 * @param {string} jobType - The job type
 * @param {function} dispatch - The dispatch function for updating state
 */
export const resetNonApplicableServices = (jobType, dispatch) => {
  const visibleProductionServices = getVisibleServicesForJobType(jobType, "production");
  const visiblePostProductionServices = getVisibleServicesForJobType(jobType, "postProduction");
  
  console.log(`Resetting non-applicable services for ${jobType}`);
  
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
    
    console.log(`Reset non-applicable service: ${serviceCode}`);
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