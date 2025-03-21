import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const COLLECTION_NAME = 'standard_rates';

// Fetch all standard rates
export const fetchStandardRates = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching standard rates:', error);
    throw error;
  }
};

// Fetch rates by group
export const fetchRatesByGroup = async (group) => {
  try {
    const ratesQuery = query(
      collection(db, COLLECTION_NAME),
      where('group', '==', group)
    );
    
    const querySnapshot = await getDocs(ratesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching rates for group ${group}:`, error);
    throw error;
  }
};

// Fetch rate by type and group
export const fetchRateByTypeAndGroup = async (type, group) => {
  try {
    const ratesQuery = query(
      collection(db, COLLECTION_NAME),
      where('type', '==', type),
      where('group', '==', group)
    );
    
    const querySnapshot = await getDocs(ratesQuery);
    const rates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return rates.length > 0 ? rates[0] : null;
  } catch (error) {
    console.error(`Error fetching rate for type ${type} and group ${group}:`, error);
    throw error;
  }
};

// Get rate by concatenated value
export const fetchRateByConcatenate = async (concatenateValue) => {
  try {
    const ratesQuery = query(
      collection(db, COLLECTION_NAME),
      where('concatenate', '==', concatenateValue)
    );
    
    const querySnapshot = await getDocs(ratesQuery);
    const rates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return rates.length > 0 ? rates[0] : null;
  } catch (error) {
    console.error(`Error fetching rate for concatenate value ${concatenateValue}:`, error);
    throw error;
  }
};

// Add new standard rate
export const addStandardRate = async (rateData) => {
  try {
    // Generate concatenate field if not provided
    if (!rateData.concatenate) {
      rateData.concatenate = `${rateData.group || ''} ${rateData.type || ''}`.trim();
    }
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), rateData);
    return { id: docRef.id, ...rateData };
  } catch (error) {
    console.error('Error adding standard rate:', error);
    throw error;
  }
};

// Update standard rate
export const updateStandardRate = async (id, rateData) => {
  try {
    // Generate concatenate field if not provided
    if (!rateData.concatenate) {
      rateData.concatenate = `${rateData.group || ''} ${rateData.type || ''}`.trim();
    }
    
    const rateRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(rateRef, rateData);
    
    return { id, ...rateData };
  } catch (error) {
    console.error('Error updating standard rate:', error);
    throw error;
  }
};

// Delete standard rate
export const deleteStandardRate = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting standard rate:', error);
    throw error;
  }
};