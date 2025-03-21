import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';

const COLLECTION_NAME = 'dies';

// Fetch all dies
export const fetchDies = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching dies:', error);
    throw error;
  }
};

// Fetch die by ID
export const fetchDieById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Die not found');
    }
  } catch (error) {
    console.error('Error fetching die:', error);
    throw error;
  }
};

// Search dies by dimensions
export const searchDiesByDimensions = async (length, breadth) => {
  try {
    let diesQuery = collection(db, COLLECTION_NAME);
    
    if (length && breadth) {
      diesQuery = query(
        diesQuery, 
        where('dieSizeL', '==', length.toString()),
        where('dieSizeB', '==', breadth.toString())
      );
    } else if (length) {
      diesQuery = query(diesQuery, where('dieSizeL', '==', length.toString()));
    } else if (breadth) {
      diesQuery = query(diesQuery, where('dieSizeB', '==', breadth.toString()));
    }
    
    const querySnapshot = await getDocs(diesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching dies:', error);
    throw error;
  }
};

// Add new die
export const addDie = async (dieData, imageFile = null) => {
  try {
    let imageUrl = dieData.imageUrl || '';
    
    // Upload image if provided
    if (imageFile && storage) {
      const imageRef = ref(storage, `dieImages/${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...dieData,
      imageUrl,
      timestamp: new Date()
    });
    
    return { id: docRef.id, ...dieData, imageUrl };
  } catch (error) {
    console.error('Error adding die:', error);
    throw error;
  }
};

// Update die
export const updateDie = async (id, dieData, imageFile = null) => {
  try {
    let imageUrl = dieData.imageUrl || '';
    
    // Upload new image if provided
    if (imageFile && storage) {
      const imageRef = ref(storage, `dieImages/${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }
    
    const dieRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(dieRef, {
      ...dieData,
      imageUrl: imageFile ? imageUrl : dieData.imageUrl,
    });
    
    return { id, ...dieData, imageUrl: imageFile ? imageUrl : dieData.imageUrl };
  } catch (error) {
    console.error('Error updating die:', error);
    throw error;
  }
};

// Delete die
export const deleteDie = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting die:', error);
    throw error;
  }
};