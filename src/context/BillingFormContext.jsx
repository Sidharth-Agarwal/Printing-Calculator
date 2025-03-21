// context/BillingFormContext.jsx
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { initialFormState } from '../constants/defaultValues';

// Create context
const BillingFormContext = createContext();

// Action types as constants
export const ACTION_TYPES = {
  UPDATE_ORDERANDPAPER: "UPDATE_ORDERANDPAPER",
  UPDATE_LPDETAILS: "UPDATE_LPDETAILS",
  UPDATE_FSDETAILS: "UPDATE_FSDETAILS",
  UPDATE_EMBDETAILS: "UPDATE_EMBDETAILS",
  UPDATE_DIGIDETAILS: "UPDATE_DIGIDETAILS",
  UPDATE_DIECUTTING: "UPDATE_DIECUTTING",
  UPDATE_SANDWICH: "UPDATE_SANDWICH",
  UPDATE_PASTING: "UPDATE_PASTING",
  UPDATE_CALCULATIONS: "UPDATE_CALCULATIONS",
  SET_CALCULATING: "SET_CALCULATING",
  SET_CALCULATION_ERROR: "SET_CALCULATION_ERROR",
  RESET_FORM: "RESET_FORM",
  INITIALIZE_FORM: "INITIALIZE_FORM"
};

// Reducer function
const reducer = (state, action) => {
  console.log('Reducer action:', action.type, action.payload);
  
  switch (action.type) {
    case ACTION_TYPES.UPDATE_ORDERANDPAPER:
      return { 
        ...state, 
        orderAndPaper: { 
          ...state.orderAndPaper || {}, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_LPDETAILS:
      return { 
        ...state, 
        lpDetails: { 
          ...state.lpDetails || {}, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_FSDETAILS:
      return { 
        ...state, 
        fsDetails: { 
          ...state.fsDetails || {}, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_EMBDETAILS:
      return { 
        ...state, 
        embDetails: { 
          ...state.embDetails || {}, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_DIGIDETAILS:
      return { 
        ...state, 
        digiDetails: { 
          ...state.digiDetails || {}, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_DIECUTTING:
      return { 
        ...state, 
        dieCutting: { 
          ...state.dieCutting || {}, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_SANDWICH:
      return { 
        ...state, 
        sandwich: { 
          ...state.sandwich || {}, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_PASTING:
      return { 
        ...state, 
        pasting: { 
          ...state.pasting || {}, 
          ...action.payload 
        } 
      };
      
    case ACTION_TYPES.UPDATE_CALCULATIONS:
      return { 
        ...state, 
        calculations: action.payload 
      };
      
    case ACTION_TYPES.SET_CALCULATING:
      if (state.isCalculating === action.payload) return state;
      return { 
        ...state, 
        isCalculating: action.payload 
      };
      
    case ACTION_TYPES.SET_CALCULATION_ERROR:
      if (state.calculationError === action.payload) return state;
      return { 
        ...state, 
        calculationError: action.payload 
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
  
  // Add some debugging in dev mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('Current form state:', state);
  }
  
  // Memoize the context value
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