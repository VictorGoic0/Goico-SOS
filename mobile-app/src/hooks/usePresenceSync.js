import { useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "../config/firebase";
import useFirebaseStore from "../stores/firebaseStore";
import usePresenceStore from "../stores/presenceStore";

/**
 * Hook to sync user presence from Realtime Database to Presence Store.
 * Listens to all presence data and writes to store.
 *
 * Users are filtered out if:
 * 1. Browser closes/disconnects (marked as offline by onDisconnect)
 * 2. Inactive for 60+ seconds (lastSeen timestamp check)
 *
 * This hook sets up the Realtime Database listener and writes to Presence Store.
 * Components should read presence data from usePresenceStore.
 */
export function usePresenceSync() {
  const currentUser = useFirebaseStore((state) => state.currentUser);

  // Consider users online if lastSeen is within the last 60 seconds
  // (2x the update interval of 30s to account for network delays)
  const ONLINE_THRESHOLD_MS = 60000;

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Reference to presence collection
    const presenceRef = ref(realtimeDb, "presence");

    // Listen to presence updates
    const unsubscribe = onValue(
      presenceRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const now = Date.now();
        const filteredPresence = {};

        Object.keys(data).forEach((userId) => {
          const userData = data[userId];

          // Skip if no data
          if (!userData) {
            return;
          }

          // If marked as offline, keep the data but mark as offline
          if (!userData.isOnline) {
            filteredPresence[userId] = userData;
            return;
          }

          // Check if lastSeen is recent (within threshold)
          // lastSeen is a timestamp in milliseconds
          const lastSeenTime = userData.lastSeen || 0;
          const isRecent = now - lastSeenTime < ONLINE_THRESHOLD_MS;

          if (isRecent) {
            // User is online and recently active
            filteredPresence[userId] = {
              ...userData,
              isOnline: true,
            };
          } else {
            // User's heartbeat is stale - mark as offline
            filteredPresence[userId] = {
              ...userData,
              isOnline: false,
            };
          }
        });

        // Write to Presence Store
        usePresenceStore.getState().setAllPresence(filteredPresence);
      },
      (error) => {
        console.error("Error syncing presence:", error);
      }
    );

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);
}

export default usePresenceSync;
