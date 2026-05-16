import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Add a reaction to a message.
 * Uses Timestamp.now() because arrayUnion() cannot contain serverTimestamp().
 * Ignores the add if this user has already reacted with the same emoji (one reaction per user per emoji).
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message document ID
 * @param {string} userId - User ID who is reacting
 * @param {string} emoji - Emoji character (e.g. "👍", "❤️")
 * @returns {Promise<void>}
 */
export async function addReaction(conversationId, messageId, userId, emoji) {
  const messageRef = doc(
    db,
    "conversations",
    conversationId,
    "messages",
    messageId
  );

  const snapshot = await getDoc(messageRef);
  if (snapshot.exists()) {
    const reactions = snapshot.data().reactions || [];
    const alreadyReacted = reactions.some(
      (reaction) => reaction.userId === userId && reaction.emoji === emoji
    );
    if (alreadyReacted) return;
  }

  await updateDoc(messageRef, {
    reactions: arrayUnion({
      userId,
      emoji,
      timestamp: Timestamp.now(),
    }),
  });
}

/**
 * Remove a reaction from a message.
 * Firestore arrayRemove requires the exact object; we read the doc to get the matching reaction.
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message document ID
 * @param {string} userId - User ID who added the reaction
 * @param {string} emoji - Emoji to remove
 * @returns {Promise<void>}
 */
export async function removeReaction(
  conversationId,
  messageId,
  userId,
  emoji
) {
  const messageRef = doc(
    db,
    "conversations",
    conversationId,
    "messages",
    messageId
  );

  const snapshot = await getDoc(messageRef);
  if (!snapshot.exists()) return;

  const data = snapshot.data();
  const reactions = data.reactions || [];
  const toRemove = reactions.find(
    (reaction) => reaction.userId === userId && reaction.emoji === emoji
  );
  if (!toRemove) return;

  await updateDoc(messageRef, {
    reactions: arrayRemove(toRemove),
  });
}

/**
 * Subscribe to reactions (and full message) for a single message. Useful when you need
 * live reaction updates without re-subscribing to the whole conversation.
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message document ID
 * @param {(reactions: Array<{ userId: string, emoji: string, timestamp: import('firebase/firestore').Timestamp | null }>) => void} onReactionsUpdate - Callback with current reactions array
 * @returns {() => void} Unsubscribe function
 */
export function listenToReactions(conversationId, messageId, onReactionsUpdate) {
  const messageRef = doc(
    db,
    "conversations",
    conversationId,
    "messages",
    messageId
  );

  const unsubscribe = onSnapshot(
    messageRef,
    (snapshot) => {
      const data = snapshot.data();
      const reactions = data?.reactions ?? [];
      onReactionsUpdate(reactions);
    },
    (error) => {
      console.error("Error listening to reactions:", error);
      onReactionsUpdate([]);
    }
  );

  return unsubscribe;
}
