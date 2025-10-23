import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import { sendPushNotification } from "./notifications";

/**
 * Generate a consistent conversation ID for two users
 * Always returns the same ID regardless of user order
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} Conversation ID
 */
export const getConversationId = (userId1, userId2) => {
  // Sort user IDs alphabetically to ensure consistency
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

/**
 * Get or create a conversation between two users
 * @param {string} currentUserId - Current user ID
 * @param {string} otherUserId - Other user ID
 * @param {string} currentUsername - Current user username
 * @param {string} otherUsername - Other user username
 * @returns {Promise<Object>} Conversation object
 */
export const getOrCreateConversation = async (
  currentUserId,
  otherUserId,
  currentUsername,
  otherUsername
) => {
  try {
    const conversationId = getConversationId(currentUserId, otherUserId);
    const conversationRef = doc(db, "conversations", conversationId);

    // Check if conversation exists
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      // Conversation exists, return it
      return {
        conversationId: conversationDoc.id,
        ...conversationDoc.data(),
      };
    }

    // Conversation doesn't exist, create it
    const newConversation = {
      conversationId,
      participants: [currentUserId, otherUserId],
      participantUsernames: [currentUsername, otherUsername],
      isGroup: false,
      groupName: null,
      groupImageURL: null,
      lastMessage: "",
      lastMessageSenderId: "",
      lastMessageTimestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      lastEdit: serverTimestamp(),
    };

    await setDoc(conversationRef, newConversation);

    return {
      conversationId,
      ...newConversation,
    };
  } catch (error) {
    console.error("Error getting or creating conversation:", error);
    throw error;
  }
};

/**
 * Update conversation's last message info
 * @param {string} conversationId - Conversation ID
 * @param {string} lastMessage - Last message text
 * @param {string} senderId - Sender user ID
 * @returns {Promise<void>}
 */
export const updateConversationLastMessage = async (
  conversationId,
  lastMessage,
  senderId
) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);

    await setDoc(
      conversationRef,
      {
        lastMessage,
        lastMessageSenderId: senderId,
        lastMessageTimestamp: serverTimestamp(),
        lastEdit: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating conversation last message:", error);
  }
};

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender user ID
 * @param {string} senderUsername - Sender username
 * @param {string} text - Message text
 * @returns {Promise<Object>} Created message object
 */
