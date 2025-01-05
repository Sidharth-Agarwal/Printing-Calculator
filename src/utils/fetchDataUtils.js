import { db } from "../firebaseConfig"; // Import Firebase configuration
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * Fetch paper details from the Firebase Firestore database by paper name.
 * @param {string} paperName - The name of the paper to fetch.
 * @returns {Promise<Object|null>} - The paper details or null if not found.
 */
export const fetchPaperDetails = async (paperName) => {
  try {
    const papersCollection = collection(db, "papers"); // Replace "papers" with your collection name in Firestore
    const q = query(papersCollection, where("paperName", "==", paperName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const paperData = querySnapshot.docs[0].data();
      return paperData; // Return the first matching document's data
    } else {
      console.warn(`No paper found with the name: ${paperName}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching paper details:", error);
    throw new Error("Failed to fetch paper details");
  }
};

// /**
//  * Fetch material details from the Firebase Firestore database by material name.
//  * @param {string} materialName - The name of the material to fetch.
//  * @returns {Promise<Object|null>} - The material details or null if not found.
//  */
// export const fetchMaterialDetails = async (materialName) => {
//   try {
//     const materialsCollection = collection(db, "materials"); // Replace "materials" with your collection name in Firestore
//     const q = query(materialsCollection, where("materialName", "==", materialName));
//     const querySnapshot = await getDocs(q);

//     if (!querySnapshot.empty) {
//       const materialData = querySnapshot.docs[0].data();
//       return materialData; // Return the first matching document's data
//     } else {
//       console.warn(`No material found with the name: ${materialName}`);
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching material details:", error);
//     throw new Error("Failed to fetch material details");
//   }
// };

/**
 * Fetch material details from the Firebase Firestore database by material name.
 * @param {string} materialName - The name of the material to fetch.
 * @returns {Promise<Object|null>} - The material details or null if not found.
 */
export const fetchMaterialDetails = async (materialName) => {
  try {
    const materialsCollection = collection(db, "materials");
    const q = query(materialsCollection, where("materialName", "==", materialName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const materialData = querySnapshot.docs[0].data();
      console.log(materialData, materialName)
      return materialData; // Return the first matching document's data
    } else {
      console.warn(`No material found with the name: ${materialName}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching material details:", error);
    throw new Error("Failed to fetch material details");
  }
};

/**
 * Fetch MR details for LP details from Firebase Firestore.
 * @param {Object} lpDetails - The LP details object containing colorDetails array.
 * @returns {Promise<Object[]>} - Array of MR details for each color or an error if not found.
 */
export const fetchMRDetailsForLPDetails = async (lpDetails) => {
  try {
    if (!lpDetails.isLPUsed || !lpDetails.colorDetails?.length) {
      console.warn("LP details or color details are missing or not used.");
      return [];
    }

    const standardRatesCollection = collection(db, "standard_rates");
    const mrDetailsArray = [];

    for (const color of lpDetails.colorDetails) {
      const mrType = color.mrType;
      if (!mrType) {
        console.warn("Missing MR type for color:", color);
        continue; // Skip if no MR type is specified
      }

      const lpMRConcatenate = `LP MR ${mrType.toUpperCase()}`; // Construct the concatenate field
      console.log(`Querying Firestore with concatenate: ${lpMRConcatenate}`);

      const q = query(
        standardRatesCollection,
        where("concatenate", "==", lpMRConcatenate)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const mrDetails = querySnapshot.docs[0].data();
        console.log("Found MR details:", mrDetails);
        mrDetailsArray.push(mrDetails);
      } else {
        console.warn(`No LP MR details found for type: ${mrType}`);
        continue;
      }
    }

    return mrDetailsArray;
  } catch (error) {
    console.error("Error fetching MR details for LP details:", error);
    throw new Error("Failed to fetch MR details for LP details");
  }
};

/**
 * Fetch MR details for FS details from Firebase Firestore.
 * @param {Object} fsDetails - The FS details object containing foilDetails array.
 * @returns {Promise<Object[]>} - Array of MR details for each foil or an error if not found.
 */
export const fetchMRDetailsForFSDetails = async (fsDetails) => {
  try {
    const standardRatesCollection = collection(db, "standard_rates");
    const mrDetailsArray = [];

    for (const foil of fsDetails.foilDetails) {
      const mrType = foil.mrType;
      if (!mrType) {
        console.warn("Missing MR type for foil:", foil);
        continue; // Skip if no MR type is specified
      }

      const fsMRConcatenate = `FS MR ${mrType.toUpperCase()}`;
      const q = query(
        standardRatesCollection,
        where("concatenate", "==", fsMRConcatenate)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        mrDetailsArray.push(querySnapshot.docs[0].data());
      } else {
        console.warn(`No FS MR details found for type: ${mrType}`);
      }
    }

    return mrDetailsArray;
  } catch (error) {
    console.error("Error fetching MR details for FS details:", error);
    throw new Error("Failed to fetch MR details for FS details");
  }
};
