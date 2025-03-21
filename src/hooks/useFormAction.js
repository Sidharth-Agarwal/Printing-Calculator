// hooks/useFormActions.js
import { useState, useCallback } from 'react';
import { useBillingForm } from '../context/BillingFormContext';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { initialFormState } from '../constants/defaultValues';

/**
 * Custom hook for form-wide actions like submit, reset, etc.
 */
const useFormActions = () => {
  const { state, dispatch } = useBillingForm();
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  /**
   * Map state to Firebase structure for submission
   */
  const mapStateToFirebaseStructure = useCallback((state) => {
    const { 
      orderAndPaper, 
      lpDetails, 
      fsDetails, 
      embDetails, 
      digiDetails, 
      dieCutting, 
      sandwich, 
      pasting, 
      calculations 
    } = state;

    return {
      clientName: orderAndPaper.clientName,
      projectName: orderAndPaper.projectName,
      date: orderAndPaper.date?.toISOString() || null,
      deliveryDate: orderAndPaper.deliveryDate?.toISOString() || null,
      jobDetails: {
        jobType: orderAndPaper.jobType,
        quantity: orderAndPaper.quantity,
        paperProvided: orderAndPaper.paperProvided,
        paperName: orderAndPaper.paperName,
      },
      dieDetails: {
        dieSelection: orderAndPaper.dieSelection,
        dieCode: orderAndPaper.dieCode,
        dieSize: orderAndPaper.dieSize,
        image: orderAndPaper.image,
      },
      lpDetails: lpDetails.isLPUsed ? lpDetails : null,
      fsDetails: fsDetails.isFSUsed ? fsDetails : null,
      embDetails: embDetails.isEMBUsed ? embDetails : null,
      digiDetails: digiDetails.isDigiUsed ? digiDetails : null,
      dieCutting: dieCutting.isDieCuttingUsed ? dieCutting : null,
      sandwich: sandwich.isSandwichComponentUsed ? sandwich : null,
      pasting: pasting.isPastingUsed ? pasting : null,
      calculations,
    };
  }, []);
  
  /**
   * Submit the form to Firebase
   */
  const submitForm = useCallback(async (onSuccess, onError) => {
    setIsSaving(true);
    setSubmitError(null);
    
    try {
      const formattedData = mapStateToFirebaseStructure(state);
      
      // Add a timestamp for when the estimate was created
      formattedData.createdAt = new Date();
      
      // Add the document to Firestore
      const docRef = await addDoc(collection(db, "estimates"), formattedData);
      
      // Call success callback if provided
      if (typeof onSuccess === 'function') {
        onSuccess(docRef.id, formattedData);
      }
      
      return { id: docRef.id, data: formattedData };
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Set the error state
      setSubmitError(error.message || "Failed to save estimate");
      
      // Call error callback if provided
      if (typeof onError === 'function') {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [state, mapStateToFirebaseStructure]);
  
  /**
   * Reset the form to initial state
   */
  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, [dispatch]);
  
  /**
   * Initialize form with data (used for edit mode)
   */
  const initializeForm = useCallback((formData) => {
    dispatch({ type: "INITIALIZE_FORM", payload: formData });
  }, [dispatch]);
  
  /**
   * Update an existing estimate in Firebase
   */
  const updateEstimate = useCallback(async (id, updateCallback, onSuccess, onError) => {
    setIsSaving(true);
    setSubmitError(null);
    
    try {
      const formattedData = mapStateToFirebaseStructure(state);
      
      // Call the update callback
      await updateCallback(id, formattedData);
      
      // Call success callback if provided
      if (typeof onSuccess === 'function') {
        onSuccess(id, formattedData);
      }
      
      return { id, data: formattedData };
    } catch (error) {
      console.error("Error updating estimate:", error);
      
      // Set the error state
      setSubmitError(error.message || "Failed to update estimate");
      
      // Call error callback if provided
      if (typeof onError === 'function') {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [state, mapStateToFirebaseStructure]);
  
  return {
    // State
    isSaving,
    submitError,
    
    // Methods
    submitForm,
    resetForm,
    initializeForm,
    updateEstimate,
    mapStateToFirebaseStructure
  };
};

export default useFormActions;