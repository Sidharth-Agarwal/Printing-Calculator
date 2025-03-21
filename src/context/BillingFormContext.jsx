// BillingFormContext.jsx
import React, { createContext, useContext, useReducer } from 'react';
import { initialFormState } from '../constants/defaultValues';

// Create context
const BillingFormContext = createContext();

// Reducer function to handle updates to the state
const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_ORDER_AND_PAPER":
      return { ...state, orderAndPaper: { ...state.orderAndPaper, ...action.payload } };
    case "UPDATE_LP_DETAILS":
      return { ...state, lpDetails: { ...state.lpDetails, ...action.payload } };
    case "UPDATE_FS_DETAILS":
      return { ...state, fsDetails: { ...state.fsDetails, ...action.payload } };
    case "UPDATE_EMB_DETAILS":
      return { ...state, embDetails: { ...state.embDetails, ...action.payload } };
    case "UPDATE_DIGI_DETAILS":
      return { ...state, digiDetails: { ...state.digiDetails, ...action.payload } };
    case "UPDATE_DIE_CUTTING":
      return { ...state, dieCutting: { ...state.dieCutting, ...action.payload } };
    case "UPDATE_SANDWICH":
      return { ...state, sandwich: { ...state.sandwich, ...action.payload } };
    case "UPDATE_PASTING":
      return { ...state, pasting: { ...state.pasting, ...action.payload } };
    case "UPDATE_CALCULATIONS":
      return { ...state, calculations: action.payload };
    case "SET_CALCULATING":
      return { ...state, isCalculating: action.payload };
    case "SET_CALCULATION_ERROR":
      return { ...state, calculationError: action.payload };
    case "RESET_FORM":
      return initialFormState;
    case "INITIALIZE_FORM":
      return { ...action.payload };
    default:
      return state;
  }
};

// Provider component
export const BillingFormProvider = ({ children, initialState = initialFormState }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <BillingFormContext.Provider value={{ state, dispatch }}>
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