export const sendMessage = async (
  conversationId,
  senderId,
  senderUsername,
  text
) => {
  try {
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );

    const messageData = {
      senderId,
      senderUsername,
      text,
      timestamp: serverTimestamp(),
      status: "sent",
      imageURL: null,
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update conversation's last message
    await updateConversationLastMessage(conversationId, text, senderId);

    // Send push notification (don't await - fire and forget)
    sendPushNotification(
      conversationId,
      docRef.id,
      senderId,
      senderUsername,
      text
    ).catch((err) => console.error("Push notification failed:", err));

    return {
      messageId: docRef.id,
      ...messageData,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of conversation objects
 */
export const getUserConversations = async (userId) => {
  try {
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", userId)
    );

    const querySnapshot = await getDocs(q);

    const conversations = querySnapshot.docs.map((doc) => ({
      conversationId: doc.id,
      ...doc.data(),
    }));

    return conversations;
  } catch (error) {
    console.error("Error getting user conversations:", error);
    throw error;
  }
};

/**
 * Delete a conversation and all its messages
 * @param {string} conversationId - Conversation ID to delete
 * @returns {Promise<void>}
 */
export const deleteConversation = async (conversationId) => {
  try {
    // First, delete all messages in the conversation subcollection
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );
    const messagesSnapshot = await getDocs(messagesRef);

    // Delete all messages in batches
    const deletePromises = messagesSnapshot.docs.map((messageDoc) =>
      deleteDoc(messageDoc.ref)
    );
    await Promise.all(deletePromises);

    // Then delete the conversation document itself
    const conversationRef = doc(db, "conversations", conversationId);
    await deleteDoc(conversationRef);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

/**
 * Listen to all conversations for a user in real-time
 * Updates the firebaseStore with conversation data
 * @param {string} userId - User ID to listen for
 * @returns {Function} Unsubscribe function
 */
export const listenToConversations = (userId) => {
  if (!userId) {
    console.error("Cannot listen to conversations: No user ID provided");
    return () => {}; // Return empty unsubscribe function
  }

  const conversationsRef = collection(db, "conversations");
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      // Store full conversation data in global store
      const conversationsData = snapshot.docs.map((doc) => ({
        conversationId: doc.id,
        ...doc.data(),
      }));

      // Update the firebase store
      useFirebaseStore.getState().setConversations(conversationsData);
    },
    (error) => {
      console.error("Error listening to conversations:", error);
    }
  );

  return unsubscribe;
};

/**
 * Upload group photo to Firebase Storage
 * @param {string} conversationId - Conversation ID for the group
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadGroupPhoto = async (conversationId, imageUri) => {
  try {
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create reference to Firebase Storage in conversation-files path
    // Path: conversation-files/{conversationId}/group-photo.jpg
    const storageRef = ref(
      storage,
      `conversation-files/${conversationId}/group-photo.jpg`
    );

    // Upload image
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading group photo:", error);
    throw error;
  }
};

/**
 * Update group conversation information
 * @param {string} conversationId - Conversation ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.groupName] - New group name
 * @param {string} [updates.imageUri] - Local image URI to upload
 * @param {string} [updates.groupImageURL] - Direct group image URL
 * @returns {Promise<void>}
 */
export const updateGroupConversation = async (conversationId, updates) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);

    // If updating image via local URI, upload it first
    if (updates.imageUri) {
      const groupImageURL = await uploadGroupPhoto(
        conversationId,
        updates.imageUri
      );
      updates.groupImageURL = groupImageURL;
      delete updates.imageUri; // Remove local URI from updates
    }

    // Add lastEdit timestamp
    updates.lastEdit = serverTimestamp();

    // Update the conversation document
    await updateDoc(conversationRef, updates);
  } catch (error) {
    console.error("Error updating group conversation:", error);
    throw error;
  }
};

/**
 * Create a group conversation
 * @param {string} groupName - Group name
 * @param {Array<string>} participantIds - Array of participant user IDs (excluding current user)
 * @param {string|null} groupImageURL - Optional group image URL
 * @returns {Promise<string>} Created conversation ID
 */
export const createGroupConversation = async (
  groupName,
  participantIds,
  groupImageURL = null
) => {
  try {
    // Get current user from Firebase store
    const currentUser = useFirebaseStore.getState().currentUser;
    if (!currentUser) {
      throw new Error("No current user found");
    }

    // Get users map to fetch usernames
    const usersMap = useFirebaseStore.getState().usersMap;

    // Add current user to participants
    const allParticipantIds = [currentUser.uid, ...participantIds];

    // Get usernames for all participants
    const participantUsernames = allParticipantIds.map((userId) => {
      if (userId === currentUser.uid) {
        return currentUser.username;
      }
      const user = usersMap[userId];
      return user ? user.username : "Unknown";
    });

    // Create new conversation document in Firestore
    const conversationsRef = collection(db, "conversations");
    const newConversation = {
      participants: allParticipantIds,
      participantUsernames,
      isGroup: true,
      groupName,
      groupImageURL: groupImageURL || null,
      lastMessage: "",
      lastMessageSenderId: "",
      lastMessageTimestamp: null,
      createdAt: serverTimestamp(),
      lastEdit: serverTimestamp(),
    };

    const docRef = await addDoc(conversationsRef, newConversation);

    // Return the created conversation ID
    return docRef.id;
  } catch (error) {
    console.error("Error creating group conversation:", error);
    throw error;
  }
};

/**
 * Leave a group conversation (remove current user from participants)
 * @param {string} conversationId - Conversation ID to leave
 * @param {string} userId - User ID leaving the group
 * @returns {Promise<void>}
 */
export const leaveGroupConversation = async (conversationId, userId) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);

    // Remove user from participants array
    await updateDoc(conversationRef, {
      participants: arrayRemove(userId),
      lastEdit: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error leaving group conversation:", error);
    throw error;
  }
};
