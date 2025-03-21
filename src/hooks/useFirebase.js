import { useState, useCallback, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Custom hook for Firebase operations related to billing forms
 */
const useFirebase = (collectionName) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  // Fetch data from collection
  const fetchData = useCallback(async (constraints = []) => {
    setIsLoading(true);
    setError(null);

    try {
      let dataQuery = collection(db, collectionName);
      
      // Apply constraints if provided
      if (constraints.length > 0) {
        constraints.forEach(constraint => {
          dataQuery = query(dataQuery, where(constraint.field, constraint.operator, constraint.value));
        });
      }
      
      const snapshot = await getDocs(dataQuery);
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setItems(fetchedData);
      return fetchedData;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  // Add item to collection
  const addItem = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        timestamp: new Date()
      });
      
      return { id: docRef.id, ...data };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  // Update item in collection
  const updateItem = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      
      return { id, ...data };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  // Initialize data loading on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    isLoading,
    error,
    fetchData,
    addItem,
    updateItem
  };
};

export default useFirebase;