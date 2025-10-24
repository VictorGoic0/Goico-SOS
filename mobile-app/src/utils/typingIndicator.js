import {
  ref,
  set,
  remove,
  onChildAdded,
  onChildRemoved,
} from "firebase/database";
import { realtimeDb } from "../config/firebase";

/**
 * Set user as typing in a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} userId - The user ID
 */
export const setTypingIndicator = (conversationId, userId) => {
  const typingRef = ref(realtimeDb, `typing/${conversationId}/${userId}`);
  set(typingRef, true);
};

/**
 * Remove user from typing in a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} userId - The user ID
 */
export const removeTypingIndicator = (conversationId, userId) => {
  const typingRef = ref(realtimeDb, `typing/${conversationId}/${userId}`);
  remove(typingRef);
};

/**
 * Listen to typing users in a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} currentUserId - Current user's ID (to filter out)
 * @param {function} callback - Callback function that receives array of typing user IDs
 * @returns {function} Cleanup function to unsubscribe
 */
export const listenToTypingIndicator = (
  conversationId,
  currentUserId,
  callback
) => {
  const typingRef = ref(realtimeDb, `typing/${conversationId}`);
  const typingUsers = new Set();

  const onAdd = onChildAdded(typingRef, (snapshot) => {
    const userId = snapshot.key;
    if (userId !== currentUserId) {
      typingUsers.add(userId);
      callback(Array.from(typingUsers));
    }
  });

  const onRemove = onChildRemoved(typingRef, (snapshot) => {
    const userId = snapshot.key;
    typingUsers.delete(userId);
    callback(Array.from(typingUsers));
  });

  // Return cleanup function
  return () => {
    onAdd();
    onRemove();
  };
};
