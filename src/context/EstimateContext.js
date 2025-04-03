// src/context/EstimateContext.js
import React, { createContext, useContext, useState, useReducer } from 'react';
import { initialFormState } from '../models/formStateModel';
import { ESTIMATE_STATUS } from '../constants/statusConstants';
import { useAuth } from './AuthContext';

// Create context
const EstimateContext = createContext();

// Custom hook to use the estimate context
export const useEstimate = () => {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
};

// Reducer function for estimate state
const estimateReducer = (state, action) => {
  switch (action.type) {
    // Add new cases for client info and version info
    case "UPDATE_CLIENT_INFO":
      return { ...state, clientInfo: { ...state.clientInfo, ...action.payload } };
    
    case "UPDATE_VERSION_INFO":
      return { ...state, versionInfo: { ...state.versionInfo, ...action.payload } };
    
    // Existing cases
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
    
    case "RESET_FORM":
      return initialFormState;
    
    case "INITIALIZE_FORM":
      return { ...action.payload };
    
    case "UPDATE_CALCULATIONS":
      return { ...state, calculations: action.payload };

    case "UPDATE_STATUS":
      return { 
        ...state, 
        versionInfo: {
          ...state.versionInfo,
          status: action.payload
        }
      };
      
    default:
      return state;
  }
};

// Provider component
export const EstimateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(estimateReducer, initialFormState);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const { getUserId, getUserName } = useAuth();

  // Calculate if form has been modified
  const [originalState, setOriginalState] = useState(null);
  const isModified = originalState ? JSON.stringify(originalState) !== JSON.stringify(state) : false;

  // Initialize form with an existing estimate for editing
  const initializeForm = (estimateData) => {
    dispatch({ type: 'INITIALIZE_FORM', payload: estimateData });
    setOriginalState(estimateData);
  };

  // Reset form to initial state
  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
    setOriginalState(null);
    setVersionHistory([]);
  };

  // Load version history for an estimate
  const loadVersionHistory = (history) => {
    setVersionHistory(history);
  };

  // Create an audit entry for version control
  const createAuditEntry = (action, details = '') => {
    return {
      action,
      timestamp: new Date(),
      userId: getUserId(),
      userName: getUserName(),
      details
    };
  };

  // Update estimate status
  const updateStatus = (newStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: newStatus });
  };

  // Check if current status allows a specific transition
  const canTransitionTo = (targetStatus) => {
    const currentStatus = state.versionInfo.status || ESTIMATE_STATUS.DRAFT;
    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(targetStatus);
  };

  // Value object to be provided to consumers
  const value = {
    state,
    dispatch,
    isCalculating,
    setIsCalculating,
    isSubmitting,
    setIsSubmitting,
    versionHistory,
    loadVersionHistory,
    isModified,
    initializeForm,
    resetForm,
    createAuditEntry,
    activeSection,
    setActiveSection,
    updateStatus,
    canTransitionTo
  };

  return (
    <EstimateContext.Provider value={value}>
      {children}
    </EstimateContext.Provider>
  );
};

export default EstimateContext;