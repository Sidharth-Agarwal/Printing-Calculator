import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const COLLECTION_NAME = 'papers';

// Fetch all papers
export const fetchPapers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching papers:', error);
    throw error;
  }
};

// Fetch paper by name
export const fetchPaperByName = async (paperName) => {
  try {
    const papersQuery = query(
      collection(db, COLLECTION_NAME),
      where('paperName', '==', paperName)
    );
    
    const querySnapshot = await getDocs(papersQuery);
    const papers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return papers.length > 0 ? papers[0] : null;
  } catch (error) {
    console.error(`Error fetching paper for name ${paperName}:`, error);
    throw error;
  }
};

// Fetch paper by dimensions
export const fetchPapersByDimensions = async (length, breadth, type = null) => {
  try {
    // Start with base query
    let papersQuery = collection(db, COLLECTION_NAME);
    
    // Add filter by type if provided
    if (type) {
      papersQuery = query(papersQuery, where('paperName', '==', type));
    }
    
    // Execute query
    const querySnapshot = await getDocs(papersQuery);
    const papers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter by dimensions
    return papers.filter(paper => {
      const paperLength = parseFloat(paper.length) || 0;
      const paperBreadth = parseFloat(paper.breadth) || 0;
      
      // Check if paper dimensions are larger than or equal to the requested dimensions
      return (paperLength >= length && paperBreadth >= breadth) ||
             (paperLength >= breadth && paperBreadth >= length);
    });
  } catch (error) {
    console.error('Error fetching papers by dimensions:', error);
    throw error;
  }
};

// Calculate paper fields
const calculatePaperFields = (paperData) => {
  const length = parseFloat(paperData.length) || 0;
  const breadth = parseFloat(paperData.breadth) || 0;
  const gsm = parseFloat(paperData.gsm) || 0;
  const pricePerSheet = parseFloat(paperData.pricePerSheet) || 0;
  const freightPerKg = parseFloat(paperData.freightPerKg) || 0;
  
  const ratePerGram = freightPerKg / 1000;
  const area = length * breadth;
  const oneSqcmInGram = gsm / 10000;
  const gsmPerSheet = (area * oneSqcmInGram) / 1000;
  const freightPerSheet = ratePerGram * gsmPerSheet;
  const finalRate = pricePerSheet + freightPerSheet;
  
  return {
    ...paperData,
    ratePerGram: ratePerGram.toFixed(4),
    area: area.toFixed(2),
    oneSqcmInGram: oneSqcmInGram.toFixed(4),
    gsmPerSheet: gsmPerSheet.toFixed(2),
    freightPerSheet: freightPerSheet.toFixed(2),
    finalRate: finalRate.toFixed(2)
  };
};

// Add new paper
export const addPaper = async (paperData) => {
  try {
    const calculatedData = calculatePaperFields(paperData);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...calculatedData,
      timestamp: new Date()
    });
    
    return { id: docRef.id, ...calculatedData };
  } catch (error) {
    console.error('Error adding paper:', error);
    throw error;
  }
};

// Update paper
export const updatePaper = async (id, paperData) => {
  try {
    const calculatedData = calculatePaperFields(paperData);
    
    const paperRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(paperRef, calculatedData);
    
    return { id, ...calculatedData };
  } catch (error) {
    console.error('Error updating paper:', error);
    throw error;
  }
};

// Delete paper
export const deletePaper = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting paper:', error);
    throw error;
  }
};