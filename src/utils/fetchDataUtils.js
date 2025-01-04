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
