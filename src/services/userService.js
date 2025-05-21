import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Cache to prevent unnecessary Firestore calls
const userCache = {};

/**
 * Fetch user data from Firestore by user ID
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} - User data
 */
export const getUserData = async (userId) => {
  // Return cached user data if available
  if (userCache[userId]) {
    return userCache[userId];
  }

  try {
    // Try to fetch the user from Firestore
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Create user data object
      const user = {
        id: userId,
        displayName: userData.displayName || userData.name || "Unknown User",
        email: userData.email,
        photoURL: userData.photoURL,
        role: userData.role,
        initials: getInitialsFromName(userData.displayName || userData.name)
      };
      
      // Cache the user data
      userCache[userId] = user;
      
      return user;
    } else {
      // If user not found in Firestore, create a fallback user object
      const fallbackUser = {
        id: userId,
        displayName: `${getUsernameFromId(userId)}`,
        email: null,
        photoURL: null,
        initials: userId.substring(0, 2).toUpperCase()
      };
      
      // Cache the fallback user data
      userCache[userId] = fallbackUser;
      
      return fallbackUser;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    
    // Return a fallback user object
    return {
      id: userId,
      displayName: `${getUsernameFromId(userId)}`,
      email: null,
      photoURL: null,
      initials: userId.substring(0, 2).toUpperCase()
    };
  }
};

/**
 * Get display name from Auth user
 * @param {Object} authUser - Firebase Auth user
 * @returns {string} - Display name
 */
export const getDisplayName = (authUser) => {
  if (!authUser) return "Guest";
  
  if (authUser.displayName) {
    return authUser.displayName;
  } else if (authUser.email) {
    return authUser.email.split('@')[0];
  } else {
    return "User";
  }
};

/**
 * Get initials from name
 * @param {string} name - User name
 * @returns {string} - Initials
 */
export const getInitialsFromName = (name) => {
  if (!name) return "UN";
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Create a username from the user ID
 * @param {string} userId - Firebase user ID
 * @returns {string} - Username
 */
export const getUsernameFromId = (userId) => {
  if (!userId) return "Unknown User";
  
  // Extract a readable username from user ID
  // This is a placeholder - you can customize how you generate readable names
  const firstPart = userId.substring(0, 4);
  return "User " + firstPart;
};

/**
 * Clear the user cache
 */
export const clearUserCache = () => {
  Object.keys(userCache).forEach(key => {
    delete userCache[key];
  });
};

/**
 * Get user initials for avatar
 * @param {Object} user - User object
 * @returns {string} - Initials
 */
export const getUserInitials = (user) => {
  if (!user) return "UN";
  
  if (user.initials) return user.initials;
  
  if (user.displayName) {
    return getInitialsFromName(user.displayName);
  }
  
  if (user.id) {
    return user.id.substring(0, 2).toUpperCase();
  }
  
  return "UN";
};