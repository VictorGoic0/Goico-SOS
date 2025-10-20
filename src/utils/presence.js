import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";
import { realtimeDb } from "../config/firebase";
import usePresenceStore from "../stores/presenceStore";

/**
 * Initialize presence for the current user in Realtime Database
 * Sets user as online and configures auto-disconnect to set offline
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const initializePresence = async (userId) => {
  if (!userId) {
    console.error("Cannot initialize presence: No user ID provided");
    return;
  }

  try {
    const userPresenceRef = ref(realtimeDb, `presence/${userId}`);

    // Set user as online
    await set(userPresenceRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });

    // Configure auto-disconnect to set offline when connection is lost
    const disconnectRef = onDisconnect(userPresenceRef);
    await disconnectRef.set({
      isOnline: false,
      lastSeen: serverTimestamp(),
    });

    console.log("✅ Presence initialized for user:", userId);
  } catch (error) {
    console.error("Error initializing presence:", error);
  }
};

/**
 * Update presence status for the current user
 * @param {string} userId - User ID
 * @param {boolean} isOnline - Online status
 * @returns {Promise<void>}
 */
export const updatePresence = async (userId, isOnline) => {
  if (!userId) {
    console.error("Cannot update presence: No user ID provided");
    return;
  }

  try {
    const userPresenceRef = ref(realtimeDb, `presence/${userId}`);

    await set(userPresenceRef, {
      isOnline,
      lastSeen: serverTimestamp(),
    });

    console.log(
      `✅ Presence updated for ${userId}: ${isOnline ? "online" : "offline"}`
    );
  } catch (error) {
    console.error("Error updating presence:", error);
  }
};

/**
 * Listen to all presence data changes in Realtime Database
 * Updates the presenceStore with real-time data
 * @returns {Function} Unsubscribe function
 */
export const listenToPresence = () => {
  const presenceRef = ref(realtimeDb, "presence");

  const unsubscribe = onValue(
    presenceRef,
    (snapshot) => {
      const presenceData = snapshot.val() || {};

      // Update the presence store
      usePresenceStore.getState().setAllPresence(presenceData);

      console.log(
        "✅ Presence data updated:",
        Object.keys(presenceData).length,
        "users"
      );
    },
    (error) => {
      console.error("Error listening to presence:", error);
    }
  );

  return unsubscribe;
};

/**
 * Set user as offline (for manual logout)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const setUserOffline = async (userId) => {
  if (!userId) {
    return;
  }

  try {
    const userPresenceRef = ref(realtimeDb, `presence/${userId}`);

    await set(userPresenceRef, {
      isOnline: false,
      lastSeen: serverTimestamp(),
    });

    console.log("✅ User set to offline:", userId);
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};
