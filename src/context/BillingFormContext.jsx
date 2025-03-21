// BillingFormContext.jsx
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { initialFormState } from '../constants/defaultValues';

// Create context
const BillingFormContext = createContext();

// Create action types for better consistency and readability
const ACTION_TYPES = {
  UPDATE_ORDER_AND_PAPER: "UPDATE_ORDER_AND_PAPER",
  UPDATE_LP_DETAILS: "UPDATE_LP_DETAILS",
  UPDATE_FS_DETAILS: "UPDATE_FS_DETAILS",
  UPDATE_EMB_DETAILS: "UPDATE_EMB_DETAILS",
  UPDATE_DIGI_DETAILS: "UPDATE_DIGI_DETAILS",
  UPDATE_DIE_CUTTING: "UPDATE_DIE_CUTTING",
  UPDATE_SANDWICH: "UPDATE_SANDWICH",
  UPDATE_PASTING: "UPDATE_PASTING",
  UPDATE_CALCULATIONS: "UPDATE_CALCULATIONS",
  RESET_FORM: "RESET_FORM",
  INITIALIZE_FORM: "INITIALIZE_FORM"
};

// Improved reducer function to handle updates to the state
const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.UPDATE_ORDER_AND_PAPER:
      return { 
        ...state, 
        orderAndPaper: { 
          ...state.orderAndPaper, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_LP_DETAILS:
      return { 
        ...state, 
        lpDetails: { 
          ...state.lpDetails, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_FS_DETAILS:
      return { 
        ...state, 
        fsDetails: { 
          ...state.fsDetails, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_EMB_DETAILS:
      return { 
        ...state, 
        embDetails: { 
          ...state.embDetails, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_DIGI_DETAILS:
      return { 
        ...state, 
        digiDetails: { 
          ...state.digiDetails, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_DIE_CUTTING:
      return { 
        ...state, 
        dieCutting: { 
          ...state.dieCutting, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_SANDWICH:
      return { 
        ...state, 
        sandwich: { 
          ...state.sandwich, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_PASTING:
      return { 
        ...state, 
        pasting: { 
          ...state.pasting, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_CALCULATIONS:
      return { 
        ...state, 
        calculations: action.payload 
      };
      
    case ACTION_TYPES.RESET_FORM:
      return { ...initialFormState };
      
    case ACTION_TYPES.INITIALIZE_FORM:
      return { ...action.payload };
      
    default:
      return state;
  }
};

// Provider component
export const BillingFormProvider = ({ children, initialState = initialFormState }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <BillingFormContext.Provider value={contextValue}>
      {children}
    </BillingFormContext.Provider>
  );
};

// Custom hook for using the context
export const useBillingForm = () => {
  const context = useContext(BillingFormContext);
  if (!context) {
    throw new Error('useBillingForm must be used within a BillingFormProvider');
  }
  return context;
};

// Export action types for components to use
export { ACTION_TYPES };