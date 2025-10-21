import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

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
