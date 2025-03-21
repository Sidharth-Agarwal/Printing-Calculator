import { useState, useCallback, useEffect } from 'react';
import { FORM_SECTIONS } from '../constants/sectionConfig';

/**
 * Custom hook for managing accordion state in the billing form
 */
const useAccordion = () => {
  // Initialize open sections based on default config
  const [openSections, setOpenSections] = useState(() => {
    const initialState = {};
    FORM_SECTIONS.forEach(section => {
      initialState[section.id] = section.defaultOpen;
    });
    return initialState;
  });

  // Toggle a specific section
  const toggleSection = useCallback((sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Open a specific section
  const openSection = useCallback((sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: true
    }));
  }, []);

  // Close a specific section
  const closeSection = useCallback((sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: false
    }));
  }, []);

  // Open only one section, close all others
  const openOnlySection = useCallback((sectionId) => {
    const newState = {};
    Object.keys(openSections).forEach(key => {
      newState[key] = key === sectionId;
    });
    setOpenSections(newState);
  }, [openSections]);

  // Close all sections
  const closeAllSections = useCallback(() => {
    const newState = {};
    Object.keys(openSections).forEach(key => {
      newState[key] = false;
    });
    setOpenSections(newState);
  }, [openSections]);

  // Open all sections
  const openAllSections = useCallback(() => {
    const newState = {};
    Object.keys(openSections).forEach(key => {
      newState[key] = true;
    });
    setOpenSections(newState);
  }, [openSections]);

  return {
    openSections,
    toggleSection,
    openSection,
    closeSection,
    openOnlySection,
    closeAllSections,
    openAllSections
  };
};

export default useAccordion;