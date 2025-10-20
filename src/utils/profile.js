import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";

/**
 * Check if a username is already taken
 * @param {string} username - Username to check (should be lowercase)
 * @returns {Promise<boolean>} True if username exists
 */
export const checkUsernameExists = async (username) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking username:", error);
    throw error;
  }
};

/**
 * Upload profile image to Firebase Storage
 * @param {string} userId - User ID
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadProfileImage = async (userId, imageUri) => {
  try {
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create reference to Firebase Storage
    const storageRef = ref(storage, `profile-images/${userId}`);

    // Upload image
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

/**
 * Get user profile from Firestore by userId
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { userId: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Create a new user profile in Firestore
 * @param {Object} profileData - Profile data
 * @param {string} profileData.username - Username (required, lowercase)
 * @param {string} profileData.displayName - Display name (optional)
 * @param {string} profileData.bio - Bio (optional)
 * @param {string} profileData.imageUri - Local image URI (optional)
 * @returns {Promise<void>}
 */
export const createUserProfile = async (profileData) => {
  try {
    const currentUser = useFirebaseStore.getState().currentUser;

    if (!currentUser) {
      throw new Error("No authenticated user");
    }

    const { username, displayName, bio, imageUri } = profileData;

    // Validate username
    if (!username || username.trim().length < 3) {
      const error = new Error("Username must be at least 3 characters");
      error.code = "invalid-username";
      throw error;
    }

    // Check if username is already taken
    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
      const error = new Error("Username already taken");
      error.code = "username-taken";
      throw error;
    }

    // Upload profile image if provided
    let imageURL = null;
    if (imageUri) {
      try {
        imageURL = await uploadProfileImage(currentUser.uid, imageUri);
      } catch (uploadError) {
        console.error(
          "Failed to upload image, continuing without it:",
          uploadError
        );
        // Continue without image rather than failing the whole operation
      }
    }

    // Create user document in Firestore
    const userRef = doc(db, "users", currentUser.uid);
    const userData = {
      userId: currentUser.uid,
      username: username.toLowerCase(),
      displayName: displayName || username,
      email: currentUser.email,
      imageURL: imageURL,
      bio: bio || null,
      status: "Available",
      pushToken: null,
      createdAt: serverTimestamp(),
      lastEdit: serverTimestamp(),
    };

    await setDoc(userRef, userData);

    // Update the current user in the store
    // Note: The auth state listener will trigger and update the store,
    // but we need to manually add the username to the current user object
    useFirebaseStore.getState().setCurrentUser({
      ...currentUser,
      username: userData.username,
      displayName: userData.displayName,
      imageURL: userData.imageURL,
    });

    console.log("✅ User profile created successfully");
  } catch (error) {
    console.error("Error creating user profile:", error);

    // Re-throw with appropriate error code
    if (error.code) {
      throw error;
    }

    const wrappedError = new Error("Failed to create profile");
    wrappedError.code = "create-profile-error";
    throw wrappedError;
  }
};

/**
 * Update an existing user profile in Firestore
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);

    // If updating image, upload it first
    if (updates.imageUri) {
      const imageURL = await uploadProfileImage(userId, updates.imageUri);
      updates.imageURL = imageURL;
      delete updates.imageUri;
    }

    // Add lastEdit timestamp
    updates.lastEdit = serverTimestamp();

    await updateDoc(userRef, updates);

    console.log("✅ User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Get all users from Firestore
 * @returns {Promise<Array>} Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const users = querySnapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    }));

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};
