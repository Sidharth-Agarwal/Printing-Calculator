import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const COLLECTION_NAME = 'materials';

// Fetch all materials
export const fetchMaterials = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
};

// Fetch material by type
export const fetchMaterialsByType = async (materialType) => {
  try {
    const materialsQuery = query(
      collection(db, COLLECTION_NAME),
      where('materialType', '==', materialType)
    );
    
    const querySnapshot = await getDocs(materialsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching materials for type ${materialType}:`, error);
    throw error;
  }
};

// Fetch material by name
export const fetchMaterialByName = async (materialName) => {
  try {
    const materialsQuery = query(
      collection(db, COLLECTION_NAME),
      where('materialName', '==', materialName)
    );
    
    const querySnapshot = await getDocs(materialsQuery);
    const materials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return materials.length > 0 ? materials[0] : null;
  } catch (error) {
    console.error(`Error fetching material for name ${materialName}:`, error);
    throw error;
  }
};

// Add new material
export const addMaterial = async (materialData) => {
  try {
    // Calculate derived fields
    const area = (materialData.sizeL * materialData.sizeB * materialData.quantity).toFixed(2);
    const landedCost = (parseFloat(materialData.rate || 0) + parseFloat(materialData.courier || 0)).toFixed(2);
    const costPerUnit = area > 0 ? (parseFloat(landedCost || 0) / parseFloat(area)).toFixed(2) : "0.00";
    const finalCostPerUnit = (parseFloat(costPerUnit || 0) * parseFloat(materialData.markUp || 0)).toFixed(2);
    
    const calculatedData = {
      ...materialData,
      area,
      landedCost,
      costPerUnit,
      finalCostPerUnit
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), calculatedData);
    return { id: docRef.id, ...calculatedData };
  } catch (error) {
    console.error('Error adding material:', error);
    throw error;
  }
};

// Update material
export const updateMaterial = async (id, materialData) => {
  try {
    // Calculate derived fields
    const area = (materialData.sizeL * materialData.sizeB * materialData.quantity).toFixed(2);
    const landedCost = (parseFloat(materialData.rate || 0) + parseFloat(materialData.courier || 0)).toFixed(2);
    const costPerUnit = area > 0 ? (parseFloat(landedCost || 0) / parseFloat(area)).toFixed(2) : "0.00";
    const finalCostPerUnit = (parseFloat(costPerUnit || 0) * parseFloat(materialData.markUp || 0)).toFixed(2);
    
    const calculatedData = {
      ...materialData,
      area,
      landedCost,
      costPerUnit,
      finalCostPerUnit
    };
    
    const materialRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(materialRef, calculatedData);
    
    return { id, ...calculatedData };
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

// Delete material
export const deleteMaterial = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};