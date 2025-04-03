// src/hooks/useClientSearch.js
import { useState, useEffect, useCallback } from 'react';
import { searchClients, getClientById } from '../utils/clientUtils';

/**
 * Custom hook for client search functionality
 * Provides debounced search and caching of results
 */
const useClientSearch = (initialClient = null) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(initialClient || null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache recent searches to reduce API calls
  const [searchCache, setSearchCache] = useState({});
  
  // Get client by ID
  const getClient = useCallback(async (clientId) => {
    if (!clientId) return null;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const client = await getClientById(clientId);
      setSelectedClient(client);
      return client;
    } catch (err) {
      setError('Error loading client: ' + err.message);
      console.error('Error loading client:', err);
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Debounced search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Check cache first
    if (searchCache[searchTerm]) {
      setSearchResults(searchCache[searchTerm]);
      return;
    }
    
    // Set up debounce timer
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      
      try {
        const results = await searchClients(searchTerm);
        setSearchResults(results);
        
        // Update cache
        setSearchCache(prev => ({
          ...prev,
          [searchTerm]: results
        }));
      } catch (err) {
        setError('Error searching clients: ' + err.message);
        console.error('Error searching clients:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchTerm, searchCache]);
  
  // Reset search results when search term is cleared
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
    }
  }, [searchTerm]);
  
  // Load initial client if provided
  useEffect(() => {
    if (initialClient && initialClient.id) {
      setSelectedClient(initialClient);
    } else if (initialClient && initialClient.clientId) {
      getClient(initialClient.clientId);
    }
  }, [initialClient, getClient]);
  
  // Handler for client selection
  const selectClient = useCallback((client) => {
    setSelectedClient(client);
    setSearchTerm('');
    return client;
  }, []);
  
  // Handler for clearing selection
  const clearSelection = useCallback(() => {
    setSelectedClient(null);
    setSearchTerm('');
  }, []);
  
  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    selectedClient,
    isSearching,
    error,
    getClient,
    selectClient,
    clearSelection
  };
};

export default useClientSearch;