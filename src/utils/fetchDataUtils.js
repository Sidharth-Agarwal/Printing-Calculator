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

/**
 * Fetch MR details for EMB Details from Firebase Firestore.
 * @param {string} mrType - The MR type (e.g., "Simple", "Complex", "Super Complex").
 * @returns {Promise<Object|null>} - The MR details or null if not found.
 */
export const fetchMRDetailsForEMBDetails = async (mrType) => {
  try {
    if (!mrType) {
      console.warn("EMB MR type is missing.");
      return null;
    }

    const standardRatesCollection = collection(db, "standard_rates");
    const embMRConcatenate = `EMB MR ${mrType.toUpperCase()}`; // Construct the concatenate field

    console.log(`Querying Firestore with concatenate: ${embMRConcatenate}`);
    const q = query(
      standardRatesCollection,
      where("concatenate", "==", embMRConcatenate)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const mrDetails = querySnapshot.docs[0].data();
      console.log("Found MR details:", mrDetails);
      return mrDetails; // Return the first matching document's data
    } else {
      console.warn(`No EMB MR details found for type: ${mrType}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching EMB MR details:", error);
    throw new Error("Failed to fetch EMB MR details");
  }
};

/**
 * Fetch paper details from the Firebase Firestore database based on required dimensions.
 * The function queries papers with dimensions greater than or equal to the required dimensions
 * and returns the best match (smallest paper that meets the criteria).
 * 
 * @param {number} length - The required length (in cm) of the paper.
 * @param {number} breadth - The required breadth (in cm) of the paper.
 * @returns {Promise<Object|null>} - The best match paper details or null if not found.
 */
export const fetchPaperDetailsByDimensions = async (length, breadth, paperName) => {
  try {
    const papersCollection = collection(db, "papers");
    const q = query(papersCollection, where("paperName", "==", paperName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No papers found with name: ${paperName}`);
      return null;
    }

    // Convert Firestore results to an array
    const papers = querySnapshot.docs.map((doc) => doc.data());

    // Filter papers by length and breadth
    const matchingPaper = papers.find(
      (paper) =>
        parseFloat(paper.length).toFixed(1) === parseFloat(length).toFixed(1) &&
        parseFloat(paper.breadth).toFixed(1) === parseFloat(breadth).toFixed(1)
    );

    if (!matchingPaper) {
      console.warn(`No paper found for dimensions: ${length} x ${breadth}`);
      return null;
    }

    console.log("Matching paper found:", matchingPaper);
    return matchingPaper;
  } catch (error) {
    console.error("Error fetching paper details by dimensions:", error);
    throw new Error("Failed to fetch paper details based on dimensions.");
  }
};

// export const fetchPaperDetailsByDimensions = async (length, breadth) => {
//   try {
//     if (!length || !breadth) {
//       console.warn("Length or breadth is missing for fetching paper details.");
//       return null;
//     }

//     const papersCollection = collection(db, "papers");

//     // Ensure query parameters are rounded to 1 decimal place
//     const roundedLength = parseFloat(length).toFixed(1);
//     const roundedBreadth = parseFloat(breadth).toFixed(1);

//     console.log(`Querying Firestore for paper with dimensions: ${roundedLength} x ${roundedBreadth}`);

//     // Fetch the paper details using the provided dimensions
//     const q = query(
//       papersCollection,
//       where("length", "==", parseFloat(roundedLength)),
//       where("breadth", "==", parseFloat(roundedBreadth))
//     );

//     const querySnapshot = await getDocs(q);

//     if (!querySnapshot.empty) {
//       const paperDetails = querySnapshot.docs[0].data();
//       console.log("Found paper details:", paperDetails);
//       return paperDetails; // Return the entire paper details object
//     } else {
//       console.warn(`No paper found for dimensions: ${roundedLength} x ${roundedBreadth}`);
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching paper details by dimensions:", error);
//     throw new Error("Failed to fetch paper details based on dimensions.");
//   }
// };
